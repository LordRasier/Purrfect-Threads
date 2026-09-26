package com.rasie.purrfectthreads;

import android.app.Activity;
import android.content.Context;
import com.android.billingclient.api.*;
import java.util.List;
import java.util.Collections;

/** One connection per live plugin; no client acknowledgement/consumption. */
final class CrewPlayClient {
    interface Result<T> { void done(T value, String outcome); }
    interface Updates { void received(List<Purchase> purchases, String outcome); }
    private final BillingClient client;
    CrewPlayClient(Context context, Updates updates) {
        client = BillingClient.newBuilder(context).setListener((result, purchases) ->
            updates.received(purchases, outcome(result)))
            .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
            .enableAutoServiceReconnection().build();
    }
    static String outcome(BillingResult result) {
        return switch (result.getResponseCode()) {
            case BillingClient.BillingResponseCode.OK -> "ok";
            case BillingClient.BillingResponseCode.USER_CANCELED -> "cancelled";
            case BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED -> "restore-required";
            default -> "unavailable";
        };
    }
    void connect(Result<Void> callback) {
        if (client.isReady()) { callback.done(null, "ok"); return; }
        client.startConnection(new BillingClientStateListener() {
            public void onBillingSetupFinished(BillingResult result) { callback.done(null, outcome(result)); }
            public void onBillingServiceDisconnected() { /* Automatic reconnection on the next request. */ }
        });
    }
    void purchases(Result<List<Purchase>> callback) {
        client.queryPurchasesAsync(QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.INAPP).build(),
            (result, purchases) -> callback.done(purchases, outcome(result)));
    }
    void product(Result<ProductDetails> callback) {
        client.queryProductDetailsAsync(QueryProductDetailsParams.newBuilder().setProductList(Collections.singletonList(
            QueryProductDetailsParams.Product.newBuilder().setProductId(BillingBackend.PRODUCT)
                .setProductType(BillingClient.ProductType.INAPP).build())).build(), (result, details) -> {
            ProductDetails product = details.getProductDetailsList().stream()
                .filter(item -> BillingBackend.PRODUCT.equals(item.getProductId())).findFirst().orElse(null);
            callback.done(product, product == null ? "unavailable" : outcome(result));
        });
    }
    static ProductDetails.OneTimePurchaseOfferDetails offer(ProductDetails product) {
        var offers = product.getOneTimePurchaseOfferDetailsList();
        // Only a regular buy option; never silently choose a rental/discounted alternative.
        return offers == null ? null : offers.stream().filter(item -> item.getOfferId() == null
            && item.getRentalDetails() == null).findFirst().orElse(null);
    }
    String launch(Activity activity, ProductDetails product, String account) {
        var offer = offer(product);
        if (offer == null || activity == null || activity.isFinishing() || activity.isDestroyed()) return "unavailable";
        var item = BillingFlowParams.ProductDetailsParams.newBuilder().setProductDetails(product)
            .setOfferToken(offer.getOfferToken()).build();
        return outcome(client.launchBillingFlow(activity, BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(Collections.singletonList(item)).setObfuscatedAccountId(account).build()));
    }
    void close() { client.endConnection(); }
}
