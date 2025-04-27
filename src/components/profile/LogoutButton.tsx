
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export function LogoutButton() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Show toast for auth state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event in LogoutButton:", event);
      
      if (event === 'SIGNED_IN') {
        toast({
          title: "Signed in successfully",
          description: "Welcome back to your account!",
        });
      }
    });

    // Check if we have a "login_success" or "login_error" param in the URL
    const params = new URLSearchParams(window.location.search);
    const loginSuccess = params.get('login_success');
    const loginError = params.get('login_error');
    
    if (loginSuccess === 'true') {
      toast({
        title: "Login successful",
        description: "You're now signed in to your account",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (loginError) {
      toast({
        title: "Login failed",
        description: loginError || "Please try again",
        variant: "destructive",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [toast]);

  const handleLogout = async () => {
    try {
      console.log("Logging out user...");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account",
      });
      
      // Clear any stored quiz data to prevent issues after logout
      localStorage.removeItem("quizInProgress");
      
      // Navigate to auth page
      navigate("/auth");
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error logging out",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-muted/30 mb-4">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Account Access</h3>
            <p className="text-sm text-muted-foreground">
              Sign out from your account
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center gap-2 border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
