
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Flashcard } from "./FlashcardsGenerator";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { getFlashcardsHistory } from "@/utils/storageUtils";

interface FlashcardsSetHistory {
  id: string;
  title: string;
  course?: string;
  subject: string;
  topic?: string;
  cards: Flashcard[];
  created_at: string | Date;
  updated_at?: string | Date;
}

export function FlashcardsHistory() {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardsSetHistory[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Load flashcards history using the utility function
    loadFlashcardsHistory();
    
    // Add event listener to refresh data when localStorage changes
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'flashcardsHistory') {
      loadFlashcardsHistory();
    }
  };
  
  const loadFlashcardsHistory = () => {
    const history = getFlashcardsHistory();
    
    if (history && history.length > 0) {
      // Ensure we don't have duplicate entries by ID
      const uniqueSets = Array.from(
        new Map(history.map((set: FlashcardsSetHistory) => [set.id, set])).values()
      ) as FlashcardsSetHistory[];
      
      console.log("Loaded flashcard sets:", uniqueSets);
      setFlashcardSets(uniqueSets);
    } else {
      setFlashcardSets([]);
    }
  };

  const calculateProgress = (cards: Flashcard[]) => {
    if (!cards || !cards.length) return 0;
    const known = cards.filter(card => card.status === 'known').length;
    return (known / cards.length) * 100;
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return format(date, 'MMM d, yyyy');
  };

  const handleReviewFlashcards = (setId: string) => {
    const selectedSet = flashcardSets.find(set => set.id === setId);
    if (selectedSet) {
      console.log("Selected flashcard set for review:", selectedSet);
      
      // Store the flashcard set to review in localStorage with proper format
      localStorage.setItem("currentFlashcardSet", JSON.stringify({
        id: selectedSet.id,
        title: selectedSet.title,
        cards: selectedSet.cards,
        subject: selectedSet.subject,
        course: selectedSet.course,
        topic: selectedSet.topic,
        mode: "review" // Add a mode flag to indicate we're reviewing existing cards
      }));
      
      // Navigate to the flashcards review page with a specific route parameter
      navigate("/flashcards?mode=review");
      
      toast({
        title: "Flashcards Ready",
        description: `Review your ${selectedSet.cards.length} ${selectedSet.title} flashcards`,
      });
    } else {
      console.error("Flashcard set not found with ID:", setId);
      toast({
        title: "Error",
        description: "Could not find the selected flashcards",
        variant: "destructive"
      });
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

  return (
    <>
      {flashcardSets.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">No flashcards yet</h2>
          <p className="text-muted-foreground mb-6">
            Create flashcards to study and track your progress
          </p>
          <Button onClick={() => navigate('/flashcards')}>Create Flashcards</Button>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {flashcardSets.map((set) => (
            <motion.div key={set.id} variants={itemVariants}>
              <Card className="overflow-hidden border border-primary/10 shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-card/80 to-card/90 backdrop-blur-sm hover:border-primary/30">
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
                        {set.updated_at && set.updated_at !== set.created_at && (
                          <>
                            <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground"></span>
                            <span className="text-xs">Updated: {formatDate(set.updated_at)}</span>
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
                        className="gap-1 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
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
