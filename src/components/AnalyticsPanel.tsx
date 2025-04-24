
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { 
  Award,
  BarChart2,
  Book,
  Brain,
  CalendarDays,
  ChartPieIcon,
  CheckCircle,
  Circle,
  Compass,
  Lightbulb,
  LineChart as LineChartIcon,
  Medal,
  Ruler,
  Target, 
  Zap
} from "lucide-react";

interface AnalyticsPanelProps {
  isPremium: boolean;
  quizHistory: Array<{ 
    score: number; 
    questionsCount: number; 
    title: string;
    date: string;
    attempts?: number;
    userAnswers?: number[];
    questions?: any[];
    timePerQuestion?: number[];
  }>;
  navigate: (path: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { when: "beforeChildren", staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function AnalyticsPanel({ isPremium, quizHistory, navigate }: AnalyticsPanelProps) {
  if (!isPremium) {
    return (
      <motion.div variants={itemVariants} className="text-center p-8">
        <div className="flex justify-center mb-4">
          <Award className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-medium mb-2">Premium Feature</h3>
        <p className="text-muted-foreground mb-6">
          Advanced analytics is a premium feature. Upgrade to access detailed insights and performance tracking.
        </p>
        <Button onClick={() => navigate('/settings?tab=premium')}>
          <Medal className="mr-2 h-4 w-4" />
          Go Premium
        </Button>
      </motion.div>
    );
  }

  // Analyze quiz data
  const analytics = analyzeQuizData(quizHistory);
  const progressData = generateProgressData(quizHistory);
  const scoreDistribution = analyzeScoreDistribution(quizHistory);
  
  return (
    <motion.div variants={containerVariants} className="space-y-6">
      <motion.div variants={itemVariants} className="text-center mb-8">
        <h2 className="text-xl font-bold mb-2 flex justify-center items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Performance Analytics
        </h2>
        <p className="text-muted-foreground text-sm">
          Detailed insights based on your quiz history and learning patterns
        </p>
      </motion.div>
      
      {quizHistory.length > 0 ? (
        <>
          {/* Performance Overview */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartPieIcon className="h-5 w-5 text-primary" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-muted/50 p-4 rounded-lg text-center">
                    <div className="text-xs uppercase text-muted-foreground mb-1">Quizzes Taken</div>
                    <div className="text-3xl font-bold">{quizHistory.length}</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg text-center">
                    <div className="text-xs uppercase text-muted-foreground mb-1">Avg. Score</div>
                    <div className="text-3xl font-bold">{analytics.averageScore}%</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg text-center">
                    <div className="text-xs uppercase text-muted-foreground mb-1">Questions Answered</div>
                    <div className="text-3xl font-bold">{analytics.totalQuestions}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Your Strengths */}
                  <div>
                    <h3 className="font-medium text-base mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      Your Strengths
                    </h3>
                    {analytics.strengths.length > 0 ? (
                      <div className="space-y-2">
                        {analytics.strengths.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-success/10 rounded border border-success/20">
                            <span className="flex items-center gap-1">
                              <Circle className="h-2 w-2 fill-success text-success" />
                              {item.topic}
                            </span>
                            <span className="font-medium">{item.score}%</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground p-2">
                        Complete more quizzes to identify your strengths
                      </div>
                    )}
                  </div>
                  
                  {/* Areas for Improvement */}
                  <div>
                    <h3 className="font-medium text-base mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4 text-destructive" />
                      Areas for Improvement
                    </h3>
                    {analytics.weaknesses.length > 0 ? (
                      <div className="space-y-2">
                        {analytics.weaknesses.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-destructive/10 rounded border border-destructive/20">
                            <span className="flex items-center gap-1">
                              <Circle className="h-2 w-2 fill-destructive text-destructive" />
                              {item.topic}
                            </span>
                            <span className="font-medium">{item.score}%</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground p-2">
                        Complete more quizzes to identify areas for improvement
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quiz Progress Chart */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5 text-primary" />
                  Progress Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                {progressData.length > 1 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={progressData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                          name="Quiz Score"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="average" 
                          stroke="#82ca9d" 
                          strokeDasharray="5 5" 
                          name="Running Average"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Take more quizzes to see your progress over time
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Score Distribution */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartPieIcon className="h-5 w-5 text-primary" />
                  Score Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={scoreDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {scoreDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Topic Performance */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-primary" />
                  Topic Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.topicPerformance.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.topicPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend />
                        <Bar dataKey="score" fill="#8884d8" name="Average Score" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Take more varied quizzes to analyze topic performance
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
          {/* AI Recommendations */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  AI-Powered Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                    <div className="bg-blue-100 dark:bg-blue-800 rounded-full p-1.5 mt-0.5">
                      <Zap className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                      <h4 className="font-medium">Priority Focus</h4>
                      <p className="text-muted-foreground text-sm">
                        {analytics.weaknesses.length > 0 
                          ? `Concentrate on ${analytics.weaknesses[0].topic} where your performance is lowest (${analytics.weaknesses[0].score}%).`
                          : "Complete more quizzes with varied topics to identify focus areas."}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-900/20">
                    <div className="bg-purple-100 dark:bg-purple-800 rounded-full p-1.5 mt-0.5">
                      <CalendarDays className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                    </div>
                    <div>
                      <h4 className="font-medium">Performance Trend</h4>
                      <p className="text-muted-foreground text-sm">
                        {quizHistory.length >= 3
                          ? `Your performance is ${analytics.trend}. ${
                              analytics.trend === "improving" 
                                ? "Keep up the good work!" 
                                : analytics.trend === "declining" 
                                  ? "Try to review your recent errors to improve." 
                                  : "Try more challenging questions to continue growing."
                            }`
                          : "Take at least 3 quizzes to establish a performance trend."}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                    <div className="bg-green-100 dark:bg-green-800 rounded-full p-1.5 mt-0.5">
                      <Book className="h-4 w-4 text-green-600 dark:text-green-300" />
                    </div>
                    <div>
                      <h4 className="font-medium">Study Strategy</h4>
                      <p className="text-muted-foreground text-sm">
                        Create flashcards for specific concepts you consistently miss, focusing on definitions and key principles.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                    <div className="bg-amber-100 dark:bg-amber-800 rounded-full p-1.5 mt-0.5">
                      <Ruler className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                    </div>
                    <div>
                      <h4 className="font-medium">Daily Review</h4>
                      <p className="text-muted-foreground text-sm">
                        Spend 10-15 minutes daily reviewing {analytics.weaknesses.length > 0 
                          ? analytics.weaknesses.map(w => w.topic).join(", ") 
                          : "challenging topics"}.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-900/20">
                    <div className="bg-indigo-100 dark:bg-indigo-800 rounded-full p-1.5 mt-0.5">
                      <Compass className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                    </div>
                    <div>
                      <h4 className="font-medium">Next Steps</h4>
                      <p className="text-muted-foreground text-sm">
                        {analytics.nextStepsRecommendation}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      ) : (
        <motion.div variants={itemVariants} className="text-center p-8">
          <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-6">
            No quiz history found. Take some quizzes to see your analytics!
          </p>
          <Button 
            onClick={() => navigate('/quiz')} 
            className="gap-2"
          >
            <Book className="h-4 w-4" />
            Create Your First Quiz
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

// Helper functions for analytics
function analyzeQuizData(quizHistory: AnalyticsPanelProps['quizHistory']) {
  // Calculate overall stats
  const totalQuizzes = quizHistory.length;
  const totalQuestions = quizHistory.reduce((acc, quiz) => acc + quiz.questionsCount, 0);
  const totalScore = quizHistory.reduce((acc, quiz) => acc + quiz.score, 0);
  const averageScore = totalQuizzes ? Math.round(totalScore / totalQuizzes) : 0;

  // Extract topics and performance
  const topicsData: Record<string, { totalScore: number; count: number }> = {};
  
  quizHistory.forEach(quiz => {
    // Extract topics from quiz title and extract course/subject data
    const { topic, course, subject } = extractQuizMetadata(quiz.title);
    
    // Process topics
    if (!topicsData[topic]) {
      topicsData[topic] = { totalScore: 0, count: 0 };
    }
    topicsData[topic].totalScore += quiz.score;
    topicsData[topic].count += 1;
    
    // Process course data
    if (course && course.trim() !== '') {
      if (!topicsData[course]) {
        topicsData[course] = { totalScore: 0, count: 0 };
      }
      topicsData[course].totalScore += quiz.score;
      topicsData[course].count += 1;
    }
    
    // Process subject data
    if (subject && subject.trim() !== '') {
      if (!topicsData[subject]) {
        topicsData[subject] = { totalScore: 0, count: 0 };
      }
      topicsData[subject].totalScore += quiz.score;
      topicsData[subject].count += 1;
    }
    
    // Also extract concepts from question text when available
    if (quiz.questions && quiz.questions.length > 0) {
      quiz.questions.forEach(question => {
        const conceptKeywords = extractKeywords(question.question);
        conceptKeywords.forEach(keyword => {
          if (!topicsData[keyword]) {
            topicsData[keyword] = { totalScore: 0, count: 0 };
          }
          topicsData[keyword].totalScore += quiz.score;
          topicsData[keyword].count += 1;
        });
      });
    }
  });
  
  // Calculate average score per topic
  const topicsPerformance = Object.entries(topicsData).map(([topic, data]) => ({
    topic,
    averageScore: Math.round(data.totalScore / data.count),
    count: data.count
  }));
  
  // Find strengths and weaknesses
  const strengths = topicsPerformance
    .filter(t => t.count >= 1 && t.averageScore >= 70)
    .map(t => ({ topic: t.topic, score: t.averageScore }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
    
  const weaknesses = topicsPerformance
    .filter(t => t.count >= 1)
    .map(t => ({ topic: t.topic, score: t.averageScore }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);
  
  // Performance trend analysis
  const trend = determinePerformanceTrend(quizHistory);
  
  // Generate topic performance data for charts
  const topicPerformance = topicsPerformance
    .filter(t => t.count > 0)
    .map(t => ({
      name: t.topic,
      score: t.averageScore,
      count: t.count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Generate next steps recommendation
  const nextStepsRecommendation = generateNextStepsRecommendation(strengths, weaknesses, averageScore);
  
  return {
    totalQuizzes,
    totalQuestions,
    averageScore,
    strengths,
    weaknesses,
    topicPerformance,
    trend,
    nextStepsRecommendation
  };
}

function analyzeScoreDistribution(quizHistory: AnalyticsPanelProps['quizHistory']) {
  const ranges = [
    { name: "90-100%", min: 90, max: 100, value: 0, color: "#10B981" },
    { name: "80-89%", min: 80, max: 89, value: 0, color: "#3B82F6" },
    { name: "70-79%", min: 70, max: 79, value: 0, color: "#6366F1" },
    { name: "60-69%", min: 60, max: 69, value: 0, color: "#8B5CF6" },
    { name: "Below 60%", min: 0, max: 59, value: 0, color: "#EF4444" }
  ];
  
  quizHistory.forEach(quiz => {
    const range = ranges.find(r => quiz.score >= r.min && quiz.score <= r.max);
    if (range) range.value += 1;
  });
  
  // Only return ranges with values
  return ranges.filter(range => range.value > 0);
}

function generateProgressData(quizHistory: AnalyticsPanelProps['quizHistory']) {
  if (quizHistory.length === 0) return [];
  
  // Sort by date
  const sortedQuizzes = [...quizHistory].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  let runningTotal = 0;
  
  return sortedQuizzes.map((quiz, index) => {
    runningTotal += quiz.score;
    return {
      date: new Date(quiz.date).toLocaleDateString(),
      score: quiz.score,
      average: Math.round(runningTotal / (index + 1))
    };
  });
}

function determinePerformanceTrend(quizHistory: AnalyticsPanelProps['quizHistory']) {
  if (quizHistory.length < 3) return "stable";
  
  // Sort quizzes by date
  const sortedQuizzes = [...quizHistory].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Get the last 3 quizzes
  const recent = sortedQuizzes.slice(-3);
  
  // Check if scores are improving, declining, or stable
  if (recent[0].score < recent[1].score && recent[1].score < recent[2].score) {
    return "improving";
  } else if (recent[0].score > recent[1].score && recent[1].score > recent[2].score) {
    return "declining";
  } else {
    return "stable";
  }
}

// Extract relevant metadata from quiz titles
function extractQuizMetadata(title: string) {
  const lowerTitle = title.toLowerCase();
  let course = "";
  let subject = "";
  let topic = "";
  
  // Try to extract structured info (Course: X, Subject: Y, Topic: Z)
  const courseMatch = /course:?\s*([^,]+)/i.exec(title);
  const subjectMatch = /subject:?\s*([^,]+)/i.exec(title);
  const topicMatch = /topic:?\s*([^,]+)/i.exec(title);
  
  if (courseMatch) course = courseMatch[1].trim();
  if (subjectMatch) subject = subjectMatch[1].trim();
  if (topicMatch) topic = topicMatch[1].trim();
  
  // If no structured info found, try common patterns
  if (!course) {
    if (lowerTitle.includes('neet') || lowerTitle.includes('medical')) course = 'Medical';
    else if (lowerTitle.includes('engineering')) course = 'Engineering';
    else if (lowerTitle.includes('upsc')) course = 'UPSC';
    else if (lowerTitle.includes('gk')) course = 'General Knowledge';
    else course = 'General';
  }
  
  // Extract subject based on common medical/academic subjects
  if (!subject) {
    const subjects = [
      'anatomy', 'physiology', 'biochemistry', 'pathology', 'microbiology',
      'pharmacology', 'medicine', 'surgery', 'pediatrics', 'gynecology',
      'physics', 'chemistry', 'biology', 'mathematics', 'history',
      'geography', 'economics', 'political science'
    ];
    
    for (const s of subjects) {
      if (lowerTitle.includes(s)) {
        subject = s.charAt(0).toUpperCase() + s.slice(1);
        break;
      }
    }
    
    if (!subject) subject = 'General';
  }
  
  // Extract topic from remaining words or use default
  if (!topic) {
    // Clean up the title
    const cleanTitle = title
      .replace(/quiz|test|exam|course:.*|subject:.*|topic:.*/gi, '')
      .replace(/[^\w\s]/gi, ' ')
      .trim();
    
    const words = cleanTitle.split(/\s+/);
    if (words.length > 0) {
      // Find the most specific word (not already used as course/subject)
      for (const word of words) {
        if (word.length > 3 && 
            !word.toLowerCase().includes(course.toLowerCase()) && 
            !word.toLowerCase().includes(subject.toLowerCase())) {
          topic = word.charAt(0).toUpperCase() + word.slice(1);
          break;
        }
      }
    }
    
    if (!topic) topic = cleanTitle || 'General';
  }
  
  return { course, subject, topic };
}

// Extract potential keywords from text for concept analysis
function extractKeywords(text: string): string[] {
  if (!text) return [];
  
  // Common medical/academic keywords to look for
  const commonKeywords = [
    'kidney', 'heart', 'liver', 'brain', 'lung', 'bone', 'muscle',
    'nerve', 'artery', 'vein', 'cell', 'tissue', 'organ', 'system',
    'disease', 'syndrome', 'treatment', 'diagnosis', 'therapy',
    'equation', 'formula', 'theory', 'principle', 'law', 'reaction'
  ];
  
  const words = text.toLowerCase()
    .replace(/[^\w\s]/gi, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3);
  
  // Prioritize common keywords, then find other potentially meaningful words
  const foundKeywords = new Set<string>();
  
  // First check for common keywords
  for (const keyword of commonKeywords) {
    if (text.toLowerCase().includes(keyword)) {
      foundKeywords.add(keyword.charAt(0).toUpperCase() + keyword.slice(1));
    }
  }
  
  // If no common keywords found, extract nouns or important-looking words
  if (foundKeywords.size === 0) {
    // Simple heuristic: longer words are more likely to be meaningful
    const potentialKeywords = words
      .filter(w => w.length > 5 && !['about', 'because', 'through', 'without', 'between'].includes(w))
      .slice(0, 2);
    
    potentialKeywords.forEach(k => {
      foundKeywords.add(k.charAt(0).toUpperCase() + k.slice(1));
    });
  }
  
  return Array.from(foundKeywords);
}

// Generate personalized next steps recommendation
function generateNextStepsRecommendation(
  strengths: {topic: string, score: number}[], 
  weaknesses: {topic: string, score: number}[],
  averageScore: number
): string {
  if (weaknesses.length === 0) {
    return "Challenge yourself with more advanced topics. Consider creating more complex quizzes.";
  }
  
  if (weaknesses.length > 0) {
    const worstTopic = weaknesses[0].topic;
    
    if (weaknesses[0].score < 50) {
      return `Review fundamental concepts in ${worstTopic} before proceeding with more advanced material.`;
    } else if (weaknesses[0].score < 70) {
      return `Create a focused study plan for ${worstTopic} with regular practice quizzes.`;
    } else {
      return `Continue regular practice on ${worstTopic} while leveraging your strengths in ${strengths.length > 0 ? strengths[0].topic : 'other areas'}.`;
    }
  }
  
  if (averageScore > 85) {
    return "You're performing excellently. Try increasing quiz difficulty or exploring new topics.";
  }
  
  return "Take more varied quizzes to better understand your strengths and weaknesses.";
}
