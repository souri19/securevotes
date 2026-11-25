import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DemoBanner: React.FC = () => {
  return (
    <div className="border-b border-[#1E293B] bg-[#0B1120] text-[#CBD5E1]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-[#14B8A6]" />
          <span>
            <strong className="font-semibold text-[#F7F6F2]">Hackathon Prototype:</strong>{' '}
            Simulated election environment with Voter ID registration &amp; one-vote enforcement. Not for production elections without independent verification.
          </span>
        </div>
        <Link
          to="/transparency"
          className="text-[11px] font-semibold uppercase tracking-wider text-[#E5A93C] underline underline-offset-4 hover:text-white transition-colors"
        >
          Architecture &amp; Scope
        </Link>
      </div>
    </div>
  );
};
