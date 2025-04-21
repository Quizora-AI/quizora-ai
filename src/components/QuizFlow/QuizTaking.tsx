
import { useState, useEffect } from "react";
import { Question } from "../FileUpload";
import { QuizQuestion } from "../QuizQuestion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

interface QuizTakingProps {
  question: Question;
  onNext: (selectedOption: number) => void;
  currentQuestionNumber: number;
  totalQuestions: number;
}

const QuizTaking = ({
  question,
  onNext,
  currentQuestionNumber,
  totalQuestions,
}: QuizTakingProps) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(question.timeLimit || 30);
  const [isTimeWarning, setIsTimeWarning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  
  // Reset timer when question changes
  useEffect(() => {
    setTimeRemaining(question.timeLimit || 30);
    setIsTimeWarning(false);
  }, [question]);
  
  // Timer effect
  useEffect(() => {
    if (isPaused) return;
    
    if (timeRemaining <= 0) {
      // Time's up, auto-select
      toast({
        variant: "destructive",
        title: "Time's up!",
        description: "Moving to the next question.",
      });
      // Select a random answer when time is up
      onNext(Math.floor(Math.random() * question.options.length));
      return;
    }
    
    // Show warning when 5 seconds remaining
    if (timeRemaining === 5) {
      setIsTimeWarning(true);
      toast({
        title: "5 seconds remaining!",
        description: "Please select an answer soon.",
      });
    }
    
    const timer = setTimeout(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeRemaining, isPaused, question, onNext]);

  // Calculate percentage for circular progress
  const timePercentage = ((question.timeLimit || 30) - timeRemaining) / (question.timeLimit || 30) * 100;
  
  return (
    <div className="relative">
      <div className="absolute top-0 right-0 w-16 h-16">
        <CircularProgressbar
          value={timePercentage}
          text={`${timeRemaining}s`}
          styles={buildStyles({
            textSize: '26px',
            pathColor: isTimeWarning ? '#ef4444' : '#3b82f6',
            textColor: isTimeWarning ? '#ef4444' : '#3b82f6',
            trailColor: '#e5e7eb',
            pathTransitionDuration: 0.5,
          })}
        />
      </div>
      
      <QuizQuestion
        question={question}
        onNext={onNext}
        currentQuestionNumber={currentQuestionNumber}
        totalQuestions={totalQuestions}
      />
    </div>
  );
};

export default QuizTaking;
