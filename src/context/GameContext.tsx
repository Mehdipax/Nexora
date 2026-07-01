import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

// ============== TYPES ==============

export type RankType = 'Beginner' | 'Bronze' | 'Silver' | 'Gold';
export type CategoryType = 'general' | 'football' | 'ai';
export type DifficultyType = 'easy' | 'medium' | 'hard';

export interface ChallengeRecord {
  id: string;
  category: CategoryType;
  difficulty: DifficultyType;
  isCorrect: boolean;
  xpEarned: number;
  timestamp: string;
}

export interface Transaction {
  hash: string;
  type: 'xp_booster' | 'premium_pass';
  amount: string;
  timestamp: number;
}

export interface GameState {
  totalXP: number;
  level: number;
  levelProgress: number;
  xpToNextLevel: number;
  rank: RankType;
  rankScore: number;
  streak: number;
  lastActiveDate: string | null;
  correctAnswers: number;
  totalChallenges: number;
  accuracy: number;
  achievements: string[];
  premiumStatus: boolean;
  premiumPurchasedAt: string | null;
  xpBoosterActive: boolean;
  xpBoosterExpiry: number | null;
  challengeHistory: ChallengeRecord[];
  transactions: Transaction[];
}

// ============== CONSTANTS ==============

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

const STORAGE_KEY = 'nexora_game_v2';

// ============== CALCULATIONS ==============

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

export const RANK_COLORS: Record<RankType, string> = {
  Beginner: '#64748B',
  Bronze: '#B87333',
  Silver: '#C0C0C0',
  Gold: '#FBBF24',
};

// ============== ACHIEVEMENTS ==============

export const ACHIEVEMENTS = [
  {
    id: 'first_login',
    name: 'First Login',
    icon: '🚀',
    desc: 'Connected wallet for the first time',
  },
  {
    id: 'first_correct',
    name: 'First Correct Answer',
    icon: '✅',
    desc: 'Got your first answer right',
  },
  { id: 'level_5', name: 'Reach Level 5', icon: '⭐', desc: 'Reached Level 5' },
  { id: 'rank_bronze', name: 'Bronze Rank', icon: '🥉', desc: 'Achieved Bronze rank' },
  { id: 'rank_silver', name: 'Silver Rank', icon: '🥈', desc: 'Achieved Silver rank' },
  { id: 'rank_gold', name: 'Gold Rank', icon: '🥇', desc: 'Achieved Gold rank' },
  {
    id: 'streak_5',
    name: '5-Day Streak',
    icon: '🔥',
    desc: 'Completed a full 5-day streak cycle',
  },
  {
    id: 'buy_premium',
    name: 'Premium Member',
    icon: '💎',
    desc: 'Purchased Premium Pass',
  },
];

function checkAchievements(state: GameState): string[] {
  const newUnlocks: string[] = [];
  const checks: Array<{ id: string; pass: boolean }> = [
    { id: 'first_correct', pass: state.correctAnswers >= 1 },
    { id: 'level_5', pass: state.level >= 5 },
    {
      id: 'rank_bronze',
      pass: ['Bronze', 'Silver', 'Gold'].includes(state.rank),
    },
    { id: 'rank_silver', pass: ['Silver', 'Gold'].includes(state.rank) },
    { id: 'rank_gold', pass: state.rank === 'Gold' },
    { id: 'streak_5', pass: state.streak === 5 },
    { id: 'buy_premium', pass: state.premiumStatus },
  ];
  checks.forEach(({ id, pass }) => {
    if (pass && !state.achievements.includes(id)) {
      newUnlocks.push(id);
    }
  });
  return newUnlocks;
}

// ============== INITIAL STATE ==============

const INITIAL_STATE: GameState = {
  totalXP: 0,
  level: 0,
  levelProgress: 0,
  xpToNextLevel: 100,
  rank: 'Beginner',
  rankScore: 0,
  streak: 0,
  lastActiveDate: null,
  correctAnswers: 0,
  totalChallenges: 0,
  accuracy: 0,
  achievements: [],
  premiumStatus: false,
  premiumPurchasedAt: null,
  xpBoosterActive: false,
  xpBoosterExpiry: null,
  challengeHistory: [],
  transactions: [],
};

