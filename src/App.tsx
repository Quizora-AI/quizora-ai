
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
  localStorage.removeItem("quizHistory");
  localStorage.removeItem("flashcardsHistory");
  localStorage.removeItem("quizInProgress");
  localStorage.removeItem("currentFlashcardSet");
  localStorage.removeItem("quizToRetake");
  
  console.log("App data has been reset. Fresh start!");
}

function App() {
  useEffect(() => {
    const initializePlugins = () => {
      console.log("Checking for Cordova and initializing plugins if available");
      
      if ('cordova' in window) {
        console.log("Cordova detected, setting up event listeners");
        
        document.addEventListener('deviceready', onDeviceReady, false);
      } else {
        console.log("Running in browser environment, skipping native plugins initialization");
      }
    };
    
    const onDeviceReady = () => {
      console.log("Device is ready, initializing plugins");
      
      // Initialize AdMob
      initializeAdMob();
      
      // Initialize Google Play Billing immediately
      if ((window as any).cordova && (window as any).cordova.plugins && (window as any).cordova.plugins.PlayBilling) {
        console.log("Initializing Play Billing");
        (window as any).cordova.plugins.PlayBilling.connect(
          () => console.log("Play Billing connected"),
          (error: string) => console.error("Error connecting to Play Billing:", error)
        );
      }
      
      document.addEventListener('pause', onPause, false);
      document.addEventListener('resume', onResume, false);
    };
    
    const onPause = () => {
      console.log("App paused");
    };
    
    const onResume = () => {
      console.log("App resumed");
    };
    
    initializePlugins();
    
    return () => {
      if ('cordova' in window) {
        document.removeEventListener('deviceready', onDeviceReady);
        document.removeEventListener('pause', onPause);
        document.removeEventListener('resume', onResume);
      }
    };
  }, []);

  const [initialLoad, setInitialLoad] = React.useState(true);

  React.useEffect(() => {
    if (initialLoad) {
      resetAppData();
      setInitialLoad(false);
    }
    
    localStorage.removeItem("hasVisitedBefore");
  }, [initialLoad]);

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
