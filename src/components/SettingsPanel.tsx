import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Settings, Book, Crown, Info, BarChart, Lock, CheckCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { CardFooter } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";

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
              <motion.div 
                variants={containerVariants}
                className="space-y-6"
              >
                <motion.div variants={itemVariants}>
                  <Label htmlFor="course" className="block mb-3">Course</Label>
                  <Input 
                    id="course" 
                    value={settings.course}
                    onChange={(e) => updateSetting('course', e.target.value)}
                    placeholder="Enter your course or subject (e.g. Chemistry, History, Programming)"
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter the course or subject you'd like to study
                  </p>
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
                  <motion.div variants={itemVariants} className="bg-gradient-to-r from-amber-500/20 to-orange-600/20 p-6 rounded-lg border border-amber-500/30">
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
                            <span>✓</span>
                            <span>Unlimited quizzes</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span>✓</span>
                            <span>Up to 50 questions per quiz</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span>✓</span>
                            <span>Custom time per question</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span>✓</span>
                            <span>Detailed analytics</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span>✓</span>
                            <span>Quizora AI Assistant</span>
                          </li>
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          onClick={() => activatePremium('monthly')}
                          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                        >
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
                            <span>✓</span>
                            <span>All monthly features</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span>✓</span>
                            <span>50% discount vs. monthly</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span>✓</span>
                            <span>Priority support</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span>✓</span>
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
                                  {Math.round(quizHistory.reduce((avg, quiz) => avg + quiz.score, 0) / quizHistory.length || 0)}%
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
                                  <span>✓</span>
                                  <span>Continue practicing with different topics to broaden your knowledge.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span>✓</span>
                                  <span>Focus on reviewing questions you got wrong to strengthen weak areas.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span>✓</span>
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
