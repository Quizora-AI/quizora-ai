
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import * as React from "react";
import QuizReview from "./pages/QuizReview";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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
  const { isAuthenticated, user } = useAuth0();

  React.useEffect(() => {
    // If user is authenticated, check premium status from Auth0 metadata
    if (isAuthenticated && user) {
      // Try to get premium status from user metadata
      const userPremium = user['https://quizora.app/premium'] === true;
      setIsPremium(userPremium);
      setLoading(false);
      return;
    }

    // Fallback to localStorage for non-authenticated users
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
  }, [isAuthenticated, user]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return isPremium ? (
    <>{element}</>
  ) : (
    <Navigate to="/settings?tab=premium" replace />
  );
};

// Auth guard for protected routes
const AuthGuard: React.FC<{element: React.ReactNode}> = ({ element }) => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return isAuthenticated ? (
    <>{element}</>
  ) : (
    <Navigate to="/landing" replace />
  );
};

// Login redirect component
const LoginRedirect: React.FC = () => {
  const { loginWithRedirect } = useAuth0();
  
  React.useEffect(() => {
    loginWithRedirect();
  }, [loginWithRedirect]);
  
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p>Redirecting to login...</p>
    </div>
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

  // Get Auth0 credentials from environment variables or use placeholders
  // Users should replace these with their actual Auth0 credentials
  const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN || "dev-example.us.auth0.com";
  const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID || "YourAuth0ClientId";

  return (
    <React.StrictMode>
      <Auth0Provider
        domain={auth0Domain}
        clientId={auth0ClientId}
        authorizationParams={{
          redirect_uri: window.location.origin
        }}
        cacheLocation="localstorage"
      >
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Toaster />
            <Sonner />
            <AppRoutes isFirstVisit={isFirstVisit} />
          </BrowserRouter>
        </QueryClientProvider>
      </Auth0Provider>
    </React.StrictMode>
  );
};

// Separate component for routes to access Auth0 context
const AppRoutes: React.FC<{isFirstVisit: boolean}> = ({ isFirstVisit }) => {
  const { isAuthenticated, isLoading } = useAuth0();

  // If still loading auth state, show loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={isFirstVisit || !isAuthenticated ? <Navigate to="/landing" /> : <Navigate to="/quiz" />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<LoginRedirect />} />
      
      {/* Protected routes */}
      <Route path="/quiz" element={<AuthGuard element={<Index initialTab="generate" />} />} />
      <Route path="/flashcards" element={<AuthGuard element={<Index initialTab="flashcards" />} />} />
      <Route path="/history" element={<AuthGuard element={<Index initialTab="history" />} />} />
      <Route path="/history/:quizId" element={<AuthGuard element={<QuizReview />} />} />
      <Route path="/settings" element={<AuthGuard element={<Index initialTab="settings" />} />} />
      <Route path="/legal" element={<Index initialTab="generate" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
