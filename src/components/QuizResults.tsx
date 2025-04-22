
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleCheck, CircleX, RotateCw, BarChart3, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BannerAd, useInterstitialAd, useAdFrequencyTracker } from "./GoogleAds";

interface QuizResultsProps {
  totalQuestions: number;
  correctAnswers: number;
  onRetakeQuiz: () => void;
  onNewFile: () => void;
  onViewAnalytics: () => void;
}

export function QuizResults({
  totalQuestions,
  correctAnswers,
  onRetakeQuiz,
  onNewFile,
  onViewAnalytics,
}: QuizResultsProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const score = Math.round((correctAnswers / totalQuestions) * 100);
  const navigate = useNavigate();
  const { trackQuizCompletion } = useAdFrequencyTracker();
  const { showInterstitial } = useInterstitialAd({ 
    adUnitId: "ca-app-pub-8270549953677995/9564071776",
    onAdDismissed: () => {
      // Wait for ad to dismiss before showing results
      console.log("Interstitial ad dismissed");
    }
  });
  
  useEffect(() => {
    // Try to show interstitial ad when results page loads
    const shouldShowAd = trackQuizCompletion();
    if (shouldShowAd) {
      showInterstitial();
    }
  }, []);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedScore(prev => {
        if (prev < score) {
          return prev + 1;
        }
        clearInterval(interval);
        return score;
      });
    }, 20);
    
    return () => clearInterval(interval);
  }, [score]);
  
  const getScoreColor = () => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-medical-teal";
    if (score >= 40) return "text-medical-DEFAULT";
    return "text-error";
  };
  
  const getScoreMessage = () => {
    if (score >= 80) return "Excellent!";
    if (score >= 60) return "Good job!";
    if (score >= 40) return "Not bad!";
    return "Needs improvement";
  };
  
  const handleCreateNewQuiz = () => {
    onNewFile();
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  const circleVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: 0.5
      }
    }
  };
  
  return (
    <motion.div
      className="w-full max-w-3xl mx-auto mt-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="shadow-lg border-t-4 border-primary">
        <CardHeader>
          <motion.div variants={itemVariants}>
            <CardTitle className="text-2xl font-bold text-center">Quiz Results</CardTitle>
          </motion.div>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center">
          <motion.div 
            className="w-48 h-48 rounded-full border-8 border-primary/20 flex items-center justify-center mb-8"
            variants={circleVariants}
          >
            <div className="text-center">
              <motion.div 
                className={`text-5xl font-bold ${getScoreColor()}`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: 0.8
                }}
              >
                {animatedScore}%
              </motion.div>
              <motion.div 
                className="text-lg font-medium mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                {getScoreMessage()}
              </motion.div>
            </div>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-2 gap-8 w-full max-w-md"
            variants={itemVariants}
          >
            <motion.div 
              className="flex flex-col items-center p-4 bg-success/10 rounded-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <CircleCheck className="h-8 w-8 text-success mb-2" />
              <div className="text-2xl font-bold">{correctAnswers}</div>
              <div className="text-sm text-muted-foreground">Correct Answers</div>
            </motion.div>
            <motion.div 
              className="flex flex-col items-center p-4 bg-error/10 rounded-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <CircleX className="h-8 w-8 text-error mb-2" />
              <div className="text-2xl font-bold">{totalQuestions - correctAnswers}</div>
              <div className="text-sm text-muted-foreground">Wrong Answers</div>
            </motion.div>
          </motion.div>
          
          {/* Banner ad placement */}
          <div className="w-full mt-6">
            <BannerAd adUnitId="ca-app-pub-8270549953677995/2218567244" />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center gap-4 flex-wrap">
          <motion.div variants={itemVariants}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={onViewAnalytics} className="gap-2">
                <BarChart3 className="h-4 w-4" />
                View Analysis
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={onRetakeQuiz} className="gap-2">
                <RotateCw className="h-4 w-4" />
                Retake Quiz
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={handleCreateNewQuiz} variant="outline" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Create New Quiz
              </Button>
            </motion.div>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
