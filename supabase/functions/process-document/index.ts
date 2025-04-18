
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
    // Validate OpenRouter API key early
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      console.error('OpenRouter API key is missing');
      throw new Error('OpenRouter API key is not configured. Please add the API key in project secrets.');
    }
    
    console.log('API key validation - Starting OpenRouter API key check');
    
    // Check if the API key is valid with a simple test request
    try {
      const testResponse = await fetch('https://openrouter.ai/api/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'HTTP-Referer': 'https://medquiz.lovable.app',
          'X-Title': 'MedQuiz Document Processor'
        },
      });
      
      if (!testResponse.ok) {
        const errorText = await testResponse.text();
        console.error('API key validation failed:', errorText);
        throw new Error(`Invalid OpenRouter API key or insufficient credits. Status: ${testResponse.status}`);
      }
      
      console.log('OpenRouter API key validated successfully');
    } catch (apiKeyError) {
      console.error('Error during API key validation:', apiKeyError);
      throw new Error('Failed to validate OpenRouter API key. Please check your key and credit balance.');
    }
    
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof File)) {
      throw new Error('No file uploaded');
    }

    const fileSize = file.size;
    const fileType = file.type;
    
    console.log(`Processing file of type: ${fileType}, size: ${(fileSize/1024/1024).toFixed(2)}MB`);

    // Read and convert file to base64
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const fileBase64 = btoa(String.fromCharCode.apply(null, bytes));
    
    // Prepare payload for OpenRouter API with JSON schema
    const payload = {
      model: "openai/gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert medical educator that extracts multiple-choice questions from documents. Your response must follow the exact JSON schema."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract multiple-choice medical exam questions from this document. For each question, include the question text, options (A, B, C, D), correct answer, and explanation."
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
      response_format: {
        type: "json_schema",
        schema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              question: {
                type: "string",
                description: "Question text"
              },
              options: {
                type: "array",
                items: { 
                  type: "string" 
                },
                description: "Array of answer options"
              },
              correctAnswer: {
                type: "integer",
                description: "Index of the correct answer (0-based)"
              },
              explanation: {
                type: "string",
                description: "Explanation of the correct answer"
              }
            },
            required: ["question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    };
    
    console.log('Sending request to OpenRouter API');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://medquiz.lovable.app',
        'X-Title': 'MedQuiz Document Processor'
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error(`OpenRouter API Error: ${response.status}`, errorData);
      throw new Error(`OpenRouter API error: ${response.status} - ${errorData}`);
    }
    
    const data = await response.json();
    console.log("Received response from OpenRouter API");
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenRouter API');
    }
    
    // Extract the content from the response
    const extractedContent = data.choices[0].message.content;
    console.log("Raw extracted content:", extractedContent);
    
    // Parse the JSON content
    const parsedQuestions = JSON.parse(extractedContent);
    
    return new Response(
      JSON.stringify({ 
        questions: parsedQuestions,
        metadata: {
          fileInfo: {
            name: file.name,
            type: fileType,
            size: fileSize
          }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Processing error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
