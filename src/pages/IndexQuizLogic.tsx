
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Question } from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export enum AppState {
  CREATE,
  QUIZ,
  RESULTS,
  ANALYTICS
}

export function useQuizLogic(quizTitleInitial = "Quizora Quiz") {
  const [appState, setAppState] = useState<AppState>(AppState.CREATE);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [quizTitle, setQuizTitle] = useState<string>(quizTitleInitial);
  const [userId, setUserId] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [quizCount, setQuizCount] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication and get user data
  useEffect(() => {
    const fetchUserData = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUserId(data.session.user.id);
        
        // Get user profile to check premium status
        const { data: profile } = await supabase
          .from("profiles")
          .select("isPremium")
          .eq("id", data.session.user.id)
          .maybeSingle();
        
        setIsPremium(profile?.isPremium === true);
        
        // Count existing quizzes
        const { data: quizzes, error } = await supabase
          .from("quiz_attempts")
          .select("id")
          .eq("user_id", data.session.user.id);
          
        if (!error && quizzes) {
          setQuizCount(quizzes.length);
        }
      } else {
        // Redirect to login if not authenticated
        navigate("/settings?tab=profile");
      }
    };
    
    fetchUserData();
  }, [navigate]);

  const handleQuizGenerated = (generatedQuestions: Question[]) => {
    // Check if user can generate a quiz
    if (!isPremium && quizCount >= 2) {
      toast({
        title: "Free Limit Reached",
        description: "You've reached the limit of 2 free quizzes. Upgrade to premium for unlimited quizzes!",
        variant: "destructive"
      });
      navigate("/settings?tab=premium");
      return;
    }
    
    setQuestions(generatedQuestions);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setStartTime(new Date());
    setEndTime(null);
    const now = new Date();
    setQuizTitle(`Quiz - ${now.toLocaleDateString()}`);
    setAppState(AppState.QUIZ);
  };

  const handleNextQuestion = (selectedOption: number) => {
    const newUserAnswers = [...userAnswers, selectedOption];
    setUserAnswers(newUserAnswers);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setEndTime(new Date());
      setAppState(AppState.RESULTS);
    }
  };

  const handleViewAnalytics = () => setAppState(AppState.ANALYTICS);

  const handleRetakeQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setStartTime(new Date());
    setEndTime(null);
    setAppState(AppState.QUIZ);
  };

  const handleNewQuiz = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setStartTime(null);
    setEndTime(null);
    setAppState(AppState.CREATE);
  };

  const getCorrectAnswersCount = () => {
    return userAnswers.reduce((count, answer, index) => {
      return count + (answer === questions[index].correctAnswer ? 1 : 0);
    }, 0);
  };

  useEffect(() => {
    if (appState === AppState.RESULTS && questions.length > 0 && userAnswers.length > 0) {
      (async () => {
        try {
          const { data } = await supabase.auth.getSession();
          if (!data.session?.user) return;

          // Check if user is premium or has used less than 2 free quizzes
          const { data: profile } = await supabase
            .from("profiles")
            .select("isPremium")
            .eq("id", data.session.user.id)
            .maybeSingle();
          
          const userIsPremium = profile?.isPremium === true;
          
          // Get count of existing quizzes
          const { data: existingQuizzes } = await supabase
            .from("quiz_attempts")
            .select("id")
            .eq("user_id", data.session.user.id);
          
          const quizzesTaken = existingQuizzes?.length || 0;
          
          // Only allow saving if premium or under free limit
          if (!userIsPremium && quizzesTaken >= 2) {
            toast({
              title: "Free Limit Reached",
              description: "You've reached the limit of 2 free quizzes. Upgrade to premium to save more quizzes!",
              variant: "destructive"
            });
            navigate("/settings?tab=premium");
            return;
          }

          const correctAnswers = getCorrectAnswersCount();

          const questionsJson: Json = questions.map(q => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            timeLimit: q.timeLimit
          })) as Json;

          await supabase.from("quiz_attempts").insert({
            user_id: data.session.user.id,
            title: quizTitle,
            questions: questionsJson,
            user_answers: userAnswers as unknown as Json,
            score: Math.round((correctAnswers / questions.length) * 100),
            total_questions: questions.length,
            correct_answers: correctAnswers
          });

          toast({
            title: "Quiz saved",
            description: "Your quiz has been saved and can be revisited from history."
          });

        } catch (e) {
          toast({
            title: "Save failed",
            description: "Could not save quiz. Please try again.",
            variant: "destructive"
          });
        }
      })();
    }
  }, [appState, questions, userAnswers, quizTitle, toast, navigate]);

  useEffect(() => {
    // Limit questions count for non-premium users
    if (!isPremium && questions.length > 10) {
      const trimmedQuestions = questions.slice(0, 10);
      setQuestions(trimmedQuestions);
      toast({
        title: "Question limit",
        description: "Free users are limited to 10 questions per quiz. Upgrade to premium for up to 50 questions.",
        variant: "destructive"
      });
    }
  }, [questions, isPremium, toast]);

  return {
    appState,
    setAppState,
    questions,
    setQuestions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    userAnswers,
    setUserAnswers,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    quizTitle,
    setQuizTitle,
    handleQuizGenerated,
    handleNextQuestion,
    handleViewAnalytics,
    handleRetakeQuiz,
    handleNewQuiz,
    getCorrectAnswersCount,
    location,
    isPremium
  };
}
