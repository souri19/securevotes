import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronDown, IdCard, ShieldCheck } from 'lucide-react';
import { EASE_PREMIUM } from '../../animations/motion';

interface CinematicHeroProps {
  totalBallots: number;
  activeElections: number;
}

const NETWORK_NODES = [
  { x: 140, y: 150, r: 3.5 },
  { x: 310, y: 105, r: 2.5 },
  { x: 480, y: 175, r: 4.5 },
  { x: 670, y: 120, r: 3 },
  { x: 840, y: 190, r: 3.5 },
  { x: 220, y: 310, r: 3 },
  { x: 410, y: 345, r: 4.5 },
  { x: 590, y: 295, r: 3 },
  { x: 760, y: 360, r: 4 },
  { x: 170, y: 470, r: 2.5 },
  { x: 360, y: 500, r: 3.5 },
  { x: 540, y: 455, r: 3 },
  { x: 720, y: 510, r: 3.5 },
  { x: 890, y: 430, r: 2.5 },
];

const NETWORK_EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [1, 6], [2, 6], [2, 7], [3, 7], [4, 8],
  [5, 6], [6, 7], [7, 8],
  [5, 9], [6, 10], [6, 11], [7, 11], [8, 12], [8, 13],
  [9, 10], [10, 11], [11, 12], [12, 13],
];

