import React from 'react';
import { Award, BarChart3, Flame, Layers, Target } from 'lucide-react';

const stats = [
  {
    icon: Layers,
    value: '3',
    label: 'Challenge Arenas',
    description: 'General knowledge, football, and AI technology keep sessions varied.',
  },
  {
    icon: Flame,
    value: '150',
    label: 'Streak XP Available',
    description: 'A five-day loop turns consistency into visible reward momentum.',
  },
  {
    icon: Award,
    value: '4',
    label: 'Rank Tiers',
    description: 'Beginner through Gold gives every player a next milestone to chase.',
  },
];

const progressCues = [
  { label: 'Answer under pressure', icon: Target },
  { label: 'Earn XP instantly', icon: BarChart3 },
  { label: 'Climb public rank', icon: Award },
];

const Stats: React.FC = () => {
  return (
    <section className="relative py-16 lg:py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="neon-divider mb-12" />
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow-label text-gold text-xs mb-3">Value at a glance</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">
              Every session moves a visible meter.
            </h2>
          </div>
          <p className="max-w-xl text-sm text-text-secondary leading-7">
            Nexora is designed around short challenge cycles, clear reward math, and a profile that gets stronger with every correct answer.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 lg:gap-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="premium-surface rounded-3xl p-6 text-left group hover:border-interactive-cyan/35 transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl premium-badge mb-6 group-hover:bg-brand-purple/20 transition-colors duration-300">
                <stat.icon size={24} className="text-brand-purple" />
              </div>
              <div className="stat-number text-5xl lg:text-6xl font-black text-text-primary mb-3">
                {stat.value}
              </div>
              <div className="text-lg font-semibold text-text-primary mb-2">
                {stat.label}
              </div>
              <p className="text-sm text-text-secondary leading-7">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 premium-surface-strong rounded-3xl p-5 lg:p-6">
          <div className="grid gap-4 md:grid-cols-3">
            {progressCues.map((cue, index) => (
              <div key={cue.label} className="flex items-center gap-3 rounded-2xl bg-secondary-layer/60 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand text-white">
                  <cue.icon size={18} />
                </div>
                <div>
                  <p className="font-numeric text-xs text-text-secondary">Step 0{index + 1}</p>
                  <p className="font-semibold text-text-primary">{cue.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
