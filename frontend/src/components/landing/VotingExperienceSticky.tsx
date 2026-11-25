import React, { useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useReducedMotion } from 'framer-motion';
import { Check, CheckCircle2, Lock, ShieldAlert } from 'lucide-react';
import { EASE_PREMIUM } from '../../animations/motion';

const VOTING_STEPS = [
  {
    step: 1,
    label: 'Step 01 · Election Context',
    caption: 'Election schedule, seat title, and demo eligibility load first.',
  },
  {
    step: 2,
    label: 'Step 02 · Candidate Choices',
    caption: 'Verified slate options appear in an accessible, bias-neutral list.',
  },
  {
    step: 3,
    label: 'Step 03 · Candidate Highlighted',
    caption: 'Selecting a candidate highlights the choice with clear visual focus.',
  },
  {
    step: 4,
    label: 'Step 04 · Calm Review Screen',
    caption: 'A dedicated review state confirms your intent before submission.',
  },
  {
    step: 5,
    label: 'Step 05 · Demo Confirmation',
    caption: 'An unlinkable simulated receipt confirms completion without storing voter ID.',
  },
];

export const VotingExperienceSticky: React.FC = () => {
  const containerRef = useRef<HTMLElement | null>(null);
  const prefersReduced = useReducedMotion();
  const [activeStep, setActiveStep] = useState(1);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const computed = Math.min(5, Math.max(1, Math.floor(latest * 5) + 1));
    setActiveStep(computed);
  });

  return (
    <section
      ref={containerRef}
      className="relative border-b border-[#DDDAD0] bg-white text-[#0B1120]"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
          {/* Left Column: Narrative Steps */}
          <div className="lg:col-span-5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#14B8A6]">
              04 · The Voting Experience
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-[#0B1120] sm:text-5xl">
              Calm, deliberate, and impossible to rush.
            </h2>
            <p className="mt-4 text-sm text-[#141D30]/75">
              Illustrative scroll preview of the five-stage demo booth. Scrolling never submits or records a ballot.
            </p>

            <div className="mt-10 space-y-4 lg:space-y-24 lg:py-8">
              {VOTING_STEPS.map((item) => {
                const active = activeStep === item.step;
                return (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => setActiveStep(item.step)}
                    className={`w-full text-left border-l-2 pl-4 py-2 transition-all ${
                      active
                        ? 'border-[#E05A47] opacity-100'
                        : 'border-[#DDDAD0] opacity-50 hover:opacity-80'
                    }`}
                  >
                    <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[#E05A47]">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#0B1120]">
                      {item.caption}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Sticky Simulated Voting Interface */}
          <div className="lg:col-span-7 lg:sticky lg:top-28">
            <div className="border border-[#DDDAD0] bg-[#F7F6F2] p-5 sm:p-8 shadow-sm">
              {/* Illustrative Notice */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DDDAD0] pb-4 text-[11px]">
                <span className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider text-[#0B1120]">
                  <ShieldAlert className="h-3.5 w-3.5 text-[#E05A47]" />
                  Illustrative Booth Preview (Simulated)
                </span>
                <span className="font-mono text-[#0D9488]">
                  State {activeStep} / 5
                </span>
              </div>

              <div className="mt-6 min-h-[310px] flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  {activeStep <= 3 && (
                    <motion.div
                      key="booth-select-view"
                      initial={prefersReduced ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
                      transition={{ duration: 0.28, ease: EASE_PREMIUM }}
                      className="space-y-4"
                    >
                      {/* Step 1: Election Details */}
                      <div className="border border-[#DDDAD0] bg-white p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#14B8A6]">
                            Civic Council · Simulated Election
                          </span>
                          <span className="text-[10px] uppercase tracking-wider text-[#141D30]/60">
                            4d remaining
                          </span>
                        </div>
                        <p className="mt-1 font-display text-lg font-bold text-[#0B1120]">
                          Metro Civic Innovation Council — 2026
                        </p>
                      </div>

                      {/* Step 2 & 3: Candidate Choices + Highlight */}
                      {activeStep >= 2 && (
                        <motion.div
                          initial={prefersReduced ? false : { opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-2.5"
                        >
                          {[
                            { name: 'Dr. Nadia Okafor', org: 'Civic Commons Coalition', selected: activeStep === 3 },
                            { name: 'Julian Mercer', org: 'Metropolitan Reform Alliance', selected: false },
                            { name: 'Sora Takahashi', org: 'Independent Civic Technologists', selected: false },
                          ].map((cand) => (
                            <div
                              key={cand.name}
                              className={`flex items-center justify-between border px-4 py-3 transition-all ${
                                cand.selected
                                  ? 'border-[#0B1120] bg-white ring-2 ring-[#14B8A6]'
                                  : 'border-[#DDDAD0] bg-white/80'
                              }`}
                            >
                              <div>
                                <p className="font-display text-sm font-bold text-[#0B1120]">
                                  {cand.name}
                                </p>
                                <p className="text-xs text-[#141D30]/70">{cand.org}</p>
                              </div>
                              <div
                                className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                  cand.selected
                                    ? 'border-[#0B1120] bg-[#0B1120] text-[#14B8A6]'
                                    : 'border-[#DDDAD0]'
                                }`}
                              >
                                {cand.selected && <Check className="h-3 w-3" />}
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {activeStep === 4 && (
                    <motion.div
                      key="booth-review-view"
                      initial={prefersReduced ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
                      transition={{ duration: 0.28, ease: EASE_PREMIUM }}
                      className="border border-[#0B1120] bg-white p-6 space-y-5"
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-[#E05A47]">
                        Review Selection Before Confirming
                      </span>
                      <div className="border border-[#DDDAD0] bg-[#F7F6F2]/60 p-4">
                        <p className="text-xs text-[#0D9488]">Metro Civic Innovation Council — 2026</p>
                        <p className="mt-1 font-display text-2xl font-bold text-[#0B1120]">
                          Dr. Nadia Okafor
                        </p>
                        <p className="text-xs text-[#141D30]/75">Civic Commons Coalition</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#141D30]/70">
                        <Lock className="h-3.5 w-3.5 text-[#14B8A6]" />
                        <span>Choice stored separately from voter identity.</span>
                      </div>
                    </motion.div>
                  )}

                  {activeStep === 5 && (
                    <motion.div
                      key="booth-receipt-view"
                      initial={prefersReduced ? false : { opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE_PREMIUM }}
                      className="border border-[#1E293B] bg-[#0B1120] p-6 sm:p-7 text-[#F7F6F2] space-y-5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#14B8A6] text-[#0B1120]">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-[#14B8A6]">
                            Illustrative Confirmation
                          </p>
                          <p className="font-display text-xl font-bold text-white">
                            Demo Ballot Recorded
                          </p>
                        </div>
                      </div>
                      <div className="border border-[#23304C] bg-[#141D30] p-4 flex items-center justify-between text-xs">
                        <span className="text-[#DDDAD0]/70">Simulated Receipt ID</span>
                        <span className="font-mono font-semibold text-[#14B8A6]">
                          SV-DEMO-PREVIEW
                        </span>
                      </div>
                      <p className="text-xs text-[#DDDAD0]/75">
                        Preview only — no vote was submitted during scroll.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Step Pips */}
                <div className="mt-6 flex items-center gap-2">
                  {VOTING_STEPS.map((s) => (
                    <button
                      key={s.step}
                      type="button"
                      onClick={() => setActiveStep(s.step)}
                      aria-label={`Show ${s.label}`}
                      className={`h-1.5 flex-1 transition-colors ${
                        s.step <= activeStep ? 'bg-[#0B1120]' : 'bg-[#DDDAD0]'
                      }`}
                    />
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
