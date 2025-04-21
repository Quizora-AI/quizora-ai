
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const apiKey = Deno.env.get("AIMLAPI_KEY");

if (!apiKey) {
  console.warn("AIMLAPI_KEY environment variable not set!");
}

const baseURL = "https://api.aimlapi.com/v1";

const prepareContent = (document: string, course: string, subject: string, topic: string) => {
  let content = '';
  if (document) {
    content = `Document content:\n${document}\n`;
  } else {
    content = `Course: ${course}\nSubject: ${subject}\n`;
    if (topic) {
      content += `Topic: ${topic}\n`;
    }
  }
  return content;
};

const selectAPI = (document: string, course: string, subject: string, topic: string, prompt: string) => {
  if (prompt) {
    return "custom";
  }
  if (document || course || subject || topic) {
    return "content";
  }
  return "general";
};

const processDocument = async (req: Request) => {
  try {
    const { type = "quiz", document, course, subject, topic, questionCount = 5, fileType, prompt } = await req.json();
    
    // Validate request data
    if (!subject && !document && !prompt) {
      return new Response(
        JSON.stringify({ error: 'Missing required data - need document or subject or custom prompt' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Prepare system prompt based on type
    let systemPrompt = '';
    if (type === "quiz") {
      systemPrompt = `You are an AI quiz generator for students. Generate ${questionCount} multiple choice quiz questions based on the following information.`;
    } else if (type === "flashcards") {
      systemPrompt = `You are an AI flashcard generator for students. Generate ${questionCount} flashcards based on the following information. Each flashcard should have a clear question on the front and a concise answer on the back.`;
    }
    
    let content = prepareContent(document, course, subject, topic);
    const apiType = selectAPI(document, course, subject, topic, prompt);

    if (apiType === "custom") {
      content = prompt;
    }

    systemPrompt += `\n${content}`;

    let formattingInstructions = '';
    if (type === "quiz") {
      formattingInstructions = `Format your response as a JSON array of objects. Each object should have these properties:
      - "question": The question text
      - "options": An array of 4 possible answers
      - "correctAnswer": The index of the correct answer (0-3)
      
      Example:
      [
        {
          "question": "What is the capital of France?",
          "options": ["London", "Berlin", "Paris", "Madrid"],
          "correctAnswer": 2
        },
        ...
      ]`;
    } else if (type === "flashcards") {
      formattingInstructions = `Format your response as a JSON array of objects. Each object should have these properties:
      - "question": The front side of the flashcard (the question)
      - "correctAnswer": The back side of the flashcard (the answer)
      
      Example:
      [
        {
          "question": "What is the capital of France?",
          "correctAnswer": "Paris"
        },
        ...
      ]`;
    }

    systemPrompt += `\n${formattingInstructions}`;

    console.log("System Prompt:", systemPrompt);

    // Call AIMLAPI instead of OpenAI
    const response = await fetch("https://api.aimlapi.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo-16k", // Using GPT 3.5 Turbo for similar capability
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("AIMLAPI error response:", response.status, errorData);
      return new Response(
        JSON.stringify({ 
          error: `AIMLAPI returned status ${response.status}`, 
          details: errorData 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 502 }
      );
    }

    const data = await response.json();
    console.log("Response from AIMLAPI:", JSON.stringify(data));
    
    const responseText = data.choices[0].message.content;
    console.log("Response Text:", responseText);

    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(responseText || "[]");
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      console.error("Response causing the error:", responseText);
      return new Response(
        JSON.stringify({ error: 'Failed to parse JSON response from AIMLAPI', rawResponse: responseText }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({ questions: parsedQuestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error processing document:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  return processDocument(req);
});
