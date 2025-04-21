
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { FileUpload } from "@/components/FileUpload";
import { QuizGenerator } from "@/components/QuizGenerator";
import { QuizHistory } from "@/components/QuizHistory";
import { AIAssistant } from "@/components/AIAssistant";
import { SettingsPanel } from "@/components/SettingsPanel";
import { Question } from "@/components/FileUpload";
import { motion } from "framer-motion";
import { BrainCircuit, History, MessageSquare, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";

interface TabNavigationProps {
  onQuizGenerated: (questions: Question[]) => void;
}

export function TabNavigation({ onQuizGenerated }: TabNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("generate");
  const [isPremium, setIsPremium] = useState(false);
  
  useEffect(() => {
    // Set active tab based on URL if it exists
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    
    if (lastPart === 'history') setActiveTab('history');
    else if (lastPart === 'assistant') setActiveTab('assistant');
    else if (lastPart === 'settings') setActiveTab('settings');
    else setActiveTab('generate');
    
    // Check if user has premium subscription
    const userSettings = localStorage.getItem("userSettings");
    if (userSettings) {
      const settings = JSON.parse(userSettings);
      setIsPremium(settings.isPremium === true);
    }
  }, [location.pathname]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Handle special case for assistant when user isn't premium
    if (value === "assistant" && !isPremium) {
      navigate('/settings?tab=premium');
      return;
    }
    
    // Update URL based on active tab
    switch (value) {
      case 'history':
        navigate('/history');
        break;
      case 'assistant':
        navigate('/assistant');
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        navigate('/');
        break;
    }
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };

  const tabIconStyle = "h-4 w-4 mr-2";

  return (
    <TooltipProvider>
      <motion.div 
        className="w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Tabs 
          defaultValue="generate" 
          className="w-full"
          value={activeTab}
          onValueChange={handleTabChange}
        >
          <TabsList className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 grid grid-cols-4 max-w-md w-[90%] shadow-lg border border-border/20">
            <TabsTrigger value="generate" className="flex items-center">
              <BrainCircuit className={tabIconStyle} />
              <span className="hidden sm:inline">Quiz</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <History className={tabIconStyle} />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="assistant" className="flex items-center">
              <MessageSquare className={tabIconStyle} />
              <span className="hidden sm:inline">Assistant</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Settings className={tabIconStyle} />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="pb-20"> {/* Add padding at the bottom to prevent content from being hidden behind the fixed tab bar */}
            <TabsContent value="generate" className="mt-0">
              <QuizGenerator onQuizGenerated={onQuizGenerated} />
            </TabsContent>
            
            <TabsContent value="history" className="mt-0">
              <QuizHistory />
            </TabsContent>
            
            <TabsContent value="assistant" className="mt-0">
              {isPremium ? (
                <AIAssistant />
              ) : (
                <Card className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h2 className="text-xl font-bold mb-2">Quizora Assistant</h2>
                    <p className="text-muted-foreground mb-6">
                      Upgrade to premium to access the Quizora AI Assistant and get personalized help with your studies.
                    </p>
                    <button
                      onClick={() => navigate('/settings?tab=premium')}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded"
                    >
                      Upgrade to Premium
                    </button>
                  </motion.div>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="settings" className="mt-0">
              <SettingsPanel />
            </TabsContent>
          </div>
        </Tabs>
      </motion.div>
    </TooltipProvider>
  );
}
