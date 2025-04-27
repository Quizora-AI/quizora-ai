import * as React from 'react';
import { Toaster as ToastUIToaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import QuizReview from "./pages/QuizReview";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import { useEffect, useMemo, useState, createContext, useContext } from "react";
import { initializeAdMob } from "./components/GoogleAds";
import { supabase } from "./integrations/supabase/client";
import { resetAppData } from './utils/storageUtils';
import { Session, User } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';
import SplashScreen from './components/SplashScreen';
import { AnimatePresence } from 'framer-motion';

// Define an authentication context to manage auth state
type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Auth provider component to handle authentication state
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log('Auth state changed:', event);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (event === 'SIGNED_IN') {
        toast({
          title: "Signed in successfully",
          description: "Welcome back!",
        });
      } else if (event === 'SIGNED_OUT') {
        toast({
          title: "Signed out",
          description: "You have been signed out successfully",
        });
      }
    });

    // Then check the current session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Current session:', currentSession ? 'exists' : 'none');
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = useMemo(() => ({
    session,
    user,
    loading,
    signOut
  }), [session, user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected route component for auth routes (redirects authenticated users away)
const ProtectedAuthRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user && location.pathname === '/auth') {
      navigate('/quiz');
    }
  }, [user, loading, navigate, location]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return <>{element}</>;
};

// Protected route component for app routes (redirects unauthenticated users to auth)
const AuthRoute = ({ element }: { element: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return user ? <>{element}</> : <Navigate to="/auth" replace />;
};

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
  const [showSplash, setShowSplash] = useState(true);
  
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

  // Used to reset app data for fresh start (do only once during development)
  useEffect(() => {
    resetAppData();
  }, []);

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <AnimatePresence>
              {showSplash && (
                <SplashScreen onComplete={() => setShowSplash(false)} />
              )}
            </AnimatePresence>
            <ToastCleaner />
            <ToastUIToaster />
            <SonnerToaster />
            <Routes>
              <Route path="/" element={<Navigate to="/landing" />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/auth" element={<ProtectedAuthRoute element={<AuthPage />} />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/quiz" element={<AuthRoute element={<Index initialTab="generate" />} />} />
              <Route path="/flashcards" element={<AuthRoute element={<Index initialTab="flashcards" />} />} />
              <Route path="/history" element={<AuthRoute element={<Index initialTab="history" />} />} />
              <Route path="/history/:quizId" element={<AuthRoute element={<QuizReview />} />} />
              <Route path="/settings" element={<AuthRoute element={<Index initialTab="settings" />} />} />
              <Route path="/legal" element={<Index initialTab="generate" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
