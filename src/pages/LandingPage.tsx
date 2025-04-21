
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Book, ArrowRight, Sparkles } from 'lucide-react';

const quotes = [
  "Knowledge is power.",
  "Learning is not attained by chance, it must be sought for with ardor.",
  "The beautiful thing about learning is that no one can take it away from you.",
  "Education is the passport to the future.",
  "The more that you read, the more things you will know."
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [quote, setQuote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Select a random quote
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
    
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-background to-background/80">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <motion.div
            animate={{ 
              rotate: [0, 360],
              borderColor: ["#3a86ff", "#ff006e", "#8338ec", "#3a86ff"]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
            className="w-20 h-20 rounded-full border-4 border-t-primary border-r-primary/30 border-b-primary/60 border-l-primary/10 flex items-center justify-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <BrainCircuit className="h-10 w-10 text-primary" />
            </motion.div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-6 text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent"
          >
            Quizora AI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-2 text-sm text-muted-foreground"
          >
            Loading your personalized experience...
          </motion.p>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 overflow-hidden">
      <div className="container px-4 py-16 mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center justify-center text-center pt-8 md:pt-16"
        >
          <motion.div
            initial={{ scale: 0.8, rotate: 0 }}
            animate={{ 
              scale: 1,
              rotate: [0, 5, -5, 0],
              transition: {
                rotate: {
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }
              }
            }}
            className="bg-primary/10 p-6 rounded-full mb-8"
          >
            <BrainCircuit className="h-12 w-12 text-primary" />
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-6xl font-bold tracking-tighter mb-4 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Quizora AI
          </motion.h1>
          
          <motion.p 
            className="text-muted-foreground max-w-md mx-auto mb-4 italic text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            "{quote}"
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row gap-4 my-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Button 
              size="lg" 
              onClick={() => navigate('/quiz')}
              className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              <Sparkles className="h-4 w-4 animate-pulse" />
              Start Learning
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => navigate('/flashcards')}
              className="transition-all duration-300 transform hover:scale-105"
            >
              <Book className="h-4 w-4 mr-2" />
              Create Flashcards
            </Button>
          </motion.div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-12">
          <FeatureCard 
            title="AI-Generated Quizzes" 
            description="Instant personalized quizzes with detailed AI explanations"
            delay={1.0}
            icon="quiz"
          />
          <FeatureCard 
            title="Smart Flashcards" 
            description="Master concepts faster with spaced repetition learning"
            delay={1.2}
            icon="flashcards"
          />
          <FeatureCard 
            title="Detailed Analytics" 
            description="Track progress with AI-powered insights"
            delay={1.4}
            icon="analytics"
          />
        </div>

        <motion.div
          className="absolute top-20 right-10 w-32 h-32 opacity-20 rounded-full bg-purple-500 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        
        <motion.div
          className="absolute bottom-20 left-10 w-48 h-48 opacity-20 rounded-full bg-blue-500 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.2, 0.15],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 2,
          }}
        />
      </div>
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  delay: number;
  icon: 'quiz' | 'flashcards' | 'analytics';
}

function FeatureCard({ title, description, delay, icon }: FeatureCardProps) {
  const icons = {
    quiz: <BrainCircuit className="h-6 w-6 text-primary" />,
    flashcards: <Book className="h-6 w-6 text-primary" />,
    analytics: <Sparkles className="h-6 w-6 text-primary" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8 }}
      whileHover={{ 
        y: -5,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }}
      className="bg-card/50 backdrop-blur-sm border border-primary/10 rounded-lg p-6 shadow-lg"
    >
      <motion.div 
        className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4"
        whileHover={{ 
          rotate: [0, 10, -10, 0],
          transition: { duration: 0.5 }
        }}
      >
        {icons[icon]}
      </motion.div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </motion.div>
  );
}
