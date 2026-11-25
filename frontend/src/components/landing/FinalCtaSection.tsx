import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { EASE_PREMIUM } from '../../animations/motion';

export const FinalCtaSection: React.FC = () => {
  const prefersReduced = useReducedMotion();
  const [spot, setSpot] = useState({ x: 50, y: 50 });

  const handleMove = (e: React.MouseEvent<HTMLElement>) => {
    if (prefersReduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    setSpot({
      x: Math.round(((e.clientX - r.left) / r.width) * 100),
      y: Math.round(((e.clientY - r.top) / r.height) * 100),
    });
  };

  return (
    <section
      onMouseMove={handleMove}
      className="relative min-h-[82vh] flex items-center overflow-hidden bg-[#0B1120] text-[#F7F6F2] bg-civic-grid-dark"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-all duration-300"
        style={{
          background: `radial-gradient(circle at ${spot.x}% ${spot.y}%, rgba(20, 184, 166, 0.16) 0%, rgba(229, 169, 60, 0.06) 30%, rgba(11, 17, 32, 0) 65%)`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <motion.span
          initial={prefersReduced ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.45, ease: EASE_PREMIUM }}
          className="inline-block border border-[#14B8A6]/40 bg-[#14B8A6]/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#14B8A6]"
        >
          SecureVote Prototype
        </motion.span>

        <motion.h2
          initial={prefersReduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, delay: 0.08, ease: EASE_PREMIUM }}
          className="mt-7 font-display text-5xl font-bold leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-7xl"
        >
          Democracy moves forward.
        </motion.h2>

        <motion.p
          initial={prefersReduced ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.18, ease: EASE_PREMIUM }}
          className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#CBD5E1] sm:text-lg"
        >
          Explore a better way to experience election management.
        </motion.p>

        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.28, ease: EASE_PREMIUM }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/elections"
            className="min-h-[48px] inline-flex items-center gap-2.5 bg-[#14B8A6] px-7 py-3.5 text-sm font-semibold text-[#0B1120] hover:bg-[#2DD4BF] transition-colors rounded-[4px]"
          >
            <span>Explore Elections</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/transparency"
            className="min-h-[48px] inline-flex items-center gap-2 border border-[#23304C] bg-[#141D30] px-7 py-3.5 text-sm font-medium text-[#F7F6F2] hover:border-[#E5A93C] transition-colors rounded-[4px]"
          >
            <span>View Platform</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
