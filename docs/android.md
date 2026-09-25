# Android development build

Prerequisites: Node 22+, JDK 21, Android SDK platform 36 and its build tools.
Set `JAVA_HOME` and `ANDROID_HOME` for your machine; do not commit local SDK paths or signing material.

```powershell
npm ci
npm test
npm run android:sync
./android/gradlew.bat -p android assembleDebug lintDebug
```

Run sync **before**, never concurrently with, Gradle: Capacitor regenerates its Cordova compatibility project and deletes that directory's intermediate files.
The debug artifact is `android/app/build/outputs/apk/debug/app-debug.apk`.

Install only on a designated test device:

```powershell
adb -s DEVICE_SERIAL install -r android/app/build/outputs/apk/debug/app-debug.apk
```

No production keystore is configured. `bundleRelease` must not be treated as a signed, upload-ready release.
See [the Android decision and release gate](decisions/004-offline-android.md).

## Manual acceptance

1. Launch in airplane mode, enter the workshop and earn yarn.
2. Open every tab and Olympus; check portrait, landscape, phone and tablet insets.
3. Select both languages and read the complete policy without network access.
4. Export a save, cancel an export, import the exported save and reject a malformed file.
5. Background/foreground the app; ensure music stops and progress is not duplicated.
6. Force-stop/relaunch and verify progress survives. Update the APK without clearing data.
7. Check system Back and accessibility focus in dialogs.
8. Inspect the merged **release** manifest and packaged dependencies before declaring Data safety.
