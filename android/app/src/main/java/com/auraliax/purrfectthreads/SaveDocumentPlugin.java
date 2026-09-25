package com.auraliax.purrfectthreads;

import android.app.Activity;
import android.content.Intent;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/** User-selected exports only; no broad storage permissions or retained URI grants. */
@CapacitorPlugin(name = "SaveDocument")
public class SaveDocumentPlugin extends Plugin {
    private volatile boolean pending;

    @PluginMethod
    public void save(PluginCall call) {
        String data = call.getString("data");
        String name = call.getString("name");
        if (data == null || data.length() > 300000 ||
            !("purrfect-threads-save.json".equals(name) || "purrfect-threads-recovery.json".equals(name))) {
            call.reject("Invalid export.");
            return;
        }
        if (pending) { call.reject("An export is already open."); return; }
        pending = true;
        // https://developer.android.com/training/data-storage/shared/documents-files#create-file
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/json");
        intent.putExtra(Intent.EXTRA_TITLE, name);
        try { startActivityForResult(call, intent, "documentCreated"); }
        catch (RuntimeException error) { pending = false; call.reject("Unable to open document picker.", error); }
    }

    @ActivityCallback
    private void documentCreated(PluginCall call, ActivityResult result) {
        pending = false;
        if (call == null) return;
        if (result.getResultCode() != Activity.RESULT_OK) {
            call.resolve(new JSObject().put("saved", false));
            return;
        }
        Intent resultData = result.getData();
        if (resultData == null || resultData.getData() == null) { call.reject("No document selected."); return; }
        String data = call.getString("data");
        if (data == null) { call.reject("Export data unavailable. Please try again."); return; }
        execute(() -> {
            try (OutputStream stream = getContext().getContentResolver().openOutputStream(resultData.getData(), "wt")) {
                if (stream == null) { call.reject("Unable to write document."); return; }
                stream.write(data.getBytes(StandardCharsets.UTF_8));
            } catch (Exception error) { call.reject("Unable to save document.", error); return; }
            call.resolve(new JSObject().put("saved", true));
        });
    }
}
