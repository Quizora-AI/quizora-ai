
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.2";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { userId, productId, purchaseToken } = await req.json();

    if (!userId || !productId || !purchaseToken) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing subscription for user ${userId} with product ${productId}`);

    // Determine subscription type from product ID
    const isYearly = productId.includes('yearly');
    
    // For production, you would verify with Google Play Developer API
    // const verified = await verifyWithGooglePlay(productId, purchaseToken);

    // For demo purposes, we'll assume verification succeeded
    const verified = true;
    const expiryDate = new Date();
    
    // Set expiry date based on subscription type
    if (isYearly) {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      console.log(`Setting yearly subscription expiry to ${expiryDate.toISOString()}`);
    } else {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      console.log(`Setting monthly subscription expiry to ${expiryDate.toISOString()}`);
    }

    if (verified) {
      // Update user profile with premium status
      const { error } = await supabase
        .from('profiles')
        .update({ 
          isPremium: true,
          premiumTier: isYearly ? 'yearly' : 'monthly',
          expiryDate: expiryDate.toISOString(),
          lastPayment: new Date().toISOString(),
          purchaseToken: purchaseToken,
          productId: productId
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user profile:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to update user profile' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Successfully updated user profile with subscription information');

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Premium subscription activated', 
          expiryDate: expiryDate.toISOString(),
          tier: isYearly ? 'yearly' : 'monthly'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Purchase verification failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error processing billing request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Function to verify purchase with Google Play (in a real implementation)
// async function verifyWithGooglePlay(productId: string, purchaseToken: string) {
//   // Implement Google Play API verification here
//   return true;
// }
