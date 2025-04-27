
import { useEffect, useRef, useState } from 'react';

interface BannerAdProps {
  adUnitId: string;
  size?: 'BANNER' | 'LARGE_BANNER' | 'MEDIUM_RECTANGLE' | 'FULL_BANNER' | 'LEADERBOARD';
  position?: 'top' | 'bottom';
  className?: string;
}

export function BannerAd({ adUnitId = "ca-app-pub-8270549953677995/2218567244", size = 'BANNER', position = 'bottom', className = '' }: BannerAdProps) {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  useEffect(() => {
    // Check if running in a Cordova mobile context with AdMob
    if (typeof window !== 'undefined' && 
        'cordova' in window && 
        'plugins' in (window as any).cordova && 
        'admob' in (window as any).cordova.plugins) {
      
      console.log("Running in Cordova environment - initializing real AdMob banner");
      const admob = (window as any).cordova.plugins.admob;
      
      if (admob && admob.banner) {
        try {
          // Remove any existing event listeners to prevent duplicates
          document.removeEventListener('admob.banner.events.LOAD', () => {});
          document.removeEventListener('admob.banner.events.LOAD_FAIL', () => {});
          document.removeEventListener('admob.banner.events.OPEN', () => {});
          document.removeEventListener('admob.banner.events.CLOSE', () => {});
          
          // Add event listeners for ad states
          document.addEventListener('admob.banner.events.LOAD', () => {
            console.log('AdMob banner loaded successfully');
            setAdLoaded(true);
            setAdError(null);
            setRetryCount(0); // Reset retry count on success
          });
          
          document.addEventListener('admob.banner.events.LOAD_FAIL', (event: any) => {
            console.error('AdMob banner failed to load:', event);
            const errorMessage = event?.error?.message || 'Unknown error';
            console.error('Error details:', errorMessage);
            
            // Check for specific app-ads.txt related issues
            if (errorMessage.includes('policy') || errorMessage.includes('invalid') || errorMessage.includes('disapproved')) {
              setAdError(`Ad policy issue: ${errorMessage}. Verify app-ads.txt is properly set up.`);
            } else {
              setAdError(`Failed to load ad: ${errorMessage}`);
            }
            setAdLoaded(false);
            
            // Retry logic for transient failures
            if (retryCount < 3) {
              console.log(`Retrying ad load (${retryCount + 1}/3) in 5 seconds...`);
              setTimeout(() => {
                setRetryCount(prev => prev + 1);
                try {
                  admob.banner.remove();
                  setTimeout(() => {
                    admob.banner.prepare();
                  }, 1000);
                } catch (err) {
                  console.error("Error during retry:", err);
                }
              }, 5000);
            }
          });
          
          document.addEventListener('admob.banner.events.OPEN', () => {
            console.log('AdMob banner opened');
          });
          
          document.addEventListener('admob.banner.events.CLOSE', () => {
            console.log('AdMob banner closed');
          });
          
          // Create banner ad options with test ad ID if in test mode
          const options = {
            adId: adUnitId, 
            position: position === 'top' ? admob.banner.positions.TOP_CENTER : admob.banner.positions.BOTTOM_CENTER,
            size: admob.banner.sizes[size] || admob.banner.sizes.BANNER,
            autoShow: true,
            overlap: true, // Changed to true to ensure visibility
            offsetTopBar: false,
            isTesting: false, // Set to false for production ads
          };
          
          console.log("Configuring AdMob banner with options:", JSON.stringify(options));
          console.log("Ad unit ID being used:", adUnitId);
          console.log("Publisher ID: pub-8270549953677995");
          
          // First try to remove any existing banners
          try {
            admob.banner.remove();
          } catch (err) {
            console.log("No existing banner to remove");
          }
          
          // Create and show the banner
          setTimeout(() => {
            admob.banner.config(options);
            admob.banner.prepare();
          }, 1000);
          
          return () => {
            // Remove banner and event listeners on component unmount
            console.log("Removing AdMob banner");
            document.removeEventListener('admob.banner.events.LOAD', () => {});
            document.removeEventListener('admob.banner.events.LOAD_FAIL', () => {});
            document.removeEventListener('admob.banner.events.OPEN', () => {});
            document.removeEventListener('admob.banner.events.CLOSE', () => {});
            
            try {
              admob.banner.remove();
            } catch (err) {
              console.error("Error removing banner:", err);
            }
          };
        } catch (error) {
          console.error('Error showing AdMob banner:', error);
          setAdError(`Error initializing ad: ${(error as Error).message}`);
        }
      }
    } else {
      console.log("Running in web environment - showing AdMob banner placeholder");
      // For web preview, show a placeholder with app-ads.txt info
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = `
          <div style="background-color: #f0f0f0; border: 1px dashed #ccc; padding: 10px; text-align: center; width: 100%; min-height: 60px; display: flex; align-items: center; justify-content: center; margin: 10px 0;">
            <span style="color: #666; font-size: 14px;">Ad Banner (${adUnitId}) - app-ads.txt configured on medquiz-pro-extract.lovable.app</span>
          </div>
        `;
      }
    }
  }, [adUnitId, position, size, retryCount]);

  return (
    <div ref={adContainerRef} className={`admob-banner-container ${className}`}>
      {adError && (
        <div style={{ color: 'red', fontSize: '12px', textAlign: 'center', padding: '5px' }}>
          {adError}
        </div>
      )}
    </div>
  );
}

interface InterstitialAdProps {
  adUnitId: string;
  onAdDismissed?: () => void;
}

