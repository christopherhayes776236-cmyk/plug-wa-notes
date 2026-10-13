'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Product } from '@/lib/types';
import { PhoneInput } from './PhoneInput';
import { StatusBanner } from './StatusBanner';
import { isFreeWeekend } from '@/lib/config';

interface PaymentModalProps {
  product: Product;
  unitCode: string;
  onClose: () => void;
  onPaymentSuccess: (downloadUrl: string) => void;
}

type ModalState = 'entering_phone' | 'waiting' | 'failed' | 'timeout';

export const PaymentModal: React.FC<PaymentModalProps> = ({
  product,
  unitCode,
  onClose,
  onPaymentSuccess,
}) => {
  const freeWeekend = isFreeWeekend();
  const [state, setState] = useState<ModalState>('entering_phone');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollTimerRef = useRef<number>(0);

  // Mount + animate in
  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Clean up polling on unmount
  useEffect(() => {
    return () => stopPolling();
  }, []);

  // Trap scroll on body while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    pollTimerRef.current = 0;
  };

  const handleClose = () => {
    if (state === 'waiting') return; // block close mid-payment
    setVisible(false);
    setTimeout(onClose, 260); // wait for slide-out animation
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const validatePhone = (val: string): boolean => {
    const clean = val.trim();
    if (!clean) {
      setPhoneError('Please enter your phone number');
      return false;
    }
    const regex = /^(?:254|\+254|0)?([17][0-9]{8})$/;
    if (!regex.test(clean)) {
      setPhoneError('Please enter a valid Kenyan Safaricom number (e.g. 0712345678)');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const getProductRealDownloadUrl = () => {
    if (product.fileUrl) return product.fileUrl;
    if (product.type === 'notes') return `/notes/${product.id}.pdf`;
    if (product.type === 'audio') return '/media/audio-highlight.mp3';
    if (product.type === 'video' || product.type === 'videoSlides') return '/media/video-overview.mp4';
    if (product.type === 'fullPack') {
      const cleanPrefix = product.id.replace('-full-pack', '');
      return `/notes/${cleanPrefix}-notes.pdf`;
    }
    return `/notes/${product.id}.pdf`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

      setState('waiting');
      startPolling(data.orderId, data.fileUrl);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Could not connect to payment gateway. Please try again.';
      setErrorMessage(message);
      setState('failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startPolling = (currentOrderId: string, fileUrlFromInit?: string) => {
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
          const url = data.fileUrl || fileUrlFromInit || product.fileUrl || getProductRealDownloadUrl();
          // Animate modal out, then fire success callback
          setVisible(false);
          setTimeout(() => {
            onPaymentSuccess(url);
          }, 260);
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

  const handleFreeWeekendSkip = () => {
    setVisible(false);
    setTimeout(() => {
      onPaymentSuccess(getProductRealDownloadUrl());
    }, 260);
  };

  const isBlue = product.type === 'notes' || product.type === 'videoSlides';

  if (!mounted) return null;

  return createPortal(
    <div
      className={`payment-modal-backdrop ${visible ? 'payment-modal-backdrop--visible' : ''}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Pay for ${product.name}`}
    >
      <div className={`payment-modal ${visible ? 'payment-modal--visible' : ''}`}>

        {/* Header */}
        <div className="payment-modal-header">
          <div>
            <p className="payment-modal-product-name">{product.name}</p>
            <p className="payment-modal-price">KSH {product.price}</p>
          </div>
          {state !== 'waiting' && (
            <button
              className="payment-modal-close"
              onClick={handleClose}
              aria-label="Close payment"
              type="button"
            >
              &times;
            </button>
          )}
        </div>

        <div className="payment-modal-divider" />

        {/* Body */}
        <div className="payment-modal-body">

          {/* Phone entry form */}
          {state === 'entering_phone' && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <PhoneInput
                value={phone}
                onChange={(val) => { setPhone(val); if (phoneError) setPhoneError(''); }}
                error={phoneError}
                disabled={isSubmitting}
              />

              <p style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', lineHeight: 1.4 }}>
                An M-Pesa prompt will appear on your phone. Enter your PIN to complete.
              </p>

              <div style={{ display: 'flex', gap: '0.625rem' }}>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="payment-modal-cancel-btn"
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
                  onClick={handleFreeWeekendSkip}
                  className="payment-modal-free-btn"
                >
                  Weekend Free Pass — Skip Payment and Download
                </button>
              )}
            </form>
          )}

          {/* Waiting for payment */}
          {state === 'waiting' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <StatusBanner status="waiting" phone={phone} />
              <p style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', textAlign: 'center', lineHeight: 1.4 }}>
                This window will close automatically once your payment is confirmed.
              </p>
            </div>
          )}

          {/* Failed or timed out */}
          {(state === 'failed' || state === 'timeout') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <StatusBanner status={state} message={errorMessage} />
              <div style={{ display: 'flex', gap: '0.625rem' }}>
                <button
                  onClick={handleClose}
                  className="payment-modal-cancel-btn"
                  style={{ flex: 1 }}
                >
                  Close
                </button>
                <button
                  onClick={() => { setState('entering_phone'); setErrorMessage(''); stopPolling(); }}
                  className={`btn-buy${isBlue ? '' : ' btn-buy-teal'}`}
                  style={{ flex: 2 }}
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
