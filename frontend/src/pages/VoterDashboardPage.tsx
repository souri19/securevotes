import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Vote,
  Clock,
  CheckCircle2,
  Bell,
  ShieldCheck,
  ArrowRight,
  User as UserIcon,
  IdCard,
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Election, ParticipationHistoryItem } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { CardSkeleton } from '../components/Skeletons';
import { formatCountdown, formatDateTime } from '../utils/format';
import { pageTransitionVariants, staggerContainer, staggerItem } from '../animations/motion';

export const VoterDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [history, setHistory] = useState<ParticipationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest<Election[]>('/elections'),
      apiRequest<ParticipationHistoryItem[]>('/profile/participation'),
    ])
      .then(([els, hist]) => {
        if (!active) return;
        setElections(els);
        setHistory(hist);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load dashboard.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const activeElections = elections.filter((e) => e.status === 'active');
  const upcomingElections = elections.filter((e) => e.status === 'upcoming');
  const pendingVoteCount = activeElections.filter((e) => !e.has_voted).length;

  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10"
    >
      {/* Greeting & Voter ID Eligibility Header */}
      <div className="grid gap-6 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-8 border border-[#DDDAD0] bg-white p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0D9488]">
                Demo Voter Workspace
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 border border-[#DDDAD0] bg-[#F7F6F2] px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[#0B1120] rounded-[3px]">
                  <IdCard className="h-3.5 w-3.5 text-[#0D9488]" />
                  {user?.voter_id}
                </span>
                <StatusBadge status={user?.role || 'voter'} />
              </div>
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold text-[#0B1120]">
              Welcome, {user?.name}
            </h1>
            <p className="mt-2 text-sm text-[#1E293B]/80 max-w-xl">
              Review active simulated ballots, track upcoming schedules, and verify your one-vote-per-election participation log.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-[#DDDAD0]/70 pt-5">
            <div className="flex items-center gap-2 text-xs font-medium text-[#0B1120]">
              <ShieldCheck className="h-4 w-4 text-[#0D9488]" />
              <span>
                One-Vote Guarantee:{' '}
                <strong className="text-[#0B1120]">
                  {user?.status === 'active' ? 'Verified Active (1 ballot / election)' : 'Suspended'}
                </strong>
              </span>
            </div>
            <span className="text-[#DDDAD0]">|</span>
            <Link
              to="/profile"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1E293B] hover:text-[#0D9488] transition-colors"
            >
              <UserIcon className="h-3.5 w-3.5" />
              <span>Manage Profile</span>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-4 border border-[#1E293B] bg-[#0B1120] p-7 text-[#F7F6F2] flex flex-col justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-[0.16em] text-[#14B8A6]">
              Open Demo Ballots
            </span>
            <p className="mt-3 font-display text-4xl font-bold tabular-nums text-white">
              {pendingVoteCount}
            </p>
            <p className="mt-1 text-sm text-[#94A3B8]">
              {pendingVoteCount === 1
                ? 'Active election awaiting your single ballot'
                : 'Active elections awaiting your single ballot'}
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-[#1E293B] flex items-center justify-between text-xs text-[#CBD5E1]">
            <span>Completed Demo Ballots</span>
            <span className="font-display text-base font-semibold text-[#E5A93C] tabular-nums">
              {history.length}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="border border-[#E05A47] bg-[#E05A47]/10 p-4 text-sm text-[#0B1120]">
          {error}
        </div>
      )}

      {loading ? (
        <CardSkeleton count={3} />
      ) : (
        <>
          <section>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-[#0B1120]">
                Active Demo Elections
              </h2>
              <Link
                to="/elections"
                className="text-xs font-semibold uppercase tracking-wider text-[#0D9488] hover:text-[#0B1120]"
              >
                All Elections →
              </Link>
            </div>

            {activeElections.length === 0 ? (
              <div className="mt-4 border border-[#DDDAD0] bg-white p-8 text-center text-sm text-[#1E293B]/70">
                No active demo elections right now.
              </div>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="mt-4 grid gap-6 md:grid-cols-2"
              >
                {activeElections.map((el) => {
                  const countdown = formatCountdown(el.end_time);
                  return (
                    <motion.div
                      key={el.id}
                      variants={staggerItem}
                      whileHover={{ y: -3 }}
                      className="border border-[#DDDAD0] bg-white p-6 flex flex-col justify-between hover:border-[#0D9488] transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <StatusBadge status={el.status} />
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#E05A47]">
                            <Clock className="h-3.5 w-3.5" />
                            {countdown.label}
                          </span>
                        </div>
                        <h3 className="mt-4 font-display text-xl font-semibold text-[#0B1120]">
                          {el.title}
                        </h3>
                        <p className="mt-2 text-sm text-[#1E293B]/75 line-clamp-2">
                          {el.description}
                        </p>
                      </div>

                      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#DDDAD0]/60 pt-4">
                        {el.has_voted ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D9488]">
                            <CheckCircle2 className="h-4 w-4" />
                            Voted (1/1 Ballot Used)
                          </span>
                        ) : (
                          <span className="text-xs text-[#1E293B]/70">
                            {el.candidate_count} candidates · Eligible
                          </span>
                        )}

                        <div className="flex items-center gap-2.5">
                          <Link
                            to={`/elections/${el.id}`}
                            className="min-h-[38px] inline-flex items-center border border-[#DDDAD0] px-3 py-1.5 text-xs font-medium text-[#0B1120] hover:bg-[#F7F6F2] rounded-[4px]"
                          >
                            Details
                          </Link>
                          {!el.has_voted ? (
                            <Link
                              to={`/vote/${el.id}`}
                              className="min-h-[38px] inline-flex items-center gap-1.5 bg-[#0B1120] px-4 py-1.5 text-xs font-semibold text-[#F7F6F2] hover:bg-[#141D30] rounded-[4px]"
                            >
                              <Vote className="h-3.5 w-3.5 text-[#14B8A6]" />
                              <span>Vote Now</span>
                            </Link>
                          ) : (
                            <Link
                              to={`/results?election=${el.id}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B1120] hover:text-[#0D9488]"
                            >
                              <span>View Tally</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </section>

          <div className="grid gap-8 lg:grid-cols-12">
            <section className="lg:col-span-7 border border-[#DDDAD0] bg-white p-6">
              <div className="flex items-center justify-between border-b border-[#DDDAD0]/60 pb-4">
                <h2 className="font-display text-xl font-bold text-[#0B1120]">
                  Participation History
                </h2>
                <span className="text-[11px] uppercase tracking-wider text-[#0D9488] font-semibold">
                  Choice-Blind Log
                </span>
              </div>

              {history.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-[#1E293B]/70">
                    You have not participated in any simulated elections yet.
                  </p>
                  <Link
                    to="/elections"
                    className="mt-3 inline-block text-xs font-semibold uppercase tracking-wider text-[#0D9488] underline underline-offset-4"
                  >
                    Browse Active Elections
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-[#DDDAD0]/60">
                  {history.map((item) => (
                    <li key={item.election_id} className="py-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-display text-sm font-semibold text-[#0B1120]">
                          {item.election_title}
                        </p>
                        <p className="mt-1 text-xs text-[#1E293B]/70">
                          Recorded {formatDateTime(item.participated_at)} · {item.privacy_note}
                        </p>
                      </div>
                      <StatusBadge status={item.election_status} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="lg:col-span-5 space-y-6">
              <div className="border border-[#DDDAD0] bg-white p-6">
                <div className="flex items-center gap-2 border-b border-[#DDDAD0]/60 pb-3">
                  <Bell className="h-4 w-4 text-[#E5A93C]" />
                  <h2 className="font-display text-lg font-bold text-[#0B1120]">
                    Civic Notices
                  </h2>
                </div>
                <ul className="mt-4 space-y-3 text-sm">
                  {pendingVoteCount > 0 && (
                    <li className="border-l-2 border-[#14B8A6] pl-3 text-[#0B1120]">
                      <strong>{pendingVoteCount}</strong> active demo ballot{pendingVoteCount > 1 ? 's' : ''} open for Voter ID <span className="font-mono text-xs">{user?.voter_id}</span>.
                    </li>
                  )}
                  {upcomingElections.map((up) => (
                    <li key={up.id} className="border-l-2 border-[#E5A93C] pl-3 text-[#1E293B]/85">
                      Upcoming: <strong>{up.title}</strong> opens {formatDateTime(up.start_time)}.
                    </li>
                  ))}
                  <li className="border-l-2 border-[#DDDAD0] pl-3 text-xs text-[#64748B]">
                    One-vote rule: Once a ballot is submitted, your Voter ID is locked for that election while your selection remains unlinked.
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </>
      )}
    </motion.div>
  );
};
