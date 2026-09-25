'use client';

import { motion } from 'framer-motion';

interface WipeRevealProps {
  text: string;
  color?: string;
}

export function WipeReveal({ text, color = '#2450C8' }: WipeRevealProps) {
  return (
    <motion.span
      initial={{ clipPath: 'inset(0 100% 0 0)' }}
      animate={{ clipPath: 'inset(0 0% 0 0)' }}
      transition={{ duration: 0.7, ease: 'easeInOut' }}
      style={{ display: 'inline-block', color }}
    >
      {text}
    </motion.span>
  );
}
