'use client';

import React, { useState, useEffect } from 'react';

// ─── FREE WEEKEND BANNER ──────────────────────────────────────────────────────
// This component auto-hides when sessionStorage flag is set (dismissed).
// It is only rendered when NEXT_PUBLIC_FREE_WEEKEND=true.
// To remove it permanently: flip the env var — no code changes needed.

function getTimeUntilMonday(): { days: number; hours: number; mins: number; secs: number } {
  const now = new Date();
  // Next Monday 00:00 EAT (UTC+3)
  const nextMonday = new Date(now);
  const day = nextMonday.getDay(); // 0=Sun, 1=Mon, …, 6=Sat
  const daysUntilMonday = day === 0 ? 1 : day === 1 ? 7 : 8 - day;
  nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);

  const diff = Math.max(0, nextMonday.getTime() - now.getTime());
  const totalSecs = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSecs / 86400),
    hours: Math.floor((totalSecs % 86400) / 3600),
    mins: Math.floor((totalSecs % 3600) / 60),
    secs: totalSecs % 60,
  };
}

export const FreeWeekendBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid SSR flash
  const [countdown, setCountdown] = useState(getTimeUntilMonday());

  useEffect(() => {
    // Check sessionStorage — if already dismissed this session, stay hidden
    const isDismissed = sessionStorage.getItem('fwb-dismissed') === '1';
    if (!isDismissed) {
      setDismissed(false);
      document.documentElement.style.setProperty('--fwb-h', '40px');
    }
    return () => {
      document.documentElement.style.setProperty('--fwb-h', '0px');
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCountdown(getTimeUntilMonday()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('fwb-dismissed', '1');
    setDismissed(true);
    document.documentElement.style.setProperty('--fwb-h', '0px');
  };

  if (dismissed) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div
      id="free-weekend-banner"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9998,
        background: 'linear-gradient(90deg, #111827 0%, #1c2b4a 50%, #111827 100%)',
        borderBottom: '1px solid rgba(251, 191, 36, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.55rem 1rem',
        gap: '0.75rem',
        flexWrap: 'wrap',
      }}
    >
      {/* Left: label */}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          fontSize: '0.75rem',
          fontWeight: 800,
          color: '#FBBF24',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        🎉 FREE WEEKEND ACCESS
      </span>

      {/* Divider */}
      <span style={{ color: 'rgba(251, 191, 36, 0.3)', fontSize: '0.75rem' }}>·</span>

      {/* Countdown */}
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
        {[
          { val: countdown.days, label: 'd' },
          { val: countdown.hours, label: 'h' },
          { val: countdown.mins, label: 'm' },
          { val: countdown.secs, label: 's' },
        ].map(({ val, label }, i) => (
          <React.Fragment key={label}>
            {i > 0 && (
              <span style={{ color: 'rgba(251,191,36,0.5)', fontSize: '0.75rem' }}>:</span>
            )}
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: '#F9FAFB',
                background: 'rgba(255,255,255,0.08)',
                padding: '0.1rem 0.3rem',
                borderRadius: '3px',
                minWidth: '2ch',
                textAlign: 'center',
              }}
            >
              {pad(val)}
              <span style={{ fontSize: '0.6rem', color: '#9CA3AF', marginLeft: '1px' }}>{label}</span>
            </span>
          </React.Fragment>
        ))}
      </span>

      {/* Center: message */}
      <span
        style={{
          fontSize: '0.75rem',
          color: '#D1D5DB',
          whiteSpace: 'nowrap',
        }}
      >
        Notes · Audio · Video · Slides —{' '}
        <strong style={{ color: '#FBBF24' }}>FREE</strong> this weekend
      </span>

      {/* Dismiss × */}
      <button
        id="free-weekend-banner-dismiss"
        onClick={handleDismiss}
        aria-label="Dismiss free weekend banner"
        style={{
          position: 'absolute',
          right: '0.75rem',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          color: '#6B7280',
          fontSize: '1rem',
          cursor: 'pointer',
          lineHeight: 1,
          padding: '0.25rem',
        }}
      >
        ×
      </button>
    </div>
  );
};
