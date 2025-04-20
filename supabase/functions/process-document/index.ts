
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
    // Validate AIMLAPI key early
    const aimlApiKey = Deno.env.get('AIMLAPI_KEY');
    if (!aimlApiKey) {
      console.error('AIMLAPI key is missing');
      throw new Error('AIMLAPI key is not configured. Please add the API key in project secrets.');
    }
    
    console.log('Starting quiz generation with AIMLAPI');
    
    // Get request data
    const requestData = await req.json();
    
    // Handle both document upload and text prompt generation
    if (req.headers.get("content-type")?.includes("multipart/form-data")) {
      // This is file upload mode (legacy)
      const formData = await req.formData();
      const file = formData.get('file');
      
      if (!file || !(file instanceof File)) {
        throw new Error('No file uploaded');
      }
      
      // Process file upload here (keeping legacy code)
      const fileSize = file.size;
      const fileType = file.type;
      
      console.log(`Processing file of type: ${fileType}, size: ${(fileSize/1024/1024).toFixed(2)}MB`);

      // Check if file is too large
      const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
      if (fileSize > MAX_FILE_SIZE) {
        throw new Error(`File too large. Maximum size is 20MB. Your file is ${(fileSize/1024/1024).toFixed(2)}MB`);
      }

      // AIMLAPI only supports images, so check file type
      if (!fileType.startsWith('image/')) {
        throw new Error(`Unsupported file type: ${fileType}. AIMLAPI only supports image formats (JPEG, PNG). Please convert your document to an image before uploading.`);
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
      const systemPrompt = `You are an expert medical educator specializing in extracting and formatting multiple-choice questions from medical documents. Your task is to carefully analyze the provided document, identify all question-answer patterns, and convert them into a structured JSON format.

IMPORTANT INSTRUCTIONS:
1. Extract REAL multiple-choice questions directly from the document. DO NOT create new questions unless absolutely necessary.
2. If the document contains numbered questions with lettered options (A, B, C, D), extract them EXACTLY as they appear.
3. For each question, include:
   - The complete question text
   - All available options (A, B, C, D, etc.) exactly as written
   - Identify the correct answer (if marked in the document with a symbol, highlight, etc.)
   - Provide a detailed explanation (if available in the document)
4. If correct answers are not marked, make your best assessment based on context clues or expert knowledge.
5. Ensure your response follows the exact JSON schema: 
   [
     {
       "id": "q1",
       "question": "Question text here",
       "options": ["A) Option A", "B) Option B", "C) Option C", "D) Option D"],
       "correctAnswer": 0, // Index of the correct answer
       "explanation": "Detailed explanation of the correct answer"
     }
   ]
6. Be thorough - extract ALL questions present in the document, even if there are many.`;
      
      console.log('Preparing payload for AIMLAPI with improved JSON schema');
      
      // Prepare payload for AIMLAPI
      const response = await fetch('https://api.aimlapi.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${aimlApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "gpt-4o",
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
                  text: "Extract all multiple-choice questions from this medical document. Provide a detailed JSON response following the specified schema."
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
          temperature: 0.1,
          max_tokens: 500 // Reduced to stay within API limits
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('AIMLAPI Error:', errorData);
        throw new Error(`AIMLAPI error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const responseData = await response.json();
      console.log("Received response from AIMLAPI");
      
      if (!responseData.choices || !responseData.choices[0]?.message) {
        console.error('Invalid response structure from AIMLAPI:', JSON.stringify(responseData));
        throw new Error('Invalid response from AIMLAPI. Please try again with a smaller document or different file.');
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
        throw new Error(`Failed to extract questions from document. The API returned an invalid response.`);
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
    } else {
      // This is text prompt mode
      const { promptText, difficulty, numQuestions, subject, topic } = requestData;
      
      if (!promptText) {
        throw new Error('No prompt text provided');
      }
      
      console.log(`Generating ${numQuestions} ${difficulty} questions about ${topic} in ${subject}`);
      
      // Improved system prompt for reliable question generation
      const systemPrompt = `You are an expert medical educator specializing in creating multiple-choice questions for medical education. 
Your task is to generate ${numQuestions || 5} high-quality ${difficulty || 'medium'} difficulty questions about ${topic || 'the requested topic'} in ${subject || 'medicine'}.

IMPORTANT INSTRUCTIONS:
1. Create clinically relevant, realistic multiple-choice questions
2. For each question, include:
   - A clear, concise question text
   - Four options (A, B, C, D) with only ONE correct answer
   - Mark the correct answer
   - Provide a detailed explanation of why the correct answer is right and why the other options are wrong
3. Ensure your response follows the exact JSON schema without any markdown formatting:
   [
     {
       "id": "q1",
       "question": "Question text here",
       "options": ["A) Option A", "B) Option B", "C) Option C", "D) Option D"],
       "correctAnswer": 0, 
       "explanation": "Detailed explanation of the correct answer"
     }
   ]
4. Vary the question types to test different cognitive levels (recall, application, analysis)
5. Make sure the questions are challenging but fair for the ${difficulty || 'medium'} difficulty level
6. DO NOT include any markdown formatting like \`\`\`json or any other formatting - JUST RETURN PURE JSON`;
      
      console.log('Preparing payload for AIMLAPI with improved JSON schema');
      
      // Prepare payload for AIMLAPI
      const response = await fetch('https://api.aimlapi.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${aimlApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: promptText
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
          top_p: 0.9,
          response_format: { type: "json_object" } // Force JSON format
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('AIMLAPI Error:', errorData);
        throw new Error(`AIMLAPI error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const responseData = await response.json();
      console.log("Received response from AIMLAPI");
      
      if (!responseData.choices || !responseData.choices[0]?.message) {
        console.error('Invalid response structure from AIMLAPI:', JSON.stringify(responseData));
        throw new Error('Invalid response from AIMLAPI. Please try again.');
      }
      
      // Extract the content from the response
      const extractedContent = responseData.choices[0].message.content;
      console.log("Raw extracted content (first 200 chars):", extractedContent.slice(0, 200) + "...");
      
      // Parse the JSON content
      let parsedQuestions;
      try {
        // Handle case where the API returns a JSON string inside a JSON object
        const contentToParse = typeof extractedContent === 'string' ? extractedContent : JSON.stringify(extractedContent);
        
        // Try to find and extract a JSON array from the response if it's wrapped in an object
        let jsonContent = contentToParse;
        
        // If it's a string, look for possible JSON array pattern and clean it up
        if (typeof contentToParse === 'string') {
          // Remove any markdown code block markers
          jsonContent = contentToParse
            .replace(/```json\s*/g, '')  // Remove ```json
            .replace(/```\s*/g, '')      // Remove closing ```
            .trim();
            
          // If the content is nested in a "questions" field, extract that
          try {
            const potentialObject = JSON.parse(jsonContent);
            if (potentialObject.questions && Array.isArray(potentialObject.questions)) {
              parsedQuestions = potentialObject.questions;
              console.log(`Successfully extracted ${parsedQuestions.length} questions from questions field`);
            } else if (Array.isArray(potentialObject)) {
              parsedQuestions = potentialObject;
              console.log(`Successfully parsed ${parsedQuestions.length} questions from array`);
            } else {
              // Look for any array in the object
              const arrayFields = Object.entries(potentialObject)
                .find(([_, value]) => Array.isArray(value));
                
              if (arrayFields) {
                parsedQuestions = arrayFields[1];
                console.log(`Successfully extracted ${parsedQuestions.length} questions from field ${arrayFields[0]}`);
              } else {
                throw new Error("Could not find question array in response");
              }
            }
          } catch (innerError) {
            // If we can't parse it as JSON with questions field, try to extract a JSON array pattern
            const arrayMatch = jsonContent.match(/\[\s*\{[\s\S]*\}\s*\]/);
            if (arrayMatch) {
              try {
                parsedQuestions = JSON.parse(arrayMatch[0]);
                console.log(`Successfully extracted ${parsedQuestions.length} questions from matched array`);
              } catch (arrayParseError) {
                throw new Error("Failed to parse extracted array as JSON");
              }
            } else {
              throw new Error("Failed to find valid JSON array in response");
            }
          }
        }
        
        if (!parsedQuestions) {
          throw new Error("Could not extract questions from response");
        }
        
        console.log(`Successfully parsed ${parsedQuestions.length} questions`);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error(`Failed to extract questions. The API returned an invalid response: ${parseError.message}`);
      }
      
      // Validate the parsed questions
      if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
        console.error('No valid questions in response:', parsedQuestions);
        throw new Error('No questions could be generated. Please try different parameters.');
      }
      
      // Add IDs to questions if they don't have them
      const questionsWithIds = parsedQuestions.map((q, index) => ({
        ...q,
        id: q.id || `q${index + 1}`,
        explanation: q.explanation || "No explanation provided."
      }));
      
      console.log(`Successfully generated ${questionsWithIds.length} questions`);
      
      return new Response(
        JSON.stringify({ 
          questions: questionsWithIds,
          metadata: {
            params: {
              difficulty,
              numQuestions,
              subject,
              topic
            },
            generationInfo: {
              questionCount: questionsWithIds.length,
              generatedAt: new Date().toISOString()
            }
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
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
