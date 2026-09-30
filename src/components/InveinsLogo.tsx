'use client';

import React from 'react';
import Image from 'next/image';

interface InveinsLogoProps {
  theme?: 'dark' | 'light';
  className?: string;
  priority?: boolean;
}

export const InveinsLogo: React.FC<InveinsLogoProps> = ({
  theme = 'dark',
  className = 'h-8 sm:h-9 w-28 sm:w-32',
  priority = false,
}) => {
  const isLight = theme === 'light';
  const logoSrc = isLight
    ? '/images/logo/inveins-logo-light.png'
    : '/images/logo/inveins-logo-dark.png';

  return (
    <span className={`relative inline-flex items-center select-none ${className}`}>
      <Image
        src={logoSrc}
        alt="Inveins™"
        fill
        sizes="(max-width: 640px) 140px, 180px"
        className="object-contain object-left"
        priority={priority}
      />
    </span>
  );
};

