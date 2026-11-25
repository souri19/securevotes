import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Calendar, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '../services/api';
import type { Election } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { CardSkeleton } from '../components/Skeletons';
import { formatShortDate } from '../utils/format';
import { pageTransitionVariants, staggerContainer, staggerItem } from '../animations/motion';

const STATUS_TABS = [
  { key: 'all', label: 'All Elections' },
  { key: 'active', label: 'Active' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
];

export const ElectionsDirectoryPage: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (search.trim()) params.set('search', search.trim());

    const timer = setTimeout(() => {
      apiRequest<Election[]>(`/elections?${params.toString()}`, {
        signal: controller.signal,
      })
        .then((data) => {
          setElections(data);
          setError(null);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            setError(err instanceof Error ? err.message : 'Failed to load elections.');
          }
        })
        .finally(() => setLoading(false));
    }, 180);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [statusFilter, search]);

  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="border-b border-[#DDDAD0] pb-8">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0D9488]">
          Civic Directory · Simulated Cycles
        </span>
        <div className="mt-3 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-[#0B1120] sm:text-4xl">
              Election Directory
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[#1E293B]/80">
              Search active, upcoming, and completed demonstration elections. Each verified Voter ID may submit one simulated ballot per active election.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search elections or topics..."
              aria-label="Search elections"
              className="w-full min-h-[44px] border border-[#DDDAD0] bg-white pl-10 pr-4 py-2.5 text-sm text-[#0B1120] focus:border-[#0D9488] rounded-[4px]"
            />
          </div>
        </div>

        {/* Animated Shared-Element Filter Tabs */}
        <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Filter elections by status">
          {STATUS_TABS.map((tab) => {
            const active = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setStatusFilter(tab.key)}
                className={`relative min-h-[40px] px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors rounded-[4px] border ${
                  active
                    ? 'border-[#0B1120] text-[#F7F6F2]'
                    : 'border-[#DDDAD0] bg-white text-[#1E293B] hover:border-[#0D9488]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="election-filter-pill"
                    transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                    className="absolute inset-0 bg-[#0B1120] rounded-[3px]"
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        {error && (
          <div className="border border-[#E05A47] bg-[#E05A47]/10 p-4 text-sm text-[#0B1120]">
            {error}
          </div>
        )}

        {loading ? (
          <CardSkeleton count={4} />
        ) : elections.length === 0 ? (
          <div className="border border-[#DDDAD0] bg-white p-12 text-center">
            <h2 className="font-display text-xl font-semibold text-[#0B1120]">
              No matching elections found
            </h2>
            <p className="mt-2 text-sm text-[#1E293B]/70">
              Try clearing your search term or switching to another election status filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setSearch('');
              }}
              className="mt-5 min-h-[40px] border border-[#0B1120] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#0B1120] hover:bg-[#0B1120] hover:text-white transition-colors rounded-[4px]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid gap-6 md:grid-cols-2"
          >
            {elections.map((el, index) => {
              const isFeatured = index === 0 && el.status === 'active' && statusFilter === 'all';
              return (
                <motion.article
                  key={el.id}
                  variants={staggerItem}
                  whileHover={{ y: -3 }}
                  className={`flex flex-col justify-between border p-7 transition-colors ${
                    isFeatured
                      ? 'md:col-span-2 border-[#1E293B] bg-[#0B1120] text-[#F7F6F2]'
                      : 'border-[#DDDAD0] bg-white text-[#0B1120] hover:border-[#0D9488]'
                  }`}
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-[0.15em] ${
                          isFeatured ? 'text-[#14B8A6]' : 'text-[#0D9488]'
                        }`}
                      >
                        {el.election_type}
                      </span>
                      <div className="flex items-center gap-2">
                        {el.has_voted && (
                          <span className="inline-flex items-center gap-1 border border-[#14B8A6]/50 bg-[#14B8A6]/15 px-2 py-0.5 text-[11px] font-medium text-[#14B8A6] rounded-[3px]">
                            <CheckCircle2 className="h-3 w-3" />
                            Voted (1/1)
                          </span>
                        )}
                        <StatusBadge status={el.status} dark={isFeatured} />
                      </div>
                    </div>

                    <h2
                      className={`mt-4 font-display font-bold leading-snug ${
                        isFeatured ? 'text-2xl sm:text-3xl text-white' : 'text-xl text-[#0B1120]'
                      }`}
                    >
                      {el.title}
                    </h2>

                    <p
                      className={`mt-3 text-sm leading-relaxed ${
                        isFeatured ? 'text-[#CBD5E1] max-w-3xl' : 'text-[#1E293B]/80'
                      }`}
                    >
                      {el.description}
                    </p>

                    <div
                      className={`mt-5 flex flex-wrap gap-5 text-xs ${
                        isFeatured ? 'text-[#94A3B8]' : 'text-[#64748B]'
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-[#14B8A6]" />
                        {formatShortDate(el.start_time)} – {formatShortDate(el.end_time)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-[#E5A93C]" />
                        {el.candidate_count} Candidates · {el.eligibility_note}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`mt-6 pt-5 border-t flex flex-wrap items-center justify-between gap-4 ${
                      isFeatured ? 'border-[#1E293B]' : 'border-[#DDDAD0]/60'
                    }`}
                  >
                    <div className="flex-1 min-w-[200px] max-w-sm">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className={isFeatured ? 'text-[#94A3B8]' : 'text-[#64748B]'}>
                          Simulated Turnout
                        </span>
                        <span className="font-semibold tabular-nums">
                          {el.participation_rate}% ({el.total_ballots}/{el.eligible_voter_count})
                        </span>
                      </div>
                      <div className={`h-1.5 w-full ${isFeatured ? 'bg-[#1E293B]' : 'bg-[#ECEAE2]'}`}>
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${Math.min(el.participation_rate, 100)}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.7 }}
                          className={`h-full ${isFeatured ? 'bg-[#14B8A6]' : 'bg-[#0B1120]'}`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        to={`/elections/${el.id}`}
                        className={`min-h-[40px] inline-flex items-center gap-1.5 border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors rounded-[4px] ${
                          isFeatured
                            ? 'border-[#23304C] text-[#F7F6F2] hover:border-[#14B8A6]'
                            : 'border-[#DDDAD0] text-[#0B1120] hover:border-[#0B1120]'
                        }`}
                      >
                        <span>Details</span>
                      </Link>
                      {el.status === 'active' && !el.has_voted && (
                        <Link
                          to={`/vote/${el.id}`}
                          className="min-h-[40px] inline-flex items-center gap-1.5 bg-[#14B8A6] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#0B1120] hover:bg-[#2DD4BF] transition-colors rounded-[4px]"
                        >
                          <span>Vote Now</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                      {el.status === 'completed' && (
                        <Link
                          to={`/results?election=${el.id}`}
                          className="min-h-[40px] inline-flex items-center gap-1.5 bg-[#0B1120] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#F7F6F2] hover:bg-[#141D30] transition-colors rounded-[4px]"
                        >
                          <span>Results</span>
                          <ArrowRight className="h-3.5 w-3.5 text-[#14B8A6]" />
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
