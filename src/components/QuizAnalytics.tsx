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
  Legend,
  LineChart,
  Line
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
  startTime?: string;
  endTime?: string;
}

interface TopicPerformanceData {
  topic: string;
  score: number;
  questionsCount: number;
}

interface SubjectPerformance {
  subject: string;
  score: number;
  count: number;
}

export function QuizAnalytics({ 
  questions, 
  correctAnswers, 
  incorrectAnswers, 
  userAnswers,
  timePerQuestion = [],
  averageTime = 0,
  totalTime = 0,
  startTime,
  endTime
}: QuizAnalyticsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const totalQuestions = questions.length;
  const score = Math.round((correctAnswers / totalQuestions) * 100);
  const navigate = useNavigate();
  const [topicPerformance, setTopicPerformance] = useState<TopicPerformanceData[]>([]);
  
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
    try {
      const quizHistory = localStorage.getItem("quizHistory");
      if (quizHistory) {
        const history = JSON.parse(quizHistory);
        
        const topicMap = new Map<string, {total: number, correct: number, count: number}>();
        
        const recentQuizzes = history.slice(0, 5);
        
        recentQuizzes.forEach((quiz: any) => {
          let topic = "General";
          
          if (quiz.title && quiz.title.includes(" - ")) {
            topic = quiz.title.split(" - ")[1];
          } else if (quiz.questions && quiz.questions.length > 0 && quiz.questions[0].topic) {
            topic = quiz.questions[0].topic;
          }
          
          const correctCount = quiz.score ? Math.round((quiz.score / 100) * quiz.questionsCount) : 0;
          const score = quiz.score || 0;
          
          if (topicMap.has(topic)) {
            const existing = topicMap.get(topic)!;
            topicMap.set(topic, {
              total: existing.total + score,
              correct: existing.correct + correctCount,
              count: existing.count + 1
            });
          } else {
            topicMap.set(topic, {
              total: score,
              correct: correctCount,
              count: 1
            });
          }
        });
        
        const topicData: TopicPerformanceData[] = Array.from(topicMap.entries()).map(
          ([topic, data]) => ({
            topic,
            score: Math.round(data.total / data.count),
            questionsCount: data.count
          })
        );
        
        setTopicPerformance(topicData);
      }
    } catch (error) {
      console.error("Error loading quiz history for topic performance:", error);
    }
  }, []);

  const analyzeSubjectPerformance = () => {
    try {
      const quizHistory = localStorage.getItem("quizHistory");
      if (!quizHistory) return [];
      
      const history = JSON.parse(quizHistory);
      const subjectMap = new Map<string, {total: number; count: number}>();
      
      const recentQuizzes = history.slice(0, 5);
      
      recentQuizzes.forEach((quiz: any) => {
        if (quiz.questions && quiz.questions.length > 0) {
          quiz.questions.forEach((question: Question) => {
            if (question.subject) {
              if (!subjectMap.has(question.subject)) {
                subjectMap.set(question.subject, { total: 0, count: 0 });
              }
              
              const data = subjectMap.get(question.subject)!;
              data.total += quiz.score || 0;
              data.count += 1;
            }
          });
        }
      });
      
      const subjectPerformance: SubjectPerformance[] = Array.from(subjectMap.entries())
        .map(([subject, data]) => ({
          subject,
          score: Math.round(data.total / data.count),
          count: data.count
        }))
        .sort((a, b) => b.score - a.score);
        
      return subjectPerformance;
    } catch (error) {
      console.error("Error analyzing subject performance:", error);
      return [];
    }
  };

  const subjectPerformance = analyzeSubjectPerformance();
  const strengths = subjectPerformance.filter(subject => subject.score >= 70);
  const weaknesses = subjectPerformance.filter(subject => subject.score < 70);

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return "0 sec";
    if (seconds < 60) return `${seconds} sec`;
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}m ${sec}s`;
  };

  const overviewData = [
    { name: "Correct", value: correctAnswers, color: "#10b981" },
    { name: "Incorrect", value: incorrectAnswers, color: "#ef4444" }
  ];
  
  const timingData = questions.map((_, index) => {
    const timeSpent = timePerQuestion[index] || 0;
    return {
      name: `Q${index + 1}`,
      time: timeSpent,
      avg: averageTime
    };
  });

  const currentQuizTopics = questions.reduce((topics: string[], q) => {
    if (q.topic && !topics.includes(q.topic)) {
      topics.push(q.topic);
    }
    return topics;
  }, []);

  const fallbackTopics = currentQuizTopics.length > 0 ? 
    currentQuizTopics : 
    questions.reduce((subjects: string[], q) => {
      if (q.subject && !subjects.includes(q.subject)) {
        subjects.push(q.subject);
      }
      return subjects;
    }, []);

  const allQuestions = questions.map((question, index) => ({
    question,
    isCorrect: userAnswers[index] === question.correctAnswer,
    userAnswer: userAnswers[index],
    timeSpent: timePerQuestion[index] || 0
  }));

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
                      <Timer className="h-4 w-4 text-primary" />
                      <span>Average Time per Question:</span>
                    </div>
                    <span className="font-medium">{formatTime(averageTime)}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2 bg-muted rounded-md">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>Completion Time:</span>
                    </div>
                    <span className="font-medium">{formatTime(totalTime)}</span>
                  </div>
                </div>

                {topicPerformance.length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
                      <BarChart2 className="h-4 w-4 text-primary" />
                      Topic Performance
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topicPerformance}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="topic" />
                          <YAxis domain={[0, 100]} label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
                          <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                          <Bar name="Average Score" dataKey="score" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
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
                    
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        All Questions Review:
                      </h3>
                      {allQuestions.map((item, index) => (
                        <div 
                          key={index} 
                          className={`p-4 border rounded-md ${
                            item.isCorrect ? 'bg-success/5' : 'bg-destructive/5'
                          }`}
                        >
                          <p className={`font-medium mb-2 flex items-center gap-2 ${
                            item.isCorrect ? 'text-success' : 'text-destructive'
                          }`}>
                            {item.isCorrect ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <AlertCircle className="h-4 w-4" />
                            )}
                            Question {index + 1}:
                          </p>
                          <p className="mb-2">{item.question.question}</p>
                          <p className="text-sm font-medium flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-success" />
                            Correct Answer: {item.question.options[item.question.correctAnswer]}
                          </p>
                          {!item.isCorrect && (
                            <p className="text-sm font-medium flex items-center gap-2 mt-1">
                              <XCircle className="h-4 w-4 text-destructive" />
                              Your Answer: {item.question.options[item.userAnswer]}
                            </p>
                          )}
                          {item.question.explanation && (
                            <div className="mt-2 text-sm bg-muted p-2 rounded">
                              <span className="font-medium flex items-center gap-1">
                                <Info className="h-3.5 w-3.5" />
                                Explanation:
                              </span>
                              {item.question.explanation.split('\n').map((point, i) => (
                                <div key={i} className="mt-1 flex gap-2">
                                  <span>•</span>
                                  <span>{point.trim()}</span>
                                </div>
                              ))}
                              
                              {!item.isCorrect && item.question.misconception && (
                                <div className="mt-2 text-destructive/80">
                                  <span className="font-medium">Why you might have chosen this answer:</span>
                                  {item.question.misconception.split('\n').map((point, i) => (
                                    <div key={i} className="mt-1 flex gap-2">
                                      <span>•</span>
                                      <span>{point.trim()}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                          <div className="mt-2 text-xs text-muted-foreground">
                            Time taken: {formatTime(item.timeSpent)}
                          </div>
                        </div>
                      ))}
                    </div>
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
                        {strengths.length > 0 ? (
                          strengths.map((subject, index) => (
                            <li key={index} className="flex gap-2 items-start">
                              <CircleCheck className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                              <span>
                                Strong performance in <strong>{subject.subject}</strong> with {subject.score}% average score
                              </span>
                            </li>
                          ))
                        ) : (
                          <li className="flex gap-2 items-start">
                            <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span>Complete more quizzes to identify your strengths</span>
                          </li>
                        )}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-lg mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        Areas for Improvement
                      </h3>
                      <ul className="space-y-3">
                        {weaknesses.length > 0 ? (
                          weaknesses.map((subject, index) => (
                            <li key={index} className="flex gap-2 items-start">
                              <ArrowUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>
                                Focus on improving <strong>{subject.subject}</strong> (current score: {subject.score}%)
                              </span>
                            </li>
                          ))
                        ) : (
                          <li className="flex gap-2 items-start">
                            <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span>Complete more quizzes to identify areas for improvement</span>
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
                        <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                          <Flag className="h-5 w-5 text-primary mt-1" />
                          <div>
                            <h4 className="font-medium">Priority Focus</h4>
                            <p className="text-muted-foreground text-sm">
                              {incorrectAnswers > 0 
                                ? `Focus on reviewing the ${incorrectAnswers} question${incorrectAnswers > 1 ? 's' : ''} you missed.`
                                : "Great job! Move on to more challenging topics."}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                          <BarChart2 className="h-5 w-5 text-primary mt-1" />
                          <div>
                            <h4 className="font-medium">Performance Trend</h4>
                            <p className="text-muted-foreground text-sm">
                              {topicPerformance.length > 1 
                                ? "Your performance varies across topics. Focus on those with lower scores."
                                : "Not enough data yet to establish a performance trend. Take more quizzes for insights."}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                          <BookMarked className="h-5 w-5 text-primary mt-1" />
                          <div>
                            <h4 className="font-medium">Study Strategy</h4>
                            <p className="text-muted-foreground text-sm">
                              {fallbackTopics.length > 0 
                                ? `Create flashcards focusing on ${fallbackTopics.join(', ')} concepts to strengthen your understanding.`
                                : "Create flashcards for concepts you consistently miss, focusing on key terminology."}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                          <Clock className="h-5 w-5 text-primary mt-1" />
                          <div>
                            <h4 className="font-medium">Daily Review</h4>
                            <p className="text-muted-foreground text-sm">
                              Spend 10-15 minutes daily reviewing challenging topics from this quiz.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                          <ArrowRight className="h-5 w-5 text-primary mt-1" />
                          <div>
                            <h4 className="font-medium">Next Steps</h4>
                            <p className="text-muted-foreground text-sm">
                              {score > 80 
                                ? "Challenge yourself with more advanced topics or try quizzes with more questions." 
                                : "Retake this quiz after reviewing the material to solidify your understanding."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-lg mb-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        Study Schedule
                      </h3>
                      <div className="space-y-3">
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
