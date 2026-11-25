import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Eye, ArrowRight, FileCheck2 } from 'lucide-react';
import type { AuditEvent } from '../../types';
import { formatDateTime } from '../../utils/format';
import { EASE_PREMIUM } from '../../animations/motion';

interface TransparencyTimelineSectionProps {
  events: AuditEvent[];
}

const FALLBACK_EVENTS: AuditEvent[] = [
  {
    id: 1,
    event_type: 'ELECTION_CREATED',
    election_id: 1,
    election_title: 'Metro Civic Innovation Council — 2026 General Seat',
    timestamp: new Date().toISOString(),
    metadata: { status: 'upcoming', configuration: 'verified' },
  },
  {
    id: 2,
    event_type: 'ELECTION_STATUS_CHANGED',
    election_id: 1,
    election_title: 'Metro Civic Innovation Council — 2026 General Seat',
    timestamp: new Date().toISOString(),
    metadata: { previous_status: 'upcoming', new_status: 'active' },
  },
  {
    id: 3,
    event_type: 'DEMO_BALLOT_RECORDED',
    election_id: 1,
    election_title: 'Metro Civic Innovation Council — 2026 General Seat',
    timestamp: new Date().toISOString(),
    metadata: { simulation: true, aggregate_count: 276, pii_stored: false },
  },
  {
    id: 4,
    event_type: 'RESULTS_PUBLISHED',
    election_id: 4,
    election_title: '2025 Community Participatory Budget Allocation',
    timestamp: new Date().toISOString(),
    metadata: { total_simulated_ballots: 392, mode: 'simulated' },
  },
];

export const TransparencyTimelineSection: React.FC<TransparencyTimelineSectionProps> = ({
  events,
}) => {
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const prefersReduced = useReducedMotion();
  const displayed = (events.length >= 4 ? events : FALLBACK_EVENTS).slice(0, 4);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 75%', 'end 65%'],
  });

  const lineScaleY = useTransform(scrollYProgress, [0, 1], [prefersReduced ? 1 : 0.05, 1]);
  const activeEvent = displayed[selectedIdx] || displayed[0];

  return (
    <section className="border-b border-[#DDDAD0] bg-[#F7F6F2] py-24 sm:py-32 text-[#0B1120]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#14B8A6]">
              06 · Transparency
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-[#0B1120] sm:text-5xl">
              Every milestone logged. Zero voter PII exposed.
            </h2>
          </div>
          <Link
            to="/transparency"
            className="min-h-[44px] inline-flex items-center gap-2 border border-[#0B1120] bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#0B1120] hover:bg-[#0B1120] hover:text-[#F7F6F2] transition-colors rounded-[4px]"
          >
            <Eye className="h-3.5 w-3.5 text-[#14B8A6]" />
            <span>Open Transparency Center</span>
          </Link>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:items-start">
          {/* Progressive Vertical Champagne Timeline */}
          <div ref={timelineRef} className="lg:col-span-7 relative pl-8 space-y-6">
            {/* Background track line */}
            <div
              aria-hidden="true"
              className="absolute left-2.5 top-2 bottom-2 w-[2px] bg-[#DDDAD0]"
            />
            {/* Scroll-driven Champagne progress line */}
            <motion.div
              aria-hidden="true"
              style={{ scaleY: lineScaleY, transformOrigin: 'top' }}
              className="absolute left-2.5 top-2 bottom-2 w-[2px] bg-[#14B8A6]"
            />

            {displayed.map((ev, idx) => {
              const isSelected = idx === selectedIdx;
              return (
                <motion.button
                  key={ev.id}
                  type="button"
                  onClick={() => setSelectedIdx(idx)}
                  onViewportEnter={() => setSelectedIdx(idx)}
                  viewport={{ amount: 0.7 }}
                  initial={prefersReduced ? false : { opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: idx * 0.07, ease: EASE_PREMIUM }}
                  className={`relative w-full text-left border p-5 transition-colors rounded-[4px] ${
                    isSelected
                      ? 'border-[#0B1120] bg-white'
                      : 'border-[#DDDAD0] bg-white/70 hover:bg-white'
                  }`}
                >
                  {/* Node marker */}
                  <span
                    aria-hidden="true"
                    className={`absolute -left-[27px] top-6 h-3 w-3 rounded-full border-2 transition-colors ${
                      isSelected
                        ? 'border-[#0B1120] bg-[#14B8A6]'
                        : 'border-[#14B8A6] bg-[#F7F6F2]'
                    }`}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-semibold text-[#0B1120]">
                      {ev.event_type}
                    </span>
                    <span className="text-[11px] text-[#141D30]/60 tabular-nums">
                      {formatDateTime(ev.timestamp)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-[#141D30]">
                    {ev.election_title || 'System Lifecycle Event'}
                  </p>
                </motion.button>
              );
            })}
          </div>

          {/* Live Audit-Event Inspector */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 border border-[#1E293B] bg-[#0B1120] p-6 sm:p-7 text-[#F7F6F2]">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-[#14B8A6]" />
                <span className="font-display text-sm font-semibold text-white">
                  Non-Sensitive Audit Payload
                </span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#14B8A6]">
                Public Log
              </span>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#DDDAD0]/65">
                  Selected Event
                </p>
                <p className="mt-1 font-mono text-sm font-semibold text-[#14B8A6]">
                  {activeEvent.event_type}
                </p>
              </div>

              <pre className="overflow-x-auto border border-[#23304C] bg-[#141D30] p-4 font-mono text-xs leading-relaxed text-[#F7F6F2]">
                {JSON.stringify(
                  {
                    event_id: activeEvent.id,
                    election_id: activeEvent.election_id,
                    metadata: activeEvent.metadata,
                    voter_identity_exposed: false,
                  },
                  null,
                  2
                )}
              </pre>

              <Link
                to="/transparency"
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#14B8A6] hover:text-white transition-colors"
              >
                <span>Inspect Full Audit Stream</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
