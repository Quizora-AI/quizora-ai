
import { BrainCircuit, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";

export function AssistantEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="text-center py-8 text-muted-foreground"
    >
      <BrainCircuit className="mx-auto h-12 w-12 mb-4 opacity-40" />
      <h3 className="text-xl font-medium mb-2">No messages yet</h3>
      <p>Start a conversation with your Quizora Assistant</p>
      <div className="mt-4 flex justify-center">
        <motion.div
          animate={{
            y: [0, 5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <ArrowDown className="h-5 w-5 opacity-60" />
        </motion.div>
      </div>
    </motion.div>
  );
}
