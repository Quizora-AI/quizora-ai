
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
  const [animateOptions, setAnimateOptions] = useState(false);
  const optionLabels = ["A", "B", "C", "D"];
  const timerProgressRef = useRef<HTMLDivElement>(null);

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
    
    // Apply animation to timer bar
    if (timerProgressRef.current) {
      timerProgressRef.current.style.transition = "width 1s linear";
      timerProgressRef.current.style.width = `${(timeLeft / defaultTimePerQuestion) * 100}%`;
    }
    
    return () => clearTimeout(timer);
  }, [timeLeft, isTimerRunning, defaultTimePerQuestion]);

  // Animate options on mount
  useEffect(() => {
    setAnimateOptions(true);
  }, []);

  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswered) return;
    
    setSelectedOption(optionIndex);
    setIsAnswered(true);
    setIsTimerRunning(false);
  };

  const handleNextQuestion = () => {
    onNext(selectedOption !== null ? selectedOption : -1);
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
  
  // Animation variants
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

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={question.id}
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
              <Timer className="h-4 w-4 mr-1 text-medical-teal" />
              <span className={`font-medium ${timeLeft < 10 ? "text-error animate-pulse" : ""}`}>{timeLeft}s</span>
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
              className="h-full bg-medical-teal" 
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
                  key={index}
                  className={getOptionClassName(index)}
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
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-4">
                    <span className="font-medium">{optionLabels[index]}</span>
                  </div>
                  <span className="text-left">{option}</span>
                  {isAnswered && index === question.correctAnswer && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <CheckCircle className="ml-auto h-5 w-5 text-success" />
                    </motion.div>
                  )}
                  {isAnswered && index === selectedOption && index !== question.correctAnswer && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <XCircle className="ml-auto h-5 w-5 text-error" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>

            {isAnswered && question.explanation && (
              <motion.div 
                className="mt-6 p-4 bg-muted/50 rounded-md"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.3 }}
              >
                <p className="font-medium mb-1">Explanation:</p>
                <p className="text-sm">{question.explanation}</p>
              </motion.div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
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
                      <XCircle className="h-5 w-5 text-error mr-2" />
                      <span className="font-medium text-error">Incorrect</span>
                    </>
                  )}
                </div>
                <Button 
                  onClick={handleNextQuestion} 
                  className="relative overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.span
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Next Question
                  </motion.span>
                </Button>
              </motion.div>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
