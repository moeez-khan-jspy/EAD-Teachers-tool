// MCQ generation prompt
export const MCQ_PROMPT = (text) => `
  You are an expert assessment system. Analyze the given text and generate conceptual multiple choice questions.
  Focus on testing understanding of:
  1. Core concepts and principles
  2. Logical relationships between ideas
  3. Application of concepts
  4. Critical thinking and analysis
  5. Cause and effect relationships

  Generate 5 multiple choice questions based on the following text:
  
  ${text}

  Format your response as a valid JSON array with this exact structure:
  [
    {
      "id": 1,
      "question": "What is X?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why this is the correct answer and why others are incorrect"
    }
  ]

  Rules:
  1. Generate exactly 5 questions
  2. Each question must have exactly 4 options
  3. correctAnswer must be 0-3 (index of correct option)
  4. Questions should test deep understanding, not just memorization
  5. Include tricky but plausible incorrect options
  6. Add a detailed explanation for each question
  7. Return ONLY the JSON array, no other text
`;

// Short answer questions generation prompt
export const SHORT_ANSWER_PROMPT = (text) => `
  You are an expert assessment system. Generate in-depth conceptual questions that test deep understanding.
  Focus on:
  1. Core theoretical concepts
  2. Problem-solving abilities
  3. Critical analysis
  4. Application of principles
  5. Cause-effect relationships

  Generate 2 short answer questions based on the following text:
  
  ${text}

  Format your response as a valid JSON array with this exact structure:
  [
    {
      "id": 1,
      "question": "What is X?",
      "expectedAnswer": "Detailed model answer that covers all key points",
      "keyPoints": [
        {
          "point": "Key concept or idea that must be present",
          "explanation": "Why this point is important and how it should be explained"
        }
      ],
      "commonMisconceptions": [
        "List common incorrect understandings or partial answers"
      ],
      "gradingCriteria": {
        "excellent": "What constitutes a full score answer",
        "good": "What constitutes a high score answer",
        "fair": "What constitutes a medium score answer",
        "poor": "What constitutes a low score answer",
        "zero": "What constitutes a zero score answer"
      }
    }
  ]

  Rules:
  1. Generate exactly 2 questions
  2. Questions should require detailed explanations
  3. Key points should be specific and measurable
  4. Include common misconceptions to watch for
  5. Provide clear grading criteria
  6. Return ONLY the JSON array, no other text
`;
