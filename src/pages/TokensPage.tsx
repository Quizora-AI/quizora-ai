
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Gift, Star, Share2, Video } from "lucide-react";
import { useTokens } from "@/hooks/useTokens";

export default function TokensPage() {
  const {
    balance,
    loading,
    claimDailyReward,
    markAppRated,
    hasRatedApp,
    lastDailyReward,
    showSuccess,
    showError
  } = useTokens();

  const handleDailyReward = async () => {
    const success = await claimDailyReward();
    if (success) {
      showSuccess("Daily reward claimed! +5 tokens");
    } else {
      showError("You already claimed your daily reward");
    }
  };

  const handleRateApp = async () => {
    if (hasRatedApp) {
      showError("You've already received tokens for rating the app");
      return;
    }

    // Open Play Store
    window.open('market://details?id=your.app.package', '_blank');
    
    const success = await markAppRated();
    if (success) {
      showSuccess("Thank you for rating! +5 tokens");
    }
  };

  const handleWatchAd = async () => {
    if (!(window as any).cordova?.plugins?.admob) {
      showError("Ad service not available");
      return;
    }

    try {
      // Show rewarded ad
      (window as any).cordova.plugins.admob.rewarded.show();
      showSuccess("Thank you for watching! +1 token");
    } catch (error) {
      console.error('Error showing ad:', error);
      showError("Failed to load ad. Please try again.");
    }
  };

  const canClaimDaily = !lastDailyReward || 
    (new Date().getTime() - new Date(lastDailyReward).getTime()) >= 24 * 60 * 60 * 1000;

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Coins className="h-8 w-8 text-amber-500" />
          Token Balance
        </h1>
        <p className="text-4xl font-bold text-amber-500">{loading ? "..." : balance}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Daily Reward
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleDailyReward} 
              disabled={!canClaimDaily || loading}
              className="w-full"
            >
              Claim 5 Tokens
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Rate App
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleRateApp}
              disabled={hasRatedApp || loading}
              className="w-full"
            >
              Rate for 5 Tokens
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-blue-500" />
              Watch Ad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleWatchAd}
              disabled={loading}
              className="w-full"
            >
              Watch for 1 Token
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-green-500" />
              Refer Friends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => {
                // TODO: Implement referral sharing
                showError("Referral system coming soon!");
              }}
              disabled={loading}
              className="w-full"
            >
              Get 10 Tokens per Referral
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
