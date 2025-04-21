
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm, FormProvider } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { BookOpen, BrainCircuit, Clock, AlertCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Question } from "@/components/FileUpload";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface QuizSettingsFormData {
  course: string;
  subject: string;
  topic: string;
  difficultyLevel: number;
  numQuestions: number;
  timePerQuestion: number;
}

export function QuizGenerator({ onQuizGenerated }: { onQuizGenerated: (questions: Question[]) => void }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<QuizSettingsFormData>({
    defaultValues: {
      course: "",
      subject: "",
      topic: "",
      difficultyLevel: 50,
      numQuestions: isPremium ? 10 : 5,
      timePerQuestion: 30
    }
  });

  useEffect(() => {
    // Check if user has premium subscription
    const userSettings = localStorage.getItem("userSettings");
    if (userSettings) {
      try {
        const settings = JSON.parse(userSettings);
        setIsPremium(settings.isPremium === true);
        
        // Update form defaults based on premium status
        form.setValue('numQuestions', settings.isPremium ? 10 : 5);
      } catch (error) {
        console.error("Error parsing user settings:", error);
      }
    }

    // Check if user has exceeded free quiz limit
    if (!isPremium) {
      const quizHistoryStr = localStorage.getItem("quizHistory");
      if (quizHistoryStr) {
        const quizHistory = JSON.parse(quizHistoryStr);
        if (quizHistory.length >= 2) {
          toast({
            title: "Free Quiz Limit Reached",
            description: "You've reached the limit of 2 free quizzes. Upgrade to premium for unlimited quizzes!",
            variant: "destructive"
          });
        }
      }
    }
  }, [toast, form, isPremium]);

  const getDifficultyLabel = (value: number) => {
    if (value <= 33) return "Easy";
    if (value <= 66) return "Medium";
    return "Hard";
  };

  const getDifficultyFromSlider = (value: number) => {
    if (value <= 33) return "easy";
    if (value <= 66) return "medium";
    return "hard";
  };

  const generateQuiz = async (data: QuizSettingsFormData) => {
    // Check if free user has reached quiz limit
    if (!isPremium) {
      const quizHistoryStr = localStorage.getItem("quizHistory");
      if (quizHistoryStr) {
        const quizHistory = JSON.parse(quizHistoryStr);
        if (quizHistory.length >= 2) {
          navigate('/settings?tab=premium');
          toast({
            title: "Free Quiz Limit Reached",
            description: "You've reached the limit of 2 free quizzes. Upgrade to premium for unlimited quizzes!",
            variant: "destructive"
          });
          return;
        }
      }
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setError(null);
    
    // Apply free plan restrictions
    const maxQuestions = isPremium ? data.numQuestions : Math.min(data.numQuestions, 10);
    const timePerQuestion = isPremium ? data.timePerQuestion : 30;
    
    // Simulate initial progress
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 8;
      });
    }, 600);

    try {
      const difficulty = getDifficultyFromSlider(data.difficultyLevel);
      
      // Create a prompt based on the form data
      const prompt = `
Create a ${data.course} quiz with ${maxQuestions} multiple-choice questions about ${data.topic} in ${data.subject} 
for ${data.course} students. The difficulty level should be ${difficulty}. 
Each question should have 4 options (A, B, C, D) with one correct answer.
For each question, provide a detailed explanation of why the correct answer is right and why the others are wrong.
Format the response as multiple-choice questions with lettered options.
      `;

      console.log("Generating quiz with prompt:", prompt);

      // Call the edge function to generate quiz with AI
      const { data: responseData, error: functionError } = await supabase.functions.invoke('process-document', {
        body: {
          promptText: prompt,
          difficulty: difficulty,
          numQuestions: maxQuestions,
          subject: data.subject,
          topic: data.topic
        }
      });
      
      console.log("Received response from edge function:", responseData);
      
      if (functionError) {
        console.error("Edge function error:", functionError);
        throw new Error(`Error calling AI: ${functionError.message}`);
      }
      
      if (!responseData?.questions || responseData.questions.length === 0) {
        console.error("No questions in response:", responseData);
        throw new Error('No questions were generated. Please try again with different parameters.');
      }
      
      clearInterval(interval);
      setGenerationProgress(100);
      
      toast({
        title: "Quiz generated successfully!",
        description: `Created ${responseData.questions.length} questions about ${data.topic}`,
      });
      
      // Apply the specified time per question to the questions
      const questionsWithTime = responseData.questions.map((q: Question) => ({
        ...q,
        timeLimit: timePerQuestion,
        id: q.id || `q-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      }));
      
      setTimeout(() => {
        onQuizGenerated(questionsWithTime);
        setIsGenerating(false);
      }, 800);
      
    } catch (err) {
      clearInterval(interval);
      console.error("Error generating quiz:", err);
      setIsGenerating(false);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      
      toast({
        title: "Failed to generate quiz",
        description: "There was an error creating your quiz. Please try again.",
        variant: "destructive"
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  const maxQuestionLimit = isPremium ? 50 : 10;
  
  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg border border-primary/10 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="flex items-center gap-3"
        >
          <div className="bg-primary/10 p-3 rounded-full">
            <BrainCircuit className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
              AI Quiz Generator
            </CardTitle>
            {!isPremium && (
              <p className="text-xs text-muted-foreground mt-1">
                Free plan: Limited to 2 quizzes, 10 questions max, 30 seconds per question
              </p>
            )}
          </div>
        </motion.div>
      </CardHeader>
      
      <CardContent>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(generateQuiz)}>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="course"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        Course or Program
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Medical School, Engineering, UPSC, Class 10" 
                          {...field} 
                          className="bg-background/50 border-primary/20 focus-visible:ring-primary/30"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        Subject
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Anatomy, Physics, History, Mathematics" 
                          {...field} 
                          className="bg-background/50 border-primary/20 focus-visible:ring-primary/30"
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        Specific Topic
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Heart Valves, Newton's Laws, World War II" 
                          {...field} 
                          className="bg-background/50 border-primary/20 focus-visible:ring-primary/30"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="difficultyLevel"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between mb-2">
                        <FormLabel className="flex items-center gap-2">
                          <div className="flex items-center">
                            Difficulty Level
                          </div>
                        </FormLabel>
                        <span className="px-2 py-1 bg-primary/10 rounded text-xs font-medium">
                          {getDifficultyLabel(field.value)}
                        </span>
                      </div>
                      <FormControl>
                        <Slider
                          min={0}
                          max={100}
                          step={1}
                          defaultValue={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="py-4"
                        />
                      </FormControl>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Easy</span>
                        <span>Medium</span>
                        <span>Hard</span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
              
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="numQuestions"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="flex items-center gap-2">
                          Number of Questions
                        </FormLabel>
                        <span className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full font-bold text-primary">
                          {field.value}
                        </span>
                      </div>
                      <FormControl>
                        <Slider
                          min={3}
                          max={maxQuestionLimit}
                          step={1}
                          defaultValue={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="py-4"
                          disabled={!isPremium && field.value > 10}
                        />
                      </FormControl>
                      {!isPremium && (
                        <p className="text-xs text-muted-foreground">
                          Free plan: Limited to 10 questions max. <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => navigate('/settings?tab=premium')}>Upgrade for up to 50</Button>
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="timePerQuestion"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          Time per Question (sec)
                        </FormLabel>
                        <span className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full font-bold text-primary">
                          {field.value}
                        </span>
                      </div>
                      <FormControl>
                        <Slider
                          min={10}
                          max={120}
                          step={5}
                          defaultValue={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="py-4"
                          disabled={!isPremium}
                        />
                      </FormControl>
                      {!isPremium && (
                        <p className="text-xs text-muted-foreground">
                          Free plan: Fixed at 30 seconds. <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => navigate('/settings?tab=premium')}>Upgrade to customize</Button>
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
              
              {error && (
                <motion.div 
                  variants={itemVariants}
                  className="bg-destructive/10 p-4 rounded-md border border-destructive/20"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-destructive">Error generating quiz</p>
                      <p className="text-sm text-muted-foreground">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <motion.div
                variants={itemVariants}
                className={`mt-6 ${isGenerating ? 'block' : 'hidden'}`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                      <span>Generating your personalized quiz</span>
                    </div>
                    <span className="font-mono">{Math.round(generationProgress)}%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${generationProgress}%` }}
                      transition={{ type: "spring", stiffness: 50, damping: 20 }}
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
            
            <CardFooter className="px-0 pt-6 pb-0 mt-6">
              <motion.div 
                variants={itemVariants}
                className="w-full"
              >
                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-700 text-white py-6"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Quiz...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Generate AI Quiz
                    </span>
                  )}
                </Button>
              </motion.div>
            </CardFooter>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
