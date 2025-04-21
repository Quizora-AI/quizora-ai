
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Question } from "@/components/FileUpload";
import { QuizHistoryHeader } from "./QuizHistoryHeader";
import { QuizHistoryWarning } from "./QuizHistoryWarning";
import { QuizHistoryEmpty } from "./QuizHistoryEmpty";
import { QuizHistoryList } from "./QuizHistoryList";

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

        const output = data?.map((quiz: any) => ({
          ...quiz,
          attempts: quiz.user_answers ? 1 : 0
        })) || [];
        setHistory(output);

        const profileData = await supabase
          .from("profiles")
          .select("isPremium")
          .eq("id", user.id)
          .maybeSingle();
        
        const isPremium = profileData.data?.isPremium === true;
        
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
    e.stopPropagation();
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
    localStorage.setItem("selectedQuiz", JSON.stringify(entry));
    if (!entry.attempts) {
      entry.attempts = 1;
    } else {
      entry.attempts += 1;
    }
    const updatedHistory = history.map(item => 
      item.id === entry.id ? entry : item
    );
    localStorage.setItem("quizHistory", JSON.stringify(updatedHistory));
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
        <QuizHistoryHeader />
        <CardContent>
          {showFreeWarning && (
            <QuizHistoryWarning itemVariants={itemVariants} />
          )}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : history.length === 0 ? (
            <QuizHistoryEmpty onCreateQuiz={createNewQuiz} itemVariants={itemVariants} />
          ) : (
            <QuizHistoryList
              history={history}
              itemVariants={itemVariants}
              onDelete={deleteHistoryEntry}
              onView={viewQuiz}
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
