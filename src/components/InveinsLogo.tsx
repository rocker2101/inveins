'use client';

import React from 'react';

interface InveinsLogoProps {
  theme?: 'dark' | 'light';
  className?: string;
}

export const InveinsLogo: React.FC<InveinsLogoProps> = ({
  theme = 'dark',
  className = 'h-8 sm:h-9 w-auto',
}) => {
  const isLight = theme === 'light';
  const textColor = isLight ? '#faf9f5' : '#141413';

  return (
    <span
      className={`inline-flex items-center select-none font-bold tracking-tight ${className}`}
      style={{
        fontFamily: "'Caveat', cursive, system-ui, -apple-system, sans-serif",
        color: textColor,
        lineHeight: 1,
      }}
    >
      <span className="text-3xl sm:text-4xl font-bold tracking-tight">
        Inveins
      </span>
      <span
        className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest -mt-4 ml-0.5"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        TM
      </span>
    </span>
  );
};
