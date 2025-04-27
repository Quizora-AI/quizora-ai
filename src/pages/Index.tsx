import { useState, useEffect, Suspense } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Question } from "@/components/FileUpload";
import { Header } from "@/components/Header";
import { TabNavigation } from "@/components/TabNavigation";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import QuizFlowContainer, { AppState as QuizAppState } from "@/components/QuizFlow/QuizFlowContainer";
import { FlashcardsFlow } from "@/components/Flashcards/FlashcardsFlow";
import { QuizGenerator } from "@/components/QuizGenerator";
import { QuizHistory } from "@/components/QuizHistory";
import { SettingsPanel } from "@/components/SettingsPanel";
import { LegalContentWrapper } from "@/components/LegalContentWrapper";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { TokenPanel } from "@/components/TokenPanel";

const Index = ({ initialTab = "generate" }: { initialTab?: string }) => {
  const [appState, setAppState] = useState<number>(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizTitle, setQuizTitle] = useState<string>("Quiz");
  const [quizInProgress, setQuizInProgress] = useState<boolean>(false);
  const [showQuizResumeDialog, setShowQuizResumeDialog] = useState<boolean>(false);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [contentKey, setContentKey] = useState<string>(`content-${Date.now()}`);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const savedQuizState = localStorage.getItem("quizInProgress");
    
    if (savedQuizState && location.pathname === '/quiz') {
      try {
        const parsedState = JSON.parse(savedQuizState);
        if (parsedState.questions && 
            parsedState.questions.length > 0 && 
            parsedState.currentIndex !== undefined &&
            parsedState.currentIndex < parsedState.questions.length) {
          setQuestions(parsedState.questions);
          if (parsedState.title) setQuizTitle(parsedState.title);
          setShowQuizResumeDialog(true);
        } else {
          localStorage.removeItem("quizInProgress");
        }
      } catch (error) {
        console.error("Error loading saved quiz:", error);
        localStorage.removeItem("quizInProgress");
      }
    }
    
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

    setContentKey(`content-${location.pathname}-${Date.now()}`);
  }, [location.pathname, toast]);

  const handleResumeQuiz = () => {
    setAppState(1);
    setQuizInProgress(true);
    setShowQuizResumeDialog(false);
    toast({
      title: "Quiz Resumed",
      description: "You can continue your quiz from where you left off"
    });
  };
  
  const handleDiscardQuiz = () => {
    localStorage.removeItem("quizInProgress");
    setQuestions([]);
    setShowQuizResumeDialog(false);
    toast({
      title: "Quiz Discarded",
      description: "Starting with a fresh quiz"
    });
  };

  const handleQuizGenerated = (generatedQuestions: Question[]) => {
    setQuestions(generatedQuestions);
    setQuizTitle(`Quiz - ${new Date().toLocaleDateString()}`);
    setAppState(1);
    setQuizInProgress(true);
    toast({
      title: "Quiz Generated",
      description: `${generatedQuestions.length} questions ready for you`,
    });
    localStorage.setItem("quizInProgress", JSON.stringify({
      questions: generatedQuestions,
      title: quizTitle,
      currentIndex: 0,
      userAnswers: [],
    }));
  };

  const handleBackToCreate = () => {
    setQuestions([]);
    setAppState(0);
    setQuizInProgress(false);
    localStorage.removeItem("quizInProgress");
    navigate("/quiz");
  };

  const handleExitQuiz = () => {
    if (questions?.length) {
      localStorage.setItem("quizInProgress", JSON.stringify({
        questions,
        title: quizTitle,
      }));
    }
    setQuizInProgress(false);
    setAppState(0);
    navigate("/quiz");
    toast({
      title: "Quiz saved",
      description: "Your progress has been saved. You can resume later."
    });
  };

  const renderContent = () => {
    if (location.pathname === "/legal") {
      return <LegalContentWrapper />;
    }
    
    if (appState === 1 && questions && questions.length > 0) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          key="quiz-flow"
          className="pt-[107px]"
        >
          <div className="flex items-center mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2 border-border hover:bg-muted" 
              onClick={handleExitQuiz}
            >
              <ArrowLeft className="h-4 w-4" /> Exit quiz
            </Button>
          </div>
          <QuizFlowContainer
            questions={questions}
            setQuestions={setQuestions}
            quizTitle={quizTitle}
            setQuizTitle={setQuizTitle}
            onBackToCreate={handleBackToCreate}
            initialAppState={QuizAppState.QUIZ}
          />
        </motion.div>
      );
    }
    
    const showTabs = ["/quiz", "/flashcards", "/history", "/settings"].includes(location.pathname);
    
    return (
      <>
        {showTabs && <TabNavigation onQuizGenerated={handleQuizGenerated} />}
        
        <AnimatePresence mode="wait">
          {location.pathname === "/quiz" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              key="generate-content"
              className="w-full pt-[107px]"
            >
              <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading Quiz Generator...</div>}>
                <QuizGenerator onQuizGenerated={handleQuizGenerated} />
              </Suspense>
            </motion.div>
          )}
          
          {location.pathname === "/flashcards" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              key="flashcards-content"
              className="w-full pt-[107px] mb-16"
            >
              <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading Flashcards...</div>}>
                <FlashcardsFlow onBackToCreate={() => navigate('/quiz')} />
              </Suspense>
            </motion.div>
          )}
          
          {location.pathname === "/history" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              key="history-content"
              className="w-full mt-4 mb-16 pt-[112px]"
            >
              <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading History...</div>}>
                <QuizHistory />
              </Suspense>
            </motion.div>
          )}
          
          {location.pathname === "/settings" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              key="settings-content"
              className="w-full mt-4 mb-16 pt-[112px]"
            >
              <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading Settings...</div>}>
                <SettingsPanel />
              </Suspense>
            </motion.div>
          )}

          {location.pathname === "/tokens" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              key="tokens-content"
              className="w-full mt-4 mb-16"
            >
              <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading Token System...</div>}>
                <TokenPanel />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90 flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-30">
        <Header />
      </div>
      <main className="flex-1 px-4 py-2 pb-28">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>
      
      <Dialog open={showQuizResumeDialog} onOpenChange={setShowQuizResumeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resume Quiz?</DialogTitle>
            <DialogDescription>
              You have an unfinished quiz. Would you like to continue where you left off?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4 my-4">
            <p className="text-center text-sm text-muted-foreground">
              {quizTitle}
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={handleDiscardQuiz}
              className="sm:flex-1"
            >
              Start new quiz
            </Button>
            <Button 
              onClick={handleResumeQuiz}
              className="sm:flex-1"
            >
              Resume quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
