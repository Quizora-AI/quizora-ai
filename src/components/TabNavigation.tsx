import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Question } from "@/components/FileUpload";
import { BrainCircuit, History, Book, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { BannerAd } from "@/components/GoogleAds";

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
    const path = location.pathname;
    
    if (path === '/history') setActiveTab('history');
    else if (path === '/flashcards') setActiveTab('flashcards');
    else if (path === '/settings') setActiveTab('settings');
    else setActiveTab('generate');

    const userSettings = localStorage.getItem("userSettings");
    if (userSettings) {
      try {
        const settings = JSON.parse(userSettings);
        setIsPremium(settings.isPremium === true);
      } catch (error) {
        console.error("Error parsing user settings:", error);
      }
    }
  }, [location.pathname]);

  const handleTabChange = (value: string) => {
    if (isChangingTab) return;
    
    console.log(`Changing tab to: ${value} from ${activeTab}`);
    setIsChangingTab(true);
    setActiveTab(value);

    requestAnimationFrame(() => {
      switch (value) {
        case 'history':
          navigate('/history', { replace: false });
          break;
        case 'flashcards':
          navigate('/flashcards', { replace: false });
          break;
        case 'settings':
          navigate('/settings', { replace: false });
          break;
        default:
          navigate('/quiz', { replace: false });
          break;
      }
      
      setTimeout(() => setIsChangingTab(false), 300);
    });
  };

  const tabIconStyle = "h-4 w-4 mr-2";

  return (
    <TooltipProvider>
      <motion.div className="w-full">
        <Tabs 
          defaultValue="generate" 
          className="w-full"
          value={activeTab}
          onValueChange={handleTabChange}
        >
          <TabsList className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 grid grid-cols-4 max-w-md w-[90%] shadow-md bg-background">
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
        </Tabs>
        
        <div className="fixed bottom-0 left-0 right-0 flex justify-center w-full bg-background/95 backdrop-blur-sm border-t border-border/30 py-2 z-40">
          <BannerAd 
            adUnitId="ca-app-pub-8270549953677995/2218567244"
            size="BANNER"
            className="max-w-md mx-auto"
          />
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
