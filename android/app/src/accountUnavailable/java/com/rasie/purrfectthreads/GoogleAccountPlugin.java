package com.rasie.purrfectthreads;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Default builds do not compile or initialize any identity SDK. */
@CapacitorPlugin(name = "GoogleAccount")
public final class GoogleAccountPlugin extends Plugin {
    @PluginMethod public void status(PluginCall call) { unavailable(call); }
    @PluginMethod public void connect(PluginCall call) { unavailable(call); }
    @PluginMethod public void disconnect(PluginCall call) { unavailable(call); }
    private void unavailable(PluginCall call) {
        JSObject result = new JSObject();
        result.put("status", "unavailable");
        result.put("outcome", "ok");
        call.resolve(result);
    }
}
