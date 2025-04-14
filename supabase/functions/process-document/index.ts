
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
    const fileSize = file.size;
    console.log(`Processing file of type: ${fileType}, size: ${fileSize} bytes`);
    
    // Check file size (prevent processing extremely large files)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit
    if (fileSize > MAX_FILE_SIZE) {
      throw new Error(`File too large (${Math.round(fileSize/1024/1024)}MB). Maximum file size is 10MB.`);
    }
    
    if (fileType === 'application/pdf' || fileType.startsWith('image/')) {
      const promptText = fileType === 'application/pdf' 
        ? "Extract multiple-choice medical exam questions from the PDF. Format the result as JSON with this structure: [{question: \"text\", options: [\"A\", \"B\", \"C\", \"D\"], correctAnswer: 0, explanation: \"text\"}]. Make sure to extract at least 3-5 high-quality questions."
        : "Extract multiple-choice medical exam questions from the image. Format the result as JSON with this structure: [{question: \"text\", options: [\"A\", \"B\", \"C\", \"D\"], correctAnswer: 0, explanation: \"text\"}]. Make sure to extract at least 3-5 high-quality questions.";
        
      const contentType = fileType === 'application/pdf' ? 'application/pdf' : fileType;
      
      console.log(`Sending request to Deepseek API for ${contentType}`);
      
      // Only process a reasonable portion of large PDF files
      let processedBase64 = fileBase64;
      if (fileType === 'application/pdf' && fileSize > 5 * 1024 * 1024) {
        // For large PDFs, take first portion to avoid stack overflow
        const safeSize = 4 * 1024 * 1024; // 4MB is generally safe
        console.log(`Large PDF detected, processing only first ${Math.round(safeSize/1024/1024)}MB`);
        processedBase64 = fileBase64.substring(0, safeSize);
      }
      
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
              content: "You are an expert medical educator creating high-quality multiple-choice questions. Focus on creating challenging, thought-provoking questions that test deep understanding of medical concepts. ALWAYS return your output in valid JSON format."
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
                    url: `data:${contentType};base64,${processedBase64}`
                  }
                }
              ]
            }
          ],
          temperature: 0.3,
          max_tokens: 3000
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
      
      // More robust JSON parsing with multiple fallback strategies and safeguards
      let parsedQuestions = [];
      try {
        // Strategy 1: Direct JSON parsing
        try {
          const possibleJson = extractedContent.trim();
          parsedQuestions = JSON.parse(possibleJson);
          console.log("Successfully parsed JSON directly");
        } catch (e) {
          console.log("Direct JSON parsing failed, trying alternatives");
          
          // Strategy 2: Extract JSON from markdown code block
          const codeBlockMatch = extractedContent.match(/```(?:json)?\n([\s\S]*?)\n```/);
          if (codeBlockMatch) {
            try {
              parsedQuestions = JSON.parse(codeBlockMatch[1].trim());
              console.log("Successfully parsed JSON from code block");
            } catch (e2) {
              console.log("Code block JSON parsing failed");
            }
          }
          
          // Strategy 3: Extract JSON from text using regex
          if (!parsedQuestions || !Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
            const jsonMatch = extractedContent.match(/\[[\s\S]*?\{[\s\S]*?\}[\s\S]*?\]/);
            if (jsonMatch) {
              try {
                parsedQuestions = JSON.parse(jsonMatch[0].trim());
                console.log("Successfully parsed JSON using regex");
              } catch (e3) {
                console.log("Regex JSON parsing failed");
              }
            }
          }
          
          // Strategy 4: Try to fix common JSON errors
          if (!parsedQuestions || !Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
            try {
              // Replace single quotes with double quotes
              const fixedJson = extractedContent
                .replace(/'/g, '"')
                .replace(/(\w+):/g, '"$1":');
              
              // Try to extract array portion
              const arrayMatch = fixedJson.match(/\[([\s\S]*?)\]/);
              if (arrayMatch) {
                parsedQuestions = JSON.parse(`[${arrayMatch[1]}]`);
                console.log("Successfully parsed JSON after fixing quotes");
              }
            } catch (e4) {
              console.log("Fixed quotes JSON parsing failed");
            }
          }
        }
        
        if (!parsedQuestions || !Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
          throw new Error('Failed to parse valid questions array from AI response');
        }
        
        // Validate and clean questions
        const cleanQuestions = parsedQuestions.map((q, index) => ({
          id: `q${index + 1}`,
          question: q.question || 'No question text',
          options: q.options && Array.isArray(q.options) 
            ? q.options.map(opt => String(opt).trim()).filter(opt => opt) 
            : ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 
            ? q.correctAnswer 
            : Math.floor(Math.random() * 4),
          explanation: q.explanation || 'No explanation provided'
        })).filter(q => q.question !== 'No question text' && q.options.length >= 2);
        
        console.log(`Successfully parsed ${cleanQuestions.length} questions`);
        
        if (cleanQuestions.length === 0) {
          throw new Error('No valid questions could be extracted');
        }
        
        return new Response(
          JSON.stringify({ 
            questions: cleanQuestions,
            fileInfo: {
              name: file.name,
              type: file.type,
              size: file.size
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Failed to parse questions:', error);
        console.error('Raw content was (first 500 chars):', extractedContent.slice(0, 500));
        throw new Error(`Failed to parse questions from the AI response: ${error.message}`);
      }
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
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
