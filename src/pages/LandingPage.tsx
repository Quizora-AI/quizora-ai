
import * as React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "../App"; // Import the auth context

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth(); // Use the auth context
  
  useEffect(() => {
    // Redirect to quiz if already logged in
    if (!loading && user) {
      console.log("User is already logged in, redirecting to quiz");
      navigate("/quiz");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-primary/10 flex flex-col">
      <header className="w-full p-4 flex justify-between items-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
          Quizora
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Master Any Subject with AI-Powered Quizzes
          </h1>
          <p className="text-xl mb-8 text-muted-foreground">
            Upload your notes, generate flashcards, and test your knowledge with our intelligent quiz platform
          </p>
        </motion.div>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="px-8"
          >
            Get Started
          </Button>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-16 w-full max-w-3xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border rounded-xl shadow-sm p-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-primary"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Upload Notes</h3>
              <p className="text-sm text-muted-foreground">
                Upload your study materials and let our AI transform them into comprehensive quizzes
              </p>
            </div>
            
            <div className="bg-card border rounded-xl shadow-sm p-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-primary"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.5 20.25h-15a1.5 1.5 0 01-1.5-1.5v-15a1.5 1.5 0 011.5-1.5h15a1.5 1.5 0 011.5 1.5v15a1.5 1.5 0 01-1.5 1.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Generate Flashcards</h3>
              <p className="text-sm text-muted-foreground">
                Create interactive flashcards automatically to strengthen your memory and recall
              </p>
            </div>
            
            <div className="bg-card border rounded-xl shadow-sm p-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-primary"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21a48.309 48.309 0 01-8.135-.687c-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Track Progress</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your learning journey with detailed insights and performance analytics
              </p>
            </div>
          </div>
        </motion.div>
      </main>
      
      <footer className="w-full p-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Quizora. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
