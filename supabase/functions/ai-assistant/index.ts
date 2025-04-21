
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openAIApiKey) {
    return new Response(
      JSON.stringify({ error: "OpenAI API key not configured" }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const { message, course, context = [] } = await req.json();

    // Prepare conversation context
    const systemMessage = `You are Quizora, an AI assistant specializing in medical education${course ? ` with expertise in ${course}` : ''}. 
    Provide accurate, concise answers to medical and healthcare questions. 
    Include relevant facts, examples, and explanations when appropriate.
    If you're not sure about an answer, acknowledge your limitations rather than providing incorrect information.
    Your knowledge cutoff date is April 2023.`;
    
    // Build conversation history
    const messages = [
      { role: "system", content: systemMessage },
      ...context.map((c: any) => ({ 
        role: c.role, 
        content: c.content 
      })),
      { role: "user", content: message }
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`OpenAI API error: ${data.error.message}`);
    }
    
    const aiResponse = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error("AI Assistant error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
