
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Question } from "./FileUpload";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

interface QuizAnalyticsProps {
  questions: Question[];
  correctAnswers: number;
  incorrectAnswers: number;
  userAnswers: number[];
  timePerQuestion?: number[];
  averageTime?: number;
  totalTime?: number;
}

export function QuizAnalytics({ 
  questions, 
  correctAnswers, 
  incorrectAnswers, 
  userAnswers,
  timePerQuestion = [],
  averageTime = 15,
  totalTime = 45
}: QuizAnalyticsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const totalQuestions = questions.length;
  const score = Math.round((correctAnswers / totalQuestions) * 100);
  const navigate = useNavigate();
  
  // Check if user has premium
  const [isPremium, setIsPremium] = useState(() => {
    try {
      const userSettings = localStorage.getItem("userSettings");
      if (userSettings) {
        const settings = JSON.parse(userSettings);
        return settings.isPremium === true;
      }
      return false;
    } catch {
      return false;
    }
  });
  
  useEffect(() => {
    // Generate performance suggestions based on user's actual performance
    const personalized = getPerformanceSuggestions(
      score, 
      correctAnswers, 
      incorrectAnswers, 
      questions, 
      userAnswers,
      timePerQuestion
    );
    setSuggestions(personalized);
  }, [score, correctAnswers, incorrectAnswers, questions, userAnswers, timePerQuestion]);

  // Prepare data for overview chart
  const overviewData = [
    { name: "Correct", value: correctAnswers, color: "#10b981" },
    { name: "Incorrect", value: incorrectAnswers, color: "#ef4444" }
  ];
  
  // Prepare data for question breakdown
  const questionBreakdownData = questions.map((question, index) => {
    const isCorrect = userAnswers[index] === question.correctAnswer;
    const timeSpent = timePerQuestion && timePerQuestion[index] ? timePerQuestion[index] : 0;
    
    return {
      name: `Q${index + 1}`,
      status: isCorrect ? "Correct" : "Incorrect",
      value: 1,
      time: timeSpent,
      color: isCorrect ? "#10b981" : "#ef4444"
    };
  });

  // Prepare timing data for visualization
  const timingData = questions.map((_, index) => {
    const timeSpent = timePerQuestion && timePerQuestion[index] ? timePerQuestion[index] : 0;
    return {
      name: `Q${index + 1}`,
      time: timeSpent,
      avg: averageTime
    };
  });

  // Get incorrect questions for detailed review
  const incorrectQuestions = questions.filter((_, index) => userAnswers[index] !== questions[index].correctAnswer);

  // Get topics or concepts that need improvement based on incorrect answers
  const getWeakTopics = () => {
    // Simple analysis of incorrect questions to find common themes
    const topics: {[key: string]: number} = {};
    
    incorrectQuestions.forEach(q => {
      // Extract potential topics from question text
      const questionText = q.question.toLowerCase();
      const words = questionText.split(/\s+/);
      
      // Look for key concepts (words longer than 5 chars that aren't common words)
      const commonWords = ['about', 'after', 'again', 'below', 'could', 'every', 'first', 'found', 'great', 'house', 'large', 'learn', 'never', 'other', 'place', 'small', 'study', 'their', 'there', 'these', 'thing', 'think', 'three', 'water', 'where', 'which', 'world', 'would', 'write'];
      
      words.forEach(word => {
        if (word.length > 5 && !commonWords.includes(word)) {
          topics[word] = (topics[word] || 0) + 1;
        }
      });
    });
    
    // Return top 3 topics that appear most frequently
    return Object.entries(topics)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic);
  };

  // Performance suggestions based on score and specific patterns
  function getPerformanceSuggestions(
    score: number, 
    correctCount: number, 
    incorrectCount: number, 
    questions: Question[],
    userAnswers: number[],
    timings: number[] = []
  ): string[] {
    const suggestions = [];
    const weakTopics = getWeakTopics();
    
    // General score-based suggestions
    if (score >= 80) {
      suggestions.push(
        `Excellent work! You scored in the top ${score >= 90 ? '10%' : '20%'} of quiz takers.`,
        `To further improve, focus on the specific ${incorrectCount} ${incorrectCount === 1 ? 'question' : 'questions'} you missed.`
      );
    } else if (score >= 60) {
      suggestions.push(
        `Good job! Your understanding is solid, but there's room for improvement in ${weakTopics.length > 0 ? weakTopics.join(', ') : 'some areas'}.`,
        `Create flashcards specifically for the ${incorrectCount} questions you got wrong to reinforce those concepts.`
      );
    } else {
      suggestions.push(
        `Focus on understanding the fundamental concepts related to ${weakTopics.length > 0 ? weakTopics.join(', ') : 'the questions you missed'}.`,
        `Consider reviewing the material again and breaking your study sessions into smaller, more focused segments.`
      );
    }
    
    // Time-based suggestions
    if (timings.length > 0) {
      const fastAnswers = timings.filter(time => time < 5).length;
      const slowAnswers = timings.filter(time => time > 25).length;
      
      if (fastAnswers > 0 && score < 70) {
        suggestions.push(`You answered ${fastAnswers} ${fastAnswers === 1 ? 'question' : 'questions'} very quickly. Taking an extra moment to carefully read all options could improve your accuracy.`);
      }
      
      if (slowAnswers > 0) {
        suggestions.push(`${slowAnswers} ${slowAnswers === 1 ? 'question' : 'questions'} took you longer than average to answer. Focus on practicing similar questions to build confidence and speed.`);
      }
      
      // Find questions where user spent a long time but still got it wrong
      const hardQuestions = timings.reduce((count, time, index) => {
        return (time > 20 && userAnswers[index] !== questions[index].correctAnswer) ? count + 1 : count;
      }, 0);
      
      if (hardQuestions > 0) {
        suggestions.push(`There ${hardQuestions === 1 ? 'was' : 'were'} ${hardQuestions} difficult ${hardQuestions === 1 ? 'question' : 'questions'} that took you longer to answer but you still missed. These areas need particular focus.`);
      }
    }
    
    // Pattern-based suggestions (check for consecutive wrong answers)
    let consecutiveWrong = 0;
    let maxConsecutiveWrong = 0;
    
    userAnswers.forEach((answer, index) => {
      if (answer !== questions[index].correctAnswer) {
        consecutiveWrong++;
        maxConsecutiveWrong = Math.max(maxConsecutiveWrong, consecutiveWrong);
      } else {
        consecutiveWrong = 0;
      }
    });
    
    if (maxConsecutiveWrong >= 2) {
      suggestions.push(`You missed ${maxConsecutiveWrong} questions in a row. Consider taking a short break when you feel your focus declining during an exam.`);
    }
    
    // Check for patterns in answer selection (e.g., always picking the same option)
    const optionFrequency: {[key: number]: number} = {};
    userAnswers.forEach(answer => {
      if (answer >= 0) {
        optionFrequency[answer] = (optionFrequency[answer] || 0) + 1;
      }
    });
    
    const mostFrequentOption = Object.entries(optionFrequency)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (mostFrequentOption && mostFrequentOption[1] > questions.length * 0.6) {
      const optionLabels = ["A", "B", "C", "D"];
      suggestions.push(`You tend to select option ${optionLabels[Number(mostFrequentOption[0])]} most frequently. Try to evaluate each option carefully to avoid bias.`);
    }
    
    // Ensure we don't have too many suggestions
    return suggestions.slice(0, 4);
  }

  const handleCreateNewQuiz = () => {
    navigate('/');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <motion.div 
      className="w-full max-w-4xl mx-auto space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Card className="shadow-lg border-t-4 border-primary">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-6">
              <div className="w-40 h-40 rounded-full border-8 border-primary/20 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-5xl font-bold ${score >= 70 ? "text-success" : score >= 50 ? "text-medical-teal" : "text-error"}`}>
                    {score}%
                  </div>
                  <div className="text-sm font-medium mt-1">Score</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-2xl font-bold">{totalQuestions}</div>
                <div className="text-sm text-muted-foreground">Total Questions</div>
              </div>
              <div className="bg-success/10 p-4 rounded-lg">
                <div className="text-2xl font-bold text-success">{correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="bg-error/10 p-4 rounded-lg">
                <div className="text-2xl font-bold text-error">{incorrectAnswers}</div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button onClick={handleCreateNewQuiz} className="gap-2">
                <Plus className="h-4 w-4" /> Create New Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="questions" className="text-xs sm:text-sm">Questions Analysis</TabsTrigger>
            <TabsTrigger value="improvement" className="text-xs sm:text-sm">Improvement Plan</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={overviewData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {overviewData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between px-4 py-2 bg-muted rounded-md">
                    <span>Average Time per Question:</span>
                    <span className="font-medium">{averageTime} seconds</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2 bg-muted rounded-md">
                    <span>Completion Time:</span>
                    <span className="font-medium">{totalTime} seconds</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="questions">
            <Card>
              <CardHeader>
                <CardTitle>Question Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {isPremium ? (
                  <>
                    <div className="h-64 mb-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={timingData} barSize={20}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis label={{ value: 'Time (seconds)', angle: -90, position: 'insideLeft' }} />
                          <Tooltip formatter={(value) => [`${value} seconds`, 'Time']} />
                          <Legend />
                          <Bar name="Time spent" dataKey="time" fill="#8884d8" />
                          <Bar name="Average time" dataKey="avg" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="h-48 mb-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={questionBreakdownData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis hide />
                          <Tooltip content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-background p-2 border rounded shadow-md">
                                  <p className="font-medium">{payload[0].payload.name}</p>
                                  <p className={payload[0].payload.status === "Correct" ? "text-success" : "text-error"}>
                                    {payload[0].payload.status}
                                  </p>
                                  <p>Time: {payload[0].payload.time}s</p>
                                </div>
                              );
                            }
                            return null;
                          }} />
                          <Bar dataKey="value" name="Result">
                            {
                              questionBreakdownData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))
                            }
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {incorrectQuestions.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="font-medium text-lg">Questions to Review:</h3>
                        {incorrectQuestions.map((q, index) => (
                          <div key={index} className="p-4 border rounded-md bg-error/5">
                            <p className="font-medium text-error mb-2">Question {questions.findIndex(question => question.id === q.id) + 1}:</p>
                            <p className="mb-2">{q.question}</p>
                            <p className="text-sm font-medium">Correct Answer: {q.options[q.correctAnswer]}</p>
                            {q.explanation && (
                              <p className="mt-2 text-sm text-muted-foreground">{q.explanation}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-10">
                    <h3 className="text-lg font-medium mb-2">Premium Feature</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                      Upgrade to Quizora AI Premium to access detailed question breakdown and analysis
                    </p>
                    <Button onClick={() => navigate('/settings?tab=premium')}>
                      Upgrade to Premium
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="improvement">
            <Card>
              <CardHeader>
                <CardTitle>Improvement Plan</CardTitle>
              </CardHeader>
              <CardContent>
                {isPremium ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-lg mb-2">Strengths</h3>
                      <ul className="list-disc list-inside space-y-1 pl-4">
                        <li>You performed well on {correctAnswers} out of {totalQuestions} questions</li>
                        {score > 50 && <li>Your overall understanding of the topics is good</li>}
                        {score > 75 && <li>You have excellent knowledge in this subject area</li>}
                        {timePerQuestion && timePerQuestion.filter(t => t < averageTime).length > (questions.length / 2) && 
                          <li>You answer questions efficiently, with good time management</li>
                        }
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-lg mb-2">Areas for Improvement</h3>
                      <ul className="list-disc list-inside space-y-1 pl-4">
                        {incorrectAnswers > 0 && <li>Focus on the {incorrectAnswers} questions you missed</li>}
                        {score < 75 && <li>Review the explanations for incorrect answers carefully</li>}
                        {score < 50 && <li>Consider revisiting the fundamental concepts of this topic</li>}
                        {averageTime > 20 && <li>Work on improving your speed while maintaining accuracy</li>}
                        {getWeakTopics().length > 0 && (
                          <li>Pay special attention to topics related to: {getWeakTopics().join(', ')}</li>
                        )}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-lg mb-2">Personalized Suggestions</h3>
                      <ul className="list-disc list-inside space-y-1 pl-4">
                        {suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <h3 className="text-lg font-medium mb-2">Premium Feature</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                      Upgrade to Quizora AI Premium to access personalized improvement plans and guidance
                    </p>
                    <Button onClick={() => navigate('/settings?tab=premium')}>
                      Upgrade to Premium
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
