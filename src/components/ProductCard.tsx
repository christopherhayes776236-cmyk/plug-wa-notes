'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Product } from '@/lib/types';
import { PriceTag } from './PriceTag';
import { PhoneInput } from './PhoneInput';
import { StatusBanner } from './StatusBanner';
import { DownloadButton } from './DownloadButton';
import { isFreeWeekend } from '@/lib/config';

interface ProductCardProps {
  product: Product;
  unitCode: string;
}

type CardState = 'idle' | 'entering_phone' | 'waiting' | 'paid' | 'failed' | 'timeout';

export const ProductCard: React.FC<ProductCardProps> = ({ product, unitCode }) => {
  const freeWeekend = isFreeWeekend();
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

  const getProductRealDownloadUrl = () => {
    if (product.fileUrl) return product.fileUrl;
    if (product.type === 'notes') {
      return `/notes/${product.id}.pdf`;
    }
    if (product.type === 'audio') {
      return '/media/audio-highlight.mp3';
    }
    if (product.type === 'video' || product.type === 'videoSlides') {
      return '/media/video-overview.mp4';
    }
    if (product.type === 'fullPack') {
      const cleanPrefix = product.id.replace('-full-pack', '');
      return `/notes/${cleanPrefix}-notes.pdf`;
    }
    return `/notes/${product.id}.pdf`;
  };

  const getProductFileName = () => {
    const cleanUnit = unitCode.toLowerCase().replace(/\s+/g, '-');
    if (product.type === 'audio') {
      return `${cleanUnit}-audio-overview.mp3`;
    }
    if (product.type === 'video') {
      return `${cleanUnit}-explainer-video.mp4`;
    }
    if (product.type === 'videoSlides') {
      return `${cleanUnit}-video-slides.mp4`;
    }
    if (product.type === 'fullPack') {
      return `${cleanUnit}-complete-study-pack.pdf`;
    }
    return `${product.id}.pdf`;
  };

  const renderDownloadButtons = () => {
    if (product.files && product.files.length > 0) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink)' }}>
            Pack files ({product.files.length} items):
          </div>
          {product.files.map((file, idx) => (
            <DownloadButton
              key={idx}
              fileUrl={file.fileUrl}
              fileName={file.fileName}
              productName={file.name}
            />
          ))}
        </div>
      );
    }
    return (
      <DownloadButton
        fileUrl={downloadUrl || getProductRealDownloadUrl()}
        fileName={getProductFileName()}
        productName={product.name}
      />
    );
  };

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
          <PriceTag amount={product.price} variant={isBlue ? 'blue' : 'teal'} freeMode={freeWeekend} />
        </div>

        <div className="product-card-action">
          {state === 'idle' && (
            freeWeekend ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#15803d',
                  background: 'rgba(34, 197, 94, 0.12)',
                  border: '1px solid rgba(34, 197, 94, 0.25)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  width: 'fit-content'
                }}>
                  <span>Free Weekend Pass</span>
                </div>
                {renderDownloadButtons()}
              </div>
            ) : (
              <div style={{ width: '100%' }}>
                <button
                  className={`btn-buy${isBlue ? '' : ' btn-buy-teal'}`}
                  onClick={() => setState('entering_phone')}
                >
                  Buy — KSH {product.price}
                </button>
              </div>
            )
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

              {freeWeekend && (
                <button
                  type="button"
                  onClick={() => {
                    setDownloadUrl(getProductRealDownloadUrl());
                    setState('paid');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    background: 'rgba(34, 197, 94, 0.12)',
                    border: '1px solid rgba(34, 197, 94, 0.35)',
                    color: '#15803d',
                    fontSize: '0.8rem',
                    padding: '0.55rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    width: '100%',
                  }}
                >
                  <span>Weekend Free Pass — Skip Payment & Download</span>
                </button>
              )}
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
              {renderDownloadButtons()}
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
