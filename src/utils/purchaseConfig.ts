
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
    formattedPrice: '$2.49',
    billingPeriod: 'P1M',
    duration: 'P1M'
  },
  [SUBSCRIPTION_PRODUCTS.YEARLY]: {
    amount: 15.00,
    currency: 'USD',
    formattedPrice: '$15.00',
    billingPeriod: 'P1Y',
    duration: 'P1Y'
  },
};

/**
 * Helper to determine the subscription tier from a product ID
 */
export function getSubscriptionTierFromProductId(productId: string): SubscriptionTier {
  if (productId.includes('yearly')) return 'yearly';
  return 'monthly';
}

// Google Play specific subscription configurations
export const SUBSCRIPTION_CONFIG = {
  TRIAL_PERIOD: 'P7D', // 7-day free trial
  GRACE_PERIOD: 'P3D', // 3-day grace period
  PRORATION_MODE: 1, // IMMEDIATE_WITH_TIME_PRORATION
  REPLACEMENT_MODE: 1, // WITH_TIME_PRORATION
};
