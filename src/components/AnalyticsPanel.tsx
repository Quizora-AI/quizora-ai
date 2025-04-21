
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
import { Calendar, ChartBar, ChartPie } from "lucide-react";

interface AnalyticsPanelProps {
  isPremium: boolean;
  quizHistory: Array<{ 
    score: number; 
    questionsCount: number; 
    title: string;
    date: string;
    attempts?: number;
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
          {/* Using Lock icon */}
          <svg className="h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="9" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
        <h3 className="text-xl font-medium mb-2">Premium Feature</h3>
        <p className="text-muted-foreground mb-6">
          Advanced analytics is a premium feature. Upgrade to access detailed insights and performance tracking.
        </p>
        <Button onClick={() => navigate('/settings?tab=premium')}>
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M17 4a1 1 0 0 1 2 0l1.38 4.24a1 1 0 0 0 .95.69h4.38a1 1 0 0 1 .59 1.81l-3.54 2.58a1 1 0 0 0-.36 1.12l1.38 4.24a1 1 0 0 1-1.54 1.12L12 17.77l-3.54 2.58a1 1 0 0 1-1.54-1.12l1.38-4.24a1 1 0 0 0-.36-1.12L2.4 10.74A1 1 0 0 1 3 8.93h4.38a1 1 0 0 0 .95-.69L10.7 4A1 1 0 0 1 12 4z" />
          </svg>
          Go Premium
        </Button>
      </motion.div>
    );
  }

  // Analyze quiz history to find topics and performance
  const analyzedTopics = analyzeQuizTopics(quizHistory);
  const scoreDistribution = analyzeScoreDistribution(quizHistory);
  const strengths = calculateStrengths(analyzedTopics);
  const weaknesses = calculateWeaknesses(analyzedTopics);
  const progressData = generateProgressData(quizHistory);
  const categoryPerformance = analyzeCategoryPerformance(quizHistory);
  const conceptualChallenges = analyzeChallenges(quizHistory);
  
  // Convert performance data for visualization
  const topicPerformanceData = Object.entries(analyzedTopics).map(([topic, data]) => ({
    name: topic,
    score: data.averageScore,
    quizzes: data.count,
    fill: getColorByScore(data.averageScore)
  })).slice(0, 5); // Take top 5 topics
  
  return (
    <motion.div variants={containerVariants} className="space-y-6">
      <motion.div variants={itemVariants} className="text-center">
        <h2 className="text-xl font-bold mb-2">Performance Overview</h2>
        <p className="text-muted-foreground text-sm">
          Track your learning progress and identify areas for improvement
        </p>
      </motion.div>
      {quizHistory.length > 0 ? (
        <>
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{quizHistory.length}</div>
                  <p className="text-sm text-muted-foreground">Total Quizzes Taken</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {Math.round(quizHistory.reduce((avg, quiz) => avg + quiz.score, 0) / quizHistory.length || 0)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {quizHistory.reduce((total, quiz) => total + quiz.questionsCount, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Questions Answered</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
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
                  <p className="text-center text-muted-foreground">
                    Take more quizzes to see your progress over time
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ChartBar className="h-5 w-5 mr-2" />
                  Topic Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topicPerformanceData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topicPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Bar dataKey="score" fill="#8884d8" name="Average Score">
                          {topicPerformanceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">
                    Not enough topic data to display visualization
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ChartPie className="h-5 w-5 mr-2" />
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
          
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Category Performance Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-lg mb-3">Strengths</h3>
                    {strengths.length > 0 ? (
                      <ul className="space-y-2">
                        {strengths.map((strength, index) => (
                          <li key={index} className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-900/10 rounded-md border border-green-100 dark:border-green-800/20">
                            <span className="text-green-600 dark:text-green-400">✓</span>
                            <span>{strength.topic}: <span className="font-medium">{strength.score}%</span> average score</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">Take more quizzes to identify your strengths</p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg mb-3">Areas for Improvement</h3>
                    {weaknesses.length > 0 ? (
                      <ul className="space-y-2">
                        {weaknesses.map((weakness, index) => (
                          <li key={index} className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/10 rounded-md border border-red-100 dark:border-red-800/20">
                            <span className="text-red-600 dark:text-red-400">!</span>
                            <span>{weakness.topic}: <span className="font-medium">{weakness.score}%</span> average score</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">Take more quizzes to identify areas for improvement</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Conceptual Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg mb-3">Challenging Concepts</h3>
                    {conceptualChallenges.length > 0 ? (
                      <ul className="space-y-2">
                        {conceptualChallenges.map((challenge, index) => (
                          <li key={index} className="p-2 bg-amber-50 dark:bg-amber-900/10 rounded-md border border-amber-100 dark:border-amber-800/20">
                            <div className="font-medium">{challenge.concept}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Appears in {challenge.count} quiz(zes) with average score of {challenge.averageScore}%
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">Not enough data to identify challenging concepts</p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg mb-3">Subject Proficiency</h3>
                    {categoryPerformance.length > 0 ? (
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {categoryPerformance.map((category, index) => (
                          <li key={index} className="p-2 rounded-md border border-border">
                            <div className="font-medium">{category.category}</div>
                            <div className="flex items-center mt-1">
                              <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full rounded-full" 
                                  style={{ 
                                    width: `${category.proficiency}%`,
                                    backgroundColor: getColorByScore(category.proficiency)
                                  }}
                                />
                              </div>
                              <span className="ml-2 text-sm">{category.proficiency}%</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">Complete more quizzes to see subject proficiency</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-md">
                    <span className="text-primary mt-0.5">✓</span>
                    <span><strong>Priority Focus:</strong> {weaknesses.length > 0 
                      ? `Concentrate on ${weaknesses[0].topic} where your performance is lowest (${weaknesses[0].score}%).` 
                      : "Take more quizzes to identify your focus areas."}</span>
                  </li>
                  <li className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-md">
                    <span className="text-primary mt-0.5">✓</span>
                    <span><strong>Performance Trend:</strong> {quizHistory.length >= 3 
                      ? `Your performance is ${getPerformanceTrend(quizHistory)}. ${
                          getPerformanceTrend(quizHistory) === "improving" 
                            ? "Keep up the good work!" 
                            : getPerformanceTrend(quizHistory) === "declining" 
                              ? "Try to review your recent errors to improve." 
                              : "Try more challenging questions to continue growing."
                        }` 
                      : "Not enough data yet to establish a performance trend."}</span>
                  </li>
                  <li className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-md">
                    <span className="text-primary mt-0.5">✓</span>
                    <span><strong>Study Strategy:</strong> Create flashcards specifically for {conceptualChallenges.length > 0 
                      ? conceptualChallenges.map(c => c.concept).join(", ") 
                      : "concepts you consistently miss"}.</span>
                  </li>
                  <li className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-md">
                    <span className="text-primary mt-0.5">✓</span>
                    <span><strong>Daily Review:</strong> Spend 10-15 minutes daily reviewing {weaknesses.length > 0 
                      ? weaknesses.map(w => w.topic).join(", ") 
                      : "challenging topics"}.</span>
                  </li>
                  <li className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-md">
                    <span className="text-primary mt-0.5">✓</span>
                    <span><strong>Learning Approach:</strong> Try using {getRecommendedLearningStyles(quizHistory)} for better retention and understanding.</span>
                  </li>
                  <li className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-md">
                    <span className="text-primary mt-0.5">✓</span>
                    <span><strong>Next Steps:</strong> {getNextStepsRecommendation(strengths, weaknesses)}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </>
      ) : (
        <motion.div variants={itemVariants} className="text-center p-8">
          <p className="text-muted-foreground">
            No quiz history found. Take some quizzes to see your analytics!
          </p>
          <Button 
            onClick={() => navigate('/')} 
            variant="outline"
            className="mt-4"
          >
            Create Your First Quiz
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

// Helper functions for analytics
function analyzeQuizTopics(quizHistory: Array<{ title: string; score: number }>) {
  const topics: Record<string, { totalScore: number; count: number; averageScore: number }> = {};
  
  quizHistory.forEach(quiz => {
    // Extract topic from quiz title
    const topic = extractTopic(quiz.title);
    
    if (!topics[topic]) {
      topics[topic] = { totalScore: 0, count: 0, averageScore: 0 };
    }
    
    topics[topic].totalScore += quiz.score;
    topics[topic].count += 1;
    topics[topic].averageScore = Math.round(topics[topic].totalScore / topics[topic].count);
  });
  
  return topics;
}

function analyzeScoreDistribution(quizHistory: Array<{ score: number }>) {
  const ranges = [
    { name: "90-100%", min: 90, max: 100, value: 0, color: "#10B981" },
    { name: "80-89%", min: 80, max: 89, value: 0, color: "#3B82F6" },
    { name: "70-79%", min: 70, max: 79, value: 0, color: "#6366F1" },
    { name: "60-69%", min: 60, max: 69, value: 0, color: "#8B5CF6" },
    { name: "Below 60%", min: 0, max: 59, value: 0, color: "#EF4444" }
  ];
  
  quizHistory.forEach(quiz => {
    for (const range of ranges) {
      if (quiz.score >= range.min && quiz.score <= range.max) {
        range.value += 1;
        break;
      }
    }
  });
  
  // Only return ranges with values
  return ranges.filter(range => range.value > 0);
}

function calculateStrengths(analyzedTopics: Record<string, { averageScore: number; count: number }>) {
  return Object.entries(analyzedTopics)
    .filter(([_, data]) => data.count >= 1 && data.averageScore >= 70)
    .map(([topic, data]) => ({ topic, score: data.averageScore }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function calculateWeaknesses(analyzedTopics: Record<string, { averageScore: number; count: number }>) {
  return Object.entries(analyzedTopics)
    .filter(([_, data]) => data.count >= 1)
    .map(([topic, data]) => ({ topic, score: data.averageScore }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);
}

function getPerformanceTrend(quizHistory: Array<{ score: number; date: string }>) {
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

function getColorByScore(score: number) {
  if (score >= 90) return "#10B981"; // Green
  if (score >= 80) return "#3B82F6"; // Blue
  if (score >= 70) return "#6366F1"; // Indigo
  if (score >= 60) return "#8B5CF6"; // Violet
  return "#EF4444"; // Red
}

function extractTopic(title: string): string {
  // Clean up and extract the main topic
  const cleanTitle = title.replace(/Quiz|Test|\d+|[-—:]/gi, '').trim();
  
  // If the title contains "Medical" or other subject identifiers, use that
  if (cleanTitle.includes("Medical")) {
    return "Medicine";
  }
  
  // Otherwise, just return the first word or the whole string if it's short
  const words = cleanTitle.split(' ');
  return words[0] || "General";
}

// New helper functions for enhanced analytics
function generateProgressData(quizHistory: Array<{ score: number; date: string }>) {
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

function analyzeCategoryPerformance(quizHistory: Array<{ title: string; score: number }>) {
  const categories: Record<string, { totalScore: number; count: number }> = {};
  
  quizHistory.forEach(quiz => {
    const category = extractCategory(quiz.title);
    
    if (!categories[category]) {
      categories[category] = { totalScore: 0, count: 0 };
    }
    
    categories[category].totalScore += quiz.score;
    categories[category].count += 1;
  });
  
  return Object.entries(categories)
    .map(([category, data]) => ({
      category,
      proficiency: Math.round(data.totalScore / data.count),
      quizCount: data.count
    }))
    .sort((a, b) => b.proficiency - a.proficiency);
}

function extractCategory(title: string): string {
  if (title.includes("Medical")) return "Medicine";
  if (title.includes("Anatomy")) return "Anatomy";
  if (title.includes("Physiology")) return "Physiology";
  if (title.includes("Pathology")) return "Pathology";
  if (title.includes("Pharmacology")) return "Pharmacology";
  if (title.includes("Biochemistry")) return "Biochemistry";
  
  // Default categorization based on title
  const words = title.split(' ');
  return words.length > 1 ? words[0] : "General";
}

function analyzeChallenges(quizHistory: Array<{ title: string; score: number }>) {
  // This would typically use question-level data to identify specific concepts
  // Here we're simulating based on titles and scores
  
  const concepts: Record<string, { totalScore: number; count: number }> = {};
  
  quizHistory.forEach(quiz => {
    if (quiz.score < 70) {
      // Extract potential challenging concepts from low-scoring quizzes
      const potentialConcepts = extractConcepts(quiz.title);
      
      potentialConcepts.forEach(concept => {
        if (!concepts[concept]) {
          concepts[concept] = { totalScore: 0, count: 0 };
        }
        
        concepts[concept].totalScore += quiz.score;
        concepts[concept].count += 1;
      });
    }
  });
  
  return Object.entries(concepts)
    .map(([concept, data]) => ({
      concept,
      averageScore: Math.round(data.totalScore / data.count),
      count: data.count
    }))
    .sort((a, b) => a.averageScore - b.averageScore)
    .slice(0, 3);
}

function extractConcepts(title: string): string[] {
  // This is a simplified approach - in a real app, we would analyze actual question content
  const keywords = ["physiology", "anatomy", "diagnosis", "treatment", "pathology", "diseases", 
                   "symptoms", "examination", "lab", "medicine", "emergency", "surgical"];
                   
  return keywords.filter(keyword => title.toLowerCase().includes(keyword));
}

function getRecommendedLearningStyles(quizHistory: Array<{ score: number }>) {
  // This would typically be based on performance patterns
  // For now we're providing generic recommendations
  const styles = [
    "visual diagrams and illustrations",
    "verbal explanations and discussions",
    "problem-based learning with case studies",
    "interactive quizzes and active recall practice",
    "spaced repetition review sessions"
  ];
  
  // Return 2-3 random learning styles
  return styles
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * 2) + 2)
    .join(", ");
}

function getNextStepsRecommendation(
  strengths: Array<{topic: string; score: number}>, 
  weaknesses: Array<{topic: string; score: number}>
) {
  if (weaknesses.length === 0) {
    return "Challenge yourself with more advanced topics and consider helping others learn these subjects too.";
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
  
  return "Take more varied quizzes to better understand your strengths and weaknesses.";
}
