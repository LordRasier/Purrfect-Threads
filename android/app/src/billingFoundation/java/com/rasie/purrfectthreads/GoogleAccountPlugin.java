package com.rasie.purrfectthreads;

import android.os.Handler;
import android.os.Looper;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Explicit account actions only. See https://capacitorjs.com/docs/plugins/android. */
@CapacitorPlugin(name = "GoogleAccount")
public final class GoogleAccountPlugin extends Plugin {
    private final Handler main = new Handler(Looper.getMainLooper());
    private FirebaseIdentityFoundation identity;
    private PluginCall pending;
    private boolean destroyed;

    @PluginMethod
    public void status(PluginCall call) {
        main.post(() -> {
            if (destroyed) { reply(call, "unavailable", "cancelled"); return; }
            // Construction/status are inert: Firebase is initialized only by explicit action.
            if (identity == null) identity = FirebaseIdentityFoundation.get(getContext());
            reply(call, currentStatus(), "ok");
        });
    }

    @PluginMethod
    public void connect(PluginCall call) { main.post(() -> mutate(call, true)); }

    @PluginMethod
    public void disconnect(PluginCall call) { main.post(() -> mutate(call, false)); }

    private void mutate(PluginCall call, boolean connect) {
        if (destroyed) { reply(call, "unavailable", "cancelled"); return; }
        if (identity == null) identity = FirebaseIdentityFoundation.get(getContext());
        if (pending != null || identity.status() == IdentityCoordinator.Status.BUSY) {
            reply(call, "busy", "busy"); return;
        }
        pending = call;
        IdentityCoordinator.Completion<Void> completed = (ignored, failure) -> {
            PluginCall waiting = pending;
            pending = null;
            if (waiting == null) return;
            String outcome = failure == null ? "ok"
                : failure == IdentityCoordinator.Failure.CANCELLED ? "cancelled"
                : failure == IdentityCoordinator.Failure.CREDENTIAL_CLEAR_FAILED ? "clear-failed"
                : failure == IdentityCoordinator.Failure.BUSY ? "busy" : "failed";
            reply(waiting, destroyed ? "unavailable" : currentStatus(), outcome);
        };
        if (connect) identity.signInFromUserAction(getActivity(), completed);
        else identity.signOut(completed);
    }

    private String currentStatus() {
        return switch (identity.status()) {
            case SIGNED_IN -> "signed-in";
            case BUSY -> "busy";
            default -> "signed-out";
        };
    }

    private void reply(PluginCall call, String status, String outcome) {
        JSObject result = new JSObject();
        result.put("status", status);
        result.put("outcome", outcome);
        call.resolve(result);
    }

    @Override
    protected void handleOnDestroy() {
        // Capacitor dispatches lifecycle hooks on the main thread. Cancel the owner,
        // not the serialization lock: a Firebase exchange may still be settling.
        destroyed = true;
        if (pending != null && identity != null) identity.cancelPending();
        super.handleOnDestroy();
    }
}
