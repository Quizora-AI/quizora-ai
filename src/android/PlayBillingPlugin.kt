
package com.quizora.ai.billing

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.util.Log
import com.android.billingclient.api.*
import org.apache.cordova.CallbackContext
import org.apache.cordova.CordovaInterface
import org.apache.cordova.CordovaPlugin
import org.apache.cordova.CordovaWebView
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject
import java.util.concurrent.atomic.AtomicBoolean

class PlayBillingPlugin : CordovaPlugin(), PurchasesUpdatedListener {
    private lateinit var billingClient: BillingClient
    private var productDetailsMap = HashMap<String, ProductDetails>()
    private var isServiceConnected = AtomicBoolean(false)
    private var connectionInProgress = AtomicBoolean(false)
    private val TAG = "PlayBillingPlugin"
    
    // Callback contexts
    private var purchaseCallbackContext: CallbackContext? = null
    private var connectCallbackContext: CallbackContext? = null
    private var queryCallbackContext: CallbackContext? = null
    
    // Product IDs from your configuration
    private val monthlySubId = "monthly_subscription"
    private val yearlySubId = "yearly_subscription"

    override fun initialize(cordova: CordovaInterface, webView: CordovaWebView) {
        super.initialize(cordova, webView)
        Log.d(TAG, "Initializing PlayBillingPlugin")
        setupBillingClient()
        
        // Immediately open BillingActivity once to help Google Play detect billing integration
        val intent = Intent(cordova.activity, BillingActivity::class.java)
        intent.putExtra("DETECT_ONLY", true) // Flag to indicate this is just for detection
        cordova.activity.startActivityForResult(intent, DETECT_REQUEST_CODE)
        Log.d(TAG, "Launched BillingActivity for detection")
    }

    override fun execute(action: String, args: JSONArray, callbackContext: CallbackContext): Boolean {
        return when (action) {
            "connect" -> {
                connectCallbackContext = callbackContext
                connectToPlayBilling(callbackContext)
                true
            }
            "queryProducts" -> {
                queryCallbackContext = callbackContext
                queryProductDetails()
                true
            }
            "purchase" -> {
                val productId = args.getString(0)
                purchaseCallbackContext = callbackContext
                launchPurchaseFlow(productId)
                true
            }
            "restorePurchases" -> {
                restorePurchases(callbackContext)
                true
            }
            else -> false
        }
    }

    private fun setupBillingClient() {
        val context = cordova.activity.applicationContext
        billingClient = BillingClient.newBuilder(context)
            .setListener(this)
            .enablePendingPurchases()
            .build()
    }

    private fun connectToPlayBilling(callbackContext: CallbackContext) {
        if (billingClient.isReady) {
            Log.d(TAG, "BillingClient is ready")
            callbackContext.success("BillingClient is ready")
            return
        }

        if (connectionInProgress.getAndSet(true)) {
            Log.d(TAG, "Connection attempt already in progress")
            return
        }

        Log.d(TAG, "Starting billing client connection")
        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(billingResult: BillingResult) {
                connectionInProgress.set(false)
                
                if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                    isServiceConnected.set(true)
                    Log.d(TAG, "Billing client connected")
                    callbackContext.success("Billing client connected")
                    queryProductDetails()
                } else {
                    Log.e(TAG, "Failed to connect to billing client: ${billingResult.debugMessage}")
                    callbackContext.error("Failed to connect: ${billingResult.debugMessage}")
                }
            }

