
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export function useTokens() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [isPremium, setIsPremium] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('token_balance, isPremium')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setTokenBalance(profile.token_balance);
          setIsPremium(profile.isPremium === true);
        }
      }
    };

    fetchUserStatus();
  }, []);

  const checkTokenBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('token_balance, free_quizzes_used, free_flashcards_used, isPremium, has_rated_app, last_daily_reward')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      
      if (profile) {
        setTokenBalance(profile.token_balance);
        setIsPremium(profile.isPremium === true);
      }
      
      return profile;
    } catch (err) {
      console.error("Error checking token balance:", err);
      setError(err instanceof Error ? err.message : "Failed to check token balance");
      return null;
    }
  };

  const useToken = async (amount: number, type: 'quiz' | 'flashcard') => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: profile } = await supabase
        .from('profiles')
        .select('token_balance, free_quizzes_used, free_flashcards_used, isPremium')
        .eq('id', user.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      // If user is premium, allow the action without using tokens
      if (profile.isPremium) {
        return true;
      }

      // Check free usage first
      if (type === 'quiz' && profile.free_quizzes_used < 2) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ free_quizzes_used: profile.free_quizzes_used + 1 })
          .eq('id', user.id);

        if (updateError) throw updateError;
        return true;
      }

      if (type === 'flashcard' && profile.free_flashcards_used < 2) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ free_flashcards_used: profile.free_flashcards_used + 1 })
          .eq('id', user.id);

        if (updateError) throw updateError;
        return true;
      }

      // If no free uses left, check token balance
      if (profile.token_balance < amount) {
        toast({
          title: "Insufficient tokens",
          description: `You need ${amount} tokens to perform this action. Earn more tokens or upgrade to premium for unlimited access.`,
          variant: "destructive"
        });
        return false;
      }

      // Deduct tokens and record transaction
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ token_balance: profile.token_balance - amount })
        .eq('id', user.id);

      if (updateError) throw updateError;
      setTokenBalance(profile.token_balance - amount);

      // Record the transaction
      const { error: transactionError } = await supabase
        .from('token_transactions')
        .insert({
          user_id: user.id,
          amount: -amount,
          transaction_type: type,
          description: `Used ${amount} tokens for ${type} generation`
        });

      if (transactionError) throw transactionError;

      toast({
        title: `${amount} Tokens Used`,
        description: `You have ${profile.token_balance - amount} tokens remaining.`,
      });

      return true;
    } catch (err) {
      console.error("Error using token:", err);
      setError(err instanceof Error ? err.message : "Failed to use token");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addTokens = async (amount: number, reason: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: profile } = await supabase
        .from('profiles')
        .select('token_balance, isPremium')
        .eq('id', user.id)
        .single();

      if (!profile) throw new Error("Profile not found");
      
      // Don't add tokens if user is premium
      if (profile.isPremium) {
        return false;
      }

      // Add tokens
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ token_balance: profile.token_balance + amount })
        .eq('id', user.id);

      if (updateError) throw updateError;
      setTokenBalance(profile.token_balance + amount);

      // Record the transaction
      const { error: transactionError } = await supabase
        .from('token_transactions')
        .insert({
          user_id: user.id,
          amount: amount,
          transaction_type: 'reward',
          description: reason
        });

      if (transactionError) throw transactionError;

      toast({
        title: `${amount} Tokens Earned!`,
        description: `Reason: ${reason}. You now have ${profile.token_balance + amount} tokens.`,
      });

      return true;
    } catch (err) {
      console.error("Error adding tokens:", err);
      setError(err instanceof Error ? err.message : "Failed to add tokens");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const claimDailyReward = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: profile } = await supabase
        .from('profiles')
        .select('last_daily_reward, isPremium')
        .eq('id', user.id)
        .single();

      if (!profile) throw new Error("Profile not found");
      
      // Don't give rewards to premium users
      if (profile.isPremium) {
        return { success: false, reason: "Premium users don't need tokens" };
      }

      const now = new Date();
      if (profile.last_daily_reward) {
        const lastReward = new Date(profile.last_daily_reward);
        const timeDiff = now.getTime() - lastReward.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          return { 
            success: false, 
            reason: "Daily reward already claimed",
            hoursRemaining: Math.ceil(24 - hoursDiff) 
          };
        }
      }

      // Update last_daily_reward timestamp
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ last_daily_reward: now.toISOString() })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Add the tokens
      const success = await addTokens(5, "Daily app visit reward");
      return { success, reason: "Daily reward claimed" };
      
    } catch (err) {
      console.error("Error claiming daily reward:", err);
      return { success: false, reason: "Failed to claim daily reward" };
    }
  };

  const markAppRated = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: profile } = await supabase
        .from('profiles')
        .select('has_rated_app, isPremium')
        .eq('id', user.id)
        .single();

      if (!profile) throw new Error("Profile not found");
      
      // Premium users don't get tokens
      if (profile.isPremium) {
        return { success: false };
      }

      if (profile.has_rated_app) {
        return { success: false, reason: "App already rated" };
      }

      // Mark as rated
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ has_rated_app: true })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Add the tokens
      const success = await addTokens(5, "App rating reward");
      return { success, reason: "Rating reward claimed" };
      
    } catch (err) {
      console.error("Error marking app as rated:", err);
      return { success: false, reason: "Failed to process rating reward" };
    }
  };

  const createReferralCode = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Check if user already has a referral code
      const { data: existingReferrals } = await supabase
        .from('referrals')
        .select('referral_code')
        .eq('referrer_id', user.id)
        .limit(1);

      if (existingReferrals && existingReferrals.length > 0) {
        // Return existing code
        return { success: true, code: existingReferrals[0].referral_code };
      }

      // Create new referral code
      const referralCode = uuidv4().substring(0, 8);
      const { error } = await supabase
        .from('referrals')
        .insert({
          referrer_id: user.id,
          referral_code: referralCode
        });

      if (error) throw error;

      return { success: true, code: referralCode };
      
    } catch (err) {
      console.error("Error creating referral code:", err);
      return { success: false, reason: "Failed to create referral code" };
    }
  };

  const checkReferralCode = async (code: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Check if this is a valid referral code
      const { data: referral } = await supabase
        .from('referrals')
        .select('*')
        .eq('referral_code', code)
        .neq('referrer_id', user.id) // Can't refer yourself
        .single();

      if (!referral) {
        return { success: false, reason: "Invalid referral code" };
      }

      // Check if this user has already been referred
      const { data: existing } = await supabase
        .from('referrals')
        .select('*')
        .eq('referred_user_id', user.id)
        .limit(1);

      if (existing && existing.length > 0) {
        return { success: false, reason: "You have already used a referral code" };
      }

      // Mark the referral as complete
      const { error } = await supabase
        .from('referrals')
        .update({
          referred_user_id: user.id,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', referral.id);

      if (error) throw error;

      // Reward the referrer
      // (We need to do this in a secure backend function in a real app)
      const { error: rewardError } = await supabase
        .from('token_transactions')
        .insert({
          user_id: referral.referrer_id,
          amount: 10,
          transaction_type: 'referral',
          description: 'Successful referral bonus'
        });

      if (rewardError) throw rewardError;

      // Update the referrer's token balance
      const { data: referrerProfile } = await supabase
        .from('profiles')
        .select('token_balance')
        .eq('id', referral.referrer_id)
        .single();

      if (referrerProfile) {
        await supabase
          .from('profiles')
          .update({ token_balance: referrerProfile.token_balance + 10 })
          .eq('id', referral.referrer_id);
      }

      // Give the new user some tokens too
      await addTokens(5, "Using a referral code");

      return { success: true };
      
    } catch (err) {
      console.error("Error checking referral code:", err);
      return { success: false, reason: "Failed to process referral code" };
    }
  };

  return {
    checkTokenBalance,
    useToken,
    addTokens,
    claimDailyReward,
    markAppRated,
    createReferralCode,
    checkReferralCode,
    tokenBalance,
    isPremium,
    loading,
    error
  };
}
