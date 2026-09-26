package com.rasie.purrfectthreads;

/** Authenticated server window plus same-boot clock mapping. Never sourced from game saves. */
final class BillingLease {
    static final long DURATION = 43_200_000L;
    final String owner;
    final long confirmed, expires, server, elapsed, wall;
    final int boot;
    long settled;
    BillingLease(String owner, long confirmed, long expires, long server, long elapsed, long wall, int boot) {
        this.owner = owner; this.confirmed = confirmed; this.expires = expires;
        this.server = server; this.elapsed = elapsed; this.wall = wall; this.boot = boot;
        this.settled = elapsed;
    }
    boolean valid(String uid, long nowElapsed, long nowWall, int nowBoot) {
        long age = nowElapsed - elapsed;
        return owner != null && owner.equals(uid) && boot >= 0 && boot == nowBoot
            && confirmed >= 0 && expires - confirmed == DURATION && server >= confirmed
            && elapsed >= 0 && age >= 0 && age <= DURATION
            && Math.abs((nowWall - wall) - age) <= 5000
            && settled >= elapsed && settled <= nowElapsed;
    }
    long confirmedWall() { return wall + confirmed - server; }
    long expiresWall() { return wall + expires - server; }
    /** Persist this advancement before exposing credit; crashes may lose, never replay it. */
    double claim(long nowElapsed, boolean offline) {
        long end = offline ? Math.min(nowElapsed, settled + 28_800_000L) : nowElapsed;
        long startServer = server + settled - elapsed;
        long endServer = server + end - elapsed;
        double seconds = Math.max(0, Math.min(expires, endServer) - Math.max(confirmed, startServer)) / 1000.0;
        settled = nowElapsed;
        return seconds;
    }}
