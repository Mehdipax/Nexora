import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

export interface QuestionData {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

const CATEGORY_PROMPTS = {
  general: 'general knowledge: science, history, geography, nature, culture, space, art, famous facts',
  football: 'football/soccer: FIFA World Cup, UEFA Champions League, Premier League, La Liga, Serie A, Bundesliga, famous players, records, football history',
  ai: 'artificial intelligence, machine learning, deep learning, neural networks, large language models, generative AI, blockchain, Web3, cryptocurrency, robotics, emerging technology',
};

const DIFFICULTY_PROMPTS = {
  easy: 'straightforward, well-known facts that most people would know',
  medium: 'requires some specific knowledge, moderately challenging',
  hard: 'requires deep expertise or very specific/obscure knowledge',
};

export async function generateQuestion(
  category: 'general' | 'football' | 'ai',
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<QuestionData> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: { temperature: 0.9, maxOutputTokens: 512 },
  });

  const prompt = `You are a quiz question generator for Nexora platform.
Generate exactly ONE multiple-choice question about: ${CATEGORY_PROMPTS[category]}
Difficulty: ${DIFFICULTY_PROMPTS[difficulty]}
RULES: Return ONLY valid JSON, no markdown, no code blocks, no extra text.
Question must be factually accurate. All 4 options plausible, only one correct.
Explanation: 1-2 sentences. Language: English ONLY. Generate a unique question.
Return EXACTLY this JSON:
{"question":"Your question?","options":{"A":"Option A","B":"Option B","C":"Option C","D":"Option D"},"correct":"B","explanation":"Brief explanation."}`;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const raw = result.response.text()
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();

      const parsed: QuestionData = JSON.parse(raw);

      if (!parsed.question || !parsed.options || !parsed.correct || !parsed.explanation)
        throw new Error('Missing fields');
      if (!['A','B','C','D'].includes(parsed.correct))
        throw new Error('Invalid answer');
      if (!parsed.options.A || !parsed.options.B || !parsed.options.C || !parsed.options.D)
        throw new Error('Missing options');

      return parsed;
    } catch (err) {
      if (attempt === 2) throw new Error('Failed to generate question. Please try again.');
      await new Promise(r => setTimeout(r, 600));
    }
  }
  throw new Error('Failed to generate question.');
}
