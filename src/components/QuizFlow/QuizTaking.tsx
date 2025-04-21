
import { Question } from "../FileUpload";
import { QuizQuestion } from "../QuizQuestion";

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
