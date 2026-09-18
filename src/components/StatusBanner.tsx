import React from 'react';

interface StatusBannerProps {
  status: 'idle' | 'waiting' | 'paid' | 'failed' | 'timeout';
  message?: string;
  phone?: string;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({ status, message, phone }) => {
  if (status === 'idle') return null;

  if (status === 'waiting') {
    return (
      <div style={{
        padding: '1rem',
        background: 'var(--blue-tint)',
        border: '1px solid rgba(36, 80, 200, 0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          {/* Spinner via CSS animation */}
          <span style={{
            display: 'inline-block',
            width: '1rem',
            height: '1rem',
            borderRadius: '50%',
            border: '2px solid var(--blue)',
            borderTopColor: 'transparent',
            animation: 'spin 0.75s linear infinite',
            flexShrink: 0,
          }} />
          <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--blue)' }}>
            Prompt sent to {phone || 'your phone'}
          </p>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', paddingLeft: '1.75rem' }}>
          Please check your phone screen and enter your M-Pesa PIN to complete the transaction.
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (status === 'paid') {
    return (
      <div style={{
        padding: '1rem',
        background: 'var(--teal-tint)',
        border: '1px solid rgba(21, 127, 114, 0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
          <span style={{
            width: '1rem',
            height: '1rem',
            borderRadius: '50%',
            background: 'var(--teal)',
            color: '#fff',
            fontSize: '0.625rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            ✓
          </span>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--teal)' }}>Payment Confirmed</p>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', paddingLeft: '1.5rem' }}>
          Your file is unlocked and ready to download below.
        </p>
      </div>
    );
  }

  if (status === 'failed' || status === 'timeout') {
    return (
      <div style={{
        padding: '1rem',
        background: '#fef2f2',
        border: '1px solid #fecaca',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
          <span style={{
            width: '1rem',
            height: '1rem',
            borderRadius: '50%',
            background: '#dc2626',
            color: '#fff',
            fontSize: '0.625rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            !
          </span>
          <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#b91c1c' }}>
            {status === 'timeout' ? 'Transaction Timed Out' : 'Transaction Not Completed'}
          </p>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#dc2626', paddingLeft: '1.5rem' }}>
          {message || 'The request was not completed. Please verify your phone and try again.'}
        </p>
      </div>
    );
  }

  return null;
};
