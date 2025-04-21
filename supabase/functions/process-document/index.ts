
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AIMLAPI_KEY = Deno.env.get('AIMLAPI_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!AIMLAPI_KEY) {
      console.error("Missing API key: AIMLAPI_KEY");
      throw new Error("API key is not configured. Please contact the administrator.");
    }
    
    const requestData = await req.json();
    console.log("Received request:", JSON.stringify(requestData));

    // For quiz generation
    if (requestData.promptText) {
      return await handleQuizGeneration(requestData, AIMLAPI_KEY);
    }
    
    // For flashcard generation
    if (requestData.type === 'flashcards') {
      return await handleFlashcardGeneration(requestData, AIMLAPI_KEY);
    }
    
    throw new Error(`Unsupported request format. Please include either 'promptText' for quiz or 'type: flashcards' for flashcards.`);
  } catch (error) {
    console.error("Error in process-document function:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "An unexpected error occurred",
        details: error.stack || "No additional details available"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function handleQuizGeneration(requestData, apiKey) {
  console.log("Processing quiz generation request");
  
  const { promptText, difficulty, numQuestions, subject, topic } = requestData;
  
  if (!promptText) {
    throw new Error("Prompt text is required for quiz generation");
  }
  
  // Build the system prompt
  const systemPrompt = `You are an expert educator specialized in creating quizzes. Create a quiz about ${subject || 'general knowledge'}${topic ? ` focusing on ${topic}` : ''} with difficulty level ${difficulty || 'medium'}.`;
  
  // Call AIML API
  try {
    const response = await fetch("https://api.aimlapi.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
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
        max_tokens: 2000
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("AIML API error:", response.status, errorText);
      throw new Error(`AIML API returned an error: ${response.status} ${errorText}`);
    }
    
    const responseData = await response.json();
    console.log("AIML API response for quiz:", JSON.stringify(responseData));
    
    if (!responseData.choices || !responseData.choices[0] || !responseData.choices[0].message) {
      throw new Error("Invalid response format from AIML API");
    }
    
    const content = responseData.choices[0].message.content;
    
    // Process the response to extract questions
    const questions = extractQuestions(content, numQuestions);
    
    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (apiError) {
    console.error("API call failed:", apiError);
    throw apiError;
  }
}

async function handleFlashcardGeneration(requestData, apiKey) {
  console.log("Processing flashcard generation request");
  
  // Extract parameters
  const { course, subject, topic, questionCount } = requestData;
  
  if (!subject) {
    throw new Error("Subject is required for flashcard generation");
  }
  
  // Build the system prompt
  const systemPrompt = `You are an expert educator specialized in creating flashcards. Create ${questionCount} flashcards about ${subject}${topic ? ` focusing on ${topic}` : ''}${course ? ` for the course ${course}` : ''}.`;
  
  // Build the user prompt
  const userPrompt = `Generate ${questionCount} flashcards for studying ${subject}${topic ? ` on the topic of ${topic}` : ''}. 
  Each flashcard should have a question on the front and the answer on the back. 
  Return the data in this exact JSON format: 
  {
    "questions": [
      {
        "question": "question text for front of card",
        "correctAnswer": "answer text for back of card"
      }
    ]
  }`;
  
  console.log("System prompt:", systemPrompt);
  console.log("User prompt:", userPrompt);
  
  // Call AIML API
  try {
    const response = await fetch("https://api.aimlapi.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("AIML API error:", response.status, errorText);
      throw new Error(`AIML API returned an error: ${response.status} ${errorText}`);
    }
    
    const responseData = await response.json();
    console.log("AIML API response for flashcards:", JSON.stringify(responseData));
    
    if (!responseData.choices || !responseData.choices[0] || !responseData.choices[0].message) {
      throw new Error("Invalid response format from AIML API");
    }
    
    const content = responseData.choices[0].message.content;
    console.log("Content from API:", content);
    
    try {
      // Extract the JSON part from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Could not extract JSON from the API response");
      }
      
      const jsonContent = jsonMatch[0];
      const parsedContent = JSON.parse(jsonContent);
      
      if (!parsedContent.questions || !Array.isArray(parsedContent.questions)) {
        throw new Error("Invalid flashcard data format");
      }
      
      return new Response(JSON.stringify(parsedContent), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (jsonError) {
      console.error("Error parsing JSON from API response:", jsonError);
      // Fallback handling
      const fallbackCards = generateFallbackFlashcards(subject, topic, questionCount);
      return new Response(JSON.stringify({ 
        questions: fallbackCards,
        _warning: "Used fallback cards due to parsing error"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (apiError) {
    console.error("API call failed:", apiError);
    
    // Generate fallback flashcards when the API call fails
    const fallbackCards = generateFallbackFlashcards(subject, topic, questionCount);
    return new Response(JSON.stringify({ 
      questions: fallbackCards,
      _warning: "Used fallback cards due to API error"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Helper function to extract questions from the AI response
function extractQuestions(content, numQuestions = 10) {
  try {
    // Try to find a JSON block in the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedJson = JSON.parse(jsonMatch[0]);
      if (parsedJson.questions && Array.isArray(parsedJson.questions)) {
        return parsedJson.questions;
      }
    }
    
    // If no JSON found, parse the text to extract questions
    const questions = [];
    const lines = content.split('\n');
    
    let currentQuestion = null;
    let options = [];
    let correctAnswer = null;
    let explanation = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for question patterns like "1.", "Question 1:", etc.
      if (/^(\d+[\.\)]|Question\s+\d+:)/i.test(line) && line.length > 2) {
        // Save previous question if exists
        if (currentQuestion && options.length >= 2) {
          questions.push({
            question: currentQuestion,
            options,
            correctAnswer: correctAnswer !== null ? correctAnswer : 0,
            explanation: explanation || "No explanation provided."
          });
          
          if (questions.length >= numQuestions) break;
        }
        
        // Start new question
        currentQuestion = line.replace(/^\d+[\.\)]|\s*Question\s+\d+:\s*/i, '').trim();
        options = [];
        correctAnswer = null;
        explanation = '';
      }
      // Look for options like "A.", "B)", "1.", "2)", etc.
      else if (/^[A-D][\.\)]|^\d+[\.\)]/.test(line) && currentQuestion) {
        const optionText = line.replace(/^[A-D][\.\)]|\d+[\.\)]/, '').trim();
        if (optionText) {
          options.push(optionText);
          
          // Check if this option is marked as correct
          if (line.toLowerCase().includes('correct') || (i + 1 < lines.length && lines[i + 1].toLowerCase().includes('correct'))) {
            correctAnswer = options.length - 1;
          }
        }
      }
      // Look for answer indication
      else if (currentQuestion && /correct\s+(answer|option)|answer[:\s]+[A-D]/i.test(line)) {
        const answerMatch = line.match(/[A-D]/i);
        if (answerMatch) {
          const letter = answerMatch[0].toUpperCase();
          correctAnswer = 'ABCD'.indexOf(letter);
        }
      }
      // Look for explanation
      else if (currentQuestion && /explanation/i.test(line)) {
        explanation = line.replace(/^explanation[:\s]*/i, '').trim();
        // Collect multiline explanation
        let j = i + 1;
        while (j < lines.length && !(/^(\d+[\.\)]|Question\s+\d+:|[A-D][\.\)])/i.test(lines[j]))) {
          if (lines[j].trim()) {
            explanation += ' ' + lines[j].trim();
          }
          j++;
        }
      }
    }
    
    // Don't forget the last question
    if (currentQuestion && options.length >= 2) {
      questions.push({
        question: currentQuestion,
        options,
        correctAnswer: correctAnswer !== null ? correctAnswer : 0,
        explanation: explanation || "No explanation provided."
      });
    }
    
    if (questions.length > 0) {
      return questions;
    }
    
    // If we couldn't extract properly formatted questions, generate fallbacks
    return generateFallbackQuestions(numQuestions);
  } catch (error) {
    console.error("Error extracting questions:", error);
    return generateFallbackQuestions(numQuestions);
  }
}

// Helper function to generate fallback questions
function generateFallbackQuestions(count = 5) {
  const questions = [];
  
  for (let i = 1; i <= count; i++) {
    questions.push({
      question: `Sample question ${i}?`,
      options: [
        `Option A for question ${i}`,
        `Option B for question ${i}`,
        `Option C for question ${i}`,
        `Option D for question ${i}`
      ],
      correctAnswer: 0,
      explanation: `This is a sample explanation for question ${i}.`
    });
  }
  
  return questions;
}

// Helper function to generate fallback flashcards when the API fails
function generateFallbackFlashcards(subject: string, topic?: string, count = 5) {
  const cards = [];
  const topicText = topic || subject;
  
  // Generate simple flashcards based on the topic
  for (let i = 1; i <= Math.min(count, 5); i++) {
    cards.push({
      question: `Sample question ${i} about ${topicText}?`,
      correctAnswer: `Sample answer ${i} about ${topicText}.`
    });
  }
  
  return cards;
}
