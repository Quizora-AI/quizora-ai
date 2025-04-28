
import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

// Check if we're running on a platform that supports billing
const BillingModule = Platform.OS === 'android' ? NativeModules.BillingModule : null;
const BillingEvents = BillingModule ? new NativeEventEmitter(BillingModule) : null;

/**
 * A service to handle in-app purchases and subscriptions
 */
export const BillingService = {
  /**
   * Initialize the billing client
   */
  initialize: async (): Promise<boolean> => {
    if (!BillingModule) {
      console.warn('Billing is not supported on this platform');
      return false;
    }
    
    try {
      console.log('Initializing billing service');
      return await BillingModule.initializeBilling();
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
    if (!BillingModule) {
      console.warn('Billing is not supported on this platform');
      return { products: [] };
    }
    
    try {
      console.log(`Getting ${productType} products:`, productIds);
      return await BillingModule.queryProducts(productType, productIds);
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
    if (!BillingModule) {
      console.warn('Billing is not supported on this platform');
      return false;
    }
    
    try {
      console.log(`Purchasing ${productType} product:`, productId);
      return await BillingModule.purchaseProduct(productId, productType);
    } catch (error) {
      console.error('Failed to purchase product:', error);
      return false;
    }
  },
  
  /**
   * Get active purchases
   */
  getPurchases: async () => {
    if (!BillingModule) {
      console.warn('Billing is not supported on this platform');
      return { purchases: [] };
    }
    
    try {
      console.log('Getting purchases');
      return await BillingModule.queryPurchases();
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
    if (!BillingEvents) {
      console.warn('Billing events are not supported on this platform');
      return { remove: () => {} };
    }
    
    return BillingEvents.addListener('PurchaseUpdated', callback);
  }
};

export default BillingService;
