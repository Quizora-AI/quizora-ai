
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
    const { message, course = '' } = await req.json();
    
    // Enhanced responses system with specialized knowledge domains
    const responses = {
      medical: [
        "The cardiac cycle consists of systole (contraction) and diastole (relaxation). During systole, the ventricles contract and eject blood into the pulmonary artery and aorta. This process is crucial for maintaining proper circulation and oxygenation of tissues.",
        "Antibiotics work by targeting bacterial cell walls, protein synthesis, or DNA replication. They are ineffective against viruses because viruses lack these structures and instead use host cell machinery to replicate. This is why viral infections typically require different treatment approaches.",
        "The Krebs cycle, also known as the citric acid cycle, is a series of biochemical reactions in the mitochondria that generates energy through the oxidation of acetyl-CoA derived from carbohydrates, fats, and proteins. It's a central part of cellular respiration and produces NADH and FADH₂ for the electron transport chain.",
        "Neurons communicate through both electrical and chemical signals. When an action potential reaches the axon terminal, neurotransmitters are released into the synapse to transmit the signal to the next cell. This process, called synaptic transmission, is fundamental to all neural functions including cognition, memory, and movement.",
        "Pharmacokinetics encompasses four main processes: absorption, distribution, metabolism, and excretion (ADME). These factors determine how drugs move through the body and affect their therapeutic efficacy and potential side effects.",
      ],
      mathematics: [
        "The fundamental theorem of calculus establishes the connection between differentiation and integration. It shows that these operations are inverse processes, which is why integration is sometimes called antidifferentiation.",
        "When solving differential equations, it's important to identify whether they're linear or nonlinear, as this determines the appropriate solution techniques. Linear differential equations follow the superposition principle, while nonlinear ones often require numerical methods.",
        "In linear algebra, eigenvalues and eigenvectors are particularly useful for understanding how linear transformations affect vector spaces. An eigenvector of a linear transformation is a non-zero vector that changes only by a scalar factor when the transformation is applied.",
        "Probability theory provides the mathematical foundation for statistics. When analyzing data, it's crucial to understand the difference between the probability density function (continuous variables) and probability mass function (discrete variables).",
        "In number theory, prime numbers serve as the building blocks of all integers through the Fundamental Theorem of Arithmetic. Finding efficient algorithms for primality testing remains an important area of research with applications in cryptography."
      ],
      physics: [
        "Quantum mechanics introduces the concept of wave-particle duality, which means that particles like electrons can exhibit both wave-like and particle-like properties depending on how they're observed. This principle is demonstrated in the famous double-slit experiment.",
        "Einstein's theory of general relativity describes gravity not as a force, but as a curvature of spacetime caused by mass and energy. This framework successfully predicted phenomena like gravitational waves and the bending of light around massive objects.",
        "Thermodynamics is governed by four fundamental laws. The third law states that as a system approaches absolute zero temperature, the entropy approaches a constant minimum value. This has profound implications for our understanding of perfect crystal structures and quantum systems.",
        "In electromagnetism, Maxwell's equations unify electricity and magnetism into a single coherent theory. These four equations describe how electric and magnetic fields are generated and altered by each other and by charges and currents.",
        "The Heisenberg Uncertainty Principle states that we cannot simultaneously know both the position and momentum of a particle with arbitrary precision. This is not due to measurement limitations but is a fundamental property of quantum systems."
      ],
      literature: [
        "Literary criticism offers multiple lenses for analyzing texts. The New Criticism approach focuses on close reading and the text's internal structure, while Reader-Response criticism examines how readers interact with and create meaning from texts.",
        "Narrative perspective significantly shapes how readers experience a story. First-person narration creates intimacy but limits knowledge to what the narrator knows, while third-person omniscient provides access to multiple characters' thoughts and broader context.",
        "Symbolism in literature allows authors to convey complex ideas through concrete images. When analyzing symbols, consider both universal archetypes and how the specific cultural and historical context might influence their interpretation.",
        "The structure of poetry—including meter, rhyme scheme, and stanza patterns—contributes substantially to its meaning. In free verse, though traditional structures are absent, poets still create rhythmic patterns through syntax, line breaks, and sound devices.",
        "Understanding literary movements like Romanticism, Realism, or Modernism provides context for interpreting texts. Each movement represents a response to historical events, philosophical ideas, and previous artistic traditions."
      ],
      chemistry: [
        "In organic chemistry, understanding reaction mechanisms is crucial for predicting outcomes. The concept of nucleophiles and electrophiles helps explain how atoms interact during reactions, with electrons flowing from electron-rich to electron-poor regions.",
        "Chemical equilibrium is a dynamic state where forward and reverse reactions occur at equal rates. Le Chatelier's principle helps predict how systems at equilibrium respond to disturbances, which is essential for optimizing industrial chemical processes.",
        "Molecular orbital theory provides a more accurate model of bonding than valence bond theory by describing how atomic orbitals combine to form molecular orbitals. This explains phenomena like paramagnetism in O₂ that simpler theories cannot account for.",
        "Acid-base chemistry extends beyond the Arrhenius definition to include the Brønsted-Lowry model (proton transfer) and Lewis model (electron pair donation). These frameworks help explain reactions in non-aqueous environments and coordination chemistry.",
        "Stereochemistry examines the three-dimensional arrangement of atoms in molecules. Chirality, a property where molecules exist as non-superimposable mirror images, has profound implications in pharmaceuticals where enantiomers can have dramatically different biological effects."
      ],
      computer_science: [
        "Algorithm complexity analysis using Big O notation helps predict performance as input sizes grow. When designing systems, it's crucial to understand the trade-offs between time and space complexity based on your specific requirements and constraints.",
        "In object-oriented programming, the SOLID principles guide the creation of maintainable and extensible code. The Single Responsibility Principle, for instance, states that a class should have only one reason to change, promoting modularity and reducing coupling.",
        "Database normalization reduces data redundancy and dependency by organizing fields and tables. However, sometimes strategic denormalization is necessary for performance optimization, especially in data-intensive applications with complex queries.",
        "Concurrency in programming introduces challenges like race conditions and deadlocks. Various synchronization mechanisms such as locks, semaphores, and monitors help manage shared resources, though each comes with different performance implications.",
        "Machine learning algorithms can be broadly categorized as supervised, unsupervised, and reinforcement learning. The choice between them depends on your data characteristics, available labels, and whether you're trying to predict outputs, discover patterns, or optimize a reward function."
      ],
      history: [
        "Historical analysis requires examining both primary sources (created during the period studied) and secondary sources (later interpretations). Each type offers different insights, and understanding their biases is essential for constructing balanced historical narratives.",
        "The transition from agricultural to industrial economies during the Industrial Revolution fundamentally altered social structures, urban development, and labor relations. These changes didn't occur uniformly across regions, creating economic disparities that persist today.",
        "Comparative history examines similar phenomena across different cultures or time periods. This approach helps identify both universal patterns in human societies and the unique contextual factors that lead to divergent historical outcomes.",
        "Environmental history explores the reciprocal relationship between humans and the natural world. Climate patterns, resource availability, and ecological changes have profoundly influenced the rise and fall of civilizations throughout history.",
        "Cultural history focuses on how people understood their world through art, literature, religion, and daily practices. By examining these expressions, historians gain insight into mentalities and experiences that might not be recorded in official political documents."
      ],
      study: [
        "Spaced repetition is one of the most effective study techniques based on cognitive science. Rather than cramming, schedule reviews at increasing intervals to strengthen neural connections and improve long-term retention of information.",
        "Active recall testing outperforms passive review methods. Instead of re-reading notes, challenge yourself to retrieve information from memory by self-quizzing or explaining concepts without reference materials.",
        "The Feynman Technique involves teaching concepts in simple language as if explaining to someone unfamiliar with the subject. This process helps identify gaps in your understanding and strengthens neural pathways associated with the information.",
        "Interleaving—mixing different but related topics or problems during study sessions—enhances discrimination skills and creates more robust neural connections. While it may feel more difficult than blocked practice, research shows it produces better long-term learning.",
        "Multisensory learning engages multiple neural pathways simultaneously. Try combining visual diagrams, verbal explanations, written summaries, and practical applications of concepts to create stronger and more diverse memory associations."
      ],
      general: [
        "Learning is most effective when you connect new information to existing knowledge. Try to identify relationships between concepts across different subjects to build a more comprehensive understanding of complex topics.",
        "Critical thinking involves evaluating information objectively, identifying assumptions, and considering alternative perspectives before drawing conclusions. This skill is valuable across all academic disciplines and professional fields.",
        "Effective note-taking goes beyond transcribing information. Methods like Cornell notes or mind mapping help process information actively, organize relationships between concepts, and create personalized review materials.",
        "Understanding your preferred learning style—visual, auditory, reading/writing, or kinesthetic—can help you select optimal study strategies. However, research shows that using multiple modalities often leads to better comprehension and retention.",
        "Metacognition—thinking about your own thinking processes—is crucial for academic success. Regularly assess what you understand well and what needs clarification, then adjust your study approach accordingly."
      ]
    };
    
    let responseCategory = 'general';
    let confidence = 0;
    
    // Advanced topic detection with weighted keywords
    const keywordMapping = {
      medical: ['anatomy', 'physiology', 'diagnosis', 'treatment', 'disease', 'patient', 'hospital', 'medicine', 'doctor', 'nurse', 'blood', 'heart', 'lung', 'brain', 'surgery', 'organ', 'cell', 'tissue', 'bone', 'muscle', 'nerve', 'prescription', 'drug'],
      mathematics: ['equation', 'formula', 'theorem', 'proof', 'calculus', 'algebra', 'geometry', 'trigonometry', 'statistics', 'probability', 'function', 'derivative', 'integral', 'matrix', 'vector', 'graph', 'polynomial', 'number', 'variable', 'coefficient'],
      physics: ['force', 'energy', 'mass', 'velocity', 'acceleration', 'momentum', 'gravity', 'electromagnetic', 'quantum', 'relativity', 'thermodynamics', 'wave', 'particle', 'nucleus', 'atom', 'electron', 'proton', 'neutron', 'light', 'optics'],
      literature: ['novel', 'poem', 'character', 'plot', 'theme', 'symbolism', 'metaphor', 'author', 'genre', 'narrative', 'analysis', 'interpretation', 'criticism', 'prose', 'poetry', 'fiction', 'nonfiction', 'literary', 'writing', 'reading'],
      chemistry: ['element', 'compound', 'molecule', 'reaction', 'acid', 'base', 'ph', 'solution', 'organic', 'inorganic', 'bond', 'electron', 'proton', 'neutron', 'periodic', 'metal', 'nonmetal', 'gas', 'liquid', 'solid'],
      computer_science: ['algorithm', 'programming', 'code', 'function', 'variable', 'database', 'network', 'hardware', 'software', 'memory', 'cpu', 'data', 'structure', 'object', 'class', 'method', 'loop', 'conditional', 'bit', 'byte'],
      history: ['century', 'era', 'period', 'war', 'revolution', 'civilization', 'empire', 'monarchy', 'democracy', 'society', 'culture', 'ancient', 'medieval', 'modern', 'historical', 'artifact', 'document', 'evidence', 'timeline', 'dynasty'],
      study: ['study', 'learn', 'memorize', 'remember', 'understand', 'exam', 'test', 'quiz', 'technique', 'method', 'retention', 'focus', 'concentration', 'notes', 'review', 'practice', 'recall', 'comprehension', 'academic', 'education']
    };
    
    const lowerMessage = message.toLowerCase();
    const matchingScores: Record<string, number> = {};
    
    // Calculate matching scores for each category
    for (const [category, keywords] of Object.entries(keywordMapping)) {
      matchingScores[category] = keywords.reduce((score, keyword) => {
        // Count occurrences of each keyword
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = (lowerMessage.match(regex) || []).length;
        return score + matches;
      }, 0);
    }
    
    // Account for the course if specified
    if (course) {
      const lowerCourse = course.toLowerCase();
      for (const [category, keywords] of Object.entries(keywordMapping)) {
        if (keywords.some(keyword => lowerCourse.includes(keyword))) {
          matchingScores[category] += 2; // Give extra weight to the course setting
        }
      }
    }
    
    // Find the category with highest score
    let maxScore = 0;
    Object.entries(matchingScores).forEach(([category, score]) => {
      if (score > maxScore) {
        maxScore = score;
        responseCategory = category;
        confidence = score;
      }
    });
    
    // If confidence is too low, use general category
    if (confidence < 1) {
      responseCategory = 'general';
    }
    
    // Select a relevant response based on message content
    const categoryResponses = responses[responseCategory as keyof typeof responses] || responses.general;
    
    // Add a more personalized touch to responses
    const personalizedIntros = [
      "Based on current research in this field, ",
      "As an experienced educator would explain, ",
      "From an academic perspective, ",
      "To answer your question thoroughly, ",
      "This is an interesting topic to explore. ",
      "Many students find this concept challenging. ",
      "To build on what you're asking about, "
    ];
    
    const personalizedOutros = [
      " Does this help clarify the concept for you?",
      " Would you like me to elaborate on any specific aspect of this?",
      " How does this connect to what you're currently studying?",
      " What other questions do you have about this topic?",
      " I hope this provides a good foundation for understanding this subject.",
      " This is a fascinating area with many applications to consider."
    ];
    
    // Select a random response from the appropriate category
    let responseText = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
    
    // Add personalization elements
    const intro = personalizedIntros[Math.floor(Math.random() * personalizedIntros.length)];
    const outro = personalizedOutros[Math.floor(Math.random() * personalizedOutros.length)];
    
    const aiResponse = {
      response: intro + responseText + outro
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
