
import { QuizAnalytics } from "../QuizAnalytics";
import { Question } from "../FileUpload";

interface QuizFlowAnalyticsProps {
  questions: Question[];
  correctAnswers: number;
  incorrectAnswers: number;
  userAnswers: number[];
  timePerQuestion?: number[];
  averageTime?: number;
  totalTime?: number;
}

const QuizFlowAnalytics = ({
  questions,
  correctAnswers,
  incorrectAnswers,
  userAnswers,
  timePerQuestion,
  averageTime,
  totalTime,
}: QuizFlowAnalyticsProps) => {
  return (
    <QuizAnalytics
      questions={questions}
      correctAnswers={correctAnswers}
      incorrectAnswers={incorrectAnswers}
      userAnswers={userAnswers}
      timePerQuestion={timePerQuestion}
      averageTime={averageTime}
      totalTime={totalTime}
    />
  );
};

export default QuizFlowAnalytics;
