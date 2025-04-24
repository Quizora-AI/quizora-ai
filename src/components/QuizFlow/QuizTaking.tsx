
import { Question } from "../FileUpload";
import { QuizQuestion } from "../QuizQuestion";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
  const [startTime] = useState(() => new Date()); // Record start time of this question
  
  // Save quiz progress in localStorage whenever the current question changes
  useEffect(() => {
    const quizInProgress = localStorage.getItem("quizInProgress");
    if (quizInProgress) {
      try {
        const parsedQuiz = JSON.parse(quizInProgress);
        if (parsedQuiz && parsedQuiz.questions) {
          // Update the current question index and timestamps
          localStorage.setItem("quizInProgress", JSON.stringify({
            ...parsedQuiz,
            currentIndex: currentQuestionNumber - 1,
            lastUpdated: new Date().toISOString(),
            startTime: parsedQuiz.startTime || new Date().toISOString() // Preserve the quiz start time
          }));
          console.log(`Quiz progress saved: Question ${currentQuestionNumber} of ${totalQuestions}`);
        }
      } catch (error) {
        console.error("Error updating quiz progress:", error);
      }
    }
  }, [currentQuestionNumber, totalQuestions]);

  // Create a wrapper for onNext to track time spent on this question
  const handleNextQuestion = (selectedOption: number) => {
    const timeSpent = Math.round((new Date().getTime() - startTime.getTime()) / 1000);
    console.log(`Question ${currentQuestionNumber} took ${timeSpent} seconds to answer`);
    
    // Update the quiz progress with time information
    try {
      const quizInProgress = localStorage.getItem("quizInProgress");
      if (quizInProgress) {
        const parsedQuiz = JSON.parse(quizInProgress);
        if (parsedQuiz) {
          // Append or update the time spent on this question
          const timings = parsedQuiz.timings || [];
          timings[currentQuestionNumber - 1] = timeSpent;
          
          localStorage.setItem("quizInProgress", JSON.stringify({
            ...parsedQuiz,
            timings,
            lastUpdated: new Date().toISOString()
          }));
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
