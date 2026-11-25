import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { EASE_PREMIUM } from '../../animations/motion';

export const TheIdeaSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const legacyX = useTransform(scrollYProgress, [0.15, 0.55], [0, prefersReduced ? 0 : -28]);
  const legacyOpacity = useTransform(scrollYProgress, [0.2, 0.55], [1, 0.55]);
  const digitalScale = useTransform(scrollYProgress, [0.15, 0.5], [0.94, 1]);
  const digitalX = useTransform(scrollYProgress, [0.15, 0.5], [prefersReduced ? 0 : 28, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative border-b border-[#DDDAD0] bg-[#F7F6F2] py-24 sm:py-32 text-[#0B1120]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          {/* Editorial Progressive Text */}
          <div className="lg:col-span-6">
            <motion.span
              initial={prefersReduced ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.45, ease: EASE_PREMIUM }}
              className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E05A47]"
            >
              01 · The Idea
            </motion.span>

            <h2 className="mt-4 font-display text-4xl font-bold leading-[1.06] tracking-tight text-[#0B1120] sm:text-5xl lg:text-6xl">
              <motion.span
                className="block"
                initial={prefersReduced ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.55, delay: 0.06, ease: EASE_PREMIUM }}
              >
                Voting shouldn&apos;t
              </motion.span>
              <motion.span
                className="block text-[#0D9488]"
                initial={prefersReduced ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.55, delay: 0.18, ease: EASE_PREMIUM }}
              >
                feel complicated.
              </motion.span>
            </h2>

            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: 0.28, ease: EASE_PREMIUM }}
              className="mt-8 space-y-4 max-w-lg text-base leading-relaxed text-[#141D30]/80"
            >
              <p>
                Traditional election workflows scatter schedules, candidate platforms, and turnout reports across disconnected PDFs and portals.
              </p>
              <p className="text-sm text-[#141D30]/70">
                SecureVote unifies discovery, candidate comparison, simulated ballot review, and public audit summaries inside one calm interface.
              </p>
            </motion.div>
          </div>

          {/* Traditional -> Digital Visual Transformation */}
          <div className="lg:col-span-6">
            <div className="relative grid gap-5 sm:grid-cols-2 items-center">
              {/* Legacy / Paper Metaphor */}
              <motion.div
                style={{ x: legacyX, opacity: legacyOpacity }}
                className="border border-[#DDDAD0] bg-[#ECEAE2]/80 p-6"
              >
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[#141D30]/60">
                  <span>Fragmented Process</span>
                  <FileText className="h-4 w-4 text-[#0D9488]" />
                </div>
                <div className="mt-5 space-y-2.5">
                  <div className="h-2.5 w-4/5 bg-[#DDDAD0]" />
                  <div className="h-2.5 w-3/5 bg-[#DDDAD0]" />
                  <div className="h-2.5 w-2/3 bg-[#DDDAD0]" />
                </div>
                <p className="mt-5 text-xs text-[#141D30]/70">
                  Opaque timelines, static forms, limited accessibility.
                </p>
              </motion.div>

              {/* Digital Civic Experience */}
              <motion.div
                style={{ scale: digitalScale, x: digitalX }}
                className="border border-[#1E293B] bg-[#0B1120] p-6 text-[#F7F6F2] shadow-xl"
              >
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[#14B8A6]">
                  <span>SecureVote Model</span>
                  <ShieldCheck className="h-4 w-4 text-[#14B8A6]" />
                </div>
                <div className="mt-5 space-y-2.5">
                  <div className="flex items-center justify-between border border-[#23304C] bg-[#141D30] px-3 py-2 text-xs">
                    <span>Clear Slate</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#14B8A6]" />
                  </div>
                  <div className="flex items-center justify-between border border-[#23304C] bg-[#141D30] px-3 py-2 text-xs">
                    <span>Review &amp; Confirm</span>
                    <span className="h-2 w-2 rounded-full bg-[#14B8A6]" />
                  </div>
                  <div className="flex items-center justify-between border border-[#23304C] bg-[#141D30] px-3 py-2 text-xs">
                    <span>Unlinked Receipt</span>
                    <span className="font-mono text-[10px] text-[#E05A47]">DEMO</span>
                  </div>
                </div>
                <p className="mt-4 text-xs text-[#DDDAD0]/80">
                  Guided clarity, WCAG-conscious contrast, transparent telemetry.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
