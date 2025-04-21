import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Question } from "@/components/FileUpload";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowLeft, BarChart, RefreshCw, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QuizAnalytics } from "@/components/QuizAnalytics";
import { supabase } from "@/integrations/supabase/client";

interface QuizHistoryEntry {
  id: string;
  date: string;
  title: string;
  questionsCount: number;
  score: number;
  questions: Question[];
  userAnswers?: number[];
  attempts?: number;
}

const QuizReview = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user || !quizId) throw new Error("User or quiz ID missing");
        const { data, error } = await supabase
          .from("quiz_attempts")
          .select("*")
          .eq("id", quizId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (error || !data) {
          toast({
            title: "Error",
            description: "Quiz not found",
            variant: "destructive"
          });
          navigate("/history");
          return;
        }
        setQuiz(data);
      } catch (error) {
        console.error("Failed to load quiz:", error);
        toast({
          title: "Error",
          description: "Failed to load quiz details",
          variant: "destructive"
        });
        navigate("/history");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, navigate, toast]);

  const handleRetakeQuiz = () => {
    if (!quiz) return;
    
    // Check premium status for quizzes over 10 questions
    if (quiz.questions.length > 10) {
      const userSettings = localStorage.getItem("userSettings");
      if (userSettings) {
        const settings = JSON.parse(userSettings);
        if (!settings.isPremium) {
          toast({
            title: "Premium Feature",
            description: "Upgrade to premium to access quizzes with more than 10 questions",
          });
          navigate("/settings?tab=premium");
          return;
        }
      }
    }
    
    // Save the quiz to retake and navigate
    localStorage.setItem("quizToRetake", JSON.stringify({
      questions: quiz.questions,
      title: quiz.title
    }));
    
    navigate("/quiz");
  };
  
  const getCorrectAnswersCount = () => {
    if (!quiz || !quiz.user_answers || !quiz.questions) return 0;
    
    return quiz.user_answers.reduce((count, answer, index) => {
      return count + (answer === quiz.questions[index].correctAnswer ? 1 : 0);
    }, 0);
  };
  
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/90 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/90 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-4">Quiz not found</h2>
                <Button onClick={() => navigate("/history")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to History
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90 flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8 pb-28">
        {showAnalytics ? (
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
          >
            <div className="mb-6">
              <Button variant="outline" onClick={() => setShowAnalytics(false)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Summary
              </Button>
            </div>
            
            <QuizAnalytics
              questions={quiz.questions}
              correctAnswers={getCorrectAnswersCount()}
              incorrectAnswers={quiz.questions.length - getCorrectAnswersCount()}
              userAnswers={quiz.user_answers || []}
            />
          </motion.div>
        ) : (
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            className="w-full max-w-4xl mx-auto"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold">{quiz.title}</CardTitle>
                    <CardDescription>
                      Completed on {new Date(quiz.created_at).toLocaleDateString()} • {quiz.attempts || 1} {quiz.attempts === 1 ? 'attempt' : 'attempts'}
                    </CardDescription>
                  </div>
                  <div className={`text-2xl font-bold p-3 rounded-full ${
                    quiz.score >= 80 ? 'text-green-600' :
                    quiz.score >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {quiz.score}%
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-lg mb-2">Quiz Summary</h3>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="text-2xl font-semibold">{quiz.total_questions}</div>
                        <div className="text-sm text-muted-foreground">Questions</div>
                      </div>
                      
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="text-2xl font-semibold">{getCorrectAnswersCount()}</div>
                        <div className="text-sm text-muted-foreground">Correct</div>
                      </div>
                      
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="text-2xl font-semibold">{quiz.total_questions - getCorrectAnswersCount()}</div>
                        <div className="text-sm text-muted-foreground">Incorrect</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg mb-2">Recommendations</h3>
                    <div className="bg-primary/5 p-4 rounded-lg">
                      <p className="text-muted-foreground">
                        {quiz.score >= 80 ? 
                          "Excellent work! Consider trying more challenging quizzes or exploring new topics." :
                          quiz.score >= 60 ?
                          "Good effort! Review the questions you got wrong and try the quiz again to improve your score." :
                          "Keep practicing! Consider reviewing the topics in this quiz and try again when you're ready."
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-wrap gap-2 justify-between">
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => navigate("/history")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  
                  <Button variant="outline" onClick={() => navigate("/")}>
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAnalytics(true)}
                    className="border-primary/20"
                  >
                    <BarChart className="mr-2 h-4 w-4" />
                    Detailed Analytics
                  </Button>
                  
                  <Button onClick={handleRetakeQuiz}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retake Quiz
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default QuizReview;
