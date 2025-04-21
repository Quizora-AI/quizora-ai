
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flashcard, FlashcardsGenerator } from "./FlashcardsGenerator";
import { FlashcardsViewer } from "./FlashcardsViewer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

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
  const { toast } = useToast();

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
        localStorage.removeItem("flashcardsToReview");
      }
    }
  }, []);

  const handleFlashcardsGenerated = (generatedFlashcards: Flashcard[], setMeta?: { title?: string, id?: string }) => {
    setFlashcards(generatedFlashcards);
    if (setMeta?.title) setTitle(setMeta.title);
    if (setMeta?.id) setSetId(setMeta.id);
    setAppState(FlashcardsState.REVIEW);
  };

  const handleBackToCreate = () => {
    setFlashcards([]);
    setSetId(null);
    setAppState(FlashcardsState.CREATE);
    onBackToCreate();
  };

  const handleSaveProgress = async (updatedFlashcards: Flashcard[]) => {
    setFlashcards(updatedFlashcards);

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
      try {
        // Convert Flashcard[] to Json type before saving to Supabase
        const cardsJson = updatedFlashcards as unknown as Json;
        
        await supabase
          .from("flashcard_sets")
          .update({ cards: cardsJson })
          .eq("id", setId)
          .eq("user_id", user.id);
      } catch (error) {
        console.error("Error updating flashcards progress in database:", error);
      }
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

  switch (appState) {
    case FlashcardsState.CREATE:
      return (
        <motion.div
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
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
