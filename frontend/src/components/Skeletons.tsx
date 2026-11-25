import React from 'react';

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, idx) => (
      <div
        key={idx}
        className="border border-[#DDDAD0] bg-white p-6 animate-pulse"
      >
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 bg-[#ECEAE2]" />
          <div className="h-4 w-20 bg-[#ECEAE2]" />
        </div>
        <div className="mt-5 h-6 w-3/4 bg-[#ECEAE2]" />
        <div className="mt-3 h-4 w-full bg-[#F7F6F2]" />
        <div className="mt-2 h-4 w-5/6 bg-[#F7F6F2]" />
        <div className="mt-6 h-1.5 w-full bg-[#ECEAE2]" />
      </div>
    ))}
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="border border-[#DDDAD0] bg-white divide-y divide-[#DDDAD0] animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center justify-between px-5 py-4 gap-4">
        <div className="h-4 w-1/3 bg-[#ECEAE2]" />
        <div className="h-4 w-1/5 bg-[#F7F6F2]" />
        <div className="h-4 w-20 bg-[#ECEAE2]" />
      </div>
    ))}
  </div>
);
