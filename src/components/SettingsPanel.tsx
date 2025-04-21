
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Settings, Book, Crown, Info, BarChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams, useNavigate } from "react-router-dom";
import { SettingsPreferences } from "./SettingsPreferences";
import { PremiumPanel } from "./PremiumPanel";
import { AnalyticsPanel } from "./AnalyticsPanel";
import { LegalPanel } from "./LegalPanel";

interface UserSettings {
  course: string;
  autoSave: boolean;
  theme: "light" | "dark" | "system";
  difficulty: "easy" | "medium" | "hard";
  isPremium: boolean;
  premiumTier?: string;
  paymentId?: string;
  subscriptionDate?: string;
  expiryDate?: string;
}

export function SettingsPanel() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "preferences";
  
  const [settings, setSettings] = useState<UserSettings>({
    course: "",
    autoSave: true,
    theme: "system",
    difficulty: "medium",
    isPremium: false
  });
  
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("userSettings");
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
      
      const savedAutoSave = localStorage.getItem("autoSave");
      if (savedAutoSave !== null) {
        setSettings(prev => ({
          ...prev,
          autoSave: savedAutoSave !== "false"
        }));
      }

      const historyStr = localStorage.getItem("quizHistory");
      if (historyStr) {
        setQuizHistory(JSON.parse(historyStr));
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }, []);
  
  const saveSettings = () => {
    try {
      localStorage.setItem("userSettings", JSON.stringify(settings));
      localStorage.setItem("autoSave", settings.autoSave.toString());
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

  const updateSetting = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleGoToPremium = () => setActiveTab("premium");
  
  const activatePremium = (tier: string) => {
    if (window.Razorpay) {
      const options = {
        key: "rzp_test_YourTestKey",
        amount: tier === 'monthly' ? 249 * 100 : 1500 * 100,
        currency: "INR",
        name: "Quizora AI",
        description: tier === 'monthly' ? "Monthly Premium Subscription" : "Annual Premium Subscription",
        image: "https://example.com/your_logo",
        handler: function (response: any) {
          const updatedSettings = {
            ...settings,
            isPremium: true,
            premiumTier: tier,
            paymentId: response.razorpay_payment_id,
            subscriptionDate: new Date().toISOString(),
            expiryDate: tier === 'monthly' 
              ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
              : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          };
          setSettings(updatedSettings);
          localStorage.setItem("userSettings", JSON.stringify(updatedSettings));
          toast({
            title: "Premium activated",
            description: `Thank you for subscribing to Quizora AI Premium!`
          });
        },
        theme: { color: "#6366F1" }
      };
      try {
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } catch (error) {
        simulatePremiumActivation(tier);
      }
    } else {
      simulatePremiumActivation(tier);
    }
  };

  const simulatePremiumActivation = (tier: string) => {
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
    setSettings(updatedSettings);
    localStorage.setItem("userSettings", JSON.stringify(updatedSettings));
    toast({
      title: "Premium activated (Demo)",
      description: `Your premium subscription has been activated for demonstration purposes.`
    });
  };

  return (
    <motion.div className="w-full max-w-4xl mx-auto space-y-6"
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
            <TabsList className="grid grid-cols-4 mb-6">
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
            <TabsContent value="preferences">
              <SettingsPreferences
                settings={settings}
                updateSetting={updateSetting}
                saveSettings={saveSettings}
              />
            </TabsContent>
            <TabsContent value="premium">
              <PremiumPanel
                isPremium={settings.isPremium}
                settings={settings}
                activatePremium={activatePremium}
              />
            </TabsContent>
            <TabsContent value="analytics">
              <AnalyticsPanel
                isPremium={settings.isPremium}
                quizHistory={quizHistory}
                navigate={navigate}
              />
            </TabsContent>
            <TabsContent value="legal">
              <LegalPanel navigate={navigate} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
