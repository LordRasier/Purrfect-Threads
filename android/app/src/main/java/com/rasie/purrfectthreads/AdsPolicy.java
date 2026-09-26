package com.rasie.purrfectthreads;

final class AdsPolicy {
    static final String TEST_BANNER_UNIT_ID = "ca-app-pub-3940256099942544/9214589741";
    static final String PRODUCTION_BANNER_UNIT_ID = "ca-app-pub-8476869879261023/9158576730";

    private AdsPolicy() {}

    static String bannerUnitId(boolean productionEnabled) {
        return productionEnabled ? PRODUCTION_BANNER_UNIT_ID : TEST_BANNER_UNIT_ID;
    }

    static boolean isProduction(boolean productionEnabled) {
        return productionEnabled;
    }

    static boolean shouldRetryAdLoad(int retriesAlreadyScheduled, boolean bannerWanted) {
        return bannerWanted && retriesAlreadyScheduled < 2;
    }

    static boolean shouldAttemptConsent(int attemptsAlreadyStarted) {
        return attemptsAlreadyStarted < 3;
    }
}
