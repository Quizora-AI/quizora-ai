import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Question } from "@/components/FileUpload";
import { Header } from "@/components/Header";
import { TabNavigation } from "@/components/TabNavigation";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { QuizFlow, AppState as QuizAppState } from "@/components/QuizFlow";
import { LegalContentWrapper } from "@/components/LegalContentWrapper";

const Index = ({ initialTab = "generate" }: { initialTab?: string }) => {
  const [appState, setAppState] = useState<number>(0); // 0: CREATE, 1: QUIZ
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizTitle, setQuizTitle] = useState<string>("Medical Quiz");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const quizToRetake = localStorage.getItem("quizToRetake");
    if (quizToRetake) {
      try {
        const { questions, title } = JSON.parse(quizToRetake);
        if (questions && questions.length > 0) {
          setQuestions(questions);
          if (title) setQuizTitle(title);
          setAppState(1);
          localStorage.removeItem("quizToRetake");

          toast({
            title: "Quiz Loaded",
            description: "You're retaking a previous quiz"
          });
        }
      } catch (error) {
        console.error("Error loading quiz to retake:", error);
        localStorage.removeItem("quizToRetake");
      }
    }
    // eslint-disable-next-line
  }, []);

  const handleQuizGenerated = (generatedQuestions: Question[]) => {
    setQuestions(generatedQuestions);
    setQuizTitle(
      `Medical Quiz - ${new Date().toLocaleDateString()}`
    );
    setAppState(1);
    toast({
      title: "Quiz Generated",
      description: `${generatedQuestions.length} questions ready for you`,
    });
  };

  const handleBackToCreate = () => {
    setQuestions([]);
    setAppState(0);
    navigate("/");
  };

  const renderContent = () => {
    // Legal page route
    if (location.pathname === "/legal") {
      return <LegalContentWrapper />;
    }
    // Quiz flow (QUIZ/RESULTS/ANALYTICS)
    if (appState === 1 && questions && questions.length > 0) {
      return (
        <QuizFlow
          questions={questions}
          setQuestions={setQuestions}
          quizTitle={quizTitle}
          setQuizTitle={setQuizTitle}
          onBackToCreate={handleBackToCreate}
          initialAppState={QuizAppState.QUIZ}
        />
      );
    }
    // Tabs navigation
    return (
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={{
          initial: { opacity: 0, x: 50 },
          in: { opacity: 1, x: 0 },
          out: { opacity: 0, x: -50 },
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className="w-full"
        key={location.pathname}
      >
        <TabNavigation onQuizGenerated={handleQuizGenerated} />
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90 flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8 pb-28">
        <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