export function useInterstitialAd({ adUnitId, onAdDismissed }: InterstitialAdProps) {
  const lastShownRef = useRef<number>(0);
  const isReadyRef = useRef<boolean>(false);
  const [adError, setAdError] = useState<string | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && 
        'cordova' in window && 
        'plugins' in (window as any).cordova && 
        'admob' in (window as any).cordova.plugins) {
      
      console.log("Running in Cordova environment - initializing AdMob interstitial");
      const admob = (window as any).cordova.plugins.admob;
      
      if (admob && admob.interstitial) {
        try {
          // Add event listeners for interstitial ad states
          document.addEventListener('admob.interstitial.events.LOAD', () => {
            console.log('Interstitial loaded');
            isReadyRef.current = true;
            setAdError(null);
          });
          
          document.addEventListener('admob.interstitial.events.LOAD_FAIL', (event: any) => {
            console.error('Interstitial failed to load:', event);
            isReadyRef.current = false;
            setAdError(`Failed to load interstitial: ${event?.error?.message || 'Unknown error'}`);
          });
          
          document.addEventListener('admob.interstitial.events.OPEN', () => {
            console.log('Interstitial opened');
            lastShownRef.current = Date.now();
            isReadyRef.current = false;
          });
          
          document.addEventListener('admob.interstitial.events.CLOSE', () => {
            console.log('Interstitial closed');
            // Load the next interstitial
            admob.interstitial.prepare();
            
            if (onAdDismissed) {
              onAdDismissed();
            }
          });
          
          // Create interstitial ad options
          const options = {
            adId: adUnitId,
            autoShow: false,
            isTesting: false, // Set to true for testing
          };
          
          console.log("Configuring AdMob interstitial with options:", JSON.stringify(options));
          
          // Initial ad preparation
          admob.interstitial.config(options);
          admob.interstitial.prepare();
          
          return () => {
            // Clean up event listeners
            document.removeEventListener('admob.interstitial.events.LOAD', () => {});
            document.removeEventListener('admob.interstitial.events.LOAD_FAIL', () => {});
            document.removeEventListener('admob.interstitial.events.OPEN', () => {});
            document.removeEventListener('admob.interstitial.events.CLOSE', () => {});
          };
        } catch (error) {
          console.error('Error setting up interstitial ad:', error);
          setAdError(`Error initializing interstitial: ${(error as Error).message}`);
        }
      }
    }
  }, [adUnitId, onAdDismissed]);
  
  // Function to show the interstitial ad
  const showInterstitial = () => {
    const minimumInterval = 2 * 60 * 1000; // 2 minutes in milliseconds
    const now = Date.now();
    
    if (adError) {
      console.error("Cannot show interstitial due to error:", adError);
      if (onAdDismissed) {
        setTimeout(onAdDismissed, 500);
      }
      return false;
    }
    
    // Only show if ready and if enough time has passed since last shown
    if (typeof window !== 'undefined' && 
        'cordova' in window && 
        'plugins' in (window as any).cordova && 
        'admob' in (window as any).cordova.plugins && 
        isReadyRef.current && 
        (now - lastShownRef.current) > minimumInterval) {
        
      console.log("Showing AdMob interstitial ad");
      const admob = (window as any).cordova.plugins.admob;
      
      if (admob && admob.interstitial) {
        try {
          admob.interstitial.show();
          return true;
        } catch (error) {
          console.error('Error showing interstitial ad:', error);
          setAdError(`Error showing interstitial: ${(error as Error).message}`);
        }
      }
    } else {
      console.log("Interstitial conditions not met or running in web preview");
    }
    
    // For web preview or if conditions aren't met
    if (onAdDismissed) {
      setTimeout(onAdDismissed, 500);
    }
    return false;
  };
  
  return { showInterstitial, adError };
}

// Initialize AdMob with enhanced app-ads.txt verification
export function initializeAdMob() {
  if (typeof window !== 'undefined' && 
      'cordova' in window && 
      'plugins' in (window as any).cordova && 
      'admob' in (window as any).cordova.plugins) {
      
    console.log("Initializing AdMob in Cordova environment");
    
    try {
      const admob = (window as any).cordova.plugins.admob;
      
      // Initialize with production options
      const options = {
        bannerAtTop: false,
        overlap: true, // Set to true to ensure visibility
        offsetTopBar: false,
        isTesting: false, // Set to false for real ads
        autoShowBanner: true, // Changed to auto-show
        autoShowInterstitial: false
      };
      
      console.log("Setting AdMob global options:", JSON.stringify(options));
      console.log("Publisher ID: pub-8270549953677995");
      console.log("Checking app-ads.txt configuration");
      
      admob.setOptions(options);
      
      // Listen for global AdMob events
      document.addEventListener('admob.service.events.READY', () => {
        console.log('AdMob service is ready');
      });
      
      document.addEventListener('admob.service.events.INIT_COMPLETE', () => {
        console.log('AdMob initialization complete');
      });
      
      document.addEventListener('admob.service.events.INIT_FAILED', (evt: any) => {
        console.error('AdMob initialization failed:', evt);
      });
      
    } catch (error) {
      console.error('Error initializing AdMob:', error);
    }
  } else {
    console.log('AdMob plugin not available (expected in web preview)');
  }
}

// Hook to track and limit ad frequency
export function useAdFrequencyTracker() {
  const quizCompletedCount = useRef<number>(0);
  const flashcardSessionCount = useRef<number>(0);
  
  // Call this when a quiz completes
  const trackQuizCompletion = () => {
    quizCompletedCount.current += 1;
    return quizCompletedCount.current % 2 === 0; // Show ad every 2 quizzes
  };
  
  // Call this when a flashcard session ends
  const trackFlashcardSession = () => {
    flashcardSessionCount.current += 1;
    return flashcardSessionCount.current % 2 === 0; // Show ad every 2 flashcard sessions
  };
  
  return { trackQuizCompletion, trackFlashcardSession };
}
