
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const motivationalQuotes = [
  "Knowledge is power.",
  "Learn today, lead tomorrow.",
  "Every quiz makes you smarter.",
  "Turn study time into success.",
  "Small steps, big progress.",
  "Learning never exhausts the mind.",
  "Education is the key to unlock the golden door of freedom."
];

const LandingPage = () => {
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Select a random quote
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setQuote(randomQuote);

    // Simulate loading for a better experience
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatePresence>
        {loading ? (
          <motion.div
            key="loading"
            className="flex-1 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="relative">
              <svg 
                className="w-16 h-16 animate-spin text-primary" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                  fill="none"
                ></circle>
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-primary">Q</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            className="flex-1 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <div className="w-full max-w-3xl mx-auto">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                    Quizora AI
                  </h1>
                </motion.div>
                
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-lg md:text-xl text-muted-foreground mb-6 italic"
                >
                  "{quote}"
                </motion.p>
                
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="mb-10 text-muted-foreground max-w-lg mx-auto"
                >
                  Powerful AI-driven platform that transforms learning with personalized quizzes and 
                  flashcards to help you master any subject efficiently.
                </motion.p>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <Button 
                    onClick={() => navigate('/quiz')}
                    size="lg" 
                    className="px-8 py-6 text-lg"
                  >
                    Start Learning
                  </Button>
                  
                  <Button 
                    onClick={() => navigate('/flashcards')}
                    variant="outline" 
                    size="lg" 
                    className="px-8 py-6 text-lg"
                  >
                    Create Flashcards
                  </Button>
                </motion.div>
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
