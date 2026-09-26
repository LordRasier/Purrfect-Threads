package com.rasie.purrfectthreads;

import java.net.URL;
import java.nio.charset.StandardCharsets;
import javax.net.ssl.HttpsURLConnection;
import org.json.JSONObject;

/** Native-only fixed destination. Never accepts bridge URLs or forwards redirects/errors. */
final class BillingBackend {
    static final String PRODUCT = "meowtastic_crew_12h";
    static final String PACKAGE = "com.rasie.purrfectthreads";
    enum Route { prepare, verify, entitlement }
    static final class Failure extends Exception {
        final boolean authoritative;
        Failure(boolean authoritative) { this.authoritative = authoritative; }
    }
    JSONObject request(Route route, IdentityCoordinator.Tokens tokens, String purchaseToken) throws Exception {
        HttpsURLConnection connection = (HttpsURLConnection) new URL(
            "https://www.auraliax.com/v1/purrfect/billing/" + route.name()).openConnection();
        try {
            connection.setInstanceFollowRedirects(false);
            connection.setConnectTimeout(10000); connection.setReadTimeout(10000);
            connection.setUseCaches(false);
            connection.setRequestProperty("Authorization", "Bearer " + tokens.idToken);
            connection.setRequestProperty("X-Firebase-AppCheck", tokens.appCheckToken);
            connection.setRequestProperty("Accept", "application/json");
            if (route != Route.entitlement) {
                connection.setRequestMethod("POST"); connection.setDoOutput(true);
                connection.setRequestProperty("Content-Type", "application/json");
                JSONObject body = new JSONObject();
                if (route == Route.verify) {
                    if (purchaseToken == null || purchaseToken.isEmpty() || purchaseToken.length() > 4096) throw new Failure(true);
                    body.put("packageName", PACKAGE).put("productId", PRODUCT).put("purchaseToken", purchaseToken);
                }
                byte[] bytes = body.toString().getBytes(StandardCharsets.UTF_8);
                connection.setFixedLengthStreamingMode(bytes.length);
                try (var output = connection.getOutputStream()) { output.write(bytes); }
            }
            int status = connection.getResponseCode();
            if (status != 200) {
                String code = "";
                try (var error = connection.getErrorStream()) {
                    if (error != null) code = new JSONObject(new String(BillingWire.read(error, 16384), StandardCharsets.UTF_8))
                        .optJSONObject("error").optString("code", "");
                } catch (Exception ignored) { /* No error content leaves native code. */ }
                throw new Failure(BillingWire.authoritative(status, code));
            }
            try (var input = connection.getInputStream()) {
                byte[] bytes = BillingWire.read(input, 16384);
                if (bytes.length > 16384) throw new Failure(true);
                return new JSONObject(new String(bytes, StandardCharsets.UTF_8));
            }
        } finally { connection.disconnect(); }
    }
}
