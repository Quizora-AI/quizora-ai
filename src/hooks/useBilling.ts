
import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { SUBSCRIPTION_PRODUCTS } from '@/utils/purchaseConfig';

interface BillingHook {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  products: any[];
  purchaseSubscription: (productId: string) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
}

export function useBilling(): BillingHook {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const { toast } = useToast();
  
  const hasNativeBilling = typeof window !== 'undefined' && 
    'cordova' in window && 
    'plugins' in (window as any) && 
    'PlayBilling' in (window as any).cordova.plugins;
  
  useEffect(() => {
    if (hasNativeBilling) {
      initializeBilling();
    } else {
      console.log('Native billing not available, running in web mode');
      setIsReady(true);
    }
  }, [hasNativeBilling]);
  
  const initializeBilling = useCallback(async () => {
    try {
      setIsLoading(true);
      const PlayBilling = (window as any).cordova.plugins.PlayBilling;
      
      // Connect to billing service
      PlayBilling.connect(
        () => {
          console.log('Connected to Play Billing');
          setIsReady(true);
          
          // Query available products
          PlayBilling.queryProducts(
            (productList: any[]) => {
              console.log('Products retrieved:', productList);
              setProducts(productList);
              setIsLoading(false);
            },
            (error: string) => {
              console.error('Error querying products:', error);
              setError('Failed to retrieve product information');
              setIsLoading(false);
            }
          );
        },
        (error: string) => {
          console.error('Error connecting to Play Billing:', error);
          setError('Failed to initialize billing service');
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error('Error initializing billing:', error);
      setError('Failed to initialize billing service');
      setIsLoading(false);
    }
  }, []);
  
  const purchaseSubscription = useCallback(async (productId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setIsLoading(true);
      setError(null);
      
      if (hasNativeBilling) {
        try {
          const PlayBilling = (window as any).cordova.plugins.PlayBilling;
          console.log(`Initiating purchase flow for: ${productId}`);
          
          PlayBilling.purchase(
            productId,
            (purchase: any) => {
              console.log('Purchase successful:', purchase);
              setIsLoading(false);
              toast({
                title: "Purchase Successful",
                description: "Your subscription is now active.",
                variant: "success",
              });
              resolve(true);
            },
            (error: string) => {
              console.error('Purchase failed:', error);
              setError(`Purchase failed: ${error}`);
              setIsLoading(false);
              toast({
                title: "Purchase Failed",
                description: error || "There was an error processing your purchase.",
                variant: "destructive"
              });
              resolve(false);
            }
          );
        } catch (error: any) {
          console.error('Error initiating purchase:', error);
          setError(error?.message || 'Purchase failed');
          setIsLoading(false);
          toast({
            title: "Purchase Error",
            description: "There was a problem initiating the purchase.",
            variant: "destructive"
          });
          resolve(false);
        }
      } else {
        // Web fallback for testing
        setTimeout(() => {
          const success = Math.random() > 0.2;
          
          if (success) {
            toast({
              title: "Purchase Successful (Demo)",
              description: "This is a simulated purchase for the web preview.",
              variant: "success",
            });
            setIsLoading(false);
            resolve(true);
          } else {
            setError('Simulated purchase failure');
            toast({
              title: "Purchase Failed (Demo)",
              description: "This is a simulated failure for the web preview.",
              variant: "destructive"
            });
            setIsLoading(false);
            resolve(false);
          }
        }, 1500);
      }
    });
  }, [hasNativeBilling, toast]);
  
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!hasNativeBilling) {
        toast({
          title: "Feature Unavailable",
          description: "This feature is only available on mobile devices.",
          variant: "default"
        });
        resolve(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        const PlayBilling = (window as any).cordova.plugins.PlayBilling;
        
        PlayBilling.restorePurchases(
          (purchases: any[]) => {
            console.log('Restored purchases:', purchases);
            setIsLoading(false);
            
            if (purchases.length > 0) {
              toast({
                title: "Purchases Restored",
                description: "Your subscription has been restored.",
                variant: "success",
              });
              resolve(true);
            } else {
              toast({
                title: "No Purchases Found",
                description: "No previous subscriptions were found.",
                variant: "default"
              });
              resolve(false);
            }
          },
          (error: string) => {
            console.error('Error restoring purchases:', error);
            setError(`Restore failed: ${error}`);
            setIsLoading(false);
            toast({
              title: "Restore Failed",
              description: "Failed to restore previous purchases.",
              variant: "destructive"
            });
            resolve(false);
          }
        );
      } catch (error: any) {
        console.error('Error restoring purchases:', error);
        setError(error?.message || 'Restore failed');
        setIsLoading(false);
        toast({
          title: "Restore Error",
          description: "There was a problem restoring purchases.",
          variant: "destructive"
        });
        resolve(false);
      }
    });
  }, [hasNativeBilling, toast]);
  
  return {
    isReady,
    isLoading,
    error,
    products,
    purchaseSubscription,
    restorePurchases
  };
}
