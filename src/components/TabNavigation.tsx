
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";

interface TabNavigationProps {
  onQuizGenerated: (questions: Question[]) => void;
}

export function TabNavigation({ onQuizGenerated }: TabNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("generate");
  const [isPremium, setIsPremium] = useState(false);
  const [isChangingTab, setIsChangingTab] = useState(false);
  
  useEffect(() => {
    // Determine active tab from URL path
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];

    if (lastPart === 'history') setActiveTab('history');
    else if (lastPart === 'assistant') setActiveTab('assistant');
    else if (lastPart === 'settings') setActiveTab('settings');
    else setActiveTab('generate');

    // Check premium status from local storage
    const userSettings = localStorage.getItem("userSettings");
    if (userSettings) {
      const settings = JSON.parse(userSettings);
      setIsPremium(settings.isPremium === true);
    }
  }, [location.pathname]);

  const handleTabChange = (value: string) => {
    if (isChangingTab) return;
    setIsChangingTab(true);
    setActiveTab(value);

    if (value === "assistant" && !isPremium) {
      navigate('/settings?tab=premium');
      setTimeout(() => setIsChangingTab(false), 300);
      return;
    }

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

    setTimeout(() => setIsChangingTab(false), 300);
  };

  // Only show "Create New Quiz" button on generate tab (bottom mobile bar)
  const handleCreateNewQuiz = () => {
    const userSettings = localStorage.getItem("userSettings");
    const quizHistory = localStorage.getItem("quizHistory");
    const historyData = quizHistory ? JSON.parse(quizHistory) : [];
    
    if (userSettings) {
      const settings = JSON.parse(userSettings);
      if (!settings.isPremium && historyData.length >= 2) {
        toast({
          title: "Free Quiz Limit Reached",
          description: "Upgrade to premium for unlimited quizzes!"
        });
        navigate('/settings?tab=premium');
        return;
      }
    }
    localStorage.removeItem("quizToRetake");
    navigate("/");
    setActiveTab("generate");
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
          {/* Removed top area with back button & duplicate Create New Quiz button */}
          <TabsList className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 grid grid-cols-4 max-w-md w-[90%] shadow-lg border border-border/20">
            <TabsTrigger value="generate" className="flex items-center" disabled={isChangingTab}>
              <BrainCircuit className={tabIconStyle} />
              <span className="hidden sm:inline">Quiz</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center" disabled={isChangingTab}>
              <History className={tabIconStyle} />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="assistant" className="flex items-center" disabled={isChangingTab}>
              <MessageSquare className={tabIconStyle} />
              <span className="hidden sm:inline">Assistant</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center" disabled={isChangingTab}>
              <Settings className={tabIconStyle} />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="pb-20">
            <TabsContent value="generate" className="mt-0">
              {/* Add Create New Quiz button in contextually correct location below, if needed */}
              <div className="flex justify-end mb-3">
                <Button 
                  variant="default"
                  size="sm"
                  className="gap-2"
                  onClick={handleCreateNewQuiz}
                >
                  Create New Quiz
                </Button>
              </div>
              <QuizGenerator onQuizGenerated={onQuizGenerated} />
            </TabsContent>
            <TabsContent value="history" className="mt-0">
              <QuizHistory />
            </TabsContent>
            <TabsContent value="assistant" className="mt-0">
              {isPremium ? (
                <AIAssistant key="assistant-component" />
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
                    <Button
                      onClick={() => navigate('/settings?tab=premium')}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded"
                    >
                      Upgrade to Premium
                    </Button>
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
// This file is getting quite long. Please consider refactoring TabNavigation into smaller components for cleanliness.
