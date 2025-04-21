
import { QuizAnalytics } from "../QuizAnalytics";
import { Question } from "../FileUpload";

interface QuizFlowAnalyticsProps {
  questions: Question[];
  correctAnswers: number;
  incorrectAnswers: number;
  userAnswers: number[];
}

const QuizFlowAnalytics = ({
  questions,
  correctAnswers,
  incorrectAnswers,
  userAnswers,
}: QuizFlowAnalyticsProps) => {
  return (
    <QuizAnalytics
      questions={questions}
      correctAnswers={correctAnswers}
      incorrectAnswers={incorrectAnswers}
      userAnswers={userAnswers}
    />
  );
};

export default QuizFlowAnalytics;
