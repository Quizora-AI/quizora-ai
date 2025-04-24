
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
  Cell,
  Legend
} from "recharts";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle,
  XCircle,
  PieChart as PieChartIcon,
  Clock,
  Timer,
  BookOpen,
  AlertCircle,
  Info,
  BarChart2,
  Target,
  Award,
  GraduationCap,
  Lightbulb,
  ArrowRight,
  BookMarked,
  Flag,
  CircleCheck,
  Calendar,
  ArrowUp,
  Brain
} from "lucide-react";

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
  averageTime = 0,
  totalTime = 0
}: QuizAnalyticsProps) {
  const [activeTab, setActiveTab] = useState("overview");
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

  // Format time for display with proper handling
  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return "0 sec";
    if (seconds < 60) return `${seconds} sec`;
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}m ${sec}s`;
  };

  // Prepare data for overview chart
  const overviewData = [
    { name: "Correct", value: correctAnswers, color: "#10b981" },
    { name: "Incorrect", value: incorrectAnswers, color: "#ef4444" }
  ];
  
  // Prepare timing data for visualization with safety checks
  const timingData = questions.map((_, index) => {
    const timeSpent = timePerQuestion[index] || 0;
    return {
      name: `Q${index + 1}`,
      time: timeSpent,
      avg: averageTime || 0
    };
  });

  // Get incorrect questions for detailed review
  const incorrectQuestions = questions.filter((_, index) => 
    userAnswers[index] !== questions[index].correctAnswer
  );

  // Get key topics from quiz content
  const extractTopics = () => {
    const topics = new Map<string, number>();
    
    questions.forEach(q => {
      const text = q.question.toLowerCase();
      
      // Extract potential keywords
      const keywords = text.match(/\b\w{5,}\b/g) || [];
      keywords.forEach(word => {
        if (!word.match(/^(about|because|before|between|during|through|without)$/)) {
          topics.set(word, (topics.get(word) || 0) + 1);
        }
      });
    });
    
    // Return top 3 topics
    return [...topics.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic.charAt(0).toUpperCase() + topic.slice(1));
  };
  
  const quizTopics = extractTopics();
  
  // Generate smart recommendations based on performance
  const getRecommendations = () => {
    const recs = [];
    
    // Priority focus area
    if (incorrectAnswers > 0) {
      recs.push({
        title: "Priority Focus",
        content: `Focus on reviewing the ${incorrectAnswers} question${incorrectAnswers > 1 ? 's' : ''} you missed.`,
        icon: <Flag className="h-5 w-5 text-primary" />
      });
    } else {
      recs.push({
        title: "Great Job!",
        content: "You got all questions correct. Try more challenging quizzes next.",
        icon: <Award className="h-5 w-5 text-primary" />
      });
    }
    
    // Time management
    if (averageTime && averageTime > 20) {
      recs.push({
        title: "Time Management",
        content: "Work on improving your speed while maintaining accuracy.",
        icon: <Clock className="h-5 w-5 text-primary" />
      });
    } else if (averageTime && averageTime < 5 && incorrectAnswers > 0) {
      recs.push({
        title: "Careful Reading",
        content: "You answered quickly but missed some questions. Take time to read carefully.",
        icon: <BookOpen className="h-5 w-5 text-primary" />
      });
    }
    
    // Study strategy
    recs.push({
      title: "Study Strategy",
      content: "Create flashcards for difficult concepts to reinforce your learning.",
      icon: <BookMarked className="h-5 w-5 text-primary" />
    });
    
    // Next steps
    recs.push({
      title: "Next Steps",
      content: "Take another quiz soon to build on what you've learned.",
      icon: <ArrowRight className="h-5 w-5 text-primary" />
    });
    
    return recs;
  };

  const handleCreateNewQuiz = () => {
    navigate('/quiz');
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
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-6">
              <div className="w-40 h-40 rounded-full border-8 border-primary/20 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-5xl font-bold ${score >= 70 ? "text-success" : score >= 50 ? "text-primary" : "text-destructive"}`}>
                    {score}%
                  </div>
                  <div className="text-sm font-medium mt-1">Score</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-center mb-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="text-2xl font-bold">{totalQuestions}</div>
                <div className="text-sm text-muted-foreground">Total Questions</div>
              </div>
              <div className="bg-success/10 p-4 rounded-lg">
                <div className="flex justify-center mb-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div className="text-2xl font-bold text-success">{correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="bg-destructive/10 p-4 rounded-lg">
                <div className="flex justify-center mb-2">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
                <div className="text-2xl font-bold text-destructive">{incorrectAnswers}</div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-muted/50 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-primary" />
                  <span className="text-sm">Total Time:</span>
                </div>
                <span className="font-medium">{formatTime(totalTime)}</span>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm">Avg. Time Per Question:</span>
                </div>
                <span className="font-medium">{formatTime(averageTime)}</span>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button onClick={handleCreateNewQuiz} className="gap-2">
                <GraduationCap className="h-4 w-4" /> Create New Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="questions" className="text-xs sm:text-sm">Questions Analysis</TabsTrigger>
            <TabsTrigger value="improvement" className="text-xs sm:text-sm">Improvement Plan</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card>
              <CardHeader className="flex items-center flex-row gap-2">
                <PieChartIcon className="h-5 w-5 text-primary" />
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
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>Average Time per Question:</span>
                    </div>
                    <span className="font-medium">{formatTime(averageTime)}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2 bg-muted rounded-md">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-primary" />
                      <span>Completion Time:</span>
                    </div>
                    <span className="font-medium">{formatTime(totalTime)}</span>
                  </div>
                </div>
                
                {/* Quiz Topics Section */}
                <div className="mt-6">
                  <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span>Quiz Topics</span>
                  </h3>
                  
                  <div className="space-y-3">
                    {quizTopics.length > 0 ? (
                      <ul className="space-y-2">
                        {quizTopics.map((topic, index) => (
                          <li key={index} className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                            <Flag className="h-4 w-4 text-primary" />
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-muted-foreground text-sm">
                        Complete more quizzes to identify key topics
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="questions">
            <Card>
              <CardHeader className="flex items-center flex-row gap-2">
                <BarChart2 className="h-5 w-5 text-primary" />
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
                    
                    {incorrectQuestions.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="font-medium text-lg flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-destructive" />
                          Questions to Review:
                        </h3>
                        {incorrectQuestions.map((q, index) => (
                          <div key={index} className="p-4 border rounded-md bg-destructive/5">
                            <p className="font-medium text-destructive mb-2 flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              Question {questions.findIndex(question => question.id === q.id) + 1}:
                            </p>
                            <p className="mb-2">{q.question}</p>
                            <p className="text-sm font-medium flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-success" />
                              Correct Answer: {q.options[q.correctAnswer]}
                            </p>
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
                      Upgrade to Premium to access detailed question breakdown and analysis
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
              <CardHeader className="flex items-center flex-row gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <CardTitle>AI-Powered Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                {isPremium ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-lg mb-2 flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        Strengths
                      </h3>
                      <ul className="list-disc space-y-3 pl-4">
                        {correctAnswers > 0 && (
                          <li className="flex gap-2 items-start">
                            <CircleCheck className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                            <span>You answered {correctAnswers} out of {totalQuestions} questions correctly</span>
                          </li>
                        )}
                        {score > 50 && (
                          <li className="flex gap-2 items-start">
                            <CircleCheck className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                            <span>You have a solid understanding of the material</span>
                          </li>
                        )}
                        {score > 70 && (
                          <li className="flex gap-2 items-start">
                            <CircleCheck className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                            <span>Your knowledge level is excellent</span>
                          </li>
                        )}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-lg mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        Areas for Improvement
                      </h3>
                      <ul className="list-disc space-y-3 pl-4">
                        {incorrectAnswers > 0 && (
                          <li className="flex gap-2 items-start">
                            <ArrowUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>Review the {incorrectAnswers} questions you missed</span>
                          </li>
                        )}
                        {score < 70 && (
                          <li className="flex gap-2 items-start">
                            <ArrowUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>Focus on understanding the core concepts better</span>
                          </li>
                        )}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-lg mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        Personalized Recommendations
                      </h3>
                      <div className="space-y-4">
                        {getRecommendations().map((rec, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                            {rec.icon}
                            <div>
                              <h4 className="font-medium">{rec.title}</h4>
                              <p className="text-muted-foreground text-sm">{rec.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-lg mb-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        Study Schedule
                      </h3>
                      <div className="space-y-3 pl-4">
                        <div className="flex gap-2 items-start">
                          <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong>Today:</strong> Review questions from this quiz</span>
                        </div>
                        <div className="flex gap-2 items-start">
                          <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong>Tomorrow:</strong> Create flashcards for key concepts</span>
                        </div>
                        <div className="flex gap-2 items-start">
                          <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong>Next Week:</strong> Try another quiz to measure progress</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <h3 className="text-lg font-medium mb-2">Premium Feature</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                      Upgrade to Premium to access personalized improvement plans and guidance
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
