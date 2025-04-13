
import { useState } from "react";
import { Question } from "@/components/FileUpload";
import { QuizQuestion } from "@/components/QuizQuestion";
import { QuizResults } from "@/components/QuizResults";
import { QuizAnalytics } from "@/components/QuizAnalytics";
import { Header } from "@/components/Header";
import { TabNavigation } from "@/components/TabNavigation";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

enum AppState {
  UPLOAD,
  QUIZ,
  RESULTS,
  ANALYTICS
}

const Index = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const { toast } = useToast();
  
  const handleFileProcessed = (extractedQuestions: Question[]) => {
    setQuestions(extractedQuestions);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
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
      setAppState(AppState.RESULTS);
    }
  };
  
  const handleViewAnalytics = () => {
    setAppState(AppState.ANALYTICS);
  };
  
  const handleRetakeQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setAppState(AppState.QUIZ);
  };
  
  const handleNewFile = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setAppState(AppState.UPLOAD);
  };
  
  const getCorrectAnswersCount = () => {
    return userAnswers.reduce((count, answer, index) => {
      return count + (answer === questions[index].correctAnswer ? 1 : 0);
    }, 0);
  };

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
      case AppState.UPLOAD:
        return (
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <TabNavigation onFileProcessed={handleFileProcessed} />
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
              onNewFile={handleNewFile}
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
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
