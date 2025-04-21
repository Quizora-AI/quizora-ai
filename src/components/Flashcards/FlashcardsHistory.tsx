
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Clock, BookPlus } from "lucide-react";
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

interface QuizHistoryItem {
  id: string;
  date: string;
  title: string;
  questionsCount: number;
  score: number;
}

export function FlashcardsHistory() {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardsSetHistory[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>([]);
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

    // Load quiz history
    const savedQuizzes = localStorage.getItem("quizHistory");
    if (savedQuizzes) {
      try {
        const parsedQuizzes = JSON.parse(savedQuizzes);
        setQuizHistory(parsedQuizzes);
      } catch (error) {
        console.error("Error loading quiz history:", error);
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

  const handleRetakeQuiz = (quizId: string) => {
    const quizToRetake = quizHistory.find(quiz => quiz.id === quizId);
    if (quizToRetake) {
      localStorage.setItem("quizToRetake", JSON.stringify(quizToRetake));
      navigate("/quiz");
    }
  };

  const handleViewQuiz = (quizId: string) => {
    navigate(`/history/${quizId}`);
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="bg-card/50 backdrop-blur-sm border border-primary/10 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold">Learning History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="flashcards">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="flashcards" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Flashcards
              </TabsTrigger>
              <TabsTrigger value="quizzes" className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> Quizzes
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="flashcards" className="mt-0">
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
                <div className="space-y-4">
                  {flashcardSets.map((set) => (
                    <motion.div key={set.id} variants={itemVariants}>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex-1">
                              <h3 className="font-medium">{set.title}</h3>
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
                                <Progress value={calculateProgress(set.cards)} className="h-1" />
                              </div>
                            </div>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleRetakeFlashcards(set.id)}
                            >
                              Review
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="quizzes" className="mt-0">
              {quizHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-xl font-bold mb-2">No quiz history yet</h2>
                  <p className="text-muted-foreground mb-6">
                    Take quizzes to test your knowledge
                  </p>
                  <Button onClick={() => navigate('/quiz')}>Create Quiz</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {quizHistory.map((quiz) => (
                    <motion.div key={quiz.id} variants={itemVariants}>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex-1">
                              <h3 className="font-medium">{quiz.title}</h3>
                              <div className="text-sm text-muted-foreground flex flex-wrap gap-2 items-center">
                                <span>{new Date(quiz.date).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>{quiz.questionsCount} questions</span>
                                <span>•</span>
                                <span className="font-medium">{quiz.score}% score</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewQuiz(quiz.id)}
                              >
                                View
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleRetakeQuiz(quiz.id)}
                              >
                                Retake
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
