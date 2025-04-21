
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Question } from "@/components/FileUpload";
import { Header } from "@/components/Header";
import { TabNavigation } from "@/components/TabNavigation";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { QuizFlow, AppState as QuizAppState } from "@/components/QuizFlow";
import { FlashcardsFlow } from "@/components/Flashcards/FlashcardsFlow";
import { LegalContentWrapper } from "@/components/LegalContentWrapper";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const Index = ({ initialTab = "generate" }: { initialTab?: string }) => {
  const [appState, setAppState] = useState<number>(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizTitle, setQuizTitle] = useState<string>("Quiz");
  const [quizInProgress, setQuizInProgress] = useState<boolean>(false);
  const [showQuizResumeDialog, setShowQuizResumeDialog] = useState<boolean>(false);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const savedQuizState = localStorage.getItem("quizInProgress");
    if (savedQuizState && location.pathname === '/') {
      try {
        const { questions, title } = JSON.parse(savedQuizState);
        if (questions && questions.length > 0) {
          setQuestions(questions);
          if (title) setQuizTitle(title);
          setShowQuizResumeDialog(true);
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
  }, [location.pathname]);

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
    navigate("/");
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
    navigate("/");
    toast({
      title: "Quiz saved",
      description: "Your progress has been saved. You can resume later."
    });
  };

  const renderContent = () => {
    // Use console.log to help diagnose rendering and navigation issues
    console.log("Rendering content for path:", location.pathname, "with appState:", appState);
    
    if (location.pathname === "/legal") {
      return <LegalContentWrapper />;
    }
    
    if (appState === 1 && questions && questions.length > 0) {
      return (
        <>
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
          <QuizFlow
            questions={questions}
            setQuestions={setQuestions}
            quizTitle={quizTitle}
            setQuizTitle={setQuizTitle}
            onBackToCreate={handleBackToCreate}
            initialAppState={QuizAppState.QUIZ}
          />
        </>
      );
    }
    
    // For flashcards page, render the flashcards component with unique key to prevent duplicate components
    if (location.pathname === "/flashcards") {
      return (
        <div key={`content-${location.pathname}`} className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full mb-16"
            key="flashcards-flow"
          >
            <FlashcardsFlow onBackToCreate={() => navigate('/')} />
          </motion.div>
        </div>
      );
    }
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full"
        key={`tab-content-${location.pathname}`}
      >
        <TabNavigation onQuizGenerated={handleQuizGenerated} />
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90 flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8 pb-28">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>
      
      {/* Always render tab navigation at the bottom when on flashcards page */}
      {location.pathname === "/flashcards" && (
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <TabNavigation onQuizGenerated={handleQuizGenerated} />
        </div>
      )}

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
