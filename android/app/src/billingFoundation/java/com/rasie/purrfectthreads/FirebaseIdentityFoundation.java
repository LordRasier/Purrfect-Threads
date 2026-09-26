package com.rasie.purrfectthreads;

import android.app.Activity;
import android.content.Context;
import android.os.CancellationSignal;
import android.os.Looper;
import androidx.core.content.ContextCompat;
import androidx.credentials.ClearCredentialStateRequest;
import androidx.credentials.Credential;
import androidx.credentials.CredentialManager;
import androidx.credentials.CredentialManagerCallback;
import androidx.credentials.CustomCredential;
import androidx.credentials.GetCredentialRequest;
import androidx.credentials.GetCredentialResponse;
import androidx.credentials.exceptions.ClearCredentialException;
import androidx.credentials.exceptions.GetCredentialCancellationException;
import androidx.credentials.exceptions.GetCredentialException;
import com.google.android.libraries.identity.googleid.GetGoogleIdOption;
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential;
import com.google.firebase.FirebaseApp;
import com.google.firebase.appcheck.FirebaseAppCheck;
import com.google.firebase.appcheck.playintegrity.PlayIntegrityAppCheckProviderFactory;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.auth.GoogleAuthProvider;
import java.lang.ref.WeakReference;
import java.util.concurrent.Executor;

/** Dormant native seam: no Capacitor registration, UI entry point, or token serialization. */
final class FirebaseIdentityFoundation {
    private static FirebaseIdentityFoundation instance;
    private final Driver driver;
    private final IdentityCoordinator coordinator;

    static FirebaseIdentityFoundation get(Context context) {
        requireMainThread();
        if (instance == null) instance = new FirebaseIdentityFoundation(context.getApplicationContext());
        return instance;
    }

    private FirebaseIdentityFoundation(Context context) {
        driver = new Driver(context);
        coordinator = new IdentityCoordinator(driver);
    }

    IdentityCoordinator.Status status() {
        requireMainThread();
        return coordinator.status();
    }

    // A future reviewed native account control must call this only from an explicit user action.
    void signInFromUserAction(Activity activity, IdentityCoordinator.Completion<Void> completion) {
        requireMainThread();
        if (activity == null || activity.isFinishing() || activity.isDestroyed()) {
            completion.complete(null, IdentityCoordinator.Failure.CANCELLED);
            return;
        }
        driver.activity = new WeakReference<>(activity);
        coordinator.signIn(completion);
    }

    void signOut(IdentityCoordinator.Completion<Void> completion) {
        requireMainThread();
        coordinator.signOut(completion);
    }

    void withTokens(IdentityCoordinator.Completion<IdentityCoordinator.Tokens> completion) {
        requireMainThread();
        coordinator.withTokens(completion);
    }

    private static void requireMainThread() {
        if (Looper.myLooper() != Looper.getMainLooper()) {
            throw new IllegalStateException("Identity operations require the main thread");
        }
    }

    private static final class Driver implements IdentityCoordinator.Driver {
        private final Context context;
        private final Executor main;
        private WeakReference<Activity> activity = new WeakReference<>(null);
        private FirebaseApp app;
        private FirebaseAppCheck appCheck;
        private FirebaseAuth auth;
        private CredentialManager credentials;

        Driver(Context context) {
            this.context = context;
            main = ContextCompat.getMainExecutor(context);
        }

        public void initializeFirebase() {
            app = FirebaseApp.initializeApp(context);
            if (app == null) throw new IllegalStateException("Firebase configuration unavailable");
        }

        // https://firebase.google.com/docs/app-check/android/play-integrity-provider
        public void installAppCheck() {
            appCheck = FirebaseAppCheck.getInstance(app);
            appCheck.installAppCheckProviderFactory(PlayIntegrityAppCheckProviderFactory.getInstance());
        }

        public void initializeAuth() {
            auth = FirebaseAuth.getInstance(app);
            credentials = CredentialManager.create(context);
        }

        public String currentGoogleUid() {
            FirebaseUser user = auth.getCurrentUser();
            if (user == null || user.isAnonymous()) return null;
            return user.getProviderData().stream().anyMatch(
                provider -> GoogleAuthProvider.PROVIDER_ID.equals(provider.getProviderId()))
                ? user.getUid() : null;
        }

