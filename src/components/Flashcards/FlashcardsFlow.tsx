
import { useState, useEffect } from "react";
import { FlashcardsGenerator, Flashcard } from "./FlashcardsGenerator";
import { FlashcardsViewer } from "./FlashcardsViewer";
import { useSearchParams } from "react-router-dom";

interface FlashcardsFlowProps {
  onBackToCreate: () => void;
}

export function FlashcardsFlow({ onBackToCreate }: FlashcardsFlowProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [title, setTitle] = useState<string>("Flashcards");
  const [flowState, setFlowState] = useState<"generate" | "review">("generate");
  const [flashcardSetId, setFlashcardSetId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  
  // Check for review mode from URL parameters
  useEffect(() => {
    const mode = searchParams.get("mode");
    
    // Handle review mode from URL
    if (mode === "review") {
      const currentFlashcardSet = localStorage.getItem("currentFlashcardSet");
      if (currentFlashcardSet) {
        try {
          const parsedSet = JSON.parse(currentFlashcardSet);
          console.log("Loading existing flashcards for review:", parsedSet);
          
          if (parsedSet.cards && Array.isArray(parsedSet.cards)) {
            setFlashcards(parsedSet.cards);
            setTitle(parsedSet.title || "Flashcard Review");
            setFlashcardSetId(parsedSet.id || null);
            setFlowState("review");
          } else {
            console.error("Invalid flashcards format in localStorage:", parsedSet);
            setFlowState("generate");
          }
        } catch (error) {
          console.error("Error parsing flashcards from localStorage:", error);
          setFlowState("generate");
        }
      } else {
        console.log("No flashcards found for review, showing generator");
        setFlowState("generate");
      }
    } else {
      // Clear any existing review data if we're not in review mode
      localStorage.removeItem("currentFlashcardSet");
      setFlowState("generate");
    }
  }, [searchParams]);

  const handleFlashcardsGenerated = (newFlashcards: Flashcard[], setMeta?: { title?: string; id?: string }) => {
    setFlashcards(newFlashcards);
    if (setMeta?.title) setTitle(setMeta.title);
    if (setMeta?.id) setFlashcardSetId(setMeta.id);
    setFlowState("review");
  };

  const handleSaveProgress = (updatedFlashcards: Flashcard[]) => {
    // Update local state
    setFlashcards(updatedFlashcards);
    
    // If this is a review of existing flashcards, update them in history
    if (flashcardSetId) {
      try {
        const history = localStorage.getItem("flashcardsHistory");
        if (history) {
          const parsedHistory = JSON.parse(history);
          const updatedHistory = parsedHistory.map((set: any) => 
            set.id === flashcardSetId ? { ...set, cards: updatedFlashcards } : set
          );
          localStorage.setItem("flashcardsHistory", JSON.stringify(updatedHistory));
          console.log("Updated flashcards history with progress:", flashcardSetId);
        }
      } catch (error) {
        console.error("Error updating flashcards history:", error);
      }
    }
  };

  return (
    <>
      {flowState === "generate" ? (
        <FlashcardsGenerator onFlashcardsGenerated={handleFlashcardsGenerated} />
      ) : (
        <FlashcardsViewer
          flashcards={flashcards}
          title={title}
          onBackToCreate={onBackToCreate}
          onSaveProgress={handleSaveProgress}
        />
      )}
    </>
  );
}
