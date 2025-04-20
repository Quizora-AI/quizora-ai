
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Settings, User, Info, Globe, Book, Check } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface UserSettings {
  name: string;
  email: string;
  language: string;
  course: string;
  autoSave: boolean;
  theme: "light" | "dark" | "system";
  difficulty: "easy" | "medium" | "hard";
}

export function SettingsPanel() {
  const [settings, setSettings] = useState<UserSettings>({
    name: "",
    email: "",
    language: "en",
    course: "medical",
    autoSave: true,
    theme: "system",
    difficulty: "medium",
  });
  
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();
  
  useEffect(() => {
    // Load settings from localStorage
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
  
  return (
    <motion.div 
      className="w-full max-w-4xl mx-auto"
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
                Customize your quiz app experience
              </CardDescription>
            </div>
          </motion.div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Book className="h-4 w-4" />
                <span>Preferences</span>
              </TabsTrigger>
              <TabsTrigger value="about" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span>About</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <motion.div 
                variants={containerVariants}
                className="space-y-6"
              >
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
                
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    value={settings.email} 
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                  />
                </motion.div>
                
                <motion.div variants={itemVariants} className="pt-4">
                  <Button onClick={saveSettings}>Save Profile</Button>
                </motion.div>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="preferences">
              <motion.div 
                variants={containerVariants}
                className="space-y-6"
              >
                <motion.div variants={itemVariants}>
                  <Label className="block mb-3">Language</Label>
                  <ToggleGroup 
                    type="single" 
                    value={settings.language}
                    onValueChange={(value) => {
                      if (value) updateSetting('language', value);
                    }}
                    className="justify-start"
                  >
                    <ToggleGroupItem value="en" aria-label="English">
                      <Globe className="h-4 w-4 mr-1" />
                      English
                    </ToggleGroupItem>
                    <ToggleGroupItem value="es" aria-label="Spanish">
                      <Globe className="h-4 w-4 mr-1" />
                      Spanish
                    </ToggleGroupItem>
                    <ToggleGroupItem value="fr" aria-label="French">
                      <Globe className="h-4 w-4 mr-1" />
                      French
                    </ToggleGroupItem>
                  </ToggleGroup>
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
            
            <TabsContent value="about">
              <motion.div 
                variants={containerVariants}
                className="space-y-6"
              >
                <motion.div variants={itemVariants}>
                  <h3 className="text-lg font-medium mb-2">About Medical Quiz App</h3>
                  <p className="text-muted-foreground">
                    Medical Quiz is an AI-powered educational application designed to help medical students
                    and professionals test and improve their knowledge through personalized quizzes and feedback.
                  </p>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <h3 className="text-lg font-medium mb-2">Version</h3>
                  <p className="text-muted-foreground">1.0.0</p>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <h3 className="text-lg font-medium mb-2">Contact Us</h3>
                  <p className="text-muted-foreground mb-1">
                    For support or feedback, please contact:
                  </p>
                  <p className="text-primary">support@medicalquiz.com</p>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <h3 className="text-lg font-medium mb-2">Privacy Policy</h3>
                  <p className="text-muted-foreground">
                    Your data privacy is important to us. We only store information locally on your device
                    and do not share any personal information with third parties.
                  </p>
                  <Button variant="link" className="pl-0 mt-2">
                    Read Full Privacy Policy
                  </Button>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <h3 className="text-lg font-medium mb-2">Terms of Service</h3>
                  <p className="text-muted-foreground">
                    By using this application, you agree to our terms of service which outline
                    the appropriate use of this educational tool.
                  </p>
                  <Button variant="link" className="pl-0 mt-2">
                    Read Terms of Service
                  </Button>
                </motion.div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
