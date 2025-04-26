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
  
  // Enhanced system prompt with better education expertise and difficulty considerations
  const systemPrompt = `You are an elite professor and educational assessment expert specializing in creating high-quality ${subject || 'general knowledge'} questions.
  
  Your expertise is in designing questions that accurately assess student knowledge at different difficulty levels:
  
  - EASY: Direct recall questions testing fundamental concepts, suitable for beginners
  - MEDIUM: Application questions requiring connections between concepts, suitable for intermediate students
  - HARD: Analysis questions requiring critical thinking, synthesis of multiple concepts, and advanced problem-solving, suitable for the most competitive exams
  
  For each question:
  1. Create a clear, precisely worded question appropriate for the requested difficulty level
  2. Provide 4 answer options labeled A, B, C, D with only one correct answer
  3. For EASY questions: wrong answers should be clearly distinguishable
  4. For MEDIUM questions: wrong answers should represent common misunderstandings
  5. For HARD questions: wrong answers should be very plausible and require deep understanding to eliminate
  6. Write a detailed explanation in bullet-point format covering:
     • Why the correct answer is right (with reference to specific concepts)
     • Why each incorrect option is wrong (with specific errors identified)
     • Common misconceptions that might lead students to select each wrong option
  
  Format your response as a JSON object with this structure:
  {
    "questions": [
      {
        "question": "Question text here",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0, // index of correct answer (0-3)
        "explanation": "Detailed explanation of the correct answer and why other options are incorrect",
        "difficulty": "${difficulty || 'medium'}" // explicit difficulty level
      },
      // more questions...
    ]
  }`;
  
  try {
    console.log("Sending request to AI API for quiz generation");
    const response = await fetch("https://api.aimlapi.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
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
            content: `${promptText}
            
Generate ${numQuestions || 10} multiple-choice questions on this topic with difficulty level: ${difficulty || 'medium'}. 

For each question:
- The question should be clear and test understanding at the appropriate difficulty level
- Provide 4 options (A, B, C, D) with exactly one correct answer
- The incorrect options should represent common misconceptions students have
- Include a detailed explanation in bullet-point format that:
  • Explains why the correct answer is right
  • Explains why each wrong answer is incorrect
  • Identifies the specific misconception each wrong answer represents

IMPORTANT: Format your response as a valid JSON object with the structure shown in the system prompt. Each question MUST include a 'difficulty' property.`
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
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
    console.log("API response content:", content);
    
    // Process the response to extract questions
    const questions = extractQuestionsFromAI(content, numQuestions, difficulty);
    console.log(`Extracted ${questions.length} questions from the API response.`);
    
    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (apiError) {
    console.error("API call failed:", apiError);
    throw apiError;
  }
}

function extractQuestionsFromAI(content, numQuestions = 10, defaultDifficulty = 'medium') {
  try {
    // Try to find a JSON block in the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsedJson = JSON.parse(jsonMatch[0]);
        if (parsedJson.questions && Array.isArray(parsedJson.questions)) {
          // Ensure each question has a difficulty property
          return parsedJson.questions.map(q => ({
            ...q,
            difficulty: q.difficulty || defaultDifficulty
          }));
        }
      } catch (parseError) {
        console.error("Error parsing JSON from API response:", parseError);
      }
    }
    
    // If JSON parsing failed, try structured text parsing
    return parseStructuredQuizContent(content, numQuestions, defaultDifficulty);
  } catch (error) {
    console.error("Error extracting questions:", error);
    // Throw the error to be handled by the caller
    throw new Error("Failed to extract valid quiz questions from AI response");
  }
}

