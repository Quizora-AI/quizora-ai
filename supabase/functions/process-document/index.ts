
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
    
    console.log('Starting document processing with OpenRouter API');
    
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof File)) {
      throw new Error('No file uploaded');
    }

    const fileSize = file.size;
    const fileType = file.type;
    
    console.log(`Processing file of type: ${fileType}, size: ${(fileSize/1024/1024).toFixed(2)}MB`);

    // Check if file is too large
    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
    if (fileSize > MAX_FILE_SIZE) {
      throw new Error(`File too large. Maximum size is 20MB. Your file is ${(fileSize/1024/1024).toFixed(2)}MB`);
    }

    // Read and convert file to base64
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const fileBase64 = btoa(String.fromCharCode(...Array.from(bytes)));
    
    // Prepare payload for OpenRouter API with JSON schema
    const payload = {
      model: "anthropic/claude-3-opus:beta",
      messages: [
        {
          role: "system",
          content: "You are an expert medical educator specializing in extracting and formatting multiple-choice questions from medical documents. Your task is to carefully analyze the provided document, identify all question-answer patterns, and convert them into a structured format. Follow these guidelines:\n\n1. Extract all multiple-choice questions completely and accurately\n2. Include the question text, all available options (A, B, C, D, etc.), identify the correct answer, and provide a detailed explanation\n3. Ensure your response follows the exact JSON schema provided\n4. If the document doesn't contain obvious questions, create high-quality multiple-choice questions based on the key medical concepts presented\n5. For each question, provide a comprehensive explanation of why the correct answer is right and why other options are wrong\n\nYour output must strictly follow the specified JSON schema format."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract multiple-choice medical exam questions from this document. For each question, include the question text, options (A, B, C, D, etc.), correct answer, and explanation. If the document doesn't contain clear questions, create high-quality questions based on the key medical concepts presented."
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
      },
      temperature: 0.3,
      max_tokens: 4000
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
    
    const responseData = await response.json();
    console.log("Received response from OpenRouter API", JSON.stringify(responseData).slice(0, 200) + "...");
    
    if (!response.ok) {
      console.error('OpenRouter API Error:', responseData);
      throw new Error(`OpenRouter API error: ${response.status} - ${JSON.stringify(responseData)}`);
    }
    
    if (!responseData.choices || !responseData.choices[0]?.message) {
      console.error('Invalid response structure from OpenRouter API:', responseData);
      throw new Error('Invalid response from OpenRouter API');
    }
    
    // Extract the content from the response
    const extractedContent = responseData.choices[0].message.content;
    console.log("Raw extracted content (first 200 chars):", extractedContent.slice(0, 200) + "...");
    
    // Parse the JSON content
    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(extractedContent);
      console.log(`Successfully parsed ${parsedQuestions.length} questions`);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error(`Failed to parse questions from API response: ${parseError.message}`);
    }
    
    // Validate the parsed questions
    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
      console.error('No valid questions in response:', parsedQuestions);
      throw new Error('No questions could be extracted from the document');
    }
    
    // Add IDs to questions if they don't have them
    const questionsWithIds = parsedQuestions.map((q, index) => ({
      ...q,
      id: q.id || `q${index + 1}`
    }));
    
    console.log(`Successfully processed document with ${questionsWithIds.length} questions`);
    
    return new Response(
      JSON.stringify({ 
        questions: questionsWithIds,
        metadata: {
          fileInfo: {
            name: file.name,
            type: fileType,
            size: fileSize
          },
          processingStats: {
            questionCount: questionsWithIds.length,
            processingTime: new Date().toISOString()
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
