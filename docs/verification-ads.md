# Android advertising verification — September 26, 2026

## Verified locally

- Android-only bridge and package safeguard tests: 7 passed.
- Native policy unit tests: 4 passed, no failures/errors.
- Debug and release Java compilation passed.
- Final-source `:app:testDebugUnitTest :app:minifyReleaseWithR8 --max-workers=2`: BUILD SUCCESSFUL in 2m45s, 108 actionable tasks.
- Release mapping, resource/shrinking reports and optimized DEX were generated. AGP remains 8.13.0; the existing Gradle deprecation warning is not a build failure.
- Merged release manifest: INTERNET and expected AdMob app ID present; Advertising ID and AdServices permissions absent. Backups remain disabled.
- Independent review closed after correcting late callbacks, main-thread dispatch, pause/resume, failed-load retries, consent recovery, age flags and adaptive width after rotation.
- Desktop/mobile privacy and interface browser regression set passed (18 tests). Browser advertising bridge is a no-op.

## Release blockers

No Android device or emulator was connected. Real native placement, rotation, offline recovery and Google consent/ad behavior still require device verification. Source review and browser tests do not prove those behaviors.

All builds default to Google's test banner. Do not enable production inventory until the public institutional privacy policy, Google Play ads/Data safety disclosures, free pricing, AdMob account/app readiness and privacy-message configuration are complete. Test ads can still process network data.

This development build retains version code 1 and is not an upload-ready successor to the existing Play artifact. Increment the version code and sign with the existing upload key when preparing that release. Never commit signing passwords or keys.

Rollback boundary: the Android plugin, SDK dependencies/manifest entries, bridge, settings action and privacy drafts form one advertising unit. Keep the documented data practices aligned with whichever build is actually distributed.
