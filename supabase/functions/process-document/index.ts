
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AIMLAPI_KEY = Deno.env.get('AIMLAPI_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!AIMLAPI_KEY) {
      console.error("Missing API key: AIMLAPI_KEY");
      throw new Error("API key is not configured. Please contact the administrator.");
    }
    
    const requestData = await req.json();
    console.log("Received request:", JSON.stringify(requestData));
    
    if (requestData.type === 'flashcards') {
      console.log("Processing flashcard generation request");
      
      // Extract parameters
      const { course, subject, topic, questionCount } = requestData;
      
      if (!subject) {
        throw new Error("Subject is required for flashcard generation");
      }
      
      // Build the system prompt
      const systemPrompt = `You are an expert educator specialized in creating flashcards. Create ${questionCount} flashcards about ${subject}${topic ? ` focusing on ${topic}` : ''}${course ? ` for the course ${course}` : ''}.`;
      
      // Build the user prompt
      const userPrompt = `Generate ${questionCount} flashcards for studying ${subject}${topic ? ` on the topic of ${topic}` : ''}. 
      Each flashcard should have a question on the front and the answer on the back. 
      Return the data in this exact JSON format: 
      {
        "questions": [
          {
            "question": "question text for front of card",
            "correctAnswer": "answer text for back of card"
          }
        ]
      }`;
      
      console.log("System prompt:", systemPrompt);
      console.log("User prompt:", userPrompt);
      
      // Call AIML API
      const response = await fetch("https://api.aimlapi.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${AIMLAPI_KEY}`
        },
        body: JSON.stringify({
          model: "mistralai/Mistral-7B-Instruct-v0.2",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: userPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("AIML API error:", response.status, errorText);
        throw new Error(`AIML API returned an error: ${response.status} ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log("AIML API response:", JSON.stringify(responseData));
      
      if (!responseData.choices || !responseData.choices[0] || !responseData.choices[0].message) {
        throw new Error("Invalid response format from AIML API");
      }
      
      const content = responseData.choices[0].message.content;
      console.log("Content from API:", content);
      
      try {
        // Extract the JSON part from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("Could not extract JSON from the API response");
        }
        
        const jsonContent = jsonMatch[0];
        const parsedContent = JSON.parse(jsonContent);
        
        if (!parsedContent.questions || !Array.isArray(parsedContent.questions)) {
          throw new Error("Invalid flashcard data format");
        }
        
        return new Response(JSON.stringify(parsedContent), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (jsonError) {
        console.error("Error parsing JSON from API response:", jsonError);
        try {
          // Fallback: Try to parse the entire content as JSON
          const parsedContent = JSON.parse(content);
          if (parsedContent.questions) {
            return new Response(JSON.stringify(parsedContent), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          } else {
            throw new Error("Invalid flashcard data format in parsed content");
          }
        } catch (fallbackError) {
          console.error("Fallback JSON parsing failed:", fallbackError);
          
          // Last resort: Try to extract questions manually from the text
          const questions = [];
          const lines = content.split("\n");
          
          let currentQuestion = null;
          for (const line of lines) {
            if (line.includes("question") && line.includes(":")) {
              if (currentQuestion) {
                questions.push(currentQuestion);
              }
              currentQuestion = { question: "", correctAnswer: "" };
              const questionText = line.split(":")[1].trim().replace(/["""]/g, "");
              currentQuestion.question = questionText;
            } else if (currentQuestion && line.includes("answer") && line.includes(":")) {
              const answerText = line.split(":")[1].trim().replace(/["""]/g, "");
              currentQuestion.correctAnswer = answerText;
              questions.push(currentQuestion);
              currentQuestion = null;
            }
          }
          
          if (questions.length > 0) {
            return new Response(JSON.stringify({ questions }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          
          throw new Error("Could not extract flashcard data from the API response");
        }
      }
    } else {
      throw new Error(`Unsupported request type: ${requestData.type}`);
    }
  } catch (error) {
    console.error("Error in process-document function:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "An unexpected error occurred",
        details: error.stack || "No additional details available"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
