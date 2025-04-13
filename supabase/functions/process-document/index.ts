
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

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof File)) {
      throw new Error('No file uploaded');
    }

    const fileBytes = await file.arrayBuffer();
    const fileBase64 = btoa(String.fromCharCode(...new Uint8Array(fileBytes)));
    
    // Extract content from PDF/Image using Deepseek AI
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepseekApiKey) {
      throw new Error('Deepseek API key is not configured');
    }

    // Process content based on file type
    const fileType = file.type;
    console.log(`Processing file of type: ${fileType}`);
    
    if (fileType === 'application/pdf' || fileType.startsWith('image/')) {
      const promptText = fileType === 'application/pdf' 
        ? "Extract all multiple choice questions from this PDF content."
        : "Extract all multiple choice questions from this image.";
        
      const contentType = fileType === 'application/pdf' ? 'application/pdf' : fileType;
      
      console.log(`Sending request to Deepseek API for ${contentType}`);
      
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${deepseekApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "You are an expert at extracting multiple choice questions from medical texts. Extract all multiple choice questions from the content I'll provide. Format each question with its options and correct answer as a JSON array with this structure: [{\"question\": \"question text\", \"options\": [\"option A\", \"option B\", \"option C\", \"option D\"], \"correctAnswer\": 0, \"explanation\": \"explanation if available\"}]. The correctAnswer should be the index (0-based) of the correct option. If you cannot extract any questions, respond with an empty array []."
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: promptText
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${contentType};base64,${fileBase64}`
                  }
                }
              ]
            }
          ],
          temperature: 0.2,
          max_tokens: 4000
        }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error(`API Error: ${response.status}`, error);
        throw new Error(`Deepseek API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Received response from Deepseek API");
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response from Deepseek API');
      }
      
      const extractedContent = data.choices[0].message.content;
      console.log("Extracted content:", extractedContent);
      
      // Parse the AI response to extract valid JSON
      try {
        // Find the JSON array in the response
        const jsonMatch = extractedContent.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
          const parsedQuestions = JSON.parse(jsonMatch[0]);
          console.log(`Successfully parsed ${parsedQuestions.length} questions`);
          
          return new Response(
            JSON.stringify({ questions: parsedQuestions }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          throw new Error('No valid JSON found in the AI response');
        }
      } catch (error) {
        console.error('Failed to parse questions:', error);
        throw new Error('Failed to parse questions from the AI response');
      }
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    console.error('Processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
