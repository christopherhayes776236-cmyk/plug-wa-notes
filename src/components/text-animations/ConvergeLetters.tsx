'use client';

import { motion } from 'framer-motion';

interface ConvergeLettersProps {
  text: string;
  color?: string;
}

export function ConvergeLetters({ text, color = '#0D9488' }: ConvergeLettersProps) {
  const letters = text.split('');
  return (
    <span style={{ display: 'inline-block' }}>
      {letters.map((ch, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, x: i % 2 === 0 ? -16 : 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.02, duration: 0.3, ease: 'easeOut' }}
          style={{ display: 'inline-block', color }}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </motion.span>
      ))}
    </span>
  );
}
