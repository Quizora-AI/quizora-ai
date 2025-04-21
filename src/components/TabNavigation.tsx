
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Question } from "@/components/FileUpload";
import { BrainCircuit, History, Book, Settings, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
  const { isAuthenticated, user, logout } = useAuth0();
  
  useEffect(() => {
    // Determine active tab from URL path
    const path = location.pathname;
    
    if (path === '/history') setActiveTab('history');
    else if (path === '/flashcards') setActiveTab('flashcards');
    else if (path === '/settings') setActiveTab('settings');
    else setActiveTab('generate');

    // Check premium status 
    if (isAuthenticated && user) {
      // Try to get premium status from user metadata
      const userPremium = user['https://quizora.app/premium'] === true;
      setIsPremium(userPremium);
    } else {
      // Check premium status from local storage
      const userSettings = localStorage.getItem("userSettings");
      if (userSettings) {
        try {
          const settings = JSON.parse(userSettings);
          setIsPremium(settings.isPremium === true);
        } catch (error) {
          console.error("Error parsing user settings:", error);
        }
      }
    }
  }, [location.pathname, isAuthenticated, user]);

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

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin + '/landing' } });
    toast({
      title: "Logged out",
      description: "You have been logged out successfully"
    });
  };

  const tabIconStyle = "h-4 w-4 mr-2";

  return (
    <TooltipProvider>
      <motion.div 
        className="w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%] flex justify-center">
          <Tabs 
            defaultValue="generate" 
            className="w-full"
            value={activeTab}
            onValueChange={handleTabChange}
          >
            <TabsList className="grid grid-cols-4 shadow-lg bg-background/80 backdrop-blur-md rounded-full border border-muted">
              <TabsTrigger value="generate" className="flex items-center rounded-l-full" disabled={isChangingTab}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <BrainCircuit className={tabIconStyle} />
                      <span className="hidden sm:inline">Quiz</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Generate quizzes</TooltipContent>
                </Tooltip>
              </TabsTrigger>
              
              <TabsTrigger value="flashcards" className="flex items-center" disabled={isChangingTab}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <Book className={tabIconStyle} />
                      <span className="hidden sm:inline">Flashcards</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Flashcards</TooltipContent>
                </Tooltip>
              </TabsTrigger>
              
              <TabsTrigger value="history" className="flex items-center" disabled={isChangingTab}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <History className={tabIconStyle} />
                      <span className="hidden sm:inline">History</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Quiz history</TooltipContent>
                </Tooltip>
              </TabsTrigger>
              
              <TabsTrigger value="settings" className="flex items-center rounded-r-full" disabled={isChangingTab}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      {isAuthenticated && user ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger className="flex items-center focus:outline-none">
                            <Avatar className="h-5 w-5 mr-2">
                              <AvatarImage src={user.picture} alt={user.name || "User"} />
                              <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                            </Avatar>
                            <span className="hidden sm:inline">Profile</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate('/settings')}>
                              <Settings className="h-4 w-4 mr-2" />
                              Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleLogout}>
                              <LogOut className="h-4 w-4 mr-2" />
                              Logout
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <>
                          <Settings className={tabIconStyle} />
                          <span className="hidden sm:inline">Settings</span>
                        </>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Settings</TooltipContent>
                </Tooltip>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
