
import { useState, useEffect } from 'react';
import BillingService from '../services/BillingService';

interface Product {
  productId: string;
  title: string;
  description: string;
  price: string;
  type: string;
}

export function useBilling() {
  const [isReady, setIsReady] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize billing on component mount
  useEffect(() => {
    const initBilling = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const initialized = await BillingService.initialize();
        setIsReady(initialized);
        
        if (initialized) {
          // Query initial purchases
          const purchasesResult = await BillingService.getPurchases();
          setPurchases(purchasesResult.purchases || []);
        }
      } catch (err: any) {
        console.error('Error initializing billing:', err);
        setError(err.message || 'Failed to initialize billing');
      } finally {
        setLoading(false);
      }
    };
    
    initBilling();
    
    // Add purchase listener
    const subscription = BillingService.addPurchaseListener((purchase) => {
      console.log('Purchase updated:', purchase);
      setPurchases(prev => {
        // Update or add the purchase
        const exists = prev.some(p => p.productId === purchase.productId);
        if (exists) {
          return prev.map(p => p.productId === purchase.productId ? purchase : p);
        }
        return [...prev, purchase];
      });
    });
    
    return () => {
      if (subscription?.remove) {
        subscription.remove();
      }
    };
  }, []);
  
  // Function to get available products
  const getProducts = async (productType: 'inapp' | 'subs', productIds: string[]) => {
    if (!isReady) {
      setError('Billing is not initialized');
      return [];
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await BillingService.getProducts(productType, productIds);
      setProducts(result.products || []);
      return result.products || [];
    } catch (err: any) {
      console.error('Error getting products:', err);
      setError(err.message || 'Failed to get products');
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  // Function to purchase a product
  const purchaseProduct = async (productId: string, productType: 'inapp' | 'subs') => {
    if (!isReady) {
      setError('Billing is not initialized');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      return await BillingService.purchaseProduct(productId, productType);
    } catch (err: any) {
      console.error('Error purchasing product:', err);
      setError(err.message || 'Failed to purchase product');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Function to check if a product is purchased
  const isPurchased = (productId: string) => {
    return purchases.some(p => 
      p.productId === productId && 
      p.purchaseState === 1 // PURCHASED state
    );
  };
  
  return {
    isReady,
    products,
    purchases,
    loading,
    error,
    getProducts,
    purchaseProduct,
    isPurchased
  };
}
