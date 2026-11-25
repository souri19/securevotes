import React, { useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useReducedMotion } from 'framer-motion';
import { Compass, Users, CheckSquare, FileCheck2 } from 'lucide-react';
import { EASE_PREMIUM } from '../../animations/motion';

const STAGES = [
  {
    num: '01',
    title: 'Discover an election.',
    desc: 'Browse active, upcoming, and archived cycles with live countdowns, clear eligibility criteria, and real-time simulated turnout.',
    icon: Compass,
    previewTitle: 'Election Directory',
    previewTag: 'Active Polls · 2 Cycles Open',
    lines: ['Metro Civic Innovation Council', 'Open Campus Sustainability Initiative'],
  },
  {
    num: '02',
    title: 'Explore candidates.',
    desc: 'Read structured biographies, manifestos, and core policy objectives—then compare up to three candidates side-by-side.',
    icon: Users,
    previewTitle: 'Candidate Comparison Matrix',
    previewTag: 'Bias-Neutral Dossiers',
    lines: ['Dr. Nadia Okafor · Civic Commons', 'Julian Mercer · Reform Alliance'],
  },
  {
    num: '03',
    title: 'Review your demo ballot.',
    desc: 'Select a candidate in a calm, distraction-free booth and verify your selection on a dedicated summary screen before confirming.',
    icon: CheckSquare,
    previewTitle: 'Demo Ballot Review',
    previewTag: 'Final Verification Step',
    lines: ['Selected: Dr. Nadia Okafor', 'Identity detached from ballot choice'],
  },
  {
    num: '04',
    title: 'Complete the demo participation flow.',
    desc: 'Receive an unlinkable demo receipt reference while aggregate turnout and non-sensitive audit logs update transparently.',
    icon: FileCheck2,
    previewTitle: 'Simulated Receipt Issued',
    previewTag: 'SV-DEMO-8A4C21',
    lines: ['Participation lock recorded', 'Public tally incremented'],
  },
];

export const HowItWorksSticky: React.FC = () => {
  const containerRef = useRef<HTMLElement | null>(null);
  const prefersReduced = useReducedMotion();
  const [activeStage, setActiveStage] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const idx = Math.min(STAGES.length - 1, Math.max(0, Math.floor(latest * STAGES.length)));
    setActiveStage(idx);
  });

  const current = STAGES[activeStage];
  const ActiveIcon = current.icon;

  return (
    <section
      ref={containerRef}
      className="relative border-b border-[#DDDAD0] bg-white text-[#0B1120]"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="max-w-2xl">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#14B8A6]">
            02 · How It Works
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-[#0B1120] sm:text-5xl">
            Four deliberate stages from discovery to receipt.
          </h2>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:items-start">
          {/* Sequential Stage Descriptions (Drives scroll height on desktop) */}
          <div className="lg:col-span-5 space-y-6 lg:space-y-36 lg:py-10">
            {STAGES.map((stage, idx) => {
              const active = idx === activeStage;
              return (
                <button
                  key={stage.num}
                  type="button"
                  onClick={() => setActiveStage(idx)}
                  className={`w-full text-left border-l-2 pl-5 py-3 transition-all ${
                    active
                      ? 'border-[#0B1120] opacity-100'
                      : 'border-[#DDDAD0] opacity-55 hover:opacity-85'
                  }`}
                >
                  <span className="font-display text-xs font-bold tracking-[0.2em] text-[#E05A47]">
                    {stage.num}
                  </span>
                  <h3 className="mt-2 font-display text-2xl font-bold text-[#0B1120]">
                    {stage.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#141D30]/80">
                    {stage.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Sticky Central Mock Interface */}
          <div className="lg:col-span-7 lg:sticky lg:top-28">
            <div className="border border-[#1E293B] bg-[#0B1120] p-6 sm:p-8 text-[#F7F6F2]">
              {/* Top Window Bar */}
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#E05A47]" />
                  <span className="h-2 w-2 rounded-full bg-[#14B8A6]" />
                  <span className="h-2 w-2 rounded-full bg-[#334155]" />
                </div>
                <span className="font-mono text-[11px] uppercase tracking-widest text-[#14B8A6]">
                  Stage {current.num} / 04
                </span>
              </div>

              {/* Animated Mock Stage Body */}
              <div className="mt-6 min-h-[260px] flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.num}
                    initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 14, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.32, ease: EASE_PREMIUM }}
                    className="space-y-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[11px] uppercase tracking-[0.16em] text-[#14B8A6]">
                          {current.previewTag}
                        </span>
                        <h4 className="mt-1 font-display text-2xl font-bold text-white">
                          {current.previewTitle}
                        </h4>
                      </div>
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#334155] bg-[#141D30] text-[#14B8A6]">
                        <ActiveIcon className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      {current.lines.map((line, i) => (
                        <motion.div
                          key={line}
                          initial={prefersReduced ? false : { opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.28, delay: i * 0.08 }}
                          className="flex items-center justify-between border border-[#23304C] bg-[#141D30] px-4 py-3.5 text-sm"
                        >
                          <span className="text-[#F7F6F2]">{line}</span>
                          <span className="h-2 w-2 rounded-full bg-[#14B8A6]" />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Stage Progress Indicators */}
                <div className="mt-8 grid grid-cols-4 gap-2 pt-4 border-t border-[#1E293B]">
                  {STAGES.map((st, idx) => (
                    <button
                      key={st.num}
                      type="button"
                      onClick={() => setActiveStage(idx)}
                      aria-label={`Preview stage ${st.num}`}
                      className="text-left group"
                    >
                      <div className="h-1 w-full bg-[#1E293B] overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            idx <= activeStage ? 'w-full bg-[#14B8A6]' : 'w-0 bg-[#14B8A6]'
                          }`}
                        />
                      </div>
                      <span className="mt-1.5 block font-mono text-[10px] text-[#DDDAD0]/65 group-hover:text-white">
                        {st.num}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
