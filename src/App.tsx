
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import * as React from "react";
import QuizReview from "./pages/QuizReview";
import { ResetPassword } from "./components/ResetPassword";
import { supabase } from "@/integrations/supabase/client";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false
    },
  },
});

// Create a premium route guard component
const PremiumRoute: React.FC<{element: React.ReactNode}> = ({ element }) => {
  const [isPremium, setIsPremium] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkPremium = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setLoading(false);
        return;
      }
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("isPremium")
        .eq("id", data.session.user.id)
        .maybeSingle();
        
      setIsPremium(profile?.isPremium === true);
      setLoading(false);
    };
    
    checkPremium();
  }, []);

  if (loading) return null;

  return isPremium ? (
    <>{element}</>
  ) : (
    <Navigate to="/settings?tab=premium" replace />
  );
};

// Auth route guard component
const AuthRoute: React.FC<{element: React.ReactNode}> = ({ element }) => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
      setLoading(false);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setLoading(false);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  return isLoggedIn ? (
    <>{element}</>
  ) : (
    <Navigate to="/settings?tab=profile" replace />
  );
};

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<AuthRoute element={<Index />} />} />
              <Route path="/quiz" element={<AuthRoute element={<Index initialTab="generate" />} />} />
              <Route path="/history" element={<AuthRoute element={<Index initialTab="history" />} />} />
              <Route path="/history/:quizId" element={<AuthRoute element={<QuizReview />} />} />
              <Route path="/assistant" element={<PremiumRoute element={<Index initialTab="assistant" />} />} />
              <Route path="/settings" element={<Index initialTab="settings" />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/legal" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
