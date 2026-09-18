'use client';

import React, { useState, useRef, useEffect } from 'react';

type DemoType = 'notes' | 'video' | 'audio' | 'slides';

interface FormatDemoProps {
  type: DemoType;
}

export const FormatDemo: React.FC<FormatDemoProps> = ({ type }) => {
  const [isActive, setIsActive] = useState(false);
  const [activeHint, setActiveHint] = useState('Tap or swipe to test');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Notes state (page turn)
  const [page, setPage] = useState(1);
  const [dragProgress, setDragProgress] = useState(0);

  // Video state (scrubber drag)
  const [videoProgress, setVideoProgress] = useState(30);
  const scrubTrackRef = useRef<HTMLDivElement | null>(null);
  const isScrubbingRef = useRef(false);

  // Slides state (swipe deck)
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideOffset, setSlideOffset] = useState(0);

  // Touch/pointer drag tracking
  const startXRef = useRef(0);
  const isDraggingRef = useRef(false);

  // Clear idle timer
  const resetTimer = (duration = 2400) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsActive(false);
      setDragProgress(0);
      setSlideOffset(0);
      setActiveHint('Tap or swipe to test');
    }, duration);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  /* ─────────────────────────────────────────────────────────────
     Notes: Page Turn Drag & Tap
  ───────────────────────────────────────────────────────────── */
  const handleNotesTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    startXRef.current = clientX;
    isDraggingRef.current = true;
    setIsActive(true);
    setActiveHint('Swipe left or right to turn page');
  };

  const handleNotesTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - startXRef.current;
    // Map -100px..100px to progress
    const progress = Math.min(Math.max(-deltaX / 100, -1), 1);
    setDragProgress(progress);
  };

  const handleNotesTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (dragProgress > 0.25) {
      setPage(2);
    } else if (dragProgress < -0.25) {
      setPage(1);
    } else {
      // Toggle on tap
      setPage((prev) => (prev === 1 ? 2 : 1));
    }
    setDragProgress(0);
    resetTimer(2200);
  };

  /* ─────────────────────────────────────────────────────────────
     Video: Scrub Bar Drag & Tap
  ───────────────────────────────────────────────────────────── */
  const updateScrubFromPosition = (clientX: number) => {
    if (!scrubTrackRef.current) return;
    const rect = scrubTrackRef.current.getBoundingClientRect();
    const percent = Math.min(Math.max(0, (clientX - rect.left) / rect.width), 1) * 100;
    setVideoProgress(percent);
    setIsActive(true);
    setActiveHint('Scrubbing video timeline');
  };

  const handleScrubStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    isScrubbingRef.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    updateScrubFromPosition(clientX);
  };

  const handleScrubMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isScrubbingRef.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    updateScrubFromPosition(clientX);
  };

  const handleScrubEnd = () => {
    if (isScrubbingRef.current) {
      isScrubbingRef.current = false;
      resetTimer(2000);
    }
  };

  const handleVideoCardTap = () => {
    setIsActive(true);
    setActiveHint('Playing breakdown preview');
    setVideoProgress(15);
    const interval = setInterval(() => {
      setVideoProgress((prev) => {
        if (prev >= 85) {
          clearInterval(interval);
          return 85;
        }
        return prev + 15;
      });
    }, 300);
    resetTimer(2200);
  };

  /* ─────────────────────────────────────────────────────────────
     Audio: Tap-to-Play Waveform
  ───────────────────────────────────────────────────────────── */
  const handleAudioTap = () => {
    setIsActive(true);
    setActiveHint('Audio walkthrough playing');
    resetTimer(2500);
  };

  /* ─────────────────────────────────────────────────────────────
     Slides: Swipe Left/Right Deck
  ───────────────────────────────────────────────────────────── */
  const handleSlidesTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    startXRef.current = clientX;
    isDraggingRef.current = true;
    setIsActive(true);
    setActiveHint('Swipe to flip slides');
  };

  const handleSlidesTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - startXRef.current;
    setSlideOffset(Math.min(Math.max(deltaX, -120), 120));
  };

  const handleSlidesTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (slideOffset < -30) {
      setSlideIndex((prev) => (prev < 2 ? prev + 1 : 0));
    } else if (slideOffset > 30) {
      setSlideIndex((prev) => (prev > 0 ? prev - 1 : 2));
    } else {
      // Tap advances
      setSlideIndex((prev) => (prev + 1) % 3);
    }
    setSlideOffset(0);
    resetTimer(2000);
  };

  // Format second to time string
  const formatSeconds = (percent: number) => {
    const totalSeconds = 8 * 60 + 15; // 08:15
    const current = Math.round((percent / 100) * totalSeconds);
    const m = Math.floor(current / 60).toString().padStart(2, '0');
    const s = (current % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div
      role="region"
      className="format-demo-wrap"
      aria-label={`Interactive preview for ${type}`}
      style={{ touchAction: 'pan-y' }}
    >
      {/* Plain sentence-case microcopy header — no small-caps uppercase eyebrows */}
      <div className="format-demo-header">
        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--ink)' }}>
          Interactive preview
        </span>
        <span style={{ fontSize: '0.6875rem', color: isActive ? 'var(--blue)' : 'var(--ink-muted)' }}>
          {activeHint}
        </span>
      </div>

      {/* ─── Notes Card (Page Turn) ─────────────────────────── */}
      {type === 'notes' && (
        <div
          onTouchStart={handleNotesTouchStart}
          onTouchMove={handleNotesTouchMove}
          onTouchEnd={handleNotesTouchEnd}
          onMouseDown={handleNotesTouchStart}
          onMouseMove={handleNotesTouchMove}
          onMouseUp={handleNotesTouchEnd}
          style={{
            position: 'relative',
            height: '7.5rem',
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            padding: '0.875rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'grab',
            userSelect: 'none',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              transform: `translateX(${-dragProgress * 15}px)`,
              transition: isDraggingRef.current ? 'none' : 'transform 0.25s ease-out',
            }}
          >
            <div style={{ height: '0.5rem', width: '28%', background: 'rgba(36,80,200,0.35)', marginBottom: '0.5rem' }} />
            <p style={{
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              color: 'var(--ink)',
              fontWeight: 500,
              lineHeight: 1.4,
            }}>
              {page === 1
                ? 'Theorem 2.1: Let R be an equivalence relation on set A. Then R partitions A into disjoint equivalence classes.'
                : 'Example 2.2: Compute the partition formed by relation R on integers modulo 5. Detailed step-by-step proof.'}
            </p>
            <div style={{ height: '0.3125rem', width: '100%', background: 'var(--line)', marginTop: '0.5rem' }} />
            <div style={{ height: '0.3125rem', width: '75%', background: 'var(--line)', marginTop: '0.25rem' }} />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.6875rem',
            color: 'var(--ink-muted)',
            borderTop: '1px solid var(--line)',
            paddingTop: '0.375rem',
          }}>
            <span>Clean handwritten transcription</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 500, color: 'var(--blue)' }}>
              Page {page} of 14
            </span>
          </div>
        </div>
      )}

      {/* ─── Video Card (Draggable Scrub Bar) ───────────────── */}
      {type === 'video' && (
        <div
          onClick={handleVideoCardTap}
          onTouchMove={handleScrubMove}
          onTouchEnd={handleScrubEnd}
          onMouseMove={handleScrubMove}
          onMouseUp={handleScrubEnd}
          style={{
            position: 'relative',
            height: '7.5rem',
            background: 'var(--ink)',
            color: '#FFFFFF',
            padding: '0.875rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            userSelect: 'none',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
              Explainer video demo
            </span>
            <div style={{
              width: '1.5rem',
              height: '1.5rem',
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isActive ? 'var(--teal)' : 'transparent',
              transition: 'background 200ms, transform 200ms',
              transform: isActive ? 'scale(1.1)' : 'scale(1)',
            }}>
              <span style={{ fontSize: '0.625rem', paddingLeft: '1px', color: '#fff' }}>&#9654;</span>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)' }}>
              {isActive ? 'Step-by-step whiteboard animation' : 'Visual breakdown of algorithmic logic'}
            </p>
          </div>

          {/* Interactive Scrub Bar */}
          <div>
            <div
              ref={scrubTrackRef}
              onTouchStart={handleScrubStart}
              onMouseDown={handleScrubStart}
              style={{
                width: '100%',
                height: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                cursor: 'ew-resize',
                padding: '0.2rem 0',
              }}
            >
              <div style={{ width: '100%', height: '0.375rem', background: 'rgba(255,255,255,0.2)', position: 'relative' }}>
                <div style={{
                  height: '100%',
                  width: `${videoProgress}%`,
                  background: 'var(--teal)',
                  transition: isScrubbingRef.current ? 'none' : 'width 250ms ease-out',
                }} />
                {/* Scrub handle */}
                <div style={{
                  position: 'absolute',
                  top: '-3px',
                  left: `calc(${videoProgress}% - 6px)`,
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  boxShadow: '0 0 4px rgba(0,0,0,0.5)',
                }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)' }}>
              <span>{formatSeconds(videoProgress)}</span>
              <span>08:15</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── Audio Card (Waveform Equalizer) ────────────────── */}
      {type === 'audio' && (
        <div
          onClick={handleAudioTap}
          style={{
            position: 'relative',
            height: '7.5rem',
            background: 'var(--teal-tint)',
            border: '1px solid rgba(21,127,114,0.25)',
            padding: '0.875rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', fontWeight: 500, color: 'var(--teal)' }}>
            <span>Audio overview</span>
            <span>{isActive ? 'Playing (1.25x)' : 'Tap to play'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '0.25rem', height: '3.25rem' }}>
            {[18, 30, 44, 26, 38, 50, 32, 46, 22, 34, 20, 44, 28, 40, 24, 36, 18].map((h, i) => (
              <div
                key={i}
                style={{
                  width: '0.3125rem',
                  height: isActive ? `${((h * 1.3) % 40) + 12}px` : '6px',
                  background: 'var(--teal)',
                  opacity: isActive ? 0.95 : 0.35,
                  transition: 'height 180ms ease-in-out, opacity 180ms ease-in-out',
                  transitionDelay: `${(i % 5) * 25}ms`,
                }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--ink-muted)' }}>
            <span>High-yield podcast style recap</span>
            <span style={{ fontFamily: 'monospace' }}>1.25x speed</span>
          </div>
        </div>
      )}

      {/* ─── Slides Card (Interactive Swipe Deck) ───────────── */}
      {type === 'slides' && (
        <div
          onTouchStart={handleSlidesTouchStart}
          onTouchMove={handleSlidesTouchMove}
          onTouchEnd={handleSlidesTouchEnd}
          onMouseDown={handleSlidesTouchStart}
          onMouseMove={handleSlidesTouchMove}
          onMouseUp={handleSlidesTouchEnd}
          style={{
            position: 'relative',
            height: '7.5rem',
            background: 'var(--blue-tint)',
            border: '1px solid rgba(36,80,200,0.25)',
            padding: '0.875rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'grab',
            userSelect: 'none',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', fontWeight: 500, color: 'var(--blue)' }}>
            <span>Exam slide deck</span>
            <span style={{ fontFamily: 'monospace' }}>Slide {slideIndex + 1} of 3</span>
          </div>

          <div
            style={{
              padding: '0.25rem 0',
              transform: `translateX(${slideOffset}px)`,
              transition: isDraggingRef.current ? 'none' : 'transform 0.2s ease-out',
            }}
          >
            {slideIndex === 0 && (
              <div>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink)' }}>1. Core Definitions &amp; Models</p>
                <p style={{ fontSize: '0.6875rem', color: 'var(--ink-muted)', marginTop: '0.2rem' }}>High-priority exam questions and formulas.</p>
              </div>
            )}
            {slideIndex === 1 && (
              <div>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink)' }}>2. Diagram &amp; Architecture Layouts</p>
                <p style={{ fontSize: '0.6875rem', color: 'var(--ink-muted)', marginTop: '0.2rem' }}>Visual structural patterns to memorise.</p>
              </div>
            )}
            {slideIndex === 2 && (
              <div>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink)' }}>3. Past Paper Mistakes to Avoid</p>
                <p style={{ fontSize: '0.6875rem', color: 'var(--ink-muted)', marginTop: '0.2rem' }}>Top traps where exam marks are forfeited.</p>
              </div>
            )}
          </div>

          {/* Dots Indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.375rem' }}>
            {[0, 1, 2].map((dot) => (
              <div
                key={dot}
                style={{
                  height: '0.375rem',
                  borderRadius: '9999px',
                  transition: 'width 200ms ease, background 200ms ease',
                  width: slideIndex === dot ? '1.25rem' : '0.375rem',
                  background: slideIndex === dot ? 'var(--blue)' : 'rgba(36,80,200,0.3)',
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
