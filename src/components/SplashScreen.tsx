
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const motivationalQuotes = [
  "Transform your knowledge into mastery",
  "Every quiz brings you closer to excellence",
  "Learn, adapt, succeed",
  "Knowledge is power, testing makes it permanent",
  "Challenge yourself to grow"
];

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [currentQuote, setCurrentQuote] = useState(0);
  
  useEffect(() => {
    // Rotate quotes every 2.5 seconds
    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % motivationalQuotes.length);
    }, 2500);
    
    // Complete splash screen after 7.5 seconds (3 quotes)
    const timer = setTimeout(() => {
      onComplete();
    }, 7500);

    return () => {
      clearInterval(quoteInterval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5"
    >
      <div className="relative w-32 h-32 mb-8">
        {/* App Logo */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <img
            src="/logo.png"
            alt="Quizora Logo"
            className="w-24 h-24 object-contain"
          />
        </motion.div>
        
        {/* Outer spinning ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0"
        >
          <Loader2 className="w-full h-full text-primary animate-none" />
        </motion.div>
      </div>

      {/* Animated quote section */}
      <div className="h-20 flex items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentQuote}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-xl text-center font-medium text-foreground/80"
          >
            {motivationalQuotes[currentQuote]}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SplashScreen;
