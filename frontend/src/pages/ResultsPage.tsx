import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { BarChart3, ShieldAlert } from 'lucide-react';
import { apiRequest } from '../services/api';
import type { Election, ElectionResults } from '../types';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { StatusBadge } from '../components/StatusBadge';
import { CardSkeleton } from '../components/Skeletons';
import { pageTransitionVariants } from '../animations/motion';

const PALETTE_COLORS = ['#0B1120', '#0D9488', '#E5A93C', '#E05A47', '#334155'];

export const ResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedId, setSelectedId] = useState<string>(searchParams.get('election') || '');
  const [results, setResults] = useState<ElectionResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Election[]>('/elections')
      .then((list) => {
        setElections(list);
        if (!selectedId && list.length > 0) {
          const preferred =
            list.find((e) => e.status === 'active') ||
            list.find((e) => e.status === 'completed') ||
            list[0];
          setSelectedId(String(preferred.id));
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load elections.'));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    apiRequest<ElectionResults>(`/results/${selectedId}`)
      .then((data) => {
        setResults(data);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load results.'))
      .finally(() => setLoading(false));
  }, [selectedId]);

  const handleSelectChange = (val: string) => {
    setSelectedId(val);
    searchParams.set('election', val);
    setSearchParams(searchParams, { replace: true });
  };

  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8"
    >
      {/* Header + Selector */}
      <div className="border-b border-[#DDDAD0] pb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#14B8A6]">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Simulated Telemetry &amp; Tallies</span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold text-[#0B1120] sm:text-4xl">
            Election Results Dashboard
          </h1>
          <p className="mt-2 text-sm text-[#141D30]/80 max-w-2xl">
            Interactive vote distribution, share comparison, and participation timelines generated from prototype database records.
          </p>
        </div>

        <div className="w-full lg:w-96">
          <label
            htmlFor="results-election-select"
            className="block text-[11px] font-semibold uppercase tracking-wider text-[#141D30]/70 mb-1.5"
          >
            Select Election Cycle
          </label>
          <select
            id="results-election-select"
            value={selectedId}
            onChange={(e) => handleSelectChange(e.target.value)}
            className="w-full border border-[#DDDAD0] bg-white px-3.5 py-2.5 text-sm font-medium text-[#0B1120] rounded-[4px]"
          >
            {elections.map((el) => (
              <option key={el.id} value={String(el.id)}>
                {el.title} ({el.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Simulated Disclaimer Banner */}
      <div className="border border-[#14B8A6] bg-[#14B8A6]/15 px-5 py-3.5 flex items-center gap-3 text-xs text-[#0B1120]">
        <ShieldAlert className="h-4 w-4 shrink-0 text-[#E05A47]" />
        <span>
          <strong>Simulated Data Notice:</strong>{' '}
          {results?.disclaimer ||
            'Simulated demonstration results. Figures reflect prototype database state and must not be interpreted as certified real-world election outcomes.'}
        </span>
      </div>

      {error && (
        <div className="border border-[#E05A47] bg-[#E05A47]/10 p-4 text-sm text-[#0B1120]">
          {error}
        </div>
      )}

      {loading || !results ? (
        <CardSkeleton count={3} />
      ) : (
        <>
          {/* KPI Summary Strip */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border border-[#1E293B] bg-[#0B1120] p-6 text-[#F7F6F2]">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#DDDAD0]/70">
                Total Simulated Ballots
              </p>
              <p className="mt-2 font-display text-3xl font-bold text-[#14B8A6]">
                <AnimatedCounter value={results.total_votes} />
              </p>
            </div>
            <div className="border border-[#DDDAD0] bg-white p-6">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#141D30]/60">
                Participation Rate
              </p>
              <p className="mt-2 font-display text-3xl font-bold text-[#0B1120]">
                <AnimatedCounter
                  value={results.participation_percentage}
                  decimals={1}
                  suffix="%"
                />
              </p>
            </div>
            <div className="border border-[#DDDAD0] bg-white p-6">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#141D30]/60">
                Eligible Demo Pool
              </p>
              <p className="mt-2 font-display text-3xl font-bold text-[#0B1120]">
                <AnimatedCounter value={results.eligible_voter_count} />
              </p>
            </div>
            <div className="border border-[#DDDAD0] bg-white p-6 flex flex-col justify-between">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#141D30]/60">
                Cycle Status
              </p>
              <div className="mt-2">
                <StatusBadge status={results.status} />
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Bar Chart: Candidate Vote Totals */}
            <div className="lg:col-span-7 border border-[#DDDAD0] bg-white p-6">
              <div className="flex items-center justify-between border-b border-[#DDDAD0]/60 pb-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-[#0B1120]">
                    Simulated Vote Distribution
                  </h2>
                  <p className="text-xs text-[#141D30]/65">Ballots recorded per candidate</p>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#0D9488]">
                  Simulated
                </span>
              </div>

              <div className="mt-6 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={results.candidates}
                    margin={{ top: 10, right: 16, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ECEAE2" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#141D30' }}
                      tickFormatter={(v: string) => (v.length > 18 ? `${v.slice(0, 16)}…` : v)}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#141D30' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0B1120',
                        border: '1px solid #23304C',
                        color: '#F7F6F2',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="votes" name="Simulated Votes" radius={[3, 3, 0, 0]}>
                      {results.candidates.map((entry, idx) => (
                        <Cell
                          key={entry.candidate_id}
                          fill={PALETTE_COLORS[idx % PALETTE_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donut Chart: Vote Share */}
            <div className="lg:col-span-5 border border-[#DDDAD0] bg-white p-6">
              <div className="border-b border-[#DDDAD0]/60 pb-4">
                <h2 className="font-display text-lg font-bold text-[#0B1120]">
                  Share Breakdown
                </h2>
                <p className="text-xs text-[#141D30]/65">Percentage of simulated ballots</p>
              </div>

              <div className="mt-4 h-60 w-full">
                {results.total_votes === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-[#141D30]/60">
                    No simulated ballots submitted yet for this election.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={results.candidates}
                        dataKey="votes"
                        nameKey="name"
                        innerRadius={56}
                        outerRadius={88}
                        paddingAngle={2}
                      >
                        {results.candidates.map((entry, idx) => (
                          <Cell
                            key={entry.candidate_id}
                            fill={PALETTE_COLORS[idx % PALETTE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0B1120',
                          border: '1px solid #23304C',
                          color: '#F7F6F2',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="mt-2 space-y-1.5">
                {results.candidates.map((c, idx) => (
                  <div key={c.candidate_id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-2.5 w-2.5 shrink-0"
                        style={{ backgroundColor: PALETTE_COLORS[idx % PALETTE_COLORS.length] }}
                      />
                      <span className="truncate text-[#0B1120] font-medium">{c.name}</span>
                    </div>
                    <span className="tabular-nums font-semibold text-[#141D30]">
                      {c.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Participation Timeline + Candidate Table */}
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-6 border border-[#DDDAD0] bg-white p-6">
              <div className="border-b border-[#DDDAD0]/60 pb-4">
                <h2 className="font-display text-lg font-bold text-[#0B1120]">
                  Participation Curve
                </h2>
                <p className="text-xs text-[#141D30]/65">
                  Cumulative simulated ballot submissions over time
                </p>
              </div>
              <div className="mt-6 h-64 w-full">
                {results.timeline.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-[#141D30]/60">
                    Timeline will populate as simulated ballots arrive.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={results.timeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ECEAE2" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#141D30' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#141D30' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0B1120',
                          border: '1px solid #23304C',
                          color: '#F7F6F2',
                          fontSize: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="participation_count"
                        name="Cumulative Ballots"
                        stroke="#0B1120"
                        fill="#14B8A6"
                        fillOpacity={0.35}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Candidate Breakdown Table */}
            <div className="lg:col-span-6 border border-[#DDDAD0] bg-white p-6">
              <div className="border-b border-[#DDDAD0]/60 pb-4">
                <h2 className="font-display text-lg font-bold text-[#0B1120]">
                  Candidate Standing
                </h2>
                <p className="text-xs text-[#141D30]/65">
                  Ranked simulated counts for {results.title}
                </p>
              </div>
              <div className="mt-4 divide-y divide-[#DDDAD0]/60">
                {results.candidates.map((c, idx) => (
                  <div key={c.candidate_id} className="py-3.5">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-display font-bold text-[#0B1120]">
                          {idx + 1}. {c.name}
                        </span>
                        <p className="text-xs text-[#141D30]/70">{c.organization}</p>
                      </div>
                      <div className="text-right tabular-nums">
                        <p className="font-display font-bold text-[#0B1120]">
                          {c.votes.toLocaleString()}
                        </p>
                        <p className="text-xs text-[#0D9488]">{c.percentage}%</p>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 w-full bg-[#ECEAE2]">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${c.percentage}%`,
                          backgroundColor: PALETTE_COLORS[idx % PALETTE_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};
