
import { useState, useEffect } from "react";
import { QuizQuestion } from "@/components/QuizQuestion";
import { QuizResults } from "@/components/QuizResults";
import { QuizAnalytics } from "@/components/QuizAnalytics";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { Question } from "@/components/FileUpload";
import { useNavigate } from "react-router-dom";

export enum AppState {
  QUIZ,
  RESULTS,
  ANALYTICS,
}

interface QuizHistory {
  id: string;
  date: string;
  title: string;
  questionsCount: number;
  score: number;
  questions: Question[];
  userAnswers?: number[];
  attempts?: number;
}

interface QuizFlowProps {
  questions: Question[];
  setQuestions: (q: Question[]) => void;
  quizTitle: string;
  setQuizTitle: (t: string) => void;
  onBackToCreate: () => void;
  initialAppState: AppState;
}

export const QuizFlow = ({
  questions,
  setQuestions,
  quizTitle,
  setQuizTitle,
  onBackToCreate,
  initialAppState,
}: QuizFlowProps) => {
  const [appState, setAppState] = useState<AppState>(initialAppState);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  console.log("QuizFlow rendered with questions:", questions?.length, "initialAppState:", initialAppState);

  useEffect(() => {
    setAppState(initialAppState);
    console.log("QuizFlow: Setting initial app state to", initialAppState);
    
    // Check for saved progress
    const savedQuizState = localStorage.getItem("quizInProgress");
    if (savedQuizState && initialAppState === AppState.QUIZ) {
      try {
        const parsedState = JSON.parse(savedQuizState);
        console.log("QuizFlow: Found saved quiz state", parsedState);
        const { currentIndex, userAnsList } = parsedState;
        if (currentIndex !== undefined) {
          setCurrentQuestionIndex(currentIndex);
        }
        if (userAnsList && userAnsList.length > 0) {
          setUserAnswers(userAnsList);
        }
      } catch (error) {
        console.error("Error restoring quiz state:", error);
      }
    }
    
    // Set start time
    setStartTime(new Date());
    // eslint-disable-next-line
  }, [initialAppState]);
  
  // Save quiz state when user navigates away
  useEffect(() => {
    if (appState === AppState.QUIZ && questions.length > 0 && currentQuestionIndex > 0) {
      const quizState = {
        questions,
        title: quizTitle,
        currentIndex: currentQuestionIndex,
        userAnsList: userAnswers,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem("quizInProgress", JSON.stringify(quizState));
      console.log("QuizFlow: Saved quiz progress", quizState);
    }
    
    // Clean up saved state when quiz is completed
    if (appState !== AppState.QUIZ) {
      localStorage.removeItem("quizInProgress");
    }
  }, [appState, currentQuestionIndex, questions, quizTitle, userAnswers]);

  const getCorrectAnswersCount = () =>
    userAnswers.reduce((count, answer, idx) =>
      count + (answer === questions[idx].correctAnswer ? 1 : 0), 0
    );

  const handleNextQuestion = (selectedOption: number) => {
    const newUserAnswers = [...userAnswers, selectedOption];
    setUserAnswers(newUserAnswers);
    console.log("QuizFlow: User answered question", currentQuestionIndex, "with option", selectedOption);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setEndTime(new Date());
      setAppState(AppState.RESULTS);
      // Remove in-progress state once completed
      localStorage.removeItem("quizInProgress");
      console.log("QuizFlow: Quiz completed, showing results");
    }
  };

  const handleViewAnalytics = () => {
    setAppState(AppState.ANALYTICS);
    console.log("QuizFlow: Showing analytics");
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setStartTime(new Date());
    setEndTime(null);
    setAppState(AppState.QUIZ);
    console.log("QuizFlow: Retaking quiz");

    toast({
      title: "Quiz Restarted",
      description: "Good luck on your retake!",
    });
  };

  const handleNewQuiz = () => {
    // Clear quiz data
    localStorage.removeItem("quizInProgress");
    console.log("QuizFlow: Starting new quiz");
    
    // Go back to create page
    onBackToCreate();
    
    toast({
      title: "Create New Quiz",
      description: "Choose a file or use AI to generate questions",
    });
  };

  useEffect(() => {
    // Save to history on RESULTS
    if (appState === AppState.RESULTS && questions.length && userAnswers.length) {
      const autoSave = localStorage.getItem("autoSave") !== "false";
      if (autoSave) {
        const correctAnswers = getCorrectAnswersCount();
        const score = Math.round((correctAnswers / questions.length) * 100);

        const existingHistoryString = localStorage.getItem("quizHistory");
        const existingHistory: QuizHistory[] = existingHistoryString
          ? JSON.parse(existingHistoryString)
          : [];

        const newQuizEntry: QuizHistory = {
          id: uuidv4(),
          date: new Date().toISOString(),
          title: quizTitle,
          questionsCount: questions.length,
          score,
          questions,
          userAnswers,
          attempts: 1,
        };

        const updatedHistory = [newQuizEntry, ...existingHistory];
        localStorage.setItem("quizHistory", JSON.stringify(updatedHistory));
        console.log("QuizFlow: Saved quiz to history", newQuizEntry);

        toast({
          title: "Quiz saved",
          description: `Your quiz has been saved to history.`,
        });
      }
    }
    // eslint-disable-next-line
  }, [appState, questions, userAnswers, quizTitle]);

  const pageVariants = {
    initial: { opacity: 0, x: 50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -50 },
  };

  const pageTransition = {
    type: "spring",
    stiffness: 300,
    damping: 30,
  };

  if (!questions || questions.length === 0) {
    console.log("QuizFlow: No questions available, redirecting to create");
    onBackToCreate();
    return null;
  }

  console.log("QuizFlow: Rendering with appState:", appState);

  switch (appState) {
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
