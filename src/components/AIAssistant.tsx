import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, SendHorizonal, User, BrainCircuit, ArrowDown, Lock, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MessageDisplay } from "./AIAssistant/MessageDisplay";
import { AssistantInputForm } from "./AIAssistant/AssistantInputForm";
import { PremiumUpgrade } from "./AIAssistant/PremiumUpgrade";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [course, setCourse] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const savedMessages = localStorage.getItem("assistantMessages");
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error("Error loading saved messages:", error);
      }
    }
    if (!savedMessages) {
      const welcomeMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Hello! I'm your Quizora Assistant. How can I help you with your learning today?",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
    const userSettings = localStorage.getItem("userSettings");
    if (userSettings) {
      const settings = JSON.parse(userSettings);
      setIsPremium(settings.isPremium === true);
      if (settings.course) {
        setCourse(settings.course);
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("assistantMessages", JSON.stringify(messages));
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!isPremium) {
      navigate('/settings?tab=premium');
      toast({
        title: "Premium Feature",
        description: "Upgrade to premium to access Quizora Assistant",
      });
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const tempId = crypto.randomUUID();

    try {
      setMessages(prev => [...prev, {
        id: tempId,
        role: "assistant",
        content: "Thinking...",
        timestamp: new Date(),
      }]);
      
      console.log("Calling AI assistant edge function with:", {
        message: input.trim(),
        course: course || "",
        context: messages.slice(-4).map(m => ({
          role: m.role,
          content: m.content
        }))
      });

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          message: input.trim(),
          course: course || "",
          context: messages.slice(-4).map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Edge function error:", response.status, errorData);
        throw new Error(`Error from assistant service: ${response.status}`);
      }

      const data = await response.json();
      console.log("AI assistant response:", data);

      setMessages(prev => prev.filter(m => m.id !== tempId));

      if (data.error) {
        throw new Error(data.error);
      }

      const aiResponse: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data?.response || "I'm sorry, I couldn't process your request at this time.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
      
      toast({
        title: "Assistant Response",
        description: "Got an answer to your question",
      });
    } catch (error:any) {
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== tempId);
        return [...filtered, {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "I'm sorry, I encountered an error. Please try again in a moment.",
          timestamp: new Date(),
        }];
      });
      
      console.error("AI Assistant error:", error);
      
      toast({
        title: "Error",
        description: error.message || "Failed to get response from the assistant",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const handleUpgradeToPremium = () => {
    navigate('/settings?tab=premium');
  };

  const clearConversation = () => {
    const welcomeMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Hello! I'm your Quizora Assistant. How can I help you with your learning today?",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    localStorage.setItem("assistantMessages", JSON.stringify([welcomeMessage]));
    toast({
      title: "Conversation cleared",
      description: "Starting a new conversation",
    });
  };

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="bg-card/50 backdrop-blur-sm border border-primary/10 shadow-lg overflow-hidden">
        <CardHeader className="pb-4">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-full">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                  Quizora Assistant
                </CardTitle>
                <CardDescription>
                  Ask questions about <span className="font-semibold">any course or subject</span> and get real-time, personalized study support.
                </CardDescription>
              </div>
            </div>
            {isPremium && messages.length > 1 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearConversation}
              >
                Clear chat
              </Button>
            )}
          </motion.div>
        </CardHeader>

        <CardContent>
          {!isPremium ? (
            <PremiumUpgrade onUpgrade={handleUpgradeToPremium} />
          ) : (
            <MessageDisplay
              messages={messages}
              isPremium={isPremium}
              messagesEndRef={messagesEndRef}
            />
          )}
        </CardContent>

        <CardFooter>
          <AssistantInputForm
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            isPremium={isPremium}
          />
        </CardFooter>
      </Card>
    </motion.div>
  );
}
