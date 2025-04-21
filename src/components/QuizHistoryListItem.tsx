
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Question } from "@/components/FileUpload";

interface QuizHistoryEntry {
  id: string;
  date: string;
  title: string;
  questionsCount: number;
  score: number;
  questions: Question[];
  attempts?: number;
}

interface Props {
  entry: QuizHistoryEntry;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onView: (entry: QuizHistoryEntry) => void;
  variants: any;
}

export function QuizHistoryListItem({ entry, onDelete, onView, variants }: Props) {
  return (
    <motion.div
      key={entry.id}
      variants={variants}
      className="bg-background/60 rounded-lg p-4 border border-border/50 hover:border-primary/30 transition-all duration-300 group cursor-pointer"
      onClick={() => onView(entry)}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-lg">{entry.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              entry.score >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
              entry.score >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
              'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
            }`}>
              {entry.score}%
            </span>
            {entry.attempts && entry.attempts > 1 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                {entry.attempts} attempts
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {format(new Date(entry.date), "MMM d, yyyy 'at' h:mm a")} • 
            {entry.questionsCount} questions
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost" 
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => onDelete(entry.id, e)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
          <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </motion.div>
  );
}
