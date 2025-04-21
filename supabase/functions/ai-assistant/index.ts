
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

  const aimlApiKey = Deno.env.get("AIMLAPI_KEY");
  if (!aimlApiKey) {
    console.error("AIMLAPI key not configured");
    return new Response(
      JSON.stringify({ error: "AIMLAPI key not configured" }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const requestBody = await req.text();
    console.log("Request body:", requestBody);
    
    let parsedBody;
    try {
      parsedBody = JSON.parse(requestBody);
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { message, course, context = [] } = parsedBody;
    
    if (!message) {
      console.error("Missing required field: message");
      return new Response(
        JSON.stringify({ error: "Missing required field: message" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prepare conversation context with course information
    const systemMessage = `You are Quizora, an AI assistant specializing in education${course ? ` with expertise in ${course}` : ''}. 
    Provide accurate, concise answers to questions related to ${course || 'any course topics'}. 
    Include relevant facts, examples, and explanations when appropriate.
    If you're not sure about an answer, acknowledge your limitations rather than providing incorrect information.`;
    
    // Build conversation history
    const messages = [
      { role: "system", content: systemMessage },
      ...context.map((c) => ({ 
        role: c.role, 
        content: c.content 
      })),
      { role: "user", content: message }
    ];

    console.log("Sending request to AIMLAPI with messages:", JSON.stringify(messages));

    try {
      const response = await fetch("https://api.aimlapi.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${aimlApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI API error response:", response.status, errorText);
        throw new Error(`AI API returned status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("Response from AIMLAPI:", JSON.stringify(data));
      
      if (data.error) {
        throw new Error(`AI API error: ${data.error.message}`);
      }
      
      const aiResponse = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

      return new Response(
        JSON.stringify({ response: aiResponse }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (fetchError) {
      console.error("AIMLAPI fetch error:", fetchError);
      return new Response(
        JSON.stringify({ error: `Error fetching from AIMLAPI: ${fetchError.message}` }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
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