export const CinematicHero: React.FC<CinematicHeroProps> = ({
  totalBallots,
  activeElections,
}) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const prefersReduced = useReducedMotion();
  const [pointer, setPointer] = useState({ x: 65, y: 38 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const textOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.65], [0, prefersReduced ? 0 : -64]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, prefersReduced ? 1 : 1.18]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.85], [0.9, 0.15]);
  const indicatorOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (prefersReduced || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setPointer({ x, y });
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[calc(100vh-5.5rem)] flex flex-col justify-between overflow-hidden bg-[#0B1120] text-[#F7F6F2]"
    >
      {/* Interactive Radial Spotlight & Civic Teal/Amber Election Network */}
      <motion.div
        style={{ scale: bgScale, opacity: bgOpacity }}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{
            background: `radial-gradient(circle at ${pointer.x}% ${pointer.y}%, rgba(20, 184, 166, 0.16) 0%, rgba(229, 169, 60, 0.06) 28%, rgba(11, 17, 32, 0) 60%)`,
          }}
        />
        <svg
          viewBox="0 0 1000 620"
          className="h-full w-full object-cover opacity-65"
          preserveAspectRatio="xMidYMid slice"
        >
          {NETWORK_EDGES.map(([a, b], idx) => {
            const p1 = NETWORK_NODES[a];
            const p2 = NETWORK_NODES[b];
            return (
              <motion.line
                key={idx}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={idx % 3 === 0 ? '#E5A93C' : '#14B8A6'}
                strokeWidth="0.9"
                strokeOpacity="0.34"
                initial={prefersReduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.9, delay: idx * 0.03, ease: EASE_PREMIUM }}
              />
            );
          })}
          {NETWORK_NODES.map((node, idx) => (
            <g key={idx}>
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={node.r}
                fill={idx % 4 === 0 ? '#E5A93C' : idx % 5 === 2 ? '#E05A47' : '#14B8A6'}
                initial={prefersReduced ? false : { scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.95 }}
                transition={{ duration: 0.6, delay: 0.2 + idx * 0.03 }}
              />
              {idx % 3 === 0 && (
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={node.r + 8}
                  fill="none"
                  stroke="#14B8A6"
                  strokeOpacity="0.28"
                  strokeWidth="0.9"
                  style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                  animate={
                    prefersReduced
                      ? undefined
                      : { scale: [0.9, 1.45, 0.9], strokeOpacity: [0.35, 0.08, 0.35] }
                  }
                  transition={{ duration: 3.4, delay: idx * 0.2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
            </g>
          ))}
        </svg>
      </motion.div>

      {/* Main Hero Editorial Composition */}
      <motion.div
        style={{ opacity: textOpacity, y: textY }}
        className="relative z-10 mx-auto w-full max-w-7xl flex-1 flex flex-col justify-center px-4 py-14 sm:px-6 lg:px-8"
      >
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE_PREMIUM }}
              className="inline-flex items-center gap-2.5 border border-[#23304C] bg-[#141D30]/90 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-[#14B8A6]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#E5A93C]" />
              <span>SecureVote · Civic Technology Prototype</span>
            </motion.div>

            <h1 className="mt-8 font-display text-5xl font-bold leading-[1.02] tracking-tight text-[#F7F6F2] sm:text-7xl lg:text-[5.5rem]">
              <span className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={prefersReduced ? false : { y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.08, ease: EASE_PREMIUM }}
                >
                  Every voice
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span
                  className="block bg-gradient-to-r from-[#14B8A6] via-[#5EEAD4] to-[#E5A93C] bg-clip-text text-transparent"
                  initial={prefersReduced ? false : { y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.75, delay: 0.22, ease: EASE_PREMIUM }}
                >
                  deserves a future.
                </motion.span>
              </span>
            </h1>

            <motion.p
              initial={prefersReduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.36, ease: EASE_PREMIUM }}
              className="mt-7 max-w-xl text-base leading-relaxed text-[#CBD5E1] sm:text-lg"
            >
              An intelligent election management platform designed to simplify participation, enforce one-vote-per-voter integrity, and make election experiences accessible.
            </motion.p>

            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.46, ease: EASE_PREMIUM }}
              className="mt-9 flex flex-wrap items-center gap-3.5"
            >
              <Link
                to="/elections"
                className="min-h-[48px] inline-flex items-center gap-2.5 bg-[#14B8A6] px-6 py-3 text-sm font-semibold text-[#0B1120] hover:bg-[#2DD4BF] transition-colors rounded-[4px]"
              >
                <span>Explore Elections</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="min-h-[48px] inline-flex items-center gap-2 border border-[#23304C] bg-[#141D30]/80 px-6 py-3 text-sm font-medium text-[#F7F6F2] hover:border-[#E5A93C] transition-colors rounded-[4px]"
              >
                <IdCard className="h-4 w-4 text-[#E5A93C]" />
                <span>Voter ID Sign In</span>
              </Link>
            </motion.div>
          </div>

          {/* Floating Protocol Telemetry Token */}
          <div className="lg:col-span-4 flex justify-start lg:justify-end">
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, scale: 0.94 }}
              animate={
                prefersReduced
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 1, scale: 1, y: [0, -10, 0] }
              }
              transition={
                prefersReduced
                  ? { duration: 0.5 }
                  : {
                      opacity: { duration: 0.7, delay: 0.35 },
                      scale: { duration: 0.7, delay: 0.35 },
                      y: { duration: 5.5, repeat: Infinity, ease: 'easeInOut' },
                    }
              }
              className="w-full max-w-xs border border-[#23304C] bg-[#141D30]/90 backdrop-blur-md p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#23304C] pb-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#14B8A6]">
                  Live Demo Telemetry
                </span>
                <span className="h-2 w-2 rounded-full bg-[#14B8A6]" />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#94A3B8]">
                    Demo Ballots
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold tabular-nums text-white">
                    {totalBallots.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#94A3B8]">
                    Active Cycles
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold tabular-nums text-[#E5A93C]">
                    {activeElections}
                  </p>
                </div>
              </div>
              <div className="mt-5 border-t border-[#23304C] pt-3 flex items-center justify-between text-[11px] text-[#CBD5E1]">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#14B8A6]" />
                  1 Vote / Voter ID
                </span>
                <span className="font-mono text-[#E5A93C]">RBAC</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div
        style={{ opacity: indicatorOpacity }}
        className="relative z-10 pb-8 flex flex-col items-center gap-2 text-[#94A3B8]"
      >
        <span className="text-[10px] uppercase tracking-[0.24em]">Scroll</span>
        <motion.div
          animate={prefersReduced ? undefined : { y: [0, 5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="h-4 w-4 text-[#14B8A6]" />
        </motion.div>
      </motion.div>

      <div
        aria-hidden="true"
        className="pointer-events-none h-14 w-full bg-gradient-to-b from-transparent to-[#F7F6F2]/10"
      />
    </section>
  );
};
