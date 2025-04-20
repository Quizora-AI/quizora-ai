
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Question } from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";
import { History, BookOpen, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface QuizHistoryEntry {
  id: string;
  date: string;
  title: string;
  questionsCount: number;
  score: number;
  questions: Question[];
}

export function QuizHistory() {
  const [history, setHistory] = useState<QuizHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch history from localStorage
    const fetchHistory = () => {
      setLoading(true);
      try {
        const historyString = localStorage.getItem("quizHistory");
        const historyData = historyString ? JSON.parse(historyString) : [];
        setHistory(historyData);
      } catch (error) {
        console.error("Failed to load quiz history:", error);
        toast({
          title: "Error",
          description: "Failed to load quiz history",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [toast]);

  const deleteHistoryEntry = (id: string) => {
    try {
      const updatedHistory = history.filter(entry => entry.id !== id);
      localStorage.setItem("quizHistory", JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
      toast({
        title: "Deleted",
        description: "Quiz history entry removed",
      });
    } catch (error) {
      console.error("Failed to delete quiz history entry:", error);
      toast({
        title: "Error",
        description: "Failed to delete quiz history entry",
        variant: "destructive"
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <motion.div 
      className="w-full max-w-4xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="bg-card/50 backdrop-blur-sm border border-primary/10 shadow-lg">
        <CardHeader className="pb-4">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="flex items-center gap-3"
          >
            <div className="bg-primary/10 p-3 rounded-full">
              <History className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                Quiz History
              </CardTitle>
              <CardDescription>
                Review your past quiz performances
              </CardDescription>
            </div>
          </motion.div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : history.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="text-center py-16 text-muted-foreground"
            >
              <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-40" />
              <h3 className="text-xl font-medium mb-2">No quiz history yet</h3>
              <p>Complete your first quiz to see your history here</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => (
                <motion.div
                  key={entry.id}
                  variants={itemVariants}
                  className="bg-background/60 rounded-lg p-4 border border-border/50 hover:border-primary/30 transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-lg">{entry.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          entry.score >= 80 ? 'bg-green-100 text-green-800' :
                          entry.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {entry.score}%
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(entry.date), "MMM d, yyyy 'at' h:mm a")} • 
                        {entry.questionsCount} questions
                      </div>
                    </div>
                    <Button
                      variant="ghost" 
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteHistoryEntry(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
