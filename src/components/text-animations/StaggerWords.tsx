'use client';

import { motion } from 'framer-motion';

interface StaggerWordsProps {
  text: string;
  color?: string;
}

export function StaggerWords({ text, color = '#1E40AF' }: StaggerWordsProps) {
  const words = text.split(' ');
  return (
    <span style={{ display: 'inline-flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.35em' }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 22 }}
          style={{ color }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}
