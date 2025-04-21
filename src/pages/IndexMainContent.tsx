
import { motion } from "framer-motion";
import { QuizQuestion } from "@/components/QuizQuestion";
import { QuizResults } from "@/components/QuizResults";
import { QuizAnalytics } from "@/components/QuizAnalytics";
import { TabNavigation } from "@/components/TabNavigation";
import { LegalPages } from "@/components/LegalPages";
import { AppState } from "./IndexQuizLogic";

interface IndexMainContentProps {
  appState: AppState;
  currentQuestionIndex: number;
  questions: any[];
  userAnswers: number[];
  location: any;
  handleQuizGenerated: (questions: any[]) => void;
  handleNextQuestion: (selectedOption: number) => void;
  handleRetakeQuiz: () => void;
  handleNewQuiz: () => void;
  handleViewAnalytics: () => void;
  getCorrectAnswersCount: () => number;
}

export const IndexMainContent = ({
  appState,
  currentQuestionIndex,
  questions,
  userAnswers,
  location,
  handleQuizGenerated,
  handleNextQuestion,
  handleRetakeQuiz,
  handleNewQuiz,
  handleViewAnalytics,
  getCorrectAnswersCount
}: IndexMainContentProps) => {
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
