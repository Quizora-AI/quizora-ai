
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Book, ArrowRight, Sparkles } from 'lucide-react';

const quotes = [
  "Knowledge is power.",
  "The only limit to our realization of tomorrow is our doubts of today.",
  "Learning is a treasure that will follow its owner everywhere.",
  "Education is not the filling of a pail, but the lighting of a fire.",
  "The beautiful thing about learning is that no one can take it away from you."
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
    }, 2200);
    
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
          <div className="relative">
            <motion.div
              animate={{ 
                rotate: [0, 360],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              className="w-16 h-16 rounded-full border-4 border-t-primary border-r-primary/30 border-b-primary/60 border-l-primary/10"
            />
            <BrainCircuit className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary" />
          </div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-6 text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent"
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
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container px-4 py-12 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center justify-center text-center pt-12"
        >
          <div className="flex items-center mb-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ 
                duration: 0.5,
                type: "spring",
                stiffness: 200
              }}
              className="bg-primary/10 p-4 rounded-full"
            >
              <BrainCircuit className="h-10 w-10 text-primary" />
            </motion.div>
          </div>
          
          <motion.h1 
            className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Quizora AI
          </motion.h1>
          
          <motion.p 
            className="text-muted-foreground max-w-md mx-auto mb-2 italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            "{quote}"
          </motion.p>
          
          <motion.p 
            className="text-lg text-foreground/80 max-w-xl mx-auto mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Your AI-powered learning companion that transforms the way you study, quiz, and remember information.
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row gap-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <Button 
              size="lg" 
              onClick={() => navigate('/quiz')}
              className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
            >
              <Sparkles className="h-4 w-4" />
              Start Learning
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => navigate('/flashcards')}
            >
              <Book className="h-4 w-4 mr-2" />
              Create Flashcards
            </Button>
          </motion.div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <FeatureCard 
            title="AI-Generated Quizzes" 
            description="Custom quizzes tailored to your needs, created instantly by AI."
            delay={1.0}
            icon="quiz"
          />
          <FeatureCard 
            title="Smart Flashcards" 
            description="Create and study flashcards with spaced repetition learning."
            delay={1.2}
            icon="flashcards"
          />
          <FeatureCard 
            title="Detailed Analytics" 
            description="Track your progress and identify areas for improvement."
            delay={1.4}
            icon="analytics"
          />
        </div>
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
      className="bg-card/50 backdrop-blur-sm border border-primary/10 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]"
    >
      <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
        {icons[icon]}
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </motion.div>
  );
}
