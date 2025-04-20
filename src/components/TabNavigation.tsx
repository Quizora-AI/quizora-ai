
import { useState } from "react";
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

interface TabNavigationProps {
  onQuizGenerated: (questions: Question[]) => void;
}

export function TabNavigation({ onQuizGenerated }: TabNavigationProps) {
  const [activeTab, setActiveTab] = useState("generate");
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
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
            <AIAssistant />
          </TabsContent>
          
          <TabsContent value="settings" className="mt-0">
            <SettingsPanel />
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
}
