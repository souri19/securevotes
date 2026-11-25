import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Vote, Users, UserCheck, ScrollText, ArrowRight, ShieldCheck } from 'lucide-react';
import { apiRequest } from '../../services/api';
import type { AuditEvent, PlatformOverview } from '../../types';
import { AnimatedCounter } from '../../components/AnimatedCounter';
import { CardSkeleton } from '../../components/Skeletons';
import { formatDateTime } from '../../utils/format';
import { pageTransitionVariants } from '../../animations/motion';

export const AdminOverviewPage: React.FC = () => {
  const [overview, setOverview] = useState<PlatformOverview | null>(null);
  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiRequest<PlatformOverview>('/admin/overview'),
      apiRequest<AuditEvent[]>('/admin/logs?limit=8'),
    ])
      .then(([ov, lg]) => {
        setOverview(ov);
        setLogs(lg);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      <div className="border-b border-[#DDDAD0] pb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#E05A47]">
            Administrative Command · RBAC Protected
          </span>
          <h1 className="mt-2 font-display text-3xl font-bold text-[#0B1120]">
            Election Operations Overview
          </h1>
        </div>
        <Link
          to="/admin/elections"
          className="inline-flex items-center gap-2 bg-[#0B1120] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#F7F6F2] hover:bg-[#141D30] rounded-[4px]"
        >
          <span>Manage Elections</span>
          <ArrowRight className="h-3.5 w-3.5 text-[#14B8A6]" />
        </Link>
      </div>

      {loading || !overview ? (
        <CardSkeleton count={4} />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border border-[#1E293B] bg-[#0B1120] p-6 text-[#F7F6F2]">
              <div className="flex items-center justify-between text-xs text-[#DDDAD0]/70">
                <span>Total Elections</span>
                <Vote className="h-4 w-4 text-[#14B8A6]" />
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-white">
                <AnimatedCounter value={overview.total_elections} />
              </p>
              <p className="mt-1 text-xs text-[#14B8A6]">
                {overview.active_elections} active · {overview.upcoming_elections} upcoming
              </p>
            </div>

            <div className="border border-[#DDDAD0] bg-white p-6">
              <div className="flex items-center justify-between text-xs text-[#141D30]/70">
                <span>Simulated Ballots</span>
                <ShieldCheck className="h-4 w-4 text-[#E05A47]" />
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-[#0B1120]">
                <AnimatedCounter value={overview.total_simulated_ballots} />
              </p>
              <p className="mt-1 text-xs text-[#141D30]/65">
                Avg turnout {overview.average_participation_rate}%
              </p>
            </div>

            <div className="border border-[#DDDAD0] bg-white p-6">
              <div className="flex items-center justify-between text-xs text-[#141D30]/70">
                <span>Candidates</span>
                <UserCheck className="h-4 w-4 text-[#14B8A6]" />
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-[#0B1120]">
                <AnimatedCounter value={overview.total_candidates} />
              </p>
              <Link
                to="/admin/candidates"
                className="mt-1 inline-block text-xs font-medium text-[#0B1120] underline underline-offset-2"
              >
                Manage roster →
              </Link>
            </div>

            <div className="border border-[#DDDAD0] bg-white p-6">
              <div className="flex items-center justify-between text-xs text-[#141D30]/70">
                <span>Demo Voters</span>
                <Users className="h-4 w-4 text-[#0B1120]" />
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-[#0B1120]">
                <AnimatedCounter value={overview.registered_demo_voters} />
              </p>
              <Link
                to="/admin/users"
                className="mt-1 inline-block text-xs font-medium text-[#0B1120] underline underline-offset-2"
              >
                Manage voters →
              </Link>
            </div>
          </div>

          {/* Recent Admin & System Audit Stream */}
          <section className="border border-[#DDDAD0] bg-white p-6">
            <div className="flex items-center justify-between border-b border-[#DDDAD0]/60 pb-4">
              <div className="flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-[#14B8A6]" />
                <h2 className="font-display text-lg font-bold text-[#0B1120]">
                  Recent Audit Events
                </h2>
              </div>
              <Link
                to="/admin/logs"
                className="text-xs font-semibold uppercase tracking-wider text-[#0B1120] hover:text-[#E05A47]"
              >
                Full Log →
              </Link>
            </div>

            <div className="mt-3 divide-y divide-[#DDDAD0]/50">
              {logs.map((ev) => (
                <div key={ev.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-semibold text-[#0B1120]">
                      {ev.event_type}
                    </span>
                    {ev.election_title && (
                      <span className="ml-2 text-xs text-[#141D30]/75">
                        · {ev.election_title}
                      </span>
                    )}
                    <p className="font-mono text-[11px] text-[#141D30]/60 mt-0.5">
                      {JSON.stringify(ev.metadata)}
                    </p>
                  </div>
                  <span className="text-xs text-[#141D30]/60 tabular-nums">
                    {formatDateTime(ev.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </motion.div>
  );
};
