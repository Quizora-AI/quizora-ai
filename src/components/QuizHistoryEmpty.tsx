
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onCreateQuiz: () => void;
  itemVariants: any;
}

export function QuizHistoryEmpty({ onCreateQuiz, itemVariants }: Props) {
  return (
    <motion.div
      variants={itemVariants}
      className="text-center py-16 text-muted-foreground"
    >
      <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-40" />
      <h3 className="text-xl font-medium mb-2">No quiz history yet</h3>
      <p className="mb-6">Complete your first quiz to see your history here</p>
      <Button onClick={onCreateQuiz}>Create New Quiz</Button>
    </motion.div>
  );
}
