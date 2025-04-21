
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Props {
  itemVariants: any;
}

export function QuizHistoryWarning({ itemVariants }: Props) {
  const navigate = useNavigate();
  return (
    <motion.div
      variants={itemVariants}
      className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-center"
    >
      <p className="text-red-800 dark:text-red-300 font-medium">
        Free Quiz Limit Reached
      </p>
      <p className="text-sm text-red-700 dark:text-red-400 mb-2">
        You've reached the limit of 2 free quizzes. Upgrade to premium for unlimited quizzes!
      </p>
      <Button 
        size="sm" 
        variant="destructive"
        onClick={() => navigate('/settings?tab=premium')}
      >
        Upgrade to Premium
      </Button>
    </motion.div>
  );
}
