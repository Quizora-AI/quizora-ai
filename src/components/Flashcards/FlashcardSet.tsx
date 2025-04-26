
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Flashcard } from '@/types';

interface FlashcardSetProps {
  flashcards: Flashcard[];
}

export function FlashcardSet({ flashcards }: FlashcardSetProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  if (!flashcards.length) {
    return <div className="text-center text-muted-foreground">No flashcards available</div>;
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="flashcard-container">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="sm" onClick={handlePrevious} disabled={currentIndex === 0}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Previous
        </Button>
        <div className="text-sm font-medium">
          Card {currentIndex + 1} of {flashcards.length}
        </div>
        <Button variant="outline" size="sm" onClick={handleNext} disabled={currentIndex === flashcards.length - 1}>
          Next <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="cursor-pointer"
        onClick={toggleAnswer}
      >
        <Card className="h-[250px] flex items-center justify-center shadow-md border-primary/10 hover:border-primary/30 transition-colors">
          <CardContent className="p-6 text-center flex flex-col justify-center items-center h-full">
            <div className="text-lg font-medium max-w-md">
              {showAnswer ? (
                <div className="text-primary">{currentCard.answer}</div>
              ) : (
                <div>{currentCard.question}</div>
              )}
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              {showAnswer ? "Click to show question" : "Click to show answer"}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default FlashcardSet;
