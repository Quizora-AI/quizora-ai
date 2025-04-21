
import { QuizResults } from "../QuizResults";

interface QuizFlowResultsProps {
  totalQuestions: number;
  correctAnswers: number;
  onRetakeQuiz: () => void;
  onNewFile: () => void;
  onViewAnalytics: () => void;
}

const QuizFlowResults = ({
  totalQuestions,
  correctAnswers,
  onRetakeQuiz,
  onNewFile,
  onViewAnalytics,
}: QuizFlowResultsProps) => {
  return (
    <QuizResults
      totalQuestions={totalQuestions}
      correctAnswers={correctAnswers}
      onRetakeQuiz={onRetakeQuiz}
      onNewFile={onNewFile}
      onViewAnalytics={onViewAnalytics}
    />
  );
};

export default QuizFlowResults;
