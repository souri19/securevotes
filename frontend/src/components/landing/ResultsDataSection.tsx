import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Activity } from 'lucide-react';
import type { ElectionResults, PlatformOverview } from '../../types';
import { AnimatedCounter } from '../AnimatedCounter';
import { StatusBadge } from '../StatusBadge';
import { EASE_PREMIUM } from '../../animations/motion';

interface ResultsDataSectionProps {
  overview: PlatformOverview | null;
  featuredResults: ElectionResults | null;
}

export const ResultsDataSection: React.FC<ResultsDataSectionProps> = ({
  overview,
  featuredResults,
}) => {
  const prefersReduced = useReducedMotion();

  const candidateRows = featuredResults?.candidates.slice(0, 4) || [
    { candidate_id: 1, name: 'Dr. Nadia Okafor', organization: 'Civic Commons Coalition', votes: 94, percentage: 34.1 },
    { candidate_id: 2, name: 'Julian Mercer', organization: 'Metropolitan Reform Alliance', votes: 78, percentage: 28.3 },
    { candidate_id: 3, name: 'Sora Takahashi', organization: 'Independent Civic Technologists', votes: 63, percentage: 22.8 },
    { candidate_id: 4, name: 'Marcus Alverez', organization: 'Neighborhood Grid Network', votes: 41, percentage: 14.9 },
  ];

  const timelinePoints = featuredResults?.timeline || [
    { label: 'T+08h', participation_count: 34 },
    { label: 'T+16h', participation_count: 79 },
    { label: 'T+24h', participation_count: 128 },
    { label: 'T+32h', participation_count: 176 },
    { label: 'T+40h', participation_count: 221 },
    { label: 'T+48h', participation_count: 276 },
  ];

  const maxTimeline = Math.max(...timelinePoints.map((p) => p.participation_count), 1);

  return (
    <section className="border-b border-[#23304C] bg-[#141D30] py-24 sm:py-32 text-[#F7F6F2]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#14B8A6]">
                05 · Results &amp; Data
              </span>
              <span className="border border-[#14B8A6]/40 bg-[#14B8A6]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#14B8A6]">
                Simulated Data
              </span>
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Clear turnout. Visualized transparently.
            </h2>
          </div>

          <Link
            to="/results"
            className="min-h-[44px] inline-flex items-center gap-2 border border-[#334155] bg-[#0B1120] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#F7F6F2] hover:border-[#14B8A6] transition-colors rounded-[4px]"
          >
            <span>Open Full Results Dashboard</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#14B8A6]" />
          </Link>
        </div>

        {/* Large Editorial Metrics */}
        <div className="grid gap-6 sm:grid-cols-3 border-y border-[#23304C] py-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#DDDAD0]/70">
              Simulated Ballots Recorded
            </p>
            <p className="mt-2 font-display text-5xl font-bold text-[#14B8A6]">
              <AnimatedCounter value={overview?.total_simulated_ballots ?? 1034} />
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#DDDAD0]/70">
              Average Turnout Rate
            </p>
            <p className="mt-2 font-display text-5xl font-bold text-white">
              <AnimatedCounter
                value={overview?.average_participation_rate ?? 69.5}
                decimals={1}
                suffix="%"
              />
            </p>
          </div>
          <div className="flex flex-col justify-between">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#DDDAD0]/70">
              Featured Election Status
            </p>
            <div className="mt-3 flex items-center gap-3">
              <StatusBadge status={featuredResults?.status || 'active'} dark />
              <span className="text-xs text-[#DDDAD0]/75">
                {featuredResults?.total_votes ?? 276} simulated ballots
              </span>
            </div>
          </div>
        </div>

        {/* Candidate Bars + Participation Timeline */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Candidate Result Bars */}
          <div className="lg:col-span-7 border border-[#23304C] bg-[#0B1120] p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  Candidate Distribution (Simulated)
                </h3>
                <p className="text-xs text-[#DDDAD0]/65">
                  {featuredResults?.title || 'Metro Civic Innovation Council — 2026 General Seat'}
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {candidateRows.map((cand, idx) => (
                <div key={cand.candidate_id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-white">{cand.name}</span>
                    <span className="font-mono text-xs tabular-nums text-[#14B8A6]">
                      {cand.votes} ({cand.percentage}%)
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full bg-[#1E293B] overflow-hidden">
                    <motion.div
                      initial={prefersReduced ? { width: `${cand.percentage}%` } : { width: 0 }}
                      whileInView={{ width: `${cand.percentage}%` }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{ duration: 0.75, delay: idx * 0.08, ease: EASE_PREMIUM }}
                      className="h-full"
                      style={{
                        backgroundColor:
                          idx === 0 ? '#14B8A6' : idx === 1 ? '#E05A47' : '#DDDAD0',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Participation Timeline Visualization */}
          <div className="lg:col-span-5 border border-[#23304C] bg-[#0B1120] p-6 sm:p-8 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  Turnout Timeline
                </h3>
                <p className="text-xs text-[#DDDAD0]/65">
                  Cumulative simulated participation
                </p>
              </div>
              <Activity className="h-4 w-4 text-[#14B8A6]" />
            </div>

            <div className="mt-8 flex items-end gap-3 h-44">
              {timelinePoints.map((pt, idx) => {
                const heightPct = Math.max(12, Math.round((pt.participation_count / maxTimeline) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                    <span className="font-mono text-[10px] text-[#DDDAD0]/70 tabular-nums">
                      {pt.participation_count}
                    </span>
                    <div className="w-full flex-1 flex items-end bg-[#141D30]">
                      <motion.div
                        initial={prefersReduced ? { height: `${heightPct}%` } : { height: 0 }}
                        whileInView={{ height: `${heightPct}%` }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.65, delay: idx * 0.07, ease: EASE_PREMIUM }}
                        className="w-full bg-[#14B8A6]"
                      />
                    </div>
                    <span className="text-[10px] text-[#DDDAD0]/55 truncate max-w-full">
                      {pt.label.split('·')[0]}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="mt-5 border-t border-[#1E293B] pt-3 text-[11px] text-[#DDDAD0]/65">
              Simulated prototype metrics shown for civic-tech demonstration only.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
