
interface CordovaPlugins {
  PlayBilling: {
    initialize: (subscriptionIds: string[], successCallback: (result: any) => void, errorCallback: (error: string) => void) => void;
    queryProducts: (successCallback: (products: any[]) => void, errorCallback: (error: string) => void) => void;
    purchase: (productId: string, successCallback: (result: any) => void, errorCallback: (error: string) => void) => void;
    restorePurchases: (successCallback: (purchases: any[]) => void, errorCallback: (error: string) => void) => void;
    connect: (successCallback: () => void, errorCallback: (error: string) => void) => void;
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

interface Window {
  cordova: {
    plugins: CordovaPlugins;
  };
  store: {
    PAID_SUBSCRIPTION: string;
    register: (product: { id: string; type: string }) => void;
    refresh: () => void;
    order: (productId: string) => void;
    when: (productId: string) => {
      approved: (callback: (product: any) => void) => any;
      verified: (callback: (product: any) => void) => any;
      cancelled: (callback: (product: any) => void) => any;
      error: (callback: (err: any, product: any) => void) => any;
      updated: (callback: (product: any) => void) => any;
      owned: (callback: (product: any) => void) => any;
    };
    error: (callback: (err: any) => void) => void;
    ready: (callback: () => void) => void;
    products: Record<string, any>;
    initialize: () => void;
  };
}

export {};
