
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Flashcard, FlashcardsGenerator } from "./FlashcardsGenerator";
import { FlashcardsViewer } from "./FlashcardsViewer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth0 } from "@auth0/auth0-react";
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
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth0();

  // Helper function to convert Flashcard[] to Json
  const flashcardsToJson = (cards: Flashcard[]): Json => {
    // First convert to a plain object/array through JSON serialization
    // Then assign as Json type
    return JSON.parse(JSON.stringify(cards)) as Json;
  };

  // Helper function to convert Json to Flashcard[]
  const jsonToFlashcards = (json: Json): Flashcard[] => {
    if (Array.isArray(json)) {
      // First cast to unknown, then to the target type
      return (json as unknown) as Flashcard[];
    }
    return [];
  };

  // Safer data loading with retry mechanism
  const loadFlashcardsData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check for flashcards to review
      const flashcardsToReview = localStorage.getItem("flashcardsToReview");
      
      if (flashcardsToReview) {
        try {
          const parsedData = JSON.parse(flashcardsToReview);
          const { cards, title: savedTitle, id } = parsedData;
          
          if (cards && Array.isArray(cards) && cards.length) {
            setFlashcards(cards);
            setSetId(id || null);
            if (savedTitle) setTitle(savedTitle);
            setAppState(FlashcardsState.REVIEW);
            localStorage.removeItem("flashcardsToReview");
            
            // Log success and notify user
            console.log(`Loaded ${cards.length} flashcards successfully`);
            toast({
              title: "Flashcards Loaded",
              description: `${cards.length} cards ready for review`,
            });
            return; // Exit early since we've loaded the cards
          }
        } catch (error) {
          console.error("Error loading flashcards to review:", error);
          setError("Failed to load flashcards data. Creating fresh flashcards instead.");
          localStorage.removeItem("flashcardsToReview");
        }
      }
      
      // If we get here, we either had no flashcards to review or there was an error
      // Default to create state
      setAppState(FlashcardsState.CREATE);
      
    } catch (error) {
      console.error("Unexpected error in flashcards flow:", error);
      setError("Something went wrong loading flashcards");
      setAppState(FlashcardsState.CREATE);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadFlashcardsData();
  }, [loadFlashcardsData]);

  const handleFlashcardsGenerated = async (
    generatedFlashcards: Flashcard[], 
    setMeta?: { title?: string, id?: string, subject?: string, course?: string, topic?: string }
  ) => {
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
    
    // If authenticated, save to Supabase
    try {
      if (isAuthenticated && user) {
        // Prepare flashcard set data
        const flashcardSet = {
          title: setMeta?.title || "Untitled Flashcards",
          subject: setMeta?.subject || "General",
          course: setMeta?.course || null,
          topic: setMeta?.topic || null,
          cards: flashcardsToJson(generatedFlashcards),
          user_id: user.sub
        };
        
        const { data, error } = await supabase
          .from('flashcard_sets')
          .insert(flashcardSet)
          .select('id')
          .single();
          
        if (error) {
          console.error("Error saving flashcards to Supabase:", error);
        } else if (data) {
          // Set ID for future updates
          setSetId(data.id);
          
          toast({
            title: "Flashcards Saved",
            description: "Your flashcards have been saved to your account"
          });
        }
      } else {
        // Save to localStorage for non-authenticated users
        const newId = `local-${Date.now()}`;
        setSetId(newId);
        
        // Save to history in localStorage
        const historyItem = {
          id: newId,
          title: setMeta?.title || "Untitled Flashcards",
          subject: setMeta?.subject || "General",
          course: setMeta?.course || null,
          topic: setMeta?.topic || null,
          cards: generatedFlashcards,
          created_at: new Date()
        };
        
        const existingHistory = localStorage.getItem("flashcardsHistory");
        const historyArray = existingHistory ? JSON.parse(existingHistory) : [];
        historyArray.unshift(historyItem);
        localStorage.setItem("flashcardsHistory", JSON.stringify(historyArray));
      }
    } catch (error) {
      console.error("Error saving flashcards:", error);
    }
    
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
      // If authenticated and we have a setId, update in Supabase
      if (isAuthenticated && user && setId) {
        const { error } = await supabase
          .from("flashcard_sets")
          .update({ 
            cards: flashcardsToJson(updatedFlashcards),
          })
          .eq("id", setId);
          
        if (error) {
          console.error("Error updating flashcards in Supabase:", error);
          throw error;
        }
      } else {
        // Update in local storage
        const flashcardsHistory = localStorage.getItem("flashcardsHistory");
        if (flashcardsHistory) {
          try {
            const history = JSON.parse(flashcardsHistory);
            const index = history.findIndex((set: any) => set.id === setId);
            if (index !== -1) {
              history[index].cards = updatedFlashcards;
              localStorage.setItem("flashcardsHistory", JSON.stringify(history));
            }
          } catch (error) {
            console.error("Error updating flashcards progress in local storage:", error);
          }
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
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 },
  };

  const pageTransition = {
    type: "spring",
    stiffness: 400, 
    damping: 30,
    duration: 0.2
  };

  if (isLoading) {
    return (
      <div className="space-y-4 px-1 py-3">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full" />
        <div className="flex justify-between">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border border-destructive/50 bg-destructive/10 rounded-md text-center"
      >
        <h2 className="text-lg font-semibold mb-2">Error</h2>
        <p className="mb-4">{error}</p>
        <button 
          className="px-4 py-2 bg-primary text-primary-foreground rounded"
          onClick={() => {
            setError(null);
            setAppState(FlashcardsState.CREATE);
          }}
        >
          Dismiss & Create Flashcards
        </button>
      </motion.div>
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
