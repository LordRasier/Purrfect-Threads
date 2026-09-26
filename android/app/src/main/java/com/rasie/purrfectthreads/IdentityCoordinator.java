package com.rasie.purrfectthreads;

/** Native-only, single-threaded policy. Android callers and callbacks use the main thread. */
final class IdentityCoordinator {
    enum Status { UNINITIALIZED, SIGNED_OUT, SIGNED_IN, BUSY }
    enum Failure { BUSY, CANCELLED, UNAVAILABLE, SIGNED_OUT, SIGN_IN_FAILED,
        CREDENTIAL_CLEAR_FAILED, TOKEN_UNAVAILABLE, SESSION_CHANGED }
    interface Completion<T> { void complete(T value, Failure failure); }
    interface Driver {
        void initializeFirebase();
        void installAppCheck();
        void initializeAuth();
        String currentGoogleUid();
        void signIn(Completion<Void> completion);
        void signOut(Completion<Void> completion);
        void fetchTokens(Completion<Tokens> completion);
    }
    // Intentionally not a record: generated toString must never include credentials.
    static final class Tokens {
        final String idToken;
        final String appCheckToken;
        Tokens(String idToken, String appCheckToken) {
            this.idToken = idToken;
            this.appCheckToken = appCheckToken;
        }
    }

    private final Driver driver;
    private boolean initialized;
    private boolean busy;
    private long generation;

    IdentityCoordinator(Driver driver) { this.driver = driver; }

    Status status() {
        if (busy) return Status.BUSY;
        if (!initialized) return Status.UNINITIALIZED;
        return driver.currentGoogleUid() == null ? Status.SIGNED_OUT : Status.SIGNED_IN;
    }

    void signIn(Completion<Void> completion) {
        if (busy) { completion.complete(null, Failure.BUSY); return; }
        busy = true;
        generation++;
        try {
            initialize();
            if (driver.currentGoogleUid() != null) {
                busy = false;
                completion.complete(null, null);
                return;
            }
            driver.signIn((value, failure) -> {
                busy = false;
                completion.complete(null, failure != null ? failure :
                    driver.currentGoogleUid() == null ? Failure.SIGN_IN_FAILED : null);
            });
        } catch (RuntimeException unavailable) {
            busy = false;
            completion.complete(null, Failure.UNAVAILABLE);
        }
    }

    void signOut(Completion<Void> completion) {
        // Do not race an uncancellable Firebase signInWithCredential task.
        if (busy) { completion.complete(null, Failure.BUSY); return; }
        generation++;
        busy = true;
        try {
            initialize();
            driver.signOut((value, failure) -> {
                busy = false;
                completion.complete(null, failure);
            });
        } catch (RuntimeException unavailable) {
            busy = false;
            completion.complete(null, Failure.UNAVAILABLE);
        }
    }

    private void initialize() {
        if (initialized) return;
        driver.initializeFirebase();
        driver.installAppCheck();
        driver.initializeAuth();
        initialized = true;
    }

    /** Tokens may only be consumed immediately by a future native, fixed-destination client. */
    void withTokens(Completion<Tokens> completion) {
        if (busy) { completion.complete(null, Failure.BUSY); return; }
        String uid = initialized ? driver.currentGoogleUid() : null;
        if (uid == null) { completion.complete(null, Failure.SIGNED_OUT); return; }
        long requestedGeneration = generation;
        try {
            driver.fetchTokens((tokens, failure) -> {
                if (requestedGeneration != generation || !uid.equals(driver.currentGoogleUid())) {
                    completion.complete(null, Failure.SESSION_CHANGED);
                } else if (failure != null) {
                    completion.complete(null, failure);
                } else if (tokens == null || tokens.idToken == null || tokens.idToken.isEmpty()
                        || tokens.appCheckToken == null || tokens.appCheckToken.isEmpty()) {
                    completion.complete(null, Failure.TOKEN_UNAVAILABLE);
                } else {
                    completion.complete(tokens, null);
                }
            });
        } catch (RuntimeException unavailable) {
            completion.complete(null, Failure.TOKEN_UNAVAILABLE);
        }
    }
}
