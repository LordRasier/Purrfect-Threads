package com.rasie.purrfectthreads;
/** Main-thread lifecycle classification; only a resumed caller may start settlement. */
final class BillingLifecycle {
    static final class Claim {
        final long cutoff, backgroundAt; final boolean cold;
        Claim(long cutoff,long backgroundAt,boolean cold) { this.cutoff=cutoff; this.backgroundAt=backgroundAt; this.cold=cold; }
    }
    private boolean paused, cold=true;
    private long backgroundAt=-1;
    boolean paused() { return paused; }
    void pause(long elapsed) { if (backgroundAt < 0) backgroundAt=elapsed; paused=true; }
    void resume() { paused=false; }
    Claim begin(long cutoff) {
        if (paused) return null;
        boolean reachesAway = backgroundAt >= 0 && cutoff > backgroundAt;
        Claim claim=new Claim(cutoff,reachesAway ? backgroundAt : -1,cold);
        if (reachesAway) backgroundAt=-1;
        cold=false;
        return claim;
    }
}
