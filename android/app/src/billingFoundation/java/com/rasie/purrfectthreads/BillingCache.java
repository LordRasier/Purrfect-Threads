package com.rasie.purrfectthreads;

import android.content.Context;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.AtomicFile;
import java.io.File;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import java.util.Arrays;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import org.json.JSONObject;

/** All calls run on the billing serial worker, never the main thread. */
final class BillingCache {
    private static final String ALIAS = "purrfect-verified-crew-v1";
    private static final byte[] AAD = "com.rasie.purrfectthreads/crew-cache/v1".getBytes(StandardCharsets.UTF_8);
    private final AtomicFile file;
    BillingCache(Context context) { file = new AtomicFile(new File(context.getNoBackupFilesDir(), "crew-entitlement-v1")); }
    void clear() { file.delete(); }
    private SecretKey key() throws Exception {
        KeyStore store = KeyStore.getInstance("AndroidKeyStore"); store.load(null);
        if (store.containsAlias(ALIAS)) return (SecretKey) store.getKey(ALIAS, null);
        KeyGenerator generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
        generator.init(new KeyGenParameterSpec.Builder(ALIAS, KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setKeySize(256).build());
        return generator.generateKey();
    }
    BillingLease read() {
        try {
            byte[] bytes;
            try (var input = file.openRead()) { bytes = BillingWire.read(input, 4096); }
            if (bytes.length < 29 || bytes.length > 4096) throw new IllegalStateException();
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, key(), new GCMParameterSpec(128, Arrays.copyOf(bytes, 12)));
            cipher.updateAAD(AAD);
            JSONObject json = new JSONObject(new String(cipher.doFinal(bytes, 12, bytes.length - 12), StandardCharsets.UTF_8));
            BillingLease lease = new BillingLease(json.getString("owner"), json.getLong("confirmed"), json.getLong("expires"),
                json.getLong("server"), json.getLong("elapsed"), json.getLong("wall"), json.getInt("boot"));
            lease.settled = json.getLong("settled");
            return lease;
        } catch (Exception invalid) { clear(); return null; }
    }
    void write(BillingLease lease) throws Exception {
        JSONObject json = new JSONObject().put("owner", lease.owner).put("confirmed", lease.confirmed)
            .put("expires", lease.expires).put("server", lease.server).put("elapsed", lease.elapsed)
            .put("wall", lease.wall).put("boot", lease.boot).put("settled", lease.settled);
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding"); cipher.init(Cipher.ENCRYPT_MODE, key()); cipher.updateAAD(AAD);
        byte[] encrypted = cipher.doFinal(json.toString().getBytes(StandardCharsets.UTF_8));
        var output = file.startWrite();
        try { output.write(cipher.getIV()); output.write(encrypted); file.finishWrite(output); }
        catch (Exception failure) { file.failWrite(output); throw failure; }
    }
}
