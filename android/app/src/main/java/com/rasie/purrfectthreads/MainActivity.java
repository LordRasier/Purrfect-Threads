package com.rasie.purrfectthreads;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(SaveDocumentPlugin.class);
        registerPlugin(GoogleAccountPlugin.class);
        registerPlugin(AdMobBannerPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
