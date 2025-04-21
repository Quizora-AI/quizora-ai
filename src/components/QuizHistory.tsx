
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { QuizHistoryHeader } from "./QuizHistoryHeader";
import { QuizHistoryList } from "./QuizHistoryList";
import { QuizHistoryEmpty } from "./QuizHistoryEmpty";
import { QuizHistoryWarning } from "./QuizHistoryWarning";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function QuizHistory() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        
        // Check user's session first
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session?.user) {
          setLoading(false);
          return;
        }

        // Get premium status
        const { data: profile } = await supabase
          .from("profiles")
          .select("isPremium")
          .eq("id", sessionData.session.user.id)
          .maybeSingle();
          
        setIsPremium(profile?.isPremium === true);

        // Get quiz attempts
        const { data, error } = await supabase
          .from("quiz_attempts")
          .select("*")
          .eq("user_id", sessionData.session.user.id)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          setQuizzes(data);
        }
      } catch (error) {
        console.error("Error fetching quiz history:", error);
        toast({
          title: "Error loading quiz history",
          description: "Could not load your quiz history. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [toast]);

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
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  // Show warning only if not premium and has 2+ quizzes
  const showWarning = !isPremium && quizzes.length >= 2;

  return (
    <motion.div
      className="max-w-4xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <QuizHistoryHeader />
      
      {showWarning && <QuizHistoryWarning itemVariants={itemVariants} isPremium={isPremium} />}
      
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : quizzes.length > 0 ? (
        <QuizHistoryList quizzes={quizzes} itemVariants={itemVariants} />
      ) : (
        <QuizHistoryEmpty itemVariants={itemVariants} />
      )}
    </motion.div>
  );
}
