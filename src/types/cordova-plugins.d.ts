
interface CordovaPlugins {
  store: {
    PAID_SUBSCRIPTION: string;
    register: (product: { id: string; type: string }) => void;
    refresh: () => void;
    order: (productId: string) => void;
    when: (productId: string) => {
      approved: (callback: (product: any) => void) => void;
      verified: (callback: (product: any) => void) => void;
      cancelled: (callback: (product: any) => void) => void;
      error: (callback: (err: any, product: any) => void) => void;
    };
    error: (callback: (err: any) => void) => void;
    // Add additional store properties
    ready: (callback: () => void) => void;
    products: Record<string, any>;
    validator: string | ((url: string, callback: (url: string) => void) => void);
  };
  
  admob: {
    banner: {
      config: (options: any) => void;
      prepare: () => void;
      show: () => void;
      hide: () => void;
      remove: () => void;
    };
    interstitial: {
      config: (options: any) => void;
      prepare: () => void;
      show: () => void;
    };
    setOptions: (options: any) => void;
  };
}

interface CordovaWindow extends Window {
  cordova: {
    plugins: CordovaPlugins;
  };
}

// Extend the global Window interface
declare global {
  interface Window extends CordovaWindow {}
}

export {};
