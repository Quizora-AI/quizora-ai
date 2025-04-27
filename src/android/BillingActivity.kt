
package com.quizora.ai.billing

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.android.billingclient.api.*

class BillingActivity : Activity(), PurchasesUpdatedListener {
    private lateinit var billingClient: BillingClient
    private val TAG = "BillingActivity"
    private var productId: String? = null
    private var isDetectOnly = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        isDetectOnly = intent.getBooleanExtra("DETECT_ONLY", false)
        productId = intent.getStringExtra("PRODUCT_ID")
        
        Log.d(TAG, "BillingActivity started, detect only: $isDetectOnly, productId: $productId")

        billingClient = BillingClient.newBuilder(this)
            .setListener(this)
            .enablePendingPurchases()
            .build()

        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(billingResult: BillingResult) {
                if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                    Log.d(TAG, "Billing client connected successfully")
                    
                    if (isDetectOnly) {
                        // Just query products and finish for detection
                        queryAvailableProducts()
                        Handler(Looper.getMainLooper()).postDelayed({
                            finish()
                        }, 2000)
                    } else if (productId != null) {
                        // Launch purchase flow for the specified product
                        launchPurchaseFlow(productId!!)
                    } else {
                        // No product ID provided, just query products
                        queryAvailableProducts()
                    }
                } else {
                    Log.e(TAG, "Billing client setup failed: ${billingResult.debugMessage}")
                    setResult(RESULT_CANCELED)
                    finish()
                }
            }

            override fun onBillingServiceDisconnected() {
                Log.w(TAG, "Billing service disconnected")
            }
        })
    }

    private fun queryAvailableProducts() {
        val params = QueryProductDetailsParams.newBuilder()
            .setProductList(
                listOf(
                    QueryProductDetailsParams.Product.newBuilder()
                        .setProductId("monthly_subscription")
                        .setProductType(BillingClient.ProductType.SUBS)
                        .build(),
                    QueryProductDetailsParams.Product.newBuilder()
                        .setProductId("yearly_subscription")
                        .setProductType(BillingClient.ProductType.SUBS)
                        .build()
                )
            )
            .build()

        billingClient.queryProductDetailsAsync(params) { billingResult, productDetailsList ->
            if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                Log.d(TAG, "Products retrieved successfully: ${productDetailsList.size}")
                for (product in productDetailsList) {
                    Log.d(TAG, "Product: ${product.productId}")
                }
            } else {
                Log.e(TAG, "Failed to query products: ${billingResult.debugMessage}")
            }
        }
    }
    
    private fun launchPurchaseFlow(productId: String) {
        val params = QueryProductDetailsParams.newBuilder()
            .setProductList(
                listOf(
                    QueryProductDetailsParams.Product.newBuilder()
                        .setProductId(productId)
                        .setProductType(BillingClient.ProductType.SUBS)
                        .build()
                )
            )
            .build()
            
        billingClient.queryProductDetailsAsync(params) { billingResult, productDetailsList ->
            if (billingResult.responseCode == BillingClient.BillingResponseCode.OK && productDetailsList.isNotEmpty()) {
                val productDetails = productDetailsList[0]
                val offerToken = productDetails.subscriptionOfferDetails?.get(0)?.offerToken
                
                if (offerToken != null) {
                    val purchaseParams = BillingFlowParams.newBuilder()
                        .setProductDetailsParamsList(
                            listOf(
                                BillingFlowParams.ProductDetailsParams.newBuilder()
                                    .setProductDetails(productDetails)
                                    .setOfferToken(offerToken)
                                    .build()
                            )
                        )
                        .build()
                        
                    Log.d(TAG, "Launching billing flow for product: $productId")
                    val result = billingClient.launchBillingFlow(this, purchaseParams)
                    
                    if (result.responseCode != BillingClient.BillingResponseCode.OK) {
                        Log.e(TAG, "Failed to launch billing flow: ${result.debugMessage}")
                        setResult(RESULT_CANCELED)
                        finish()
                    }
                } else {
                    Log.e(TAG, "No offer token found for product")
                    setResult(RESULT_CANCELED)
                    finish()
                }
            } else {
                Log.e(TAG, "Failed to query product details for purchase: ${billingResult.debugMessage}")
                setResult(RESULT_CANCELED)
                finish()
            }
        }
    }

    override fun onPurchasesUpdated(billingResult: BillingResult, purchases: MutableList<Purchase>?) {
        if (billingResult.responseCode == BillingClient.BillingResponseCode.OK && purchases != null) {
            for (purchase in purchases) {
                handlePurchase(purchase)
            }
        } else if (billingResult.responseCode == BillingClient.BillingResponseCode.USER_CANCELED) {
            Log.i(TAG, "User canceled the purchase")
            setResult(RESULT_CANCELED)
            finish()
        } else {
            Log.e(TAG, "Purchase failed: ${billingResult.debugMessage}")
            setResult(RESULT_CANCELED)
            finish()
        }
    }

    private fun handlePurchase(purchase: Purchase) {
        if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
            // Verify the purchase
            if (!purchase.isAcknowledged) {
                val acknowledgePurchaseParams = AcknowledgePurchaseParams.newBuilder()
                    .setPurchaseToken(purchase.purchaseToken)
                    .build()
                
                billingClient.acknowledgePurchase(acknowledgePurchaseParams) { billingResult ->
                    if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                        Log.d(TAG, "Purchase acknowledged")
                        // Notify the app about successful premium activation
                        setResult(RESULT_OK)
                        finish()
                    } else {
                        Log.e(TAG, "Failed to acknowledge purchase: ${billingResult.debugMessage}")
                        setResult(RESULT_CANCELED)
                        finish()
                    }
                }
            } else {
                Log.d(TAG, "Purchase already acknowledged")
                setResult(RESULT_OK)
                finish()
            }
        } else {
            Log.d(TAG, "Purchase not in PURCHASED state: ${purchase.purchaseState}")
            setResult(RESULT_CANCELED)
            finish()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        if (billingClient.isReady) {
            billingClient.endConnection()
        }
    }
}
