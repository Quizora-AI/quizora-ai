
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    
    // For now, we'll simulate responses as this is a demo
    // In a real implementation, this would connect to an AI service like OpenAI
    
    const responses = {
      medical: [
        "The cardiac cycle consists of systole (contraction) and diastole (relaxation). During systole, the ventricles contract and eject blood into the pulmonary artery and aorta.",
        "Antibiotics work by targeting bacterial cell walls, protein synthesis, or DNA replication. They are ineffective against viruses because viruses lack these structures.",
        "The Krebs cycle, also known as the citric acid cycle, is a series of chemical reactions in the mitochondria that generates energy through the oxidation of acetyl-CoA derived from carbohydrates, fats, and proteins.",
        "Neurons communicate through both electrical and chemical signals. When an action potential reaches the axon terminal, neurotransmitters are released into the synapse to transmit the signal to the next cell.",
      ],
      study: [
        "Spaced repetition is one of the most effective study techniques. Try reviewing your material at increasing intervals to improve long-term retention.",
        "Active recall testing has been shown to be more effective than passive reviewing. Try to answer questions without looking at your notes first.",
        "Teaching concepts to others can significantly improve your understanding. Even explaining to an imaginary student can help solidify your knowledge.",
        "Taking regular breaks using the Pomodoro Technique (25 minutes of focused study followed by a 5-minute break) can help maintain concentration and avoid burnout."
      ],
      general: [
        "I'm here to help with your medical studies. Feel free to ask specific questions about anatomy, physiology, pathology, pharmacology, or any other medical topic.",
        "Medical education requires both theoretical knowledge and practical application. Make sure to understand the underlying mechanisms rather than just memorizing facts.",
        "Connecting concepts across different systems of the body can help build a more comprehensive understanding of medicine.",
        "Remember that medical knowledge is constantly evolving. Stay updated with recent research and guidelines in your field of interest."
      ]
    };
    
    let responseCategory = 'general';
    
    // Simple keyword matching to determine response category
    const medicalKeywords = ['heart', 'blood', 'disease', 'anatomy', 'organ', 'cell', 'tissue', 'bone', 'muscle', 'nerve', 'brain', 'drug', 'medicine'];
    const studyKeywords = ['study', 'learn', 'memorize', 'remember', 'understand', 'exam', 'test', 'quiz', 'technique', 'method'];
    
    const lowerMessage = message.toLowerCase();
    
    if (medicalKeywords.some(keyword => lowerMessage.includes(keyword))) {
      responseCategory = 'medical';
    } else if (studyKeywords.some(keyword => lowerMessage.includes(keyword))) {
      responseCategory = 'study';
    }
    
    // Select a random response from the appropriate category
    const categoryResponses = responses[responseCategory];
    const randomResponse = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
    
    // In a real implementation, this would be the response from an AI service
    const aiResponse = {
      response: randomResponse
    };
    
    return new Response(JSON.stringify(aiResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
    
  } catch (error) {
    console.error('Error in AI assistant function:', error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
})
