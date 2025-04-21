import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  User, 
  Info, 
  Book, 
  Crown,
  BarChart
} from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ResetPassword } from "./ResetPassword";
import { ProfileTab } from "./settings/ProfileTab";
import { PreferencesTab } from "./settings/PreferencesTab";
import { PremiumTab } from "./settings/PremiumTab";
import { AnalyticsTab } from "./settings/AnalyticsTab";
import { LegalTab } from "./settings/LegalTab";
import { useSettingsAuth } from "./settings/useSettingsAuth";
import { supabase } from "@/integrations/supabase/client";

export function SettingsPanel() {
  // Use the useSettingsAuth hook
  const {
    settings, setSettings, activeTab, setActiveTab,
    isLoggedIn, setIsLoggedIn, quizHistory, setQuizHistory,
    supabaseUser, setSupabaseUser, supabaseSession, setSupabaseSession,
    authLoading, setAuthLoading
  } = useSettingsAuth();
  
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "profile";
  
  // Initialize active tab from URL params
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab, setActiveTab]);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const saveSettings = async () => {
    try {
      localStorage.setItem("userSettings", JSON.stringify(settings));
      localStorage.setItem("autoSave", settings.autoSave.toString());
      
      if (isLoggedIn && supabaseUser) {
        // Update profile in Supabase
        const { error } = await supabase
          .from('profiles')
          .update({
            name: settings.name,
            course: settings.course,
            updated_at: new Date().toISOString()
          })
          .eq('id', supabaseUser.id);
        
        if (error) throw error;
      }
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated"
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)?.value;

    if (!email || !password) {
      setErrorMessage("Please enter email and password");
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message?.toLowerCase().includes("invalid login")) {
          toast({ title: "Login failed", description: "Invalid email or password.", variant: "destructive" });
        } else {
          toast({ title: "Login failed", description: error.message, variant: "destructive" });
        }
        setErrorMessage(error.message);
        return;
      }
      
      toast({ title: "Login successful", description: `Welcome back!` });
      setIsLoggedIn(true);
      setActiveTab("profile");
    } catch (error: any) {
      console.error("Login error:", error);
      toast({ 
        title: "Login error", 
        description: error?.message || "An unexpected error occurred", 
        variant: "destructive" 
      });
      setErrorMessage(error?.message || "An unexpected error occurred");
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setSupabaseUser(null);
      setSupabaseSession(null);
      setIsLoggedIn(false);
      toast({ title: "Logged out", description: "You have been logged out successfully" });
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({ 
        title: "Logout error", 
        description: error?.message || "An unexpected error occurred", 
        variant: "destructive" 
      });
    }
  };

  const activatePremium = async (tier: string) => {
    try {
      if (!isLoggedIn || !supabaseUser) {
        toast({
          title: "Login Required",
          description: "Please log in before upgrading to premium",
          variant: "destructive"
        });
        setActiveTab("profile");
        return;
      }
      
      const updatedSettings = {
        ...settings,
        isPremium: true,
        premiumTier: tier,
        paymentId: `demo-${Date.now()}`,
        subscriptionDate: new Date().toISOString(),
        expiryDate: tier === 'monthly' 
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      // Update in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ isPremium: true })
        .eq('id', supabaseUser.id);
      
      if (error) throw error;
      
      setSettings(updatedSettings);
      localStorage.setItem("userSettings", JSON.stringify(updatedSettings));
      
      toast({
        title: "Premium activated (Demo)",
        description: `Your premium subscription has been activated for demonstration purposes.`
      });
    } catch (error: any) {
      console.error("Premium activation error:", error);
      toast({ 
        title: "Premium activation error", 
        description: error?.message || "An unexpected error occurred", 
        variant: "destructive" 
      });
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };
  
  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
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

  // Check for reset-password route
  if (activeTab === "reset-password" || searchParams.has("access_token") || searchParams.get("type") === "recovery") {
    return <ResetPassword />;
  }
  
  return (
    <motion.div 
      className="w-full max-w-4xl mx-auto space-y-6"
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
                Settings
              </CardTitle>
              <CardDescription>
                Customize your Quizora AI experience
              </CardDescription>
            </div>
          </motion.div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Book className="h-4 w-4" />
                <span className="hidden sm:inline">Preferences</span>
              </TabsTrigger>
              <TabsTrigger value="premium" className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                <span className="hidden sm:inline">Premium</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="legal" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span className="hidden sm:inline">Legal</span>
              </TabsTrigger>
            </TabsList>
            
    <TabsContent value="profile">
      <ProfileTab
        settings={settings}
        setSettings={setSettings}
        handleChange={handleChange}
        saveSettings={saveSettings}
        isLoggedIn={isLoggedIn}
        supabaseUser={supabaseUser}
        handleLogout={handleLogout}
        authLoading={authLoading}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
        handleLogin={handleLogin}
        setActiveTab={setActiveTab}
      />
    </TabsContent>
    <TabsContent value="preferences">
      <PreferencesTab
        settings={settings}
        handleChange={handleChange}
        updateSetting={updateSetting}
        saveSettings={saveSettings}
      />
    </TabsContent>
    <TabsContent value="premium">
      <PremiumTab
        settings={settings}
        activatePremium={activatePremium}
      />
    </TabsContent>
    <TabsContent value="analytics">
      <AnalyticsTab
        settings={settings}
        quizHistory={quizHistory}
        navigateToQuiz={() => navigate("/")}
      />
    </TabsContent>
    <TabsContent value="legal">
      <LegalTab />
    </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
