'use client';

import React, { useEffect, useState } from 'react';

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
  const [savedPhone, setSavedPhone] = useState<string>('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('pwn_saved_phone');
      if (stored) {
        setSavedPhone(stored);
      }
    } catch {}
  }, []);

  const displayVal = value.replace(/^254/, '').replace(/^0/, '');
  const savedDisplay = savedPhone.replace(/^254/, '').replace(/^0/, '');

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <label style={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: 'var(--ink-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
        }}>
          M-Pesa Phone Number
        </label>
        {savedPhone && displayVal !== savedDisplay && (
          <button
            type="button"
            onClick={() => onChange(savedPhone)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: '0.72rem',
              color: 'var(--blue, #1E40AF)',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Auto-fill {savedPhone}
          </button>
        )}
      </div>
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
          name="phone"
          autoComplete="tel"
          list="pwn-saved-phones"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={10}
          value={displayVal}
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
        {savedDisplay && (
          <datalist id="pwn-saved-phones">
            <option value={savedDisplay}>Recent: 0{savedDisplay}</option>
          </datalist>
        )}
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
