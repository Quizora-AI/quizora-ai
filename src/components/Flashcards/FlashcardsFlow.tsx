
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flashcard, FlashcardsGenerator } from "./FlashcardsGenerator";
import { FlashcardsViewer } from "./FlashcardsViewer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { useLocation } from "react-router-dom";

export enum FlashcardsState {
  CREATE,
  REVIEW,
}

interface FlashcardsFlowProps {
  onBackToCreate?: () => void;
}

export function FlashcardsFlow({ onBackToCreate = () => {} }: FlashcardsFlowProps) {
  const [appState, setAppState] = useState<FlashcardsState>(FlashcardsState.CREATE);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [title, setTitle] = useState("Flashcards");
  const [setId, setSetId] = useState<string | null>(null); // track set ID for DB saves
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    // Check for flashcards to review
    const flashcardsToReview = localStorage.getItem("flashcardsToReview");
    
    if (flashcardsToReview) {
      try {
        const { cards, title: savedTitle, id } = JSON.parse(flashcardsToReview);
        if (cards && cards.length) {
          setFlashcards(cards);
          setSetId(id || null);
          if (savedTitle) setTitle(savedTitle);
          setAppState(FlashcardsState.REVIEW);
          localStorage.removeItem("flashcardsToReview");
        }
      } catch (error) {
        console.error("Error loading flashcards to review:", error);
        setError("Failed to load flashcards data");
        localStorage.removeItem("flashcardsToReview");
      }
    }
  }, []);

  const handleFlashcardsGenerated = (generatedFlashcards: Flashcard[], setMeta?: { title?: string, id?: string }) => {
    if (!generatedFlashcards || !generatedFlashcards.length) {
      setError("No flashcards were generated. Please try again.");
      toast({
        title: "Error",
        description: "No flashcards were generated. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    setFlashcards(generatedFlashcards);
    if (setMeta?.title) setTitle(setMeta.title);
    if (setMeta?.id) setSetId(setMeta.id);
    setAppState(FlashcardsState.REVIEW);
    setError(null);
    
    // Log successful generation
    console.log(`Generated ${generatedFlashcards.length} flashcards successfully`);
  };

  const handleBackToCreate = () => {
    setFlashcards([]);
    setSetId(null);
    setError(null);
    setAppState(FlashcardsState.CREATE);
    onBackToCreate();
  };

  const handleSaveProgress = async (updatedFlashcards: Flashcard[]) => {
    setFlashcards(updatedFlashcards);

    try {
      // Update in local storage
      const flashcardsHistory = localStorage.getItem("flashcardsHistory");
      if (flashcardsHistory) {
        try {
          const history = JSON.parse(flashcardsHistory);
          const index = history.findIndex((set: any) =>
            JSON.stringify(set.cards.map((c: any) => c.id)) ===
            JSON.stringify(updatedFlashcards.map(c => c.id))
          );
          if (index !== -1) {
            history[index].cards = updatedFlashcards;
            localStorage.setItem("flashcardsHistory", JSON.stringify(history));
          }
        } catch (error) {
          console.error("Error updating flashcards progress in local storage:", error);
        }
      }

      // Update in Supabase if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user && setId) {
        // Convert Flashcard[] to a format Supabase can handle
        const cardsForSupabase = updatedFlashcards.map(card => ({
          id: card.id,
          front: card.front,
          back: card.back,
          status: card.status
        }));
        
        const { error } = await supabase
          .from("flashcard_sets")
          .update({ cards: cardsForSupabase })
          .eq("id", setId)
          .eq("user_id", user.id);
          
        if (error) {
          console.error("Error updating flashcards in Supabase:", error);
          throw error;
        }
      }
      
      toast({
        title: "Progress Saved",
        description: "Your flashcard progress has been updated.",
      });
    } catch (error) {
      console.error("Error updating flashcards progress:", error);
      toast({
        title: "Save Failed",
        description: "There was a problem saving your progress.",
        variant: "destructive",
      });
    }
  };

  const pageVariants = {
    initial: { opacity: 0, x: 50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -50 },
  };

  const pageTransition = {
    type: "spring",
    stiffness: 300,
    damping: 30,
  };

  if (error) {
    return (
      <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-md text-center">
        <h2 className="text-lg font-semibold mb-2">Error</h2>
        <p className="mb-4">{error}</p>
        <button 
          className="px-4 py-2 bg-primary text-primary-foreground rounded"
          onClick={() => setError(null)}
        >
          Dismiss
        </button>
      </div>
    );
  }

  switch (appState) {
    case FlashcardsState.CREATE:
      return (
        <motion.div
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          key="flashcards-create"
        >
          <FlashcardsGenerator onFlashcardsGenerated={handleFlashcardsGenerated} />
        </motion.div>
      );
    case FlashcardsState.REVIEW:
      return (
        <motion.div
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          key="flashcards-review"
        >
          <FlashcardsViewer 
            flashcards={flashcards}
            title={title}
            onBackToCreate={handleBackToCreate}
            onSaveProgress={handleSaveProgress}
          />
        </motion.div>
      );
    default:
      return null;
  }
}
