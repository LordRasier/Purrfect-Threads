package com.rasie.purrfectthreads;

import android.app.Activity;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.AgeRestrictedTreatment;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.RequestConfiguration;
import com.google.android.ump.ConsentInformation;
import com.google.android.ump.ConsentRequestParameters;
import com.google.android.ump.FormError;
import com.google.android.ump.UserMessagingPlatform;
import java.util.ArrayList;
import java.util.List;

/** Android-only AdMob banner kept in a dedicated row below Capacitor's WebView. */
@CapacitorPlugin(name = "AdMobBanner")
public final class AdMobBannerPlugin extends Plugin {
    private static final long AD_RETRY_DELAY_MS = 30_000L;
    private final List<PluginCall> pendingInitializationCalls = new ArrayList<>();
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private final Runnable retryAdLoad = this::ensureBannerLoaded;
    private ConsentInformation consentInformation;
    private FrameLayout bannerContainer;
    private AdView adView;
    private boolean consentUpdateStarted;
    private int consentAttemptsStarted;
    private boolean initializeRequested;
    private boolean sdkInitializationStarted;
    private boolean sdkInitialized;
    private boolean desiredVisible = true;
    private boolean bannerVisible;
    private boolean adLoaded;
    private int adRetriesScheduled;
    private boolean foreground = true;
    private boolean destroyed;
    private String consentError;
    private String adError;

    @Override
    public void load() {
        getActivity().runOnUiThread(() -> {
            consentInformation = UserMessagingPlatform.getConsentInformation(getContext());
            installBannerRow();
        });
    }

