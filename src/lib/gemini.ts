const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const MODEL = 'gemini-2.5-flash';

if (!API_KEY) {
  console.warn('[Nexora] VITE_GEMINI_API_KEY is not set');
}

export interface QuestionData {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
}

const CATEGORY_PROMPTS = {
  general:
    'general knowledge: science, history, geography, nature, culture, space, art, famous facts',
  football:
    'football/soccer: FIFA World Cup, UEFA Champions League, Premier League, La Liga, Serie A, Bundesliga, Ligue 1, famous players, records, football history',
  ai:
    'artificial intelligence, machine learning, deep learning, neural networks, large language models, generative AI, blockchain, Web3, cryptocurrency, robotics, emerging technology',
};

const DIFFICULTY_PROMPTS = {
  easy:   'straightforward, well-known facts that most people would know',
  medium: 'requires some specific knowledge, moderately challenging',
  hard:   'requires deep expertise or very specific/obscure knowledge',
};

function isQuestionData(value: unknown): value is QuestionData {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<QuestionData>;
  const options = candidate.options;

  return (
    typeof candidate.question === 'string' &&
    !!options &&
    typeof options.A === 'string' &&
    typeof options.B === 'string' &&
    typeof options.C === 'string' &&
    typeof options.D === 'string' &&
    (candidate.correct === 'A' ||
      candidate.correct === 'B' ||
      candidate.correct === 'C' ||
      candidate.correct === 'D') &&
    typeof candidate.explanation === 'string'
  );
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

async function requestGemini(prompt: string): Promise<string> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(API_KEY)}`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });
  const data = (await response.json()) as GeminiResponse;

  if (!response.ok) {
    throw new Error(data.error?.message || `Gemini request failed with status ${response.status}`);
  }

  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '';
  if (!text) {
    throw new Error('Gemini response did not include text');
  }

  return text;
}

export async function generateQuestion(
  category: 'general' | 'football' | 'ai',
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<QuestionData> {
  const prompt = `You are a quiz question generator for Nexora, a competitive learning platform.

Generate exactly ONE multiple-choice question about: ${CATEGORY_PROMPTS[category]}
Difficulty: ${DIFFICULTY_PROMPTS[difficulty]}

STRICT RULES:
- Return ONLY valid JSON. No markdown, no code blocks, no extra text.
- Question must be factually accurate.
- All 4 options must be plausible; only one is correct.
- Explanation: 1-2 sentences, clear and educational.
- Language: English ONLY.
- Generate a unique question — avoid common/repetitive questions.

Return EXACTLY this JSON (nothing else):
{"question":"Your question here?","options":{"A":"First option","B":"Second option","C":"Third option","D":"Fourth option"},"correct":"B","explanation":"Brief factual explanation."}`;

  let lastError: unknown = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const raw = (await requestGemini(prompt))
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();

      const parsed: unknown = JSON.parse(raw);

      if (!isQuestionData(parsed)) {
        throw new Error('AI response missing required question fields');
      }

      return parsed;
    } catch (err: unknown) {
      console.error(`[Gemini] Attempt ${attempt} failed:`, err);
      lastError = err;
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 700));
      }
    }
  }

  throw new Error(`Failed to generate question: ${errorMessage(lastError)}`);
}
