
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm, FormProvider } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BookOpen, BrainCircuit, Clock, Gauge, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Question } from "@/components/FileUpload";
import { supabase } from "@/integrations/supabase/client";

interface QuizSettingsFormData {
  course: string;
  subject: string;
  topic: string;
  difficulty: string;
  numQuestions: number;
  timePerQuestion: number;
}

const difficulties = [
  { value: "easy", label: "Easy", description: "Basic concepts and straightforward questions" },
  { value: "medium", label: "Medium", description: "More complex applications of concepts" },
  { value: "hard", label: "Hard", description: "Advanced understanding and critical thinking" }
];

export function QuizGenerator({ onQuizGenerated }: { onQuizGenerated: (questions: Question[]) => void }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const form = useForm<QuizSettingsFormData>({
    defaultValues: {
      course: "",
      subject: "",
      topic: "",
      difficulty: "medium",
      numQuestions: 5,
      timePerQuestion: 30
    }
  });

  const generateQuiz = async (data: QuizSettingsFormData) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setError(null);
    
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
      // Create a prompt based on the form data
      const prompt = `
Create a medical quiz with ${data.numQuestions} multiple-choice questions about ${data.topic} in ${data.subject} 
for ${data.course} students. The difficulty level should be ${data.difficulty}. 
Each question should have 4 options (A, B, C, D) with one correct answer.
For each question, provide a detailed explanation of why the correct answer is right and why the others are wrong.
Format the response as multiple-choice questions with lettered options.
      `;

      // Call the edge function to generate quiz with AI
      const { data: responseData, error: functionError } = await supabase.functions.invoke('process-document', {
        body: {
          promptText: prompt,
          difficulty: data.difficulty,
          numQuestions: data.numQuestions,
          subject: data.subject,
          topic: data.topic
        }
      });
      
      if (functionError) {
        throw new Error(`Error calling AI: ${functionError.message}`);
      }
      
      if (!responseData?.questions || responseData.questions.length === 0) {
        throw new Error('No questions were generated. Please try again with different parameters.');
      }
      
      clearInterval(interval);
      setGenerationProgress(100);
      
      toast({
        title: "Quiz generated successfully!",
        description: `Created ${responseData.questions.length} ${data.difficulty} questions about ${data.topic}`,
      });
      
      // Apply the specified time per question to the questions
      const questionsWithTime = responseData.questions.map((q: Question) => ({
        ...q,
        timeLimit: data.timePerQuestion
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
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
            AI Quiz Generator
          </CardTitle>
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
                          placeholder="e.g., Medical School, Nursing, Biology" 
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
                          placeholder="e.g., Anatomy, Cardiology, Pharmacology" 
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
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        Specific Topic
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Heart Valves, Antibiotic Mechanisms, Pulmonary Function" 
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
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 mb-2">
                        <Gauge className="h-4 w-4 text-primary" />
                        Difficulty Level
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4"
                        >
                          {difficulties.map(difficulty => (
                            <div key={difficulty.value} className="flex items-center space-x-2">
                              <RadioGroupItem 
                                value={difficulty.value} 
                                id={difficulty.value}
                                className={`border-2 ${difficulty.value === field.value ? 'border-primary' : 'border-primary/20'}`}
                              />
                              <Label 
                                htmlFor={difficulty.value}
                                className={`font-medium cursor-pointer ${difficulty.value === field.value ? 'text-primary' : 'text-muted-foreground'}`}
                              >
                                {difficulty.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <div className="text-xs text-muted-foreground mt-1">
                        {difficulties.find(d => d.value === field.value)?.description}
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
                      <FormLabel className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Number of Questions
                      </FormLabel>
                      <div className="flex items-center gap-4">
                        <FormControl>
                          <Slider
                            min={3}
                            max={20}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="py-4"
                          />
                        </FormControl>
                        <span className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full font-bold text-primary">
                          {field.value}
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="timePerQuestion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        Time per Question (seconds)
                      </FormLabel>
                      <div className="flex items-center gap-4">
                        <FormControl>
                          <Slider
                            min={10}
                            max={120}
                            step={5}
                            defaultValue={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="py-4"
                          />
                        </FormControl>
                        <span className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full font-bold text-primary">
                          {field.value}
                        </span>
                      </div>
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
