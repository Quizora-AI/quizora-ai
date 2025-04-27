
import * as React from 'react';
import { Toaster as ToastUIToaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import QuizReview from "./pages/QuizReview";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import { useEffect } from "react";
import { initializeAdMob } from "./components/GoogleAds";
import { supabase } from "./integrations/supabase/client";
import { resetAppData } from "./utils/storageUtils";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 seconds
      meta: {
        errorHandler: (error: Error) => {
          console.error("Query error:", error);
        }
      },
    },
  },
});

const AuthRoute = ({ element }) => {
  const [session, setSession] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      console.log("Auth state change detected", _event, !!newSession);
      setSession(newSession);
      setLoading(false);
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      console.log("Initial session check:", !!existingSession);
      setSession(existingSession);
      setLoading(false);
      
      if (!existingSession) {
        // If not logged in, check if we should show first-time experience
        const hasVisitedBefore = localStorage.getItem("hasVisitedBefore");
        if (!hasVisitedBefore) {
          console.log("First time visitor detected");
          localStorage.setItem("hasVisitedBefore", "true");
          // Let the landing page redirect handle navigation to auth
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-background to-background/80">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-t-primary border-r-primary/30 border-b-primary/60 border-l-primary/10 animate-spin" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.7a9 9 0 1 1-2.9-6.6"/>
              </svg>
            </div>
          </div>
          <h1 className="mt-6 text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Quizora AI
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Loading your experience...
          </p>
        </div>
      </div>
    );
  }

  return session ? (
    <>{element}</>
  ) : (
    <Navigate to="/landing" replace />
  );
};

const ToastCleaner = () => {
  const { dismissAll } = useToast();
  
  React.useEffect(() => {
    dismissAll();
    
    const interval = setInterval(() => {
      dismissAll();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [dismissAll]);
  
  return null;
};

function App() {
  useEffect(() => {
    // Enhanced initialization for both AdMob and Play Billing
    const initializePlugins = () => {
      console.log("Checking for Cordova and initializing plugins");
      
      if ('cordova' in window) {
        console.log("Cordova detected, setting up event listeners");
        document.addEventListener('deviceready', onDeviceReady, false);
      } else {
        console.log("Running in browser environment");
      }
    };
    
    const onDeviceReady = () => {
      console.log("Device is ready, initializing plugins");
      
      // Initialize AdMob with improved configuration
      if ((window as any).MobileAds) {
        console.log("Initializing AdMob SDK");
        try {
          // Force a delay to ensure device is fully ready
          setTimeout(() => {
            (window as any).MobileAds.initialize()
              .then(() => {
                console.log("AdMob SDK initialized successfully");
                // Re-initialize ad units
                initializeAdMob();
                console.log("AdMob integration complete - ads should display shortly");
                
                // Force refresh ads after initialization
                if ((window as any).cordova?.plugins?.admob) {
                  console.log("Refreshing ad units");
                  (window as any).cordova.plugins.admob.banner.refresh();
                }
              })
              .catch((error: any) => {
                console.error("Error initializing AdMob SDK:", error);
              });
          }, 1000);
        } catch (error) {
          console.error("Exception during AdMob initialization:", error);
        }
      } else {
        console.warn("MobileAds not found - AdMob integration may be missing");
      }
      
      // Initialize Play Billing with enhanced configuration
      if ((window as any).cordova?.plugins?.PlayBilling) {
        console.log("Initializing Play Billing");
        try {
          // Force check for Play Billing before connection
          console.log("Checking Play Billing availability");
          
          // Connect with enhanced parameters
          (window as any).cordova.plugins.PlayBilling.connect(
            () => {
              console.log("Play Billing connected successfully");
              console.log("Querying subscription products");
              
              // Force product query on startup
              (window as any).cordova.plugins.PlayBilling.queryProducts(
                (products: any) => {
                  console.log("Play Billing products available:", products);
                },
                (error: string) => {
                  console.error("Error querying Play Billing products:", error);
                }
              );
            },
            (error: string) => {
              console.error("Error connecting to Play Billing:", error);
            }
          );
        } catch (error) {
          console.error("Exception during Play Billing initialization:", error);
        }
      } else {
        console.warn("PlayBilling plugin not found - subscription features may be unavailable");
      }
    };
    
    initializePlugins();
    
    return () => {
      if ('cordova' in window) {
        document.removeEventListener('deviceready', onDeviceReady);
      }
    };
  }, []);

  React.useEffect(() => {
    resetAppData();
  }, []);

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ToastCleaner />
          <ToastUIToaster />
          <SonnerToaster />
          <Routes>
            <Route path="/" element={<Navigate to="/landing" />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/quiz" element={<AuthRoute element={<Index initialTab="generate" />} />} />
            <Route path="/flashcards" element={<AuthRoute element={<Index initialTab="flashcards" />} />} />
            <Route path="/history" element={<AuthRoute element={<Index initialTab="history" />} />} />
            <Route path="/history/:quizId" element={<AuthRoute element={<QuizReview />} />} />
            <Route path="/settings" element={<AuthRoute element={<Index initialTab="settings" />} />} />
            <Route path="/legal" element={<Index initialTab="generate" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
