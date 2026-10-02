'use client';

import { motion } from 'framer-motion';

interface ConvergeLettersProps {
  text: string;
  color?: string;
}

export function ConvergeLetters({ text, color = '#0D9488' }: ConvergeLettersProps) {
  const words = text.split(' ');
  let globalCharIndex = 0;

  return (
    <span style={{ display: 'inline-flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.35em' }}>
      {words.map((word, wIdx) => {
        const letters = word.split('');
        return (
          <span key={wIdx} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
            {letters.map((ch, lIdx) => {
              const charIdx = globalCharIndex++;
              return (
                <motion.span
                  key={lIdx}
                  initial={{ opacity: 0, x: charIdx % 2 === 0 ? -14 : 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: charIdx * 0.018, duration: 0.28, ease: 'easeOut' }}
                  style={{ display: 'inline-block', color }}
                >
                  {ch}
                </motion.span>
              );
            })}
          </span>
        );
      })}
    </span>
  );
}
