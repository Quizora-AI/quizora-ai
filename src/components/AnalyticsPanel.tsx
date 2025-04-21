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
  Legend 
} from "recharts";

interface AnalyticsPanelProps {
  isPremium: boolean;
  quizHistory: Array<{ 
    score: number; 
    questionsCount: number; 
    title: string;
    date: string;
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
                <CardTitle>Topic Performance</CardTitle>
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
                        <Bar dataKey="score" fill="#8884d8">
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
                <CardTitle>Score Distribution</CardTitle>
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
                <CardTitle>Performance Analysis</CardTitle>
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
                <CardTitle>AI-Powered Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Focus on {weaknesses.length > 0 ? weaknesses[0].topic : "topics"} where your performance is lowest first.</span>
                  </li>
                  {quizHistory.length >= 3 ? (
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Your performance trend is {getPerformanceTrend(quizHistory)}. {
                        getPerformanceTrend(quizHistory) === "improving" 
                          ? "Keep up the good work!" 
                          : getPerformanceTrend(quizHistory) === "declining" 
                            ? "Try to review your recent errors to improve." 
                            : "Try more challenging questions to continue growing."
                      }</span>
                    </li>
                  ) : null}
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Create flashcards for concepts you consistently miss.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Spend at least 10-15 minutes daily reviewing {weaknesses.length > 0 ? weaknesses.map(w => w.topic).join(", ") : "challenging topics"}.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Consider using different learning methods such as visual diagrams, verbal explanations, or practical applications.</span>
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
