import * as React from 'react';
import { Toaster as ToastUIToaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import QuizReview from "./pages/QuizReview";
import { useEffect } from "react";
import { initializeAdMob } from "./components/GoogleAds";

// Create a client with better error handling
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

// Create a premium route guard component
const PremiumRoute: React.FC<{element: React.ReactNode}> = ({ element }) => {
  const [isPremium, setIsPremium] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Check if user has premium subscription from localStorage
    const userSettings = localStorage.getItem("userSettings");
    if (userSettings) {
      try {
        const settings = JSON.parse(userSettings);
        setIsPremium(settings.isPremium === true);
      } catch (error) {
        console.error("Error parsing user settings:", error);
      }
    }
    setLoading(false);
  }, []);

  if (loading) return null;

  return isPremium ? (
    <>{element}</>
  ) : (
    <Navigate to="/settings?tab=premium" replace />
  );
};

// Component to clear persistent toasts
const ToastCleaner = () => {
  const { dismissAll } = useToast();
  
  React.useEffect(() => {
    // Clear any stuck toasts on component mount
    dismissAll();
    
    // Set up an interval to periodically check and clear persistent toasts
    const interval = setInterval(() => {
      dismissAll();
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, [dismissAll]);
  
  return null;
};

// Reset all app data function
function resetAppData() {
  // Remove all app-related data from localStorage
  localStorage.removeItem("quizHistory");
  localStorage.removeItem("flashcardsHistory");
  localStorage.removeItem("quizInProgress");
  localStorage.removeItem("currentFlashcardSet");
  localStorage.removeItem("quizToRetake");
  
  // Keep user settings
  console.log("App data has been reset. Fresh start!");
}

// Inside the App component, add initialization for AdMob
function App() {
  useEffect(() => {
    // Platform detection - only initialize on actual mobile devices
    document.addEventListener('deviceready', () => {
      console.log("Device is ready, initializing AdMob");
      initializeAdMob();
    }, false);
    
    // Add event listener for pause/resume to manage ads appropriately
    document.addEventListener('pause', () => {
      console.log("App paused");
    }, false);
    
    document.addEventListener('resume', () => {
      console.log("App resumed");
    }, false);
  }, []);

  const [initialLoad, setInitialLoad] = React.useState(true);

  React.useEffect(() => {
    // Reset all app data for fresh start (only do this once when requested)
    if (initialLoad) {
      resetAppData();
      setInitialLoad(false);
    }
    
    // Always set the landing page to be shown
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
            <Route path="/quiz" element={<Index initialTab="generate" />} />
            <Route path="/flashcards" element={<Index initialTab="flashcards" />} />
            <Route path="/history" element={<Index initialTab="history" />} />
            <Route path="/history/:quizId" element={<QuizReview />} />
            <Route path="/settings" element={<Index initialTab="settings" />} />
            <Route path="/legal" element={<Index initialTab="generate" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
