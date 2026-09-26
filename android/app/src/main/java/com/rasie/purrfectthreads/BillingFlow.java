package com.rasie.purrfectthreads;
import java.util.List;
import java.util.function.Consumer;

/** Pure purchase orchestration. Every SDK/server callback is single-use and session-bound. */
final class BillingFlow {
    interface Result<T> { void done(T value, String outcome); }
    static final class Prepared {
        final String account; final boolean canPurchase;
        Prepared(String account, boolean canPurchase) { this.account=account; this.canPurchase=canPurchase; }
    }
    static final class Item {
        final String token, account; final boolean purchased;
        Item(String token, boolean purchased, String account) { this.token=token; this.purchased=purchased; this.account=account; }
    }
    interface Driver {
        String session();
        boolean canLaunch();
        void prepare(Result<Prepared> result);
        void purchases(Result<List<Item>> result);
        void verify(Item item, Result<Void> result);
        void product(Result<Void> result);
        String launch(String account);
    }
    private final Driver driver;
    private volatile long operation;
    private boolean busy, ready, pending;
    private String outcome="unavailable", flowSession;
    private Consumer<String> completion;
    BillingFlow(Driver driver) { this.driver=driver; }
    long generation() { return operation; }
    boolean busy() { return busy; }
    boolean ready() { return ready && !busy && !pending; }
    String outcome() { return busy ? "busy" : pending ? "pending" : outcome; }
    void start(boolean buy, Consumer<String> completed) {
        if (busy) { completed.accept("busy"); return; }
        if (buy && pending) { completed.accept("pending"); return; }
        String session=driver.session();
        if (session==null) { completed.accept("signed-out"); return; }
        long op=++operation; busy=true; ready=false; completion=completed;
        driver.prepare(once(op,session,(prepared,code)-> {
            if (!"ok".equals(code) || prepared==null) { finish(code); return; }
            driver.purchases(once(op,session,(items,query)-> {
                if (!"ok".equals(query) || items==null) { finish(query); return; }
                pending=false;
                verify(items,0,prepared.account,op,session,()-> {
                    if (!items.isEmpty()) { finish("verified"); return; }
                    driver.product(once(op,session,(unused,product)-> {
                        if (!"ok".equals(product)) { finish(product); return; }
                        ready=prepared.canPurchase;
                        if (!buy || !ready) { finish(ready ? "ready" : "active"); return; }
                        if (!driver.canLaunch()) { ready=false; finish("unavailable"); return; }
                        String launched=driver.launch(prepared.account);
                        if (!"ok".equals(launched)) { finish(launched); return; }
                        pending=true; flowSession=session; finish("pending");
                    }));
                });
            }));
        }));
    }
    private void verify(List<Item> items,int index,String account,long op,String session,Runnable done) {
        if(index==items.size()) { done.run(); return; }
        Item item=items.get(index);
        if(!item.purchased) { pending=true; finish("pending"); return; }
        if(!account.equals(item.account)) { finish("account-mismatch"); return; }
        driver.verify(item,once(op,session,(unused,code)-> {
            if(!"ok".equals(code)) { finish(code); return; }
            verify(items,index+1,account,op,session,done);
        }));
    }
    private <T> Result<T> once(long op,String session,Result<T> callback) {
        boolean[] called={false};
        return (value,code)-> {
            if(called[0] || !busy || operation!=op) return;
            called[0]=true;
            if(!session.equals(driver.session())) { finish("signed-out"); return; }
            callback.done(value,code);
        };
    }
    void updated(String code) {
        if(flowSession==null) return;
        String previous=flowSession; flowSession=null;
        if(!previous.equals(driver.session())) { pending=false; return; }
        pending=false;
        if(!"ok".equals(code)) { outcome=code; return; }
        if(!busy) start(false, ignored->{});
    }
    void cancel() { pending=false; flowSession=null; if(busy) finish("unavailable"); else { operation++; ready=false; } }
    private void finish(String code) {
        busy=false; operation++; outcome=code;
        Consumer<String> done=completion; completion=null;
        if(done!=null) done.accept(code);
    }
}
