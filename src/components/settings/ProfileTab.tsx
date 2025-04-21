
// ProfileTab handles the profile part of settings (login/register/logout/profile edit)
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { User, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function ProfileTab({
  settings, setSettings, handleChange, saveSettings,
  isLoggedIn, supabaseUser, handleLogout, authLoading,
  errorMessage, setErrorMessage, handleLogin, setActiveTab,
}: any) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isResetEmailSent, setIsResetEmailSent] = useState(false);
  const [registerFormData, setRegisterFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const { toast } = useToast();

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic validation
    if (!registerFormData.email || !registerFormData.name) {
      setErrorMessage("Name and email are required.");
      return;
    }
    
    if (!registerFormData.password || registerFormData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }
    
    if (registerFormData.password !== registerFormData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      // Call Supabase signup
      const { data, error } = await supabase.auth.signUp({
        email: registerFormData.email,
        password: registerFormData.password,
        options: {
          data: { 
            name: registerFormData.name
          }
        }
      });

      if (error) {
        toast({ 
          title: "Signup error", 
          description: error.message, 
          variant: "destructive" 
        });
        setErrorMessage(error.message);
        return;
      }
      
      toast({ 
        title: "Registration successful", 
        description: "Please check your email to verify your account." 
      });
      
      // Update settings with registered user info
      setSettings(prev => ({
        ...prev,
        name: registerFormData.name,
        email: registerFormData.email,
      }));
      
      setIsRegistering(false);
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({ 
        title: "Registration error", 
        description: error?.message || "An unexpected error occurred", 
        variant: "destructive" 
      });
      setErrorMessage(error?.message || "An unexpected error occurred");
    }
  };
  
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingReset(true);
    
    try {
      if (!forgotPasswordEmail) {
        toast({
          title: "Reset failed",
          description: "Please enter your email address.",
          variant: "destructive"
        });
        setIsSendingReset(false);
        return;
      }

      // Send password reset email with correct redirect URL
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setIsResetEmailSent(true);
        toast({
          title: "Reset Email Sent",
          description: "Check your inbox for reset instructions."
        });
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({ 
        title: "Password reset error", 
        description: error?.message || "An unexpected error occurred", 
        variant: "destructive" 
      });
    } finally {
      setIsSendingReset(false);
    }
  };

  // Render login form
  if (!isLoggedIn && !isRegistering && !isForgotPassword) {
    return (
      <motion.div variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
      }} className="space-y-6">
        {authLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <motion.div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  value={settings.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  type="email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="space-y-4">
                <Button type="submit" className="w-full">Sign In</Button>
                <div className="flex justify-between">
                  <Button variant="link" className="p-0 h-auto" onClick={() => setIsRegistering(true)} type="button">
                    Register
                  </Button>
                  <Button variant="link" className="p-0 h-auto" onClick={() => setIsForgotPassword(true)} type="button">
                    Forgot password?
                  </Button>
                </div>
                {errorMessage && (
                  <div className="text-red-500 text-center text-sm">{errorMessage}</div>
                )}
              </div>
            </motion.div>
          </form>
        )}
      </motion.div>
    );
  }
  
  // Render registration form
  if (!isLoggedIn && isRegistering) {
    return (
      <motion.div variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
      }} className="space-y-6">
        <form onSubmit={handleRegister}>
          <motion.div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="register-name">Name</Label>
              <Input
                id="register-name"
                name="name"
                value={registerFormData.name}
                onChange={handleRegisterChange}
                placeholder="Your Name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
                name="email"
                type="email"
                value={registerFormData.email}
                onChange={handleRegisterChange}
                placeholder="your.email@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-password">Password</Label>
              <Input
                id="register-password"
                name="password"
                type="password"
                value={registerFormData.password}
                onChange={handleRegisterChange}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-confirm-password">Confirm Password</Label>
              <Input
                id="register-confirm-password"
                name="confirmPassword"
                type="password"
                value={registerFormData.confirmPassword}
                onChange={handleRegisterChange}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="space-y-4 pt-2">
              <Button type="submit" className="w-full">Register</Button>
              <Button 
                variant="link" 
                className="p-0 h-auto" 
                onClick={() => setIsRegistering(false)} 
                type="button"
              >
                Back to Sign In
              </Button>
              {errorMessage && (
                <div className="text-red-500 text-center text-sm">{errorMessage}</div>
              )}
            </div>
          </motion.div>
        </form>
      </motion.div>
    );
  }

  // Render forgot password form
  if (!isLoggedIn && isForgotPassword) {
    return (
      <motion.div variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
      }} className="space-y-6">
        {isResetEmailSent ? (
          <div className="text-center py-6 space-y-6">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">Reset Link Sent!</h3>
              <p className="text-muted-foreground mb-6">
                Check your email for instructions to reset your password.
              </p>
              <Button onClick={() => {
                setIsForgotPassword(false);
                setIsResetEmailSent(false);
              }} className="w-full">
                Return to Sign In
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword}>
            <motion.div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email Address</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <div className="space-y-4">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSendingReset}
                >
                  {isSendingReset ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Sending Reset Link...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
                <Button 
                  variant="link" 
                  className="p-0 h-auto w-full text-center" 
                  onClick={() => setIsForgotPassword(false)} 
                  type="button"
                >
                  Back to Sign In
                </Button>
                {errorMessage && (
                  <div className="text-red-500 text-center text-sm">{errorMessage}</div>
                )}
              </div>
            </motion.div>
          </form>
        )}
      </motion.div>
    );
  }

  // Render profile (when logged in)
  return (
    <motion.div variants={{
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    }} className="space-y-6">
      {authLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <motion.div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
            <div>
              <h3 className="font-medium">Logged in as</h3>
              <p className="text-sm text-muted-foreground">{supabaseUser?.email}</p>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">Log Out</Button>
          </motion.div>
          <motion.div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name"
              name="name"
              value={settings.name}
              onChange={handleChange}
              placeholder="Your name"
            />
          </motion.div>
          <motion.div className="pt-4">
            <Button onClick={saveSettings}>Save Profile</Button>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
