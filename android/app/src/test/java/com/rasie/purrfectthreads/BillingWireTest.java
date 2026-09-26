package com.rasie.purrfectthreads;
import java.io.ByteArrayInputStream;
import org.junit.Test;
import static org.junit.Assert.*;
public class BillingWireTest {
    @Test public void readsBoundedResponsesWithoutApi33Methods() throws Exception {
        assertArrayEquals(new byte[]{1,2}, BillingWire.read(new ByteArrayInputStream(new byte[]{1,2}), 2));
        try { BillingWire.read(new ByteArrayInputStream(new byte[]{1,2,3}), 2); fail(); } catch (java.io.IOException expected) {}
    }
    @Test public void parsesStrictUtcServerTimesWithoutApi26DateTime() throws Exception {
        assertEquals(1000L, BillingWire.timestamp("1970-01-01T00:00:01.000Z"));
        try { BillingWire.timestamp("2026-02-31T00:00:00.000Z"); fail(); } catch (Exception expected) {}
    }
    @Test public void revocationIsAuthoritativeButPendingOverlapAndOutageAreNot() {
        assertTrue(BillingWire.authoritative(409, "PURCHASE_REVOKED"));
        assertTrue(BillingWire.authoritative(401, ""));
        assertFalse(BillingWire.authoritative(409, "PURCHASE_PENDING"));
        assertFalse(BillingWire.authoritative(409, "ENTITLEMENT_OVERLAP"));
        assertFalse(BillingWire.authoritative(404, ""));
    }
}
