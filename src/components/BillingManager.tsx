
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SUBSCRIPTION_PRODUCTS, SUBSCRIPTION_PRICES } from "@/utils/purchaseConfig";

interface BillingManagerProps {
  userId?: string;
  isPremium: boolean;
  onPurchaseComplete: (productId: string) => void;
}

interface Product {
  productId: string;
  title: string;
  description: string;
  offers: Array<{
    offerId: string;
    formattedPrice: string;
    priceAmountMicros: number;
    currencyCode: string;
    billingPeriod: string;
  }>;
}

export function BillingManager({ userId, isPremium, onPurchaseComplete }: BillingManagerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();
  
  const hasNativePlugin = typeof window !== 'undefined' && 'cordova' in window && 
    'plugins' in (window as any) && 'PlayBilling' in (window as any).cordova.plugins;

  useEffect(() => {
    if (hasNativePlugin) {
      initializeBilling();
    }
  }, [hasNativePlugin]);
  
  const initializeBilling = async () => {
    try {
      const PlayBilling = (window as any).cordova.plugins.PlayBilling;
      
      console.log("Initializing billing client");
      
      // Connect to billing service
      PlayBilling.connect(
        () => {
          console.log('Connected to Play Billing');
          // Query available products
          queryProducts();
        },
        (error: string) => {
          console.error('Error connecting to Play Billing:', error);
          setError('Failed to initialize billing service');
        }
      );
    } catch (error) {
      console.error('Error initializing billing:', error);
      setError('Failed to initialize billing service');
    }
  };
  
  const queryProducts = () => {
    if (!hasNativePlugin) {
      console.log("Using mock products for web preview");
      setProducts([
        {
          productId: SUBSCRIPTION_PRODUCTS.MONTHLY,
          title: "Monthly Premium",
          description: "Quizora AI Monthly Premium Subscription",
          offers: [{
            offerId: "mock-monthly",
            formattedPrice: "$2.49",
            priceAmountMicros: 2490000,
            currencyCode: "USD",
            billingPeriod: "P1M"
          }]
        },
        {
          productId: SUBSCRIPTION_PRODUCTS.YEARLY,
          title: "Yearly Premium",
          description: "Quizora AI Yearly Premium Subscription",
          offers: [{
            offerId: "mock-yearly", 
            formattedPrice: "$15.00",
            priceAmountMicros: 15000000,
            currencyCode: "USD", 
            billingPeriod: "P1Y"
          }]
        }
      ]);
      return;
    }
    
    try {
      const PlayBilling = (window as any).cordova.plugins.PlayBilling;
      
      console.log("Querying available subscription products");
      PlayBilling.queryProducts(
        (productList: Product[]) => {
          console.log('Products retrieved:', productList);
          setProducts(productList);
        },
        (error: string) => {
          console.error('Error querying products:', error);
          setError('Failed to retrieve product information');
        }
      );
    } catch (error) {
      console.error('Error querying products:', error);
      setError('Failed to retrieve product information');
    }
  };
  
  const verifyPurchase = async (productId: string, purchaseToken: string) => {
    if (!userId) {
      setError('User must be logged in to make purchases');
      return;
    }
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('billing-init', {
        body: {
          userId,
          productId,
          purchaseToken
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: "Purchase Successful!",
        description: "Your premium subscription is now active.",
        variant: "success",
      });
      
      onPurchaseComplete(productId);
      setLoading(false);
    } catch (error) {
      console.error('Error verifying purchase:', error);
      setError('Failed to verify purchase');
      setLoading(false);
      
      toast({
        title: "Verification Failed",
        description: "There was an error verifying your purchase. Please contact support.",
        variant: "destructive"
      });
    }
  };
  
  const purchaseProduct = (productId: string) => {
    if (!userId) {
      toast({
        title: "Login Required",
        description: "Please log in to make a purchase",
        variant: "default"
      });
      return;
    }
    
    setLoading(true);
    setError(null);
    
    if (hasNativePlugin) {
      try {
        const PlayBilling = (window as any).cordova.plugins.PlayBilling;
        console.log(`Attempting to purchase product: ${productId}`);
        
        PlayBilling.purchase(
          productId,
          (purchase: any) => {
            console.log('Purchase successful:', purchase);
            verifyPurchase(purchase.productId, purchase.purchaseToken);
          },
          (error: string) => {
            console.error('Purchase failed:', error);
            setError('Purchase failed');
            setLoading(false);
            
            toast({
              title: "Purchase Failed",
              description: "There was an error processing your purchase.",
              variant: "destructive"
            });
          }
        );
      } catch (error) {
        console.error('Error purchasing product:', error);
        setError('Purchase failed');
        setLoading(false);
      }
    } else {
      // Web fallback for testing - always succeed for easier testing
      setTimeout(() => {
        // Force success for web testing
        const success = true;
        
        if (success) {
          toast({
            title: "Purchase Successful (Demo)",
            description: "This is a simulated purchase for the web preview.",
            variant: "success",
          });
          onPurchaseComplete(productId);
        } else {
          setError('Simulated purchase failure');
          toast({
            title: "Purchase Failed (Demo)",
            description: "This is a simulated failure for the web preview.",
            variant: "destructive"
          });
        }
        setLoading(false);
      }, 1500);
    }
  };
  
  const restorePurchases = () => {
    if (!hasNativePlugin) {
      toast({
        title: "Feature Unavailable",
        description: "This feature is only available on mobile devices.",
        variant: "default"
      });
      return;
    }
    
    try {
      const PlayBilling = (window as any).cordova.plugins.PlayBilling;
      setLoading(true);
      
      PlayBilling.restorePurchases(
        (purchases: any[]) => {
          console.log('Restored purchases:', purchases);
          if (purchases.length > 0) {
            // Find the most recent purchase
            const mostRecent = purchases.reduce((latest, current) => 
              current.purchaseTime > latest.purchaseTime ? current : latest, purchases[0]);
            
            verifyPurchase(mostRecent.productId, mostRecent.purchaseToken);
            
            toast({
              title: "Purchases Restored",
              description: "Your subscription has been restored.",
              variant: "success",
            });
          } else {
            toast({
              title: "No Purchases Found",
              description: "No previous subscriptions were found.",
              variant: "default"
            });
          }
          setLoading(false);
        },
        (error: string) => {
          console.error('Error restoring purchases:', error);
          toast({
            title: "Restore Failed",
            description: "Failed to restore previous purchases.",
            variant: "destructive"
          });
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Error restoring purchases:', error);
      setLoading(false);
    }
  };
  
  if (isPremium) {
    return (
      <Card className="border-success/30 bg-success/5 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Premium Subscription Active
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You're enjoying all premium features of the app. Thank you for your support!
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const getFormattedPrice = (productId: string) => {
    if (products.length > 0) {
      const product = products.find(p => p.productId === productId);
      return product?.offers[0]?.formattedPrice || SUBSCRIPTION_PRICES[productId].formattedPrice;
    }
    return SUBSCRIPTION_PRICES[productId].formattedPrice;
  };
  
  return (
    <div className="space-y-4">
      {error && (
        <Card className="border-destructive/30 bg-destructive/5 shadow-sm mb-4">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-primary/30 hover:border-primary/50 transition-all shadow-sm">
          <CardHeader>
            <CardTitle>Monthly Premium</CardTitle>
            <p className="text-2xl font-bold">{getFormattedPrice(SUBSCRIPTION_PRODUCTS.MONTHLY)} <span className="text-sm font-normal text-muted-foreground">/month</span></p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => purchaseProduct(SUBSCRIPTION_PRODUCTS.MONTHLY)}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Processing...' : 'Subscribe Monthly'}
            </Button>
          </CardContent>
        </Card>
        
        <Card className="border-primary/30 hover:border-primary/50 transition-all shadow-sm">
          <CardHeader>
            <CardTitle>Annual Premium</CardTitle>
            <p className="text-2xl font-bold">{getFormattedPrice(SUBSCRIPTION_PRODUCTS.YEARLY)} <span className="text-sm font-normal text-muted-foreground">/year</span></p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => purchaseProduct(SUBSCRIPTION_PRODUCTS.YEARLY)}
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-indigo-600"
            >
              {loading ? 'Processing...' : 'Subscribe Yearly (50% off)'}
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-4 flex justify-center">
        <Button
          variant="outline"
          onClick={restorePurchases}
          disabled={loading}
          className="text-sm"
        >
          Restore Purchases
        </Button>
      </div>
      
      <p className="text-xs text-center text-muted-foreground mt-4">
        Payment will be charged to your Google Play account at confirmation of purchase. 
        Subscriptions automatically renew unless auto-renew is turned off at least 24 hours before the end of the current period.
      </p>
    </div>
  );
}
