import React from 'react';

interface PriceTagProps {
  amount: number;
  variant?: 'blue' | 'teal' | 'neutral';
}

export const PriceTag: React.FC<PriceTagProps> = ({ amount, variant = 'blue' }) => {
  const styles: Record<string, React.CSSProperties> = {
    blue: { color: 'var(--blue)', background: 'var(--blue-tint)', border: '1px solid rgba(36, 80, 200, 0.2)' },
    teal: { color: 'var(--teal)', background: 'var(--teal-tint)', border: '1px solid rgba(21, 127, 114, 0.2)' },
    neutral: { color: 'var(--ink)', background: 'var(--paper)', border: '1px solid var(--line)' },
  };

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      fontSize: '0.875rem',
      padding: '0.25rem 0.625rem',
      whiteSpace: 'nowrap',
      ...styles[variant],
    }}>
      KSH {amount}
    </span>
  );
};
