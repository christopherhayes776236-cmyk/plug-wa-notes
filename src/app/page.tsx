'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { UNITS } from '@/lib/data';

const TOTAL_PAGES = 6;

// 15 real extracted slide images from pptx
const SLIDE_IMAGES = Array.from({ length: 15 }, (_, i) => `/media/slides/image${i + 1}.png`);

const SLIDE_TOPICS = [
  'Architectural Blueprint',
  'Anatomy of a Communication System',
  'Transmission Mediums & Topologies',
  'Guided vs Unguided Media',
  'Signal Representation & Spectrum',
  'Bandwidth & Channel Capacity',
  'Digital Modulation Techniques',
  'Multiplexing Strategies (FDM / TDM)',
  'Data Link Framing & Parity',
  'Error Detection & CRC Polynomials',
  'Flow Control & Sliding Windows',
  'Network Protocol Hierarchy',
  'OSI 7-Layer Reference Model',
  'TCP/IP Protocol Suite Comparison',
  'Key Exam Concepts & CAT Summary',
];

export default function HomePage() {
  // Active Theory inspired loading screen
  const [isLoading, setIsLoading] = useState(true);
  const [loadPercent, setLoadPercent] = useState(0);

  // Active fullpage index (0: Welcome, 1: Notes, 2: Video, 3: Audio, 4: Slides, 5: Units)
  const [currentPage, setCurrentPage] = useState(0);
  const isTransitioningRef = useRef(false);

  // Touch gesture coordinates
  const touchStartYRef = useRef(0);

  // Animation trigger key (re-triggers staggered entrance animations on slide change)
  const [animKey, setAnimKey] = useState(0);

  // Page 4: Typewriter text state
  // EXACT REQUIRED TEXT: “Ukisuche kuchaa umbo kaa sharp boy/girl ukisoma text audio overview”
  const audioExactText = "Ukisuche kuchaa umbo kaa sharp boy/girl ukisoma text audio overview";
  const [typedAudioText, setTypedAudioText] = useState("");
  const [typingComplete, setTypingComplete] = useState(false);

  // ─── Real Media Refs & Playback States ────────────────────────
  // Notes scrolling video (Page 2)
  const notesVideoRef = useRef<HTMLVideoElement>(null);
  const [isNotesPlaying, setIsNotesPlaying] = useState(false);

  // Explainer video (Page 3)
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoTime, setVideoTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoMuted, setVideoMuted] = useState(true);

  // Audio player (Page 4)
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioTime, setAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioSpeed, setAudioSpeed] = useState(1);

  // Slides viewer (Page 5)
  const [currentSlide, setCurrentSlide] = useState(0);

  /* ─────────────────────────────────────────────────────────────
     1. Active Theory Minimalist Loader
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
        }, 220);
      }
    }, 25);

    return () => clearInterval(interval);
  }, []);

  /* ─────────────────────────────────────────────────────────────
     2. Page Navigation with Smooth Throttling
  ───────────────────────────────────────────────────────────── */
  const goToPage = useCallback((index: number) => {
    if (index < 0 || index >= TOTAL_PAGES) return;
    if (isTransitioningRef.current) return;

    isTransitioningRef.current = true;
    setCurrentPage(index);
    setAnimKey((k) => k + 1);

    // Pause unselected media to save bandwidth/battery
    if (index !== 1 && notesVideoRef.current) {
      notesVideoRef.current.pause();
      setIsNotesPlaying(false);
    }
    if (index !== 2 && videoRef.current) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
    if (index !== 3 && audioRef.current) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    }

    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 850);
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
     3. Desktop Wheel & Keyboard Handlers
  ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (isLoading) return;

    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      // Allow internal scrolling on unit grid or long content if user is scrolling inside
      if (target.closest('.scroll-container') || target.closest('.unit-grid')) {
        return;
      }

      if (Math.abs(e.deltaY) > 28) {
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
  }, [isLoading, nextPage, prevPage]);

  /* ─────────────────────────────────────────────────────────────
     4. Mobile Touch Gesture Handlers
  ───────────────────────────────────────────────────────────── */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartYRef.current - touchEndY;

    if (Math.abs(deltaY) > 42) {
      if (deltaY > 0) {
        nextPage();
      } else {
        prevPage();
      }
    }
  };

  /* ─────────────────────────────────────────────────────────────
     5. Typewriter Effect for Audio Page (Page 4 / index 3)
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
        }
      }, 34);

      return () => clearInterval(typeTimer);
    }
  }, [currentPage, audioExactText]);

  /* ─────────────────────────────────────────────────────────────
     6. Media Control Helpers
  ───────────────────────────────────────────────────────────── */
  const toggleNotesPlay = () => {
    if (!notesVideoRef.current) return;
    if (notesVideoRef.current.paused) {
      notesVideoRef.current.play();
      setIsNotesPlaying(true);
    } else {
      notesVideoRef.current.pause();
      setIsNotesPlaying(false);
    }
  };

  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsVideoPlaying(true);
    } else {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const toggleAudioPlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsAudioPlaying(true);
    } else {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    }
  };

  const changeAudioSpeed = (speed: number) => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = speed;
    setAudioSpeed(speed);
  };

  const formatSeconds = (sec: number) => {
    if (!sec || isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* ─── 1. Active Theory Minimalist Loader ───────────────────── */}
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
              fontSize: '3.75rem',
              fontWeight: 500,
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em',
              color: '#F8FAFC',
            }}>
              {loadPercent.toString().padStart(2, '0')}%
            </div>
            <div style={{
              width: '13rem',
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
        {/* Global Minimalist Floating Header */}
        <header style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '4.25rem',
          zIndex: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          maxWidth: '1180px',
          margin: '0 auto',
          pointerEvents: 'none',
        }}>
          <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: '1.05rem',
              color: '#0F172A',
              letterSpacing: '-0.01em',
            }}>
              Plug Wa Notes
            </span>
            <span style={{
              fontSize: '0.6875rem',
              fontFamily: 'monospace',
              color: '#475569',
              background: '#F1F5F9',
              padding: '0.125rem 0.45rem',
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
                padding: '0.35rem 0.85rem',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
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
                padding: '0.35rem 0.85rem',
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
            <div className="slide-grid">
              {/* Left Column: Narrative Copy */}
              <div style={{ textAlign: 'left', maxWidth: '640px' }}>
                <span className="anim-stagger-1" style={{
                  display: 'inline-block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#1E40AF',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontFamily: 'monospace',
                }}>
                  Kisii University · SOEN 2.1
                </span>

                <h1 className="anim-stagger-2" style={{
                  fontSize: 'clamp(1.75rem, 3.2vw, 2.5rem)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 500,
                  color: '#0F172A',
                  lineHeight: 1.22,
                  marginTop: '0.85rem',
                  letterSpacing: '-0.015em',
                }}>
                  &ldquo;Welcome to Your Knowledge Bank - where learning is made fun&rdquo;
                </h1>

                <p className="anim-stagger-3" style={{
                  fontSize: '1rem',
                  color: '#475569',
                  marginTop: '1rem',
                  lineHeight: 1.55,
                }}>
                  Get clean lecture notes, explainer video reviews, audio recaps, and exam slides.
                  Built by coursemates, ready in one click.
                </p>

                {/* Formats highlight strip on desktop */}
                <div className="anim-stagger-4" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '0.75rem',
                  marginTop: '1.75rem',
                }}>
                  <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '0.75rem', fontSize: '0.75rem' }}>
                    <div style={{ color: '#1E40AF', fontWeight: 600, fontFamily: 'monospace' }}>01 / NOTES</div>
                    <div style={{ color: '#0F172A', marginTop: '0.25rem', fontWeight: 500 }}>Clean PDF summary</div>
                  </div>
                  <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '0.75rem', fontSize: '0.75rem' }}>
                    <div style={{ color: '#0D9488', fontWeight: 600, fontFamily: 'monospace' }}>02 / VIDEO</div>
                    <div style={{ color: '#0F172A', marginTop: '0.25rem', fontWeight: 500 }}>Visual explainers</div>
                  </div>
                  <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '0.75rem', fontSize: '0.75rem' }}>
                    <div style={{ color: '#1E40AF', fontWeight: 600, fontFamily: 'monospace' }}>03 / AUDIO</div>
                    <div style={{ color: '#0F172A', marginTop: '0.25rem', fontWeight: 500 }}>Commute overview</div>
                  </div>
                  <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '0.75rem', fontSize: '0.75rem' }}>
                    <div style={{ color: '#0D9488', fontWeight: 600, fontFamily: 'monospace' }}>04 / SLIDES</div>
                    <div style={{ color: '#0F172A', marginTop: '0.25rem', fontWeight: 500 }}>Quick revision deck</div>
                  </div>
                </div>
              </div>

              {/* Right Column (Desktop): Interactive Knowledge Hub Stage */}
              <div className="anim-stagger-3" style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0F172A', letterSpacing: '0.04em' }}>
                    CURATED STUDY STACK
                  </span>
                  <span style={{ fontSize: '0.6875rem', fontFamily: 'monospace', color: '#0D9488', fontWeight: 600 }}>
                    ACTIVE SEMESTER 2.1
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.85rem' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1E40AF' }}>
                      6 Core Engineering Units
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>
                      COMP 102, SOEN 201, SOEN 202, SOEN 203, SOEN 220, SOEN 240
                    </div>
                  </div>

                  <div style={{ background: '#F0FDFA', border: '1px solid #CCFBF1', padding: '0.85rem' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0D9488' }}>
                      Zero Account Friction
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>
                      One-tap M-Pesa STK push. Direct instant download to phone or laptop.
                    </div>
                  </div>

                  <div style={{ background: '#EFF6FF', border: '1px solid #DBEAFE', padding: '0.85rem' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1E40AF' }}>
                      PWA Offline Ready
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>
                      Install on your home screen. Study offline without burning bundles.
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.6875rem', color: '#94A3B8', fontFamily: 'monospace', textAlign: 'right', marginTop: '0.25rem' }}>
                  Ready to preview formats &rarr;
                </div>
              </div>
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
                  padding: '0.65rem 1.35rem',
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
              PAGE 2 – Notes (Real scrolling lecture video preview)
          ═══════════════════════════════════════════════════════════ */}
          <section className="fullpage-slide" key={`slide-1-${animKey}`}>
            <div className="slide-grid">
              {/* Left Column: Heading & Notes Specs */}
              <div>
                <span className="anim-stagger-1" style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#1E40AF', fontWeight: 600 }}>
                  02 / NOTES FORMAT
                </span>
                <h2 className="anim-stagger-2" style={{
                  fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 500,
                  color: '#1E40AF',
                  lineHeight: 1.28,
                  marginTop: '0.5rem',
                }}>
                  &ldquo;Feeling behind in class? No stress - Pata notes hapa.&rdquo;
                </h2>

                <p className="anim-stagger-3" style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.75rem', lineHeight: 1.5 }}>
                  Clean, structured lecture transcripts with worked CAT problems and formulas.
                  Directly based on university syllabus and class presentations.
                </p>

                <div className="anim-stagger-4" style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#0F172A' }}>
                    <span style={{ color: '#1E40AF', fontWeight: 600 }}>✓</span>
                    <span>High-contrast, mobile-friendly readable layout</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#0F172A' }}>
                    <span style={{ color: '#1E40AF', fontWeight: 600 }}>✓</span>
                    <span>Direct exam definitions &amp; theorem proofs</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#0F172A' }}>
                    <span style={{ color: '#1E40AF', fontWeight: 600 }}>✓</span>
                    <span>Immediate download via M-Pesa (KSH 1 per unit)</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Real Notes Scrolling Video Player */}
              <div className="anim-stagger-3" style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                padding: '0.875rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isNotesPlaying ? '#10B981' : '#94A3B8' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0F172A' }}>
                      SOEN 220 · Notes Scroll Preview
                    </span>
                  </div>
                  <button
                    onClick={toggleNotesPlay}
                    style={{
                      fontSize: '0.6875rem',
                      color: '#1E40AF',
                      background: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      padding: '0.2rem 0.5rem',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    {isNotesPlaying ? 'Pause Video' : 'Play Video'}
                  </button>
                </div>

                {/* Video Stage with actual /media/notes-overview.mp4 */}
                <div
                  onClick={toggleNotesPlay}
                  style={{
                    position: 'relative',
                    aspectRatio: '16/9',
                    backgroundColor: '#0F172A',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <video
                    ref={notesVideoRef}
                    src="/media/notes-overview.mp4"
                    loop
                    muted
                    playsInline
                    onPlay={() => setIsNotesPlaying(true)}
                    onPause={() => setIsNotesPlaying(false)}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />

                  {/* Play Overlay when paused */}
                  {!isNotesPlaying && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(15, 23, 42, 0.45)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}>
                      <div style={{
                        width: '3rem',
                        height: '3rem',
                        borderRadius: '50%',
                        backgroundColor: '#1E40AF',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        paddingLeft: '2px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      }}>
                        ▶
                      </div>
                      <span style={{ fontSize: '0.6875rem', color: '#F8FAFC', letterSpacing: '0.04em', fontFamily: 'monospace' }}>
                        TAP TO PREVIEW REAL NOTES
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#64748B', marginTop: '0.625rem' }}>
                  <span>Real lecture scroll recording</span>
                  <span style={{ color: '#1E40AF', fontWeight: 500 }}>Full 12-page PDF pack ready</span>
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
                  padding: '0.65rem 1.35rem',
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
              PAGE 3 – Video Review (Real Explainer Video)
          ═══════════════════════════════════════════════════════════ */}
          <section className="fullpage-slide" key={`slide-2-${animKey}`}>
            <div className="slide-grid">
              {/* Left Column: Heading & Video Breakdown */}
              <div>
                <span className="anim-stagger-1" style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#0D9488', fontWeight: 600 }}>
                  03 / VIDEO REVIEW FORMAT
                </span>
                <h2 className="anim-stagger-2" style={{
                  fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 500,
                  color: '#0D9488',
                  lineHeight: 1.28,
                  marginTop: '0.5rem',
                }}>
                  &ldquo;Some units just make more sense after - Pata video review hapa ndani.&rdquo;
                </h2>

                <p className="anim-stagger-3" style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.75rem', lineHeight: 1.5 }}>
                  Step-by-step visual explanations of abstract topics. Stop reading the same paragraph 5 times — watch it decoded clearly.
                </p>

                <div className="anim-stagger-4" style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.625rem 0.75rem', fontSize: '0.75rem' }}>
                    <div style={{ color: '#0D9488', fontWeight: 600 }}>Chapter 1 · Protocol Architecture</div>
                    <div style={{ color: '#64748B', marginTop: '0.15rem' }}>Visual breakdown of sender/receiver timing and packet models</div>
                  </div>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.625rem 0.75rem', fontSize: '0.75rem' }}>
                    <div style={{ color: '#0D9488', fontWeight: 600 }}>Chapter 2 · Signal Encoding &amp; Bandwidth</div>
                    <div style={{ color: '#64748B', marginTop: '0.15rem' }}>Nyquist theorem &amp; Shannon capacity step-by-step calculations</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Real Explainer Video Player */}
              <div className="anim-stagger-3" style={{
                background: '#0F172A',
                color: '#FFFFFF',
                border: '1px solid #334155',
                padding: '0.875rem',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.6875rem', fontFamily: 'monospace', color: '#0D9488', fontWeight: 600 }}>
                      1080P EXPLAINER REVIEW
                    </span>
                    <span style={{ fontSize: '0.625rem', color: '#94A3B8', border: '1px solid #475569', padding: '0.05rem 0.35rem' }}>
                      HD
                    </span>
                  </div>

                  <button
                    onClick={() => setVideoMuted(!videoMuted)}
                    style={{
                      fontSize: '0.6875rem',
                      background: 'rgba(255,255,255,0.1)',
                      color: '#F8FAFC',
                      border: 'none',
                      padding: '0.2rem 0.5rem',
                      cursor: 'pointer',
                    }}
                  >
                    {videoMuted ? 'Unmute' : 'Mute'}
                  </button>
                </div>

                {/* Video Player Element */}
                <div
                  onClick={toggleVideoPlay}
                  style={{
                    position: 'relative',
                    aspectRatio: '16/9',
                    backgroundColor: '#1E293B',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <video
                    ref={videoRef}
                    src="/media/video-overview.mp4"
                    playsInline
                    muted={videoMuted}
                    onPlay={() => setIsVideoPlaying(true)}
                    onPause={() => setIsVideoPlaying(false)}
                    onTimeUpdate={() => {
                      if (videoRef.current) {
                        setVideoTime(videoRef.current.currentTime);
                        setVideoDuration(videoRef.current.duration || 0);
                      }
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />

                  {/* Play Overlay Button */}
                  {!isVideoPlaying && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(15, 23, 42, 0.45)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}>
                      <div style={{
                        width: '3.25rem',
                        height: '3.25rem',
                        borderRadius: '50%',
                        backgroundColor: '#0D9488',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        paddingLeft: '3px',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                      }}>
                        ▶
                      </div>
                      <span style={{ fontSize: '0.6875rem', color: '#F8FAFC', letterSpacing: '0.05em', fontFamily: 'monospace' }}>
                        PLAY VIDEO EXPLAINER
                      </span>
                    </div>
                  )}
                </div>

                {/* Timeline Scrubber & Stats */}
                <div style={{ marginTop: '0.75rem' }}>
                  <div
                    onClick={(e) => {
                      if (!videoRef.current || !videoDuration) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickPos = (e.clientX - rect.left) / rect.width;
                      videoRef.current.currentTime = clickPos * videoDuration;
                    }}
                    style={{ width: '100%', height: '5px', backgroundColor: 'rgba(255,255,255,0.2)', cursor: 'pointer', position: 'relative' }}
                  >
                    <div style={{
                      height: '100%',
                      width: `${videoDuration ? (videoTime / videoDuration) * 100 : 0}%`,
                      backgroundColor: '#0D9488',
                    }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontFamily: 'monospace', color: '#94A3B8', marginTop: '0.5rem' }}>
                    <span>{formatSeconds(videoTime)} / {formatSeconds(videoDuration)}</span>
                    <span>KSH 5 with video pack</span>
                  </div>
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
                  padding: '0.65rem 1.35rem',
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
              PAGE 4 – Audio (Typewriter Headline + Real Audio Player)
          ═══════════════════════════════════════════════════════════ */}
          <section className="fullpage-slide" key={`slide-3-${animKey}`}>
            <div className="slide-grid">
              {/* Left Column: Precise Typewriter Headline & Concept */}
              <div>
                <span className="anim-stagger-1" style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#1E40AF', fontWeight: 600 }}>
                  04 / AUDIO OVERVIEW FORMAT
                </span>

                <h2 style={{
                  fontSize: 'clamp(1.25rem, 2.2vw, 1.7rem)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 500,
                  color: '#1E40AF',
                  lineHeight: 1.35,
                  marginTop: '0.5rem',
                  minHeight: '4.5rem',
                }}>
                  &ldquo;{typedAudioText}&rdquo;
                  {!typingComplete && <span className="typewriter-cursor" />}
                </h2>

                <p className="anim-stagger-3" style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.75rem', lineHeight: 1.5 }}>
                  Listen while walking to class, cooking, or resting. A natural, high-yield audio recap that sticks in your memory effortlessly.
                </p>

                <div className="anim-stagger-4" style={{
                  marginTop: '1.25rem',
                  padding: '0.75rem',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  fontSize: '0.75rem',
                  color: '#475569',
                }}>
                  <div style={{ fontWeight: 600, color: '#0F172A', marginBottom: '0.25rem' }}>
                    What you hear in the audio overview:
                  </div>
                  <div>• Plain English summaries of complex engineering terms</div>
                  <div>• Exam pitfalls and frequent misconceptions</div>
                  <div>• How to structure 10-mark essay answers</div>
                </div>
              </div>

              {/* Right Column: Real Audio Station */}
              <div className="anim-stagger-3" style={{
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                padding: '1.25rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1E40AF' }}>
                      SOEN 220 · Audio Recap Player
                    </span>
                    <div style={{ fontSize: '0.6875rem', color: '#64748B', marginTop: '0.15rem' }}>
                      The engineering behind every data packet
                    </div>
                  </div>

                  {/* Playback speed selector */}
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {[1, 1.25, 1.5].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => changeAudioSpeed(spd)}
                        style={{
                          fontSize: '0.625rem',
                          fontFamily: 'monospace',
                          padding: '0.15rem 0.35rem',
                          background: audioSpeed === spd ? '#1E40AF' : '#FFFFFF',
                          color: audioSpeed === spd ? '#FFFFFF' : '#1E40AF',
                          border: '1px solid #BFDBFE',
                          cursor: 'pointer',
                        }}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Real HTML5 Audio Element */}
                <audio
                  ref={audioRef}
                  src="/media/audio-overview.m4a"
                  preload="metadata"
                  onPlay={() => setIsAudioPlaying(true)}
                  onPause={() => setIsAudioPlaying(false)}
                  onTimeUpdate={() => {
                    if (audioRef.current) {
                      setAudioTime(audioRef.current.currentTime);
                      setAudioDuration(audioRef.current.duration || 0);
                    }
                  }}
                />

                {/* Animated Equalizer Visualizer */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  height: '4.25rem',
                  padding: '0.5rem 0',
                }}>
                  {[18, 36, 48, 28, 42, 54, 32, 46, 22, 38, 50, 26, 40, 24, 36, 48, 20, 32].map((h, i) => (
                    <div
                      key={i}
                      className={`eq-bar ${isAudioPlaying ? 'playing' : 'paused'}`}
                      style={{
                        '--eq-h': `${Math.max(8, (h * 1.25) % 48 + 6)}px`,
                        '--eq-dur': `${0.45 + (i % 5) * 0.08}s`,
                        animationDelay: isAudioPlaying ? `${(i % 7) * 0.05}s` : '0s',
                      } as React.CSSProperties}
                    />
                  ))}
                </div>

                {/* Scrubber Bar */}
                <div style={{ marginTop: '0.75rem' }}>
                  <div
                    onClick={(e) => {
                      if (!audioRef.current || !audioDuration) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickPos = (e.clientX - rect.left) / rect.width;
                      audioRef.current.currentTime = clickPos * audioDuration;
                    }}
                    style={{ width: '100%', height: '6px', backgroundColor: '#DBEAFE', cursor: 'pointer', position: 'relative' }}
                  >
                    <div style={{
                      height: '100%',
                      width: `${audioDuration ? (audioTime / audioDuration) * 100 : 0}%`,
                      backgroundColor: '#1E40AF',
                    }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', fontFamily: 'monospace', color: '#475569', marginTop: '0.5rem' }}>
                    <span>{formatSeconds(audioTime)}</span>
                    <span>{formatSeconds(audioDuration || 480)}</span>
                  </div>
                </div>

                {/* Central Play/Pause button */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.75rem' }}>
                  <button
                    onClick={toggleAudioPlay}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1.25rem',
                      backgroundColor: '#1E40AF',
                      color: '#FFFFFF',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{isAudioPlaying ? '❚❚ Pause Audio' : '▶ Play Audio Overview'}</span>
                  </button>
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
                  padding: '0.65rem 1.35rem',
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
              PAGE 5 – Slides (Real High-Res Slide Deck Carousel)
          ═══════════════════════════════════════════════════════════ */}
          <section className="fullpage-slide" key={`slide-4-${animKey}`}>
            <div className="slide-grid">
              {/* Left Column: Heading & Exam Strategy */}
              <div>
                <span className="anim-stagger-1" style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#0D9488', fontWeight: 600 }}>
                  05 / EXAM SLIDES FORMAT
                </span>
                <h2 className="anim-stagger-2" style={{
                  fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 500,
                  color: '#0D9488',
                  lineHeight: 1.28,
                  marginTop: '0.5rem',
                }}>
                  &ldquo;Need a short version before cats or exams? Pata slides hapa.&rdquo;
                </h2>

                <p className="anim-stagger-3" style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.75rem', lineHeight: 1.5 }}>
                  High-yield summary decks that condense weeks of lectures into fast visual cards.
                  Review the full unit in 15 minutes before walking into the exam room.
                </p>

                <div className="anim-stagger-4" style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ background: '#F0FDFA', border: '1px solid #99F6E4', padding: '0.75rem', fontSize: '0.75rem' }}>
                    <div style={{ color: '#0D9488', fontWeight: 600 }}>Currently viewing slide {currentSlide + 1} of {SLIDE_IMAGES.length}:</div>
                    <div style={{ color: '#0F172A', marginTop: '0.25rem', fontWeight: 500 }}>
                      {SLIDE_TOPICS[currentSlide] || 'Unit Review Concept'}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Use the arrows or thumbnail strip on the right to flip through real course slides.
                  </div>
                </div>
              </div>

              {/* Right Column: Real Slide Deck Stage */}
              <div className="anim-stagger-3" style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                padding: '0.875rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0D9488' }}>
                    SOEN 220 Slide Deck
                  </span>
                  <span style={{ fontSize: '0.6875rem', fontFamily: 'monospace', color: '#0D9488', fontWeight: 600 }}>
                    Slide {currentSlide + 1} / {SLIDE_IMAGES.length}
                  </span>
                </div>

                {/* Slide Image Viewer Canvas */}
                <div style={{
                  position: 'relative',
                  aspectRatio: '16/9',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <img
                    src={SLIDE_IMAGES[currentSlide]}
                    alt={`Slide ${currentSlide + 1} - ${SLIDE_TOPICS[currentSlide]}`}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />

                  {/* Previous Arrow */}
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev > 0 ? prev - 1 : SLIDE_IMAGES.length - 1))}
                    aria-label="Previous slide"
                    style={{
                      position: 'absolute',
                      left: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '2rem',
                      height: '2rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #E2E8F0',
                      color: '#0F172A',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    ‹
                  </button>

                  {/* Next Arrow */}
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev < SLIDE_IMAGES.length - 1 ? prev + 1 : 0))}
                    aria-label="Next slide"
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '2rem',
                      height: '2rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #E2E8F0',
                      color: '#0F172A',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    ›
                  </button>
                </div>

                {/* Thumbnails Strip */}
                <div style={{
                  display: 'flex',
                  gap: '0.35rem',
                  overflowX: 'auto',
                  marginTop: '0.625rem',
                  paddingBottom: '0.25rem',
                }}>
                  {SLIDE_IMAGES.slice(0, 8).map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      style={{
                        width: '2.5rem',
                        height: '1.5rem',
                        flexShrink: 0,
                        border: currentSlide === i ? '2px solid #0D9488' : '1px solid #E2E8F0',
                        overflow: 'hidden',
                        padding: 0,
                        cursor: 'pointer',
                        background: '#F1F5F9',
                      }}
                    >
                      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.625rem', color: '#64748B', paddingLeft: '0.25rem' }}>
                    +{SLIDE_IMAGES.length - 8} more
                  </div>
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
                  padding: '0.65rem 1.35rem',
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
              PAGE 6 – Pick your unit (Full-width 6-unit grid)
          ═══════════════════════════════════════════════════════════ */}
          <section className="fullpage-slide" key={`slide-5-${animKey}`}>
            <div style={{ marginBottom: '1.25rem' }}>
              <span className="anim-stagger-1" style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#1E40AF', fontWeight: 600 }}>
                06 / SELECT COURSE UNIT
              </span>
              <h2 className="anim-stagger-2" style={{
                fontSize: 'clamp(1.5rem, 2.8vw, 2.1rem)',
                fontFamily: 'var(--font-display)',
                fontWeight: 500,
                color: '#0F172A',
                marginTop: '0.35rem',
              }}>
                Pick your unit
              </h2>
              <p className="anim-stagger-3" style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.25rem' }}>
                Direct access to notes, explainer video, audio recap, and slide packs.
              </p>
            </div>

            {/* 6 Unit Cards: 3-column on desktop, 2-column on mobile */}
            <div className="unit-grid anim-stagger-3" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '0.875rem',
              marginBottom: '1.5rem',
            }}>
              {UNITS.map((unit) => {
                const slug = unit.code.toLowerCase().replace(/\s+/g, '');
                return (
                  <Link
                    key={unit.code}
                    href={`/unit/${slug}`}
                    className="unit-card"
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      padding: '1.125rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '6.5rem',
                      textDecoration: 'none',
                      transition: 'border-color 0.15s ease, transform 0.15s ease',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '0.9375rem',
                          fontWeight: 600,
                          color: '#1E40AF',
                          fontFamily: 'var(--font-display)',
                        }}>
                          {unit.code}
                        </span>
                        <span style={{ fontSize: '0.6875rem', color: '#0D9488', fontWeight: 600, fontFamily: 'monospace' }}>
                          KSH 1 - 10
                        </span>
                      </div>

                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#0F172A',
                        marginTop: '0.35rem',
                        lineHeight: 1.35,
                      }}>
                        {unit.name}
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '0.75rem',
                      borderTop: '1px solid #F1F5F9',
                      paddingTop: '0.5rem',
                      fontSize: '0.6875rem',
                      color: '#64748B',
                    }}>
                      <span>{unit.lecturer}</span>
                      <span style={{ color: '#1E40AF', fontWeight: 500 }}>Open Unit &rarr;</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Bottom bar */}
            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1.125rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => goToPage(0)}
                style={{ background: 'none', border: 'none', fontSize: '0.8125rem', color: '#1E40AF', cursor: 'pointer', fontWeight: 500 }}
              >
                &uarr; Back to beginning
              </button>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                Plug Wa Notes · SOEN 2.1
              </span>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
