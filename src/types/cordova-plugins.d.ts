
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
  };
}

interface CordovaWindow extends Window {
  cordova: {
    plugins: CordovaPlugins;
  };
}
