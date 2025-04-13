
import { useState } from "react";
import { FileUpload, Question } from "@/components/FileUpload";
import { QuizQuestion } from "@/components/QuizQuestion";
import { QuizResults } from "@/components/QuizResults";
import { Header } from "@/components/Header";

enum AppState {
  UPLOAD,
  QUIZ,
  RESULTS
}

const Index = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{correct: number, wrong: number}>({ correct: 0, wrong: 0 });
  
  const handleFileProcessed = (extractedQuestions: Question[]) => {
    setQuestions(extractedQuestions);
    setCurrentQuestionIndex(0);
    setUserAnswers({ correct: 0, wrong: 0 });
    setAppState(AppState.QUIZ);
  };
  
  const handleNextQuestion = () => {
    // Check if the user selected the correct answer
    const selectedOption = document.querySelector(".option-btn.selected");
    const isCorrect = selectedOption?.classList.contains("correct");
    
    // Update user answers
    if (isCorrect) {
      setUserAnswers(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setUserAnswers(prev => ({ ...prev, wrong: prev.wrong + 1 }));
    }
    
    // Move to next question or end quiz
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setAppState(AppState.RESULTS);
    }
  };
  
  const handleRetakeQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({ correct: 0, wrong: 0 });
    setAppState(AppState.QUIZ);
  };
  
  const handleNewFile = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers({ correct: 0, wrong: 0 });
    setAppState(AppState.UPLOAD);
  };
  
  const renderContent = () => {
    switch (appState) {
      case AppState.UPLOAD:
        return <FileUpload onFileProcessed={handleFileProcessed} />;
        
      case AppState.QUIZ:
        return (
          <QuizQuestion
            question={questions[currentQuestionIndex]}
            onNext={handleNextQuestion}
            currentQuestionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
          />
        );
        
      case AppState.RESULTS:
        return (
          <QuizResults
            totalQuestions={questions.length}
            correctAnswers={userAnswers.correct}
            onRetakeQuiz={handleRetakeQuiz}
            onNewFile={handleNewFile}
          />
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
