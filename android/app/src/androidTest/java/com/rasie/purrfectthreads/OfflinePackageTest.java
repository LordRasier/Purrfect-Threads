package com.rasie.purrfectthreads;

import static org.junit.Assert.assertEquals;
import android.Manifest;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import org.junit.Test;
import org.junit.runner.RunWith;

/** Requires a real test device or a booted emulator; compilation is not execution. */
@RunWith(AndroidJUnit4.class)
public class OfflinePackageTest {
    @Test
    public void installedAppHasExpectedIdentityNetworkAndPrivacyPermissions() {
        Context app = InstrumentationRegistry.getInstrumentation().getTargetContext();
        assertEquals("com.rasie.purrfectthreads", app.getPackageName());
        assertEquals(PackageManager.PERMISSION_GRANTED, app.checkSelfPermission(Manifest.permission.INTERNET));
        assertEquals(PackageManager.PERMISSION_DENIED, app.checkSelfPermission("com.google.android.gms.permission.AD_ID"));
        assertEquals(PackageManager.PERMISSION_DENIED, app.checkSelfPermission("android.permission.ACCESS_ADSERVICES_AD_ID"));
        assertEquals(PackageManager.PERMISSION_DENIED, app.checkSelfPermission("android.permission.ACCESS_ADSERVICES_ATTRIBUTION"));
        assertEquals(PackageManager.PERMISSION_DENIED, app.checkSelfPermission("android.permission.ACCESS_ADSERVICES_TOPICS"));
        assertEquals(0, app.getApplicationInfo().flags & ApplicationInfo.FLAG_ALLOW_BACKUP);
    }
}
