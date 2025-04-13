
import { useState } from "react";
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
  Cell
} from "recharts";
import { motion } from "framer-motion";

interface QuizAnalyticsProps {
  questions: Question[];
  correctAnswers: number;
  incorrectAnswers: number;
  userAnswers: number[];
}

export function QuizAnalytics({ questions, correctAnswers, incorrectAnswers, userAnswers }: QuizAnalyticsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const totalQuestions = questions.length;
  const score = Math.round((correctAnswers / totalQuestions) * 100);
  
  // Calculate timing per question (this would normally be tracked during the quiz)
  const avgTimePerQuestion = 15; // This is a placeholder, would be actual data in real implementation
  
  // Prepare data for overview chart
  const overviewData = [
    { name: "Correct", value: correctAnswers, color: "#10b981" },
    { name: "Incorrect", value: incorrectAnswers, color: "#ef4444" }
  ];
  
  // Prepare data for question breakdown
  const questionBreakdownData = questions.map((question, index) => {
    const isCorrect = userAnswers[index] === question.correctAnswer;
    return {
      name: `Q${index + 1}`,
      status: isCorrect ? "Correct" : "Incorrect",
      value: 1,
      color: isCorrect ? "#10b981" : "#ef4444"
    };
  });

  // Get incorrect questions for detailed review
  const incorrectQuestions = questions.filter((_, index) => userAnswers[index] !== questions[index].correctAnswer);

  // Performance suggestions based on score
  const getPerformanceSuggestions = () => {
    if (score >= 80) {
      return [
        "Excellent work! To further improve, focus on the specific questions you missed.",
        "Review the explanations for the questions you got wrong to solidify your understanding.",
        "Consider increasing the difficulty level or time constraints in your next quiz."
      ];
    } else if (score >= 60) {
      return [
        "Good job! To improve, review the concepts related to the questions you missed.",
        "Create flashcards for the topics you found challenging.",
        "Practice more questions on the subjects where you made mistakes."
      ];
    } else {
      return [
        "Focus on understanding the fundamental concepts related to the questions you missed.",
        "Consider breaking down your study sessions into smaller, more focused segments.",
        "Review the explanations thoroughly and try similar questions to reinforce learning."
      ];
    }
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
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="questions">Questions Analysis</TabsTrigger>
            <TabsTrigger value="improvement">Improvement Plan</TabsTrigger>
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
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between px-4 py-2 bg-muted rounded-md">
                    <span>Average Time per Question:</span>
                    <span className="font-medium">{avgTimePerQuestion} seconds</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2 bg-muted rounded-md">
                    <span>Completion Time:</span>
                    <span className="font-medium">{avgTimePerQuestion * totalQuestions} seconds</span>
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
                <div className="h-64 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={questionBreakdownData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis hide />
                      <Tooltip />
                      <Bar dataKey="value">
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
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="improvement">
            <Card>
              <CardHeader>
                <CardTitle>Improvement Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-lg mb-2">Strengths</h3>
                    <ul className="list-disc list-inside space-y-1 pl-4">
                      <li>You performed well on {correctAnswers} out of {totalQuestions} questions</li>
                      {score > 50 && <li>Your overall understanding of the topics is good</li>}
                      {score > 75 && <li>You have excellent knowledge in this subject area</li>}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg mb-2">Areas for Improvement</h3>
                    <ul className="list-disc list-inside space-y-1 pl-4">
                      {incorrectAnswers > 0 && <li>Focus on the {incorrectAnswers} questions you missed</li>}
                      {score < 75 && <li>Review the explanations for incorrect answers carefully</li>}
                      {score < 50 && <li>Consider revisiting the fundamental concepts of this topic</li>}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg mb-2">Suggestions</h3>
                    <ul className="list-disc list-inside space-y-1 pl-4">
                      {getPerformanceSuggestions().map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
