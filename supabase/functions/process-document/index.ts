
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
        ? "Extract multiple-choice medical exam questions with high educational value from the PDF. Ensure the questions are challenging, test critical thinking, and cover diverse medical topics."
        : "Extract multiple-choice medical exam questions from the image. Focus on creating intellectually stimulating questions that test deep medical knowledge.";
        
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
              content: "You are an expert medical educator creating high-quality multiple-choice questions. Focus on creating challenging, thought-provoking questions that test deep understanding of medical concepts."
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
          temperature: 0.3,
          max_tokens: 4000
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
      console.log("Raw extracted content:", extractedContent.slice(0, 200) + "...");
      
      // Robust JSON parsing with multiple strategies
      try {
        let parsedQuestions = [];
        const jsonExtractors = [
          // Direct JSON parsing
          () => JSON.parse(extractedContent),
          
          // Extract JSON from markdown code block
          () => {
            const codeBlockMatch = extractedContent.match(/```json\n([\s\S]*?)\n```/);
            return codeBlockMatch ? JSON.parse(codeBlockMatch[1]) : null;
          },
          
          // Extract JSON from text using regex
          () => {
            const jsonMatch = extractedContent.match(/\[\s*\{[\s\S]*?\}\s*\]/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
          }
        ];

        for (const extractor of jsonExtractors) {
          try {
            parsedQuestions = extractor();
            if (parsedQuestions && Array.isArray(parsedQuestions)) break;
          } catch (parseError) {
            console.log("Parsing strategy failed:", parseError);
          }
        }
        
        if (!parsedQuestions || parsedQuestions.length === 0) {
          throw new Error('No valid questions could be extracted');
        }
        
        // Validate and clean questions
        const cleanQuestions = parsedQuestions.map((q, index) => ({
          id: `q${index + 1}`,
          question: q.question || 'No question text',
          options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : Math.floor(Math.random() * 4),
          explanation: q.explanation || 'No explanation provided'
        })).filter(q => q.question !== 'No question text');
        
        console.log(`Successfully parsed ${cleanQuestions.length} questions`);
        
        return new Response(
          JSON.stringify({ questions: cleanQuestions }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Failed to parse questions:', error);
        console.error('Raw content was:', extractedContent);
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
