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

  // Active transaction references for re-checks and recovery
  const [activeOrderId, setActiveOrderId] = useState<string>('');
  const [activeCheckoutId, setActiveCheckoutId] = useState<string>('');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isCheckingAgain, setIsCheckingAgain] = useState(false);

  // M-Pesa receipt code manual unlock
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [mpesaCodeInput, setMpesaCodeInput] = useState('');
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [codeError, setCodeError] = useState('');

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollTimerRef = useRef<number>(0);

  // Mount + animate in + load saved phone
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('pwn_saved_phone');
      if (saved) {
        setPhone(saved);
      }
    } catch {}
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

    try {
      localStorage.setItem('pwn_saved_phone', phone.trim());
    } catch {}

    setIsSubmitting(true);
    setErrorMessage('');
    setShowCodeInput(false);
    setCodeError('');

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

      setActiveOrderId(data.orderId);
      setActiveCheckoutId(data.checkoutRequestId || '');
      setState('waiting');
      startPolling(data.orderId, data.checkoutRequestId, data.fileUrl);
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

  const startPolling = (currentOrderId: string, checkoutRequestId?: string, fileUrlFromInit?: string) => {
    stopPolling();
    pollTimerRef.current = 0;
    setElapsedSeconds(0);

    pollIntervalRef.current = setInterval(async () => {
      pollTimerRef.current += 2.5;
      const currentElapsed = Math.round(pollTimerRef.current);
      setElapsedSeconds(currentElapsed);

      // 120 seconds standard timeout: allows user to enter PIN + network propagation
      if (pollTimerRef.current >= 120) {
        stopPolling();
        setState('timeout');
        setErrorMessage('Verification timed out. If money was deducted, enter your M-Pesa code below to unlock immediately.');
        return;
      }

      try {
        const params = new URLSearchParams();
        if (checkoutRequestId) params.set('invoiceId', checkoutRequestId);
        if (unitCode) params.set('unit', unitCode);
        if (product.id) params.set('product', product.id);
        if (product.type) params.set('type', product.type);

        const res = await fetch(`/api/status/${currentOrderId}?${params.toString()}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === 'paid') {
          stopPolling();
          const url = data.fileUrl || fileUrlFromInit || product.fileUrl || getProductRealDownloadUrl();
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

  const handleCheckStatusAgain = async () => {
    if (!activeOrderId) return;
    setIsCheckingAgain(true);
    try {
      const params = new URLSearchParams();
      if (activeCheckoutId) params.set('invoiceId', activeCheckoutId);
      if (unitCode) params.set('unit', unitCode);
      if (product.id) params.set('product', product.id);
      if (product.type) params.set('type', product.type);

      const res = await fetch(`/api/status/${activeOrderId}?${params.toString()}`);
      const data = await res.json();

      if (data.status === 'paid') {
        const url = data.fileUrl || product.fileUrl || getProductRealDownloadUrl();
        setVisible(false);
        setTimeout(() => onPaymentSuccess(url), 260);
      } else if (data.status === 'failed') {
        setErrorMessage(data.message || 'Payment failed or was cancelled.');
        setState('failed');
      } else {
        // Resume polling for another 45 seconds
        setState('waiting');
        startPolling(activeOrderId, activeCheckoutId, undefined);
      }
    } catch {
      setErrorMessage('Verification check timed out. If you have an M-Pesa SMS code, enter it below.');
    } finally {
      setIsCheckingAgain(false);
    }
  };

  const handleVerifyMpesaCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = mpesaCodeInput.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 6) {
      setCodeError('Please enter a valid M-Pesa receipt code (e.g. UJDHTA150X)');
      return;
    }

    setIsVerifyingCode(true);
    setCodeError('');

    try {
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mpesaCode: cleanCode,
          unitCode,
          productId: product.id,
          productType: product.type,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to verify M-Pesa code.');
      }

      const url = data.fileUrl || product.fileUrl || getProductRealDownloadUrl();
      setVisible(false);
      setTimeout(() => onPaymentSuccess(url), 260);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not verify M-Pesa code';
      setCodeError(msg);
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleFreeWeekendSkip = () => {
    setVisible(false);
    setTimeout(() => {
      onPaymentSuccess(getProductRealDownloadUrl());
    }, 260);
  };

  const isBlue = product.type === 'notes' || product.type === 'videoSlides';

  // Dynamic progress text while waiting
  const getWaitingHelpText = () => {
    if (elapsedSeconds < 20) {
      return `M-Pesa prompt sent to ${phone || 'your phone'}. Please check your screen.`;
    }
    if (elapsedSeconds < 65) {
      return 'Enter your 4-digit M-Pesa PIN on your phone and press OK.';
    }
    return 'Confirming transaction with Safaricom network... Please keep this open.';
  };

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

              {/* Already paid recovery link */}
              <div style={{ textAlign: 'center', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCodeInput(!showCodeInput)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.73rem',
                    color: 'var(--blue)',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  {showCodeInput ? 'Hide M-Pesa Code Input' : 'Already paid? Enter M-Pesa Code to unlock'}
                </button>
              </div>

              {showCodeInput && (
                <div style={{
                  padding: '0.875rem',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--ink)', fontWeight: 600 }}>
                    Enter M-Pesa Transaction Code
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="e.g. UJDHTA150X"
                      value={mpesaCodeInput}
                      onChange={(e) => setMpesaCodeInput(e.target.value.toUpperCase())}
                      style={{
                        flex: 1,
                        padding: '0.5rem 0.75rem',
                        border: '1px solid #CBD5E1',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        fontFamily: 'monospace',
                      }}
                    />
                    <button
                      type="button"
                      disabled={isVerifyingCode}
                      onClick={handleVerifyMpesaCode}
                      className={`btn-buy${isBlue ? '' : ' btn-buy-teal'}`}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.78rem' }}
                    >
                      {isVerifyingCode ? 'Checking...' : 'Unlock'}
                    </button>
                  </div>
                  {codeError && (
                    <p style={{ fontSize: '0.72rem', color: '#DC2626' }}>{codeError}</p>
                  )}
                </div>
              )}

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

          {/* Waiting for payment with 120s progress */}
          {state === 'waiting' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <StatusBanner status="waiting" phone={phone} />
              
              <div style={{
                padding: '0.625rem 0.875rem',
                backgroundColor: 'rgba(36, 80, 200, 0.05)',
                border: '1px dashed rgba(36, 80, 200, 0.25)',
                borderRadius: '6px',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: '0.78rem', color: 'var(--blue)', fontWeight: 500, lineHeight: 1.4 }}>
                  {getWaitingHelpText()}
                </p>
                <div style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: '#E2E8F0',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  marginTop: '0.5rem',
                }}>
                  <div style={{
                    width: `${Math.min(100, (elapsedSeconds / 120) * 100)}%`,
                    height: '100%',
                    backgroundColor: 'var(--blue)',
                    transition: 'width 2.5s linear',
                  }} />
                </div>
              </div>

              <p style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', textAlign: 'center', lineHeight: 1.4 }}>
                This window will automatically unlock your file as soon as Safaricom confirms your PIN.
              </p>
            </div>
          )}

          {/* Timed out screen with recovery options */}
          {state === 'timeout' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <StatusBanner status="timeout" message={errorMessage} />

              <div style={{
                padding: '0.875rem',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}>
                <p style={{ fontSize: '0.78rem', color: 'var(--ink)', fontWeight: 600 }}>
                  Did money get deducted or did you enter your PIN?
                </p>
                <p style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', lineHeight: 1.4 }}>
                  Safaricom may take a few seconds to finish transmitting. You can check again right now or enter your M-Pesa receipt code.
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <input
                    type="text"
                    placeholder="M-Pesa Code (e.g. UJDHTA150X)"
                    value={mpesaCodeInput}
                    onChange={(e) => setMpesaCodeInput(e.target.value.toUpperCase())}
                    style={{
                      flex: 1,
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #CBD5E1',
                      borderRadius: '4px',
                      fontSize: '0.82rem',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      fontFamily: 'monospace',
                    }}
                  />
                  <button
                    type="button"
                    disabled={isVerifyingCode}
                    onClick={handleVerifyMpesaCode}
                    className={`btn-buy${isBlue ? '' : ' btn-buy-teal'}`}
                    style={{ padding: '0.5rem 0.875rem', fontSize: '0.78rem' }}
                  >
                    {isVerifyingCode ? 'Checking...' : 'Verify Code'}
                  </button>
                </div>
                {codeError && (
                  <p style={{ fontSize: '0.72rem', color: '#DC2626' }}>{codeError}</p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleClose}
                  className="payment-modal-cancel-btn"
                  style={{ flex: 1 }}
                >
                  Close
                </button>
                <button
                  onClick={handleCheckStatusAgain}
                  disabled={isCheckingAgain}
                  className="payment-modal-cancel-btn"
                  style={{
                    flex: 1.5,
                    border: '1px solid var(--blue)',
                    color: 'var(--blue)',
                    fontWeight: 600,
                  }}
                >
                  {isCheckingAgain ? 'Checking...' : 'Check Status Again'}
                </button>
                <button
                  onClick={() => { setState('entering_phone'); setErrorMessage(''); stopPolling(); }}
                  className={`btn-buy${isBlue ? '' : ' btn-buy-teal'}`}
                  style={{ flex: 1.5 }}
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Failed state */}
          {state === 'failed' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <StatusBanner status="failed" message={errorMessage} />
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
