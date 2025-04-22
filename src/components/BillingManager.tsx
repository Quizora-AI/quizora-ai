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

export function BillingManager({ userId, isPremium, onPurchaseComplete }: BillingManagerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const hasStore = typeof window !== 'undefined' && 'cordova' in window && 
    'plugins' in (window as any).cordova && 'store' in (window as any).cordova.plugins;

  useEffect(() => {
    if (hasStore) {
      initializeStore();
    }
  }, [hasStore]);
  
  const initializeStore = async () => {
    try {
      const store = (window as any).cordova.plugins.store;
      
      // Register products using our consistent product IDs
      store.register({
        id: SUBSCRIPTION_PRODUCTS.MONTHLY,
        type: store.PAID_SUBSCRIPTION
      });
      
      store.register({
        id: SUBSCRIPTION_PRODUCTS.YEARLY,
        type: store.PAID_SUBSCRIPTION
      });
      
      // When purchase is approved
      store.when(SUBSCRIPTION_PRODUCTS.MONTHLY).approved(async (product: any) => {
        try {
          await verifyPurchase(SUBSCRIPTION_PRODUCTS.MONTHLY, product.transaction.id);
          product.finish();
        } catch (err) {
          console.error('Error processing monthly subscription:', err);
        }
      });
      
      store.when(SUBSCRIPTION_PRODUCTS.YEARLY).approved(async (product: any) => {
        try {
          await verifyPurchase(SUBSCRIPTION_PRODUCTS.YEARLY, product.transaction.id);
          product.finish();
        } catch (err) {
          console.error('Error processing yearly subscription:', err);
        }
      });
      
      // When purchase fails
      store.error((error: any) => {
        console.error('Store Error:', error);
        setError('Purchase failed. Please try again later.');
        setLoading(false);
        
        toast({
          title: "Purchase Error",
          description: "There was a problem processing your purchase. Please try again later.",
          variant: "destructive"
        });
      });
      
      // Initialize the store
      store.refresh();
      console.log('In-app purchase store initialized successfully');
    } catch (error) {
      console.error('Error initializing in-app purchase store:', error);
      setError('Failed to initialize in-app purchases');
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
    
    if (hasStore) {
      try {
        const store = (window as any).cordova.plugins.store;
        console.log(`Attempting to purchase product: ${productId}`);
        store.order(productId);
      } catch (error) {
        console.error('Error purchasing product:', error);
        setError('Purchase failed');
        setLoading(false);
      }
    } else {
      setTimeout(() => {
        const success = Math.random() > 0.2;
        
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
            <p className="text-2xl font-bold">{SUBSCRIPTION_PRICES[SUBSCRIPTION_PRODUCTS.MONTHLY].formattedPrice} <span className="text-sm font-normal text-muted-foreground">/month</span></p>
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
            <p className="text-2xl font-bold">{SUBSCRIPTION_PRICES[SUBSCRIPTION_PRODUCTS.YEARLY].formattedPrice} <span className="text-sm font-normal text-muted-foreground">/year</span></p>
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
      
      <p className="text-xs text-center text-muted-foreground mt-4">
        Payment will be charged to your Google Play account at confirmation of purchase. 
        Subscriptions automatically renew unless auto-renew is turned off at least 24 hours before the end of the current period.
      </p>
    </div>
  );
}
