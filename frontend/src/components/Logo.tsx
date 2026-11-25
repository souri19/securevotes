import React from 'react';

interface LogoProps {
  dark?: boolean;
  compact?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ dark = false, compact = false }) => {
  const strokeMain = dark ? '#F7F6F2' : '#0B1120';
  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <svg
        width="30"
        height="30"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          x="2"
          y="2"
          width="28"
          height="28"
          rx="4"
          stroke={strokeMain}
          strokeWidth="1.75"
        />
        <path
          d="M9 12.5H23"
          stroke="#14B8A6"
          strokeWidth="1.75"
          strokeLinecap="square"
        />
        <path
          d="M11.5 18.2L14.8 21.5L21 14.8"
          stroke="#E5A93C"
          strokeWidth="2"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
        <circle cx="24" cy="8" r="2" fill="#E05A47" />
      </svg>
      {!compact && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-display text-lg font-bold tracking-tight ${
              dark ? 'text-[#F7F6F2]' : 'text-[#0B1120]'
            }`}
          >
            SecureVote
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#0D9488] font-semibold mt-0.5">
            Civic Protocol
          </span>
        </div>
      )}
    </div>
  );
};
