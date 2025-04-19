
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { FileUpload } from "@/components/FileUpload";
import { QuizGenerator } from "@/components/QuizGenerator";
import { Question } from "@/components/FileUpload";
import { motion } from "framer-motion";

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
        {/* Use only the generate tab since we're focusing on AI generation */}
        <TabsList className="grid grid-cols-1 mb-8">
          <TabsTrigger value="generate">AI Quiz Generator</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate" className="mt-0">
          <QuizGenerator onQuizGenerated={onQuizGenerated} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