        // https://firebase.google.com/docs/auth/android/google-signin
        public void signIn(IdentityCoordinator.Completion<Void> completion) {
            WeakReference<Activity> requestedActivity = activity;
            Activity host = requestedActivity.get();
            if (host == null || host.isFinishing() || host.isDestroyed()) {
                completion.complete(null, IdentityCoordinator.Failure.CANCELLED);
                return;
            }
            int clientIdResource = context.getResources().getIdentifier(
                "default_web_client_id", "string", context.getPackageName());
            if (clientIdResource == 0) {
                completion.complete(null, IdentityCoordinator.Failure.UNAVAILABLE);
                return;
            }
            GetGoogleIdOption option = new GetGoogleIdOption.Builder()
                .setServerClientId(context.getString(clientIdResource))
                .setFilterByAuthorizedAccounts(false)
                .setAutoSelectEnabled(false)
                .build();
            GetCredentialRequest request = new GetCredentialRequest.Builder()
                .addCredentialOption(option).build();
            credentials.getCredentialAsync(host, request, new CancellationSignal(), main,
                new CredentialManagerCallback<GetCredentialResponse, GetCredentialException>() {
                    public void onResult(GetCredentialResponse response) {
                        Activity current = requestedActivity.get();
                        if (current == null || current.isFinishing() || current.isDestroyed()) {
                            completion.complete(null, IdentityCoordinator.Failure.CANCELLED);
                            return;
                        }
                        Credential credential = response.getCredential();
                        if (!(credential instanceof CustomCredential)
                                || !GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
                                    .equals(credential.getType())) {
                            completion.complete(null, IdentityCoordinator.Failure.SIGN_IN_FAILED);
                            return;
                        }
                        try {
                            String token = GoogleIdTokenCredential.createFrom(credential.getData()).getIdToken();
                            auth.signInWithCredential(GoogleAuthProvider.getCredential(token, null))
                                .addOnCompleteListener(main, task -> completion.complete(null,
                                    task.isSuccessful() ? null : IdentityCoordinator.Failure.SIGN_IN_FAILED));
                        } catch (Exception invalidCredential) {
                            // Never forward SDK exceptions: they may contain credential details.
                            completion.complete(null, IdentityCoordinator.Failure.SIGN_IN_FAILED);
                        }
                    }
                    public void onError(GetCredentialException error) {
                        completion.complete(null, error instanceof GetCredentialCancellationException
                            ? IdentityCoordinator.Failure.CANCELLED : IdentityCoordinator.Failure.SIGN_IN_FAILED);
                    }
                });
        }

        public void signOut(IdentityCoordinator.Completion<Void> completion) {
            auth.signOut();
            credentials.clearCredentialStateAsync(new ClearCredentialStateRequest(),
                new CancellationSignal(), main,
                new CredentialManagerCallback<Void, ClearCredentialException>() {
                    public void onResult(Void result) { completion.complete(null, null); }
                    public void onError(ClearCredentialException error) {
                        completion.complete(null, IdentityCoordinator.Failure.CREDENTIAL_CLEAR_FAILED);
                    }
                });
        }

        // https://firebase.google.com/docs/app-check/android/custom-resource
        public void fetchTokens(IdentityCoordinator.Completion<IdentityCoordinator.Tokens> completion) {
            FirebaseUser user = auth.getCurrentUser();
            if (user == null) { completion.complete(null, IdentityCoordinator.Failure.SIGNED_OUT); return; }
            user.getIdToken(false).addOnCompleteListener(main, authTask -> {
                if (!authTask.isSuccessful() || authTask.getResult().getToken() == null) {
                    completion.complete(null, IdentityCoordinator.Failure.TOKEN_UNAVAILABLE);
                    return;
                }
                appCheck.getAppCheckToken(false).addOnCompleteListener(main, appTask -> {
                    if (!appTask.isSuccessful()) {
                        completion.complete(null, IdentityCoordinator.Failure.TOKEN_UNAVAILABLE);
                        return;
                    }
                    completion.complete(new IdentityCoordinator.Tokens(
                        authTask.getResult().getToken(), appTask.getResult().getToken()), null);
                });
            });
        }
    }
}
