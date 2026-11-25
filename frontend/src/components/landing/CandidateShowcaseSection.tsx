import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { Candidate } from '../../types';
import { getInitials } from '../../utils/format';
import { EASE_PREMIUM } from '../../animations/motion';

interface CandidateShowcaseSectionProps {
  candidates: Candidate[];
}

const FALLBACK_CANDIDATES: Candidate[] = [
  {
    id: 1,
    name: 'Dr. Nadia Okafor',
    position: 'Lead Commissioner Candidate',
    organization: 'Civic Commons Coalition',
    biography: 'Former Director of Municipal Open Data leading public-interest digital transformation.',
    manifesto: 'Eliminate opaque vendor lock-in and publish plain-language service audits every quarter.',
    vision: 'Every resident navigates public services in under three minutes.',
    objectives: ['Multilingual civic portal', 'Open-source civic software'],
    accent_color: '#14B8A6',
    election_id: 1,
  },
  {
    id: 2,
    name: 'Julian Mercer',
    position: 'Lead Commissioner Candidate',
    organization: 'Metropolitan Reform Alliance',
    biography: 'Urban systems engineer and neighborhood budget chair focused on procurement transparency.',
    manifesto: 'Pair real-time public works tracking with streamlined civic feedback loops.',
    vision: 'Measurable, accountable public operations.',
    objectives: ['Live infrastructure dashboards', '45% faster permitting'],
    accent_color: '#E05A47',
    election_id: 1,
  },
  {
    id: 3,
    name: 'Sora Takahashi',
    position: 'Lead Commissioner Candidate',
    organization: 'Independent Civic Technologists',
    biography: 'Accessibility researcher specializing in assistive web standards and privacy architecture.',
    manifesto: 'Every municipal platform must pass independent accessibility verification before launch.',
    vision: 'Universal civic access built on privacy-respecting defaults.',
    objectives: ['Enforce WCAG AA compliance', 'Assistive civic kiosks'],
    accent_color: '#141D30',
    election_id: 1,
  },
];

export const CandidateShowcaseSection: React.FC<CandidateShowcaseSectionProps> = ({
  candidates,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Layered depth speeds driven purely by vertical scroll
  const bgWordX = useTransform(scrollYProgress, [0, 1], [prefersReduced ? 0 : -40, prefersReduced ? 0 : 40]);
  const rowShift = useTransform(scrollYProgress, [0, 1], [prefersReduced ? 0 : 22, prefersReduced ? 0 : -22]);

  const displayed = (candidates.length >= 3 ? candidates : FALLBACK_CANDIDATES).slice(0, 3);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-b border-[#DDDAD0] bg-[#F7F6F2] py-24 sm:py-32 text-[#0B1120]"
    >
      {/* Parallax Editorial Background Typography */}
      <motion.div
        style={{ x: bgWordX }}
        aria-hidden="true"
        className="pointer-events-none select-none absolute top-10 left-0 right-0 whitespace-nowrap font-display text-[6rem] sm:text-[9rem] font-bold uppercase tracking-tighter text-[#0B1120]/[0.035]"
      >
        CANDIDATE DOSSIERS · TRANSPARENT PLATFORMS ·
      </motion.div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E05A47]">
              03 · Candidate Experience
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-[#0B1120] sm:text-5xl">
              Platforms presented with equal clarity.
            </h2>
          </div>

          <Link
            to="/candidates"
            className="min-h-[44px] inline-flex items-center gap-2 border border-[#0B1120] bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#0B1120] hover:bg-[#0B1120] hover:text-[#F7F6F2] transition-colors rounded-[4px]"
          >
            <span>Compare All Candidates</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Layered Candidate Cards */}
        <motion.div
          style={{ y: rowShift }}
          className="mt-14 grid gap-6 md:grid-cols-3"
        >
          {displayed.map((cand, idx) => (
            <motion.article
              key={cand.id}
              initial={prefersReduced ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: EASE_PREMIUM }}
              className={`border border-[#DDDAD0] bg-white p-6 sm:p-7 flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1 hover:border-[#0B1120] ${
                idx === 1 ? 'md:translate-y-6' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center font-display text-sm font-bold text-white rounded-[4px]"
                    style={{ backgroundColor: cand.accent_color || '#0B1120' }}
                  >
                    {getInitials(cand.name)}
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#0D9488]">
                    Dossier 0{idx + 1}
                  </span>
                </div>

                <h3 className="mt-5 font-display text-xl font-bold text-[#0B1120]">
                  {cand.name}
                </h3>
                <p className="mt-0.5 text-xs font-medium text-[#0D9488]">
                  {cand.organization}
                </p>

                <p className="mt-4 text-sm leading-relaxed text-[#141D30]/85 line-clamp-3">
                  {cand.manifesto}
                </p>
              </div>

              {cand.objectives.length > 0 && (
                <div className="mt-6 border-t border-[#DDDAD0]/60 pt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141D30]/60">
                    Priority Objective
                  </p>
                  <p className="mt-1.5 text-xs font-medium text-[#0B1120]">
                    {cand.objectives[0]}
                  </p>
                </div>
              )}
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
