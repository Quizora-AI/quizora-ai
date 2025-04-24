
var exec = require('cordova/exec');

var PlayBilling = {
    /**
     * Connect to the billing service
     * @param {function} successCallback - Success callback
     * @param {function} errorCallback - Error callback
     */
    connect: function(successCallback, errorCallback) {
        exec(successCallback, errorCallback, 'PlayBillingPlugin', 'connect', []);
    },
    
    /**
     * Query available products
     * @param {function} successCallback - Success callback with product details
     * @param {function} errorCallback - Error callback
     */
    queryProducts: function(successCallback, errorCallback) {
        exec(successCallback, errorCallback, 'PlayBillingPlugin', 'queryProducts', []);
    },
    
    /**
     * Purchase a product
     * @param {string} productId - The product ID to purchase
     * @param {function} successCallback - Success callback with purchase details
     * @param {function} errorCallback - Error callback
     */
    purchase: function(productId, successCallback, errorCallback) {
        exec(successCallback, errorCallback, 'PlayBillingPlugin', 'purchase', [productId]);
    },
    
    /**
     * Restore previous purchases
     * @param {function} successCallback - Success callback with purchase details
     * @param {function} errorCallback - Error callback
     */
    restorePurchases: function(successCallback, errorCallback) {
        exec(successCallback, errorCallback, 'PlayBillingPlugin', 'restorePurchases', []);
    }
};

module.exports = PlayBilling;
