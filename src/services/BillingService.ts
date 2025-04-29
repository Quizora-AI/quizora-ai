
/**
 * A service to handle in-app purchases and subscriptions
 * This service provides a unified interface for both web and mobile platforms
 */

// Determine if we're running in a Cordova environment
const isCordova = typeof window !== 'undefined' && 'cordova' in window;
const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

/**
 * A service to handle in-app purchases and subscriptions
 */
export const BillingService = {
  /**
   * Initialize the billing client
   */
  initialize: async (): Promise<boolean> => {
    if (!isCordova || !isMobile) {
      console.warn('Billing is not supported on this platform');
      return false;
    }
    
    try {
      console.log('Initializing billing service');
      
      return new Promise((resolve) => {
        // Access the native module through the window.cordova interface
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.PlayBilling) {
          window.cordova.plugins.PlayBilling.connect(
            () => {
              console.log('Billing service initialized successfully');
              resolve(true);
            },
            (error: string) => {
              console.error('Failed to initialize billing:', error);
              resolve(false);
            }
          );
        } else {
          console.warn('PlayBilling plugin not available');
          resolve(false);
        }
      });
    } catch (error) {
      console.error('Failed to initialize billing:', error);
      return false;
    }
  },
  
  /**
   * Get available products
   * @param productType 'inapp' or 'subs'
   * @param productIds list of product IDs to query
   */
  getProducts: async (productType: 'inapp' | 'subs', productIds: string[]) => {
    if (!isCordova || !isMobile) {
      console.warn('Billing is not supported on this platform');
      return { products: [] };
    }
    
    try {
      console.log(`Getting ${productType} products:`, productIds);
      
      return new Promise((resolve) => {
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.PlayBilling) {
          window.cordova.plugins.PlayBilling.queryProducts(
            (products: any) => {
              console.log('Products retrieved:', products);
              resolve({ products: products || [] });
            },
            (error: string) => {
              console.error('Failed to get products:', error);
              resolve({ products: [] });
            }
          );
        } else {
          console.warn('PlayBilling plugin not available');
          resolve({ products: [] });
        }
      });
    } catch (error) {
      console.error('Failed to get products:', error);
      return { products: [] };
    }
  },
  
  /**
   * Purchase a product
   * @param productId the product ID to purchase
   * @param productType 'inapp' or 'subs'
   */
  purchaseProduct: async (productId: string, productType: 'inapp' | 'subs') => {
    if (!isCordova || !isMobile) {
      console.warn('Billing is not supported on this platform');
      return false;
    }
    
    try {
      console.log(`Purchasing ${productType} product:`, productId);
      
      return new Promise((resolve) => {
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.PlayBilling) {
          window.cordova.plugins.PlayBilling.purchase(
            productId,
            (purchase: any) => {
              console.log('Purchase successful:', purchase);
              resolve(purchase);
            },
            (error: string) => {
              console.error('Failed to purchase product:', error);
              resolve(false);
            }
          );
        } else {
          console.warn('PlayBilling plugin not available');
          resolve(false);
        }
      });
    } catch (error) {
      console.error('Failed to purchase product:', error);
      return false;
    }
  },
  
  /**
   * Get active purchases
   */
  getPurchases: async () => {
    if (!isCordova || !isMobile) {
      console.warn('Billing is not supported on this platform');
      return { purchases: [] };
    }
    
    try {
      console.log('Getting purchases');
      
      return new Promise((resolve) => {
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.PlayBilling) {
          window.cordova.plugins.PlayBilling.restorePurchases(
            (purchases: any) => {
              console.log('Purchases retrieved:', purchases);
              resolve({ purchases: purchases || [] });
            },
            (error: string) => {
              console.error('Failed to get purchases:', error);
              resolve({ purchases: [] });
            }
          );
        } else {
          console.warn('PlayBilling plugin not available');
          resolve({ purchases: [] });
        }
      });
    } catch (error) {
      console.error('Failed to get purchases:', error);
      return { purchases: [] };
    }
  },
  
  /**
   * Add listener for purchase updates
   * @param callback function to call when a purchase is updated
   */
  addPurchaseListener: (callback: (purchase: any) => void) => {
    // Purchase event listeners are not directly supported in the Cordova plugin
    // This is a placeholder for future implementation if needed
    console.log('Purchase listeners not supported in this implementation');
    return {
      remove: () => {}
    };
  }
};

export default BillingService;
