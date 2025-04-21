
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileUpload } from "@/components/FileUpload";
import { QuizGenerator } from "@/components/QuizGenerator";
import { QuizHistory } from "@/components/QuizHistory";
import { FlashcardsFlow } from "@/components/Flashcards/FlashcardsFlow";
import { FlashcardsHistory } from "@/components/Flashcards/FlashcardsHistory";
import { SettingsPanel } from "@/components/SettingsPanel";
import { Question } from "@/components/FileUpload";
import { motion } from "framer-motion";
import { BrainCircuit, History, Book, Settings } from "lucide-react";
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
    else if (lastPart === 'flashcards') setActiveTab('flashcards');
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

    if (value === "flashcards" && !isPremium) {
      // Free users can use flashcards with limited functionality
      navigate('/flashcards');
      setTimeout(() => setIsChangingTab(false), 300);
      return;
    }

    switch (value) {
      case 'history':
        navigate('/history');
        break;
      case 'flashcards':
        navigate('/flashcards');
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
          <TabsList className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 grid grid-cols-4 max-w-md w-[90%] shadow-lg border border-border/20">
            <TabsTrigger value="generate" className="flex items-center" disabled={isChangingTab}>
              <BrainCircuit className={tabIconStyle} />
              <span className="hidden sm:inline">Quiz</span>
            </TabsTrigger>
            <TabsTrigger value="flashcards" className="flex items-center" disabled={isChangingTab}>
              <Book className={tabIconStyle} />
              <span className="hidden sm:inline">Flashcards</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center" disabled={isChangingTab}>
              <History className={tabIconStyle} />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center" disabled={isChangingTab}>
              <Settings className={tabIconStyle} />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="pb-20">
            <TabsContent value="generate" className="mt-0">
              <QuizGenerator onQuizGenerated={onQuizGenerated} />
            </TabsContent>
            <TabsContent value="flashcards" className="mt-0">
              {isPremium ? (
                <FlashcardsFlow key="flashcards-component" />
              ) : (
                <Card className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Book className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h2 className="text-xl font-bold mb-2">Flashcards</h2>
                    <p className="text-muted-foreground mb-6">
                      Free users can create up to 10 flashcards per set. Upgrade to premium to create up to 30 flashcards per set!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        onClick={() => navigate('/settings?tab=premium')}
                        variant="outline"
                      >
                        Upgrade to Premium
                      </Button>
                      <Button
                        onClick={() => navigate('/flashcards')}
                      >
                        Try Free Version
                      </Button>
                    </div>
                  </motion.div>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="history" className="mt-0">
              <FlashcardsHistory />
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
