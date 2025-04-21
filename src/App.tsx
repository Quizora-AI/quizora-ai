
import * as React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import QuizReview from "./pages/QuizReview";

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

const App = () => {
  // Check if this is user's first visit
  const [isFirstVisit, setIsFirstVisit] = React.useState(false);

  React.useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem("hasVisitedBefore");
    if (hasVisited === "true") {
      setIsFirstVisit(false);
    } else {
      // Set flag for future visits
      localStorage.setItem("hasVisitedBefore", "true");
      setIsFirstVisit(true);
    }
  }, []);

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={isFirstVisit ? <Navigate to="/landing" /> : <Navigate to="/quiz" />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/quiz" element={<Index initialTab="generate" />} />
            <Route path="/flashcards" element={<Index initialTab="flashcards" />} />
            <Route path="/history" element={<Index initialTab="history" />} />
            <Route path="/history/:quizId" element={<QuizReview />} />
            <Route path="/settings" element={<Index initialTab="settings" />} />
            <Route path="/analytics" element={<PremiumRoute element={<Index initialTab="analytics" />} />} />
            <Route path="/legal" element={<Index initialTab="legal" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
