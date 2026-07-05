export interface QuestionData {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export async function generateQuestion(
  category: 'general' | 'football' | 'ai',
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<QuestionData> {
  const response = await fetch('/api/generate-question', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, difficulty }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(
      errBody.error || `Request failed with status ${response.status}`
    );
  }

  return response.json();
}
