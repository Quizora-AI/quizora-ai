
import { Question } from "./FileUpload";
import { QuizQuestion } from "./QuizQuestion";
import { useState, useEffect } from "react";
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
  const [keyPrefix, setKeyPrefix] = useState<string>(`q-${Date.now()}`);
  
  // Reset the timer and key prefix whenever the question changes
  useEffect(() => {
    const now = new Date();
    setStartTime(now);
    setKeyPrefix(`q-${question.id}-${currentQuestionNumber}-${Date.now()}`);
    console.log(`Started timer for question ${currentQuestionNumber} at ${now.toISOString()}`);
  }, [currentQuestionNumber, question]);

  const handleNextQuestion = (selectedOption: number) => {
    const endTime = new Date();
    const timeSpent = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
    console.log(`Question ${currentQuestionNumber} took ${timeSpent} seconds to answer (from ${startTime.toISOString()} to ${endTime.toISOString()})`);
    
    // Pass both the selected option and time spent to the parent component
    onNext(selectedOption, timeSpent);
  };

  return (
    <QuizQuestion
      key={keyPrefix}
      question={question}
      onNext={handleNextQuestion}
      currentQuestionNumber={currentQuestionNumber}
      totalQuestions={totalQuestions}
    />
  );
};

export default QuizTaking;
