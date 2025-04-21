
import { Question } from "../FileUpload";
import { QuizQuestion } from "../QuizQuestion";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

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
  
  // Save quiz progress in localStorage whenever the current question changes
  useEffect(() => {
    const quizInProgress = localStorage.getItem("quizInProgress");
    if (quizInProgress) {
      try {
        const parsedQuiz = JSON.parse(quizInProgress);
        if (parsedQuiz && parsedQuiz.questions) {
          localStorage.setItem("quizInProgress", JSON.stringify({
            ...parsedQuiz,
            currentIndex: currentQuestionNumber - 1,
            lastUpdated: new Date().toISOString()
          }));
          console.log(`Quiz progress saved: Question ${currentQuestionNumber} of ${totalQuestions}`);
        }
      } catch (error) {
        console.error("Error updating quiz progress:", error);
      }
    }
  }, [currentQuestionNumber, totalQuestions]);

  // Pass the question directly to the QuizQuestion component
  return (
    <QuizQuestion
      question={question}
      onNext={onNext}
      currentQuestionNumber={currentQuestionNumber}
      totalQuestions={totalQuestions}
    />
  );
};

export default QuizTaking;
