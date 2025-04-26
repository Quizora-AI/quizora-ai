import { useState, useEffect } from "react";
import { FlashcardsGenerator, Flashcard } from "./FlashcardsGenerator";
import { FlashcardsViewer } from "./FlashcardsViewer";
import { useSearchParams } from "react-router-dom";
import { getCurrentFlashcardSet, saveCurrentFlashcardSet, saveFlashcardsToHistory } from "@/utils/storageUtils";
import { shouldShowFlashcardCompletionAd } from "@/utils/adUtils";
import { useInterstitialAd } from "@/components/GoogleAds";

interface FlashcardsFlowProps {
  onBackToCreate: () => void;
}

export function FlashcardsFlow({ onBackToCreate }: FlashcardsFlowProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [title, setTitle] = useState<string>("Flashcards");
  const [flowState, setFlowState] = useState<"generate" | "review">("generate");
  const [flashcardSetId, setFlashcardSetId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const mode = searchParams.get("mode");
    
    if (mode === "review") {
      const currentSet = getCurrentFlashcardSet();
      if (currentSet) {
        console.log("Loading existing flashcards for review:", currentSet);
        setFlashcards(currentSet.cards);
        setTitle(currentSet.title || "Flashcard Review");
        setFlashcardSetId(currentSet.id || null);
        setFlowState("review");
      } else {
        console.log("No flashcards found for review, showing generator");
        setFlowState("generate");
      }
    } else {
      localStorage.removeItem("currentFlashcardSet");
      setFlowState("generate");
    }
  }, [searchParams]);

  const handleFlashcardsGenerated = (newFlashcards: Flashcard[], setMeta?: { title?: string; id?: string }) => {
    setFlashcards(newFlashcards);
    if (setMeta?.title) setTitle(setMeta.title);
    if (setMeta?.id) setFlashcardSetId(setMeta.id);
    setFlowState("review");
    
    saveCurrentFlashcardSet({
      id: setMeta?.id || crypto.randomUUID(),
      title: setMeta?.title || title,
      cards: newFlashcards,
      mode: "review"
    });
  };

  const handleSaveProgress = (updatedFlashcards: Flashcard[]) => {
    setFlashcards(updatedFlashcards);
    
    if (flashcardSetId) {
      saveFlashcardsToHistory({
        id: flashcardSetId,
        title,
        cards: updatedFlashcards,
        created_at: new Date().toISOString()
      });
      console.log("Updated flashcards history with progress:", flashcardSetId);
    }
  };

  const [isComplete, setIsComplete] = useState(false);

  const handleFlashcardsComplete = async () => {
    if (shouldShowFlashcardCompletionAd()) {
      const { showInterstitial } = useInterstitialAd({
        adUnitId: "ca-app-pub-8270549953677995/9564071776",
        onAdDismissed: () => {
          // Continue with flashcard completion logic
          setIsComplete(true);
        }
      });
      showInterstitial();
    } else {
      setIsComplete(true);
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
          onComplete={handleFlashcardsComplete}
        />
      )}
    </>
  );
}
