
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useTokens() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const checkTokenBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('token_balance, free_quizzes_used, free_flashcards_used, isPremium')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
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
          description: "You need more tokens to perform this action. Consider upgrading to premium for unlimited access.",
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

      return true;
    } catch (err) {
      console.error("Error using token:", err);
      setError(err instanceof Error ? err.message : "Failed to use token");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    checkTokenBalance,
    useToken,
    loading,
    error
  };
}
