
package com.quizora.ai.billing

import android.app.Activity
import android.os.Bundle
import com.android.billingclient.api.*

class BillingActivity : Activity(), PurchasesUpdatedListener {
    private lateinit var billingClient: BillingClient

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        billingClient = BillingClient.newBuilder(this)
            .setListener(this)
            .enablePendingPurchases()
            .build()

        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(billingResult: BillingResult) {
                if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                    queryAvailableProducts()
                }
            }

            override fun onBillingServiceDisconnected() {
                // Handle reconnecting
            }
        })
    }

    private fun queryAvailableProducts() {
        val skuList = ArrayList<String>()
        skuList.add("monthly_subscription") // Using our actual subscription ID
        skuList.add("yearly_subscription")  // Using our actual subscription ID
        
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
            // No need to do anything for detection
        }
    }

    override fun onPurchasesUpdated(billingResult: BillingResult, purchases: MutableList<Purchase>?) {
        // Optional: Handle purchases
    }
}
