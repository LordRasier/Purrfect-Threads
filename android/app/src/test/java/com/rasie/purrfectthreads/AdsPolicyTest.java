package com.rasie.purrfectthreads;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import org.junit.Test;

public class AdsPolicyTest {
    @Test
    public void defaultsToGoogleTestBanner() {
        assertEquals("ca-app-pub-3940256099942544/9214589741", AdsPolicy.bannerUnitId(false));
        assertFalse(AdsPolicy.isProduction(false));
    }

    @Test
    public void exposesProductionBannerOnlyAfterExplicitBuildOptIn() {
        assertEquals("ca-app-pub-8476869879261023/9158576730", AdsPolicy.bannerUnitId(true));
    }

    @Test
    public void retriesFailedLoadsOnlyTwiceWhileBannerIsWanted() {
        assertTrue(AdsPolicy.shouldRetryAdLoad(0, true));
        assertTrue(AdsPolicy.shouldRetryAdLoad(1, true));
        assertFalse(AdsPolicy.shouldRetryAdLoad(2, true));
        assertFalse(AdsPolicy.shouldRetryAdLoad(0, false));
    }

    @Test
    public void boundsConsentRefreshToInitialAttemptAndTwoResumeRetries() {
        assertTrue(AdsPolicy.shouldAttemptConsent(0));
        assertTrue(AdsPolicy.shouldAttemptConsent(2));
        assertFalse(AdsPolicy.shouldAttemptConsent(3));
    }
}
