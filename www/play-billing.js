
var exec = require('cordova/exec');

var PlayBilling = {
    /**
     * Store reference for the cordova-plugin-purchase store
     */
    store: null,
    
    /**
     * Initialize the billing library and set up event handlers
     * @param {Array} subscriptionIds - Array of subscription product IDs
     * @param {function} successCallback - Success callback
     * @param {function} errorCallback - Error callback
     */
    initialize: function(subscriptionIds, successCallback, errorCallback) {
        try {
            // Check if cordova-plugin-purchase is available
            if (typeof window.store === 'undefined') {
                console.error('cordova-plugin-purchase not found');
                errorCallback('cordova-plugin-purchase plugin not found');
                return;
            }
            
            this.store = window.store;
            console.log('Setting up Play Billing...');
            
            // Register subscription products
            if (subscriptionIds && subscriptionIds.length > 0) {
                subscriptionIds.forEach(function(id) {
                    console.log('Registering subscription:', id);
                    this.store.register({
                        id: id,
                        type: this.store.PAID_SUBSCRIPTION
                    });
                }.bind(this));
            }
            
            // When a product is updated (loaded, approved, etc.)
            this.store.when('product').updated(function(product) {
                console.log('Product updated', product);
            });
            
            // When a product is approved (payment successful)
            this.store.when('product').approved(function(product) {
                console.log('Product approved, finishing purchase:', product.id);
                product.finish();
            });
            
            // When a product is owned (purchase finished)
            this.store.when('product').owned(function(product) {
                console.log('Product owned:', product.id);
                if (successCallback) {
                    successCallback({
                        productId: product.id,
                        state: 'purchased',
                        purchaseToken: product.transaction && product.transaction.purchaseToken
                    });
                }
            });
            
            // Error handling
            this.store.error(function(error) {
                console.error('Store error:', error);
                if (errorCallback) {
                    errorCallback(error.message || 'Unknown store error');
                }
            });
            
            // When store is ready, refresh product list
            this.store.ready(function() {
                console.log('Store ready, refreshing product list');
                this.store.refresh();
            }.bind(this));
            
            // Initialize the store
            console.log('Initializing store...');
            this.store.initialize();
            
        } catch (error) {
            console.error('Error initializing Play Billing:', error);
            if (errorCallback) {
                errorCallback(error.message || 'Unknown error initializing Play Billing');
            }
        }
    },
    
    /**
     * Query available products
     * @param {function} successCallback - Success callback with product details
     * @param {function} errorCallback - Error callback
     */
    queryProducts: function(successCallback, errorCallback) {
        try {
            if (!this.store) {
                errorCallback('PlayBilling not initialized');
                return;
            }
            
            console.log('Querying products...');
            this.store.refresh();
            
            // Wait a bit for products to load
            setTimeout(function() {
                var products = [];
                for (var id in this.store.products) {
                    var product = this.store.products[id];
                    products.push({
                        productId: product.id,
                        title: product.title,
                        description: product.description,
                        formattedPrice: product.price,
                        currency: product.currency,
                        billingPeriod: product.billingPeriod || 'P1M'
                    });
                }
                console.log('Products loaded:', products);
                successCallback(products);
            }.bind(this), 1000);
            
        } catch (error) {
            console.error('Error querying products:', error);
            errorCallback(error.message || 'Unknown error querying products');
        }
    },
    
    /**
     * Purchase a product
     * @param {string} productId - The product ID to purchase
     * @param {function} successCallback - Success callback with purchase details
     * @param {function} errorCallback - Error callback
     */
    purchase: function(productId, successCallback, errorCallback) {
        try {
            if (!this.store) {
                errorCallback('PlayBilling not initialized');
                return;
            }
            
            console.log('Purchasing product:', productId);
            
            // Set up event handlers for this specific purchase
            this.store.when(productId).approved(function(product) {
                console.log('Purchase approved:', product.id);
            });
            
            this.store.when(productId).owned(function(product) {
                console.log('Purchase finished:', product.id);
                successCallback({
                    productId: product.id,
                    state: 'purchased',
                    purchaseToken: product.transaction && product.transaction.purchaseToken,
                    purchaseTime: product.transaction && product.transaction.purchaseTime
                });
            });
            
            this.store.when(productId).cancelled(function() {
                console.log('Purchase cancelled:', productId);
                errorCallback('Purchase cancelled by user');
            });
            
            this.store.when(productId).error(function(error) {
                console.error('Purchase error:', error);
                errorCallback(error.message || 'Unknown purchase error');
            });
            
            // Start the purchase
            this.store.order(productId);
            
        } catch (error) {
            console.error('Error purchasing product:', error);
            errorCallback(error.message || 'Unknown error purchasing product');
        }
    },
    
    /**
     * Restore previous purchases
     * @param {function} successCallback - Success callback with purchase details
     * @param {function} errorCallback - Error callback
     */
    restorePurchases: function(successCallback, errorCallback) {
        try {
            if (!this.store) {
                errorCallback('PlayBilling not initialized');
                return;
            }
            
            console.log('Restoring purchases...');
            this.store.refresh();
            
            // Wait a bit for purchases to be restored
            setTimeout(function() {
                var purchases = [];
                for (var id in this.store.products) {
                    var product = this.store.products[id];
                    if (product.owned && !product.expired) {
                        purchases.push({
                            productId: product.id,
                            state: 'purchased',
                            purchaseToken: product.transaction && product.transaction.purchaseToken
                        });
                    }
                }
                console.log('Restored purchases:', purchases);
                successCallback(purchases);
            }.bind(this), 1000);
            
        } catch (error) {
            console.error('Error restoring purchases:', error);
            errorCallback(error.message || 'Unknown error restoring purchases');
        }
    },
    
    /**
     * Connect to the billing service (backward compatibility)
     * @param {function} successCallback - Success callback
     * @param {function} errorCallback - Error callback
     */
    connect: function(successCallback, errorCallback) {
        // This just checks if the store is available
        if (typeof window.store !== 'undefined') {
            successCallback();
        } else {
            errorCallback('cordova-plugin-purchase not found');
        }
    }
};

module.exports = PlayBilling;
