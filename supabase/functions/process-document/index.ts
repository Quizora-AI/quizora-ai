
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
    const fileSize = file.size;
    const fileType = file.type;
    
    console.log(`Processing file of type: ${fileType}, size: ${(fileSize/1024/1024).toFixed(2)}MB`);
    
    // Hard file size limit to prevent stack overflow
    const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB absolute limit
    if (fileSize > MAX_FILE_SIZE) {
      throw new Error(`File too large (${(fileSize/1024/1024).toFixed(2)}MB). Maximum file size is 8MB. Please split or compress your document.`);
    }
    
    // For PDF processing, use a more conservative approach to avoid stack issues
    let processableFileSize = fileSize;
    let truncated = false;
    
    // More aggressive size limits for PDFs
    if (fileType === 'application/pdf' && fileSize > 3 * 1024 * 1024) {
      processableFileSize = 3 * 1024 * 1024; // 3MB limit for PDFs
      truncated = true;
      console.log(`Large PDF detected, limiting to first ${(processableFileSize/1024/1024).toFixed(2)}MB for processing`);
    }
    
    // Only process the safe portion of the file
    const safeBytes = fileBytes.slice(0, processableFileSize);
    const fileBase64 = btoa(String.fromCharCode(...new Uint8Array(safeBytes)));
    
    // Check for API key before proceeding
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepseekApiKey) {
      throw new Error('Deepseek API key is not configured. Please contact the administrator.');
    }
    
    if (fileType === 'application/pdf' || fileType.startsWith('image/')) {
      // Use different prompts based on file type and whether it was truncated
      let promptText = '';
      
      if (fileType === 'application/pdf') {
        promptText = truncated 
          ? "Extract multiple-choice medical exam questions from the first portion of this PDF. Format the result as JSON with this structure: [{question: \"text\", options: [\"A\", \"B\", \"C\", \"D\"], correctAnswer: 0, explanation: \"text\"}]. Focus on quality rather than quantity, extract 3-5 clear questions from the visible content."
          : "Extract multiple-choice medical exam questions from this PDF. Format the result as JSON with this structure: [{question: \"text\", options: [\"A\", \"B\", \"C\", \"D\"], correctAnswer: 0, explanation: \"text\"}]. Make sure to extract 3-5 high-quality questions.";
      } else {
        promptText = "Extract multiple-choice medical exam questions from this image. Format the result as JSON with this structure: [{question: \"text\", options: [\"A\", \"B\", \"C\", \"D\"], correctAnswer: 0, explanation: \"text\"}]. Make sure to extract 3-5 high-quality questions.";
      }
      
      const contentType = fileType === 'application/pdf' ? 'application/pdf' : fileType;
      console.log(`Sending request to Deepseek API for ${contentType}`);
      
      // Set reduced tokens for large files to avoid overflowing the response
      const maxTokens = truncated ? 2000 : 3000;
      
      // Modified system prompt for more reliable JSON output
      const systemPrompt = "You are an expert medical educator extracting multiple-choice questions from documents. ALWAYS output your response as valid JSON in the exact format: [{\"question\": \"Question text?\", \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"], \"correctAnswer\": 0, \"explanation\": \"Explanation text\"}]. DO NOT include any text outside of the JSON array. Use numbers (0-3) for the correctAnswer field where 0=first option, 1=second option, etc.";
      
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
              content: systemPrompt
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
          temperature: 0.1, // Lower temperature for more deterministic outputs
          max_tokens: maxTokens
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error(`Deepseek API Error: ${response.status}`, errorData);
        throw new Error(`Deepseek API error: ${response.status} - ${errorData.slice(0, 100)}...`);
      }
      
      const data = await response.json();
      console.log("Received response from Deepseek API");
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response from Deepseek API');
      }
      
      const extractedContent = data.choices[0].message.content;
      console.log("Raw extracted content (first 200 chars):", extractedContent.slice(0, 200) + "...");
      
      // Upgraded JSON parsing with multiple fallback strategies
      let parsedQuestions;
      try {
        // First attempt: Direct parsing of the entire response
        parsedQuestions = JSON.parse(extractedContent.trim());
        console.log("Successfully parsed JSON directly");
      } catch (e1) {
        console.log("Direct JSON parsing failed, trying alternatives:", e1.message);
        
        try {
          // Second attempt: Extract JSON array from markdown code block
          const codeBlockMatch = extractedContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (codeBlockMatch) {
            parsedQuestions = JSON.parse(codeBlockMatch[1].trim());
            console.log("Successfully parsed JSON from code block");
          } else {
            // Third attempt: Look for anything that looks like a JSON array
            const jsonArrayMatch = extractedContent.match(/\[\s*\{[\s\S]*\}\s*\]/);
            if (jsonArrayMatch) {
              parsedQuestions = JSON.parse(jsonArrayMatch[0].trim());
              console.log("Successfully parsed JSON using array regex");
            } else {
              // Fourth attempt: Fix common JSON issues and try again
              const fixedJson = extractedContent
                .replace(/'/g, '"')
                .replace(/(\w+):/g, '"$1":')
                .replace(/\n/g, ' ');
              
              const fixedArrayMatch = fixedJson.match(/\[\s*\{[\s\S]*?\}\s*\]/);
              if (fixedArrayMatch) {
                parsedQuestions = JSON.parse(fixedArrayMatch[0]);
                console.log("Successfully parsed JSON after fixing quotes/formatting");
              } else {
                throw new Error("Could not locate valid JSON array in response");
              }
            }
          }
        } catch (e2) {
          console.error("All JSON parsing attempts failed:", e2.message);
          console.error("Raw content sample:", extractedContent.substring(0, 500));
          throw new Error(`Failed to parse questions: ${e2.message}`);
        }
      }
      
      if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
        throw new Error('No valid questions array found in AI response');
      }
      
      // Improved question validation and sanitization
      const cleanQuestions = parsedQuestions
        .filter(q => q && typeof q === 'object')
        .map((q, index) => {
          // Ensure question text exists and is a string
          const questionText = typeof q.question === 'string' ? q.question.trim() : `Question ${index + 1}`;
          
          // Ensure options array exists and has valid items
          let options = Array.isArray(q.options) ? q.options : [];
          options = options.map(opt => typeof opt === 'string' ? opt.trim() : String(opt)).filter(Boolean);
          
          // If options array is empty or too short, generate placeholders
          if (options.length < 2) {
            options = ['Option A', 'Option B', 'Option C', 'Option D'];
          }
          
          // Ensure correctAnswer is a valid number within range
          let correctAnswer = typeof q.correctAnswer === 'number' ? q.correctAnswer : null;
          if (correctAnswer === null || correctAnswer < 0 || correctAnswer >= options.length) {
            correctAnswer = 0; // Default to first option if invalid
          }
          
          // Sanitize explanation
          const explanation = typeof q.explanation === 'string' ? q.explanation.trim() : '';
          
          return {
            id: `q${index + 1}`,
            question: questionText,
            options,
            correctAnswer,
            explanation
          };
        })
        .filter(q => q.question.length > 10 && q.options.length >= 2); // Filter out questions that are too short
      
      console.log(`Successfully extracted and validated ${cleanQuestions.length} questions`);
      
      if (cleanQuestions.length === 0) {
        throw new Error('No valid questions could be extracted from the document. Try uploading a different portion or format.');
      }
      
      // Include metadata about processing
      const metadata = {
        fileInfo: {
          name: file.name,
          type: file.type,
          size: file.size,
          processedSize: processableFileSize,
          truncated
        },
        processingStats: {
          questionCount: cleanQuestions.length
        }
      };
      
      return new Response(
        JSON.stringify({ 
          questions: cleanQuestions,
          metadata
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      throw new Error(`Unsupported file type: ${fileType}. Please upload a PDF or image file.`);
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
