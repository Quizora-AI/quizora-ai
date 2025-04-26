
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import QuizTaking from "./QuizTaking";
import QuizFlowResults from "./QuizFlowResults";
import QuizFlowAnalytics from "./QuizFlowAnalytics";
import { Question } from "../FileUpload";

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

  // Initialize the quiz
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
        
        // Restore the quiz start time if available, otherwise set a new one
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
      // Always set start time when starting a new quiz
      setStartTime(new Date());
      console.log("New quiz started at:", new Date().toISOString());
    }
  }, [initialAppState]);

  // Save quiz state when changes happen
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
      // Remove in-progress state when quiz is complete or in analytics mode
      localStorage.removeItem("quizInProgress");
    }
  }, [appState, currentQuestionIndex, questions, quizTitle, userAnswers, timePerQuestion, startTime]);

  const getCorrectAnswersCount = () =>
    userAnswers.reduce((count, answer, idx) =>
      count + (answer === questions[idx].correctAnswer ? 1 : 0), 0
    );

  const handleNextQuestion = (selectedOption: number, timeSpent: number) => {
    // Record the user's answer and the time spent
    const newUserAnswers = [...userAnswers, selectedOption];
    setUserAnswers(newUserAnswers);
    
    // Update the time spent on this question
    const newTimePerQuestion = [...timePerQuestion];
    newTimePerQuestion[currentQuestionIndex] = timeSpent;
    setTimePerQuestion(newTimePerQuestion);
    
    console.log(`User selected option ${selectedOption} for question ${currentQuestionIndex + 1} in ${timeSpent} seconds`);
    console.log("Updated time per question:", newTimePerQuestion);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz is complete, record end time
      const finishTime = new Date();
      setEndTime(finishTime);
      
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
    navigate('/quiz'); // Navigate correctly to quiz generation page
  };

  // Save quiz results to history when quiz is completed
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

        // Calculate total time from the timePerQuestion array
        const totalTime = timePerQuestion.reduce((sum, time) => sum + (time || 0), 0);
        console.log("Calculated total time from individual question times:", totalTime, "seconds");

        const startTimeStr = startTime ? startTime.toISOString() : new Date().toISOString();
        const endTimeStr = endTime ? endTime.toISOString() : new Date().toISOString();

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

  // Calculate the average time per question and total time accurately
  const totalTime = timePerQuestion.reduce((sum, time) => sum + (time || 0), 0);
  
  const filteredTimes = timePerQuestion.filter(time => time !== undefined && time > 0);
  const avgTimePerQuestion = filteredTimes.length > 0 
    ? Math.round(filteredTimes.reduce((sum, time) => sum + time, 0) / filteredTimes.length) 
    : 0;

  console.log("Average time per question:", avgTimePerQuestion, "seconds");
  console.log("Total quiz time:", totalTime, "seconds");
  console.log("Time per question array:", timePerQuestion);

  // Format timestamps for display
  const startTimeStr = startTime ? startTime.toISOString() : '';
  const endTimeStr = endTime ? endTime.toISOString() : '';

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
            startTime={startTimeStr}
            endTime={endTimeStr}
          />
        </motion.div>
      );
    default:
      return null;
  }
};

export default QuizFlowContainer;
export type { QuizFlowContainerProps, QuizHistory };
