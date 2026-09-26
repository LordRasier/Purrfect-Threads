package com.rasie.purrfectthreads;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
@CapacitorPlugin(name = "CrewBilling")
public final class CrewBillingPlugin extends Plugin {
    @PluginMethod public void status(PluginCall call) { unavailable(call); }
    @PluginMethod public void refresh(PluginCall call) { unavailable(call); }
    @PluginMethod public void purchase(PluginCall call) { unavailable(call); }
    @PluginMethod public void restore(PluginCall call) { unavailable(call); }
    private void unavailable(PluginCall call) { call.resolve(new JSObject().put("status", "unavailable")); }
}
