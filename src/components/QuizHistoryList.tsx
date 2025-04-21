
import { motion } from "framer-motion";
import { QuizHistoryListItem } from "./QuizHistoryListItem";
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
  history: QuizHistoryEntry[];
  itemVariants: any;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onView: (entry: QuizHistoryEntry) => void;
}

export function QuizHistoryList({ history, itemVariants, onDelete, onView }: Props) {
  return (
    <div className="space-y-4">
      {history.map((entry) => (
        <QuizHistoryListItem
          key={entry.id}
          entry={entry}
          onDelete={onDelete}
          onView={onView}
          variants={itemVariants}
        />
      ))}
    </div>
  );
}
