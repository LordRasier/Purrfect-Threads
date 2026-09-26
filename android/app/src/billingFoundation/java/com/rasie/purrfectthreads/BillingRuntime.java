package com.rasie.purrfectthreads;

import android.app.Activity;
import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.provider.Settings;
import com.android.billingclient.api.Purchase;
import com.getcapacitor.JSObject;
import java.util.Collections;
import java.util.List;
import java.util.ArrayList;
import java.lang.ref.WeakReference;
import com.android.billingclient.api.ProductDetails;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicLong;
import org.json.JSONObject;

/** Main-thread lifecycle; a single process worker serializes cache settlement and transport. */
final class BillingRuntime {
    interface Reply { void done(JSObject value); }
    private static final ExecutorService WORKER = Executors.newSingleThreadExecutor();
    private static final AtomicLong EPOCH = new AtomicLong();
    private final Context context;
    private final Handler main = new Handler(Looper.getMainLooper());
    private final FirebaseIdentityFoundation identity;
    private final BillingCache cache;
    private final BillingBackend backend = new BillingBackend();
    private CrewPlayClient play;
    private boolean destroyed;
    private String price = "";
    private final BillingLifecycle lifecycle = new BillingLifecycle();
    private final List<Reply> pausedReplies = new ArrayList<>();
    private final List<Runnable> pausedResponses = new ArrayList<>();
    private final BillingFlow flow;
    private WeakReference<Activity> activity = new WeakReference<>(null);
    private ProductDetails product;
    private long deadline;
    BillingRuntime(Context context) {
        this.context = context.getApplicationContext();
        identity = FirebaseIdentityFoundation.get(context);
        cache = new BillingCache(context);
        flow = new BillingFlow(new Driver());
    }
    static void invalidate(Context context) {
        EPOCH.incrementAndGet();
        WORKER.execute(() -> new BillingCache(context.getApplicationContext()).clear());
    }
    private int boot() { return Settings.Global.getInt(context.getContentResolver(), Settings.Global.BOOT_COUNT, -1); }
    private boolean current(String session, long epoch) {
        return !destroyed && epoch == EPOCH.get() && session != null && session.equals(identity.sessionKey());
    }
    void pause() { lifecycle.pause(SystemClock.elapsedRealtime()); }
    void resume() {
        lifecycle.resume();
        List<Reply> replies = new ArrayList<>(pausedReplies); pausedReplies.clear();
        List<Runnable> responses = new ArrayList<>(pausedResponses); pausedResponses.clear();
        for (Runnable response : responses) response.run();
        for (Reply reply : replies) status(reply);
    }    void close() {
        destroyed = true; deadline++; flow.cancel(); activity.clear();
        for (Reply reply : pausedReplies) reply.done(simple("cancelled"));
        pausedReplies.clear(); pausedResponses.clear();
        if (play != null) play.close();
    }
    private JSObject simple(String code) {
        return new JSObject().put("status", code).put("ready", false).put("active", false)
            .put("price", "").put("foregroundSeconds", 0).put("offlineSeconds", 0);
    }
    /** The only paid-time bridge. Atomic settlement is persisted before returning any seconds. */
    void status(Reply reply) {
        if (destroyed) { reply.done(simple("cancelled")); return; }
        if (lifecycle.paused()) { pausedReplies.add(reply); return; }
        long cutoff = SystemClock.elapsedRealtime();
        long epoch = EPOCH.get();
        WORKER.execute(() -> {
            BillingLease lease = cache.read();
            long now = SystemClock.elapsedRealtime();
            boolean candidate = lease != null && lease.valid(lease.owner, now, System.currentTimeMillis(), boot());
            if (!candidate && lease != null) cache.clear();
            main.post(() -> {
                if (destroyed || epoch != EPOCH.get()) { reply.done(simple("signed-out")); return; }
                if (candidate && identity.status() == IdentityCoordinator.Status.UNINITIALIZED) {
                    try { identity.recoverPersistedIdentity(); } catch (RuntimeException unavailable) { reply.done(simple("unavailable")); return; }
                }
                String session = identity.sessionKey(), uid = identity.currentUid();
                if (uid == null) { reply.done(simple("signed-out")); return; }
                BillingLifecycle.Claim claim = lifecycle.begin(cutoff);
                if (claim == null) { pausedReplies.add(reply); return; }
                WORKER.execute(() -> {
                    double foreground = 0, offline = 0; boolean active = false;
                    BillingLease latest = cache.read();
                    long claimedAt = SystemClock.elapsedRealtime();
                    try {
                        if (epoch == EPOCH.get() && latest != null && latest.valid(uid, claimedAt, System.currentTimeMillis(), boot())) {
                            long end = Math.max(latest.settled, Math.min(claim.cutoff, claimedAt));
                            long split = claim.cold ? latest.settled : claim.backgroundAt;
                            if (split >= 0) {
                                if (split > latest.settled) foreground = latest.claim(Math.min(split, end), false);
                                offline = latest.claim(end, true);
                            } else foreground = latest.claim(end, false);
                            active = latest.server + claimedAt - latest.elapsed < latest.expires;
                            cache.write(latest);
                        } else if (latest != null) cache.clear();
                    } catch (Exception failure) { cache.clear(); foreground = 0; offline = 0; active = false; }
                    double fg = foreground, off = offline; boolean enabled = active;
                    main.post(() -> {
                        if (!current(session, epoch)) { reply.done(simple("signed-out")); return; }
                        JSObject result = simple(enabled ? "active" : flow.outcome());
                        result.put("ready", flow.ready() && !enabled);
                        result.put("active", enabled); result.put("price", price);
                        result.put("foregroundSeconds", fg); result.put("offlineSeconds", off);
                        reply.done(result);
                    });
                });
            });
        });
    }
    void refresh(boolean purchase, Activity host, Reply reply) {
        if (destroyed || identity.currentUid() == null) { reply.done(simple("signed-out")); return; }
        if (flow.busy()) { reply.done(simple("busy")); return; }
        activity = new WeakReference<>(host);
        flow.start(purchase, code -> status(reply));
    }
    private final class Driver implements BillingFlow.Driver {
        public String session() { return destroyed ? null : identity.sessionKey(); }
        public boolean canLaunch() { return !destroyed && !lifecycle.paused(); }
        public void prepare(BillingFlow.Result<BillingFlow.Prepared> callback) {
            long timeout = ++deadline;
            main.postDelayed(() -> { if (!destroyed && deadline == timeout && flow.busy()) flow.cancel(); }, 45000);
            request(BillingBackend.Route.prepare, null, (json, code) -> {
                if (json == null) { callback.done(null, code); return; }
                try {
                    if (!BillingBackend.PRODUCT.equals(json.getString("productId"))
                        || !BillingBackend.PACKAGE.equals(json.getString("packageName"))) throw new IllegalArgumentException();
                    String account = json.getString("obfuscatedAccountId");
                    if (!account.matches("[a-f0-9]{64}")) throw new IllegalArgumentException();
                    JSONObject grant = json.getJSONObject("entitlement");
                    grant.put("nativeRequestStarted", json.getLong("nativeRequestStarted"));
                    boolean canPurchase = json.getBoolean("canPurchase");
                    if (canPurchase == grant.getBoolean("active")) throw new IllegalArgumentException();
                    storeGrant(grant, accepted -> callback.done(accepted ? new BillingFlow.Prepared(account, canPurchase) : null,
                        accepted ? "ok" : "unavailable"));
                } catch (Exception malformed) { invalidate(context); callback.done(null,"unavailable"); }
            });
        }
        public void purchases(BillingFlow.Result<List<BillingFlow.Item>> callback) {
            if (play == null) play = new CrewPlayClient(context, (items, code) -> main.post(() -> flow.updated(code)));
            play.connect((unused, code) -> main.post(() -> {
                if (!"ok".equals(code)) { callback.done(null,code); return; }
                play.purchases((items, outcome) -> main.post(() -> {
                    List<BillingFlow.Item> result = new ArrayList<>();
                    if (items != null) for (Purchase item : items) {
                        if (!item.getProducts().equals(Collections.singletonList(BillingBackend.PRODUCT))) continue;
                        var ids = item.getAccountIdentifiers();
                        result.add(new BillingFlow.Item(item.getPurchaseToken(), item.getPurchaseState() == Purchase.PurchaseState.PURCHASED,
                            ids == null ? null : ids.getObfuscatedAccountId()));
                    }
                    callback.done(result,outcome);
                }));
            }));
        }
        public void verify(BillingFlow.Item item, BillingFlow.Result<Void> callback) {
            request(BillingBackend.Route.verify,item.token,(json,code)-> {
                if (json == null) { callback.done(null,code); return; }
                storeGrant(json,accepted->callback.done(null,accepted ? "ok" : "unavailable"));
            });
        }
        public void product(BillingFlow.Result<Void> callback) {
            play.product((details,code)->main.post(()-> {
                var offer = details == null ? null : CrewPlayClient.offer(details);
                if (!"ok".equals(code) || offer == null) { callback.done(null,"unavailable"); return; }
                product=details; price=offer.getFormattedPrice(); callback.done(null,"ok");
            }));
        }
        public String launch(String account) { return play.launch(activity.get(), product, account); }
    }
    interface JsonResult { void done(JSONObject json,String outcome); }
    private void request(BillingBackend.Route route, String token, JsonResult done) {
        String session=identity.sessionKey(); long epoch=EPOCH.get(), generation=flow.generation();
        identity.withTokens((credentials, failure) -> {
            if (generation != flow.generation()) return;
            if (!current(session, epoch) || failure != null) { done.done(null,"signed-out"); return; }
            WORKER.execute(() -> {
                JSONObject result = null; boolean clear = false;
                try {
                    long started = SystemClock.elapsedRealtime();
                    if (epoch == EPOCH.get()) {
                        result = backend.request(route, credentials, token);
                        result.put("nativeRequestStarted", started);
                        JSONObject grant = route == BillingBackend.Route.prepare ? result.optJSONObject("entitlement") : result;
                        // Inactive does not distinguish expiry from refund. Clear immediately, even while paused or timed out.
                        if (grant != null && grant.has("active") && !grant.getBoolean("active")) cache.clear();
                    }
                } catch (BillingBackend.Failure rejected) { clear = rejected.authoritative; }
                catch (Exception unavailable) { /* Fixed outcome only; never expose transport/SDK errors. */ }
                if (clear) cache.clear();
                JSONObject response = result;
                main.post(() -> {
                    if (generation != flow.generation()) return;
                    if (!current(session, epoch)) { done.done(null,"signed-out"); return; }
                    Runnable deliver = () -> {
                        if (generation == flow.generation() && current(session, epoch))
                            done.done(response,response == null ? "unavailable" : "ok");
                    };
                    if (lifecycle.paused()) pausedResponses.add(deliver); else deliver.run();
                });
            });
        });
    }
    private void storeGrant(JSONObject json, java.util.function.Consumer<Boolean> done) {
        String session=identity.sessionKey(), uid=identity.currentUid(); long epoch=EPOCH.get(), generation=flow.generation();
        long received = SystemClock.elapsedRealtime(), wall = System.currentTimeMillis();
        WORKER.execute(() -> {
            boolean ok = false;
            try {
                if (epoch != EPOCH.get() || generation != flow.generation()) return;
                boolean active = json.getBoolean("active");
                if (!active) { cache.clear(); ok = json.getInt("multiplier") == 1; }
                else {
                    if (json.getInt("multiplier") != 2) throw new IllegalArgumentException();
                    BillingLease lease = new BillingLease(uid, BillingWire.timestamp(json.getString("confirmedAt")),
                        BillingWire.timestamp(json.getString("expiresAt")), BillingWire.timestamp(json.getString("serverTime"))
                            + Math.max(0, received - json.getLong("nativeRequestStarted")), received, wall, boot());
                    if (!lease.valid(uid, received, wall, boot()) || lease.server >= lease.expires) throw new IllegalArgumentException();
                    BillingLease old = cache.read();
                    // Duplicate callbacks/revalidation cannot reset the native settlement cursor or clock anchor.
                    if (old != null && old.owner.equals(uid) && old.confirmed == lease.confirmed
                        && old.valid(uid, received, wall, boot())) {
                        cache.write(old); ok = true;
                    } else if (lease.valid(uid, received, wall, boot()) && lease.server < lease.expires) {
                        cache.write(lease); ok = true;
                    }
                }
                if (!ok) cache.clear();
            } catch (Exception invalid) { cache.clear(); }
            boolean accepted = ok;
            main.post(() -> { if (generation == flow.generation()) done.accept(current(session, epoch) && accepted); });
        });
    }
}
