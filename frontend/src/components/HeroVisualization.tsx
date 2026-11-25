import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Lock, Activity, FileCheck2 } from 'lucide-react';
import type { Election } from '../types';

interface HeroVisualizationProps {
  activeElection?: Election;
  totalBallots: number;
}

export const HeroVisualization: React.FC<HeroVisualizationProps> = ({
  activeElection,
  totalBallots,
}) => {
  const [hoveredStep, setHoveredStep] = useState<number>(1);

  const stages = [
    {
      id: 0,
      label: '01 · Session Auth',
      detail: 'Eligibility verified via RBAC session',
      icon: Lock,
    },
    {
      id: 1,
      label: '02 · Unlinked Ballot',
      detail: 'Choice recorded without voter ID',
      icon: FileCheck2,
    },
    {
      id: 2,
      label: '03 · Audit Ledger',
      detail: 'Non-sensitive event published',
      icon: Activity,
    },
  ];

  return (
    <div className="relative border border-[#2E2E2E] bg-[#151515] p-6 sm:p-8 text-[#F5F1E8]">
      {/* Architectural corner markers */}
      <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#D96C53]" />
          <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#D9D0C1]">
            Live Demo Ledger Preview
          </span>
        </div>
        <span className="border border-[#C8A96A]/40 bg-[#C8A96A]/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-[#C8A96A]">
          Simulated
        </span>
      </div>

      {/* Interactive Civic Network & Ballot Pipeline SVG */}
      <div className="mt-6">
        <svg
          viewBox="0 0 440 160"
          className="w-full h-auto"
          role="img"
          aria-label="Simulated ballot separation and participation network diagram"
        >
          <defs>
            <linearGradient id="goldLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C8A96A" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#C8A96A" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#D96C53" stopOpacity="0.85" />
            </linearGradient>
          </defs>

          {/* Subtle horizontal guide lines */}
          <line x1="20" y1="80" x2="420" y2="80" stroke="#2A2A2A" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="20" y1="35" x2="420" y2="35" stroke="#222222" strokeWidth="1" />
          <line x1="20" y1="125" x2="420" y2="125" stroke="#222222" strokeWidth="1" />

          {/* Animated flow path */}
          <motion.path
            d="M 55 80 C 125 80, 145 45, 220 45 C 295 45, 315 80, 385 80"
            fill="none"
            stroke="url(#goldLine)"
            strokeWidth="2"
            strokeDasharray="360"
            initial={{ strokeDashoffset: 260, opacity: 0.4 }}
            animate={{ strokeDashoffset: 0, opacity: 1 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          />
          <motion.path
            d="M 55 80 C 125 80, 145 115, 220 115 C 295 115, 315 80, 385 80"
            fill="none"
            stroke="#3A3A3A"
            strokeWidth="1.5"
          />

          {/* Nodes */}
          {[
            { cx: 55, cy: 80, label: 'VOTER', active: hoveredStep === 0 },
            { cx: 220, cy: 45, label: 'DEMO BALLOT', active: hoveredStep === 1 },
            { cx: 220, cy: 115, label: 'LOCK ONLY', active: hoveredStep === 1 },
            { cx: 385, cy: 80, label: 'TALLY + AUDIT', active: hoveredStep === 2 },
          ].map((node, idx) => (
            <g key={idx}>
              <circle
                cx={node.cx}
                cy={node.cy}
                r={node.active ? 16 : 12}
                fill="#151515"
                stroke={node.active ? '#C8A96A' : '#4A4A4A'}
                strokeWidth={node.active ? 2 : 1.5}
              />
              <circle
                cx={node.cx}
                cy={node.cy}
                r={4}
                fill={idx === 3 ? '#D96C53' : '#C8A96A'}
              />
              <text
                x={node.cx}
                y={node.cy + (node.cy === 45 ? -22 : 28)}
                textAnchor="middle"
                fill="#D9D0C1"
                fontSize="9"
                fontFamily="Space Grotesk, sans-serif"
                letterSpacing="1.2"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Interactive Stage Selectors */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {stages.map((stage) => {
          const Icon = stage.icon;
          const active = hoveredStep === stage.id;
          return (
            <button
              key={stage.id}
              type="button"
              onMouseEnter={() => setHoveredStep(stage.id)}
              onFocus={() => setHoveredStep(stage.id)}
              onClick={() => setHoveredStep(stage.id)}
              className={`text-left border p-3 transition-colors rounded-[3px] ${
                active
                  ? 'border-[#C8A96A] bg-[#222222]'
                  : 'border-[#2A2A2A] bg-[#1A1A1A] hover:border-[#3E3E3E]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-display font-semibold text-[#F5F1E8]">
                  {stage.label}
                </span>
                <Icon className={`h-3.5 w-3.5 ${active ? 'text-[#C8A96A]' : 'text-[#8A795D]'}`} />
              </div>
              <p className="mt-1.5 text-[11px] leading-snug text-[#D9D0C1]/80">
                {stage.detail}
              </p>
            </button>
          );
        })}
      </div>

      {/* Live Simulated Election Telemetry */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[#2A2A2A] pt-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[#D9D0C1]/70">
            Featured Active Simulation
          </p>
          <p className="mt-0.5 font-display text-sm font-medium text-white line-clamp-1">
            {activeElection ? activeElection.title : 'Metro Civic Innovation Council'}
          </p>
        </div>
        <div className="flex items-center gap-5">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#D9D0C1]/70">
              Demo Ballots
            </p>
            <p className="font-display text-lg font-semibold tabular-nums text-[#C8A96A]">
              {totalBallots.toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-1.5 border border-[#2E2E2E] bg-[#222222] px-2.5 py-1 text-[11px] text-[#F5F1E8]">
            <Check className="h-3.5 w-3.5 text-[#C8A96A]" />
            <span>Unlinked Storage</span>
          </div>
        </div>
      </div>
    </div>
  );
};
