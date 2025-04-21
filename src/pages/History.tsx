
import { useState } from "react";
import { QuizHistory } from "@/components/QuizHistory";
import { FlashcardsHistory } from "@/components/Flashcards/FlashcardsHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

const History = () => {
  const [activeTab, setActiveTab] = useState<string>("quizzes");

  return (
    <div className="max-w-4xl mx-auto w-full">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold mb-6">History</h1>
        
        <Tabs 
          defaultValue="quizzes" 
          className="w-full" 
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <TabsList className="grid grid-cols-2 mb-6 w-full max-w-md mx-auto">
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
          </TabsList>
          
          <TabsContent value="quizzes" className="mt-0">
            <QuizHistory />
          </TabsContent>
          
          <TabsContent value="flashcards" className="mt-0">
            <FlashcardsHistory />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default History;
