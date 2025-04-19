
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { QuizGenerator } from "@/components/QuizGenerator";
import { motion } from "framer-motion";
import { History, BarChart, Settings, Trash2, Clock, Sparkles, Brain } from "lucide-react";
import { Question } from "@/components/FileUpload";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface TabNavigationProps {
  onQuizGenerated: (questions: Question[]) => void;
}

interface QuizHistory {
  id: string;
  date: string;
  title: string;
  questionsCount: number;
  score: number;
  questions: Question[];
}

export function TabNavigation({ onQuizGenerated }: TabNavigationProps) {
  const [activeTab, setActiveTab] = useState("create");
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const [autoSave, setAutoSave] = useState(localStorage.getItem("autoSave") !== "false");
  const { toast } = useToast();

  // Load quiz history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("quizHistory");
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setQuizHistory(parsedHistory);
      } catch (error) {
        console.error("Error parsing quiz history:", error);
        localStorage.setItem("quizHistory", JSON.stringify([]));
      }
    }

    // Apply dark mode if enabled
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleStartFromHistory = (quiz: QuizHistory) => {
    onQuizGenerated(quiz.questions);
    toast({
      title: "Quiz loaded",
      description: `Loaded ${quiz.title} with ${quiz.questionsCount} questions.`
    });
  };

  const handleDeleteQuiz = (id: string) => {
    setQuizToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (quizToDelete) {
      const updatedHistory = quizHistory.filter(quiz => quiz.id !== quizToDelete);
      setQuizHistory(updatedHistory);
      localStorage.setItem("quizHistory", JSON.stringify(updatedHistory));
      setIsDeleteDialogOpen(false);
      setQuizToDelete(null);
      toast({
        title: "Quiz deleted",
        description: "The quiz has been removed from your history."
      });
    }
  };

  const clearAllHistory = () => {
    setQuizHistory([]);
    localStorage.setItem("quizHistory", JSON.stringify([]));
    toast({
      title: "History cleared",
      description: "All quiz history has been deleted."
    });
  };

  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    localStorage.setItem("darkMode", checked.toString());
    if (checked) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    toast({
      title: checked ? "Dark mode enabled" : "Light mode enabled",
      description: "Your preference has been saved."
    });
  };

  const handleAutoSaveToggle = (checked: boolean) => {
    setAutoSave(checked);
    localStorage.setItem("autoSave", checked.toString());
    toast({
      title: checked ? "Auto-save enabled" : "Auto-save disabled",
      description: checked ? "Your quiz results will be automatically saved." : "Your quiz results will not be saved."
    });
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <>
      <Tabs
        defaultValue="create"
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full max-w-4xl mx-auto"
      >
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>Create Quiz</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span>History</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>
        
        <motion.div
          initial="hidden"
          animate="visible"
          variants={tabVariants}
          key={activeTab}
          className="w-full"
        >
          <TabsContent value="create" className="mt-0">
            <QuizGenerator onQuizGenerated={onQuizGenerated} />
          </TabsContent>
          
          <TabsContent value="history" className="mt-0">
            <Card className="shadow-lg border border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <History className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Quiz History</CardTitle>
                </div>
                {quizHistory.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-xs"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {quizHistory.length > 0 ? (
                  <div className="space-y-4">
                    {quizHistory.map((quiz) => (
                      <motion.div
                        key={quiz.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="flex items-center justify-between p-4 rounded-lg border border-primary/10 hover:border-primary/30 hover:bg-accent/50 transition-all"
                        whileHover={{ scale: 1.01, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 p-3 rounded-full">
                            <Clock className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{quiz.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(quiz.date).toLocaleString()} • {quiz.questionsCount} questions • Score: {quiz.score}%
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartFromHistory(quiz)}
                            className="border-primary/20 hover:border-primary/80"
                          >
                            <Sparkles className="h-4 w-4 mr-1" />
                            Retake
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteQuiz(quiz.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center py-8"
                  >
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                      <History className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">No quiz history yet</h3>
                    <p className="text-muted-foreground">
                      Complete a quiz to see your history here
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-0">
            <Card className="shadow-lg border border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Settings className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Settings</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <span className="bg-primary/10 p-1 rounded">
                      <Settings className="h-4 w-4 text-primary" />
                    </span>
                    Appearance
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="dark-mode">Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Toggle between light and dark theme
                      </p>
                    </div>
                    <Switch 
                      id="dark-mode" 
                      checked={darkMode} 
                      onCheckedChange={handleDarkModeToggle}
                    />
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <span className="bg-primary/10 p-1 rounded">
                      <Brain className="h-4 w-4 text-primary" />
                    </span>
                    Data & Privacy
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-save">Auto-save Results</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically save quiz results to history
                      </p>
                    </div>
                    <Switch 
                      id="auto-save" 
                      checked={autoSave}
                      onCheckedChange={handleAutoSaveToggle}
                    />
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      onClick={clearAllHistory}
                      className="text-destructive border-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Data
                    </Button>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="space-y-2"
                >
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <span className="bg-primary/10 p-1 rounded">
                      <BarChart className="h-4 w-4 text-primary" />
                    </span>
                    About
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    MedQuiz v2.0.0 - An AI-powered medical quiz application
                  </p>
                </motion.div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <p className="text-xs text-muted-foreground">
                  All settings are saved automatically
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </motion.div>
      </Tabs>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="border border-primary/10">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {quizToDelete ? "Delete this quiz?" : "Clear all quiz history?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {quizToDelete 
                ? "This quiz will be permanently removed from your history."
                : "This will permanently delete all your quiz history and cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={quizToDelete ? confirmDelete : clearAllHistory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {quizToDelete ? "Delete" : "Clear All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
