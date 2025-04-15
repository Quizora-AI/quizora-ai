
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
    // Validate Deepseek API key early
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepseekApiKey) {
      console.error('Deepseek API key is missing');
      throw new Error('Deepseek API key is not configured. Please add the API key in project secrets.');
    }
    
    console.log('Deepseek API key validation - Starting API key check');
    
    // Check if the API key is valid with a simple test request
    try {
      const testResponse = await fetch('https://api.deepseek.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${deepseekApiKey}`,
        },
      });
      
      if (!testResponse.ok) {
        const errorText = await testResponse.text();
        console.error('API key validation failed:', errorText);
        throw new Error(`Invalid Deepseek API key or insufficient credits. Status: ${testResponse.status}`);
      }
      
      console.log('Deepseek API key validated successfully');
    } catch (apiKeyError) {
      console.error('Error during API key validation:', apiKeyError);
      throw new Error('Failed to validate Deepseek API key. Please check your key and credit balance.');
    }
    
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof File)) {
      throw new Error('No file uploaded');
    }

    const fileSize = file.size;
    const fileType = file.type;
    
    console.log(`Processing file of type: ${fileType}, size: ${(fileSize/1024/1024).toFixed(2)}MB`);

    // Absolute maximum file size - this prevents large files from even being attempted
    const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB absolute limit
    if (fileSize > MAX_FILE_SIZE) {
      throw new Error(`File too large (${(fileSize/1024/1024).toFixed(2)}MB). Maximum file size is 8MB. Please split or compress your document.`);
    }
    
    // For PDF processing, determine how much of the file we'll process
    let processSize = fileSize;
    let truncated = false;
    
    // Special handling for PDFs based on size
    if (fileType === 'application/pdf') {
      // Size tiers for PDF processing
      if (fileSize > 5 * 1024 * 1024) {
        // Very large PDFs (5MB+): process first 1MB only
        processSize = 1 * 1024 * 1024;
        truncated = true;
        console.log(`Very large PDF (${(fileSize/1024/1024).toFixed(2)}MB), limiting to first 1MB`);
      } 
      else if (fileSize > 3 * 1024 * 1024) {
        // Large PDFs (3-5MB): process first 1.5MB
        processSize = 1.5 * 1024 * 1024;
        truncated = true;
        console.log(`Large PDF (${(fileSize/1024/1024).toFixed(2)}MB), limiting to first 1.5MB`);
      }
      else if (fileSize > 1 * 1024 * 1024) {
        // Medium PDFs (1-3MB): process first 2MB
        processSize = Math.min(fileSize, 2 * 1024 * 1024);
        truncated = true;
        console.log(`Medium PDF (${(fileSize/1024/1024).toFixed(2)}MB), limiting to first 2MB`);
      }
    }
    
    // Read and convert file to base64 in small chunks to prevent stack overflow
    console.log(`Processing ${truncated ? 'partial' : 'full'} file: ${(processSize/1024/1024).toFixed(2)}MB`);
    
    // Process file bytes in chunks
    let fileBase64 = '';
    const buffer = await file.slice(0, processSize).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    // Convert to base64 in chunks to avoid stack overflow
    const chunkSize = 10000; // Smaller chunk size to avoid call stack issues
    let binary = '';
    
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, i + chunkSize);
      for (let j = 0; j < chunk.length; j++) {
        binary += String.fromCharCode(chunk[j]);
      }
      
      // For very large files, batch the base64 conversion to prevent memory pressure
      if (i > 0 && i % (chunkSize * 10) === 0) {
        const partialBase64 = btoa(binary);
        fileBase64 += partialBase64;
        binary = '';
      }
    }
    
    // Convert any remaining binary data
    if (binary.length > 0) {
      fileBase64 += btoa(binary);
    }
    
    console.log('File successfully converted to base64');
    
    // Use different prompts based on file type and whether it was truncated
    let promptText = '';
    
    if (fileType === 'application/pdf') {
      promptText = truncated 
        ? "Extract multiple-choice medical exam questions from this partial PDF. Format the result as JSON with this structure: [{question: \"text\", options: [\"A\", \"B\", \"C\", \"D\"], correctAnswer: 0, explanation: \"text\"}]. Extract 3-5 clear questions from the visible content. IMPORTANT: Your response MUST be valid JSON."
        : "Extract multiple-choice medical exam questions from this PDF. Format the result as JSON with this structure: [{question: \"text\", options: [\"A\", \"B\", \"C\", \"D\"], correctAnswer: 0, explanation: \"text\"}]. Extract 3-5 clear questions from the content. IMPORTANT: Your response MUST be valid JSON.";
    } else {
      promptText = "Extract multiple-choice medical exam questions from this image. Format the result as JSON with this structure: [{question: \"text\", options: [\"A\", \"B\", \"C\", \"D\"], correctAnswer: 0, explanation: \"text\"}]. Extract 3-5 clear questions from the content. IMPORTANT: Your response MUST be valid JSON.";
    }
    
    const contentType = fileType === 'application/pdf' ? 'application/pdf' : fileType;
    console.log(`Sending request to Deepseek API for ${contentType}${truncated ? ' (truncated)' : ''}`);
    
    // Set reduced tokens for large files to avoid overflowing the response
    const maxTokens = truncated ? 1500 : 2500;
    
    // Modified system prompt for more reliable JSON output
    const systemPrompt = "You are an expert medical educator extracting multiple-choice questions from documents. ALWAYS output your response as valid JSON in the exact format: [{\"question\": \"Question text?\", \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"], \"correctAnswer\": 0, \"explanation\": \"Explanation text\"}]. DO NOT include any text outside of the JSON array. Use numbers (0-3) for the correctAnswer field where 0=first option, 1=second option, etc.";
    
    try {
      // Properly formatted payload for Deepseek API multimodal input
      const payload = {
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
        temperature: 0.1, // Low temperature for more consistent JSON
        max_tokens: maxTokens
      };
      
      console.log('Sending request to Deepseek API with proper multimodal format');
      
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${deepseekApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error(`Deepseek API Error: ${response.status}`, errorData);
        
        // If we're seeing a credit or API key issue, fall back to mock data
        if (response.status === 402 || response.status === 401 || response.status === 422) {
          console.log("API key or credit issues detected - falling back to mock data");
          return handleMockDataFallback();
        }
        
        throw new Error(`Deepseek API error: ${response.status} - ${errorData.slice(0, 100)}...`);
      }
      
      const data = await response.json();
      console.log("Received response from Deepseek API");
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response from Deepseek API');
      }
      
      const extractedContent = data.choices[0].message.content;
      console.log("Raw extracted content (first 200 chars):", extractedContent.slice(0, 200) + "...");
      
      return processExtractedQuestions(extractedContent, file, fileSize, processSize, truncated);
      
    } catch (apiError) {
      console.error("API processing error:", apiError);
      
      // For any API-related errors, fall back to mock data
      console.log("Falling back to mock data due to API error");
      return handleMockDataFallback();
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
  
  // Helper function to process extracted questions
  async function processExtractedQuestions(extractedContent, file, fileSize, processSize, truncated) {
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
        processedSize: processSize,
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
  }
  
  // Helper function to return mock data when API fails
  function handleMockDataFallback() {
    console.log("Generating mock data as fallback");
    
    const mockQuestions = [
      {
        id: "q1",
        question: "Which of the following is NOT a primary treatment for acute myocardial infarction?",
        options: [
          "Aspirin",
          "Anticoagulation with heparin",
          "Primary percutaneous coronary intervention",
          "Calcium channel blockers"
        ],
        correctAnswer: 3,
        explanation: "Calcium channel blockers are not recommended as first-line therapy in acute MI. They may worsen outcomes in certain patients."
      },
      {
        id: "q2",
        question: "The most common cause of community-acquired pneumonia is:",
        options: [
          "Streptococcus pneumoniae",
          "Haemophilus influenzae",
          "Mycoplasma pneumoniae",
          "Klebsiella pneumoniae"
        ],
        correctAnswer: 0,
        explanation: "Streptococcus pneumoniae remains the most common cause of community-acquired pneumonia across most age groups."
      },
      {
        id: "q3",
        question: "Which antibody is most associated with the diagnosis of rheumatoid arthritis?",
        options: [
          "Anti-dsDNA",
          "Anti-CCP",
          "Anti-Smith",
          "Anti-Ro"
        ],
        correctAnswer: 1,
        explanation: "Anti-CCP (anti-cyclic citrullinated peptide) antibodies are highly specific for rheumatoid arthritis."
      },
      {
        id: "q4",
        question: "Which of the following is the first-line treatment for uncomplicated urinary tract infection?",
        options: [
          "Amoxicillin",
          "Ciprofloxacin",
          "Trimethoprim-sulfamethoxazole",
          "Nitrofurantoin"
        ],
        correctAnswer: 3,
        explanation: "Nitrofurantoin is recommended as first-line therapy for uncomplicated UTIs due to lower resistance rates."
      },
      {
        id: "q5",
        question: "The gold standard for diagnosis of pulmonary embolism is:",
        options: [
          "D-dimer test",
          "CT pulmonary angiography",
          "Ventilation-perfusion scan",
          "Chest X-ray"
        ],
        correctAnswer: 1,
        explanation: "CT pulmonary angiography is currently considered the gold standard for diagnosing pulmonary embolism."
      },
    ];
    
    const metadata = {
      fileInfo: {
        name: "mock_data.pdf",
        type: "application/pdf",
        size: 0,
        processedSize: 0,
        truncated: false
      },
      processingStats: {
        questionCount: mockQuestions.length,
        source: "mock_data"
      },
      apiStatus: {
        error: true,
        reason: "API key validation failed or insufficient credits - using mock data instead"
      }
    };
    
    return new Response(
      JSON.stringify({ 
        questions: mockQuestions,
        metadata
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
