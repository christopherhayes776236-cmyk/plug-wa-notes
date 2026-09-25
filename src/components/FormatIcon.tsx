'use client';

import { motion } from 'framer-motion';

type FormatIconType = 'notes' | 'video' | 'audio' | 'slides';

const PATHS: Record<FormatIconType, string> = {
  notes:  'M6 4h12v16H6z M9 9h6 M9 12h6 M9 15h4',
  video:  'M4 6h16v12H4z M10 9l6 3-6 3z',
  audio:  'M4 12h2l2-6 3 12 3-8 2 2h4',
  slides: 'M3 5h18v11H3z M8 20h8',
};

interface FormatIconProps {
  type: FormatIconType;
  color?: string;
  size?: number;
}

export function FormatIcon({ type, color = '#2450C8', size = 48 }: FormatIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <motion.path
        d={PATHS[type]}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
      />
    </svg>
  );
}