            override fun onBillingServiceDisconnected() {
                isServiceConnected.set(false)
                Log.d(TAG, "Billing service disconnected")
            }
        })
    }

    private fun queryProductDetails() {
        if (!billingClient.isReady) {
            Log.e(TAG, "BillingClient is not ready")
            queryCallbackContext?.error("BillingClient is not ready")
            return
        }

        val productIds = listOf(monthlySubId, yearlySubId)
        val params = QueryProductDetailsParams.newBuilder()
            .setProductList(
                productIds.map { productId ->
                    QueryProductDetailsParams.Product.newBuilder()
                        .setProductId(productId)
                        .setProductType(BillingClient.ProductType.SUBS)
                        .build()
                }
            )
            .build()

        billingClient.queryProductDetailsAsync(params) { billingResult, productDetailsList ->
            if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                if (productDetailsList.isEmpty()) {
                    Log.w(TAG, "No product details found for: $productIds")
                    queryCallbackContext?.error("No product details found")
                    return@queryProductDetailsAsync
                }

                productDetailsMap.clear()
                val productsJSON = JSONArray()

                for (productDetails in productDetailsList) {
                    productDetailsMap[productDetails.productId] = productDetails
                    val productJSON = JSONObject()
                    productJSON.put("productId", productDetails.productId)
                    productJSON.put("title", productDetails.title)
                    productJSON.put("description", productDetails.description)
                    
                    val offerJSON = JSONArray()
                    for (offer in productDetails.subscriptionOfferDetails ?: listOf()) {
                        val pricingPhases = offer.pricingPhases.pricingPhaseList
                        if (pricingPhases.isNotEmpty()) {
                            val pricing = pricingPhases[0]
                            val offerDetails = JSONObject()
                            offerDetails.put("offerId", offer.offerToken)
                            offerDetails.put("formattedPrice", pricing.formattedPrice)
                            offerDetails.put("priceAmountMicros", pricing.priceAmountMicros)
                            offerDetails.put("currencyCode", pricing.priceCurrencyCode)
                            offerDetails.put("billingPeriod", pricing.billingPeriod)
                            offerJSON.put(offerDetails)
                        }
                    }
                    productJSON.put("offers", offerJSON)
                    productsJSON.put(productJSON)
                }

                Log.d(TAG, "Successfully retrieved product details: $productsJSON")
                queryCallbackContext?.success(productsJSON)
            } else {
                Log.e(TAG, "Failed to query product details: ${billingResult.debugMessage}")
                queryCallbackContext?.error("Failed to query product details: ${billingResult.debugMessage}")
            }
        }
    }

    private fun launchPurchaseFlow(productId: String) {
        if (!billingClient.isReady) {
            Log.e(TAG, "BillingClient is not ready")
            purchaseCallbackContext?.error("BillingClient is not ready")
            return
        }

        val intent = Intent(cordova.activity, BillingActivity::class.java)
        cordova.startActivityForResult(this, intent, PURCHASE_REQUEST_CODE)
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == PURCHASE_REQUEST_CODE) {
            if (resultCode == Activity.RESULT_OK) {
                // Purchase was successful
                queryProductDetails() // Refresh products
                purchaseCallbackContext?.success("Purchase completed successfully")
            } else {
                purchaseCallbackContext?.error("Purchase was cancelled or failed")
            }
        }
    }

    override fun onPurchasesUpdated(billingResult: BillingResult, purchases: MutableList<Purchase>?) {
        if (billingResult.responseCode == BillingClient.BillingResponseCode.OK && purchases != null) {
            for (purchase in purchases) {
                handlePurchase(purchase)
            }
        } else {
            Log.e(TAG, "Purchase failed: ${billingResult.debugMessage}")
            purchaseCallbackContext?.error("Purchase failed: ${billingResult.debugMessage}")
        }
    }

    private fun handlePurchase(purchase: Purchase) {
        if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
            // Acknowledge the purchase if it hasn't been acknowledged yet
            if (!purchase.isAcknowledged) {
                val acknowledgePurchaseParams = AcknowledgePurchaseParams.newBuilder()
                    .setPurchaseToken(purchase.purchaseToken)
                    .build()
                
                billingClient.acknowledgePurchase(acknowledgePurchaseParams) { billingResult ->
                    if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                        Log.d(TAG, "Purchase acknowledged")
                    } else {
                        Log.e(TAG, "Failed to acknowledge purchase: ${billingResult.debugMessage}")
                    }
                }
            }

            // Send purchase details to JavaScript
            val purchaseData = JSONObject()
            try {
                purchaseData.put("productId", purchase.products[0])
                purchaseData.put("orderId", purchase.orderId)
                purchaseData.put("purchaseToken", purchase.purchaseToken)
                purchaseData.put("purchaseTime", purchase.purchaseTime)
                purchaseData.put("isAutoRenewing", purchase.isAutoRenewing)
                
                Log.d(TAG, "Purchase completed successfully: $purchaseData")
                purchaseCallbackContext?.success(purchaseData)
            } catch (e: JSONException) {
                Log.e(TAG, "Error creating JSON object: ${e.message}")
                purchaseCallbackContext?.error("Error processing purchase data")
            }
        }
    }

    private fun restorePurchases(callbackContext: CallbackContext) {
        if (!billingClient.isReady) {
            callbackContext.error("BillingClient is not ready")
            return
        }

        val params = QueryPurchasesParams.newBuilder()
            .setProductType(BillingClient.ProductType.SUBS)
            .build()
            
        billingClient.queryPurchasesAsync(params) { billingResult, purchasesList ->
            if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                if (purchasesList.isEmpty()) {
                    callbackContext.success(JSONArray())
                    return@queryPurchasesAsync
                }

                val purchases = JSONArray()
                for (purchase in purchasesList) {
                    if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
                        val purchaseData = JSONObject()
                        try {
                            purchaseData.put("productId", purchase.products[0])
                            purchaseData.put("orderId", purchase.orderId)
                            purchaseData.put("purchaseToken", purchase.purchaseToken)
                            purchaseData.put("purchaseTime", purchase.purchaseTime)
                            purchaseData.put("isAutoRenewing", purchase.isAutoRenewing)
                            purchases.put(purchaseData)
                        } catch (e: JSONException) {
                            Log.e(TAG, "Error creating JSON object: ${e.message}")
                        }
                    }
                }
                callbackContext.success(purchases)
            } else {
                callbackContext.error("Failed to query purchases: ${billingResult.debugMessage}")
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        if (billingClient.isReady) {
            billingClient.endConnection()
            isServiceConnected.set(false)
        }
    }

    companion object {
        private const val PURCHASE_REQUEST_CODE = 1001
        private const val DETECT_REQUEST_CODE = 1002
    }
}
