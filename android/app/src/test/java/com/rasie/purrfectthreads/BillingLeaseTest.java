package com.rasie.purrfectthreads;

import org.junit.Test;
import static org.junit.Assert.*;

public class BillingLeaseTest {
    @Test public void preservesFixedWindowAcrossSameBootProcessRecovery() {
        BillingLease lease = new BillingLease("user", 1000, 43201000, 2000, 100, 10000, 3);
        assertTrue(lease.valid("user", 100 + 3600000, 10000 + 3600000, 3));
        assertEquals(9000, lease.confirmedWall());
        assertEquals(43209000, lease.expiresWall());
    }
    @Test public void rejectsIdentityRebootClockAnomaliesAndStaleCache() {
        BillingLease lease = new BillingLease("user", 1000, 43201000, 2000, 100, 10000, 3);
        assertFalse(lease.valid("other", 100, 10000, 3));
        assertFalse(lease.valid("user", 100, 10000, 4));
        assertFalse(lease.valid("user", 99, 10000, 3));
        assertFalse(lease.valid("user", 200, 30000, 3));
        assertFalse(lease.valid("user", 100 + 43200001, 10000 + 43200001, 3));
    }
    @Test public void rejectsMalformedAndFutureServerWindows() {
        assertFalse(new BillingLease("u", 1000, 9999, 2000, 0, 0, 1).valid("u", 0, 0, 1));
        assertFalse(new BillingLease("u", 1000, 43201000, 999, 0, 0, 1).valid("u", 0, 0, 1));
        assertFalse(new BillingLease("u", 1000, 43201000, 2000, 0, 0, -1).valid("u", 0, 0, -1));
    }
    @Test public void expiredGrantStillSuppliesHistoricalOverlapWithoutRenewal() {
        BillingLease lease = new BillingLease("u", 1000, 43201000, 43200000, 100, 10000, 3);
        assertTrue(lease.valid("u", 3600100, 3610000, 3));
        assertEquals(11000, lease.expiresWall());
    }
    @Test public void settlementIsOnceOnlyAndOfflineCapUsesFirstEightHours() {
        BillingLease lease = new BillingLease("u", 1000, 43201000, 1000, 100, 10000, 3);
        assertEquals(28800, lease.claim(36000100, true), 0);
        assertEquals(0, lease.claim(36000100, true), 0);
        assertEquals(10, lease.claim(36010100, false), 0);
    }
    @Test public void settlementCannotPassOriginalExpiry() {
        BillingLease lease = new BillingLease("u", 1000, 43201000, 43200000, 100, 10000, 3);
        assertEquals(1, lease.claim(10000, false), 0);
        assertEquals(0, lease.claim(20000, false), 0);
    }}
