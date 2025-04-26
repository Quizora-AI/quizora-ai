import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Flashcard } from "@/types";
import { FlashcardSet } from "@/components/Flashcards/FlashcardSet";
import { generateFlashcards } from "@/integrations/openai";
import { BannerAd } from "@/components/GoogleAds";
import { shouldShowFlashcardCompletionAd } from '@/utils/adUtils';
import { useInterstitialAd } from '../GoogleAds';

interface FlashcardsFlowProps {
  onBackToCreate: () => void;
}

export function FlashcardsFlow({ onBackToCreate }: FlashcardsFlowProps) {
  const [topic, setTopic] = useState('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const savedFlashcards = localStorage.getItem("currentFlashcardSet");
    if (savedFlashcards) {
      try {
        const { topic: savedTopic, flashcards: savedCards } = JSON.parse(savedFlashcards);
        setTopic(savedTopic);
        setFlashcards(savedCards);
        setIsComplete(true);
      } catch (error) {
        console.error("Error loading saved flashcards:", error);
        localStorage.removeItem("currentFlashcardSet");
      }
    }
  }, []);

  const handleGenerateFlashcards = async () => {
    if (!topic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic to generate flashcards.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const generatedCards = await generateFlashcards(topic);
      setFlashcards(generatedCards);
      localStorage.setItem("currentFlashcardSet", JSON.stringify({ topic, flashcards: generatedCards }));
      setIsLoading(false);
      
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
      
      await handleFlashcardsComplete();
      
    } catch (error: any) {
      console.error("Error generating flashcards:", error);
      setErrorMessage(error.message || "Failed to generate flashcards. Please try again.");
      setIsLoading(false);
      toast({
        title: "Error",
        description: errorMessage || "Failed to generate flashcards. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClearFlashcards = () => {
    setFlashcards([]);
    setIsComplete(false);
    localStorage.removeItem("currentFlashcardSet");
  };

  return (
    <div className="container mx-auto mt-8">
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-2 bg-transparent">
          <CardTitle className="text-2xl font-bold">Flashcard Generator</CardTitle>
          <CardDescription>Enter a topic and generate a set of flashcards.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              placeholder="Enter topic e.g. 'Cell Biology'"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isLoading}
            />
          </div>
          {errorMessage && (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center bg-transparent">
          <Button variant="outline" onClick={onBackToCreate}>Back to Quiz</Button>
          <Button onClick={handleGenerateFlashcards} disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate Flashcards"}
          </Button>
        </CardFooter>
      </Card>

      {isComplete && flashcards.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Flashcard Set: {topic}</h2>
          <FlashcardSet flashcards={flashcards} />
          <div className="flex justify-center mt-4">
            <Button variant="destructive" onClick={handleClearFlashcards}>Clear Flashcards</Button>
          </div>
        </div>
      )}
      
      <div className="mt-6">
        <BannerAd 
          adUnitId="ca-app-pub-8270549953677995/2218567244" 
          size="BANNER"
          className="max-w-md mx-auto"
        />
      </div>
    </div>
  );
}
