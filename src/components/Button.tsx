import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary:  { background: 'var(--blue)',  color: '#fff' },
  secondary:{ background: 'var(--teal)',  color: '#fff' },
  outline:  { background: 'transparent', color: 'var(--ink)',     border: '1px solid var(--line)' },
  ghost:    { background: 'transparent', color: 'var(--ink-muted)' },
};

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { padding: '0.5rem 0.75rem', fontSize: '0.75rem' },
  md: { padding: '0.75rem 1rem',   fontSize: '0.875rem', minHeight: '44px' },
  lg: { padding: '0.875rem 1.5rem',fontSize: '1rem',     minHeight: '48px' },
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = true,
  isLoading = false,
  disabled,
  style,
  ...props
}) => {
  return (
    <button
      disabled={disabled || isLoading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        fontFamily: 'var(--font-display)',
        fontWeight: 500,
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled || isLoading ? 0.6 : 1,
        border: 'none',
        width: fullWidth ? '100%' : undefined,
        transition: 'background 150ms, opacity 150ms',
        userSelect: 'none',
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      {...props}
    >
      {isLoading ? (
        <>
          <span style={{
            display: 'inline-block',
            width: '1rem',
            height: '1rem',
            borderRadius: '50%',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            animation: 'spin 0.75s linear infinite',
          }} />
          <span>Processing...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
      ) : (
        children
      )}
    </button>
  );
};
