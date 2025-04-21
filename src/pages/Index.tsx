
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Question } from "@/components/FileUpload";
import { QuizQuestion } from "@/components/QuizQuestion";
import { QuizResults } from "@/components/QuizResults";
import { QuizAnalytics } from "@/components/QuizAnalytics";
import { Header } from "@/components/Header";
import { TabNavigation } from "@/components/TabNavigation";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { LegalPages } from "@/components/LegalPages";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

enum AppState {
  CREATE,
  QUIZ,
  RESULTS,
  ANALYTICS
}

interface QuizHistory {
  id: string;
  date: string;
  title: string;
  questionsCount: number;
  score: number;
  questions: Question[];
}

interface IndexProps {
  initialTab?: string;
}

const Index = ({ initialTab = "generate" }: IndexProps) => {
  const [appState, setAppState] = useState<AppState>(AppState.CREATE);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [quizTitle, setQuizTitle] = useState<string>("Medical Quiz");
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleQuizGenerated = (generatedQuestions: Question[]) => {
    setQuestions(generatedQuestions);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setStartTime(new Date());
    setEndTime(null);
    
    const now = new Date();
    setQuizTitle(`Medical Quiz - ${now.toLocaleDateString()}`);
    
    setAppState(AppState.QUIZ);
  };
  
  const handleNextQuestion = (selectedOption: number) => {
    const newUserAnswers = [...userAnswers, selectedOption];
    setUserAnswers(newUserAnswers);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setEndTime(new Date());
      setAppState(AppState.RESULTS);
    }
  };
  
  const handleViewAnalytics = () => {
    setAppState(AppState.ANALYTICS);
  };
  
  const handleRetakeQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setStartTime(new Date());
    setEndTime(null);
    setAppState(AppState.QUIZ);
  };
  
  const handleNewQuiz = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setStartTime(null);
    setEndTime(null);
    setAppState(AppState.CREATE);
  };
  
  const getCorrectAnswersCount = () => {
    return userAnswers.reduce((count, answer, index) => {
      return count + (answer === questions[index].correctAnswer ? 1 : 0);
    }, 0);
  };

  useEffect(() => {
    if (appState === AppState.RESULTS && questions.length > 0 && userAnswers.length > 0) {
      (async () => {
        try {
          const user = (await supabase.auth.getUser()).data.user;
          if (!user) return;

          const { data: existingAttempts } = await supabase
            .from("quiz_attempts")
            .select("id")
            .eq("user_id", user.id);

          // Properly handle the profile query with error checking
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("isPremium,free_quizzes_used")
            .eq("id", user.id)
            .maybeSingle();
            
          // Handle both successful query and error cases
          const isPremium = profile?.isPremium === true;
          const maxFree = 2;
          if (!isPremium && (existingAttempts?.length ?? 0) >= maxFree) {
            toast({
              title: "Upgrade Required",
              description: "Upgrade to premium to save more than 2 quizzes!",
              variant: "destructive"
            });
            return;
          }

          const correctAnswers = getCorrectAnswersCount();

          // Proper type conversion for JSON serialization
          const questionsJson: Json = questions.map(q => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            timeLimit: q.timeLimit
          })) as Json;

          await supabase.from("quiz_attempts").insert({
            user_id: user.id,
            title: quizTitle,
            questions: questionsJson,
            user_answers: userAnswers as unknown as Json,
            score: Math.round((correctAnswers / questions.length) * 100),
            total_questions: questions.length,
            correct_answers: correctAnswers
          });

          toast({
            title: "Quiz saved",
            description: "Your quiz has been saved and can be revisited from history."
          });

        } catch (e) {
          toast({
            title: "Save failed",
            description: "Could not save quiz. Please try again.",
            variant: "destructive"
          });
        }
      })();
    }
  }, [appState, questions, userAnswers, quizTitle, toast]);

  useEffect(() => {
    if (appState === AppState.QUIZ && questions.length > 10) {
      toast({
        title: "Too many questions",
        description: "You can only have up to 10 questions in a quiz.",
        variant: "destructive"
      });
      setAppState(AppState.CREATE);
    }
  }, [appState, questions]);

  const pageVariants = {
    initial: { opacity: 0, x: 50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -50 }
  };
  
  const pageTransition = {
    type: "spring",
    stiffness: 300,
    damping: 30
  };
  
  const renderContent = () => {
    switch (appState) {
      case AppState.CREATE:
        return (
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="w-full"
          >
            {location.pathname === "/legal" ? (
              <LegalPages />
            ) : (
              <TabNavigation onQuizGenerated={handleQuizGenerated} />
            )}
          </motion.div>
        );
        
      case AppState.QUIZ:
        return (
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <QuizQuestion
              question={questions[currentQuestionIndex]}
              onNext={handleNextQuestion}
              currentQuestionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
            />
          </motion.div>
        );
        
      case AppState.RESULTS:
        const correctAnswers = getCorrectAnswersCount();
        return (
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <QuizResults
              totalQuestions={questions.length}
              correctAnswers={correctAnswers}
              onRetakeQuiz={handleRetakeQuiz}
              onNewFile={handleNewQuiz}
              onViewAnalytics={handleViewAnalytics}
            />
          </motion.div>
        );
        
      case AppState.ANALYTICS:
        const correctCount = getCorrectAnswersCount();
        return (
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <QuizAnalytics
              questions={questions}
              correctAnswers={correctCount}
              incorrectAnswers={questions.length - correctCount}
              userAnswers={userAnswers}
            />
          </motion.div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90 flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8 pb-28">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
