
import { Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AssistantPremiumOverlayProps {
  onUpgrade: () => void;
}

export function AssistantPremiumOverlay({ onUpgrade }: AssistantPremiumOverlayProps) {
  return (
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
  );
}
