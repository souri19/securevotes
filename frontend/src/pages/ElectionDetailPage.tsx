import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  ShieldCheck,
  Vote,
  BarChart3,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { apiRequest } from '../services/api';
import type { ElectionDetail } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { CardSkeleton } from '../components/Skeletons';
import { formatDateTime, getInitials } from '../utils/format';
import { useCountdown } from '../hooks/useCountdown';
import { pageTransitionVariants } from '../animations/motion';

export const ElectionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [election, setElection] = useState<ElectionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiRequest<ElectionDetail>(`/elections/${id}`)
      .then((data) => {
        setElection(data);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Unable to load election details.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const countdown = useCountdown(election?.end_time);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <CardSkeleton count={3} />
      </div>
    );
  }

  if (error || !election) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="border border-[#E05A47] bg-white p-8">
          <h1 className="font-display text-2xl font-bold text-[#0B1120]">Election Unavailable</h1>
          <p className="mt-2 text-sm text-[#141D30]/80">{error || 'Election not found.'}</p>
          <Link
            to="/elections"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0B1120] underline underline-offset-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Election Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10"
    >
      <Link
        to="/elections"
        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#141D30]/75 hover:text-[#0B1120]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Elections</span>
      </Link>

      {/* Header Block */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 border border-[#DDDAD0] bg-white p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#14B8A6]">
              {election.election_type}
            </span>
            <StatusBadge status={election.status} />
          </div>

          <h1 className="mt-4 font-display text-3xl font-bold text-[#0B1120] sm:text-4xl">
            {election.title}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[#141D30]/85 sm:text-base">
            {election.description}
          </p>

          <div className="mt-6 grid gap-4 border-t border-[#DDDAD0]/60 pt-6 sm:grid-cols-2 text-xs">
            <div className="flex items-start gap-2.5">
              <Calendar className="h-4 w-4 text-[#14B8A6] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#0B1120]">Election Schedule</p>
                <p className="mt-0.5 text-[#141D30]/75">
                  Opens: {formatDateTime(election.start_time)}
                </p>
                <p className="text-[#141D30]/75">Closes: {formatDateTime(election.end_time)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-[#14B8A6] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#0B1120]">Demo Eligibility</p>
                <p className="mt-0.5 text-[#141D30]/75">{election.eligibility_note}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action & Telemetry Card */}
        <div className="lg:col-span-4 border border-[#1E293B] bg-[#0B1120] p-8 text-[#F7F6F2] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#DDDAD0]/80">
              <span>Simulated Participation</span>
              <span className="inline-flex items-center gap-1 text-[#14B8A6]">
                <Clock className="h-3.5 w-3.5" />
                {countdown.label}
              </span>
            </div>
            <p className="mt-3 font-display text-4xl font-bold tabular-nums text-white">
              {election.participation_rate}%
            </p>
            <p className="mt-1 text-xs text-[#DDDAD0]/70 tabular-nums">
              {election.total_ballots.toLocaleString()} of {election.eligible_voter_count.toLocaleString()} eligible demo voters
            </p>
            <div className="mt-4 h-1.5 w-full bg-[#1E293B]">
              <div
                className="h-full bg-[#14B8A6]"
                style={{ width: `${Math.min(election.participation_rate, 100)}%` }}
              />
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {election.status === 'active' && !election.has_voted && (
              <Link
                to={`/vote/${election.id}`}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#14B8A6] px-5 py-3 text-sm font-semibold text-[#0B1120] hover:bg-[#d6ba80] transition-colors rounded-[4px]"
              >
                <Vote className="h-4 w-4" />
                <span>Enter Demo Voting Booth</span>
              </Link>
            )}
            {election.has_voted && (
              <div className="flex items-center gap-2 border border-[#14B8A6]/40 bg-[#14B8A6]/10 px-4 py-3 text-xs text-[#14B8A6]">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Your demo participation is recorded for this election.</span>
              </div>
            )}
            <Link
              to={`/results?election=${election.id}`}
              className="w-full inline-flex items-center justify-center gap-2 border border-[#334155] bg-[#141D30] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#F7F6F2] hover:border-[#14B8A6] transition-colors rounded-[4px]"
            >
              <BarChart3 className="h-4 w-4 text-[#14B8A6]" />
              <span>View Simulated Results</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Candidate Slate */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0D9488]">
              Official Demo Slate
            </span>
            <h2 className="mt-1 font-display text-2xl font-bold text-[#0B1120]">
              Candidates &amp; Initiatives ({election.candidates.length})
            </h2>
          </div>
          <Link
            to={`/candidates?election=${election.id}`}
            className="text-xs font-semibold uppercase tracking-wider text-[#0B1120] underline underline-offset-4 hover:text-[#E05A47]"
          >
            Compare Candidates Side-by-Side →
          </Link>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {election.candidates.map((cand) => (
            <article
              key={cand.id}
              className="border border-[#DDDAD0] bg-white p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center font-display text-sm font-bold text-white rounded-[4px]"
                    style={{ backgroundColor: cand.accent_color || '#0B1120' }}
                  >
                    {getInitials(cand.name)}
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-[#0B1120]">
                      {cand.name}
                    </h3>
                    <p className="text-xs font-medium text-[#0D9488]">
                      {cand.position} · {cand.organization}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-[#141D30]/85">
                  {cand.manifesto}
                </p>

                {cand.objectives.length > 0 && (
                  <div className="mt-4 border-t border-[#DDDAD0]/60 pt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#141D30]/60">
                      Key Objectives
                    </p>
                    <ul className="mt-2 space-y-1.5 text-xs text-[#141D30]/85">
                      {cand.objectives.map((obj, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1 w-1 shrink-0 bg-[#E05A47]" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </motion.div>
  );
};
