
import { useState, useEffect } from "react";
import { Question } from "@/components/FileUpload";
import { QuizQuestion } from "@/components/QuizQuestion";
import { QuizResults } from "@/components/QuizResults";
import { QuizAnalytics } from "@/components/QuizAnalytics";
import { Header } from "@/components/Header";
import { TabNavigation } from "@/components/TabNavigation";
import { QuizGenerator } from "@/components/QuizGenerator";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

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

const Index = () => {
  const [appState, setAppState] = useState<AppState>(AppState.CREATE);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [quizTitle, setQuizTitle] = useState<string>("Medical Quiz");
  const { toast } = useToast();
  
  const handleQuizGenerated = (generatedQuestions: Question[]) => {
    setQuestions(generatedQuestions);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setStartTime(new Date());
    setEndTime(null);
    
    // Set a default quiz title based on the time
    const now = new Date();
    setQuizTitle(`Medical Quiz - ${now.toLocaleDateString()}`);
    
    setAppState(AppState.QUIZ);
  };
  
  const handleNextQuestion = (selectedOption: number) => {
    // Update user answers
    const newUserAnswers = [...userAnswers, selectedOption];
    setUserAnswers(newUserAnswers);
    
    // Move to next question or end quiz
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

  // Save quiz result to history when quiz is completed
  useEffect(() => {
    if (appState === AppState.RESULTS && questions.length > 0 && userAnswers.length > 0) {
      const autoSave = localStorage.getItem("autoSave") !== "false";
      
      if (autoSave) {
        const correctAnswers = getCorrectAnswersCount();
        const score = Math.round((correctAnswers / questions.length) * 100);

        // Get existing history from localStorage
        const existingHistoryString = localStorage.getItem("quizHistory");
        const existingHistory: QuizHistory[] = existingHistoryString 
          ? JSON.parse(existingHistoryString) 
          : [];
        
        // Create new quiz history entry
        const newQuizEntry: QuizHistory = {
          id: uuidv4(),
          date: new Date().toISOString(),
          title: quizTitle,
          questionsCount: questions.length,
          score,
          questions: questions
        };
        
        // Add new entry to history and save back to localStorage
        const updatedHistory = [newQuizEntry, ...existingHistory];
        localStorage.setItem("quizHistory", JSON.stringify(updatedHistory));
        
        toast({
          title: "Quiz saved",
          description: `Your quiz has been saved to history.`
        });
      }
    }
  }, [appState, questions, userAnswers, quizTitle]);

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
            <TabNavigation onQuizGenerated={handleQuizGenerated} />
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
      <main className="flex-1 px-4 py-8">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