function loadFromStorage(walletAddr?: string): GameState {
  try {
    const key = walletAddr
      ? `${STORAGE_KEY}_${walletAddr.toLowerCase()}`
      : STORAGE_KEY;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...INITIAL_STATE, ...parsed };
    }
  } catch {
    // ignore
  }
  return { ...INITIAL_STATE };
}

function saveToStorage(state: GameState, walletAddr?: string) {
  try {
    const key = walletAddr
      ? `${STORAGE_KEY}_${walletAddr.toLowerCase()}`
      : STORAGE_KEY;
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // ignore
  }
}

// ============== CONTEXT INTERFACE ==============

interface GameContextType {
  gameState: GameState;
  awardXP: (cat: CategoryType, diff: DifficultyType, correct: boolean) => number;
  addChallenge: (record: ChallengeRecord) => void;
  checkStreak: () => void;
  unlockAchievement: (id: string) => void;
  setPremium: (txHash: string) => void;
  setXPBooster: (txHash: string) => void;
  addTransaction: (tx: Transaction) => void;
  loadStateForWallet: (addr: string) => void;
  resetGame: () => void;
  levelUpSignal: number | null;
  rankUpSignal: RankType | null;
  xpGainSignal: number | null;
  newAchievementSignal: string | null;
  streakBonusSignal: { day: number; xp: number } | null;
  clearSignals: () => void;
  xpBoosterActive: boolean;
  xpBoosterExpiry: number | null;
  premiumStatus: boolean;
  transactions: Transaction[];
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// ============== PROVIDER ==============

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(() => loadFromStorage());
  const [walletAddr, setWalletAddr] = useState<string>('');
  const [levelUpSignal, setLevelUpSignal] = useState<number | null>(null);
  const [rankUpSignal, setRankUpSignal] = useState<RankType | null>(null);
  const [xpGainSignal, setXpGainSignal] = useState<number | null>(null);
  const [newAchievementSignal, setNewAchievementSignal] = useState<string | null>(
    null
  );
  const [streakBonusSignal, setStreakBonusSignal] = useState<{
    day: number;
    xp: number;
  } | null>(null);

  // Auto-save on state change
  useEffect(() => {
    saveToStorage(gameState, walletAddr || undefined);
  }, [gameState, walletAddr]);

