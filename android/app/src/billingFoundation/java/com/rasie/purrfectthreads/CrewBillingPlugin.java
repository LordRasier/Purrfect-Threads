package com.rasie.purrfectthreads;
import android.os.Handler;
import android.os.Looper;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "CrewBilling")
public final class CrewBillingPlugin extends Plugin {
    private final Handler main = new Handler(Looper.getMainLooper());
    private BillingRuntime runtime;
    private boolean destroyed;
    private BillingRuntime runtime() {
        if (runtime == null) runtime = new BillingRuntime(getContext());
        return runtime;
    }
    @PluginMethod public void status(PluginCall call) { main.post(() -> { if (!destroyed) runtime().status(call::resolve); }); }
    @PluginMethod public void refresh(PluginCall call) { main.post(() -> { if (!destroyed) runtime().refresh(false, getActivity(), call::resolve); }); }
    @PluginMethod public void purchase(PluginCall call) { main.post(() -> { if (!destroyed) runtime().refresh(true, getActivity(), call::resolve); }); }
    @PluginMethod public void restore(PluginCall call) { main.post(() -> { if (!destroyed) runtime().refresh(false, getActivity(), call::resolve); }); }
    @Override protected void handleOnResume() { if (runtime != null) runtime.resume(); super.handleOnResume(); }
    @Override protected void handleOnPause() { if (runtime != null) runtime.pause(); super.handleOnPause(); }
    @Override protected void handleOnDestroy() { destroyed = true; if (runtime != null) runtime.close(); super.handleOnDestroy(); }
}
