export const DAY_MS = 24 * 60 * 60 * 1000;

export interface StreakCalculation {
  streak: number;
  shouldGrantReward: boolean;
  reset: boolean;
}

function toTimestamp(value: number | string | Date | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const time = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isFinite(time) ? time : null;
}

export function getToday(now: number = Date.now()): number {
  const date = new Date(now);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function getUtcDayIndex(value: number | string | Date | null | undefined): number | null {
  const timestamp = toTimestamp(value);
  if (timestamp === null) return null;
  return Math.floor(getToday(timestamp) / DAY_MS);
}

export function isSameDay(
  left: number | string | Date | null | undefined,
  right: number | string | Date | null | undefined = Date.now()
): boolean {
  const leftDay = getUtcDayIndex(left);
  const rightDay = getUtcDayIndex(right);
  return leftDay !== null && rightDay !== null && leftDay === rightDay;
}

export function isNextDay(
  previous: number | string | Date | null | undefined,
  current: number | string | Date | null | undefined = Date.now()
): boolean {
  const previousDay = getUtcDayIndex(previous);
  const currentDay = getUtcDayIndex(current);
  return previousDay !== null && currentDay !== null && currentDay - previousDay === 1;
}

export function calculateStreak(
  currentStreak: number,
  lastActiveAt: number | string | Date | null | undefined,
  now: number = Date.now()
): StreakCalculation {
  if (isSameDay(lastActiveAt, now)) {
    return { streak: currentStreak, shouldGrantReward: false, reset: false };
  }

  if (isNextDay(lastActiveAt, now)) {
    return {
      streak: (Math.max(0, currentStreak) % 5) + 1,
      shouldGrantReward: true,
      reset: false,
    };
  }

  return { streak: 1, shouldGrantReward: true, reset: Boolean(lastActiveAt) };
}

export function normalizeStreakTimestamp(value: number | string | null | undefined): number | null {
  return toTimestamp(value);
}
