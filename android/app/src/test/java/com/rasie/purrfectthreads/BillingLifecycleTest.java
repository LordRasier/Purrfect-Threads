package com.rasie.purrfectthreads;
import org.junit.Test;
import static org.junit.Assert.*;
public class BillingLifecycleTest {
    @Test public void hiddenCompletionCannotConsumeAwayClassificationOrResetCap() {
        BillingLifecycle lifecycle = new BillingLifecycle();
        assertTrue(lifecycle.begin(0).cold);
        lifecycle.pause(1000); lifecycle.pause(2000);
        assertNull(lifecycle.begin(3600000));
        lifecycle.resume();
        BillingLifecycle.Claim claim = lifecycle.begin(36001000);
        assertEquals(1000, claim.backgroundAt);
        BillingLease lease = new BillingLease("u", 0, 43200000, 0, 0, 0, 1);
        double foreground = lease.claim(claim.backgroundAt, false);
        double offline = lease.claim(claim.cutoff, true);
        assertEquals(1, foreground, 0); assertEquals(28800, offline, 0);
        assertEquals(-1, lifecycle.begin(36002000).backgroundAt);
    }
    @Test public void prePauseRequestCutoffNeverIncludesLaterBackgroundTime() {
        BillingLifecycle lifecycle = new BillingLifecycle(); lifecycle.begin(0);
        BillingLifecycle.Claim claim = lifecycle.begin(1000);
        lifecycle.pause(1100);
        assertEquals(1000, claim.cutoff);
        assertNull(lifecycle.begin(60000));
    }
    @Test public void delayedPrePauseSnapshotCannotEraseLaterAwayBoundary() {
        BillingLifecycle lifecycle = new BillingLifecycle(); lifecycle.begin(0);
        lifecycle.pause(200); lifecycle.resume();
        assertEquals(-1, lifecycle.begin(100).backgroundAt);
        assertEquals(200, lifecycle.begin(1000).backgroundAt);
    }    @Test public void cutoffBoundaryTablePreservesClassification() {
        for (long cutoff : new long[]{100, 199, 200, 201, 1000}) {
            BillingLifecycle lifecycle = new BillingLifecycle(); lifecycle.begin(0);
            lifecycle.pause(200);
            assertNull(lifecycle.begin(cutoff));
            lifecycle.resume();
            assertEquals(cutoff <= 200 ? -1 : 200, lifecycle.begin(cutoff).backgroundAt);
            assertEquals(cutoff <= 200 ? 200 : -1, lifecycle.begin(2000).backgroundAt);
        }
    }    @Test public void repeatedUnsettledPausesKeepEarliestAwayBoundary() {
        BillingLifecycle lifecycle = new BillingLifecycle(); lifecycle.begin(0);
        lifecycle.pause(200); lifecycle.resume(); lifecycle.pause(1100); lifecycle.resume();
        assertEquals(200, lifecycle.begin(2000).backgroundAt);
    }}
