
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, SendHorizonal, User, BrainCircuit, ArrowDown, Lock, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

    try {
      // Add a "thinking" message
      const tempId = crypto.randomUUID();
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

      // Remove the thinking message
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
      // Remove the thinking message and add error
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="filter blur-sm pointer-events-none">
                <div className="space-y-4 mb-4 h-[40vh] overflow-hidden">
                  <div className="flex gap-3">
                    <div className="bg-primary p-2 rounded-full">
                      <BrainCircuit className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="rounded-lg p-3 max-w-[80%] bg-muted text-muted-foreground">
                      Hello! I'm your Quizora Assistant. How can I help you with your learning today?
                    </div>
                  </div>
                  <div className="flex gap-3 flex-row-reverse">
                    <div className="bg-accent p-2 rounded-full">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="rounded-lg p-3 max-w-[80%] bg-primary text-primary-foreground">
                      Can you explain the concept of machine learning?
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="bg-primary p-2 rounded-full">
                      <BrainCircuit className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="rounded-lg p-3 max-w-[80%] bg-muted text-muted-foreground">
                      Machine learning is a branch of artificial intelligence that allows systems to learn and improve from experience...
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-md">
                <div className="bg-amber-500/10 p-4 rounded-full mb-4">
                  <Lock className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="text-xl font-medium mb-2">Premium Feature</h3>
                <p className="text-center text-muted-foreground mb-6 max-w-md">
                  Quizora Assistant is available exclusively for premium subscribers. Upgrade now to get personalized help with your studies!
                </p>
                <Button onClick={handleUpgradeToPremium} className="bg-gradient-to-r from-amber-500 to-orange-600">
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade to Premium
                </Button>
              </div>
            </motion.div>
          ) : (
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
              ) : (
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
          )}
        </CardContent>

        <CardFooter>
          <form onSubmit={handleSubmit} className="w-full flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isPremium ? "Ask about any subject..." : "Upgrade to premium to use Quizora Assistant"}
              className="flex-1"
              disabled={isLoading || !isPremium}
            />
            <Button type="submit" disabled={isLoading || !input.trim() || !isPremium}>
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <SendHorizonal className="h-5 w-5" />
              )}
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
