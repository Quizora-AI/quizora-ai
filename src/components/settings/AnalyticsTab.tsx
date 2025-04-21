
// AnalyticsTab for premium analytics. Renders quiz stats and suggestions.
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Lock, BarChart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AnalyticsTab({ settings, quizHistory, navigateToQuiz }: any) {
  const isPremium = settings.isPremium;
  return (
    <motion.div className="space-y-6">
      {isPremium ? (
        <>
          <motion.div className="text-center">
            <h2 className="text-xl font-bold mb-2">Performance Overview</h2>
            <p className="text-muted-foreground text-sm">
              Track your learning progress and identify areas for improvement
            </p>
          </motion.div>
          {quizHistory.length > 0 ? (
            <>
              <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        {quizHistory.reduce((avg: number, quiz: any) => avg + quiz.score, 0) / quizHistory.length || 0}%
                      </div>
                      <p className="text-sm text-muted-foreground">Average Score</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold">
                        {quizHistory.reduce((total: number, quiz: any) => total + quiz.questionsCount, 0)}
                      </div>
                      <p className="text-sm text-muted-foreground">Total Questions Answered</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div>
                <Card>
                  <CardHeader>
                    <CardTitle>Improvement Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Continue practicing with different topics to broaden your knowledge.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Focus on reviewing questions you got wrong to strengthen weak areas.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Try gradually increasing the difficulty level as you improve.</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          ) : (
            <motion.div className="text-center p-8">
              <p className="text-muted-foreground">
                No quiz history found. Take some quizzes to see your analytics!
              </p>
              <Button onClick={navigateToQuiz} variant="outline" className="mt-4">
                Create Your First Quiz
              </Button>
            </motion.div>
          )}
        </>
      ) : (
        <motion.div className="text-center p-8">
          <div className="flex justify-center mb-4">
            <Lock className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">Premium Feature</h3>
          <p className="text-muted-foreground mb-6">
            Advanced analytics is a premium feature. Upgrade to access detailed insights and performance tracking.
          </p>
          <Button onClick={navigateToQuiz}>
            <BarChart className="mr-2 h-4 w-4" />
            Go Premium
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
