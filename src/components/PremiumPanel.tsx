
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Crown } from "lucide-react";
import { CardFooter } from "@/components/ui/card";

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
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-amber-500/30 hover:border-amber-500/50 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Monthly</span>
                <Badge className="bg-amber-500">Popular</Badge>
              </CardTitle>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">$2.49</span>
                <span className="text-muted-foreground ml-1">/ month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2"><span>✓</span><span>Unlimited quizzes</span></li>
                <li className="flex items-center gap-2"><span>✓</span><span>Up to 50 questions per quiz</span></li>
                <li className="flex items-center gap-2"><span>✓</span><span>Custom time per question</span></li>
                <li className="flex items-center gap-2"><span>✓</span><span>Detailed analytics</span></li>
                <li className="flex items-center gap-2"><span>✓</span><span>Quizora AI Assistant</span></li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => activatePremium('monthly')}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
              >
                Subscribe Monthly
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="border-amber-500/30 hover:border-amber-500/50 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Annual</span>
                <Badge className="bg-green-600">Save 50%</Badge>
              </CardTitle>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">$15.00</span>
                <span className="text-muted-foreground ml-1">/ year</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2"><span>✓</span><span>All monthly features</span></li>
                <li className="flex items-center gap-2"><span>✓</span><span>50% discount vs. monthly</span></li>
                <li className="flex items-center gap-2"><span>✓</span><span>Priority support</span></li>
                <li className="flex items-center gap-2"><span>✓</span><span>Early access to new features</span></li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => activatePremium('yearly')}
                className="w-full"
                variant="outline"
              >
                Subscribe Yearly
              </Button>
            </CardFooter>
          </Card>
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
            <div className="text-muted-foreground">2 max</div>
            <div className="text-green-600">Unlimited</div>
            <div>Questions per quiz</div>
            <div className="text-muted-foreground">10 max</div>
            <div className="text-green-600">Up to 50</div>
            <div>Time per question</div>
            <div className="text-muted-foreground">Fixed 30s</div>
            <div className="text-green-600">Adjustable</div>
            <div>Analytics</div>
            <div className="text-muted-foreground">Basic</div>
            <div className="text-green-600">Advanced</div>
            <div>AI Assistant</div>
            <div className="text-muted-foreground">Not available</div>
            <div className="text-green-600">Full access</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
