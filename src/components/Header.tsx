import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Moon, 
  Sun, 
  Crown, 
  Sparkles
} from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TokenDisplay } from "./TokenDisplay";

export function Header() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isPremium, setIsPremium] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    setMounted(true);
    
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      }
    }

    const checkPremiumStatus = () => {
      const userSettings = localStorage.getItem("userSettings");
      if (userSettings) {
        try {
          const settings = JSON.parse(userSettings);
          
          if (settings.isPremium === true) {
            if (settings.expiryDate) {
              const expiryDate = new Date(settings.expiryDate);
              const now = new Date();
              
              if (expiryDate > now) {
                setIsPremium(true);
              } else {
                setIsPremium(false);
                
                const updatedSettings = {
                  ...settings,
                  isPremium: false
                };
                localStorage.setItem("userSettings", JSON.stringify(updatedSettings));
              }
            } else {
              setIsPremium(true);
            }
          } else {
            setIsPremium(false);
          }
        } catch (error) {
          console.error("Error checking premium status:", error);
          setIsPremium(false);
        }
      }
    };

    checkPremiumStatus();
    
    const intervalId = setInterval(checkPremiumStatus, 60000);
    return () => clearInterval(intervalId);
  }, []);
  
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handlePremiumClick = () => {
    navigate('/settings?tab=premium');
  };
  
  if (!mounted) return null;
  
  return (
    <header className="w-full py-4 px-6 bg-white dark:bg-gray-900 border-b">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <motion.div 
          className="flex items-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-2xl font-bold text-primary mr-2">Quizora</div>
          <div className="text-2xl font-light">AI</div>
        </motion.div>
        
        <div className="flex items-center gap-2">
          <TokenDisplay />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className={`rounded-full ${isPremium ? 'border-amber-400 bg-gradient-to-r from-amber-200 to-amber-400 text-amber-900' : 'border-gray-300'}`}
                  onClick={handlePremiumClick}
                >
                  {isPremium ? (
                    <Crown className="h-5 w-5" />
                  ) : (
                    <Sparkles className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isPremium ? 'Premium Active' : 'Go Premium'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                  {theme === "light" ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {theme === "light" ? 'Dark Mode' : 'Light Mode'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
}
