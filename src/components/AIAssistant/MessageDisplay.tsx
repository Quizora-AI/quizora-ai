
import { AnimatePresence, motion } from "framer-motion";
import { BrainCircuit, User, ArrowDown } from "lucide-react";
import { RefObject } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface MessageDisplayProps {
  messages: Message[];
  isPremium: boolean;
  messagesEndRef: RefObject<HTMLDivElement>;
}

export function MessageDisplay({ messages, isPremium, messagesEndRef }: MessageDisplayProps) {
  if (!isPremium) {
    // The main AIAssistant will render the premium lock/upsell instead
    return null;
  }
  return (
    <div className="space-y-4 mb-4 max-h-[50vh] overflow-y-auto p-1">
      {messages.length === 0 ? (
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
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ArrowDown className="h-5 w-5 opacity-60" />
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex gap-3 ${message.role === "assistant" ? "" : "flex-row-reverse"}`}
            >
              <div
                className={`rounded-full p-2 ${
                  message.role === "assistant"
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent text-accent-foreground"
                }`}
              >
                {message.role === "assistant" ? (
                  <BrainCircuit className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <div
                className={`rounded-lg p-3 max-w-[80%] ${
                  message.role === "assistant"
                    ? "bg-muted text-muted-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {message.content === "Thinking..." ? (
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 bg-current rounded-full animate-pulse"></div>
                    <div className="h-2 w-2 bg-current rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                    <div className="h-2 w-2 bg-current rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                ) : (
                  message.content
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
