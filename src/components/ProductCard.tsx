'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Product } from '@/lib/types';
import { PriceTag } from './PriceTag';
import { PhoneInput } from './PhoneInput';
import { StatusBanner } from './StatusBanner';
import { DownloadButton } from './DownloadButton';

interface ProductCardProps {
  product: Product;
  unitCode: string;
}

type CardState = 'idle' | 'entering_phone' | 'waiting' | 'paid' | 'failed' | 'timeout';

export const ProductCard: React.FC<ProductCardProps> = ({ product, unitCode }) => {
  const [state, setState] = useState<CardState>('idle');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [orderId, setOrderId] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollTimerRef = useRef<number>(0);

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    pollTimerRef.current = 0;
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

  const validatePhone = (val: string): boolean => {
    const clean = val.trim();
    if (!clean) { setPhoneError('Please enter your phone number'); return false; }
    const regex = /^(?:254|\+254|0)?([17][0-9]{8})$/;
    if (!regex.test(clean)) {
      setPhoneError('Please enter a valid Kenyan Safaricom number (e.g. 0712345678)');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(phone)) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          unitCode,
          productId: product.id,
          productType: product.type,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initiate M-Pesa STK push');

      setOrderId(data.orderId);
      setState('waiting');
      startPolling(data.orderId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not connect to payment gateway. Please try again.';
      setErrorMessage(message);
      setState('failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startPolling = (currentOrderId: string) => {
    stopPolling();
    pollTimerRef.current = 0;

    pollIntervalRef.current = setInterval(async () => {
      pollTimerRef.current += 2.5;

      if (pollTimerRef.current >= 60) {
        stopPolling();
        setState('timeout');
        setErrorMessage('Verification timed out. If money was deducted, save your M-Pesa code.');
        return;
      }

      try {
        const res = await fetch(`/api/status/${currentOrderId}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === 'paid') {
          stopPolling();
          setDownloadUrl(data.fileUrl || product.fileUrl || '#');
          setState('paid');
        } else if (data.status === 'failed' || data.status === 'cancelled') {
          stopPolling();
          setState('failed');
          setErrorMessage(data.message || 'Payment was cancelled or could not be verified.');
        }
      } catch {
        // Continue polling silently
      }
    }, 2500);
  };

  const isBlue = product.type === 'notes' || product.type === 'videoSlides';

  return (
    <div className="product-card">
      <div className="product-card-thumb">
        <img
          src={product.thumbnailSrc}
          alt={`${product.name} cover`}
          width={640}
          height={360}
          loading="lazy"
        />
      </div>

      <div className="product-card-body">
        <div className="product-card-top">
          <div>
            <p className="product-card-title">{product.name}</p>
            <p className="product-card-desc">{product.description}</p>
          </div>
          <PriceTag amount={product.price} variant={isBlue ? 'blue' : 'teal'} />
        </div>

        <div className="product-card-action">
          {state === 'idle' && (
            <button
              className={`btn-buy${isBlue ? '' : ' btn-buy-teal'}`}
              onClick={() => setState('entering_phone')}
            >
              Buy — KSH {product.price}
            </button>
          )}

          {state === 'entering_phone' && (
            <form onSubmit={handleInitiatePayment} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <PhoneInput
                value={phone}
                onChange={(val) => { setPhone(val); if (phoneError) setPhoneError(''); }}
                error={phoneError}
                disabled={isSubmitting}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => { setState('idle'); setPhoneError(''); setErrorMessage(''); }}
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: '0.625rem',
                    background: 'transparent',
                    border: '1px solid var(--line)',
                    color: 'var(--ink-muted)',
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`btn-buy${isBlue ? '' : ' btn-buy-teal'}`}
                  style={{ flex: 2 }}
                >
                  {isSubmitting ? 'Sending STK...' : `Pay KSH ${product.price}`}
                </button>
              </div>
            </form>
          )}

          {state === 'waiting' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <StatusBanner status="waiting" phone={phone} />
              <button
                onClick={() => { stopPolling(); setState('idle'); }}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--line)',
                  color: 'var(--ink-muted)',
                  fontSize: '0.75rem',
                  padding: '0.5rem',
                  cursor: 'pointer',
                }}
              >
                Cancel Payment Waiting
              </button>
            </div>
          )}

          {state === 'paid' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <StatusBanner status="paid" />
              <DownloadButton
                fileUrl={downloadUrl}
                fileName={`${unitCode.toLowerCase().replace(/\s+/g, '-')}-${product.type}`}
                productName={product.name}
              />
            </div>
          )}

          {(state === 'failed' || state === 'timeout') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <StatusBanner status={state} message={errorMessage} />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setState('idle')}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    background: 'transparent',
                    border: '1px solid var(--line)',
                    color: 'var(--ink-muted)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
                <button
                  onClick={() => { stopPolling(); setState('entering_phone'); setErrorMessage(''); }}
                  className="btn-buy"
                  style={{ flex: 2, padding: '0.5rem' }}
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
