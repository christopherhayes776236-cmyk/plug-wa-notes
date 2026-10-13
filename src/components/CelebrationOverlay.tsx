'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface CelebrationOverlayProps {
  onDone: () => void;
}

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({ onDone }) => {
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Hold for 1200ms then begin fade-out
    const fadeTimer = setTimeout(() => {
      setPhase('out');
    }, 1200);

    // Remove from DOM after full 1500ms
    const doneTimer = setTimeout(() => {
      onDone();
    }, 1500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  if (!mounted) return null;

  return createPortal(
    <div className="celebration-backdrop">
      <div
        className={`celebration-frame ${phase === 'out' ? 'celebration-frame--out' : ''}`}
      >
        <img
          src="/celebration.gif"
          alt="Payment confirmed"
          className="celebration-gif"
          draggable={false}
        />
      </div>
    </div>,
    document.body
  );
};
