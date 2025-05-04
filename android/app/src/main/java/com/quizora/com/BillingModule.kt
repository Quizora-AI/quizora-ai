
package com.quizora.com

import android.util.Log
import com.android.billingclient.api.*
import com.facebook.react.bridge.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class BillingModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val TAG = "BillingModule"
    private var billingClient: BillingClient? = null
    private val coroutineScope = CoroutineScope(Dispatchers.Main)
    
    override fun getName(): String {
        return "BillingModule"
    }
    
    @ReactMethod
    fun initializeBilling(promise: Promise) {
        Log.d(TAG, "Initializing Google Play Billing")
        
        if (billingClient != null) {
            promise.resolve(true)
            return
        }
        
        billingClient = BillingClient.newBuilder(reactApplicationContext)
            .setListener { billingResult, purchases ->
                if (billingResult.responseCode == BillingClient.BillingResponseCode.OK && purchases != null) {
                    for (purchase in purchases) {
                        handlePurchase(purchase)
                    }
                }
            }
            .enablePendingPurchases()
            .build()
            
        billingClient?.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(billingResult: BillingResult) {
                if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                    Log.d(TAG, "Billing client setup finished successfully")
                    // Query existing purchases when connection is established
                    queryPurchases()
                    promise.resolve(true)
                } else {
                    Log.e(TAG, "Billing client setup failed: ${billingResult.debugMessage}")
                    promise.reject("BILLING_ERROR", "Billing client setup failed: ${billingResult.debugMessage}")
                }
            }
            
            override fun onBillingServiceDisconnected() {
                Log.d(TAG, "Billing service disconnected")
            }
        })
    }
    
    @ReactMethod
    fun queryProducts(skuType: String, skusList: ReadableArray, promise: Promise) {
        Log.d(TAG, "Querying products of type: $skuType")
        
        if (billingClient == null || billingClient?.isReady != true) {
            promise.reject("BILLING_ERROR", "Billing client is not ready")
            return
        }
        
        val productIds = ArrayList<String>()
        for (i in 0 until skusList.size()) {
            productIds.add(skusList.getString(i))
        }
        
        val productType = when (skuType) {
            BillingClient.ProductType.SUBS -> ProductType.SUBS
            else -> ProductType.INAPP
        }
        
        val productList = productIds.map { 
            QueryProductDetailsParams.Product.newBuilder()
                .setProductId(it)
                .setProductType(productType)
                .build()
        }
        
        val params = QueryProductDetailsParams.newBuilder()
            .setProductList(productList)
            .build()
        
        coroutineScope.launch {
            try {
                val result = withContext(Dispatchers.IO) {
                    billingClient?.queryProductDetailsAsync(params) { billingResult, productDetailsList ->
                        if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                            Log.d(TAG, "Product details query successful: ${productDetailsList.size} items")
                            
                            val productsMap = Arguments.createMap()
                            val productsArray = Arguments.createArray()
                            
                            for (productDetails in productDetailsList) {
                                val productMap = Arguments.createMap()
                                productMap.putString("productId", productDetails.productId)
                                productMap.putString("title", productDetails.title)
                                productMap.putString("description", productDetails.description)
                                productMap.putString("type", productDetails.productType)
                                
                                // Handle subscription offers
                                if (productDetails.productType == BillingClient.ProductType.SUBS) {
                                    val subscriptionOfferDetails = productDetails.subscriptionOfferDetails
                                    if (subscriptionOfferDetails != null && subscriptionOfferDetails.isNotEmpty()) {
                                        val offerDetails = subscriptionOfferDetails[0]
                                        val pricingPhases = offerDetails.pricingPhases.pricingPhaseList
                                        
                                        if (pricingPhases.isNotEmpty()) {
                                            val pricingPhase = pricingPhases[0]
                                            productMap.putString("price", pricingPhase.formattedPrice)
                                            productMap.putString("priceCurrencyCode", pricingPhase.priceCurrencyCode)
                                            productMap.putDouble("priceAmountMicros", pricingPhase.priceAmountMicros.toDouble())
                                        }
                                    }
                                } else {
                                    // Handle one-time product pricing
                                    val oneTimePurchaseOfferDetails = productDetails.oneTimePurchaseOfferDetails
                                    if (oneTimePurchaseOfferDetails != null) {
                                        productMap.putString("price", oneTimePurchaseOfferDetails.formattedPrice)
                                        productMap.putString("priceCurrencyCode", oneTimePurchaseOfferDetails.priceCurrencyCode)
                                        productMap.putDouble("priceAmountMicros", oneTimePurchaseOfferDetails.priceAmountMicros.toDouble())
                                    }
                                }
                                
                                productsArray.pushMap(productMap)
                            }
                            
                            productsMap.putArray("products", productsArray)
                            promise.resolve(productsMap)
                        } else {
                            Log.e(TAG, "Failed to query product details: ${billingResult.debugMessage}")
                            promise.reject("BILLING_ERROR", "Failed to query product details: ${billingResult.debugMessage}")
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error querying products", e)
                promise.reject("BILLING_ERROR", "Error querying products: ${e.message}")
            }
        }
    }
    
    @ReactMethod
    fun purchaseProduct(productId: String, productType: String, promise: Promise) {
        Log.d(TAG, "Attempting to purchase product: $productId of type: $productType")
        
        if (billingClient == null || billingClient?.isReady != true) {
            promise.reject("BILLING_ERROR", "Billing client is not ready")
            return
        }
        
        val type = if (productType == "subs") ProductType.SUBS else ProductType.INAPP
        
        // First query the product details
        val productList = listOf(
            QueryProductDetailsParams.Product.newBuilder()
                .setProductId(productId)
                .setProductType(type)
                .build()
        )
        
        val params = QueryProductDetailsParams.newBuilder()
            .setProductList(productList)
            .build()
        
        billingClient?.queryProductDetailsAsync(params) { billingResult, productDetailsList ->
            if (billingResult.responseCode == BillingClient.BillingResponseCode.OK && productDetailsList.isNotEmpty()) {
                val productDetails = productDetailsList[0]
                
                // Create a purchase flow builder
                val builder = BillingFlowParams.newBuilder()
                
                // Handle different product types
                if (type == ProductType.SUBS) {
                    val offers = productDetails.subscriptionOfferDetails
                    if (offers != null && offers.isNotEmpty()) {
                        val offerToken = offers[0].offerToken
                        
                        val productDetailsParams = BillingFlowParams.ProductDetailsParams.newBuilder()
                            .setProductDetails(productDetails)
                            .setOfferToken(offerToken)
                            .build()
                            
                        builder.setProductDetailsParamsList(listOf(productDetailsParams))
                    } else {
                        promise.reject("BILLING_ERROR", "No subscription offers available for this product")
                        return@queryProductDetailsAsync
                    }
                } else {
                    // For one-time purchases
                    val productDetailsParams = BillingFlowParams.ProductDetailsParams.newBuilder()
                        .setProductDetails(productDetails)
                        .build()
                        
                    builder.setProductDetailsParamsList(listOf(productDetailsParams))
                }
                
                // Launch the purchase flow
                val billingFlowParams = builder.build()
                val launchResult = billingClient?.launchBillingFlow(currentActivity!!, billingFlowParams)
                
                if (launchResult?.responseCode == BillingClient.BillingResponseCode.OK) {
                    Log.d(TAG, "Billing flow launched successfully")
                    // The result will be handled in PurchasesUpdatedListener
                    promise.resolve(true)
                } else {
                    Log.e(TAG, "Failed to launch billing flow: ${launchResult?.debugMessage}")
                    promise.reject("BILLING_ERROR", "Failed to launch billing flow: ${launchResult?.debugMessage}")
                }
            } else {
                Log.e(TAG, "Failed to get product details for purchase: ${billingResult.debugMessage}")
                promise.reject("BILLING_ERROR", "Failed to get product details for purchase: ${billingResult.debugMessage}")
            }
        }
    }
    
    @ReactMethod
    fun queryPurchases(promise: Promise? = null) {
        Log.d(TAG, "Querying purchases")
        
        if (billingClient == null || billingClient?.isReady != true) {
            promise?.reject("BILLING_ERROR", "Billing client is not ready")
            return
        }
        
        // Query subscriptions
        coroutineScope.launch {
            try {
                val purchasesResult = withContext(Dispatchers.IO) {
                    billingClient?.queryPurchasesAsync(
                        QueryPurchasesParams.newBuilder()
                            .setProductType(BillingClient.ProductType.SUBS)
                            .build()
                    )
                }
                
                if (purchasesResult?.billingResult?.responseCode == BillingClient.BillingResponseCode.OK) {
                    for (purchase in purchasesResult.purchasesList) {
                        handlePurchase(purchase)
                    }
                    
                    // Query in-app purchases
                    val inAppPurchasesResult = withContext(Dispatchers.IO) {
                        billingClient?.queryPurchasesAsync(
                            QueryPurchasesParams.newBuilder()
                                .setProductType(BillingClient.ProductType.INAPP)
                                .build()
                        )
                    }
                    
                    if (inAppPurchasesResult?.billingResult?.responseCode == BillingClient.BillingResponseCode.OK) {
                        for (purchase in inAppPurchasesResult.purchasesList) {
                            handlePurchase(purchase)
                        }
                        
                        // Combine results
                        val allPurchases = Arguments.createArray()
                        val purchases = purchasesResult.purchasesList + inAppPurchasesResult.purchasesList
                        
                        for (purchase in purchases) {
                            val purchaseMap = Arguments.createMap()
                            purchaseMap.putString("orderId", purchase.orderId)
                            purchaseMap.putString("packageName", purchase.packageName)
                            purchaseMap.putString("productId", purchase.products[0])
                            purchaseMap.putInt("purchaseState", purchase.purchaseState)
                            purchaseMap.putString("purchaseTime", purchase.purchaseTime.toString())
                            purchaseMap.putString("purchaseToken", purchase.purchaseToken)
                            
                            allPurchases.pushMap(purchaseMap)
                        }
                        
                        val result = Arguments.createMap()
                        result.putArray("purchases", allPurchases)
                        promise?.resolve(result)
                    } else {
                        promise?.reject("BILLING_ERROR", "Failed to query in-app purchases: ${inAppPurchasesResult?.billingResult?.debugMessage}")
                    }
                } else {
                    promise?.reject("BILLING_ERROR", "Failed to query subscription purchases: ${purchasesResult?.billingResult?.debugMessage}")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error querying purchases", e)
                promise?.reject("BILLING_ERROR", "Error querying purchases: ${e.message}")
            }
        }
    }
    
    private fun handlePurchase(purchase: Purchase) {
        Log.d(TAG, "Handling purchase: ${purchase.products[0]}")
        
        // Verify purchase state
        if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
            // Check if purchase is acknowledged
            if (!purchase.isAcknowledged) {
                val acknowledgePurchaseParams = AcknowledgePurchaseParams.newBuilder()
                    .setPurchaseToken(purchase.purchaseToken)
                    .build()
                
                billingClient?.acknowledgePurchase(acknowledgePurchaseParams) { billingResult ->
                    if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                        Log.d(TAG, "Purchase acknowledged successfully")
                        sendPurchaseEvent(purchase)
                    } else {
                        Log.e(TAG, "Failed to acknowledge purchase: ${billingResult.debugMessage}")
                    }
                }
            } else {
                // Already acknowledged, just send the event
                sendPurchaseEvent(purchase)
            }
        }
    }
    
    private fun sendPurchaseEvent(purchase: Purchase) {
        val params = Arguments.createMap()
        params.putString("productId", purchase.products[0])
        params.putString("purchaseToken", purchase.purchaseToken)
        params.putString("orderId", purchase.orderId)
        params.putInt("purchaseState", purchase.purchaseState)
        
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("PurchaseUpdated", params)
    }
    
    @ReactMethod
    fun addListener(eventName: String) {
        // Required for RN built in Event Emitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for RN built in Event Emitter
    }
}
