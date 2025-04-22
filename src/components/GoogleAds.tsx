
import { useEffect, useRef } from 'react';

interface BannerAdProps {
  adUnitId: string;
  size?: 'BANNER' | 'LARGE_BANNER' | 'MEDIUM_RECTANGLE' | 'FULL_BANNER' | 'LEADERBOARD';
  position?: 'top' | 'bottom';
  className?: string;
}

export function BannerAd({ adUnitId, size = 'BANNER', position = 'bottom', className = '' }: BannerAdProps) {
  const adContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Check if running in a Cordova mobile context with AdMob
    if (typeof window !== 'undefined' && 
        'cordova' in window && 
        'plugins' in (window as any).cordova && 
        'admob' in (window as any).cordova.plugins) {
      
      const admob = (window as any).cordova.plugins.admob;
      
      if (admob && admob.banner) {
        try {
          // Create banner ad options
          const options = {
            adId: adUnitId,
            position: position === 'top' ? 'top' : 'bottom',
            size: size,
            autoShow: true
          };
          
          // Create and show the banner
          admob.banner.config(options);
          admob.banner.prepare();
          
          return () => {
            // Remove banner on component unmount
            admob.banner.remove();
          };
        } catch (error) {
          console.error('Error showing AdMob banner:', error);
        }
      }
    } else {
      // For web preview, show a placeholder
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = `
          <div style="background-color: #f0f0f0; border: 1px solid #ccc; padding: 10px; text-align: center; width: 100%; min-height: 60px; display: flex; align-items: center; justify-content: center; margin: 10px 0;">
            <span style="color: #666; font-size: 14px;">Ad Banner (${adUnitId})</span>
          </div>
        `;
      }
    }
  }, [adUnitId, position, size]);

  return (
    <div ref={adContainerRef} className={`admob-banner-container ${className}`}></div>
  );
}

interface InterstitialAdProps {
  adUnitId: string;
  onAdDismissed?: () => void;
}

export function useInterstitialAd({ adUnitId, onAdDismissed }: InterstitialAdProps) {
  // Track when the last ad was shown to prevent showing too frequently
  const lastShownRef = useRef<number>(0);
  // Track if the interstitial is ready
  const isReadyRef = useRef<boolean>(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && 
        'cordova' in window && 
        'plugins' in (window as any).cordova && 
        'admob' in (window as any).cordova.plugins) {
      
      const admob = (window as any).cordova.plugins.admob;
      
      if (admob && admob.interstitial) {
        try {
          // Create interstitial ad options
          const options = {
            adId: adUnitId,
            autoShow: false
          };
          
          // Add event listeners
          document.addEventListener('admob.interstitial.events.LOAD', () => {
            console.log('Interstitial loaded');
            isReadyRef.current = true;
          });
          
          document.addEventListener('admob.interstitial.events.LOAD_FAIL', () => {
            console.error('Interstitial failed to load');
            isReadyRef.current = false;
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
        }
      }
    }
  }, [adUnitId, onAdDismissed]);
  
  // Function to show the interstitial ad
  const showInterstitial = () => {
    const minimumInterval = 2 * 60 * 1000; // 2 minutes in milliseconds
    const now = Date.now();
    
    // Only show if ready and if enough time has passed since last shown
    if (typeof window !== 'undefined' && 
        'cordova' in window && 
        'plugins' in (window as any).cordova && 
        'admob' in (window as any).cordova.plugins && 
        isReadyRef.current && 
        (now - lastShownRef.current) > minimumInterval) {
        
      const admob = (window as any).cordova.plugins.admob;
      
      if (admob && admob.interstitial) {
        try {
          admob.interstitial.show();
          return true;
        } catch (error) {
          console.error('Error showing interstitial ad:', error);
        }
      }
    }
    
    // For web preview or if conditions aren't met
    if (onAdDismissed) {
      setTimeout(onAdDismissed, 500);
    }
    return false;
  };
  
  return { showInterstitial };
}

// Initialize AdMob
export function initializeAdMob() {
  if (typeof window !== 'undefined' && 
      'cordova' in window && 
      'plugins' in (window as any).cordova && 
      'admob' in (window as any).cordova.plugins) {
    
    try {
      const admob = (window as any).cordova.plugins.admob;
      
      // Initialize with your app ID
      const options = {
        bannerAtTop: false,
        overlap: false,
        offsetTopBar: false,
        isTesting: false,
        adId: null,
        autoShow: false
      };
      
      admob.setOptions(options);
      console.log('AdMob initialized with options');
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
