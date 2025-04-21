import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Question } from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";
import { History, BookOpen, Trash2, ArrowRight, BarChart } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface QuizHistoryEntry {
  id: string;
  date: string;
  title: string;
  questionsCount: number;
  score: number;
  questions: Question[];
  attempts?: number;
}

export function QuizHistory() {
  const [history, setHistory] = useState<QuizHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFreeWarning, setShowFreeWarning] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch history from Supabase instead of localStorage!
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const user = (await supabase.auth.getUser()).data.user;
        if(!user) {
          setHistory([]);
          setLoading(false);
          return;
        }
        const { data, error } = await supabase
          .from("quiz_attempts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Add calculated attempts field from number of attempts
        const output = data?.map((quiz: any) => ({
          ...quiz,
          attempts: quiz.user_answers ? 1 : 0 // basic, enhance as needed
        })) || [];
        setHistory(output);

        // Check premium status
        const profileData = await supabase.from("profiles").select("isPremium").eq("id", user.id).maybeSingle();
        const isPremium = profileData?.data?.isPremium === true;
        
        if (!isPremium && output.length >= 2) setShowFreeWarning(true);
        else setShowFreeWarning(false);

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

  const deleteHistoryEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
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

  const viewQuiz = (entry: QuizHistoryEntry) => {
    // Save selected quiz to localStorage
    localStorage.setItem("selectedQuiz", JSON.stringify(entry));
    
    // If the quiz has attempts, increment it
    if (!entry.attempts) {
      entry.attempts = 1;
    } else {
      entry.attempts += 1;
    }
    
    // Update the quiz in history
    const updatedHistory = history.map(item => 
      item.id === entry.id ? entry : item
    );
    localStorage.setItem("quizHistory", JSON.stringify(updatedHistory));
    
    // Navigate to a quiz review page
    navigate(`/history/${entry.id}`);
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

  const createNewQuiz = () => {
    // Check if user has reached free limit
    const userSettings = localStorage.getItem("userSettings");
    if (userSettings) {
      const settings = JSON.parse(userSettings);
      if (!settings.isPremium && history.length >= 2) {
        navigate('/settings?tab=premium');
        toast({
          title: "Free Quiz Limit Reached",
          description: "Upgrade to premium for unlimited quizzes!"
        });
        return;
      }
    }
    
    navigate('/');
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
          {showFreeWarning && (
            <motion.div
              variants={itemVariants}
              className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-center"
            >
              <p className="text-red-800 dark:text-red-300 font-medium">
                Free Quiz Limit Reached
              </p>
              <p className="text-sm text-red-700 dark:text-red-400 mb-2">
                You've reached the limit of 2 free quizzes. Upgrade to premium for unlimited quizzes!
              </p>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => navigate('/settings?tab=premium')}
              >
                Upgrade to Premium
              </Button>
            </motion.div>
          )}
        
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
              <p className="mb-6">Complete your first quiz to see your history here</p>
              <Button onClick={createNewQuiz}>Create New Quiz</Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => (
                <motion.div
                  key={entry.id}
                  variants={itemVariants}
                  className="bg-background/60 rounded-lg p-4 border border-border/50 hover:border-primary/30 transition-all duration-300 group cursor-pointer"
                  onClick={() => viewQuiz(entry)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-lg">{entry.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          entry.score >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                          entry.score >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                        }`}>
                          {entry.score}%
                        </span>
                        {entry.attempts && entry.attempts > 1 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                            {entry.attempts} attempts
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(entry.date), "MMM d, yyyy 'at' h:mm a")} • 
                        {entry.questionsCount} questions
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost" 
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => deleteHistoryEntry(entry.id, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
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
