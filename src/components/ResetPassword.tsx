
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Check, ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasValidToken, setHasValidToken] = useState(false);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Extract token from URL query parameters
  const accessToken = searchParams.get('access_token');
  const type = searchParams.get('type');
  
  useEffect(() => {
    const verifyToken = async () => {
      try {
        console.log("Verifying token presence:", !!accessToken);
        
        if (accessToken) {
          // Try to use the token to verify it's valid
          setHasValidToken(true);
        } else if (type === 'recovery') {
          // If no access token but type is recovery, we're in the flow
          // where Supabase has already handled the token and we just need
          // to update the password
          setHasValidToken(true);
        }
      } catch (error) {
        console.error("Token verification error:", error);
        toast({
          title: "Invalid or expired link",
          description: "Please request a new password reset link",
          variant: "destructive",
        });
        setHasValidToken(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyToken();
  }, [accessToken, type, toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords match",
        variant: "destructive",
      });
      return;
    }
    
    setIsResetting(true);
    
    try {
      // Update the password using the Supabase client
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      setResetComplete(true);
      toast({
        title: "Password reset successful",
        description: "You can now log in with your new password",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      toast({
        title: "Password reset failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/settings?tab=profile');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!hasValidToken && !isLoading) {
    return (
      <motion.div
        className="w-full max-w-md mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="bg-card/50 backdrop-blur-sm border border-primary/10 shadow-lg">
          <CardHeader className="pb-4">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="flex items-center gap-3"
            >
              <div className="bg-primary/10 p-3 rounded-full">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                  Invalid Reset Link
                </CardTitle>
                <CardDescription>
                  This password reset link is invalid or has expired
                </CardDescription>
              </div>
            </motion.div>
          </CardHeader>
          
          <CardContent>
            <motion.div
              variants={itemVariants}
              className="text-center py-6 space-y-6"
            >
              <p className="text-muted-foreground mb-6">
                Please request a new password reset link from the login page.
              </p>
              <Button onClick={handleBackToLogin} className="w-full">
                Return to sign in
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full max-w-md mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="bg-card/50 backdrop-blur-sm border border-primary/10 shadow-lg">
        <CardHeader className="pb-4">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="flex items-center gap-3"
          >
            <div className="bg-primary/10 p-3 rounded-full">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                Reset Password
              </CardTitle>
              <CardDescription>
                {resetComplete 
                  ? "Your password has been updated successfully" 
                  : "Create a new secure password for your account"}
              </CardDescription>
            </div>
          </motion.div>
        </CardHeader>
        
        <CardContent>
          {resetComplete ? (
            <motion.div
              variants={itemVariants}
              className="text-center py-6 space-y-6"
            >
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Password reset complete!</h3>
                <p className="text-muted-foreground mb-6">
                  You can now sign in with your new password.
                </p>
                <Button onClick={handleBackToLogin} className="w-full">
                  Return to sign in
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.form
              variants={containerVariants}
              onSubmit={handleResetPassword}
              className="space-y-4 py-2"
            >
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
              </motion.div>
              
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </motion.div>
              
              <motion.div variants={itemVariants} className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isResetting}
                >
                  {isResetting ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Updating password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full mt-4 flex items-center justify-center"
                  onClick={handleBackToLogin}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to sign in
                </Button>
              </motion.div>
            </motion.form>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
