import { supabase } from './supabase';
import type { ChallengeRecord, GameState, Transaction } from '../context/GameContext';

const normalizeAddress = (addr: string) => addr.toLowerCase();

interface AchievementRow {
  achievement_id: string;
}

interface TransactionRow {
  tx_hash: string;
  transaction_type: Transaction['type'];
  amount: string;
  created_at: string;
}

export interface UserProfileRow {
  wallet_address: string;
  total_xp: number;
  level: number;
  rank: string;
  rank_score: number;
  streak: number;
  last_active_date: string | number | null;
  correct_answers: number;
  total_challenges: number;
  premium_status: boolean;
  premium_purchased_at: string | null;
  xp_booster_active: boolean;
  xp_booster_expiry: string | null;
  avatar_id?: string | null;
}

export async function ensureUser(addr: string) {
  try {
    await supabase.from('users').upsert(
      { wallet_address: normalizeAddress(addr) },
      { onConflict: 'wallet_address', ignoreDuplicates: true }
    );
  } catch (e) {
    console.warn('[DB] ensureUser:', e);
  }
}

export async function loadUserFromDB(addr: string): Promise<UserProfileRow | null> {
  try {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', normalizeAddress(addr))
      .single();
    return data as UserProfileRow | null;
  } catch {
    return null;
  }
}


export async function saveAvatarIdDB(addr: string, avatarId: string) {
  try {
    await supabase
      .from('users')
      .update({ avatar_id: avatarId, updated_at: new Date().toISOString() })
      .eq('wallet_address', normalizeAddress(addr));
  } catch (e) {
    console.warn('[DB] saveAvatarId:', e);
  }
}

export async function syncUserToDB(addr: string, gs: GameState) {
  try {
    await supabase.from('users').upsert(
      {
        wallet_address: normalizeAddress(addr),
        total_xp: gs.totalXP,
        level: gs.level,
        rank: gs.rank,
        rank_score: gs.rankScore,
        streak: gs.streak,
        last_active_date: gs.lastActiveDate
          ? new Date(gs.lastActiveDate).toISOString()
          : null,
        correct_answers: gs.correctAnswers,
        total_challenges: gs.totalChallenges,
        premium_status: gs.premiumStatus,
        premium_purchased_at: gs.premiumPurchasedAt,
        xp_booster_active: gs.xpBoosterActive,
        xp_booster_expiry: gs.xpBoosterExpiry
          ? new Date(gs.xpBoosterExpiry).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'wallet_address' }
    );
  } catch (e) {
    console.warn('[DB] syncUser:', e);
  }
}

export async function saveChallengeDB(addr: string, r: ChallengeRecord) {
  try {
    await supabase.from('challenge_history').insert({
      wallet_address: normalizeAddress(addr),
      category: r.category,
      difficulty: r.difficulty,
      is_correct: r.isCorrect,
      xp_earned: r.xpEarned,
      created_at: r.timestamp,
    });
  } catch (e) {
    console.warn('[DB] saveChallenge:', e);
  }
}

export async function saveAchievementDB(addr: string, id: string, name: string) {
  try {
    await supabase.from('achievements').upsert(
      {
        wallet_address: normalizeAddress(addr),
        achievement_id: id,
        achievement_name: name,
      },
      { onConflict: 'wallet_address,achievement_id', ignoreDuplicates: true }
    );
  } catch {
    // ignore
  }
}

export async function loadAchievementsDB(addr: string): Promise<string[]> {
  try {
    const { data } = await supabase
      .from('achievements')
      .select('achievement_id')
      .eq('wallet_address', normalizeAddress(addr));
    return data?.map((r: AchievementRow) => r.achievement_id) ?? [];
  } catch {
    return [];
  }
}

export async function saveTransactionDB(addr: string, tx: Transaction) {
  try {
    await supabase.from('transactions').insert({
      wallet_address: normalizeAddress(addr),
      transaction_type: tx.type,
      tx_hash: tx.hash,
      amount: tx.amount,
      status: 'confirmed',
      created_at: new Date(tx.timestamp).toISOString(),
    });
  } catch {
    // ignore
  }
}

export async function loadTransactionsDB(addr: string): Promise<Transaction[]> {
  try {
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('wallet_address', normalizeAddress(addr))
      .order('created_at', { ascending: false })
      .limit(50);
    return ((data ?? []) as TransactionRow[]).map((r) => ({
      hash: r.tx_hash,
      type: r.transaction_type,
      amount: r.amount,
      timestamp: new Date(r.created_at).getTime(),
    }));
  } catch {
    return [];
  }
}

export async function getLeaderboardDB(type: 'weekly' | 'alltime') {
  const selectLeaderboard = async (columns: string) => {
    let query = supabase
      .from('users')
      .select(columns)
      .order('total_xp', { ascending: false })
      .limit(50);

    if (type === 'weekly') {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      query = query.gte('updated_at', date.toISOString());
    }

    return query;
  };

  try {
    const { data, error } = await selectLeaderboard('wallet_address, total_xp, level, rank, premium_status, avatar_id');
    if (!error) return data ?? [];

    const fallback = await selectLeaderboard('wallet_address, total_xp, level, rank, premium_status');
    return fallback.data ?? [];
  } catch {
    return [];
  }
}

export async function getUserPositionDB(addr: string): Promise<number> {
  try {
    const { data: me } = await supabase
      .from('users')
      .select('total_xp')
      .eq('wallet_address', normalizeAddress(addr))
      .single();
    if (!me) return 0;

    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gt('total_xp', me.total_xp);
    return (count ?? 0) + 1;
  } catch {
    return 0;
  }
}
