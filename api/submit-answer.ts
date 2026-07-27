type CategoryType = 'general' | 'football' | 'ai';
type DifficultyType = 'easy' | 'medium' | 'hard';
type RankType = 'Beginner' | 'Bronze' | 'Silver' | 'Gold';

const XP_TABLE: Record<CategoryType, Record<DifficultyType, number>> = {
  general: { easy: 10, medium: 20, hard: 40 },
  football: { easy: 10, medium: 20, hard: 40 },
  ai: { easy: 15, medium: 30, hard: 60 },
};

const STREAK_BONUS: Record<number, number> = {
  1: 10,
  2: 20,
  3: 30,
  4: 40,
  5: 50,
};

function calcLevel(xp: number): number {
  return Math.floor(xp / 100);
}

function calcLevelProgress(xp: number): number {
  return xp % 100;
}

function calcXPToNext(xp: number): number {
  return (Math.floor(xp / 100) + 1) * 100 - xp;
}

function calcRankScore(xp: number, correct: number, total: number): number {
  const acc = total > 0 ? correct / total : 0;
  return Math.round(xp * 0.5 + correct * 10 + acc * 100 + total * 2);
}

function calcRank(score: number): RankType {
  if (score >= 1000) return 'Gold';
  if (score >= 500) return 'Silver';
  if (score >= 200) return 'Bronze';
  return 'Beginner';
}

interface ApiRequest {
  method?: string;
  body?: {
    questionId?: string;
    walletAddress?: string;
    selectedAnswer?: string | null;
    category?: string;
    difficulty?: string;
  };
}

interface ApiResponse {
  status: (code: number) => { json: (body: Record<string, unknown>) => void };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');

    const { questionId, walletAddress, selectedAnswer, category, difficulty } =
      req.body || {};

    if (!questionId || !walletAddress || !category || !difficulty) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      res.status(500).json({ error: 'Server missing Supabase service credentials' });
      return;
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const addr = walletAddress.toLowerCase();

    // 1. Look up the pending question and ensure it hasn't been used
    const { data: pending, error: pendingError } = await supabase
      .from('pending_questions')
      .select('*')
      .eq('id', questionId)
      .eq('wallet_address', addr)
      .eq('used', false)
      .single();

    if (pendingError || !pending) {
      res.status(400).json({ error: 'Question not found or already answered' });
      return;
    }

    // 2. Mark it used immediately to prevent double-submission
    await supabase
      .from('pending_questions')
      .update({ used: true })
      .eq('id', questionId);

    const isCorrect =
      selectedAnswer !== null &&
      selectedAnswer !== undefined &&
      selectedAnswer === pending.correct_answer;

    // 3. Load the current authoritative user row
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', addr)
      .single();

    if (userError || !user) {
      res.status(400).json({ error: 'User not found' });
      return;
    }

    // 4. Compute XP for this answer (server decides, not the client)
    let xpEarned = 0;
    if (isCorrect) {
      const base = XP_TABLE[category as CategoryType]?.[difficulty as DifficultyType] ?? 0;
      const boosterActive =
        user.xp_booster_active &&
        user.xp_booster_expiry &&
        new Date(user.xp_booster_expiry).getTime() > Date.now();
      xpEarned = boosterActive ? Math.ceil(base * 1.5) : base;
    }

    // 5. Streak: advance once per calendar day on ANY challenge
    // attempt (correct or wrong), per the original product spec.
    const today = new Date().toISOString().split('T')[0];
    let newStreak = user.streak ?? 0;
    let streakBonus = 0;
    let newLastActiveDate = user.last_active_date;

    if (user.last_active_date !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().split('T')[0];

      newStreak = user.last_active_date === yStr ? ((user.streak ?? 0) % 5) + 1 : 1;
      streakBonus = STREAK_BONUS[newStreak] ?? 10;
      newLastActiveDate = today;
    }

    const newTotalXP = (user.total_xp ?? 0) + xpEarned + streakBonus;
    const newCorrectAnswers = (user.correct_answers ?? 0) + (isCorrect ? 1 : 0);
    const newTotalChallenges = (user.total_challenges ?? 0) + 1;

    const level = calcLevel(newTotalXP);
    const levelProgress = calcLevelProgress(newTotalXP);
    const xpToNextLevel = calcXPToNext(newTotalXP);
    const rankScore = calcRankScore(newTotalXP, newCorrectAnswers, newTotalChallenges);
    const rank = calcRank(rankScore);

    // 6. Write the authoritative update (service role bypasses RLS/trigger)
    const { error: updateError } = await supabase
      .from('users')
      .update({
        total_xp: newTotalXP,
        level,
        rank,
        rank_score: rankScore,
        correct_answers: newCorrectAnswers,
        total_challenges: newTotalChallenges,
        streak: newStreak,
        last_active_date: newLastActiveDate,
        updated_at: new Date().toISOString(),
      })
      .eq('wallet_address', addr);

    if (updateError) {
      console.error('[submit-answer] user update failed:', updateError);
      res.status(500).json({ error: 'Failed to save result. Please try again.' });
      return;
    }

    const { error: historyError } = await supabase
      .from('challenge_history')
      .insert({
        wallet_address: addr,
        category,
        difficulty,
        is_correct: isCorrect,
        xp_earned: xpEarned,
        created_at: new Date().toISOString(),
      });

    if (historyError) {
      // Non-fatal: the user's XP/level update already succeeded, only the
      // history log entry failed. Log it but still return success since
      // the authoritative score was saved correctly.
      console.error('[submit-answer] history insert failed:', historyError);
    }

    res.status(200).json({
      isCorrect,
      correctAnswer: pending.correct_answer,
      explanation: pending.explanation,
      xpEarned,
      streakBonus,
      newStreak,
      totalXP: newTotalXP,
      level,
      levelProgress,
      xpToNextLevel,
      rank,
      rankScore,
      correctAnswers: newCorrectAnswers,
      totalChallenges: newTotalChallenges,
    });
  } catch (err: unknown) {
    console.error('[submit-answer] error:', err);
    res.status(500).json({ error: 'Failed to process answer' });
  }
}
