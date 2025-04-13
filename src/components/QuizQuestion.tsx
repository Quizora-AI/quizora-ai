
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { CheckCircle, XCircle, Timer } from "lucide-react";
import { Question } from "./FileUpload";
import { Progress } from "@/components/ui/progress";

interface QuizQuestionProps {
  question: Question;
  onNext: () => void;
  currentQuestionNumber: number;
  totalQuestions: number;
  defaultTimePerQuestion?: number;
}

export function QuizQuestion({
  question,
  onNext,
  currentQuestionNumber,
  totalQuestions,
  defaultTimePerQuestion = 30,
}: QuizQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(defaultTimePerQuestion);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const optionLabels = ["A", "B", "C", "D"];

  // Timer effect
  useEffect(() => {
    if (!isTimerRunning) return;
    
    if (timeLeft <= 0) {
      setIsTimerRunning(false);
      setIsAnswered(true);
      return;
    }
    
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft, isTimerRunning]);

  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswered) return;
    
    setSelectedOption(optionIndex);
    setIsAnswered(true);
    setIsTimerRunning(false);
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setTimeLeft(defaultTimePerQuestion);
    setIsTimerRunning(true);
    onNext();
  };

  const getOptionClassName = (optionIndex: number) => {
    let className = "option-btn";
    
    if (isAnswered) {
      if (optionIndex === question.correctAnswer) {
        className += " correct";
      } else if (optionIndex === selectedOption) {
        className += " incorrect";
      }
    } else if (optionIndex === selectedOption) {
      className += " selected";
    }
    
    return className;
  };

  const isCorrect = selectedOption === question.correctAnswer;
  const progress = ((currentQuestionNumber) / totalQuestions) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">
            Question {currentQuestionNumber} of {totalQuestions}
          </span>
          <div className="flex items-center text-sm">
            <Timer className="h-4 w-4 mr-1 text-medical-teal" />
            <span className={`font-medium ${timeLeft < 10 ? "text-error" : ""}`}>{timeLeft}s</span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="quiz-container animate-slide-up shadow-md">
        <CardHeader>
          <div className="text-lg font-medium mb-4">{question.question}</div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <button
                key={index}
                className={getOptionClassName(index)}
                onClick={() => handleOptionSelect(index)}
                disabled={isAnswered}
              >
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-4">
                  <span className="font-medium">{optionLabels[index]}</span>
                </div>
                <span className="text-left">{option}</span>
                {isAnswered && index === question.correctAnswer && (
                  <CheckCircle className="ml-auto h-5 w-5 text-success" />
                )}
                {isAnswered && index === selectedOption && index !== question.correctAnswer && (
                  <XCircle className="ml-auto h-5 w-5 text-error" />
                )}
              </button>
            ))}
          </div>

          {isAnswered && question.explanation && (
            <div className="mt-6 p-4 bg-muted/50 rounded-md">
              <p className="font-medium mb-1">Explanation:</p>
              <p className="text-sm">{question.explanation}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          {isAnswered && (
            <div className="w-full flex justify-between items-center">
              <div className="flex items-center">
                {isCorrect ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-success mr-2" />
                    <span className="font-medium text-success">Correct!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-error mr-2" />
                    <span className="font-medium text-error">Incorrect</span>
                  </>
                )}
              </div>
              <Button onClick={handleNextQuestion}>
                Next Question
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
