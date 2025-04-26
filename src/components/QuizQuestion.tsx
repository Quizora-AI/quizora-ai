
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { CheckCircle, XCircle, Timer, BookOpen, HelpCircle, Info, AlertTriangle, ArrowRight } from "lucide-react";
import { Question } from "./FileUpload";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

export interface QuizQuestionProps {
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
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const optionLabels = ["A", "B", "C", "D"];
  const timerProgressRef = useRef<HTMLDivElement>(null);
  const questionStartTime = useRef<Date>(new Date());

  // Key generator for the question
  const questionKey = `question-${question.id}-${currentQuestionNumber}`;
  
  // Reset ALL state when question changes - CRITICAL FIX for auto-selection bug
  useEffect(() => {
    console.log(`Question changed to ${currentQuestionNumber}, resetting all state with key: ${questionKey}`);
    setTimeLeft(defaultTimePerQuestion);
    setIsTimerRunning(true);
    setSelectedOption(null); 
    setIsAnswered(false);
    setShowFeedback(false);
    setTimeSpent(0);
    questionStartTime.current = new Date();
  }, [questionKey, defaultTimePerQuestion, currentQuestionNumber]);

  useEffect(() => {
    if (!isTimerRunning) return;
    
    if (timeLeft <= 0) {
      setIsTimerRunning(false);
      setIsAnswered(true);
      setShowFeedback(true);
      
      // Calculate time spent when time runs out
      const spent = Math.round((new Date().getTime() - questionStartTime.current.getTime()) / 1000);
      setTimeSpent(spent);
      return;
    }
    
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
      // Update time spent on each tick
      const spent = Math.round((new Date().getTime() - questionStartTime.current.getTime()) / 1000);
      setTimeSpent(spent);
    }, 1000);
    
    if (timerProgressRef.current) {
      timerProgressRef.current.style.transition = "width 1s linear";
      timerProgressRef.current.style.width = `${(timeLeft / defaultTimePerQuestion) * 100}%`;
    }
    
    return () => clearTimeout(timer);
  }, [timeLeft, isTimerRunning, defaultTimePerQuestion]);

  // Handle option selection - immediately select without confirmation
  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswered) return;
    
    console.log(`User selected option ${optionIndex} for question ${currentQuestionNumber}`);
    setSelectedOption(optionIndex);
    setIsAnswered(true);
    setIsTimerRunning(false);
    setShowFeedback(true);
    
    // Calculate exact time spent when answering
    const spent = Math.round((new Date().getTime() - questionStartTime.current.getTime()) / 1000);
    setTimeSpent(spent);
    console.log(`Time spent on question ${currentQuestionNumber}: ${spent} seconds`);
  };

  const handleNextQuestion = () => {
    if (selectedOption === null) {
      // If time ran out and no option was selected
      onNext(-1);
    } else {
      onNext(selectedOption);
    }
  };
  
  const isCorrect = selectedOption === question.correctAnswer;
  const progress = ((currentQuestionNumber) / totalQuestions) * 100;
  
  // Enhanced explanation formatting with vector icons and pointwise formatting
  const formatExplanation = (explanation: string) => {
    if (!explanation) return "No explanation available.";
    
    let formattedExplanation = '';
    
    // Always show the correct answer with icon
    formattedExplanation += `<div class="flex items-center gap-2 text-success mb-4">
      <CheckCircle className="h-4 w-4" />
      <span><strong>Correct Answer:</strong> ${optionLabels[question.correctAnswer]}: ${question.options[question.correctAnswer]}</span>
    </div>`;
    
    // If user selected wrong answer, provide explanation
    if (selectedOption !== null && selectedOption !== question.correctAnswer) {
      formattedExplanation += `<div class="flex items-center gap-2 text-destructive mb-4">
        <XCircle className="h-4 w-4" />
        <span><strong>Your Answer:</strong> ${optionLabels[selectedOption]}: ${question.options[selectedOption]}</span>
      </div>`;
      
      // AI-based analysis of why this option might be confusing
      formattedExplanation += `<div class="mt-3">
        <h4 class="font-medium flex items-center gap-2 mb-2 text-amber-600">
          <AlertTriangle className="h-4 w-4" />
          <span>Why this might be confusing:</span>
        </h4>
        <ul class="list-disc pl-6 space-y-1 text-sm">
          <li>This option contains partial truths that relate to the topic</li>
          <li>The wording is similar to the correct answer but misses key details</li>
          <li>It represents a common misconception about this concept</li>
        </ul>
      </div>`;
    }
    
    // Format the explanation as bullet points
    const keyPoints = explanation.split(/\.\s+/).filter(point => point.trim().length > 0);
    
    formattedExplanation += `<div class="mt-4">
      <h4 class="font-medium flex items-center gap-2 mb-2">
        <Info className="h-4 w-4 text-primary" />
        <span>Key points to remember:</span>
      </h4>
      <ul class="list-disc pl-6 space-y-1 text-sm">`;
    
    keyPoints.forEach(point => {
      if (point.trim()) {
        formattedExplanation += `<li>${point.trim()}.</li>`;
      }
    });
    
    formattedExplanation += `</ul></div>`;
    
    return formattedExplanation;
  };
  
  // Check if it's the last question
  const isLastQuestion = currentQuestionNumber === totalQuestions;

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={questionKey}
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
              className="text-lg font-medium mb-4 flex items-start gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <BookOpen className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span>{question.question}</span>
            </motion.div>
            {question.difficulty && (
              <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                question.difficulty === 'easy' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                  : question.difficulty === 'medium'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)} difficulty
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <motion.button
                  key={`${questionKey}-option-${index}`}
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
                  initial="hidden"
                  animate="visible"
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
                <div dangerouslySetInnerHTML={{ __html: formatExplanation(question.explanation) }} />
                
                <div className="flex items-center mt-4 pt-2 border-t border-border text-muted-foreground text-sm">
                  <Timer className="h-4 w-4 mr-1.5" /> 
                  <span>Time spent on this question: {timeSpent} seconds</span>
                </div>
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
                      <XCircle className="h-5 w-5 text-destructive mr-2" />
                      <span className="font-medium text-destructive">Incorrect</span>
                    </>
                  )}
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button onClick={handleNextQuestion} className="relative overflow-hidden flex items-center gap-1.5">
                    <motion.span
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {isLastQuestion ? "Finish Quiz" : "Next Question"}
                    </motion.span>
                    <ArrowRight className="h-4 w-4" />
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
