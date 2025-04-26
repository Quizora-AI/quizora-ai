
import { QuizAnalytics } from "./QuizAnalytics";
import { Question } from "./FileUpload";

interface QuizFlowAnalyticsProps {
  questions: Question[];
  correctAnswers: number;
  incorrectAnswers: number;
  userAnswers: number[];
  timePerQuestion?: number[];
  averageTime?: number;
  totalTime?: number;
  startTime?: string;
  endTime?: string;
}

const QuizFlowAnalytics = ({
  questions,
  correctAnswers,
  incorrectAnswers,
  userAnswers,
  timePerQuestion,
  averageTime,
  totalTime,
  startTime,
  endTime,
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
      startTime={startTime}
      endTime={endTime}
    />
  );
};

export default QuizFlowAnalytics;