    @PluginMethod
    public void initialize(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            initializeRequested = true;
            desiredVisible = true;
            if (sdkInitialized) {
                ensureBannerLoaded();
                call.resolve(status());
                return;
            }
            pendingInitializationCalls.add(call);
            if (!consentUpdateStarted) requestConsentAndInitialize();
        });
    }

    @PluginMethod
    public void showBanner(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            desiredVisible = true;
            if (sdkInitialized) ensureBannerLoaded();
            call.resolve(status());
        });
    }

    @PluginMethod
    public void hideBanner(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            desiredVisible = false;
            bannerVisible = false;
            if (adView != null) adView.pause();
            if (bannerContainer != null) bannerContainer.setVisibility(View.GONE);
            call.resolve();
        });
    }

    @PluginMethod
    public void showPrivacyOptions(PluginCall call) {
        getActivity().runOnUiThread(() -> UserMessagingPlatform.showPrivacyOptionsForm(
            getActivity(),
            formError -> {
                if (destroyed) return;
                consentError = errorMessage(formError);
                reconcileConsentState();
                call.resolve(status());
            }
        ));
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        getActivity().runOnUiThread(() -> call.resolve(status()));
    }

    private void requestConsentAndInitialize() {
        if (destroyed || consentUpdateStarted) return;
        if (!AdsPolicy.shouldAttemptConsent(consentAttemptsStarted)) {
            resolvePendingInitializationCalls();
            return;
        }
        consentAttemptsStarted++;
        consentUpdateStarted = true;
        consentError = null;
        ConsentRequestParameters parameters = new ConsentRequestParameters.Builder()
            // Conservative temporary policy until a verified age-assurance strategy exists.
            .setTagForUnderAgeOfConsent(true)
            .build();
        consentInformation.requestConsentInfoUpdate(
            getActivity(),
            parameters,
            () -> {
                if (destroyed) return;
                UserMessagingPlatform.loadAndShowConsentFormIfRequired(
                    getActivity(),
                    formError -> {
                        if (destroyed) return;
                        consentError = errorMessage(formError);
                        finishConsentFlow();
                    }
                );
            },
            requestConsentError -> {
                if (destroyed) return;
                consentError = errorMessage(requestConsentError);
                finishConsentFlow();
            }
        );
    }

    private void finishConsentFlow() {
        consentUpdateStarted = false;
        reconcileConsentState();
        if (!consentInformation.canRequestAds()) resolvePendingInitializationCalls();
    }

    private void reconcileConsentState() {
        if (consentInformation.canRequestAds()) {
            initializeMobileAds();
        } else {
            mainHandler.removeCallbacks(retryAdLoad);
            destroyBanner();
        }
    }

    private void initializeMobileAds() {
        if (destroyed) return;
        if (sdkInitialized) {
            ensureBannerLoaded();
            resolvePendingInitializationCalls();
            return;
        }
        if (sdkInitializationStarted) return;
        sdkInitializationStarted = true;
        RequestConfiguration configuration = MobileAds.getRequestConfiguration().toBuilder()
            .setAgeRestrictedTreatment(AgeRestrictedTreatment.CHILD)
            .setMaxAdContentRating(RequestConfiguration.MAX_AD_CONTENT_RATING_PG)
            .setPublisherPrivacyPersonalizationState(
                RequestConfiguration.PublisherPrivacyPersonalizationState.DISABLED)
            .build();
        MobileAds.setRequestConfiguration(configuration);
        MobileAds.putPublisherFirstPartyIdEnabled(false);
        MobileAds.initialize(getContext(), initializationStatus -> mainHandler.post(() -> {
            if (destroyed) return;
            sdkInitialized = true;
            ensureBannerLoaded();
            resolvePendingInitializationCalls();
        }));
    }

    private void ensureBannerLoaded() {
        if (destroyed || !foreground || !desiredVisible || !sdkInitialized ||
            !consentInformation.canRequestAds()) return;
        installBannerRow();
        if (bannerContainer == null) return;
        if (adView != null) {
            if (adLoaded) {
                adView.resume();
                bannerContainer.setVisibility(View.VISIBLE);
                bannerVisible = true;
            }
            return;
        }
        int widthPixels = bannerContainer.getWidth();
        if (widthPixels <= 0) widthPixels = getActivity().getResources().getDisplayMetrics().widthPixels;
        int widthDp = Math.max(1, (int) (widthPixels / getActivity().getResources().getDisplayMetrics().density));

        adError = null;
        final AdView requestedAdView = new AdView(getActivity());
        adView = requestedAdView;
        requestedAdView.setAdUnitId(AdsPolicy.bannerUnitId(BuildConfig.PURRFECT_ADS_PRODUCTION));
        requestedAdView.setAdSize(AdSize.getLargeAnchoredAdaptiveBannerAdSize(getActivity(), widthDp));
        requestedAdView.setAdListener(new AdListener() {
            @Override
            public void onAdLoaded() {
                if (destroyed || adView != requestedAdView || bannerContainer == null) return;
                adLoaded = true;
                adRetriesScheduled = 0;
                adError = null;
                if (desiredVisible && foreground && consentInformation.canRequestAds()) {
                    adView.resume();
                    bannerContainer.setVisibility(View.VISIBLE);
                    bannerVisible = true;
                }
            }

            @Override
            public void onAdFailedToLoad(LoadAdError error) {
                if (destroyed || adView != requestedAdView || bannerContainer == null) return;
                adLoaded = false;
                adError = error.getCode() + ": " + error.getMessage();
                bannerVisible = false;
                bannerContainer.setVisibility(View.GONE);
                requestedAdView.destroy();
                adView = null;
                if (AdsPolicy.shouldRetryAdLoad(adRetriesScheduled, desiredVisible && foreground)) {
                    adRetriesScheduled++;
                    mainHandler.postDelayed(retryAdLoad, AD_RETRY_DELAY_MS);
                }
            }
        });
        bannerContainer.removeAllViews();
        bannerContainer.addView(requestedAdView, new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT));
        requestedAdView.loadAd(new AdRequest.Builder().build());
    }

    private void installBannerRow() {
        if (destroyed || bannerContainer != null) return;
        Activity activity = getActivity();
        ViewGroup content = activity.findViewById(android.R.id.content);
        if (content == null || content.getChildCount() == 0) return;
        View appRoot = content.getChildAt(0);
        content.removeView(appRoot);

        LinearLayout shell = new LinearLayout(activity);
        shell.setOrientation(LinearLayout.VERTICAL);
        shell.addView(appRoot, new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f));
        bannerContainer = new FrameLayout(activity);
        bannerContainer.setVisibility(View.GONE);
        bannerContainer.addOnLayoutChangeListener((view, left, top, right, bottom,
                                                    oldLeft, oldTop, oldRight, oldBottom) -> {
            int width = right - left;
            int oldWidth = oldRight - oldLeft;
            int threshold = (int) (24 * activity.getResources().getDisplayMetrics().density);
            if (adView != null && width > 0 && oldWidth > 0 && Math.abs(width - oldWidth) > threshold) {
                adView.destroy();
                adView = null;
                adLoaded = false;
                bannerVisible = false;
                ensureBannerLoaded();
            }
        });
        shell.addView(bannerContainer, new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT));
        content.addView(shell, new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT));
    }

    private JSObject status() {
        boolean canRequestAds = consentInformation != null && consentInformation.canRequestAds();
        boolean privacyRequired = consentInformation != null &&
            consentInformation.getPrivacyOptionsRequirementStatus()
                == ConsentInformation.PrivacyOptionsRequirementStatus.REQUIRED;
        JSObject result = new JSObject()
            .put("platform", "android")
            .put("initialized", sdkInitialized)
            .put("canRequestAds", canRequestAds)
            .put("bannerVisible", bannerVisible)
            .put("privacyOptionsRequired", privacyRequired)
            .put("usingTestAds", !BuildConfig.PURRFECT_ADS_PRODUCTION);
        if (consentError != null) result.put("consentError", consentError);
        if (adError != null) result.put("adError", adError);
        return result;
    }

    private void resolvePendingInitializationCalls() {
        JSObject result = status();
        for (PluginCall pending : pendingInitializationCalls) pending.resolve(result);
        pendingInitializationCalls.clear();
    }

    private static String errorMessage(FormError error) {
        return error == null ? null : error.getErrorCode() + ": " + error.getMessage();
    }

    @Override
    protected void handleOnPause() {
        foreground = false;
        mainHandler.removeCallbacks(retryAdLoad);
        if (adView != null) adView.pause();
    }

    @Override
    protected void handleOnResume() {
        if (destroyed) return;
        foreground = true;
        if (consentInformation != null && !consentInformation.canRequestAds()) {
            destroyBanner();
        }
        if (sdkInitialized) {
            ensureBannerLoaded();
        } else if (initializeRequested && !consentUpdateStarted &&
                   AdsPolicy.shouldAttemptConsent(consentAttemptsStarted)) {
            requestConsentAndInitialize();
        }
    }

    @Override
    protected void handleOnDestroy() {
        destroyed = true;
        foreground = false;
        mainHandler.removeCallbacks(retryAdLoad);
        destroyBanner();
        adLoaded = false;
        bannerContainer = null;
        pendingInitializationCalls.clear();
    }

    private void destroyBanner() {
        bannerVisible = false;
        adLoaded = false;
        if (bannerContainer != null) {
            bannerContainer.setVisibility(View.GONE);
            bannerContainer.removeAllViews();
        }
        if (adView != null) {
            adView.destroy();
            adView = null;
        }
    }
}
