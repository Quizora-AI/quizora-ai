
import { motion } from "framer-motion";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { History } from "lucide-react";

export function QuizHistoryHeader() {
  return (
    <CardHeader className="pb-4">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="flex items-center gap-3"
      >
        <div className="bg-primary/10 p-3 rounded-full">
          <History className="h-6 w-6 text-primary" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
            Quiz History
          </CardTitle>
          <CardDescription>
            Review your past quiz performances
          </CardDescription>
        </div>
      </motion.div>
    </CardHeader>
  );
}
