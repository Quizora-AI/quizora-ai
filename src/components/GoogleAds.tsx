
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
    // Check if running in a mobile context with AdMob
    if (typeof window !== 'undefined' && 'admob' in window) {
      const admob = (window as any).admob;
      
      if (admob && admob.BannerAd) {
        try {
          // Create banner ad
          const bannerAd = new admob.BannerAd({
            adUnitId,
            position: position === 'top' ? 'top' : 'bottom',
            size
          });
          
          // Show the banner
          bannerAd.show();
          
          return () => {
            // Hide banner on component unmount
            bannerAd.hide();
          };
        } catch (error) {
          console.error('Error showing AdMob banner:', error);
        }
      }
    } else {
      // For web preview, show a placeholder
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = `
          <div style="background-color: #f0f0f0; border: 1px dashed #ccc; padding: 10px; text-align: center; width: 100%; min-height: 50px; display: flex; align-items: center; justify-content: center;">
            <span style="color: #666;">Ad Banner Placeholder (${adUnitId})</span>
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
    if (typeof window !== 'undefined' && 'admob' in window) {
      const admob = (window as any).admob;
      
      if (admob && admob.InterstitialAd) {
        try {
          // Create interstitial ad
          const interstitialAd = new admob.InterstitialAd({
            adUnitId
          });
          
          // Add event listeners
          interstitialAd.on('load', () => {
            isReadyRef.current = true;
          });
          
          interstitialAd.on('show', () => {
            isReadyRef.current = false;
            lastShownRef.current = Date.now();
          });
          
          interstitialAd.on('dismiss', () => {
            // Load the next interstitial
            interstitialAd.load();
            
            if (onAdDismissed) {
              onAdDismissed();
            }
          });
          
          interstitialAd.on('error', (error: any) => {
            console.error('Interstitial ad error:', error);
            isReadyRef.current = false;
          });
          
          // Initial ad load
          interstitialAd.load();
          
          return () => {
            // Clean up event listeners
            interstitialAd.off('load');
            interstitialAd.off('show');
            interstitialAd.off('dismiss');
            interstitialAd.off('error');
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
        'admob' in window && 
        isReadyRef.current && 
        (now - lastShownRef.current) > minimumInterval) {
        
      const admob = (window as any).admob;
      if (admob && admob.InterstitialAd) {
        try {
          admob.InterstitialAd.show();
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
      admob.start({
        applicationId: 'ca-app-pub-8270549953677995~3236753992'
      }).then(() => {
        console.log('AdMob initialized successfully');
      }).catch((error: any) => {
        console.error('AdMob initialization error:', error);
      });
    } catch (error) {
      console.error('Error accessing AdMob plugin:', error);
    }
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
