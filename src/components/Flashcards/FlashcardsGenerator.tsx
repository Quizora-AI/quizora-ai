
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Book, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  status: 'unread' | 'learning' | 'known';
}

interface FlashcardsSet {
  id: string;
  title: string;
  course?: string;
  subject: string;
  topic?: string;
  cards: Flashcard[];
  created_at: Date;
}

const formSchema = z.object({
  course: z.string().min(1, {
    message: "Course is required",
  }),
  subject: z.string().min(1, {
    message: "Subject is required",
  }),
  topic: z.string().optional(),
  count: z.string().min(1, {
    message: "Number of flashcards is required",
  }),
});

export function FlashcardsGenerator({ onFlashcardsGenerated }: { onFlashcardsGenerated: (flashcards: Flashcard[], setMeta?: { title?: string; id?: string }) => void }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      course: "",
      subject: "",
      topic: "",
      count: "10",
    },
  });

  // Check premium status from local storage
  useEffect(() => {
    const userSettings = localStorage.getItem("userSettings");
    if (userSettings) {
      try {
        const settings = JSON.parse(userSettings);
        setIsPremium(settings.isPremium === true);
      } catch (error) {
        console.error("Error parsing user settings:", error);
      }
    }
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setErrorDetails(null);
    const count = parseInt(values.count);
    if (!isPremium && count > 10) {
      toast({
        title: "Free User Limit",
        description: "Free users can only generate up to 10 flashcards. Please upgrade to premium for more.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      console.log("Generating flashcards with values:", values);
      
      // Call the process-document edge function for flashcards
      const response = await fetch("https://ltteeavnkygcgbwlblof.functions.supabase.co/process-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0dGVlYXZua3lnY2did2xibG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NDk0MTMsImV4cCI6MjA2MDEyNTQxM30.U2jta0EqlzywN7pMDJGH2EyChhNgEpPryjS8mR_FqDg`
        },
        body: JSON.stringify({
          type: "flashcards",
          course: values.course,
          subject: values.subject,
          topic: values.topic || "",
          questionCount: count
        })
      });

      const responseData = await response.json();
      console.log("Response from process-document:", responseData);
      
      if (!response.ok) {
        const errorMessage = responseData.error || `Error ${response.status}: Unknown error`;
        console.error("API error:", errorMessage);
        throw new Error(errorMessage);
      }

      if (responseData.error) {
        console.error("Response contains error:", responseData.error);
        throw new Error(responseData.error);
      }

      if (!responseData.questions || !Array.isArray(responseData.questions)) {
        console.error("Invalid response format:", responseData);
        throw new Error("Invalid response format: missing questions array");
      }

      // Build flashcards from response
      const flashcards: Flashcard[] = responseData.questions.map((q: any, idx: number) => ({
        id: `card-${idx}-${Date.now()}`,
        front: q.question,
        back: q.correctAnswer,
        status: "unread"
      }));

      if (flashcards.length === 0) {
        throw new Error("No flashcards were generated. Please try again.");
      }

      // Save to Supabase if user logged in
      let setId: string | null = null;
      let flashcardsSet: FlashcardsSet = {
        id: crypto.randomUUID(),
        title: `${values.subject} - ${values.topic || 'General'}`,
        course: values.course,
        subject: values.subject,
        topic: values.topic,
        cards: flashcards,
        created_at: new Date(),
      };

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          // Convert cards to a structure that's compatible with Supabase's Json type
          const cardsForDb = flashcards.map(card => ({
            id: card.id,
            front: card.front,
            back: card.back,
            status: card.status
          }));
          
          const { error } = await supabase
            .from("flashcard_sets")
            .insert({
              id: flashcardsSet.id,
              title: flashcardsSet.title,
              course: flashcardsSet.course,
              subject: flashcardsSet.subject,
              topic: flashcardsSet.topic,
              cards: cardsForDb as unknown as Json,
              user_id: user.id,
              created_at: new Date().toISOString()
            });
            
          if (error) {
            console.error("Supabase insert error:", error);
          } else {
            setId = flashcardsSet.id;
          }
        } catch (error: any) {
          console.error("Failed to save flashcards to database:", error);
        }
      }

      // Save in local storage
      try {
        const existingHistory = localStorage.getItem("flashcardsHistory");
        const history = existingHistory ? JSON.parse(existingHistory) : [];
        history.unshift(flashcardsSet);
        localStorage.setItem("flashcardsHistory", JSON.stringify(history));
      } catch (storageError) {
        console.error("Failed to save to local storage:", storageError);
      }

      // Pass metadata up so it can be saved in flow state for further updates
      onFlashcardsGenerated(flashcards, { title: flashcardsSet.title, id: setId || flashcardsSet.id });

      toast({
        title: "Flashcards Generated",
        description: `${flashcards.length} flashcards were successfully created.`,
      });
    } catch (error: any) {
      console.error("Error generating flashcards:", error);
      setErrorDetails(error.message);
      toast({
        title: "Error Generating Flashcards",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="bg-card/50 backdrop-blur-sm border border-primary/10 shadow-lg">
        <CardHeader>
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="flex items-center gap-3"
          >
            <div className="bg-primary/10 p-3 rounded-full">
              <Book className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Generate Flashcards</CardTitle>
              <CardDescription>
                Create custom flashcards for your courses using AI
              </CardDescription>
            </div>
          </motion.div>
        </CardHeader>
        <CardContent>
          {errorDetails && (
            <div className="mb-6 p-4 border border-destructive/50 bg-destructive/10 rounded-md">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div>
                  <h4 className="font-semibold text-destructive">Error Details</h4>
                  <p className="text-sm text-muted-foreground">{errorDetails}</p>
                </div>
              </div>
            </div>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="course"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Computer Science" {...field} />
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
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Data Structures" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Binary Trees" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Flashcards {!isPremium && "(Free users: max 10)"}</FormLabel>
                    <FormControl>
                      <RadioGroup 
                        onValueChange={field.onChange} 
                        defaultValue={field.value} 
                        className="flex flex-wrap gap-4"
                      >
                        {[5, 10, 15, 20, 25, 30].map((count) => (
                          <FormItem key={count} className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem 
                                value={count.toString()} 
                                disabled={!isPremium && count > 10} 
                              />
                            </FormControl>
                            <FormLabel className={!isPremium && count > 10 ? "text-muted-foreground" : ""}>
                              {count} {!isPremium && count > 10 && "⭐"}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Generating Flashcards...
                  </div>
                ) : (
                  "Generate Flashcards"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
