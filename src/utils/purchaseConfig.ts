
/**
 * Subscription product IDs used throughout the app
 * These must match exactly with the product IDs configured in:
 * 1. Google Play Console
 * 2. App Store Connect
 * 3. cordova-config.xml
 */

export const SUBSCRIPTION_PRODUCTS = {
  MONTHLY: 'monthly_subscription',
  YEARLY: 'yearly_subscription',
} as const;

// Subscription tiers
export type SubscriptionTier = 'monthly' | 'yearly';

// Prices displayed in the app (these should match your Google Play Console prices)
export const SUBSCRIPTION_PRICES = {
  [SUBSCRIPTION_PRODUCTS.MONTHLY]: {
    amount: 2.49,
    currency: 'USD',
    formattedPrice: '$2.49'
  },
  [SUBSCRIPTION_PRODUCTS.YEARLY]: {
    amount: 15.00,
    currency: 'USD',
    formattedPrice: '$15.00'
  },
};

/**
 * Helper to determine the subscription tier from a product ID
 */
export function getSubscriptionTierFromProductId(productId: string): SubscriptionTier {
  if (productId.includes('yearly')) return 'yearly';
  return 'monthly';
}
