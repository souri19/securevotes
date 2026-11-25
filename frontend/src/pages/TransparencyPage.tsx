import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, ShieldAlert, FileCheck2, Lock, Clock } from 'lucide-react';
import { apiRequest } from '../services/api';
import type { Election, TransparencySummary } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { TableSkeleton } from '../components/Skeletons';
import { formatDateTime } from '../utils/format';
import { pageTransitionVariants } from '../animations/motion';

export const TransparencyPage: React.FC = () => {
  const [summary, setSummary] = useState<TransparencySummary | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [eventFilter, setEventFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiRequest<TransparencySummary>('/transparency'),
      apiRequest<Election[]>('/elections'),
    ])
      .then(([sum, els]) => {
        setSummary(sum);
        setElections(els);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredEvents =
    summary?.recent_events.filter((ev) =>
      eventFilter === 'ALL' ? true : ev.event_type === eventFilter
    ) || [];

  const eventTypes = Array.from(
    new Set(summary?.recent_events.map((e) => e.event_type) || [])
  );

  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10"
    >
      {/* Header */}
      <div className="border-b border-[#DDDAD0] pb-8">
        <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#14B8A6]">
          <Eye className="h-3.5 w-3.5" />
          <span>Public Verification &amp; Architecture</span>
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold text-[#0B1120] sm:text-4xl">
          Transparency Center
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-[#141D30]/80">
          Inspect non-sensitive election lifecycle logs, participation summaries, and configuration timelines. Voter identities, individual ballot selections, and credentials are never exposed.
        </p>
      </div>

      {loading || !summary ? (
        <TableSkeleton rows={6} />
      ) : (
        <>
          {/* Disclaimer */}
          <div className="border border-[#1E293B] bg-[#0B1120] p-6 text-[#F7F6F2] flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 shrink-0 text-[#14B8A6] mt-0.5" />
            <div className="text-xs leading-relaxed text-[#DDDAD0]">
              <p className="font-display text-sm font-semibold text-white">
                {summary.prototype_disclaimer}
              </p>
              <p className="mt-1">
                Total Public Audit Events: <strong className="text-[#14B8A6]">{summary.total_audit_events}</strong> · Published Cycles: <strong className="text-[#14B8A6]">{summary.elections_published}</strong> · Total Simulated Ballots: <strong className="text-[#14B8A6]">{summary.total_simulated_participation}</strong>
              </p>
            </div>
          </div>

          {/* Election Configuration & Timeline Table */}
          <section className="border border-[#DDDAD0] bg-white p-6">
            <div className="flex items-center gap-2 border-b border-[#DDDAD0]/60 pb-4">
              <Clock className="h-4 w-4 text-[#14B8A6]" />
              <h2 className="font-display text-xl font-bold text-[#0B1120]">
                Election Configuration &amp; Publication Status
              </h2>
            </div>

            {/* Mobile Card List */}
            <div className="mt-4 space-y-3 md:hidden">
              {elections.map((el) => (
                <div key={el.id} className="border border-[#DDDAD0] bg-[#F7F6F2]/35 p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-display text-sm font-semibold text-[#0B1120]">{el.title}</p>
                    <StatusBadge status={el.status} />
                  </div>
                  <p className="text-xs text-[#141D30]/70">{el.election_type}</p>
                  <p className="text-[11px] text-[#141D30]/70">
                    {formatDateTime(el.start_time)} → {formatDateTime(el.end_time)}
                  </p>
                  <p className="text-xs font-semibold tabular-nums text-[#0B1120]">
                    Turnout: {el.total_ballots} / {el.eligible_voter_count} ({el.participation_rate}%)
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#DDDAD0] text-[11px] uppercase tracking-wider text-[#141D30]/60">
                    <th className="py-3 pr-4">Election</th>
                    <th className="py-3 pr-4">Type</th>
                    <th className="py-3 pr-4">Window</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 text-right">Simulated Turnout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDDAD0]/50">
                  {elections.map((el) => (
                    <tr key={el.id}>
                      <td className="py-3.5 pr-4 font-medium text-[#0B1120]">{el.title}</td>
                      <td className="py-3.5 pr-4 text-xs text-[#141D30]/75">{el.election_type}</td>
                      <td className="py-3.5 pr-4 text-xs text-[#141D30]/75">
                        {formatDateTime(el.start_time)} → {formatDateTime(el.end_time)}
                      </td>
                      <td className="py-3.5 pr-4">
                        <StatusBadge status={el.status} />
                      </td>
                      <td className="py-3.5 text-right tabular-nums text-xs font-semibold text-[#0B1120]">
                        {el.total_ballots} / {el.eligible_voter_count} ({el.participation_rate}%)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Non-Sensitive Audit Event Stream */}
          <section className="border border-[#DDDAD0] bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DDDAD0]/60 pb-4">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-[#14B8A6]" />
                <h2 className="font-display text-xl font-bold text-[#0B1120]">
                  Public Audit Event Summary
                </h2>
              </div>

              <select
                aria-label="Filter audit events by type"
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="border border-[#DDDAD0] bg-[#F7F6F2]/50 px-3 py-1.5 text-xs font-medium text-[#0B1120] rounded-[4px]"
              >
                <option value="ALL">All Event Types</option>
                {eventTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 divide-y divide-[#DDDAD0]/50">
              {filteredEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="border border-[#DDDAD0] bg-[#F7F6F2] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#0B1120]">
                        {ev.event_type}
                      </span>
                      {ev.election_title && (
                        <span className="text-xs font-medium text-[#141D30]/85">
                          {ev.election_title}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-[#141D30]/65">
                      {JSON.stringify(ev.metadata)}
                    </p>
                  </div>
                  <span className="text-xs text-[#141D30]/60 shrink-0 tabular-nums">
                    {formatDateTime(ev.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Production Gap & Security Architecture Documentation */}
          <section className="border border-[#1E293B] bg-[#0B1120] p-8 text-[#F7F6F2]">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#14B8A6]">
              <Lock className="h-4 w-4" />
              <span>Required Controls for Real-World Production Elections</span>
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold text-white">
              Prototype vs. Production Election Architecture
            </h2>
            <p className="mt-2 text-sm text-[#DDDAD0]/80 max-w-3xl">
              While this prototype implements Argon2id password hashing, HttpOnly session cookies, CSRF validation, rate limiting, RBAC, and separated ballot/lock tables, real statutory elections would additionally require:
            </p>
            <ul className="mt-5 grid gap-4 md:grid-cols-2">
              {summary.security_architecture_gaps.map((gap, i) => (
                <li
                  key={i}
                  className="border border-[#23304C] bg-[#141D30] p-4 text-xs leading-relaxed text-[#DDDAD0]"
                >
                  <span className="font-display font-semibold text-[#14B8A6] mr-2">
                    0{i + 1}.
                  </span>
                  {gap}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </motion.div>
  );
};
