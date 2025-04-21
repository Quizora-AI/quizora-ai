
import { useState } from "react";
import { QuizHistory } from "@/components/QuizHistory";
import { FlashcardsHistory } from "@/components/Flashcards/FlashcardsHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { History as HistoryIcon, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const History = () => {
  const [activeTab, setActiveTab] = useState<string>("quizzes");

  return (
    <div className="max-w-4xl mx-auto w-full">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <Card className="border border-primary/10 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-full">
                <HistoryIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                  Learning History
                </CardTitle>
                <CardDescription>
                  Review your past quizzes and flashcards
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue="quizzes" 
              className="w-full" 
              onValueChange={setActiveTab}
              value={activeTab}
            >
              <TabsList className="grid grid-cols-2 mb-6 w-full max-w-md mx-auto">
                <TabsTrigger value="quizzes" className="flex items-center gap-2">
                  <HistoryIcon className="h-4 w-4" /> Quizzes
                </TabsTrigger>
                <TabsTrigger value="flashcards" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Flashcards
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="quizzes" className="mt-0">
                <QuizHistory />
              </TabsContent>
              
              <TabsContent value="flashcards" className="mt-0">
                <FlashcardsHistory />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default History;
