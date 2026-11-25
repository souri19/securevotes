import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Scale, Check, X } from 'lucide-react';
import { apiRequest } from '../services/api';
import type { Candidate, Election } from '../types';
import { CardSkeleton } from '../components/Skeletons';
import { getInitials } from '../utils/format';
import { pageTransitionVariants } from '../animations/motion';

export const CandidatesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialElection = searchParams.get('election') || 'all';

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<string>(initialElection);
  const [search, setSearch] = useState('');
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<Election[]>('/elections').then(setElections).catch(() => null);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedElection !== 'all') params.set('election_id', selectedElection);
    if (search.trim()) params.set('search', search.trim());

    const timer = setTimeout(() => {
      apiRequest<Candidate[]>(`/candidates?${params.toString()}`)
        .then(setCandidates)
        .finally(() => setLoading(false));
    }, 150);

    return () => clearTimeout(timer);
  }, [selectedElection, search]);

  const toggleCompare = (id: number) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  };

  const comparedCandidates = candidates.filter((c) => compareIds.includes(c.id));

  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10"
    >
      <div className="border-b border-[#DDDAD0] pb-8">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#14B8A6]">
          Candidate Dossiers &amp; Comparison
        </span>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-[#0B1120] sm:text-4xl">
              Candidate Profiles
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[#141D30]/80">
              Inspect biographies, manifestos, and policy objectives. Select up to three candidates to compare side-by-side.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              aria-label="Filter candidates by election"
              value={selectedElection}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedElection(val);
                if (val === 'all') {
                  searchParams.delete('election');
                } else {
                  searchParams.set('election', val);
                }
                setSearchParams(searchParams, { replace: true });
              }}
              className="border border-[#DDDAD0] bg-white px-3.5 py-2.5 text-sm text-[#0B1120] rounded-[4px]"
            >
              <option value="all">All Elections</option>
              {elections.map((el) => (
                <option key={el.id} value={String(el.id)}>
                  {el.title}
                </option>
              ))}
            </select>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#141D30]/50" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidates..."
                aria-label="Search candidates"
                className="w-full sm:w-64 border border-[#DDDAD0] bg-white pl-9 pr-3 py-2.5 text-sm rounded-[4px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix */}
      {comparedCandidates.length >= 2 && (
        <section className="border border-[#1E293B] bg-[#0B1120] p-6 sm:p-8 text-[#F7F6F2]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E293B] pb-4">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-[#14B8A6]" />
              <h2 className="font-display text-xl font-bold text-white">
                Side-by-Side Comparison ({comparedCandidates.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setCompareIds([])}
              className="inline-flex items-center gap-1 text-xs text-[#DDDAD0] hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
              Clear Selection
            </button>
          </div>

          <div className={`mt-6 grid gap-6 ${comparedCandidates.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            {comparedCandidates.map((cand) => (
              <div key={cand.id} className="border border-[#23304C] bg-[#141D30] p-5 space-y-4">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[#14B8A6]">
                    {cand.organization}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-bold text-white">
                    {cand.name}
                  </h3>
                  <p className="text-xs text-[#DDDAD0]/70">{cand.position}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#DDDAD0]/60">
                    Vision
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#F7F6F2]">
                    {cand.vision || cand.manifesto}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#DDDAD0]/60">
                    Core Objectives
                  </p>
                  <ul className="mt-1.5 space-y-1 text-xs text-[#DDDAD0]">
                    {cand.objectives.map((obj, idx) => (
                      <li key={idx}>• {obj}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {loading ? (
        <CardSkeleton count={4} />
      ) : candidates.length === 0 ? (
        <div className="border border-[#DDDAD0] bg-white p-12 text-center text-sm text-[#141D30]/70">
          No candidate dossiers matched your current filters.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {candidates.map((cand) => {
            const isSelected = compareIds.includes(cand.id);
            return (
              <article
                key={cand.id}
                className={`border bg-white p-6 flex flex-col justify-between transition-colors ${
                  isSelected ? 'border-[#0B1120] ring-1 ring-[#0B1120]' : 'border-[#DDDAD0]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center font-display text-sm font-bold text-white rounded-[4px]"
                        style={{ backgroundColor: cand.accent_color || '#0B1120' }}
                      >
                        {getInitials(cand.name)}
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0D9488]">
                          {cand.election_title || `Election #${cand.election_id}`}
                        </p>
                        <h2 className="mt-1 font-display text-xl font-bold text-[#0B1120]">
                          {cand.name}
                        </h2>
                        <p className="text-xs text-[#141D30]/75">
                          {cand.position} · {cand.organization}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleCompare(cand.id)}
                      className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[11px] font-medium transition-colors rounded-[3px] shrink-0 ${
                        isSelected
                          ? 'border-[#0B1120] bg-[#0B1120] text-white'
                          : 'border-[#DDDAD0] text-[#141D30] hover:border-[#0B1120]'
                      }`}
                    >
                      {isSelected ? <Check className="h-3 w-3" /> : <Scale className="h-3 w-3" />}
                      <span>{isSelected ? 'Comparing' : 'Compare'}</span>
                    </button>
                  </div>

                  <div className="mt-5 space-y-3 text-sm">
                    <div>
                      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#141D30]/60">
                        Biography
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-[#141D30]/85">
                        {cand.biography}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#141D30]/60">
                        Manifesto
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-[#0B1120]">
                        {cand.manifesto}
                      </p>
                    </div>
                    {cand.vision && (
                      <div className="border-l-2 border-[#14B8A6] pl-3">
                        <p className="text-xs italic text-[#141D30]/80">
                          &ldquo;{cand.vision}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {cand.objectives.length > 0 && (
                  <div className="mt-5 border-t border-[#DDDAD0]/60 pt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#141D30]/60">
                      Key Objectives
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-[#141D30]/85">
                      {cand.objectives.map((obj, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1 w-1 shrink-0 bg-[#E05A47]" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
