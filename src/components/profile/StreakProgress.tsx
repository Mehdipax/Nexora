import React from 'react';

const STREAK_BONUS: Record<number, number> = { 1: 10, 2: 20, 3: 30, 4: 40, 5: 50 };
const STREAK_DAYS = [1, 2, 3, 4, 5];

interface StreakProgressProps {
  streak: number;
}

const StreakProgress: React.FC<StreakProgressProps> = ({ streak }) => (
  <div className="flex justify-between items-start" aria-label="Five day streak progress">
    {STREAK_DAYS.map((day) => {
      const isCompleted = day <= streak;
      const isCurrent = day === streak + 1 && streak < 5;
      return (
        <div key={day} className="flex flex-col items-center">
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center ${
              isCompleted ? 'bg-brand-purple/15 border-2 border-brand-purple'
              : isCurrent ? 'bg-interactive-cyan/10 border-2 border-interactive-cyan'
              : 'bg-secondary-layer border border-brand-purple/10'
            }`}
          >
            <span className={`font-bold text-xs ${isCurrent ? 'text-interactive-cyan' : 'text-text-secondary opacity-40'}`}>
              {day}
            </span>
          </div>
          <p className="text-[10px] text-text-secondary mt-1">+{STREAK_BONUS[day]}</p>
        </div>
      );
    })}
  </div>
);

export default StreakProgress;
