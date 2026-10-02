import React from 'react';

interface PriceTagProps {
  amount: number;
  variant?: 'blue' | 'teal' | 'neutral';
  freeMode?: boolean;
}

export const PriceTag: React.FC<PriceTagProps> = ({ amount, variant = 'blue', freeMode = false }) => {
  const styles: Record<string, React.CSSProperties> = {
    blue: { color: 'var(--blue)', background: 'var(--blue-tint)', border: '1px solid rgba(36, 80, 200, 0.2)' },
    teal: { color: 'var(--teal)', background: 'var(--teal-tint)', border: '1px solid rgba(21, 127, 114, 0.2)' },
    neutral: { color: 'var(--ink)', background: 'var(--paper)', border: '1px solid var(--line)' },
  };

  if (freeMode) {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: '0.85rem',
        padding: '0.2rem 0.6rem',
        whiteSpace: 'nowrap',
        background: 'rgba(34, 197, 94, 0.12)',
        border: '1px solid rgba(34, 197, 94, 0.35)',
        borderRadius: '4px',
        color: '#15803d',
      }}>
        <span style={{ textDecoration: 'line-through', opacity: 0.55, fontSize: '0.75rem', fontWeight: 500 }}>
          KSH {amount}
        </span>
        <span style={{ color: '#16a34a', fontWeight: 700, letterSpacing: '0.04em' }}>
          FREE
        </span>
      </span>
    );
  }

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

