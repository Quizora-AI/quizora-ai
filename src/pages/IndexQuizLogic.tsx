
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

export function useQuizLogic(quizTitleInitial = "Medical Quiz") {
  const [appState, setAppState] = useState<AppState>(AppState.CREATE);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [quizTitle, setQuizTitle] = useState<string>(quizTitleInitial);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleQuizGenerated = (generatedQuestions: Question[]) => {
    setQuestions(generatedQuestions);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setStartTime(new Date());
    setEndTime(null);
    const now = new Date();
    setQuizTitle(`Medical Quiz - ${now.toLocaleDateString()}`);
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
          const user = (await supabase.auth.getUser()).data.user;
          if (!user) return;

          const { data: existingAttempts } = await supabase
            .from("quiz_attempts")
            .select("id")
            .eq("user_id", user.id);

          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("isPremium,free_quizzes_used")
            .eq("id", user.id)
            .maybeSingle();

          const isPremium = profile?.isPremium === true;
          const maxFree = 2;
          if (!isPremium && (existingAttempts?.length ?? 0) >= maxFree) {
            toast({
              title: "Upgrade Required",
              description: "Upgrade to premium to save more than 2 quizzes!",
              variant: "destructive"
            });
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
            user_id: user.id,
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
  }, [appState, questions, userAnswers, quizTitle, toast]);

  useEffect(() => {
    if (appState === AppState.QUIZ && questions.length > 10) {
      toast({
        title: "Too many questions",
        description: "You can only have up to 10 questions in a quiz.",
        variant: "destructive"
      });
      setAppState(AppState.CREATE);
    }
  }, [appState, questions]);

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
    location
  };
}
