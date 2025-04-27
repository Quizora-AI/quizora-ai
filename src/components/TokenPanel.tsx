
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTokens } from "@/hooks/useTokens";
import { Coins, Gift, Award, Share2, Star, RefreshCw, CheckCircle, Copy } from "lucide-react";
import { BannerAd, useInterstitialAd } from "./GoogleAds";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// Social sharing options
interface ShareOption {
  name: string;
  icon: string;
  color: string;
  action: (code: string) => void;
}

export function TokenPanel() {
  const { toast } = useToast();
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [myReferralCode, setMyReferralCode] = useState("");
  const [referralError, setReferralError] = useState("");
  const [dailyRewardStatus, setDailyRewardStatus] = useState<{ claimed: boolean, hoursRemaining?: number }>({ claimed: false });
  const [hasRated, setHasRated] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const { 
    tokenBalance, 
    loading, 
    isPremium,
    checkTokenBalance, 
    addTokens, 
    claimDailyReward, 
    markAppRated, 
    createReferralCode,
    checkReferralCode 
  } = useTokens();

  const shareOptions: ShareOption[] = [
    {
      name: "WhatsApp",
      icon: "🟢",
      color: "bg-green-500",
      action: (code) => {
        const text = encodeURIComponent(`Try Quizora AI app! Use my referral code ${code} to get 5 free tokens: https://play.google.com/store/apps/details?id=com.quizora.ai`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
      }
    },
    {
      name: "Telegram",
      icon: "📘",
      color: "bg-blue-500",
      action: (code) => {
        const text = encodeURIComponent(`Try Quizora AI app! Use my referral code ${code} to get 5 free tokens: https://play.google.com/store/apps/details?id=com.quizora.ai`);
        window.open(`https://t.me/share/url?url=https://play.google.com/store/apps/details?id=com.quizora.ai&text=${text}`, '_blank');
      }
    },
    {
      name: "Instagram",
      icon: "📸",
      color: "bg-purple-500",
      action: (code) => {
        navigator.clipboard.writeText(`Try Quizora AI app! Use my referral code ${code} to get 5 free tokens: https://play.google.com/store/apps/details?id=com.quizora.ai`);
        toast({
          title: "Caption Copied",
          description: "Instagram sharing text copied to clipboard. Paste in Instagram.",
        });
      }
    },
    {
      name: "Email",
      icon: "📧",
      color: "bg-gray-500",
      action: (code) => {
        const subject = encodeURIComponent("Try Quizora AI app!");
        const body = encodeURIComponent(`Use my referral code ${code} to get 5 free tokens: https://play.google.com/store/apps/details?id=com.quizora.ai`);
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
      }
    }
  ];

  const { showInterstitial } = useInterstitialAd({
    adUnitId: "ca-app-pub-8270549953677995/1430802017",
    onAdDismissed: () => {
      console.log("Rewarded ad dismissed");
    }
  });

  useEffect(() => {
    const checkUserStatus = async () => {
      const profile = await checkTokenBalance();
      if (profile) {
        setHasRated(profile.has_rated_app);
        
        // Check daily reward status
        if (profile.last_daily_reward) {
          const lastReward = new Date(profile.last_daily_reward);
          const now = new Date();
          const timeDiff = now.getTime() - lastReward.getTime();
          const hoursDiff = timeDiff / (1000 * 60 * 60);
          
          if (hoursDiff < 24) {
            setDailyRewardStatus({ 
              claimed: true, 
              hoursRemaining: Math.ceil(24 - hoursDiff) 
            });
          } else {
            setDailyRewardStatus({ claimed: false });
          }
        } else {
          setDailyRewardStatus({ claimed: false });
        }
      }
    };
    
    checkUserStatus();
  }, [checkTokenBalance]);

  // If premium, don't show this component
  if (isPremium) {
    return null;
  }

  const handleWatchAd = async () => {
    setIsAdLoading(true);
    
    // Check if we're on mobile with Cordova
    if (typeof window !== 'undefined' && 'cordova' in window && 
        'plugins' in (window as any).cordova && 
        'admob' in (window as any).cordova.plugins) {
      
      try {
        const shown = showInterstitial();
        if (shown) {
          setTimeout(async () => {
            // Add token only after ad is completed
            await addTokens(1, "Watched a rewarded ad");
            setIsAdLoading(false);
          }, 3000); // Wait for ad to complete
        } else {
          setIsAdLoading(false);
          toast({
            title: "Ad Not Available",
            description: "Unable to load ad right now. Please try again later.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error showing rewarded ad:", error);
        setIsAdLoading(false);
        toast({
          title: "Ad Error",
          description: "There was an error displaying the ad. Please try again later.",
          variant: "destructive",
        });
      }
    } else {
      // Web fallback for testing
      setTimeout(async () => {
        await addTokens(1, "Watched a rewarded ad (simulated)");
        setIsAdLoading(false);
        toast({
          title: "Token Earned!",
          description: "You received 1 token for watching an ad.",
        });
      }, 2000);
    }
  };

  const handleRateApp = async () => {
    if (hasRated) {
      toast({
        title: "Already Rated",
        description: "You've already received tokens for rating the app. Thank you!",
      });
      return;
    }
    
    // Open Play Store URL
    const playStoreUrl = "https://play.google.com/store/apps/details?id=com.quizora.ai";
    
    if (typeof window !== 'undefined') {
      // Open in new tab/window
      window.open(playStoreUrl, '_blank');
      
      // Mark as rated and award tokens
      const result = await markAppRated();
      if (result.success) {
        setHasRated(true);
        toast({
          title: "Thanks for Rating!",
          description: "You've received 5 tokens for rating our app.",
        });
      }
    }
  };

  const handleDailyReward = async () => {
    if (dailyRewardStatus.claimed) {
      toast({
        title: "Already Claimed",
        description: `You've already claimed your daily reward. Come back in ${dailyRewardStatus.hoursRemaining} hours.`,
      });
      return;
    }
    
    const result = await claimDailyReward();
    if (result.success) {
      toast({
        title: "Daily Reward Claimed!",
        description: "You've received 5 tokens for visiting today.",
      });
      setDailyRewardStatus({ claimed: true, hoursRemaining: 24 });
    } else {
      if (result.hoursRemaining) {
        setDailyRewardStatus({ claimed: true, hoursRemaining: result.hoursRemaining });
        toast({
          title: "Already Claimed",
          description: `You've already claimed your daily reward. Come back in ${result.hoursRemaining} hours.`,
        });
      } else {
        toast({
          title: "Reward Error",
          description: result.reason || "Couldn't claim reward. Please try again later.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCreateReferral = async () => {
    const result = await createReferralCode();
    if (result.success) {
      setMyReferralCode(result.code);
      setShowShareDialog(true);
      toast({
        title: "Referral Code Created!",
        description: "Share this code with friends. You'll get 10 tokens when they use it.",
      });
    }
  };
  
  const handleCheckReferral = async () => {
    if (!referralCode.trim()) {
      setReferralError("Please enter a referral code");
      return;
    }
    
    setReferralError("");
    const result = await checkReferralCode(referralCode);
    
    if (result.success) {
      toast({
        title: "Referral Successful!",
        description: "You've received 5 tokens for using a referral code.",
      });
      setReferralCode("");
    } else {
      setReferralError(result.reason || "Invalid referral code");
    }
  };
  
  const handleCopyReferralCode = () => {
    if (myReferralCode) {
      navigator.clipboard.writeText(myReferralCode);
      toast({
        title: "Copied to Clipboard",
        description: "Your referral code has been copied to clipboard.",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="bg-card shadow-lg border border-primary/10">
        <CardHeader>
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="flex items-center gap-3"
          >
            <div className="bg-primary/10 p-3 rounded-full">
              <Coins className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold">Token Wallet</CardTitle>
              <CardDescription>
                Earn and spend tokens to generate quizzes and flashcards
              </CardDescription>
            </div>
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
              <Coins className="h-5 w-5" />
              <span className="font-bold text-lg">{tokenBalance}</span>
            </div>
          </motion.div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Token Rules</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="bg-primary/10 p-1 rounded-full">
                  <span className="text-xs font-bold text-primary">-3</span>
                </div>
                <span>Generate a new quiz</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="bg-primary/10 p-1 rounded-full">
                  <span className="text-xs font-bold text-primary">-2</span>
                </div>
                <span>Generate flashcards</span>
              </li>
            </ul>
          </div>
          
          <Tabs defaultValue="earn">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="earn">Earn Tokens</TabsTrigger>
              <TabsTrigger value="refer">Referrals</TabsTrigger>
            </TabsList>
            <TabsContent value="earn" className="space-y-4">
              <div className="grid gap-4">
                <Button 
                  onClick={handleWatchAd} 
                  className="w-full flex justify-between items-center"
                  variant="outline"
                  disabled={isAdLoading}
                >
                  <div className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-primary" />
                    <span>{isAdLoading ? "Loading Ad..." : "Watch Ad"}</span>
                  </div>
                  <div className="bg-primary/10 px-2 py-1 rounded-full">
                    <span className="text-xs font-bold text-primary">+1</span>
                  </div>
                </Button>
                
                <Button 
                  onClick={handleRateApp} 
                  className="w-full flex justify-between items-center"
                  variant="outline"
                  disabled={hasRated}
                >
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" />
                    <span>Rate App</span>
                    {hasRated && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </div>
                  <div className="bg-primary/10 px-2 py-1 rounded-full">
                    <span className="text-xs font-bold text-primary">+5</span>
                  </div>
                </Button>
                
                <Button 
                  onClick={handleDailyReward} 
                  className="w-full flex justify-between items-center"
                  variant="outline"
                  disabled={dailyRewardStatus.claimed}
                >
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-blue-500" />
                    <span>
                      {dailyRewardStatus.claimed 
                        ? `Come back in ${dailyRewardStatus.hoursRemaining}h` 
                        : "Daily Reward"}
                    </span>
                    {dailyRewardStatus.claimed && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </div>
                  <div className="bg-primary/10 px-2 py-1 rounded-full">
                    <span className="text-xs font-bold text-primary">+5</span>
                  </div>
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground text-center pt-2">
                <p>Watch ads to earn tokens or upgrade to Premium for unlimited access</p>
              </div>
            </TabsContent>
            
            <TabsContent value="refer" className="space-y-4">
              {!myReferralCode ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Create a referral code to share with friends. When they use your code, you'll get 10 tokens!
                  </p>
                  <Button onClick={handleCreateReferral} className="w-full">
                    <Share2 className="h-4 w-4 mr-2" />
                    Create Referral Code
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Share this code with friends. You'll earn 10 tokens for each friend who uses it!
                  </p>
                  <div className="flex gap-2">
                    <Input value={myReferralCode} readOnly className="font-mono" />
                    <Button onClick={handleCopyReferralCode} variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button onClick={() => setShowShareDialog(true)} variant="default">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              )}
              
              <Separator />
              
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Have a referral code? Enter it here to get 5 free tokens:
                </p>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter referral code" 
                    value={referralCode}
                    onChange={(e) => {
                      setReferralCode(e.target.value);
                      setReferralError("");
                    }}
                  />
                  <Button onClick={handleCheckReferral}>Apply</Button>
                </div>
                {referralError && (
                  <p className="text-xs text-destructive">{referralError}</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="block bg-muted border-t p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-medium">Upgrade to Premium to get unlimited access</span>
            </div>
            <Button variant="default" size="sm" onClick={() => {
              window.location.href = '/settings';
            }}>
              Upgrade
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      <div className="mt-4">
        <BannerAd adUnitId="ca-app-pub-8270549953677995/2218567244" />
      </div>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Referral Code</DialogTitle>
            <DialogDescription>
              Choose how you want to share your referral code with friends
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            {shareOptions.map((option) => (
              <Button 
                key={option.name}
                variant="outline" 
                className="flex-col h-24 py-6"
                onClick={() => {
                  option.action(myReferralCode);
                  setShowShareDialog(false);
                }}
              >
                <div className="text-2xl mb-2">{option.icon}</div>
                <div className="text-sm font-medium">{option.name}</div>
              </Button>
            ))}
          </div>
          <DialogFooter className="sm:justify-center">
            <Button 
              variant="ghost" 
              onClick={() => setShowShareDialog(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
