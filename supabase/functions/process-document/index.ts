import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { OpenAI } from "https://deno.land/x/openai@v1.3.0/mod.ts";

const apiKey = Deno.env.get("OPENAI_API_KEY");

if (!apiKey) {
  console.warn("OPENAI_API_KEY environment variable not set!");
}

const openai = new OpenAI(apiKey);

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
    
    let content = '';
    if (document) {
      content = `Document content:\n${document}\n`;
    } else {
      content = `Course: ${course}\nSubject: ${subject}\n`;
      if (topic) {
        content += `Topic: ${topic}\n`;
      }
    }

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

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
      ],
    });

    const responseText = completion.choices[0].message.content;

    console.log("Response Text:", responseText);

    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(responseText || "[]");
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      console.error("Response causing the error:", responseText);
      return new Response(
        JSON.stringify({ error: 'Failed to parse JSON response from OpenAI' }),
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
