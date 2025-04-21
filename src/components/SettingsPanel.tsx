import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  User, 
  Info, 
  Globe, 
  Book, 
  Check, 
  Crown, 
  Lock,
  ChevronDown,
  CreditCard,
  CheckCircle,
  BarChart
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface UserSettings {
  name: string;
  email: string;
  language: string;
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

const languages = [
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "hi", label: "Hindi", flag: "🇮🇳" },
  { value: "gu", label: "Gujarati", flag: "🇮🇳" },
  { value: "bn", label: "Bengali", flag: "🇧🇩" },
  { value: "ta", label: "Tamil", flag: "🇮🇳" },
  { value: "te", label: "Telugu", flag: "🇮🇳" },
  { value: "ml", label: "Malayalam", flag: "🇮🇳" },
  { value: "kn", label: "Kannada", flag: "🇮🇳" },
  { value: "mr", label: "Marathi", flag: "🇮🇳" },
  { value: "pa", label: "Punjabi", flag: "🇮🇳" },
  { value: "ur", label: "Urdu", flag: "🇮🇳" },
  { value: "es", label: "Spanish", flag: "🇪🇸" },
  { value: "fr", label: "French", flag: "🇫🇷" },
  { value: "de", label: "German", flag: "🇩🇪" },
  { value: "it", label: "Italian", flag: "🇮🇹" },
  { value: "pt", label: "Portuguese", flag: "🇵🇹" },
  { value: "ru", label: "Russian", flag: "🇷🇺" },
  { value: "ja", label: "Japanese", flag: "🇯🇵" },
  { value: "ko", label: "Korean", flag: "🇰🇷" },
  { value: "zh", label: "Chinese", flag: "🇨🇳" },
  { value: "ar", label: "Arabic", flag: "🇸🇦" },
];

