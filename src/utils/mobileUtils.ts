
/**
 * Helper functions for mobile-specific functionality
 */

// Check if we're running in a Cordova environment
export const isCordova = (): boolean => {
  return typeof window !== 'undefined' && 'cordova' in window;
};

// Check if AdMob is available
export const isAdMobAvailable = (): boolean => {
  return isCordova() && !!(window as any).MobileAds;
};

// Check if Play Billing is available
export const isPlayBillingAvailable = (): boolean => {
  return isCordova() && !!(window as any).cordova?.plugins?.PlayBilling;
};

// Initialize AdMob with error handling and retries
export const initializeAdMob = (maxRetries = 3): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!isAdMobAvailable()) {
      console.log("AdMob is not available in this environment");
      resolve(false);
      return;
    }
    
    let retries = 0;
    
    function tryInitialize() {
      console.log(`Attempting to initialize AdMob (attempt ${retries + 1}/${maxRetries})`);
      
      try {
        (window as any).MobileAds.initialize()
          .then(() => {
            console.log("AdMob SDK initialized successfully");
            resolve(true);
          })
          .catch((error: any) => {
            console.error(`Error initializing AdMob SDK: ${error}`);
            retries++;
            
            if (retries < maxRetries) {
              console.log(`Retrying AdMob initialization in ${retries * 1000}ms`);
              setTimeout(tryInitialize, retries * 1000);
            } else {
              console.error("Maximum AdMob initialization retries reached");
              resolve(false);
            }
          });
      } catch (error) {
        console.error("Exception during AdMob initialization:", error);
        retries++;
        
        if (retries < maxRetries) {
          console.log(`Retrying AdMob initialization in ${retries * 1000}ms`);
          setTimeout(tryInitialize, retries * 1000);
        } else {
          console.error("Maximum AdMob initialization retries reached");
          resolve(false);
        }
      }
    }
    
    // Start initialization process with a slight delay to ensure device readiness
    setTimeout(tryInitialize, 500);
  });
};

// Initialize Play Billing with error handling and retries
export const initializePlayBilling = (maxRetries = 3): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!isPlayBillingAvailable()) {
      console.log("Play Billing is not available in this environment");
      resolve(false);
      return;
    }
    
    let retries = 0;
    
    function tryInitialize() {
      console.log(`Attempting to initialize Play Billing (attempt ${retries + 1}/${maxRetries})`);
      
      try {
        (window as any).cordova.plugins.PlayBilling.connect(
          () => {
            console.log("Play Billing connected successfully");
            resolve(true);
          },
          (error: string) => {
            console.error(`Error connecting to Play Billing: ${error}`);
            retries++;
            
            if (retries < maxRetries) {
              console.log(`Retrying Play Billing initialization in ${retries * 1000}ms`);
              setTimeout(tryInitialize, retries * 1000);
            } else {
              console.error("Maximum Play Billing initialization retries reached");
              resolve(false);
            }
          }
        );
      } catch (error) {
        console.error("Exception during Play Billing initialization:", error);
        retries++;
        
        if (retries < maxRetries) {
          console.log(`Retrying Play Billing initialization in ${retries * 1000}ms`);
          setTimeout(tryInitialize, retries * 1000);
        } else {
          console.error("Maximum Play Billing initialization retries reached");
          resolve(false);
        }
      }
    }
    
    // Start initialization process with a slight delay
    setTimeout(tryInitialize, 500);
  });
};
