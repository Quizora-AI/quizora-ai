
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
    let extractedContent = '';
    
    if (fileType === 'application/pdf') {
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
              content: "You are an expert at extracting multiple choice questions from medical texts. Extract all multiple choice questions from the PDF content I'll provide. Format each question with its options and correct answer as a JSON array with this structure: [{\"question\": \"question text\", \"options\": [\"option A\", \"option B\", \"option C\", \"option D\"], \"correctAnswer\": 0, \"explanation\": \"explanation if available\"}]. The correctAnswer should be the index (0-based) of the correct option."
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Extract all multiple choice questions from this PDF content."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:application/pdf;base64,${fileBase64}`
                  }
                }
              ]
            }
          ],
          temperature: 0.2,
          max_tokens: 4000
        }),
      });
      
      const data = await response.json();
      extractedContent = data.choices[0].message.content;
    } else if (fileType.startsWith('image/')) {
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
              content: "You are an expert at extracting multiple choice questions from medical images. Extract all multiple choice questions from the image I'll provide. Format each question with its options and correct answer as a JSON array with this structure: [{\"question\": \"question text\", \"options\": [\"option A\", \"option B\", \"option C\", \"option D\"], \"correctAnswer\": 0, \"explanation\": \"explanation if available\"}]. The correctAnswer should be the index (0-based) of the correct option."
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Extract all multiple choice questions from this image."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${fileType};base64,${fileBase64}`
                  }
                }
              ]
            }
          ],
          temperature: 0.2,
          max_tokens: 4000
        }),
      });
      
      const data = await response.json();
      extractedContent = data.choices[0].message.content;
    } else {
      throw new Error('Unsupported file type');
    }

    // Parse the AI response to extract valid JSON
    let parsedQuestions;
    try {
      // Find the JSON array in the response
      const jsonMatch = extractedContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        parsedQuestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in the AI response');
      }
    } catch (error) {
      console.error('Failed to parse questions:', error);
      throw new Error('Failed to parse questions from the AI response');
    }

    // Return the extracted questions
    return new Response(
      JSON.stringify({ questions: parsedQuestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
