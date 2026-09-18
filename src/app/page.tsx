'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { UNITS } from '@/lib/data';

const TOTAL_PAGES = 6;

export default function HomePage() {
  // Active Theory inspired loading screen
  const [isLoading, setIsLoading] = useState(true);
  const [loadPercent, setLoadPercent] = useState(0);

  // Active fullpage index (0: Welcome, 1: Notes, 2: Video, 3: Audio, 4: Slides, 5: Units)
  const [currentPage, setCurrentPage] = useState(0);
  const isTransitioningRef = useRef(false);

  // Touch gesture coordinates
  const touchStartYRef = useRef(0);

  // Page 4: Typewriter text state
  const audioExactText = "Usiache kuosha viombo prevent you from gaining knowledge kua sharp boy/girl ukiskia audio overview ";
  const [typedAudioText, setTypedAudioText] = useState("");
  const [typingComplete, setTypingComplete] = useState(false);

  // Slide content enter animation key (changes on page switch to re-trigger)
  const [animKey, setAnimKey] = useState(0);

  // Media state controls (for placeholders)
  const [notesScrolled, setNotesScrolled] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(25);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  /* ─────────────────────────────────────────────────────────────
     Active Theory Minimalist Loader
  ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    const startTime = Date.now();
    const duration = 1800; // 1.8s

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.floor((elapsed / duration) * 100), 100);
      setLoadPercent(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsLoading(false);
        }, 250);
      }
    }, 25);

    return () => clearInterval(interval);
  }, []);

  /* ─────────────────────────────────────────────────────────────
     Page Navigation Logic with Throttling
  ───────────────────────────────────────────────────────────── */
  const goToPage = useCallback((index: number) => {
    if (index < 0 || index >= TOTAL_PAGES) return;
    if (isTransitioningRef.current) return;

    isTransitioningRef.current = true;
    setCurrentPage(index);
    setAnimKey((k) => k + 1); // re-trigger slide-enter animation

    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 800);
  }, []);

  const nextPage = useCallback(() => {
    if (currentPage < TOTAL_PAGES - 1) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  /* ─────────────────────────────────────────────────────────────
     Desktop Wheel & Keyboard Handlers
  ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (isLoading) return;

    const handleWheel = (e: WheelEvent) => {
      // Don't intercept if user is inside a scrollable element on the final page
      const target = e.target as HTMLElement;
      if (currentPage === 5 && target.closest('.unit-grid')) {
        // allow local scrolling
        return;
      }

      if (Math.abs(e.deltaY) > 25) {
        if (e.deltaY > 0) {
          nextPage();
        } else {
          prevPage();
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        nextPage();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        prevPage();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLoading, currentPage, nextPage, prevPage]);

  /* ─────────────────────────────────────────────────────────────
     Mobile Touch Swipe Handlers
  ───────────────────────────────────────────────────────────── */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartYRef.current - touchEndY;

    // Minimum swipe threshold (40px)
    if (Math.abs(deltaY) > 40) {
      if (deltaY > 0) {
        nextPage(); // swipe up -> next page
      } else {
        prevPage(); // swipe down -> prev page
      }
    }
  };

  /* ─────────────────────────────────────────────────────────────
     Page 4: Typewriter Effect Trigger
  ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (currentPage === 3) {
      setTypedAudioText("");
      setTypingComplete(false);
      let idx = 0;

      const typeTimer = setInterval(() => {
        idx++;
        setTypedAudioText(audioExactText.slice(0, idx));

        if (idx >= audioExactText.length) {
          clearInterval(typeTimer);
          setTypingComplete(true);
          setAudioPlaying(true);
        }
      }, 34);

      return () => clearInterval(typeTimer);
    } else {
      setAudioPlaying(false);
    }
  }, [currentPage]);

  // Video progress animation when on Page 3
  useEffect(() => {
    if (currentPage === 2) {
      setVideoPlaying(true);
      const interval = setInterval(() => {
        setVideoProgress((prev) => (prev >= 95 ? 10 : prev + 2));
      }, 200);
      return () => clearInterval(interval);
    } else {
      setVideoPlaying(false);
    }
  }, [currentPage]);

  return (
    <>
      {/* ─── 1. Active Theory Inspired Loading Screen ───────────────── */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          backgroundColor: '#0F172A',
          color: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '2.5rem 2rem',
          fontFamily: 'monospace',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', letterSpacing: '0.12em', color: '#94A3B8' }}>
            <span>PLUG WA NOTES</span>
            <span>SOEN 2.1 · KISII</span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '3.5rem',
              fontWeight: 500,
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em',
              color: '#F8FAFC',
            }}>
              {loadPercent.toString().padStart(2, '0')}%
            </div>
            <div style={{
              width: '12rem',
              height: '2px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              margin: '1.25rem auto 0',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${loadPercent}%`,
                backgroundColor: '#0D9488',
                transition: 'width 0.05s linear',
              }} />
            </div>
            <p style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: '0.875rem', letterSpacing: '0.08em' }}>
              INITIALIZING KNOWLEDGE BANK
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#64748B' }}>
            <span>DIRECT ACCESS</span>
            <span>V2.1.0</span>
          </div>
        </div>
      )}

      {/* ─── 2. Full-Page Container (100vh Viewport) ───────────────── */}
      <div
        className="fullpage-wrapper"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Fixed Minimal Header */}
        <header style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '4rem',
          zIndex: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          maxWidth: '720px',
          margin: '0 auto',
          pointerEvents: 'none',
        }}>
          <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: '1rem',
              color: '#0F172A',
            }}>
              Plug Wa Notes
            </span>
            <span style={{
              fontSize: '0.6875rem',
              fontFamily: 'monospace',
              color: '#475569',
              background: '#F1F5F9',
              padding: '0.125rem 0.375rem',
              border: '1px solid #E2E8F0',
            }}>
              0{currentPage + 1} / 0{TOTAL_PAGES}
            </span>
          </div>

          {currentPage < TOTAL_PAGES - 1 ? (
            <button
              onClick={() => goToPage(5)}
              style={{
                pointerEvents: 'auto',
                fontSize: '0.75rem',
                fontWeight: 500,
                color: '#1E40AF',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                padding: '0.3125rem 0.75rem',
                cursor: 'pointer',
              }}
            >
              Skip to Units &darr;
            </button>
          ) : (
            <button
              onClick={() => goToPage(0)}
              style={{
                pointerEvents: 'auto',
                fontSize: '0.75rem',
                fontWeight: 500,
                color: '#475569',
                backgroundColor: '#F1F5F9',
                border: '1px solid #E2E8F0',
                padding: '0.3125rem 0.75rem',
                cursor: 'pointer',
              }}
            >
              Back to top &uarr;
            </button>
          )}
        </header>

        {/* Floating Right Pagination HUD */}
        <nav className="fullpage-hud" aria-label="Page navigation">
          {[0, 1, 2, 3, 4, 5].map((idx) => {
            const isTeal = idx === 2 || idx === 4;
            const isActive = currentPage === idx;
            return (
              <button
                key={idx}
                onClick={() => goToPage(idx)}
                aria-label={`Go to section ${idx + 1}`}
                className={`fullpage-dot ${isActive ? (isTeal ? 'active-teal' : 'active') : ''}`}
              />
            );
          })}
        </nav>

        {/* ─── Animated Vertical Track ──────────────────────────────── */}
        <div
          className="fullpage-track"
          style={{
            transform: `translate3d(0, -${currentPage * 100}%, 0)`,
          }}
        >
          {/* ═══════════════════════════════════════════════════════════
              PAGE 1 – Welcome
          ═══════════════════════════════════════════════════════════ */}
          <section className="fullpage-slide" key={`slide-0-${animKey}`}>
            <div /> {/* Top spacer */}

            <div style={{ textAlign: 'left', maxWidth: '620px' }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#1E40AF',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontFamily: 'monospace',
              }}>
                Kisii University · SOEN 2.1
              </span>

              <h1 style={{
                fontSize: '2rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 500,
                color: '#0F172A',
                lineHeight: 1.25,
                marginTop: '0.75rem',
                letterSpacing: '-0.01em',
              }}>
                &ldquo;Welcome to Your Knowledge Bank - where learning is made fun&rdquo;
              </h1>

              <p style={{
                fontSize: '0.9375rem',
                color: '#475569',
                marginTop: '1rem',
                lineHeight: 1.5,
              }}>
                Get clean lecture notes, explainer video reviews, audio recaps, and exam slides.
                Built by coursemates, ready in one click.
              </p>
            </div>

            {/* Bottom action trigger */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                Swipe up or scroll to explore
              </span>
              <button
                onClick={nextPage}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1.25rem',
                  backgroundColor: '#1E40AF',
                  color: '#FFFFFF',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <span>Pata Notes</span>
                <span>&darr;</span>
              </button>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════
              PAGE 2 – Notes
          ═══════════════════════════════════════════════════════════ */}
          <section className="fullpage-slide" key={`slide-1-${animKey}`}>
            <div>
              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#1E40AF', fontWeight: 600 }}>
                02 / NOTES FORMAT
              </span>
              <h2 style={{
                fontSize: '1.5rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 500,
                color: '#1E40AF',
                lineHeight: 1.3,
                marginTop: '0.375rem',
              }}>
                &ldquo;Feeling behind in class? No stress - Pata notes hapa.&rdquo;
              </h2>
            </div>

            {/* MEDIA PLACEHOLDER: Clean Notes PDF Viewer Component */}
            <div
              onClick={() => setNotesScrolled((prev) => !prev)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                padding: '1.125rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0F172A' }}>
                  Clean Notes PDF Viewer
                </span>
                <span style={{ fontSize: '0.6875rem', color: '#1E40AF', fontWeight: 500 }}>
                  {notesScrolled ? 'Page 2/12' : 'Tap to scroll page'}
                </span>
              </div>

              {/* PDF Document Preview Canvas */}
              <div style={{
                height: '9rem',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                padding: '0.875rem',
                overflow: 'hidden',
                position: 'relative',
              }}>
                <div style={{
                  transform: notesScrolled ? 'translateY(-70px)' : 'translateY(0)',
                  transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                }}>
                  <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '0.375rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#1E40AF' }}>SOEN 2.1 LECTURE SUMMARY</span>
                    <span style={{ fontSize: '0.625rem', color: '#64748B' }}>EXAM HIGHLIGHTS</span>
                  </div>
                  <p style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#0F172A', lineHeight: 1.45 }}>
                    <strong>Theorem 2.1 (Equivalence Partition):</strong> Let R be an equivalence relation on set A.
                    Then R partitions A into disjoint non-empty subsets.
                  </p>
                  <div style={{ background: '#EFF6FF', borderLeft: '3px solid #1E40AF', padding: '0.375rem 0.5rem', margin: '0.5rem 0', fontSize: '0.6875rem', fontFamily: 'monospace', color: '#1E40AF' }}>
                    Proof Sketch: &forall; x &isin; A, x &isin; [x] by reflexivity &hellip;
                  </div>
                  <p style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#0F172A', marginTop: '0.5rem' }}>
                    <strong>Worked CAT Problem 1:</strong> Calculate partition classes for integers modulo 5.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#64748B', marginTop: '0.625rem' }}>
                <span>Handwritten lecture transcription</span>
                <span style={{ color: '#1E40AF' }}>Instant download ready</span>
              </div>
            </div>

            {/* Bottom action trigger */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
              <button
                onClick={prevPage}
                style={{ background: 'none', border: 'none', fontSize: '0.8125rem', color: '#64748B', cursor: 'pointer' }}
              >
                &uarr; Back
              </button>
              <button
                onClick={nextPage}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1.25rem',
                  backgroundColor: '#0D9488',
                  color: '#FFFFFF',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <span>Video Review</span>
                <span>&darr;</span>
              </button>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════
              PAGE 3 – Video Review
          ═══════════════════════════════════════════════════════════ */}
          <section className="fullpage-slide" key={`slide-2-${animKey}`}>
            <div>
              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#0D9488', fontWeight: 600 }}>
                03 / VIDEO REVIEW FORMAT
              </span>
              <h2 style={{
                fontSize: '1.5rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 500,
                color: '#0D9488',
                lineHeight: 1.3,
                marginTop: '0.375rem',
              }}>
                &ldquo;Some units just make more sense in visuals - Pata video review hapa ndani.&rdquo;
              </h2>
            </div>

            {/* MEDIA PLACEHOLDER: Video Player Component */}
            <div
              onClick={() => setVideoPlaying((prev) => !prev)}
              style={{
                background: '#0F172A',
                color: '#FFFFFF',
                border: '1px solid #334155',
                padding: '1.125rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.6875rem', fontFamily: 'monospace', color: '#0D9488', fontWeight: 600 }}>
                  1080P EXPLAINER REVIEW
                </span>
                <div style={{
                  width: '1.5rem',
                  height: '1.5rem',
                  borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: videoPlaying ? '#0D9488' : 'transparent',
                }}>
                  <span style={{ fontSize: '0.625rem', paddingLeft: '1px', color: '#fff' }}>
                    {videoPlaying ? '❚❚' : '▶'}
                  </span>
                </div>
              </div>

              {/* Video visual screen */}
              <div style={{
                height: '8.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '0.5rem',
                background: '#1E293B',
              }}>
                <p style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: '#F8FAFC' }}>
                  {videoPlaying ? 'Whiteboard trace: Step-by-step algorithm' : 'Visual step-by-step walkthrough'}
                </p>
                <span style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: '0.375rem' }}>
                  [ Video clip placeholder &middot; Swappable for Cloudinary MP4 ]
                </span>
              </div>

              {/* Scrubber timeline */}
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.2)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${videoProgress}%`,
                    background: '#0D9488',
                    transition: 'width 0.2s linear',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', fontFamily: 'monospace', color: '#94A3B8', marginTop: '0.375rem' }}>
                  <span>02:15</span>
                  <span>08:40 total duration</span>
                </div>
              </div>
            </div>

            {/* Bottom action trigger */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
              <button
                onClick={prevPage}
                style={{ background: 'none', border: 'none', fontSize: '0.8125rem', color: '#64748B', cursor: 'pointer' }}
              >
                &uarr; Back
              </button>
              <button
                onClick={nextPage}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1.25rem',
                  backgroundColor: '#1E40AF',
                  color: '#FFFFFF',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <span>Audio Overview</span>
                <span>&darr;</span>
              </button>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════
              PAGE 4 – Audio (Character-by-Character Typewriter)
          ═══════════════════════════════════════════════════════════ */}
          <section className="fullpage-slide" key={`slide-3-${animKey}`}>
            <div>
              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#1E40AF', fontWeight: 600 }}>
                04 / AUDIO OVERVIEW FORMAT
              </span>
              <h2 style={{
                fontSize: '1.375rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 500,
                color: '#1E40AF',
                lineHeight: 1.35,
                marginTop: '0.375rem',
                minHeight: '4.5rem',
              }}>
                &ldquo;{typedAudioText}&rdquo;
                {!typingComplete && <span className="typewriter-cursor" />}
              </h2>
            </div>

            {/* MEDIA PLACEHOLDER: Audio Waveform Equalizer */}
            <div
              onClick={() => setAudioPlaying((prev) => !prev)}
              style={{
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                padding: '1.125rem',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1E40AF' }}>
                  Audio Overview Player
                </span>
                <span style={{ fontSize: '0.6875rem', color: '#1E40AF', fontWeight: 500 }}>
                  {audioPlaying ? 'Playing (1.25x)' : 'Tap to listen'}
                </span>
              </div>

              {/* Bouncing Equalizer Bars — pure CSS animation */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                gap: '0.375rem',
                height: '4rem',
              }}>
                {[14, 28, 42, 24, 38, 50, 30, 44, 20, 36, 48, 26, 40, 22, 34, 46, 18, 30].map((h, i) => (
                  <div
                    key={i}
                    className={`eq-bar ${audioPlaying ? 'playing' : 'paused'}`}
                    style={{
                      '--eq-h': `${Math.max(10, (h * 1.3) % 44 + 8)}px`,
                      '--eq-dur': `${0.5 + (i % 5) * 0.07}s`,
                      animationDelay: audioPlaying ? `${(i % 7) * 0.06}s` : '0s',
                    } as React.CSSProperties}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#475569', marginTop: '0.75rem', borderTop: '1px solid #DBEAFE', paddingTop: '0.5rem' }}>
                <span>[ Audio placeholder &middot; Swappable for Cloudinary M4A ]</span>
                <span style={{ fontFamily: 'monospace' }}>Commute Recap</span>
              </div>
            </div>

            {/* Bottom action trigger */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
              <button
                onClick={prevPage}
                style={{ background: 'none', border: 'none', fontSize: '0.8125rem', color: '#64748B', cursor: 'pointer' }}
              >
                &uarr; Back
              </button>
              <button
                onClick={nextPage}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1.25rem',
                  backgroundColor: '#0D9488',
                  color: '#FFFFFF',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <span>Revision Slides</span>
                <span>&darr;</span>
              </button>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════
              PAGE 5 – Slides
          ═══════════════════════════════════════════════════════════ */}
          <section className="fullpage-slide" key={`slide-4-${animKey}`}>
            <div>
              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#0D9488', fontWeight: 600 }}>
                05 / EXAM SLIDES FORMAT
              </span>
              <h2 style={{
                fontSize: '1.5rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 500,
                color: '#0D9488',
                lineHeight: 1.3,
                marginTop: '0.375rem',
              }}>
                &ldquo;Need a short version before cats or exams? Pata slides hapa.&rdquo;
              </h2>
            </div>

            {/* MEDIA PLACEHOLDER: Slide Deck Component */}
            <div
              onClick={() => setSlideIndex((prev) => (prev + 1) % 3)}
              style={{
                background: '#F0FDFA',
                border: '1px solid #99F6E4',
                padding: '1.125rem',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0D9488' }}>
                  Exam Slide Deck
                </span>
                <span style={{ fontSize: '0.6875rem', fontFamily: 'monospace', color: '#0D9488', fontWeight: 600 }}>
                  Slide {slideIndex + 1} of 3
                </span>
              </div>

              <div style={{ padding: '0.75rem 0', minHeight: '4.5rem' }}>
                {slideIndex === 0 && (
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>
                      1. Core Definitions &amp; Exam Terminology
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem', lineHeight: 1.4 }}>
                      Direct bullet-point formulas and concepts asked in past paper Section A.
                    </p>
                  </div>
                )}
                {slideIndex === 1 && (
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>
                      2. Diagram &amp; Architecture Layouts
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem', lineHeight: 1.4 }}>
                      Schematic flowcharts and ER/UML models ready to sketch in Section B.
                    </p>
                  </div>
                )}
                {slideIndex === 2 && (
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>
                      3. Common Marking Pitfalls &amp; Mistakes
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem', lineHeight: 1.4 }}>
                      Common student errors pointed out during previous semester exam reviews.
                    </p>
                  </div>
                )}
              </div>

              {/* Dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.375rem', marginTop: '0.5rem' }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      height: '4px',
                      borderRadius: '9999px',
                      width: slideIndex === i ? '1.5rem' : '0.375rem',
                      backgroundColor: slideIndex === i ? '#0D9488' : '#99F6E4',
                      transition: 'all 0.2s ease',
                    }}
                  />
                ))}
              </div>

              <div style={{ fontSize: '0.6875rem', color: '#64748B', marginTop: '0.625rem', textAlign: 'center' }}>
                [ Slides placeholder &middot; Swappable for Cloudinary Slides ]
              </div>
            </div>

            {/* Bottom action trigger */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
              <button
                onClick={prevPage}
                style={{ background: 'none', border: 'none', fontSize: '0.8125rem', color: '#64748B', cursor: 'pointer' }}
              >
                &uarr; Back
              </button>
              <button
                onClick={nextPage}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1.25rem',
                  backgroundColor: '#1E40AF',
                  color: '#FFFFFF',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <span>Pick Unit</span>
                <span>&darr;</span>
              </button>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════
              PAGE 6 – Unit Links Section (Full Viewport)
          ═══════════════════════════════════════════════════════════ */}
          <section className="fullpage-slide" key={`slide-5-${animKey}`} style={{ overflowY: 'auto' }}>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#1E40AF', fontWeight: 600 }}>
                06 / SELECT COURSE UNIT
              </span>
              <h2 style={{
                fontSize: '1.5rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 500,
                color: '#0F172A',
                marginTop: '0.25rem',
              }}>
                Pick your unit
              </h2>
              <p style={{ fontSize: '0.8125rem', color: '#475569', marginTop: '0.25rem' }}>
                Direct access to notes, explainer video, audio recap, and slide packs.
              </p>
            </div>

            {/* 6 large unit links opening in same tab */}
            <div className="unit-grid" style={{ marginBottom: '1.5rem' }}>
              {UNITS.map((unit) => {
                const slug = unit.code.toLowerCase().replace(/[^a-z0-9]/g, '');
                return (
                  <Link
                    key={unit.code}
                    href={`/unit/${slug}`}
                    className="unit-card"
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      minHeight: '5.25rem',
                    }}
                  >
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#1E40AF',
                      fontFamily: 'var(--font-display)',
                    }}>
                      {unit.code}
                    </span>
                    <span style={{
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: '#0F172A',
                      marginTop: '0.25rem',
                      lineHeight: 1.35,
                    }}>
                      {unit.name}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Footer with return to start */}
            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => goToPage(0)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.75rem',
                  color: '#1E40AF',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                &uarr; Back to beginning
              </button>
              <span style={{ fontSize: '0.6875rem', color: '#64748B' }}>
                Plug Wa Notes · SOEN 2.1
              </span>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
