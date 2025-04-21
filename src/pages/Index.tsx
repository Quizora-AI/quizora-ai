
import { Header } from "@/components/Header";
import { AnimatePresence } from "framer-motion";
import { IndexMainContent } from "./IndexMainContent";
import { useQuizLogic } from "./IndexQuizLogic";

// This page wires together quiz logic and UI

const Index = ({ initialTab = "generate" }) => {
  const {
    appState,
    questions,
    currentQuestionIndex,
    userAnswers,
    location,
    handleQuizGenerated,
    handleNextQuestion,
    handleRetakeQuiz,
    handleNewQuiz,
    handleViewAnalytics,
    getCorrectAnswersCount
  } = useQuizLogic();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90 flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8 pb-28">
        <AnimatePresence mode="wait">
          <IndexMainContent
            appState={appState}
            currentQuestionIndex={currentQuestionIndex}
            questions={questions}
            userAnswers={userAnswers}
            location={location}
            handleQuizGenerated={handleQuizGenerated}
            handleNextQuestion={handleNextQuestion}
            handleRetakeQuiz={handleRetakeQuiz}
            handleNewQuiz={handleNewQuiz}
            handleViewAnalytics={handleViewAnalytics}
            getCorrectAnswersCount={getCorrectAnswersCount}
          />
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
