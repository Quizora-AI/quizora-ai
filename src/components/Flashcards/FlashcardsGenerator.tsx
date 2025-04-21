
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Book, BookOpen, Progress } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

export function FlashcardsGenerator({ onFlashcardsGenerated }: { onFlashcardsGenerated: (flashcards: Flashcard[]) => void }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

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
  useState(() => {
    const userSettings = localStorage.getItem("userSettings");
    if (userSettings) {
      const settings = JSON.parse(userSettings);
      setIsPremium(settings.isPremium === true);
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    // Validate free user limitations
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
      
      // Call the process-document edge function - reuse the quiz generator function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-document`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          type: "flashcards",
          course: values.course,
          subject: values.subject,
          topic: values.topic || "",
          questionCount: count
        })
      });

      if (!response.ok) {
        throw new Error(`Error generating flashcards: ${response.status}`);
      }

      const data = await response.json();
      console.log("Flashcards response:", data);

      if (data.error) {
        throw new Error(data.error);
      }

      // Create flashcards from response
      const flashcards: Flashcard[] = data.questions.map((q: any, index: number) => ({
        id: `card-${index}`,
        front: q.question,
        back: q.correctAnswer,
        status: 'unread',
      }));

      // Save to history
      const flashcardsSet: FlashcardsSet = {
        id: crypto.randomUUID(),
        title: `${values.subject} - ${values.topic || 'General'}`,
        course: values.course,
        subject: values.subject,
        topic: values.topic,
        cards: flashcards,
        created_at: new Date(),
      };

      // Save to local storage history
      const existingHistory = localStorage.getItem("flashcardsHistory");
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      history.unshift(flashcardsSet);
      localStorage.setItem("flashcardsHistory", JSON.stringify(history));

      // Save to Supabase if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          await supabase.from('flashcard_sets').insert({
            id: flashcardsSet.id,
            title: flashcardsSet.title,
            course: flashcardsSet.course,
            subject: flashcardsSet.subject,
            topic: flashcardsSet.topic,
            cards: flashcardsSet.cards,
            user_id: user.id
          });
        } catch (error) {
          console.error("Failed to save flashcards to database:", error);
        }
      }

      onFlashcardsGenerated(flashcards);
      
      toast({
        title: "Flashcards Generated",
        description: `${flashcards.length} flashcards were successfully created.`,
      });
    } catch (error: any) {
      console.error("Error generating flashcards:", error);
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
