
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

    // Read file data without using recursive functions
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    // Convert to base64 in chunks to avoid call stack issues
    let fileBase64 = '';
    const chunkSize = 32768; // Process in 32KB chunks
    
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, Math.min(i + chunkSize, bytes.length));
      fileBase64 += btoa(String.fromCharCode.apply(null, Array.from(chunk)));
    }
    
    // Improved system prompt for more reliable question extraction
    const systemPrompt = `You are an expert medical educator specializing in extracting and formatting multiple-choice questions from medical documents. Your task is to carefully analyze the provided document, identify all question-answer patterns, and convert them into a structured format.

IMPORTANT INSTRUCTIONS:
1. Extract REAL multiple-choice questions directly from the document. DO NOT create new questions unless absolutely necessary.
2. If the document contains numbered questions with lettered options (A, B, C, D), extract them EXACTLY as they appear.
3. For each question, include:
   - The complete question text
   - All available options (A, B, C, D, etc.) exactly as written
   - Identify the correct answer (if marked in the document with a symbol, highlight, etc.)
   - Provide a detailed explanation (if available in the document)
4. If correct answers are not marked, make your best assessment based on context clues or expert knowledge.
5. Ensure your response follows the exact JSON schema provided.
6. Be thorough - extract ALL questions present in the document, even if there are many.

Your output MUST strictly follow the specified JSON schema format with no deviations.`;
    
    console.log('Preparing payload for OpenRouter API with improved JSON schema');
    
    // Prepare payload for OpenRouter API with improved JSON schema
    const payload = {
      model: "anthropic/claude-3-opus:beta",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all multiple-choice questions from this medical document. Include the question text, all options (A, B, C, D, etc.), correct answer, and explanation if available. Follow the schema exactly."
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
                description: "Full question text exactly as it appears in document"
              },
              options: {
                type: "array",
                items: { 
                  type: "string",
                  description: "Full text of each answer option" 
                },
                description: "Array of answer options in order (A, B, C, D, etc.)"
              },
              correctAnswer: {
                type: "integer",
                description: "Index of the correct answer (0-based)"
              },
              explanation: {
                type: "string",
                description: "Explanation of why the correct answer is right (if available in document)"
              }
            },
            required: ["question", "options", "correctAnswer"]
          }
        }
      },
      temperature: 0.1,
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
      throw new Error('No questions could be extracted from the document. Please make sure your document contains clear multiple-choice questions.');
    }
    
    // Add IDs to questions if they don't have them
    const questionsWithIds = parsedQuestions.map((q, index) => ({
      ...q,
      id: q.id || `q${index + 1}`,
      explanation: q.explanation || "No explanation provided."
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
