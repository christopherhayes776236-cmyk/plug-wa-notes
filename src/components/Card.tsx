import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'blueTint' | 'tealTint' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'border border-[#DEDAD0] transition-colors';

  const variantStyles = {
    default: 'bg-[#FFFFFF] text-[#23211E]',
    blueTint: 'bg-[#EAF2FF] text-[#23211E] border-[#2450C8]/20',
    tealTint: 'bg-[#E7F3F1] text-[#23211E] border-[#157F72]/20',
    outline: 'bg-transparent text-[#23211E]',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-6',
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
