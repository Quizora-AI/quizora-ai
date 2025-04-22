
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { CheckCircle, XCircle, Timer } from "lucide-react";
import { Question } from "./FileUpload";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

interface QuizQuestionProps {
  question: Question;
  onNext: (selectedOption: number) => void;
  currentQuestionNumber: number;
  totalQuestions: number;
}

export function QuizQuestion({
  question,
  onNext,
  currentQuestionNumber,
  totalQuestions,
}: QuizQuestionProps) {
  // Use the question's timeLimit property or default to 30 seconds
  const defaultTimePerQuestion = question.timeLimit || 30;
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(defaultTimePerQuestion);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [animateOptions, setAnimateOptions] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [confirmAnswer, setConfirmAnswer] = useState(false);
  const optionLabels = ["A", "B", "C", "D"];
  const timerProgressRef = useRef<HTMLDivElement>(null);

  // Generate a unique ID for this question instance to prevent state sharing
  const instanceId = useRef(`q-${question.id}-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    // Reset timer when question changes
    setTimeLeft(defaultTimePerQuestion);
    setIsTimerRunning(true);
    setSelectedOption(null);
    setIsAnswered(false);
    setAnimateOptions(true);
    setShowFeedback(false);
    setConfirmAnswer(false);
  }, [question.id, defaultTimePerQuestion]);

  useEffect(() => {
    if (!isTimerRunning) return;
    
    if (timeLeft <= 0) {
      setIsTimerRunning(false);
      setIsAnswered(true);
      setShowFeedback(true);
      return;
    }
    
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    
    if (timerProgressRef.current) {
      timerProgressRef.current.style.transition = "width 1s linear";
      timerProgressRef.current.style.width = `${(timeLeft / defaultTimePerQuestion) * 100}%`;
    }
    
    return () => clearTimeout(timer);
  }, [timeLeft, isTimerRunning, defaultTimePerQuestion]);

  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswered) return;
    
    setSelectedOption(optionIndex);
    
    // Don't mark as answered yet - wait for confirm button
    setConfirmAnswer(true);
    setIsTimerRunning(false);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null || isAnswered) return;
    
    setIsAnswered(true);
    
    // Show feedback after confirming
    setTimeout(() => {
      setShowFeedback(true);
    }, 300);
  };

  const handleNextQuestion = () => {
    if (selectedOption === null) {
      // If time ran out and no option was selected
      onNext(-1);
    } else {
      onNext(selectedOption);
    }
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
  
  // Format explanation for better readability
  const formatExplanation = (explanation: string) => {
    if (!explanation) return "No explanation available.";
    
    // Check if the explanation already mentions correct and incorrect answers
    const hasCorrectReference = /\bcorrect\b/i.test(explanation);
    const hasIncorrectReference = /\bincorrect\b/i.test(explanation);
    
    if (hasCorrectReference && hasIncorrectReference) {
      return explanation;
    }
    
    // If not, add some structure to the explanation
    let formattedExplanation = explanation;
    
    if (!hasCorrectReference) {
      formattedExplanation = `The correct answer is ${optionLabels[question.correctAnswer]}: ${question.options[question.correctAnswer]}. ${formattedExplanation}`;
    }
    
    if (selectedOption !== null && selectedOption !== question.correctAnswer && !hasIncorrectReference) {
      formattedExplanation += ` You selected ${optionLabels[selectedOption]}, which is incorrect.`;
    }
    
    return formattedExplanation;
  };
  
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30, 
        delayChildren: 0.2,
        staggerChildren: 0.1 
      }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      transition: { ease: "easeInOut" } 
    }
  };
  
  const optionVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  };

  const resultVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 500, 
        damping: 30,
        delay: 0.2
      }
    }
  };

  // Check if it's the last question
  const isLastQuestion = currentQuestionNumber === totalQuestions;

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={instanceId.current}
        className="w-full max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              Question {currentQuestionNumber} of {totalQuestions}
            </span>
            <div className="flex items-center text-sm">
              <Timer className="h-4 w-4 mr-1 text-primary" />
              <span className={`font-medium ${timeLeft < 10 ? "text-destructive animate-pulse" : ""}`}>{timeLeft}s</span>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              style={{ width: `${progress}%` }}
              initial={{ width: `${(currentQuestionNumber - 1) / totalQuestions * 100}%` }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
            <div 
              ref={timerProgressRef} 
              className="h-full bg-primary/60" 
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <Card className="quiz-container shadow-md animate-slide-up">
          <CardHeader>
            <motion.div
              className="text-lg font-medium mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {question.question}
            </motion.div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <motion.button
                  key={`${instanceId.current}-option-${index}`}
                  className={`w-full text-left p-4 rounded-lg flex items-start border-2 transition-all ${
                    isAnswered && index === question.correctAnswer
                      ? "border-success bg-success/5"
                      : isAnswered && index === selectedOption && index !== question.correctAnswer
                      ? "border-destructive bg-destructive/5"
                      : selectedOption === index
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-primary/50 hover:bg-muted/30"
                  }`}
                  onClick={() => handleOptionSelect(index)}
                  disabled={isAnswered}
                  variants={optionVariants}
                  custom={index}
                  initial="hidden"
                  animate={animateOptions ? "visible" : "hidden"}
                  whileHover={!isAnswered ? { scale: 1.01, translateX: 5 } : {}}
                  whileTap={!isAnswered ? { scale: 0.98 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="font-medium">{optionLabels[index]}</span>
                  </div>
                  <span className="text-left">{option}</span>
                  {isAnswered && index === question.correctAnswer && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="ml-auto"
                    >
                      <CheckCircle className="ml-auto h-5 w-5 text-success" />
                    </motion.div>
                  )}
                  {isAnswered && index === selectedOption && index !== question.correctAnswer && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="ml-auto"
                    >
                      <XCircle className="ml-auto h-5 w-5 text-destructive" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>

            {showFeedback && question.explanation && (
              <motion.div 
                className="mt-6 p-4 bg-muted/50 rounded-md border border-muted"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.3 }}
              >
                <p className="font-medium mb-1">Explanation:</p>
                <p className="text-sm">{formatExplanation(question.explanation)}</p>
              </motion.div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            {confirmAnswer && !isAnswered && (
              <motion.div 
                className="w-full flex justify-between items-center"
                variants={resultVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="flex items-center">
                  <span className="font-medium">Confirm your answer?</span>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button onClick={handleConfirmAnswer} className="relative overflow-hidden">
                    <motion.span
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      Confirm
                    </motion.span>
                  </Button>
                </motion.div>
              </motion.div>
            )}
            
            {isAnswered && (
              <motion.div 
                className="w-full flex justify-between items-center"
                variants={resultVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="flex items-center">
                  {isCorrect ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-success mr-2" />
                      <span className="font-medium text-success">Correct!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-destructive mr-2" />
                      <span className="font-medium text-destructive">Incorrect</span>
                    </>
                  )}
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button onClick={handleNextQuestion} className="relative overflow-hidden">
                    <motion.span
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {isLastQuestion ? "Finish Quiz" : "Next Question"}
                    </motion.span>
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
