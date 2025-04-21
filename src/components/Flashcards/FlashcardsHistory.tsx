
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, BookPlus, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Flashcard } from "./FlashcardsGenerator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FlashcardsSetHistory {
  id: string;
  title: string;
  course?: string;
  subject: string;
  topic?: string;
  cards: Flashcard[];
  created_at: string | Date;
}

export function FlashcardsHistory() {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardsSetHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Load flashcards history
    loadFlashcardSets();
  }, []);

  const loadFlashcardSets = async () => {
    setIsLoading(true);
    
    try {
      // First try to load from Supabase if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from("flashcard_sets")
          .select("*")
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setFlashcardSets(data);
          setIsLoading(false);
          return;
        }
      }
      
      // Fallback to localStorage if not authenticated or no data in Supabase
      const savedFlashcards = localStorage.getItem("flashcardsHistory");
      if (savedFlashcards) {
        try {
          const parsedSets = JSON.parse(savedFlashcards);
          setFlashcardSets(parsedSets);
        } catch (error) {
          console.error("Error loading flashcard history:", error);
        }
      }
    } catch (error) {
      console.error("Error loading flashcard sets:", error);
      toast({
        title: "Failed to load flashcard sets",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = (cards: Flashcard[]) => {
    if (!cards || !cards.length) return 0;
    const known = cards.filter(card => card.status === 'known').length;
    return (known / cards.length) * 100;
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const handleReviewFlashcards = (setId: string) => {
    const selectedSet = flashcardSets.find(set => set.id === setId);
    if (selectedSet) {
      // Store the flashcard set to review in localStorage
      localStorage.setItem("flashcardsToReview", JSON.stringify({
        id: selectedSet.id,
        title: selectedSet.title,
        cards: selectedSet.cards
      }));
      
      // Navigate to the flashcards page - this will trigger the review mode
      navigate("/flashcards");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <motion.div
          animate={{ 
            rotate: [0, 360],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          className="w-12 h-12 rounded-full border-4 border-t-primary border-r-primary/30 border-b-primary/60 border-l-primary/10"
        />
        <p className="text-muted-foreground">Loading flashcards...</p>
      </div>
    );
  }

  return (
    <>
      {flashcardSets.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-12"
        >
          <BookPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">No flashcards yet</h2>
          <p className="text-muted-foreground mb-6">
            Create flashcards to study and track your progress
          </p>
          <Button 
            onClick={() => navigate('/flashcards')}
            className="animate-pulse"
          >
            Create Flashcards
          </Button>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {flashcardSets.map((set) => (
            <motion.div 
              key={set.id} 
              variants={itemVariants}
              whileHover={{ 
                y: -4, 
                transition: { duration: 0.2 }
              }}
            >
              <Card className="overflow-hidden border border-primary/10 shadow-md hover:shadow-lg transition-all duration-200 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-5">
                  <div className="flex flex-col space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-foreground/90">{set.title}</h3>
                      <div className="text-sm text-muted-foreground flex flex-wrap gap-2 items-center">
                        <span>{formatDate(set.created_at)}</span>
                        <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground"></span>
                        <span>{set.cards.length} cards</span>
                        {set.course && (
                          <>
                            <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground"></span>
                            <span>{set.course}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span className="font-medium">{Math.round(calculateProgress(set.cards))}%</span>
                      </div>
                      <Progress value={calculateProgress(set.cards)} className="h-2" />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">
                        {set.cards.filter(c => c.status === 'known').length} of {set.cards.length} cards mastered
                      </p>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleReviewFlashcards(set.id)}
                        className="gap-1 px-4"
                      >
                        Review <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </>
  );
}
