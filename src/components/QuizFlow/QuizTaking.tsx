import { Question } from "../FileUpload";
import { QuizQuestion } from "../QuizQuestion";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { saveQuizProgress } from "@/utils/storageUtils";

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
  const { toast } = useToast();
  const [startTime] = useState<Date>(() => new Date());
  
  useEffect(() => {
    const quizInProgress = localStorage.getItem("quizInProgress");
    if (quizInProgress) {
      try {
        const parsedQuiz = JSON.parse(quizInProgress);
        if (parsedQuiz && parsedQuiz.questions) {
          saveQuizProgress({
            ...parsedQuiz,
            currentIndex: currentQuestionNumber - 1,
            startTime: parsedQuiz.startTime || new Date().toISOString()
          });
          console.log(`Quiz progress saved: Question ${currentQuestionNumber} of ${totalQuestions}`);
        }
      } catch (error) {
        console.error("Error updating quiz progress:", error);
      }
    }
  }, [currentQuestionNumber, totalQuestions]);

  const handleNextQuestion = (selectedOption: number) => {
    const timeSpent = Math.round((new Date().getTime() - startTime.getTime()) / 1000);
    console.log(`Question ${currentQuestionNumber} took ${timeSpent} seconds to answer`);
    
    try {
      const quizInProgress = localStorage.getItem("quizInProgress");
      if (quizInProgress) {
        const parsedQuiz = JSON.parse(quizInProgress);
        if (parsedQuiz) {
          const timings = parsedQuiz.timings || [];
          timings[currentQuestionNumber - 1] = timeSpent;
          
          saveQuizProgress({
            ...parsedQuiz,
            timings,
          });
          
          console.log(`Saved timing for question ${currentQuestionNumber}: ${timeSpent} seconds`);
        }
      }
    } catch (error) {
      console.error("Error saving question timing:", error);
    }
    
    onNext(selectedOption);
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
