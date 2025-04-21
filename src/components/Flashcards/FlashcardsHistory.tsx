
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, BookPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Flashcard } from "./FlashcardsGenerator";

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
  const navigate = useNavigate();

  useEffect(() => {
    // Load flashcards history
    const savedFlashcards = localStorage.getItem("flashcardsHistory");
    if (savedFlashcards) {
      try {
        const parsedSets = JSON.parse(savedFlashcards);
        setFlashcardSets(parsedSets);
      } catch (error) {
        console.error("Error loading flashcard history:", error);
      }
    }
  }, []);

  const calculateProgress = (cards: Flashcard[]) => {
    if (!cards || !cards.length) return 0;
    const known = cards.filter(card => card.status === 'known').length;
    return (known / cards.length) * 100;
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString();
  };

  const handleRetakeFlashcards = (setId: string) => {
    const selectedSet = flashcardSets.find(set => set.id === setId);
    if (selectedSet) {
      localStorage.setItem("flashcardsToReview", JSON.stringify(selectedSet));
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

  return (
    <>
      {flashcardSets.length === 0 ? (
        <div className="text-center py-12">
          <BookPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
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
              <Card className="overflow-hidden border border-border/40 bg-card/60 backdrop-blur-sm hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{set.title}</h3>
                      <div className="text-sm text-muted-foreground flex flex-wrap gap-2 items-center">
                        <span>{formatDate(set.created_at)}</span>
                        <span>•</span>
                        <span>{set.cards.length} cards</span>
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{Math.round(calculateProgress(set.cards))}%</span>
                        </div>
                        <Progress value={calculateProgress(set.cards)} className="h-1.5" />
                      </div>
                    </div>
                    <Button
                      onClick={() => handleRetakeFlashcards(set.id)}
                      className="bg-primary/90 hover:bg-primary text-primary-foreground shadow-sm"
                      size="sm"
                    >
                      Review
                    </Button>
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
