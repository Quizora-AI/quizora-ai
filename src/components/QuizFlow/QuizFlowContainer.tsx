import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import QuizTaking from "./QuizTaking";
import QuizFlowResults from "./QuizFlowResults";
import QuizFlowAnalytics from "./QuizFlowAnalytics";
import { Question } from "../FileUpload";
import { shouldShowQuizCompletionAd } from '@/utils/adUtils';
import { useInterstitialAd } from "@/components/GoogleAds";

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
  timePerQuestion?: number[];
  totalTime?: number;
}

interface QuizFlowContainerProps {
  questions: Question[];
  setQuestions: (q: Question[]) => void;
  quizTitle: string;
  setQuizTitle: (t: string) => void;
  onBackToCreate: () => void;
  initialAppState: AppState;
}

const QuizFlowContainer = ({
  questions,
  setQuestions,
  quizTitle,
  setQuizTitle,
  onBackToCreate,
  initialAppState,
}: QuizFlowContainerProps) => {
  const [appState, setAppState] = useState<AppState>(initialAppState);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [timePerQuestion, setTimePerQuestion] = useState<number[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setAppState(initialAppState);
    const savedQuizState = localStorage.getItem("quizInProgress");
    
    if (savedQuizState && initialAppState === AppState.QUIZ) {
      try {
        const parsedState = JSON.parse(savedQuizState);
        
        if (parsedState.currentIndex !== undefined) {
          setCurrentQuestionIndex(parsedState.currentIndex);
        }
        
        if (parsedState.userAnsList && parsedState.userAnsList.length > 0) {
          setUserAnswers(parsedState.userAnsList);
        }
        
        if (parsedState.timings && parsedState.timings.length > 0) {
          setTimePerQuestion(parsedState.timings);
        }
        
        if (parsedState.startTime) {
          setStartTime(new Date(parsedState.startTime));
        } else {
          setStartTime(new Date());
        }
        
        console.log("Restored quiz state:", parsedState);
      } catch (error) {
        console.error("Error restoring quiz state:", error);
        setStartTime(new Date()); // Set a new start time if restoration fails
      }
    } else {
      setStartTime(new Date());
      console.log("New quiz started at:", new Date().toISOString());
    }
  }, [initialAppState]);

  useEffect(() => {
    if (appState === AppState.QUIZ && questions.length > 0 && currentQuestionIndex >= 0) {
      const quizState = {
        questions,
        title: quizTitle,
        currentIndex: currentQuestionIndex,
        userAnsList: userAnswers,
        timings: timePerQuestion,
        timestamp: new Date().toISOString(),
        startTime: startTime ? startTime.toISOString() : new Date().toISOString()
      };
      localStorage.setItem("quizInProgress", JSON.stringify(quizState));
      console.log("Saved quiz progress with timings:", timePerQuestion);
    }
    
    if (appState !== AppState.QUIZ) {
      localStorage.removeItem("quizInProgress");
    }
  }, [appState, currentQuestionIndex, questions, quizTitle, userAnswers, timePerQuestion, startTime]);

  const getCorrectAnswersCount = () =>
    userAnswers.reduce((count, answer, idx) =>
      count + (answer === questions[idx].correctAnswer ? 1 : 0), 0
    );

  const handleNextQuestion = (selectedOption: number) => {
    const newUserAnswers = [...userAnswers, selectedOption];
    setUserAnswers(newUserAnswers);
    console.log(`User selected option ${selectedOption} for question ${currentQuestionIndex + 1}`);

    try {
      const quizInProgress = localStorage.getItem("quizInProgress");
      if (quizInProgress) {
        const parsedQuiz = JSON.parse(quizInProgress);
        if (parsedQuiz && parsedQuiz.timings) {
          setTimePerQuestion(parsedQuiz.timings);
        }
      }
    } catch (error) {
      console.error("Error updating timings:", error);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const finishTime = new Date();
      setEndTime(finishTime);
      
      if (startTime) {
        const totalTimeInSeconds = Math.round((finishTime.getTime() - startTime.getTime()) / 1000);
        console.log("Quiz finished. Total time:", totalTimeInSeconds, "seconds");
      }
      
      setAppState(AppState.RESULTS);
      localStorage.removeItem("quizInProgress");
    }
  };

  const handleViewAnalytics = () => setAppState(AppState.ANALYTICS);

  const handleRetakeQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    const newStartTime = new Date();
    setStartTime(newStartTime);
    setEndTime(null);
    setTimePerQuestion([]);
    setAppState(AppState.QUIZ);

    toast({
      title: "Quiz Restarted",
      description: "Good luck on your retake!",
    });
  };

  const handleNewQuiz = () => {
    localStorage.removeItem("quizInProgress");
    navigate('/quiz');
  };

  const handleQuizComplete = async () => {
    if (shouldShowQuizCompletionAd()) {
      const { showInterstitial } = useInterstitialAd({
        adUnitId: "ca-app-pub-8270549953677995/9564071776",
        onAdDismissed: () => {
          setAppState(AppState.RESULTS);
        }
      });
      showInterstitial();
    } else {
      setAppState(AppState.RESULTS);
    }
  };

  useEffect(() => {
    if (appState === AppState.RESULTS && questions.length && userAnswers.length) {
      const autoSave = localStorage.getItem("autoSave") !== "false";
      if (autoSave) {
        const correctAnswers = getCorrectAnswersCount();
        const score = Math.round((correctAnswers / questions.length) * 100);

        const existingHistoryString = localStorage.getItem("quizHistory");
        const existingHistory: QuizHistory[] = existingHistoryString
          ? JSON.parse(existingHistoryString)
          : [];

        let totalTime = 0;
        if (startTime && endTime) {
          totalTime = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
        } else if (timePerQuestion.length > 0) {
          totalTime = timePerQuestion.reduce((sum, time) => sum + (time || 0), 0);
        }

        console.log("Saving quiz history with total time:", totalTime, "seconds");
        console.log("Time per question array:", timePerQuestion);

        const newQuizEntry: QuizHistory = {
          id: uuidv4(),
          date: new Date().toISOString(),
          title: quizTitle,
          questionsCount: questions.length,
          score,
          questions,
          userAnswers,
          timePerQuestion,
          totalTime,
          attempts: 1,
        };

        const updatedHistory = [newQuizEntry, ...existingHistory];
        localStorage.setItem("quizHistory", JSON.stringify(updatedHistory));

        toast({
          title: "Quiz saved",
          description: `Your quiz has been saved to history.`,
        });
      }
    }
  }, [appState, questions, userAnswers, quizTitle, toast, timePerQuestion, startTime, endTime]);

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
    onBackToCreate();
    return null;
  }

  const totalTime = startTime && endTime 
    ? Math.round((endTime.getTime() - startTime.getTime()) / 1000)
    : timePerQuestion.reduce((sum, time) => sum + (time || 0), 0);
  
  const avgTimePerQuestion = timePerQuestion.length > 0 
    ? Math.round(timePerQuestion.reduce((sum, time) => sum + (time || 0), 0) / timePerQuestion.length) 
    : Math.round(totalTime / questions.length);

  console.log("Average time per question:", avgTimePerQuestion, "seconds");
  console.log("Total quiz time:", totalTime, "seconds");
  console.log("Time per question array:", timePerQuestion);

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
          <QuizTaking
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
          <QuizFlowResults
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
          <QuizFlowAnalytics
            questions={questions}
            correctAnswers={correctCount}
            incorrectAnswers={questions.length - correctCount}
            userAnswers={userAnswers}
            timePerQuestion={timePerQuestion}
            averageTime={avgTimePerQuestion}
            totalTime={totalTime}
          />
        </motion.div>
      );
    default:
      return null;
  }
};

export default QuizFlowContainer;
export type { QuizFlowContainerProps, QuizHistory };
