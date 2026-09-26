# Companion conversation verification — September 26, 2026

Each of the six companions has 100 literal, individually authored thoughts in English and neutral Spanish. They remain prewritten local game content, not an online chat service. Selection continues indefinitely, excluding that companion's previous five thoughts. A new thought appears after 45–90 seconds of eligible workshop time; other screens, dialogs, hidden documents and missing companions do not speak.

Luigi's copy follows the later firm-but-tender direction, with playful persistence rather than aggression. The collection descriptor and Spanish translation use the same tone.

## Evidence

- Full Vitest suite: 141 tests passed in 21 files.
- Focused companion tests: 7 passed, including 130 emissions and pause/resume behavior.
- Independent content/runtime review approved: 600 distinct English strings, 600 distinct Spanish strings, maximum 80 characters; sampled beginning/middle/end of every companion.
- Browser regression set: 18 desktop/mobile cases passed for tablet transitions, unread patches, privacy and chat. Final focused chat regression: 2 passed, including 320×568, 320×480 reduced-height WebView and 844×390 landscape.
- A full-length localized stress message first exposed an 18.75px button overlap and a short-portrait overflow. Nonshrinking chat space, compact scene sizing and short-screen copy suppression fixed them. Higher-specificity selectors preserve these rules after tablet CSS loads. Screenshots were inspected; messages no longer cover the team shortcut.
- Production web build and Capacitor sync passed. Final debug APK assembled after the last CSS change. Native debug/test APK compilation and lint passed; final-source R8 and native unit verification are recorded separately in `verification-ads.md`.
- Existing Three.js chunk-size and Gradle deprecation warnings remain; neither failed the builds.

The debug APK is a development artifact, not a new signed Play release. No physical Android ad/consent test or remote publication occurred. Rollback scope is the chat module/data/styles, main-loop hooks, companion copy and their tests; advertising and save-version changes are independent commits.
