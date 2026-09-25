# Offline Android shell

## Status
Implemented for local testing; not approved for store publication.

## Decision
Use Capacitor 8.5.2 with the existing Vite/Three.js game bundled in `dist`.
This avoids rewriting the game and does not depend on a hosted page or live-update service.
A native rewrite would allow tighter platform integration but duplicate the current rendering and game UI.

The application ID is `com.rasie.purrfectthreads`, confirmed by the owner on 2026-09-25 to match the existing Play Console entry. It replaces the provisional ID before the first Play upload and must remain stable afterward. Any previously installed debug build with the provisional ID is a separate application; local progress does not migrate automatically (use save export/import).

- Android API 24 minimum, API 36 target/compile, Java 21.
- Use Capacitor SystemBars native inset handling with `viewport-fit=contain`, keeping game controls out of status/navigation bars rather than drawing the tablet under them.
- No Internet or sensitive runtime permissions requested by the app manifest.
- No advertising, analytics, crash reporting, billing or Google Services integration.
- Disable Android backup and exclude all private storage domains from cloud backup and device transfer.
- Keep the existing local primary/recovery saves. Exported documents remain user-controlled and survive uninstall.
- Export JSON using Android's document picker, not WebView blob downloads. Import uses the existing file picker and strict game decoder.
- Bundle English/Spanish privacy text for offline access in Settings. Synchronize these snapshots with the institutional policy when data practices change.
- The 90-day support email retention is a publisher obligation, not an automated feature of this app.

## Sources
- https://capacitorjs.com/docs/getting-started
- https://capacitorjs.com/docs/updating/8-0
- https://capacitorjs.com/docs/android/custom-code
- https://capacitorjs.com/docs/plugins/android
- https://developer.android.com/training/data-storage/shared/documents-files
- https://developer.android.com/identity/data/autobackup
- https://support.google.com/googleplay/android-developer/answer/10144311

## Release boundary
Compilation and browser tests are not Play approval. Before release, verify installation, restart persistence, import/export, suspension, audio, back navigation and edge-to-edge layouts on Android devices. Confirm package ID, signing custody, public privacy URL, Data safety declarations and audience/content rating. Do not upload the debug APK or publish the policy as final solely because tests pass.

## Dependency review
`npm audit` reports three moderate development-only findings along `@capacitor/cli -> xcode -> uuid` in 8.5.2. This is iOS project tooling, not bundled game code or an Android SDK. No forced downgrade or major override was applied. Track the upstream fix; production dependencies must remain audited separately.
