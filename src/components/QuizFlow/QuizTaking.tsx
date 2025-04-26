
import { Question } from "../FileUpload";
import { QuizQuestion } from "../QuizQuestion";
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
  const [startTime] = useState<Date>(() => new Date());
  
  useEffect(() => {
    console.log(`Started timer for question ${currentQuestionNumber} at ${startTime.toISOString()}`);
  }, [currentQuestionNumber, startTime]);

  const handleNextQuestion = (selectedOption: number) => {
    const timeSpent = Math.round((new Date().getTime() - startTime.getTime()) / 1000);
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
