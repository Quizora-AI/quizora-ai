import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flashcard } from "./FlashcardsGenerator";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface FlashcardsViewerProps {
  flashcards: Flashcard[];
  title?: string;
  onBackToCreate: () => void;
  onSaveProgress: (updatedFlashcards: Flashcard[]) => void;
}

export function FlashcardsViewer({ 
  flashcards, 
  title = "Flashcards", 
  onBackToCreate,
  onSaveProgress
}: FlashcardsViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>(flashcards);
  const [completed, setCompleted] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const knownCount = cards.filter(c => c.status === 'known').length;
    setCompleted(knownCount / cards.length * 100);
  }, [cards]);

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const handleNext = () => {
    setFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    setFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleStatusChange = (status: 'unread' | 'learning' | 'known') => {
    const updatedCards = [...cards];
    updatedCards[currentIndex].status = status;
    setCards(updatedCards);
    
    onSaveProgress(updatedCards);

    if (currentIndex < cards.length - 1) {
      handleNext();
    } else {
      toast({
        title: "Progress Updated",
        description: `Card marked as ${status}.`,
      });
    }
  };

  if (!cards.length) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">No flashcards available</h2>
        <p className="text-muted-foreground mb-6">There are no flashcards to display</p>
        <Button onClick={onBackToCreate}>Create Flashcards</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-sm text-muted-foreground">
              Card {currentIndex + 1} of {cards.length}
            </p>
          </div>
          <Button variant="outline" onClick={onBackToCreate}>Exit</Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm">{Math.round(completed)}%</span>
          </div>
          <Progress value={completed} className="h-2" />
        </div>

        <div className="relative h-[40vh] min-h-[300px] w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentIndex}-${flipped ? 'back' : 'front'}`}
              initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: flipped ? 90 : -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Card 
                className={`h-full w-full flex items-center justify-center p-4 cursor-pointer ${
                  flipped ? "bg-muted/50" : "bg-card"
                }`}
                onClick={handleFlip}
              >
                <CardContent className="flex flex-col items-center justify-center w-full h-full p-6">
                  <div className="absolute top-2 right-2">
                    <Badge variant={flipped ? "outline" : "default"}>
                      {flipped ? "Answer" : "Question"}
                    </Badge>
                  </div>

                  <p className="text-center text-lg">
                    {flipped ? cards[currentIndex].back : cards[currentIndex].front}
                  </p>
                  
                  <div className="absolute bottom-2 w-full flex justify-center">
                    <motion.div
                      animate={{ y: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <p className="text-muted-foreground text-xs">Click to flip</p>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleStatusChange('unread')}
            className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
          >
            Need Review
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleStatusChange('learning')}
            className="border-blue-500/50 text-blue-500 hover:bg-blue-500/10"
          >
            Still Learning
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleStatusChange('known')}
            className="border-green-500/50 text-green-500 hover:bg-green-500/10"
          >
            Know it!
          </Button>
        </div>

        <div className="flex justify-between">
          <Button 
            onClick={handlePrev} 
            disabled={currentIndex === 0}
            variant="outline"
            size="sm"
          >
            <ArrowDown className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="flex items-center space-x-1">
            {cards.map((card, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setFlipped(false);
                  setCurrentIndex(idx);
                }}
                className={`h-2 w-2 rounded-full ${
                  idx === currentIndex
                    ? "bg-primary"
                    : card.status === 'known'
                    ? "bg-green-500"
                    : card.status === 'learning'
                    ? "bg-blue-500"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
          <Button 
            onClick={handleNext} 
            disabled={currentIndex === cards.length - 1}
            variant="outline"
            size="sm"
          >
            Next
            <ArrowUp className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
