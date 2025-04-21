
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AnalyticsPanelProps {
  isPremium: boolean;
  quizHistory: Array<{ score: number; questionsCount: number; }>;
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
                <CardTitle>Improvement Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2"><span>✓</span><span>Continue practicing with different topics to broaden your knowledge.</span></li>
                  <li className="flex items-start gap-2"><span>✓</span><span>Focus on reviewing questions you got wrong to strengthen weak areas.</span></li>
                  <li className="flex items-start gap-2"><span>✓</span><span>Try gradually increasing the difficulty level as you improve.</span></li>
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
