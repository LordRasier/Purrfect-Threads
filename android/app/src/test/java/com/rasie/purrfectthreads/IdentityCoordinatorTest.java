package com.rasie.purrfectthreads;

import org.junit.Test;
import java.util.ArrayList;
import java.util.List;
import static org.junit.Assert.*;

public class IdentityCoordinatorTest {
    private final FakeDriver driver = new FakeDriver();
    private final IdentityCoordinator identity = new IdentityCoordinator(driver);

    @Test public void cacheRecoveryNeverPromptsAndSessionChangesInvalidateRequests() {
        assertNull(identity.sessionKey());
        driver.uid = "persisted-user";
        identity.recoverPersistedIdentity();
        assertEquals(IdentityCoordinator.Status.SIGNED_IN, identity.status());
        assertEquals(List.of("firebase", "appcheck", "auth"), driver.events);
        String session = identity.sessionKey();
        assertNotNull(session);
        identity.signOut(new Result<>());
        assertNotEquals(session, identity.sessionKey());
    }
    @Test public void statusAndSignedOutTokensNeverInitializeSdk() {
        assertEquals(IdentityCoordinator.Status.UNINITIALIZED, identity.status());
        Result<IdentityCoordinator.Tokens> result = new Result<>();
        identity.withTokens(result);
        assertEquals(IdentityCoordinator.Failure.SIGNED_OUT, result.failure);
        assertTrue(driver.events.isEmpty());
    }

    @Test public void explicitSignInInstallsAppCheckBeforeAuthAndPromptsOnce() {
        Result<Void> result = new Result<>();
        identity.signIn(result);
        assertEquals(List.of("firebase", "appcheck", "auth", "signin"), driver.events);
        assertEquals(IdentityCoordinator.Status.BUSY, identity.status());
        driver.uid = "google-user";
        driver.signIn.complete(null, null);
        assertNull(result.failure);
        assertEquals(1, result.calls);
        assertEquals(IdentityCoordinator.Status.SIGNED_IN, identity.status());
    }

    @Test public void cancellationCanRetryAndConcurrentMutationsAreRejected() {
        identity.signIn(new Result<>());
        Result<Void> concurrent = new Result<>();
        identity.signOut(concurrent);
        assertEquals(IdentityCoordinator.Failure.BUSY, concurrent.failure);
        driver.signIn.complete(null, IdentityCoordinator.Failure.CANCELLED);
        assertEquals(IdentityCoordinator.Status.SIGNED_OUT, identity.status());
        identity.signIn(new Result<>());
        assertEquals(2, driver.events.stream().filter("signin"::equals).count());
    }

    @Test public void persistedGoogleIdentityIsRecoveredOnlyAfterExplicitActivation() {
        driver.uid = "persisted-user";
        identity.signIn(new Result<>());
        assertEquals(List.of("firebase", "appcheck", "auth"), driver.events);
        assertEquals(IdentityCoordinator.Status.SIGNED_IN, identity.status());
    }

    @Test public void initializationFailureDoesNotPromptAndCanRetry() {
        driver.failAppCheck = true;
        Result<Void> result = new Result<>();
        identity.signIn(result);
        assertEquals(IdentityCoordinator.Failure.UNAVAILABLE, result.failure);
        assertFalse(driver.events.contains("auth"));
        assertFalse(driver.events.contains("signin"));
        driver.failAppCheck = false;
        identity.signIn(new Result<>());
        assertEquals(IdentityCoordinator.Status.BUSY, identity.status());
    }

    @Test public void signOutInvalidatesInFlightTokensEvenWhenCredentialClearFails() {
        activate();
        Result<IdentityCoordinator.Tokens> tokens = new Result<>();
        identity.withTokens(tokens);
        Result<Void> signOut = new Result<>();
        identity.signOut(signOut);
        assertNull(driver.uid);
        driver.signOut.complete(null, IdentityCoordinator.Failure.CREDENTIAL_CLEAR_FAILED);
        driver.tokens.complete(new IdentityCoordinator.Tokens("id", "attestation"), null);
        assertEquals(IdentityCoordinator.Failure.SESSION_CHANGED, tokens.failure);
        assertNull(tokens.value);
        assertEquals(IdentityCoordinator.Status.SIGNED_OUT, identity.status());
        assertEquals(IdentityCoordinator.Failure.CREDENTIAL_CLEAR_FAILED, signOut.failure);
    }

    @Test public void tokenFailuresAndAccountChangesNeverReturnPartialCredentials() {
        activate();
        Result<IdentityCoordinator.Tokens> result = new Result<>();
        identity.withTokens(result);
        driver.uid = "different-user";
        driver.tokens.complete(new IdentityCoordinator.Tokens("id", "attestation"), null);
        assertEquals(IdentityCoordinator.Failure.SESSION_CHANGED, result.failure);
        assertNull(result.value);
        result = new Result<>();
        identity.withTokens(result);
        driver.tokens.complete(null, IdentityCoordinator.Failure.TOKEN_UNAVAILABLE);
        assertEquals(IdentityCoordinator.Failure.TOKEN_UNAVAILABLE, result.failure);
        assertNull(result.value);
    }

    @Test public void nativeTokenPairIsCompleteAndDoesNotPrintSecrets() {
        activate();
        Result<IdentityCoordinator.Tokens> result = new Result<>();
        identity.withTokens(result);
        driver.tokens.complete(new IdentityCoordinator.Tokens("secret-id", "secret-appcheck"), null);
        assertEquals("secret-id", result.value.idToken);
        assertEquals("secret-appcheck", result.value.appCheckToken);
        assertFalse(result.value.toString().contains("secret"));
    }

