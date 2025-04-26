import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  BrainCircuit, 
  Book, 
  ArrowRight, 
  Sparkles, 
  ChevronRight,
  Lightbulb
} from 'lucide-react';
import { BannerAd } from "@/components/GoogleAds";
import { supabase } from '@/integrations/supabase/client';

const quotes = [
  "Knowledge is power.",
  "The only limit to our realization of tomorrow is our doubts of today.",
  "Learning is a treasure that will follow its owner everywhere.",
  "Education is not the filling of a pail, but the lighting of a fire.",
  "The beautiful thing about learning is that no one can take it away from you.",
  "Live as if you were to die tomorrow. Learn as if you were to live forever.",
  "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
  "An investment in knowledge pays the best interest.",
  "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice."
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [quote, setQuote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setCurrentQuoteIndex(randomIndex);
    setQuote(quotes[randomIndex]);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex(prevIndex => (prevIndex + 1) % quotes.length);
    }, 8000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(quoteInterval);
    };
  }, []);

  useEffect(() => {
    setQuote(quotes[currentQuoteIndex]);
  }, [currentQuoteIndex]);

  const handleActionClick = (path: string) => {
    if (session) {
      navigate(path);
    } else {
      navigate('/auth');
    }
  };

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
    <div className="container px-4 py-8 mx-auto">
      <div className="relative h-screen flex items-center justify-center px-4">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-[10%] left-[5%] w-64 h-64 rounded-full bg-primary/5"
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, -10, 0], 
              y: [0, 10, 0],
            }}
            transition={{ 
              duration: 15,
              repeat: Infinity,
              repeatType: "reverse" 
            }}
          />
          <motion.div 
            className="absolute bottom-[20%] right-[15%] w-80 h-80 rounded-full bg-purple-500/5"
            animate={{ 
              scale: [1, 1.1, 1],
              x: [0, 20, 0], 
              y: [0, -15, 0],
            }}
            transition={{ 
              duration: 18,
              repeat: Infinity,
              repeatType: "reverse" 
            }}
          />
          <motion.div 
            className="absolute top-[40%] right-[25%] w-40 h-40 rounded-full bg-indigo-500/5"
            animate={{ 
              scale: [1, 1.3, 1],
              x: [0, -15, 0], 
              y: [0, -20, 0],
            }}
            transition={{ 
              duration: 12,
              repeat: Infinity,
              repeatType: "reverse" 
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center justify-center text-center relative z-10 max-w-3xl"
        >
          <div className="flex items-center mb-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
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
            className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Quizora AI
          </motion.h1>
          
          <div className="h-12 my-4 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p 
                key={quote}
                className="text-muted-foreground max-w-md mx-auto italic text-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                "{quote}"
              </motion.p>
            </AnimatePresence>
          </div>
          
          <motion.p 
            className="text-xl text-foreground/80 max-w-xl mx-auto mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Your AI-powered learning companion
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row gap-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <Button 
              size="lg" 
              onClick={() => handleActionClick('/quiz')}
              className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 group"
            >
              <Sparkles className="h-4 w-4" />
              Start Learning
              <ChevronRight className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => handleActionClick('/flashcards')}
              className="group border border-primary/20 hover:border-primary/40"
            >
              <Book className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              Create Flashcards
            </Button>
          </motion.div>
        </motion.div>

        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ 
            y: [0, 10, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        >
          <ArrowRight className="h-6 w-6 rotate-90 text-muted-foreground" />
        </motion.div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 flex justify-center w-full bg-background/95 backdrop-blur-sm border-t border-border/30 py-2">
        <BannerAd 
          adUnitId="ca-app-pub-8270549953677995/2218567244"
          size="BANNER"
          className="max-w-md mx-auto"
        />
      </div>
      
      <div className="container px-4 py-20 mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent"
        >
          Supercharge Your Learning
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <FeatureCard 
            title="AI-Generated Quizzes" 
            description="Custom quizzes tailored to your needs, created instantly by AI"
            delay={0.2}
            icon="quiz"
          />
          <FeatureCard 
            title="Smart Flashcards" 
            description="Create and study flashcards with spaced repetition"
            delay={0.4}
            icon="flashcards"
          />
          <FeatureCard 
            title="Detailed Analytics" 
            description="Track your progress and identify areas for improvement"
            delay={0.6}
            icon="analytics"
          />
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="container mx-auto px-4 py-20"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/80 to-purple-600/80 p-8 md:p-12">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-600/10">
            <motion.div 
              className="absolute inset-0 opacity-20"
              animate={{
                background: [
                  "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                  "radial-gradient(circle at 80% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                  "radial-gradient(circle at 40% 70%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                  "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                ]
              }}
              transition={{ duration: 15, repeat: Infinity }}
            />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-lg">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-6 w-6 text-white" />
                  <h4 className="text-white font-medium">Get Started Now</h4>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Ready to transform your learning experience?
                </h3>
                <p className="text-white/80">
                  Join thousands of students using AI to learn faster and more effectively.
                </p>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Button 
                size="lg" 
                onClick={() => handleActionClick('/quiz')}
                className="bg-white text-primary hover:bg-white/90 group"
              >
                Start Now
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
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
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
      className="bg-card/50 backdrop-blur-sm border border-primary/10 rounded-lg p-6 shadow-lg transition-all duration-300"
    >
      <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
        {icons[icon]}
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </motion.div>
  );
}