export function SettingsPanel() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "profile";
  
  const [settings, setSettings] = useState<UserSettings>({
    name: "",
    email: "",
    language: "en",
    course: "medical",
    autoSave: true,
    theme: "system",
    difficulty: "medium",
    isPremium: false
  });
  
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
      
      const userEmail = localStorage.getItem("userEmail");
      setIsLoggedIn(!!userEmail);
      if (userEmail) {
        setSettings(prev => ({
          ...prev,
          email: userEmail
        }));
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!settings.email) {
      toast({
        title: "Login failed",
        description: "Email is required",
        variant: "destructive"
      });
      return;
    }
    
    localStorage.setItem("userEmail", settings.email);
    setIsLoggedIn(true);
    
    toast({
      title: "Login successful",
      description: `Welcome back, ${settings.name || settings.email}!`
    });
  };
  
  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    setIsLoggedIn(false);
    
    toast({
      title: "Logged out",
      description: "You have been logged out successfully"
    });
  };
  
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
          console.log("Payment ID: " + response.razorpay_payment_id);
          
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
        prefill: {
          email: settings.email,
          name: settings.name
        },
        theme: {
          color: "#6366F1"
        }
      };
      
      try {
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } catch (error) {
        console.error("Razorpay error:", error);
        
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
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };
  
  const updateSetting = (key: keyof UserSettings, value: any) => {
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

  const handleGoToPremium = () => {
    setActiveTab("premium");
  };
  
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
              <motion.div 
                variants={containerVariants}
                className="space-y-6"
              >
                {isLoggedIn ? (
                  <>
                    <motion.div variants={itemVariants} className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                      <div>
                        <h3 className="font-medium">Logged in as</h3>
                        <p className="text-sm text-muted-foreground">{settings.email}</p>
                      </div>
                      <Button onClick={handleLogout} variant="outline" size="sm">Log Out</Button>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        value={settings.name} 
                        onChange={handleChange}
                        placeholder="Your name"
                      />
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="pt-4">
                      <Button onClick={saveSettings}>Save Profile</Button>
                    </motion.div>
                  </>
                ) : (
                  <form onSubmit={handleLogin}>
                    <motion.div variants={itemVariants} className="space-y-6">
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
                        <div className="text-center">
                          <span className="text-sm text-muted-foreground">Don't have an account? </span>
                          <Button variant="link" className="p-0 h-auto" onClick={() => setActiveTab("register")}>Register</Button>
                        </div>
                      </div>
                    </motion.div>
                  </form>
                )}
              </motion.div>
            </TabsContent>
            
            <TabsContent value="register">
              <motion.div 
                variants={containerVariants}
                className="space-y-6"
              >
                <motion.div variants={itemVariants} className="text-center mb-6">
                  <h2 className="text-xl font-bold">Create an Account</h2>
                  <p className="text-sm text-muted-foreground">Join Quizora AI to save your quizzes and track progress</p>
                </motion.div>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  localStorage.setItem("userEmail", settings.email);
                  setIsLoggedIn(true);
                  toast({
                    title: "Account created",
                    description: "Your account has been created successfully!"
                  });
                }}>
                  <motion.div variants={itemVariants} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-name">Name</Label>
                      <Input 
                        id="reg-name" 
                        name="name" 
                        value={settings.name} 
                        onChange={handleChange}
                        placeholder="Your name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <Input 
                        id="reg-email" 
                        name="email" 
                        value={settings.email} 
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                        type="email"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <Input 
                        id="reg-password" 
                        name="password" 
                        type="password"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reg-confirm-password">Confirm Password</Label>
                      <Input 
                        id="reg-confirm-password" 
                        name="confirmPassword" 
                        type="password"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    
                    <div className="space-y-4 pt-2">
                      <Button type="submit" className="w-full">Create Account</Button>
                      <div className="text-center">
                        <span className="text-sm text-muted-foreground">Already have an account? </span>
                        <Button variant="link" className="p-0 h-auto" onClick={() => setActiveTab("profile")}>Sign In</Button>
                      </div>
                    </div>
                  </motion.div>
                </form>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="preferences">
              <motion.div 
                variants={containerVariants}
                className="space-y-6"
              >
                <motion.div variants={itemVariants}>
                  <Label className="block mb-3">Language</Label>
                  <Select 
                    value={settings.language}
                    onValueChange={(value) => updateSetting('language', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((language) => (
                        <SelectItem key={language.value} value={language.value}>
                          <div className="flex items-center">
                            <span className="mr-2">{language.flag}</span>
                            {language.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Label className="block mb-3">Course</Label>
                  <RadioGroup 
                    value={settings.course}
                    onValueChange={(value) => updateSetting('course', value)}
                    className="grid grid-cols-2 gap-2 sm:grid-cols-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medical" id="medical" />
                      <Label htmlFor="medical">Medical</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="engineering" id="engineering" />
                      <Label htmlFor="engineering">Engineering</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="science" id="science" />
                      <Label htmlFor="science">Science</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="arts" id="arts" />
                      <Label htmlFor="arts">Arts</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="commerce" id="commerce" />
                      <Label htmlFor="commerce">Commerce</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="upsc" id="upsc" />
                      <Label htmlFor="upsc">UPSC</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="school" id="school" />
                      <Label htmlFor="school">K-12</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="competitive" id="competitive" />
                      <Label htmlFor="competitive">Competitive</Label>
                    </div>
                  </RadioGroup>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Label className="block mb-3">Default Difficulty</Label>
                  <RadioGroup 
                    value={settings.difficulty}
                    onValueChange={(value: "easy" | "medium" | "hard") => updateSetting('difficulty', value)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="easy" id="easy" />
                      <Label htmlFor="easy">Easy</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hard" id="hard" />
                      <Label htmlFor="hard">Hard</Label>
                    </div>
                  </RadioGroup>
                </motion.div>
                
                <motion.div variants={itemVariants} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoSave">Auto-save quiz results</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically save quiz results to history
                    </p>
                  </div>
                  <Switch 
                    id="autoSave" 
                    checked={settings.autoSave} 
                    onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                  />
                </motion.div>
                
                <motion.div variants={itemVariants} className="pt-4">
                  <Button onClick={saveSettings}>Save Preferences</Button>
                </motion.div>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="premium">
              <motion.div 
                variants={containerVariants}
                className="space-y-8"
              >
                <motion.div variants={itemVariants} className="text-center">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent inline-flex items-center gap-2">
                    <Crown className="h-6 w-6 text-amber-500" />
                    Quizora AI Premium
                  </h2>
                  <p className="text-muted-foreground mt-2">
                    Unlock the full potential of your learning with Quizora AI Premium
                  </p>
                </motion.div>
                
                {settings.isPremium ? (
                  <motion.div 
                    variants={itemVariants}
                    className="bg-gradient-to-r from-amber-500/20 to-orange-600/20 p-6 rounded-lg border border-amber-500/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-500/20 p-2 rounded-full">
                        <CheckCircle className="h-6 w-6 text-amber-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">Premium Active</h3>
                        <p className="text-sm text-muted-foreground">
                          You're enjoying all premium features of Quizora AI
                        </p>
                      </div>
                    </div>
                    {settings.expiryDate && (
                      <div className="mt-4 text-sm">
                        <p className="text-muted-foreground">
                          Your {settings.premiumTier} subscription is active until {new Date(settings.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-amber-500/30 hover:border-amber-500/50 transition-all">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Monthly</span>
                          <Badge className="bg-amber-500">Popular</Badge>
                        </CardTitle>
                        <div className="flex items-baseline">
                          <span className="text-3xl font-bold">$2.49</span>
                          <span className="text-muted-foreground ml-1">/ month</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Unlimited quizzes</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Up to 50 questions per quiz</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Custom time per question</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Detailed analytics</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Quizora AI Assistant</span>
                          </li>
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          onClick={() => activatePremium('monthly')}
                          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          Subscribe Monthly
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card className="border-amber-500/30 hover:border-amber-500/50 transition-all">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Annual</span>
                          <Badge className="bg-green-600">Save 50%</Badge>
                        </CardTitle>
                        <div className="flex items-baseline">
                          <span className="text-3xl font-bold">$15.00</span>
                          <span className="text-muted-foreground ml-1">/ year</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>All monthly features</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>50% discount vs. monthly</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Priority support</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Early access to new features</span>
                          </li>
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          onClick={() => activatePremium('yearly')}
                          className="w-full"
                          variant="outline"
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          Subscribe Yearly
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                )}
                
                <motion.div variants={itemVariants}>
                  <div className="rounded-lg bg-muted p-4">
                    <h3 className="text-lg font-medium mb-2">Free vs Premium</h3>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="font-medium">Feature</div>
                      <div className="font-medium">Free</div>
                      <div className="font-medium">Premium</div>
                      
                      <div>Quizzes</div>
                      <div className="text-muted-foreground">2 max</div>
                      <div className="text-green-600">Unlimited</div>
                      
                      <div>Questions per quiz</div>
                      <div className="text-muted-foreground">10 max</div>
                      <div className="text-green-600">Up to 50</div>
                      
                      <div>Time per question</div>
                      <div className="text-muted-foreground">Fixed 30s</div>
                      <div className="text-green-600">Adjustable</div>
                      
                      <div>Analytics</div>
                      <div className="text-muted-foreground">Basic</div>
                      <div className="text-green-600">Advanced</div>
                      
                      <div>AI Assistant</div>
                      <div className="text-muted-foreground">Not available</div>
                      <div className="text-green-600">Full access</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="analytics">
              <motion.div 
                variants={containerVariants}
                className="space-y-6"
              >
                {settings.isPremium ? (
                  <>
                    <motion.div variants={itemVariants} className="text-center">
                      <h2 className="text-xl font-bold mb-2">Performance Overview</h2>
                      <p className="text-muted-foreground text-sm">
                        Track your learning progress and identify areas for improvement
                      </p>
                    </motion.div>
                    
                    {quizHistory.length > 0 ? (
                      <>
                        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-center">
                                <div className="text-3xl font-bold">{quizHistory.length}</div>
                                <p className="text-sm text-muted-foreground">Total Quizzes Taken</p>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-center">
                                <div className="text-3xl font-bold">
                                  {quizHistory.reduce((avg, quiz) => avg + quiz.score, 0) / quizHistory.length || 0}%
                                </div>
                                <p className="text-sm text-muted-foreground">Average Score</p>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-center">
                                <div className="text-3xl font-bold">
                                  {quizHistory.reduce((total, quiz) => total + quiz.questionsCount, 0)}
                                </div>
                                <p className="text-sm text-muted-foreground">Total Questions Answered</p>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                        
                        <motion.div variants={itemVariants}>
                          <Card>
                            <CardHeader>
                              <CardTitle>Improvement Suggestions</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                <li className="flex items-start gap-2">
                                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                                  <span>Continue practicing with different topics to broaden your knowledge.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                                  <span>Focus on reviewing questions you got wrong to strengthen weak areas.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                                  <span>Try gradually increasing the difficulty level as you improve.</span>
                                </li>
                              </ul>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </>
                    ) : (
                      <motion.div variants={itemVariants} className="text-center p-8">
                        <p className="text-muted-foreground">
                          No quiz history found. Take some quizzes to see your analytics!
                        </p>
                        <Button 
                          onClick={() => navigate('/')} 
                          variant="outline"
                          className="mt-4"
                        >
                          Create Your First Quiz
                        </Button>
                      </motion.div>
                    )}
                  </>
                ) : (
                  <motion.div variants={itemVariants} className="text-center p-8">
                    <div className="flex justify-center mb-4">
                      <Lock className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">Premium Feature</h3>
                    <p className="text-muted-foreground mb-6">
                      Advanced analytics is a premium feature. Upgrade to access detailed insights and performance tracking.
                    </p>
                    <Button onClick={handleGoToPremium}>
                      <Crown className="mr-2 h-4 w-4" />
                      Go Premium
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </TabsContent>
            
            <TabsContent value="legal">
              <motion.div 
                variants={containerVariants}
                className="space-y-4"
              >
                <motion.div variants={itemVariants}>
                  <Button variant="outline" className="w-full flex justify-between" onClick={() => navigate('/legal?page=about')}>
                    <span>About Quizora AI</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Button variant="outline" className="w-full flex justify-between" onClick={() => navigate('/legal?page=privacy')}>
                    <span>Privacy Policy</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Button variant="outline" className="w-full flex justify-between" onClick={() => navigate('/legal?page=terms')}>
                    <span>Terms of Service</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Button variant="outline" className="w-full flex justify-between" onClick={() => navigate('/legal?page=contact')}>
                    <span>Contact Us</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </motion.div>
                
                <motion.div variants={itemVariants} className="pt-4">
                  <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Quizora AI</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Version 1.0.1
                        </p>
                        <p className="text-sm text-muted-foreground">
                          © 2025 Quizora AI. All rights reserved.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
