
// PremiumTab for handling premium subscription/upgrade display
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Crown, CreditCard, CheckCircle, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export function PremiumTab({ settings, activatePremium }: any) {
  return (
    <motion.div className="space-y-8">
      <motion.div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent inline-flex items-center gap-2">
          <Crown className="h-6 w-6 text-amber-500" />
          Quizora AI Premium
        </h2>
        <p className="text-muted-foreground mt-2">
          Unlock the full potential of your learning with Quizora AI Premium
        </p>
      </motion.div>
      {settings.isPremium ? (
        <motion.div className="bg-gradient-to-r from-amber-500/20 to-orange-600/20 p-6 rounded-lg border border-amber-500/30">
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
        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly card */}
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
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Unlimited quizzes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Up to 50 questions per quiz</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Custom time per question</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Detailed analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Quizora AI Assistant</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => activatePremium('monthly')}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Subscribe Monthly
              </Button>
            </CardFooter>
          </Card>
          {/* Yearly card */}
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
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>All monthly features</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>50% discount vs. monthly</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Early access to new features</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => activatePremium('yearly')}
                className="w-full"
                variant="outline"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Subscribe Yearly
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
      <motion.div>
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