  // XP Booster expiry check every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameState.xpBoosterActive && gameState.xpBoosterExpiry) {
        if (Date.now() > gameState.xpBoosterExpiry) {
          setGameState((prev) => ({ ...prev, xpBoosterActive: false }));
        }
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [gameState.xpBoosterActive, gameState.xpBoosterExpiry]);

  const updateState = useCallback(
    (
      updater: (prev: GameState) => GameState,
      prevLevel: number,
      prevRank: RankType
    ) => {
      setGameState((prev) => {
        const next = updater(prev);
        const level = calcLevel(next.totalXP);
        const levelProgress = calcLevelProgress(next.totalXP);
        const xpToNextLevel = calcXPToNext(next.totalXP);
        const rankScore = calcRankScore(
          next.totalXP,
          next.correctAnswers,
          next.totalChallenges
        );
        const rank = calcRank(rankScore);
        const accuracy =
          next.totalChallenges > 0
            ? next.correctAnswers / next.totalChallenges
            : 0;
        const xpBoosterActive =
          next.xpBoosterExpiry !== null && Date.now() < next.xpBoosterExpiry;

        const computed: GameState = {
          ...next,
          level,
          levelProgress,
          xpToNextLevel,
          rankScore,
          rank,
          accuracy,
          xpBoosterActive,
        };

        if (level > prevLevel) setLevelUpSignal(level);
        if (rank !== prevRank) setRankUpSignal(rank);

        const newUnlocks = checkAchievements(computed);
        if (newUnlocks.length > 0) {
          computed.achievements = [...computed.achievements, ...newUnlocks];
          setNewAchievementSignal(newUnlocks[0]);
        }

        return computed;
      });
    },
    []
  );

  const awardXP = useCallback(
    (cat: CategoryType, diff: DifficultyType, correct: boolean): number => {
      if (!correct) return 0;
      let base = XP_TABLE[cat][diff];
      if (
        gameState.xpBoosterActive &&
        gameState.xpBoosterExpiry &&
        Date.now() < gameState.xpBoosterExpiry
      ) {
        base = Math.ceil(base * 1.5);
      }
      const prevLevel = gameState.level;
      const prevRank = gameState.rank;
      updateState(
        (prev) => ({ ...prev, totalXP: prev.totalXP + base }),
        prevLevel,
        prevRank
      );
      setXpGainSignal(base);
      return base;
    },
    [gameState, updateState]
  );

  const addChallenge = useCallback(
    (record: ChallengeRecord) => {
      const prevLevel = gameState.level;
      const prevRank = gameState.rank;
      updateState(
        (prev) => ({
          ...prev,
          correctAnswers: prev.correctAnswers + (record.isCorrect ? 1 : 0),
          totalChallenges: prev.totalChallenges + 1,
          challengeHistory: [record, ...prev.challengeHistory].slice(0, 100),
        }),
        prevLevel,
        prevRank
      );
    },
    [gameState, updateState]
  );

  const checkStreak = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const last = gameState.lastActiveDate;
    if (last === today) return;

    let newStreak = 1;
    if (last) {
      const yest = new Date();
      yest.setDate(yest.getDate() - 1);
      if (last === yest.toISOString().split('T')[0]) {
        newStreak = (gameState.streak % 5) + 1;
      }
    }

    const bonusXP = STREAK_BONUS[newStreak] ?? 10;
    const prevLevel = gameState.level;
    const prevRank = gameState.rank;

    updateState(
      (prev) => ({
        ...prev,
        streak: newStreak,
        lastActiveDate: today,
        totalXP: prev.totalXP + bonusXP,
      }),
      prevLevel,
      prevRank
    );

    setStreakBonusSignal({ day: newStreak, xp: bonusXP });
  }, [gameState, updateState]);

  const unlockAchievement = useCallback(
    (id: string) => {
      if (gameState.achievements.includes(id)) return;
      setGameState((prev) => ({
        ...prev,
        achievements: [...prev.achievements, id],
      }));
      setNewAchievementSignal(id);
    },
    [gameState.achievements]
  );

  const setPremium = useCallback(
    (txHash: string) => {
      const prevLevel = gameState.level;
      const prevRank = gameState.rank;
      const ts = new Date().toISOString();
      const newTx: Transaction = {
        hash: txHash,
        type: 'premium_pass',
        amount: '0.05',
        timestamp: Date.now(),
      };
      updateState(
        (prev) => ({
          ...prev,
          premiumStatus: true,
          premiumPurchasedAt: ts,
          transactions: [newTx, ...prev.transactions],
        }),
        prevLevel,
        prevRank
      );
    },
    [gameState, updateState]
  );

  const setXPBooster = useCallback((txHash: string) => {
    const expiry = Date.now() + 24 * 60 * 60 * 1000;
    const newTx: Transaction = {
      hash: txHash,
      type: 'xp_booster',
      amount: '0.01',
      timestamp: Date.now(),
    };
    setGameState((prev) => ({
      ...prev,
      xpBoosterActive: true,
      xpBoosterExpiry: expiry,
      transactions: [newTx, ...prev.transactions],
    }));
  }, []);

  const addTransaction = useCallback((tx: Transaction) => {
    setGameState((prev) => ({
      ...prev,
      transactions: [tx, ...prev.transactions],
    }));
  }, []);

  const loadStateForWallet = useCallback((addr: string) => {
    setWalletAddr(addr);
    const saved = loadFromStorage(addr);
    setGameState(saved);
  }, []);

  const resetGame = useCallback(() => {
    setGameState({ ...INITIAL_STATE });
    setWalletAddr('');
  }, []);

  const clearSignals = useCallback(() => {
    setLevelUpSignal(null);
    setRankUpSignal(null);
    setXpGainSignal(null);
    setNewAchievementSignal(null);
    setStreakBonusSignal(null);
  }, []);

  return (
    <GameContext.Provider
      value={{
        gameState,
        awardXP,
        addChallenge,
        checkStreak,
        unlockAchievement,
        setPremium,
        setXPBooster,
        addTransaction,
        loadStateForWallet,
        resetGame,
        levelUpSignal,
        rankUpSignal,
        xpGainSignal,
        newAchievementSignal,
        streakBonusSignal,
        clearSignals,
        xpBoosterActive: gameState.xpBoosterActive,
        xpBoosterExpiry: gameState.xpBoosterExpiry,
        premiumStatus: gameState.premiumStatus,
        transactions: gameState.transactions,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be inside GameProvider');
  return ctx;
};
