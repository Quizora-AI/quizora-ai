import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Crown } from "lucide-react";
import { CardFooter } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BillingManager } from "./BillingManager";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface PremiumPanelProps {
  isPremium: boolean;
  settings: any;
  activatePremium: (tier: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { when: "beforeChildren", staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function PremiumPanel({ isPremium, settings, activatePremium }: PremiumPanelProps) {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  
  // Get current user
  useState(() => {
    async function getUserId() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
        }
      } catch (error) {
        console.error("Error getting user:", error);
      }
    }
    
    getUserId();
  });
  
  const handlePurchaseComplete = (productId: string) => {
    // Activate premium based on the product purchased
    const tier = productId.includes('yearly') ? 'yearly' : 'monthly';
    activatePremium(tier);
    
    toast({
      title: "Premium Activated",
      description: `Your ${tier} subscription is now active.`,
    });
  };
  
  return (
    <motion.div variants={containerVariants} className="space-y-8">
      <motion.div variants={itemVariants} className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent inline-flex items-center gap-2">
          <Crown className="h-6 w-6 text-amber-500" />
          Quizora AI Premium
        </h2>
        <p className="text-muted-foreground mt-2">
          Unlock the full potential of your learning with Quizora AI Premium
        </p>
      </motion.div>
      
      {isPremium ? (
        <motion.div variants={itemVariants} className="bg-gradient-to-r from-amber-500/20 to-orange-600/20 p-6 rounded-lg border border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/20 p-2 rounded-full">
              <CheckCircle className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h3 className="font-medium text-lg">Premium Active</h3>
              <p className="text-sm text-muted-foreground">
                You're enjoying all premium features of Quizora AI
              </p>
            </div>
          </div>
          {settings.expiryDate && (
            <div className="mt-4 text-sm">
              <p className="text-muted-foreground">
                Your {settings.premiumTier} subscription is active until {new Date(settings.expiryDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div variants={itemVariants}>
          <BillingManager
            userId={userId}
            isPremium={isPremium}
            onPurchaseComplete={handlePurchaseComplete}
          />
        </motion.div>
      )}
      
      <motion.div variants={itemVariants}>
        <div className="rounded-lg bg-muted p-4">
          <h3 className="text-lg font-medium mb-2">Free vs Premium</h3>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="font-medium">Feature</div>
            <div className="font-medium">Free</div>
            <div className="font-medium">Premium</div>
            <div>Quizzes</div>
            <div className="text-muted-foreground">2 free, then tokens</div>
            <div className="text-green-600">Unlimited</div>
            <div>Flashcards</div>
            <div className="text-muted-foreground">2 free, then tokens</div>
            <div className="text-green-600">Unlimited</div>
            <div>Token System</div>
            <div className="text-muted-foreground">Required</div>
            <div className="text-green-600">Not needed</div>
            <div>Ads</div>
            <div className="text-muted-foreground">Yes</div>
            <div className="text-green-600">No</div>
            <div>Questions per quiz</div>
            <div className="text-muted-foreground">10 max</div>
            <div className="text-green-600">Up to 50</div>
            <div>Flashcards per set</div>
            <div className="text-muted-foreground">10 max</div>
            <div className="text-green-600">Up to 30</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
