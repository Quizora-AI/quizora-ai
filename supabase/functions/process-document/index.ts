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
  
  // Build the system prompt with more specific instructions for better quality
  const systemPrompt = `You are an expert educator specialized in creating quizzes. Create a quiz about ${subject || 'general knowledge'}${topic ? ` focusing on ${topic}` : ''} with difficulty level ${difficulty || 'medium'}.
  
  For each question:
  1. Create a clear, concise question.
  2. Provide exactly 4 options (A,B,C,D).
  3. ALWAYS include a detailed explanation of why the correct answer is right and why each incorrect option is wrong.
  4. Make the questions challenging but fair, appropriate for the difficulty level.
  
  Format your response as a series of questions with their options, correct answer, and explanation.`;
  
  try {
    console.log("Sending request to AIML API with system prompt:", systemPrompt);
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
            content: `${promptText}
            
Please generate ${numQuestions || 5} multiple-choice questions about ${topic || subject || 'the subject'}.
IMPORTANT: For each question, provide 4 options (A,B,C,D) and INCLUDE DETAILED EXPLANATIONS for why the correct answer is right and why each of the other options are wrong. This explanation is crucial for the educational purpose of the quiz.`
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("AIML API error:", response.status, errorText);
      throw new Error(`AIML API returned an error: ${response.status} ${errorText}`);
    }
    
    const responseData = await response.json();
    console.log("AIML API response received for quiz generation.");
    
    if (!responseData.choices || !responseData.choices[0] || !responseData.choices[0].message) {
      throw new Error("Invalid response format from AIML API");
    }
    
    const content = responseData.choices[0].message.content;
    console.log("Full API response content:", content);
    
    // Process the response to extract questions
    const questions = extractQuestions(content, numQuestions);
    console.log(`Extracted ${questions.length} questions from the API response.`);
    
    if (questions.length === 0) {
      throw new Error("Failed to extract questions from the API response");
    }
    
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
  
  // Build the system prompt with more specific instructions
  const systemPrompt = `You are an expert educator specialized in creating flashcards. Create ${questionCount} high-quality flashcards about ${subject}${topic ? ` focusing on ${topic}` : ''}${course ? ` for the course ${course}` : ''}.`;
  
  // Build the user prompt
  const userPrompt = `Generate ${questionCount} flashcards for studying ${subject}${topic ? ` on the topic of ${topic}` : ''}. 
  Each flashcard should have a question on the front and the answer on the back. 
  The questions should be clear and specific.
  The answers should be comprehensive but concise.
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
        max_tokens: 2500
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("AIML API error:", response.status, errorText);
      throw new Error(`AIML API returned an error: ${response.status} ${errorText}`);
    }
    
    const responseData = await response.json();
    console.log("AIML API response received for flashcards generation");
    
    if (!responseData.choices || !responseData.choices[0] || !responseData.choices[0].message) {
      throw new Error("Invalid response format from AIML API");
    }
    
    const content = responseData.choices[0].message.content;
    console.log("Full API response content:", content);
    
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
    
    const fallbackCards = generateFallbackFlashcards(subject, topic, questionCount);
    return new Response(JSON.stringify({ 
      questions: fallbackCards,
      _warning: "Used fallback cards due to API error"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Improved helper function to extract questions from the AI response
function extractQuestions(content, numQuestions = 10) {
  try {
    console.log("Attempting to extract questions from content");
    // Try to find a JSON block in the response first
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsedJson = JSON.parse(jsonMatch[0]);
        if (parsedJson.questions && Array.isArray(parsedJson.questions)) {
          console.log("Successfully extracted questions from JSON format");
          return parsedJson.questions;
        }
      } catch (e) {
        console.error("Error parsing JSON:", e);
        // Continue to text parsing if JSON parsing fails
      }
    }
    
    // If no JSON found or parsing failed, parse the text to extract questions
    const questions = [];
    const lines = content.split('\n');
    
    let currentQuestion = null;
    let options = [];
    let correctAnswer = null;
    let explanation = '';
    let collectingExplanation = false;
    let questionNumber = 0;
    
    console.log("Parsing response line by line...");
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) continue;
      
      // Look for question patterns like "1.", "Question 1:", etc.
      if (/^(\d+[\.\)]|Question\s+\d+:)/i.test(line) && !collectingExplanation) {
        // Save previous question if exists
        if (currentQuestion && options.length >= 2) {
          questions.push({
            id: `q-${Date.now()}-${questionNumber}`,
            question: currentQuestion,
            options,
            correctAnswer: correctAnswer !== null ? correctAnswer : 0,
            explanation: explanation || "No explanation provided."
          });
          
          questionNumber++;
          if (questions.length >= numQuestions) break;
        }
        
        // Start new question
        currentQuestion = line.replace(/^\d+[\.\)]|\s*Question\s+\d+:\s*/i, '').trim();
        options = [];
        correctAnswer = null;
        explanation = '';
        collectingExplanation = false;
        console.log(`Found question: ${currentQuestion}`);
      }
      // Look for options like "A.", "B)", "1.", "2)", etc.
      else if ((/^[A-D][\.\):]|^\d+[\.\):]/).test(line) && currentQuestion && !collectingExplanation) {
        const optionText = line.replace(/^[A-D][\.\):]|\d+[\.\):]/, '').trim();
        if (optionText) {
          options.push(optionText);
          console.log(`Found option: ${optionText}`);
          
          // Check if this option is marked as correct
          if (line.toLowerCase().includes('correct') || 
              (i + 1 < lines.length && lines[i + 1].toLowerCase().includes('correct'))) {
            correctAnswer = options.length - 1;
            console.log(`Marked option ${options.length} as correct`);
          }
        }
      }
      // Look for answer indication
      else if (currentQuestion && /correct\s+(answer|option)|answer[:\s]+[A-D]/i.test(line) && !collectingExplanation) {
        const answerMatch = line.match(/[A-D]/i);
        if (answerMatch) {
          const letter = answerMatch[0].toUpperCase();
          correctAnswer = 'ABCD'.indexOf(letter);
          console.log(`Found correct answer: ${letter} (index ${correctAnswer})`);
        }
      }
      // Look for explanation
      else if (currentQuestion && /explanation|rationale|reason/i.test(line)) {
        explanation = line.replace(/^explanation[:\s]*|^rationale[:\s]*|^reason[:\s]*/i, '').trim();
        collectingExplanation = true;
        console.log(`Found explanation start: ${explanation}`);
      }
      // Collect multiline explanation
      else if (collectingExplanation && currentQuestion) {
        if (!/^(\d+[\.\)]|Question\s+\d+:|[A-D][\.\):])/i.test(line)) {
          explanation += ' ' + line.trim();
        } else {
          collectingExplanation = false;
          i--; // Process this line again to catch the new question or option
        }
      }
    }
    
    // Don't forget the last question
    if (currentQuestion && options.length >= 2) {
      questions.push({
        id: `q-${Date.now()}-${questionNumber}`,
        question: currentQuestion,
        options,
        correctAnswer: correctAnswer !== null ? correctAnswer : 0,
        explanation: explanation || "No explanation provided."
      });
      console.log(`Added final question: ${currentQuestion}`);
    }
    
    if (questions.length > 0) {
      console.log(`Successfully extracted ${questions.length} questions from text format`);
      return questions;
    }
    
    // If we couldn't extract properly formatted questions, generate fallbacks
    console.warn("Could not extract questions, generating fallbacks");
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
      id: `fallback-${Date.now()}-${i}`,
      question: `Sample question ${i}?`,
      options: [
        `Option A for question ${i}`,
        `Option B for question ${i}`,
        `Option C for question ${i}`,
        `Option D for question ${i}`
      ],
      correctAnswer: 0,
      explanation: `This is a sample explanation for question ${i}. Option A is correct because it accurately represents the concept being tested. Options B, C, and D are incorrect because they contain factual errors or misrepresentations of the concept.`
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
