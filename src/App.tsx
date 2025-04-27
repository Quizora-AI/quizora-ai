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
import { TokenPanel } from "./components/TokenPanel";

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  return session ? (
    <>{element}</>
  ) : (
    <Navigate to="/auth" replace />
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

function resetAppData() {
  localStorage.clear();
  console.log("App data has been reset. Fresh start!");
}

function App() {
  useEffect(() => {
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
      
      if ((window as any).MobileAds) {
        console.log("Initializing AdMob SDK");
        try {
          setTimeout(() => {
            (window as any).MobileAds.initialize()
              .then(() => {
                console.log("AdMob SDK initialized successfully");
                initializeAdMob();
                console.log("AdMob integration complete - ads should display shortly");
                
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
      
      if ((window as any).cordova?.plugins?.PlayBilling) {
        console.log("Initializing Play Billing");
        try {
          console.log("Checking Play Billing availability");
          
          (window as any).cordova.plugins.PlayBilling.connect(
            () => {
              console.log("Play Billing connected successfully");
              console.log("Querying subscription products");
              
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
            <Route path="/tokens" element={<AuthRoute element={<Index initialTab="tokens" />} />} />
            <Route path="/legal" element={<Index initialTab="generate" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
