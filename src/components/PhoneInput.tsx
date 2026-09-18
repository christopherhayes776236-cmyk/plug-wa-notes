'use client';

import React from 'react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  error,
  disabled = false,
}) => {
  return (
    <div style={{ width: '100%' }}>
      <label style={{
        display: 'block',
        fontSize: '0.6875rem',
        fontWeight: 500,
        color: 'var(--ink-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        marginBottom: '0.5rem',
      }}>
        M-Pesa Phone Number
      </label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <span style={{
          position: 'absolute',
          left: '0.875rem',
          fontSize: '0.9375rem',
          fontWeight: 500,
          color: 'var(--ink-muted)',
          userSelect: 'none',
          pointerEvents: 'none',
        }}>
          +254
        </span>
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={10}
          value={value.replace(/^254/, '').replace(/^0/, '')}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, '');
            onChange(raw ? `0${raw}` : '');
          }}
          disabled={disabled}
          placeholder="712345678"
          className="phone-input"
          style={{
            paddingLeft: '4rem',
            borderColor: error ? '#dc2626' : undefined,
            backgroundColor: disabled ? 'var(--paper)' : 'var(--white)',
          }}
        />
      </div>
      <p style={{
        fontSize: '0.75rem',
        color: error ? '#dc2626' : 'var(--ink-muted)',
        marginTop: '0.375rem',
        fontWeight: error ? 500 : 400,
      }}>
        {error || 'You will receive an STK prompt on this number.'}
      </p>
    </div>
  );
};
