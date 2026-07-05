import React from 'react';
import { Brain, Shield, Trophy, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Brain,
    eyebrow: 'Challenge Engine',
    title: 'Questions that feel alive',
    description:
      'Gemini-powered prompts generate focused quiz runs across knowledge, football, and AI so every session feels fresh instead of recycled.',
    gradient: 'from-brand-purple to-interactive-cyan',
  },
  {
    icon: Shield,
    eyebrow: 'Identity Layer',
    title: 'Progress tied to your wallet',
    description:
      'Your level, streaks, items, and achievements follow the wallet you connect — keeping competition personal and portable.',
    gradient: 'from-interactive-cyan to-success-emerald',
  },
  {
    icon: Trophy,
    eyebrow: 'Competition Loop',
    title: 'A leaderboard with pressure',
    description:
      'XP, streak bonuses, premium status, and visible rank create a clear loop: answer, improve, climb, repeat.',
    gradient: 'from-gold to-brand-purple',
  },
];

const promiseHighlights = [
  'No bloated courses — just fast skill reps.',
  'Every reward path is visible before you play.',
];

const Features: React.FC = () => {
  return (
    <section className="relative py-12 lg:py-24 bg-transparent overflow-hidden">
      <div className="absolute left-0 top-1/4 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-purple/10 blur-3xl" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="eyebrow-label text-brand-purple text-xs mb-4">Product promise</p>
            <h2 className="mobile-section-title font-bold text-text-primary mb-4">
              Built for the moment you decide to get sharper.
            </h2>
          </div>
          <div className="premium-surface rounded-3xl p-5 lg:p-6">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-1 text-gold" size={22} />
              <div>
                <p className="text-text-primary font-semibold">Nexora is a compact performance loop.</p>
                <p className="text-text-secondary text-sm mt-1">
                  Enter a challenge, prove recall under time pressure, and leave with measurable progress.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className="group relative overflow-hidden p-5 lg:p-8 premium-surface rounded-3xl hover:border-brand-purple/45 transition-all duration-300 hover:-translate-y-1 hover:shadow-purple-glow"
            >
              <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-brand-purple/10 blur-3xl group-hover:bg-interactive-cyan/10 transition-colors" />
              <div className="mb-5 flex items-center justify-between">
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br shadow-premium ${feature.gradient} group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon size={28} className="text-white" />
                </div>
                <span className="font-numeric text-sm text-text-secondary/60">0{index + 1}</span>
              </div>

              <p className="eyebrow-label text-[10px] text-interactive-cyan mb-3">{feature.eyebrow}</p>
              <h3 className="mobile-card-title font-bold text-text-primary mb-4">
                {feature.title}
              </h3>
              <p className="text-sm text-text-secondary leading-7">{feature.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {promiseHighlights.map((highlight) => (
            <div key={highlight} className="premium-badge rounded-2xl px-5 py-4 text-sm text-text-secondary">
              <span className="text-gold">✦</span> {highlight}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
