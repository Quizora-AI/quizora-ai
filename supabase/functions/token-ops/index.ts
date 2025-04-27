
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user_id, amount, transaction_type, description } = await req.json();

    // Update user's token balance
    const { data: updatedProfile, error: updateError } = await supabaseClient
      .from('profiles')
      .update({ 
        token_balance: supabaseClient.sql`token_balance + ${amount}` 
      })
      .eq('id', user_id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Record the transaction
    const { error: transactionError } = await supabaseClient
      .from('token_transactions')
      .insert({
        user_id,
        amount,
        transaction_type,
        description
      });

    if (transactionError) throw transactionError;

    return new Response(
      JSON.stringify({ success: true, balance: updatedProfile.token_balance }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
