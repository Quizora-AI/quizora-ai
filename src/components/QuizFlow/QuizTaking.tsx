
import { Question } from "../FileUpload";
import { QuizQuestion } from "../QuizQuestion";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface QuizTakingProps {
  question: Question;
  onNext: (selectedOption: number, timeSpent: number) => void;
  currentQuestionNumber: number;
  totalQuestions: number;
}

const QuizTaking = ({
  question,
  onNext,
  currentQuestionNumber,
  totalQuestions,
}: QuizTakingProps) => {
  const { toast } = useToast();
  const [startTime, setStartTime] = useState<Date>(new Date());
  const startTimeRef = useRef<Date>(new Date());
  
  // Reset the timer whenever the question changes
  useEffect(() => {
    const now = new Date();
    setStartTime(now);
    startTimeRef.current = now;
    console.log(`Started timer for question ${currentQuestionNumber} at ${now.toISOString()}`);
  }, [currentQuestionNumber, question]);

  const handleNextQuestion = (selectedOption: number) => {
    const endTime = new Date();
    const timeSpent = Math.round((endTime.getTime() - startTimeRef.current.getTime()) / 1000);
    console.log(`Question ${currentQuestionNumber} took ${timeSpent} seconds to answer`);
    
    // Pass both the selected option and time spent to the parent component
    onNext(selectedOption, timeSpent);
  };

  return (
    <QuizQuestion
      question={question}
      onNext={handleNextQuestion}
      currentQuestionNumber={currentQuestionNumber}
      totalQuestions={totalQuestions}
    />
  );
};

export default QuizTaking;
