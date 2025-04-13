
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleCheck, CircleX, RotateCw, FileUp, BookmarkPlus } from "lucide-react";

interface QuizResultsProps {
  totalQuestions: number;
  correctAnswers: number;
  onRetakeQuiz: () => void;
  onNewFile: () => void;
}

export function QuizResults({
  totalQuestions,
  correctAnswers,
  onRetakeQuiz,
  onNewFile,
}: QuizResultsProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const score = Math.round((correctAnswers / totalQuestions) * 100);
  
  useEffect(() => {
    // Animate the score counting up
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
  
  return (
    <Card className="w-full max-w-3xl mx-auto mt-8 animate-slide-up">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Quiz Results</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {/* Score circle */}
        <div className="w-48 h-48 rounded-full border-8 border-primary/20 flex items-center justify-center mb-8">
          <div className="text-center">
            <div className={`text-5xl font-bold ${getScoreColor()}`}>
              {animatedScore}%
            </div>
            <div className="text-lg font-medium mt-1">{getScoreMessage()}</div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-8 w-full max-w-md">
          <div className="flex flex-col items-center">
            <CircleCheck className="h-8 w-8 text-success mb-2" />
            <div className="text-2xl font-bold">{correctAnswers}</div>
            <div className="text-sm text-muted-foreground">Correct Answers</div>
          </div>
          <div className="flex flex-col items-center">
            <CircleX className="h-8 w-8 text-error mb-2" />
            <div className="text-2xl font-bold">{totalQuestions - correctAnswers}</div>
            <div className="text-sm text-muted-foreground">Wrong Answers</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center gap-4 flex-wrap">
        <Button onClick={onRetakeQuiz} className="gap-2">
          <RotateCw className="h-4 w-4" />
          Retake Quiz
        </Button>
        <Button onClick={onNewFile} variant="outline" className="gap-2">
          <FileUp className="h-4 w-4" />
          Upload New File
        </Button>
        <Button variant="ghost" className="gap-2">
          <BookmarkPlus className="h-4 w-4" />
          Save Quiz
        </Button>
      </CardFooter>
    </Card>
  );
}
