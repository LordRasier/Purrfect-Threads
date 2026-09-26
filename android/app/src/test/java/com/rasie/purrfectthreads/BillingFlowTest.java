package com.rasie.purrfectthreads;
import org.junit.Test;
import java.util.Collections;
import java.util.List;
import static org.junit.Assert.*;
public class BillingFlowTest {
    static class Fake implements BillingFlow.Driver {
        String session = "a"; boolean foreground=true; int launches, verifies, queries;
        BillingFlow.Result<BillingFlow.Prepared> prepared;
        BillingFlow.Result<List<BillingFlow.Item>> purchased;
        BillingFlow.Result<Void> verified, product;
        public String session() { return session; }
        public boolean canLaunch() { return foreground; }
        public void prepare(BillingFlow.Result<BillingFlow.Prepared> result) { prepared = result; }
        public void purchases(BillingFlow.Result<List<BillingFlow.Item>> result) { queries++; purchased = result; }
        public void verify(BillingFlow.Item item, BillingFlow.Result<Void> result) { verifies++; verified = result; }
        public void product(BillingFlow.Result<Void> result) { product = result; }
        public String launch(String account) { launches++; return "ok"; }
    }
    final Fake driver = new Fake(); final BillingFlow flow = new BillingFlow(driver);
    String outcome;
    void start(boolean buy) { flow.start(buy, code -> outcome = code); }
    void prepared() { driver.prepared.done(new BillingFlow.Prepared("account", true), "ok"); }
    BillingFlow.Item item(boolean paid, String account) { return new BillingFlow.Item("token", paid, account); }
    @Test public void unavailableServerNeverQueriesPlayOrLaunches() {
        start(true); driver.prepared.done(null, "unavailable");
        assertEquals("unavailable", outcome); assertEquals(0, driver.queries); assertEquals(0, driver.launches);
    }
    @Test public void pendingAndWrongAccountNeverVerifyOrLaunch() {
        start(true); prepared(); driver.purchased.done(Collections.singletonList(item(false,"account")), "ok");
        assertEquals("pending", outcome); assertEquals(0,driver.verifies); assertEquals(0,driver.launches);
        start(false); prepared(); driver.purchased.done(Collections.singletonList(item(true,"other")), "ok");
        assertEquals("account-mismatch", outcome); assertEquals(0,driver.verifies);
    }
    @Test public void changedIdentityDiscardsPrepareAndVerifyCallbacks() {
        start(true); driver.session="b"; prepared(); assertEquals("signed-out",outcome); assertEquals(0,driver.queries);
        start(false); prepared(); driver.purchased.done(Collections.singletonList(item(true,"account")),"ok");
        driver.session="c"; driver.verified.done(null,"ok"); assertEquals("signed-out",outcome);
    }
    @Test public void duplicatePrepareAndPurchaseCallbacksCannotLaunchTwice() {
        start(true); prepared(); prepared(); assertEquals(1,driver.queries);
        var callback=driver.purchased; callback.done(Collections.emptyList(),"ok"); callback.done(Collections.emptyList(),"ok");
        driver.product.done(null,"ok"); driver.product.done(null,"ok");
        assertEquals(1,driver.launches); assertEquals("pending",outcome);
        flow.updated("cancelled"); assertEquals("cancelled",flow.outcome());
    }
    @Test public void cancellationTimeoutAndLateCallbacksDoNotAffectNewOperation() {
        start(true); var stale=driver.prepared; flow.cancel(); start(false);
        stale.done(new BillingFlow.Prepared("account",true),"ok"); assertEquals(0,driver.queries);
        prepared(); driver.purchased.done(Collections.emptyList(),"ok"); driver.product.done(null,"ok");
        assertEquals("ready",outcome); assertEquals(0,driver.launches);
    }
    @Test public void recoveredPurchaseVerifiesButCannotRepurchaseInSameOperation() {
        start(true); prepared(); driver.purchased.done(Collections.singletonList(item(true,"account")),"ok");
        driver.verified.done(null,"ok"); assertEquals("verified",outcome); assertEquals(0,driver.launches);
    }
    @Test public void latePurchaseUpdateAfterAccountSwitchCannotRecoverOtherAccount() {
        start(true); prepared(); driver.purchased.done(Collections.emptyList(),"ok"); driver.product.done(null,"ok");
        int before=driver.queries; driver.session="b"; flow.updated("ok"); assertEquals(before,driver.queries);
    }
    @Test public void delayedProductCallbackNeverLaunchesFromBackground() {
        start(true); prepared(); driver.purchased.done(Collections.emptyList(),"ok");
        driver.foreground=false; driver.product.done(null,"ok");
        assertEquals(0,driver.launches); assertEquals("unavailable",outcome);
    }}
