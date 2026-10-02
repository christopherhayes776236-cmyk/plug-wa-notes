'use client';

import React, { useState, useEffect } from 'react';
import { isFreeWeekend } from '@/lib/config';

function getTimeUntilMonday(): { days: number; hours: number; mins: number; secs: number } {
  const now = new Date();
  // Next Monday 00:00 EAT (UTC+3)
  const nextMonday = new Date(now);
  const day = nextMonday.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
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

export const UnitCountdownBanner: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState(getTimeUntilMonday());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCountdown(getTimeUntilMonday()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted || !isFreeWeekend()) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div
      style={{
        marginBottom: '1.5rem',
        padding: '0.875rem 1rem',
        background: '#F8FAFC',
        border: '1px solid #E2E8F0',
        borderRadius: '6px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#15803D',
          }}
        >
          Free Weekend Access
        </span>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontFamily: 'monospace',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: '#0F172A',
            background: '#FFFFFF',
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            border: '1px solid #E2E8F0',
          }}
        >
          <span>{pad(countdown.days)}d</span>
          <span style={{ color: '#94A3B8' }}>:</span>
          <span>{pad(countdown.hours)}h</span>
          <span style={{ color: '#94A3B8' }}>:</span>
          <span>{pad(countdown.mins)}m</span>
          <span style={{ color: '#94A3B8' }}>:</span>
          <span>{pad(countdown.secs)}s</span>
        </span>
      </div>

      <p
        style={{
          margin: 0,
          fontSize: '0.75rem',
          color: '#64748B',
          lineHeight: 1.4,
        }}
      >
        All lecture notes, audio overviews, videos, and slides are free to download until Monday 00:00.
      </p>
    </div>
  );
};
