# Android banner ads and consent

The Android app has one native anchored adaptive AdMob banner in a dedicated layout row below the Capacitor WebView. It does not overlay game controls, and it remains in place while the web app changes tabs or enters Olympus. Browser and desktop builds use a strict no-op bridge and make no ads SDK calls.

## Safe default and production switch

- The manifest uses the production AdMob application ID `ca-app-pub-8476869879261023~3961166938` so UMP can resolve the account's privacy message configuration.
- Every build uses Google's Android test banner unit `ca-app-pub-3940256099942544/9214589741` by default.
- The real banner unit `ca-app-pub-8476869879261023/9158576730` is selected only for release builds when Gradle receives the explicit switch `-PpurrfectAdsProduction=true`. Debug builds remain on test inventory even when that property is present.
- `verifyReleaseAdsConfiguration` reports whether a release uses test or production inventory. An invalid switch value fails configuration instead of silently falling back.

Do **not** enable production ads until the AdMob privacy messages, privacy policy, Google Play Data safety form, target-audience declarations, consent testing, and real-device banner placement review are complete.

## Consent and age safeguards

`initializeAds()` performs the following sequence without blocking game startup on network success:

1. Refresh UMP consent information for the current launch.
2. Load and show a required consent form.
3. Initialize Google Mobile Ads only when UMP's `canRequestAds()` is true.
4. Load the banner only after SDK initialization.

Consent refresh is retried only on foreground resume and is bounded to the initial attempt plus two retries. Banner load failures use at most two delayed retries per visible session. Backgrounding cancels scheduled ad work; returning to the foreground can resume it. Network or no-fill errors leave the game usable and the banner row collapsed.

The current audience is declared as 13+, but the app has no verified age-assurance flow. Until that product and legal decision is complete, the integration deliberately uses conservative treatment for every request:

- UMP is tagged as under the age of consent to suppress age-inappropriate consent prompts.
- Google Mobile Ads uses `AgeRestrictedTreatment.CHILD`, matching UMP's blanket under-age-of-consent signal. This is intentionally stricter than the declared 13+ audience until age assurance exists.
- Maximum ad content rating is `PG`.
- Publisher personalization is disabled and publisher first-party ID is disabled.
- The merged Advertising ID permission is explicitly removed.

This is a temporary privacy-biased strategy, not an inference that every user is a minor and not a substitute for legal review. Its tradeoff is lower personalization and potentially lower fill/revenue. Before changing it, define an age-assurance strategy and keep the Google Play target-audience declaration consistent. Do not ask for or persist a date of birth merely to improve ad revenue.

Test inventory and UMP can still use the network and the Google SDK can process data such as IP-derived general location, interactions, diagnostics, and device/account identifiers. The integration does not promise zero collection.

## Web API

`src/platform/ads.ts` exports:

- `initializeAds()` — refresh consent, initialize Android ads when allowed, and request the persistent banner.
- `showBanner()` / `hideBanner()` — control the native banner row.
- `showPrivacyOptions()` — opens UMP's privacy options form from a user action.
- `getAdsStatus()` — reports consent/ad readiness and whether test inventory is active.

The settings UI may keep an Android-only privacy entry visible for discoverability, but it must open UMP only when `privacyOptionsRequired` is true and otherwise explain that no additional options are currently required. Web and desktop must not expose the native action.

## Pinned official dependencies

- Google Mobile Ads SDK (legacy) `25.5.0`, whose minimum Android API is 24: <https://developers.google.com/admob/android/rel-notes>
- User Messaging Platform SDK `4.0.0`: <https://developers.google.com/admob/android/privacy>
- Anchored adaptive banner guidance and official test unit: <https://developers.google.com/admob/android/banner>
- Request targeting and age treatment: <https://developers.google.com/admob/android/targeting>

The app remains on Android Gradle Plugin `8.13.0`; this change does not opt into AGP 9.
