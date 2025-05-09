
import * as React from 'react';
import { Toaster as ToastUIToaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Index from "./src/pages/Index";
import NotFound from "./src/pages/NotFound";
import LandingPage from "./src/pages/LandingPage";
import QuizReview from "./src/pages/QuizReview";
import AuthPage from "./src/pages/AuthPage";
import ResetPasswordPage from "./src/pages/ResetPasswordPage";
import Settings from "./src/pages/Settings";
import { useEffect, useState } from "react";
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
  localStorage.clear();
  console.log("App data has been reset. Fresh start!");
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Enhanced initialization for both AdMob and Play Billing
    const initializePlugins = () => {
      console.log("Checking for Cordova and initializing plugins");
      
      if ('cordova' in window) {
        console.log("Cordova detected, setting up event listeners");
        document.addEventListener('deviceready', onDeviceReady, false);
      } else {
        console.log("Running in web environment - showing AdMob banner placeholder");
        initializeAdMob();
      }
    };
    
    const onDeviceReady = () => {
      console.log("Device ready event fired - initializing mobile plugins");
      initializeAdMob();
    };
    
    initializePlugins();
    
    // Check if user is authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Show loading until auth state is determined
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={isAuthenticated ? <LandingPage /> : <Navigate to="/auth" replace />} />
          <Route path="/auth" element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} />
          <Route path="/quiz" element={<AuthRoute element={<Index />} />} />
          <Route path="/quiz/review" element={<AuthRoute element={<QuizReview />} />} />
          <Route path="/settings" element={<AuthRoute element={<Settings />} />} />
          <Route path="/history" element={<AuthRoute element={<Index initialTab="history" />} />} />
          <Route path="/flashcards" element={<AuthRoute element={<Index initialTab="flashcards" />} />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ToastUIToaster />
        <SonnerToaster />
        <ToastCleaner />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
