
import { AnimatePresence, motion } from "framer-motion";
import { BrainCircuit, User } from "lucide-react";
import { useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIAssistantChatProps {
  messages: Message[];
}

export function AIAssistantChat({ messages }: AIAssistantChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="space-y-4 mb-4 max-h-[50vh] overflow-y-auto p-1">
      <AnimatePresence>
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`flex gap-3 ${
              message.role === "assistant" ? "" : "flex-row-reverse"
            }`}
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
              {message.content}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );
}
