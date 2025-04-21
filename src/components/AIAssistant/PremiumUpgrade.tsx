
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Lock, Crown, BrainCircuit, User } from "lucide-react";

interface PremiumUpgradeProps {
  onUpgrade: () => void;
}

export function PremiumUpgrade({ onUpgrade }: PremiumUpgradeProps) {
  return (
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
        <Button onClick={onUpgrade} className="bg-gradient-to-r from-amber-500 to-orange-600">
          <Crown className="mr-2 h-4 w-4" />
          Upgrade to Premium
        </Button>
      </div>
    </motion.div>
  );
}
