
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Brain, Sparkles, Award, BookOpen, LightbulbIcon, CheckCircle2 } from "lucide-react";

const motivationalQuotes = [
  "Knowledge is power.",
  "Learn today, lead tomorrow.",
  "Every quiz makes you smarter.",
  "Turn study time into success.",
  "Small steps, big progress.",
  "Learning never exhausts the mind.",
  "Education is the key to unlock the golden door of freedom."
];

const features = [
  { 
    title: "Smart Quizzes", 
    description: "AI-generated quizzes tailored to your learning needs",
    icon: <Brain className="h-6 w-6 text-primary" />
  },
  { 
    title: "Flashcards", 
    description: "Create and review flashcards to reinforce your knowledge",
    icon: <BookOpen className="h-6 w-6 text-primary" />
  },
  { 
    title: "Progress Tracking", 
    description: "Monitor your progress and identify areas for improvement",
    icon: <Award className="h-6 w-6 text-primary" />
  }
];

const LandingPage = () => {
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState("");
  const [currentBenefitIndex, setCurrentBenefitIndex] = useState(0);
  const navigate = useNavigate();
  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: false, amount: 0.3 });
  
  const benefits = ["faster learning", "better retention", "higher scores", "deeper understanding"];

  useEffect(() => {
    // Select a random quote
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setQuote(randomQuote);

    // Simulate loading for a better experience
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2200);

    // Cycle through benefits
    const benefitInterval = setInterval(() => {
      setCurrentBenefitIndex(prev => (prev + 1) % benefits.length);
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearInterval(benefitInterval);
    };
  }, []);

  const variants = {
    initial: { scale: 0.96, y: 20, opacity: 0 },
    animate: { scale: 1, y: 0, opacity: 1 },
    exit: { scale: 0.96, y: 20, opacity: 0 },
  };

  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  const benefitVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.3 } }
  };

  const spinnerColors = [
    "from-blue-500 to-indigo-500",
    "from-indigo-500 to-purple-500",
    "from-purple-500 to-pink-500"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background/95 via-background to-background/90">
      <AnimatePresence mode="wait">
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
              {/* Animated spinner rings */}
              {spinnerColors.map((color, i) => (
                <div 
                  key={i} 
                  className={`absolute inset-0 rounded-full bg-gradient-to-r ${color}`}
                  style={{
                    animation: `spin ${3 + i * 0.5}s linear infinite`,
                    height: `${100 - i * 10}%`,
                    width: `${100 - i * 10}%`,
                    top: `${i * 5}%`,
                    left: `${i * 5}%`,
                    opacity: 0.7,
                    filter: `blur(${i * 2 + 2}px)`
                  }}
                />
              ))}
              
              <div className="relative w-20 h-20 flex items-center justify-center">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                  className="w-16 h-16 rounded-full border-t-2 border-b-2 border-primary"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-semibold text-primary bg-background/80 p-1 rounded-full">Q</span>
                </div>
              </div>
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              className="mt-6 text-muted-foreground text-sm"
            >
              Preparing your intelligent learning experience...
            </motion.p>
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
            <header className="relative overflow-hidden pt-16 pb-24 px-6 sm:py-32 text-center">
              {/* Background animated shapes */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full bg-gradient-to-r from-primary/10 to-indigo-500/10"
                    style={{
                      height: `${100 + Math.random() * 200}px`,
                      width: `${100 + Math.random() * 200}px`,
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      filter: `blur(${30 + Math.random() * 20}px)`,
                      opacity: 0.4
                    }}
                    animate={{
                      x: [0, Math.random() * 100 - 50],
                      y: [0, Math.random() * 100 - 50],
                    }}
                    transition={{
                      duration: 20 + Math.random() * 10,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                ))}
              </div>
              
              <div className="relative max-w-3xl mx-auto">
                <motion.div
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="mb-4"
                >
                  <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    <Sparkles className="h-4 w-4" />
                    <span>Intelligent Learning Platform</span>
                  </div>
                  
                  <h1 className="text-5xl md:text-7xl font-bold mb-4">
                    <span className="bg-gradient-to-r from-blue-500 via-primary to-indigo-500 bg-clip-text text-transparent inline-block">
                      Quizora AI
                    </span>
                  </h1>
                </motion.div>
                
                <motion.div 
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="relative h-8 mb-6"
                >
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentBenefitIndex}
                      variants={benefitVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute inset-0 text-xl md:text-2xl text-muted-foreground font-medium"
                    >
                      Achieve <span className="text-primary font-semibold">{benefits[currentBenefitIndex]}</span>
                    </motion.p>
                  </AnimatePresence>
                </motion.div>
                
                <motion.p
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="text-lg md:text-xl text-muted-foreground italic mb-6"
                >
                  "{quote}"
                </motion.p>
                
                <motion.p
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="mb-10 text-muted-foreground max-w-lg mx-auto text-base md:text-lg"
                >
                  Powerful AI-driven platform that transforms learning with personalized quizzes and 
                  flashcards to help you master any subject efficiently.
                </motion.p>
                
                <motion.div
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  transition={{ duration: 0.6, delay: 0.9 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <Button 
                    onClick={() => navigate('/quiz')}
                    size="lg" 
                    className="px-8 py-6 text-lg gap-2 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-primary/20"
                  >
                    Start Learning <ArrowRight className="h-5 w-5" />
                  </Button>
                  
                  <Button 
                    onClick={() => navigate('/flashcards')}
                    variant="outline" 
                    size="lg" 
                    className="px-8 py-6 text-lg border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300"
                  >
                    Create Flashcards
                  </Button>
                </motion.div>
              </div>
            </header>
            
            {/* Features section */}
            <motion.section 
              ref={featuresRef} 
              className="py-20 px-6 bg-muted/30"
            >
              <div className="max-w-5xl mx-auto">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5 }}
                  className="text-center mb-12"
                >
                  <h2 className="text-3xl font-bold mb-4">Why Choose Quizora AI</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Our intelligent platform adapts to your learning style to help you achieve better results.
                  </p>
                </motion.div>
                
                <div className="grid md:grid-cols-3 gap-8">
                  {features.map((feature, i) => (
                    <motion.div
                      key={feature.title}
                      custom={i}
                      variants={featureVariants}
                      initial="hidden"
                      animate={featuresInView ? "visible" : "hidden"}
                      className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="bg-primary/10 rounded-full p-3 w-fit mb-4">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </motion.div>
                  ))}
                </div>
                
                {/* Benefits list */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mt-16 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-8 border border-primary/10"
                >
                  <h3 className="text-2xl font-semibold mb-6 text-center">Benefits of Using Quizora AI</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      "Personalized learning experience",
                      "Progress tracking and analytics",
                      "Spaced repetition for better retention",
                      "AI-powered content generation",
                      "Study efficiently with flashcards",
                      "Learn anywhere, anytime"
                    ].map((benefit, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={featuresInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>{benefit}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.section>
            
            {/* CTA section */}
            <motion.section 
              className="py-16 px-6 bg-gradient-to-b from-background to-background/90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <LightbulbIcon className="h-4 w-4" />
                  <span>Ready to elevate your learning?</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Transform how you learn with <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">Quizora AI</span>
                </h2>
                
                <p className="text-muted-foreground mb-8 text-lg">
                  Join thousands of students who are already learning smarter, not harder.
                </p>
                
                <Button 
                  onClick={() => navigate('/quiz')}
                  size="lg" 
                  className="px-8 py-6 text-lg gap-2 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-primary/20"
                >
                  Get Started Now <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