function parseStructuredQuizContent(content, numQuestions, defaultDifficulty) {
  const questions = [];
  const lines = content.split('\n');
  
  let currentQuestion = null;
  let options = [];
  let correctAnswer = null;
  let explanation = '';
  let collectingExplanation = false;
  let difficulty = defaultDifficulty;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;
    
    // Check for difficulty markers
    if (/difficulty:\s*(easy|medium|hard)/i.test(line)) {
      const diffMatch = line.match(/difficulty:\s*(easy|medium|hard)/i);
      if (diffMatch && diffMatch[1]) {
        difficulty = diffMatch[1].toLowerCase();
      }
    }
    
    // Look for question patterns like "1.", "Question 1:", etc.
    if (/^(\d+[\.\)]|Question\s+\d+:)/i.test(line) && !collectingExplanation) {
      // Save previous question if exists
      if (currentQuestion && options.length >= 2) {
        questions.push({
          question: currentQuestion,
          options,
          correctAnswer: correctAnswer !== null ? correctAnswer : 0,
          explanation: explanation || "No explanation provided.",
          difficulty
        });
        
        if (questions.length >= numQuestions) break;
      }
      
      // Start new question
      currentQuestion = line.replace(/^\d+[\.\)]|\s*Question\s+\d+:\s*/i, '').trim();
      options = [];
      correctAnswer = null;
      explanation = '';
      collectingExplanation = false;
      difficulty = defaultDifficulty; // Reset difficulty for new question
    }
    // Look for options like "A.", "B)", "1.", "2)", etc.
    else if (/^[A-D][\.\)]|^\d+[\.\)]/.test(line) && currentQuestion && !collectingExplanation) {
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
    else if (currentQuestion && /correct\s+(answer|option)|answer[:\s]+[A-D]/i.test(line) && !collectingExplanation) {
      const answerMatch = line.match(/[A-D]/i);
      if (answerMatch) {
        const letter = answerMatch[0].toUpperCase();
        correctAnswer = 'ABCD'.indexOf(letter);
      }
    }
    // Look for explanation
    else if (currentQuestion && /explanation|rationale|reason|clarification/i.test(line)) {
      explanation = line.replace(/^explanation[:\s]*|^rationale[:\s]*|^reason[:\s]*|^clarification[:\s]*/i, '').trim();
      collectingExplanation = true;
    }
    // Collect multiline explanation
    else if (collectingExplanation && currentQuestion) {
      if (!/^(\d+[\.\)]|Question\s+\d+:|[A-D][\.\)])/i.test(line)) {
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
      question: currentQuestion,
      options,
      correctAnswer: correctAnswer !== null ? correctAnswer : 0,
      explanation: explanation || "No explanation provided.",
      difficulty
    });
  }
  
  return questions;
}

async function handleFlashcardGeneration(requestData, apiKey) {
  console.log("Processing flashcard generation request");
  
  // Extract parameters
  const { course, subject, topic, questionCount } = requestData;
  
  if (!subject) {
    throw new Error("Subject is required for flashcard generation");
  }
  
  // Build the system prompt with enhanced educational focus
  const systemPrompt = `You are an expert educator with a PhD in ${subject || 'education'} and years of experience creating highly effective educational materials. 
  
  Create ${questionCount} high-quality flashcards about ${subject}${topic ? ` focusing on ${topic}` : ''}${course ? ` for the course ${course}` : ''}.
  
  Each flashcard should:
  1. Have a clear, focused question that tests one specific concept
  2. Provide a comprehensive but concise answer that fully addresses the question
  3. Include key terminology, dates, formulas, or definitions as appropriate
  4. Be designed at an appropriate difficulty level for college/university students
  5. Focus on concepts that commonly appear in exams
  
  Your flashcards should prioritize quality over quantity, ensuring each card contributes meaningfully to the student's understanding.`;
  
  // Build the user prompt
  const userPrompt = `Generate ${questionCount} high-quality, exam-oriented flashcards for studying ${subject}${topic ? ` on the topic of ${topic}` : ''}. 
  Each flashcard should have a question on the front that tests a specific concept likely to appear in exams, and a comprehensive answer on the back.
  
  For each flashcard:
  - Make the question clear and specific
  - Ensure the answer is complete but concise
  - Include relevant facts, examples, or explanations
  - Focus on concepts that often appear in exams
  - Cover the most important aspects of ${topic || subject} that students need to know
  
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
        model: "gpt-4o",
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
