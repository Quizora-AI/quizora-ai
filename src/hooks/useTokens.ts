
import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface TokenState {
  balance: number;
  loading: boolean;
  error: string | null;
  lastDailyReward: Date | null;
  hasRatedApp: boolean;
  updateBalance: (amount: number, transactionType: string, description?: string) => Promise<boolean>;
  claimDailyReward: () => Promise<boolean>;
  markAppRated: () => Promise<boolean>;
  refreshTokenBalance: () => Promise<void>;
}

export const useTokenStore = create<TokenState>((set, get) => ({
  balance: 0,
  loading: false,
  error: null,
  lastDailyReward: null,
  hasRatedApp: false,

  updateBalance: async (amount: number, transactionType: string, description?: string) => {
    try {
      set({ loading: true, error: null });
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Using rpc with typed parameters
      const { error } = await supabase.rpc('update_token_balance', {
        p_user_id: user.id,
        p_amount: amount,
        p_transaction_type: transactionType,
        p_description: description || ''
      });

      if (error) throw error;

      await get().refreshTokenBalance();
      return true;
    } catch (error) {
      console.error('Error updating token balance:', error);
      set({ error: error.message });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  claimDailyReward: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    try {
      set({ loading: true, error: null });
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('last_daily_reward')
        .eq('id', user.id)
        .single();

      if (profile?.last_daily_reward) {
        const lastReward = new Date(profile.last_daily_reward);
        const now = new Date();
        const hoursSinceLastReward = (now.getTime() - lastReward.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceLastReward < 24) {
          set({ error: "Daily reward already claimed" });
          return false;
        }
      }

      const success = await get().updateBalance(5, 'daily_reward', 'Daily login reward');
      if (success) {
        await supabase
          .from('profiles')
          .update({ last_daily_reward: new Date().toISOString() })
          .eq('id', user.id);
      }
      
      return success;
    } catch (error) {
      console.error('Error claiming daily reward:', error);
      set({ error: error.message });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  markAppRated: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    try {
      set({ loading: true, error: null });
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('has_rated_app')
        .eq('id', user.id)
        .single();

      if (profile?.has_rated_app) {
        set({ error: "App rating reward already claimed" });
        return false;
      }

      const success = await get().updateBalance(5, 'app_rating', 'App rating reward');
      if (success) {
        await supabase
          .from('profiles')
          .update({ has_rated_app: true })
          .eq('id', user.id);
        set({ hasRatedApp: true });
      }
      
      return success;
    } catch (error) {
      console.error('Error marking app as rated:', error);
      set({ error: error.message });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  refreshTokenBalance: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('token_balance, last_daily_reward, has_rated_app')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      set({
        balance: profile.token_balance,
        lastDailyReward: profile.last_daily_reward ? new Date(profile.last_daily_reward) : null,
        hasRatedApp: profile.has_rated_app
      });
    } catch (error) {
      console.error('Error refreshing token balance:', error);
      set({ error: error.message });
    }
  }
}));

export const useTokens = () => {
  const { toast } = useToast();
  const tokens = useTokenStore();

  useEffect(() => {
    tokens.refreshTokenBalance();
  }, []);

  return {
    ...tokens,
    canAffordQuiz: tokens.balance >= 3,
    canAffordFlashcards: tokens.balance >= 2,
    showError: (message: string) => {
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    },
    showSuccess: (message: string) => {
      toast({
        title: "Success",
        description: message,
        variant: "success"
      });
    }
  };
};