    @Test public void explicitSignOutAfterProcessRestartClearsPersistedIdentity() {
        driver.uid = "persisted-user";
        identity.signOut(new Result<>());
        assertNull(driver.uid);
        assertEquals(List.of("firebase", "appcheck", "auth"), driver.events);
        driver.signOut.complete(null, null);
        assertEquals(IdentityCoordinator.Status.SIGNED_OUT, identity.status());
    }

    @Test public void busySignInRejectsAnotherSignInAndTokenRequests() {
        identity.signIn(new Result<>());
        Result<Void> second = new Result<>();
        identity.signIn(second);
        Result<IdentityCoordinator.Tokens> tokens = new Result<>();
        identity.withTokens(tokens);
        assertEquals(IdentityCoordinator.Failure.BUSY, second.failure);
        assertEquals(IdentityCoordinator.Failure.BUSY, tokens.failure);
        assertEquals(1, driver.events.stream().filter("signin"::equals).count());
    }

    @Test public void partialTokensFailClosed() {
        activate();
        Result<IdentityCoordinator.Tokens> result = new Result<>();
        identity.withTokens(result);
        driver.tokens.complete(new IdentityCoordinator.Tokens("id", ""), null);
        assertNull(result.value);
        assertEquals(IdentityCoordinator.Failure.TOKEN_UNAVAILABLE, result.failure);
    }

    @Test public void destroyedOwnerCompletesImmediatelyAndLateSignInIsClearedBeforeRetry() {
        Result<Void> result = new Result<>();
        identity.signIn(result);
        identity.cancelPending();
        assertEquals(1, result.calls);
        assertEquals(IdentityCoordinator.Failure.CANCELLED, result.failure);
        assertEquals(IdentityCoordinator.Status.BUSY, identity.status());
        Result<Void> retry = new Result<>();
        identity.signIn(retry);
        assertEquals(IdentityCoordinator.Failure.BUSY, retry.failure);
        driver.uid = "late-user";
        driver.signIn.complete(null, null);
        assertNull(driver.uid);
        assertEquals(IdentityCoordinator.Status.BUSY, identity.status());
        driver.signOut.complete(null, null);
        assertEquals(IdentityCoordinator.Status.SIGNED_OUT, identity.status());
        assertEquals(1, result.calls);
        identity.signIn(new Result<>());
        assertEquals(2, driver.events.stream().filter("signin"::equals).count());
    }

    @Test public void destroyedOwnerDuringDisconnectDoesNotRetainOrCompleteCallbackTwice() {
        activate();
        Result<Void> result = new Result<>();
        identity.signOut(result);
        identity.cancelPending();
        assertEquals(1, result.calls);
        assertEquals(IdentityCoordinator.Failure.CANCELLED, result.failure);
        driver.signOut.complete(null, null);
        assertEquals(1, result.calls);
        assertEquals(IdentityCoordinator.Status.SIGNED_OUT, identity.status());
    }

    @Test public void cancelledPickerReleasesBusyWithoutChangingAccount() {
        identity.signIn(new Result<>());
        identity.cancelPending();
        driver.signIn.complete(null, IdentityCoordinator.Failure.CANCELLED);
        assertEquals(IdentityCoordinator.Status.SIGNED_OUT, identity.status());
        assertTrue(driver.events.contains("cancel"));
    }

    @Test public void staleDisconnectCallbackCannotFinishANewerSignIn() {
        activate();
        identity.signOut(new Result<>());
        IdentityCoordinator.Completion<Void> old = driver.signOut;
        old.complete(null, null);
        Result<Void> next = new Result<>();
        identity.signIn(next);
        old.complete(null, null);
        assertEquals(0, next.calls);
        assertEquals(IdentityCoordinator.Status.BUSY, identity.status());
    }

    private void activate() {
        driver.uid = "google-user";
        identity.signIn(new Result<>());
    }

    private static final class Result<T> implements IdentityCoordinator.Completion<T> {
        T value;
        IdentityCoordinator.Failure failure;
        int calls;
        public void complete(T value, IdentityCoordinator.Failure failure) {
            this.value = value; this.failure = failure; calls++;
        }
    }

    private static final class FakeDriver implements IdentityCoordinator.Driver {
        final List<String> events = new ArrayList<>();
        String uid;
        boolean failAppCheck;
        IdentityCoordinator.Completion<Void> signIn, signOut;
        IdentityCoordinator.Completion<IdentityCoordinator.Tokens> tokens;
        public void initializeFirebase() { events.add("firebase"); }
        public void installAppCheck() {
            events.add("appcheck");
            if (failAppCheck) throw new IllegalStateException("unavailable");
        }
        public void initializeAuth() { events.add("auth"); }
        public String currentGoogleUid() { return uid; }
        public void signIn(IdentityCoordinator.Completion<Void> callback) {
            events.add("signin"); signIn = callback;
        }
        public void cancelSignIn() { events.add("cancel"); }
        public void signOut(IdentityCoordinator.Completion<Void> callback) {
            uid = null; signOut = callback;
        }
        public void fetchTokens(IdentityCoordinator.Completion<IdentityCoordinator.Tokens> callback) {
            tokens = callback;
        }
    }
}
