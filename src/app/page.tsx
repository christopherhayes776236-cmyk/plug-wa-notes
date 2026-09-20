'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion, TargetAndTransition } from 'framer-motion';
import Link from 'next/link';
import { UNITS } from '@/lib/data';

const TOTAL_PAGES = 6;

// 15 extracted slide images
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

/* ─── Motion variants per section ──────────────────────────────
   Notes  → text enters from bottom  (up)
   Video  → text enters from left
   Audio  → typewriter (handled inline)
   Slides → text enters from top (down)
   Media  → always drops in from top-right feel
──────────────────────────────────────────────────────────────── */
const textVariants: Record<number, { initial: TargetAndTransition; animate: TargetAndTransition; exit: TargetAndTransition }> = {
  1: {
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0, x: 0 },
    exit:    { opacity: 0, y: -20 },
  },
  2: {
    initial: { opacity: 0, x: -28 },
    animate: { opacity: 1, y: 0, x: 0 },
    exit:    { opacity: 0, x: -20 },
  },
  3: {
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0, x: 0 },
    exit:    { opacity: 0, y: -20 },
  },
  4: {
    initial: { opacity: 0, y: -24 },
    animate: { opacity: 1, y: 0, x: 0 },
    exit:    { opacity: 0, y: 20 },
  },
};

const mediaVariants = {
  enter: { opacity: [0, 1], y: [-24, 0] },
  exit:  { opacity: [1, 0], y: [0, 20] },
};

const springTransition = { duration: 0.52, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] };
const exitTransition   = { duration: 0.38, ease: [0.4, 0, 1, 1] as [number, number, number, number] };

export default function HomePage() {
  // ─── 1. Loader ────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);
  const [loadPercent, setLoadPercent] = useState(0);

  // Active fullpage index (0: Welcome, 1: Notes, 2: Video, 3: Audio, 4: Slides, 5: Units)
  const [currentPage, setCurrentPage] = useState(0);
  const isTransitioningRef = useRef(false);

  // Touch gesture coordinates
  const touchStartYRef = useRef(0);

  // Animation key to re-trigger entrance transitions
  const [animKey, setAnimKey] = useState(0);

  // ─── 2. Phase per section: 'text' | 'media' ─────────────────
  const [stagePhase, setStagePhase] = useState<'text' | 'media'>('text');

  // Audio typewriter
  const audioExactText = "Usiache kuosha viombo iku prevent from catching up, kua sharp boy/girl skiza audio overview";
  const [typedAudioText, setTypedAudioText] = useState(audioExactText);
  const [typingComplete, setTypingComplete] = useState(false);

  // ─── 3. Media Refs ────────────────────────────────────────────
  const notesVideoRef = useRef<HTMLVideoElement>(null);
  const [isNotesPlaying, setIsNotesPlaying] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoTime, setVideoTime] = useState(0);
  const [videoMuted, setVideoMuted] = useState(false);
  const [videoTeaserLocked, setVideoTeaserLocked] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioTime, setAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioSpeed, setAudioSpeed] = useState(1);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideTeaserLockedNotice, setSlideTeaserLockedNotice] = useState(false);

  /* ─────────────────────────────────────────────────────────────
     Loader
  ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    const startTime = performance.now();
    const duration = 13000; // 13 seconds cramming animation
    let rafId: number;

    const updateProgress = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setLoadPercent(Math.round(progress * 100));

      if (progress < 1) {
        rafId = requestAnimationFrame(updateProgress);
      } else {
        setTimeout(() => setIsLoading(false), 350);
      }
    };
    rafId = requestAnimationFrame(updateProgress);

    const safetyCap = setTimeout(() => setIsLoading(false), 13600);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(safetyCap);
    };
  }, []);

  /* ─────────────────────────────────────────────────────────────
     Page Navigation Engine
  ───────────────────────────────────────────────────────────── */
  const goToPage = useCallback((index: number) => {
    if (index < 0 || index >= TOTAL_PAGES) return;
    if (isTransitioningRef.current) return;

    isTransitioningRef.current = true;
    setCurrentPage(index);
    setAnimKey((k) => k + 1);
    setStagePhase('text');
    setSlideTeaserLockedNotice(false);

    // Pause unselected media
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
    }, 650);
  }, []);

  const nextPage = useCallback(() => {
    if (currentPage < TOTAL_PAGES - 1) goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 0) goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  /* ─────────────────────────────────────────────────────────────
     Text phase choreography — starts on each page arrival
     Notes / Video / Slides: auto-advance text → media after 1.8s
     Audio: typewriter, then reveal media
     Welcome / Units: stay in text phase
  ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (currentPage === 1 || currentPage === 2 || currentPage === 4) {
      setStagePhase('text');
      const timer = setTimeout(() => setStagePhase('media'), 1800);
      return () => clearTimeout(timer);
    }

    if (currentPage === 3) {
      setStagePhase('text');
      setTypedAudioText('');
      setTypingComplete(false);

      let idx = 0;
      const typeTimer = setInterval(() => {
        idx++;
        setTypedAudioText(audioExactText.slice(0, idx));
        if (idx >= audioExactText.length) {
          clearInterval(typeTimer);
          setTypingComplete(true);
          setTimeout(() => setStagePhase('media'), 1400);
        }
      }, 26);

      return () => clearInterval(typeTimer);
    }

    setStagePhase('text');
  }, [currentPage, animKey]);

  /* ─────────────────────────────────────────────────────────────
     Auto-play media when phase switches to 'media'
  ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (stagePhase !== 'media') return;

    // Notes: auto-play looping scroll video
    if (currentPage === 1 && notesVideoRef.current) {
      notesVideoRef.current.currentTime = 0;
      notesVideoRef.current.play().catch(() => {});
    }

    // Video: auto-play 8s teaser
    if (currentPage === 2 && videoRef.current) {
      videoRef.current.currentTime = 0;
      setVideoTeaserLocked(false);
      videoRef.current.play().catch(() => {});
    }

    // Audio: auto-play highlight
    if (currentPage === 3 && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, [stagePhase, currentPage]);

  /* ─────────────────────────────────────────────────────────────
     Desktop Wheel & Keyboard Handlers
  ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (isLoading) return;

    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.scroll-container') || target.closest('.unit-grid')) return;
      if (Math.abs(e.deltaY) > 28) {
        e.deltaY > 0 ? nextPage() : prevPage();
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
     Mobile Touch Handlers
  ───────────────────────────────────────────────────────────── */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = touchStartYRef.current - e.changedTouches[0].clientY;
    if (Math.abs(deltaY) > 42) deltaY > 0 ? nextPage() : prevPage();
  };

  /* ─────────────────────────────────────────────────────────────
     Media Handlers
  ───────────────────────────────────────────────────────────── */
  const toggleNotesPlay = () => {
    if (!notesVideoRef.current) return;
    notesVideoRef.current.paused
      ? notesVideoRef.current.play()
      : notesVideoRef.current.pause();
  };

  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (videoTeaserLocked) {
      videoRef.current.currentTime = 0;
      setVideoTeaserLocked(false);
      videoRef.current.play();
      return;
    }
    videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
  };

  const toggleAudioPlay = () => {
    if (!audioRef.current) return;
    audioRef.current.paused ? audioRef.current.play() : audioRef.current.pause();
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

  /* ─────────────────────────────────────────────────────────────
     Framer Motion wrappers for text ↔ media phases
  ───────────────────────────────────────────────────────────── */
  const TextPhase = ({ children, pageIdx }: { children: React.ReactNode; pageIdx: number }) => {
    const vars = textVariants[pageIdx] || textVariants[1];
    return (
      <motion.div
        key="text-phase"
        initial={vars.initial}
        animate={vars.animate}
        exit={vars.exit}
        transition={springTransition}
        style={{ width: '100%', maxWidth: '780px', margin: '0 auto', textAlign: 'center', padding: '1.5rem 1rem' }}
      >
        {children}
      </motion.div>
    );
  };

  const MediaPhase = ({ children }: { children: React.ReactNode }) => (
    <motion.div
      key="media-phase"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={springTransition}
      style={{
        width: '92vw',
        maxWidth: '480px',
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        margin: '0 auto',
        position: 'relative',
      }}
    >
      {children}
    </motion.div>
  );

  return (
    <>
      {/* ─── Loader with Cramming GIF (13s duration) ──────────────── */}
      {isLoading && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          backgroundColor: '#F6F4EF', color: '#23211E',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem',
          transition: 'opacity 0.35s ease',
        }}>
          {/* Study / Cramming GIF Container */}
          <div style={{
            width: 'min(88vw, 320px)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 12px 32px -4px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            backgroundColor: '#000',
            marginBottom: '1.25rem',
          }}>
            <img
              src="https://res.cloudinary.com/nd4ofxfu/image/upload/v1789866745/plug-wa-notes/kid-study.gif"
              alt="Content loading..."
              loading="eager"
              decoding="async"
              onError={(e) => {
                // Fallback to local asset if Cloudinary fails
                (e.target as HTMLImageElement).src = '/media/kid-study.gif';
              }}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                aspectRatio: '4 / 3',
                objectFit: 'cover',
              }}
            />
          </div>

          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.35rem', color: '#0F172A', letterSpacing: '-0.02em', textAlign: 'center' }}>
            Plug Wa Notes
          </div>

          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: '#64748B', marginTop: '0.25rem', textAlign: 'center' }}>
            Content loading...
          </div>

          {/* Numerical Progress */}
          <div style={{ fontFamily: 'var(--font-body)', fontVariantNumeric: 'tabular-nums', fontWeight: 600, fontSize: '0.9375rem', color: '#1E40AF', marginTop: '0.75rem' }}>
            {loadPercent}%
          </div>

          {/* Progress Bar */}
          <div style={{ width: 'min(80vw, 240px)', height: '4px', backgroundColor: '#E2E8F0', marginTop: '0.625rem', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ width: `${loadPercent}%`, height: '100%', backgroundColor: '#1E40AF', borderRadius: '999px', transition: 'width 0.1s linear' }} />
          </div>
        </div>
      )}

      {/* ─── Full-Page Container ──────────────────────────────────── */}
      <div className="fullpage-wrapper" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>

        {/* Floating Minimalist Header */}
        <header style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '4.25rem', zIndex: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.5rem', maxWidth: '1180px', margin: '0 auto', pointerEvents: 'none',
        }}>
          <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.05rem', color: '#0F172A', letterSpacing: '-0.01em' }}>
              Plug Wa Notes
            </span>
            <span style={{
              fontSize: '0.6875rem', fontFamily: 'monospace', color: '#475569',
              background: '#F1F5F9', padding: '0.125rem 0.45rem', border: '1px solid #E2E8F0',
            }}>
              0{currentPage + 1} / 0{TOTAL_PAGES}
            </span>
          </div>

          {currentPage < TOTAL_PAGES - 1 ? (
            <button
              onClick={() => goToPage(5)}
              style={{
                pointerEvents: 'auto', fontSize: '0.75rem', fontWeight: 500,
                color: '#1E40AF', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE',
                padding: '0.35rem 0.85rem', cursor: 'pointer', transition: 'background-color 0.15s ease',
              }}
            >
              Units ↓
            </button>
          ) : (
            <button
              onClick={() => goToPage(0)}
              style={{
                pointerEvents: 'auto', fontSize: '0.75rem', fontWeight: 500,
                color: '#475569', backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0',
                padding: '0.35rem 0.85rem', cursor: 'pointer',
              }}
            >
              ↑ Top
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

        {/* ─── Animated Vertical Track ─────────────────────────────── */}
        <div className="fullpage-track" style={{ transform: `translate3d(0, -${currentPage * 100}%, 0)` }}>

          {/* ═══════════════════════════════════════════════════════
              PAGE 1 – Welcome
          ═══════════════════════════════════════════════════════ */}
          <section className="fullpage-slide" key={`slide-0-${animKey}`}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '960px', margin: '0 auto', width: '100%' }}>
              <h1 className="anim-fade-in" style={{
                fontSize: 'clamp(2rem, 4.2vw, 3.25rem)',
                fontFamily: 'var(--font-display)', fontWeight: 500, color: '#0F172A',
                lineHeight: 1.18, letterSpacing: '-0.02em', maxWidth: '820px',
              }}>
                &ldquo;Welcome to Your Knowledge Bank - where learning is made fun&rdquo;
              </h1>

              <div className="anim-fade-in" style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: '1rem', marginTop: '2.5rem',
              }}>
                {[
                  { idx: 1, label: '01 / NOTES', title: 'Clean Lecture Notes', sub: 'Page 1 scroll preview →', color: '#1E40AF' },
                  { idx: 2, label: '02 / VIDEO', title: 'Explainer Review', sub: 'Visual chapter teaser →', color: '#0D9488' },
                  { idx: 3, label: '03 / AUDIO', title: 'Audio Overview', sub: '20s highlight player →', color: '#1E40AF' },
                  { idx: 4, label: '04 / SLIDES', title: 'Exam Revision Deck', sub: 'Quick slide flip →', color: '#0D9488' },
                ].map(({ idx, label, title, sub, color }) => (
                  <button
                    key={idx}
                    onClick={() => goToPage(idx)}
                    style={{
                      background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '1.25rem',
                      textAlign: 'left', cursor: 'pointer', transition: 'border-color 0.15s ease, transform 0.15s ease',
                    }}
                  >
                    <div style={{ color, fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8125rem' }}>{label}</div>
                    <div style={{ color: '#0F172A', marginTop: '0.35rem', fontWeight: 600, fontSize: '0.9375rem' }}>{title}</div>
                    <div style={{ color: '#64748B', fontSize: '0.75rem', marginTop: '0.25rem' }}>{sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Swipe up or scroll to start</span>
              <button
                onClick={nextPage}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.65rem 1.35rem', backgroundColor: '#1E40AF', color: '#FFFFFF',
                  fontSize: '0.8125rem', fontWeight: 500, border: 'none', cursor: 'pointer',
                }}
              >
                <span>Pata Notes</span><span>↓</span>
              </button>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════
              PAGE 2 – Notes
          ═══════════════════════════════════════════════════════ */}
          <section className="fullpage-slide" key={`slide-1-${animKey}`}>
            <div className="choreography-stage">
              <AnimatePresence mode="wait">
                {stagePhase === 'text' ? (
                  <TextPhase key="notes-text" pageIdx={1}>
                    <h2 style={{
                      fontSize: 'clamp(1.75rem, 3.6vw, 2.75rem)',
                      fontFamily: 'var(--font-display)', fontWeight: 500, color: '#1E40AF', lineHeight: 1.22,
                    }}>
                      &ldquo;Feeling behind in class? No stress - Pata notes hapa.&rdquo;
                    </h2>
                    <button
                      onClick={() => setStagePhase('media')}
                      style={{ marginTop: '1.25rem', background: 'none', border: 'none', color: '#64748B', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Skip to preview →
                    </button>
                  </TextPhase>
                ) : (
                  <MediaPhase key="notes-media">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span className="teaser-pill teaser-pill-blue">Page 1 of 12 — full pack via download</span>
                      <button onClick={() => setStagePhase('text')} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.75rem', cursor: 'pointer' }}>
                        ← back
                      </button>
                    </div>

                    <div
                      className="dominant-player-box dominant-player-light"
                      onClick={toggleNotesPlay}
                      style={{ aspectRatio: '16/10', maxHeight: '62vh', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <video
                        ref={notesVideoRef}
                        src="/media/notes-overview.mp4"
                        loop
                        muted
                        playsInline
                        onPlay={() => setIsNotesPlaying(true)}
                        onPause={() => setIsNotesPlaying(false)}
                        onEnded={nextPage}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                      {!isNotesPlaying && (
                        <div style={{
                          position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.45)',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        }}>
                          <div style={{
                            width: '3.5rem', height: '3.5rem', borderRadius: '50%', backgroundColor: '#1E40AF',
                            color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.35rem', paddingLeft: '3px', boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
                          }}>▶</div>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', fontSize: '0.75rem', color: '#64748B' }}>
                      <span>Real lecture scroll recording</span>
                      <button onClick={() => goToPage(5)} style={{ color: '#1E40AF', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                        Get Full Unit Pack →
                      </button>
                    </div>
                  </MediaPhase>
                )}
              </AnimatePresence>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
              <button onClick={prevPage} style={{ background: 'none', border: 'none', fontSize: '0.8125rem', color: '#64748B', cursor: 'pointer' }}>↑</button>
              <button onClick={nextPage} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.35rem',
                backgroundColor: '#0D9488', color: '#FFFFFF', fontSize: '0.8125rem', fontWeight: 500, border: 'none', cursor: 'pointer',
              }}>↓</button>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════
              PAGE 3 – Video Review (8s Teaser Cap)
          ═══════════════════════════════════════════════════════ */}
          <section className="fullpage-slide" key={`slide-2-${animKey}`}>
            <div className="choreography-stage">
              <AnimatePresence mode="wait">
                {stagePhase === 'text' ? (
                  <TextPhase key="video-text" pageIdx={2}>
                    <h2 style={{
                      fontSize: 'clamp(1.75rem, 3.6vw, 2.75rem)',
                      fontFamily: 'var(--font-display)', fontWeight: 500, color: '#0D9488', lineHeight: 1.22,
                    }}>
                      &ldquo;Some units just make more sense in visuals - Pata video review hapa ndani.&rdquo;
                    </h2>
                    <button
                      onClick={() => setStagePhase('media')}
                      style={{ marginTop: '1.25rem', background: 'none', border: 'none', color: '#64748B', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Skip to preview →
                    </button>
                  </TextPhase>
                ) : (
                  <MediaPhase key="video-media">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span className="teaser-pill teaser-pill-teal">8-Second Teaser Preview</span>
                      <button onClick={() => setStagePhase('text')} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.75rem', cursor: 'pointer' }}>
                        ← back
                      </button>
                    </div>

                    <div
                      className="dominant-player-box"
                      onClick={toggleVideoPlay}
                      style={{ aspectRatio: '16/9', maxHeight: '62vh', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <video
                        ref={videoRef}
                        src="/media/video-overview.mp4"
                        playsInline
                        muted={videoMuted}
                        onPlay={() => setIsVideoPlaying(true)}
                        onPause={() => setIsVideoPlaying(false)}
                        onEnded={nextPage}
                        onTimeUpdate={() => {
                          if (!videoRef.current) return;
                          const cur = videoRef.current.currentTime;
                          setVideoTime(cur);
                          if (cur >= 8) {
                            videoRef.current.pause();
                            setIsVideoPlaying(false);
                            setVideoTeaserLocked(true);
                          }
                        }}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />

                      {!isVideoPlaying && !videoTeaserLocked && (
                        <div style={{
                          position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.45)',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        }}>
                          <div style={{
                            width: '3.5rem', height: '3.5rem', borderRadius: '50%', backgroundColor: '#0D9488',
                            color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.35rem', paddingLeft: '3px', boxShadow: '0 6px 18px rgba(0,0,0,0.3)',
                          }}>▶</div>
                        </div>
                      )}

                      {videoTeaserLocked && (
                        <div className="teaser-locked-overlay">
                          <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', marginBottom: '0.75rem', color: '#99F6E4' }}>🔒</div>
                          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#FFFFFF' }}>Teaser preview complete</div>
                          <p style={{ fontSize: '0.8125rem', color: '#94A3B8', marginTop: '0.35rem', maxWidth: '320px' }}>
                            Buy to watch the rest of the explainer video
                          </p>
                          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (videoRef.current) {
                                  videoRef.current.currentTime = 0;
                                  setVideoTeaserLocked(false);
                                  videoRef.current.play();
                                }
                              }}
                              style={{ padding: '0.45rem 0.9rem', backgroundColor: 'transparent', border: '1px solid #64748B', color: '#F8FAFC', fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              ↺ Replay
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); goToPage(5); }}
                              style={{ padding: '0.45rem 1rem', backgroundColor: '#0D9488', border: 'none', color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer' }}
                            >
                              Unlock →
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: '0.75rem' }}>
                      <div style={{ width: '100%', height: '5px', backgroundColor: 'rgba(15,23,42,0.12)', position: 'relative' }}>
                        <div style={{ height: '100%', width: `${Math.min((videoTime / 8) * 100, 100)}%`, backgroundColor: '#0D9488' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', fontFamily: 'monospace', color: '#64748B', marginTop: '0.35rem' }}>
                        <span>{formatSeconds(videoTime)} / 00:08</span>
                        <button onClick={() => setVideoMuted(!videoMuted)} style={{ background: 'none', border: 'none', color: '#0D9488', cursor: 'pointer', fontWeight: 500 }}>
                          {videoMuted ? '🔇' : '🔊'}
                        </button>
                      </div>
                    </div>
                  </MediaPhase>
                )}
              </AnimatePresence>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
              <button onClick={prevPage} style={{ background: 'none', border: 'none', fontSize: '0.8125rem', color: '#64748B', cursor: 'pointer' }}>↑</button>
              <button onClick={nextPage} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.35rem',
                backgroundColor: '#1E40AF', color: '#FFFFFF', fontSize: '0.8125rem', fontWeight: 500, border: 'none', cursor: 'pointer',
              }}>↓</button>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════
              PAGE 4 – Audio (Typewriter → Dominant Audio Station)
          ═══════════════════════════════════════════════════════ */}
          <section className="fullpage-slide" key={`slide-3-${animKey}`}>
            <div className="choreography-stage">
              <AnimatePresence mode="wait">
                {stagePhase === 'text' ? (
                  <TextPhase key="audio-text" pageIdx={3}>
                    <h2 style={{
                      fontSize: 'clamp(1.5rem, 3.2vw, 2.5rem)',
                      fontFamily: 'var(--font-display)', fontWeight: 500, color: '#1E40AF',
                      lineHeight: 1.28, minHeight: '4.5rem',
                    }}>
                      &ldquo;{typedAudioText}&rdquo;
                      {!typingComplete && <span className="typewriter-cursor" />}
                    </h2>
                    <button
                      onClick={() => setStagePhase('media')}
                      style={{ marginTop: '1.25rem', background: 'none', border: 'none', color: '#64748B', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Skip to preview →
                    </button>
                  </TextPhase>
                ) : (
                  <MediaPhase key="audio-media">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span className="teaser-pill teaser-pill-blue">20-Second Audio Highlight</span>
                      <button onClick={() => setStagePhase('text')} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.75rem', cursor: 'pointer' }}>
                        ← back
                      </button>
                    </div>

                    <div className="dominant-player-box dominant-player-light" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1E40AF' }}>Audio Overview Highlight</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.15rem' }}>20-second recap snippet</div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          {[1, 1.25, 1.5].map((spd) => (
                            <button
                              key={spd}
                              onClick={() => changeAudioSpeed(spd)}
                              style={{
                                fontSize: '0.625rem', fontFamily: 'monospace', padding: '0.2rem 0.4rem',
                                background: audioSpeed === spd ? '#1E40AF' : '#FFFFFF',
                                color: audioSpeed === spd ? '#FFFFFF' : '#1E40AF',
                                border: '1px solid #BFDBFE', cursor: 'pointer',
                              }}
                            >
                              {spd}x
                            </button>
                          ))}
                        </div>
                      </div>

                      <audio
                        ref={audioRef}
                        src="/media/Audio.mp4"
                        preload="metadata"
                        onPlay={() => setIsAudioPlaying(true)}
                        onPause={() => setIsAudioPlaying(false)}
                        onEnded={nextPage}
                        onTimeUpdate={() => {
                          if (audioRef.current) {
                            setAudioTime(audioRef.current.currentTime);
                            setAudioDuration(audioRef.current.duration || 20);
                          }
                        }}
                      />

                      {/* Equalizer Bars */}
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '0.4rem', height: '5rem', padding: '0.5rem 0' }}>
                        {[18, 36, 48, 28, 42, 54, 32, 46, 22, 38, 50, 26, 40, 24, 36, 48, 20, 32, 44, 28].map((h, i) => (
                          <div
                            key={i}
                            className={`eq-bar ${isAudioPlaying ? 'playing' : 'paused'}`}
                            style={{
                              '--eq-h': `${Math.max(8, (h * 1.3) % 56 + 6)}px`,
                              '--eq-dur': `${0.45 + (i % 5) * 0.08}s`,
                              animationDelay: isAudioPlaying ? `${(i % 7) * 0.05}s` : '0s',
                            } as React.CSSProperties}
                          />
                        ))}
                      </div>

                      {/* Scrub Bar */}
                      <div>
                        <div
                          onClick={(e) => {
                            if (!audioRef.current || !audioDuration) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * audioDuration;
                          }}
                          style={{ width: '100%', height: '6px', backgroundColor: '#DBEAFE', cursor: 'pointer', position: 'relative' }}
                        >
                          <div style={{ height: '100%', width: `${audioDuration ? (audioTime / audioDuration) * 100 : 0}%`, backgroundColor: '#1E40AF' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', fontFamily: 'monospace', color: '#475569', marginTop: '0.5rem' }}>
                          <span>{formatSeconds(audioTime)}</span>
                          <span>{formatSeconds(audioDuration || 20)}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                          onClick={toggleAudioPlay}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.65rem 1.5rem', backgroundColor: '#1E40AF', color: '#FFFFFF',
                            fontSize: '0.875rem', fontWeight: 500, border: 'none', cursor: 'pointer',
                          }}
                        >
                          {isAudioPlaying ? '❚❚' : '▶'}
                        </button>
                      </div>
                    </div>
                  </MediaPhase>
                )}
              </AnimatePresence>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
              <button onClick={prevPage} style={{ background: 'none', border: 'none', fontSize: '0.8125rem', color: '#64748B', cursor: 'pointer' }}>↑</button>
              <button onClick={nextPage} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.35rem',
                backgroundColor: '#0D9488', color: '#FFFFFF', fontSize: '0.8125rem', fontWeight: 500, border: 'none', cursor: 'pointer',
              }}>↓</button>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════
              PAGE 5 – Slides (3-Slide Teaser, manual advance)
          ═══════════════════════════════════════════════════════ */}
          <section className="fullpage-slide" key={`slide-4-${animKey}`}>
            <div className="choreography-stage">
              <AnimatePresence mode="wait">
                {stagePhase === 'text' ? (
                  <TextPhase key="slides-text" pageIdx={4}>
                    <h2 style={{
                      fontSize: 'clamp(1.75rem, 3.6vw, 2.75rem)',
                      fontFamily: 'var(--font-display)', fontWeight: 500, color: '#0D9488', lineHeight: 1.22,
                    }}>
                      &ldquo;Need a short version before cats or exams? Pata slides hapa.&rdquo;
                    </h2>
                    <button
                      onClick={() => setStagePhase('media')}
                      style={{ marginTop: '1.25rem', background: 'none', border: 'none', color: '#64748B', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Skip to preview →
                    </button>
                  </TextPhase>
                ) : (
                  <MediaPhase key="slides-media">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span className="teaser-pill teaser-pill-teal">Slide {currentSlide + 1} of 3 — Teaser Preview</span>
                      <button onClick={() => setStagePhase('text')} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.75rem', cursor: 'pointer' }}>
                        ← back
                      </button>
                    </div>

                    <div
                      className="dominant-player-box dominant-player-light"
                      style={{ aspectRatio: '16/10', maxHeight: '60vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <img
                        src={SLIDE_IMAGES[currentSlide]}
                        alt={`Slide ${currentSlide + 1} - ${SLIDE_TOPICS[currentSlide]}`}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />

                      <button
                        onClick={() => { setSlideTeaserLockedNotice(false); setCurrentSlide((prev) => (prev > 0 ? prev - 1 : 0)); }}
                        aria-label="Previous slide"
                        disabled={currentSlide === 0}
                        style={{
                          position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                          width: '2.5rem', height: '2.5rem', backgroundColor: 'rgba(255,255,255,0.92)',
                          border: '1px solid #E2E8F0', color: currentSlide === 0 ? '#CBD5E1' : '#0F172A',
                          cursor: currentSlide === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}
                      >‹</button>

                      <button
                        onClick={() => { currentSlide < 2 ? setCurrentSlide(currentSlide + 1) : setSlideTeaserLockedNotice(true); setSlideTeaserLockedNotice(currentSlide >= 2); }}
                        aria-label="Next slide"
                        style={{
                          position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                          width: '2.5rem', height: '2.5rem', backgroundColor: 'rgba(255,255,255,0.92)',
                          border: '1px solid #E2E8F0', color: '#0F172A', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}
                      >›</button>

                      {slideTeaserLockedNotice && (
                        <div className="teaser-locked-overlay">
                          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔒</div>
                          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#FFFFFF' }}>Slides 4–15 locked</div>
                          <p style={{ fontSize: '0.8125rem', color: '#94A3B8', marginTop: '0.35rem', maxWidth: '300px' }}>
                            The rest of the slide deck is unlocked inside the full unit pack.
                          </p>
                          <button
                            onClick={() => goToPage(5)}
                            style={{ marginTop: '1rem', padding: '0.5rem 1.25rem', backgroundColor: '#0D9488', border: 'none', color: '#FFFFFF', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer' }}
                          >
                            Unlock Full Deck →
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Thumbnails */}
                    <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginTop: '0.75rem', paddingBottom: '0.25rem', alignItems: 'center' }}>
                      {[0, 1, 2].map((i) => (
                        <button
                          key={i}
                          onClick={() => { setCurrentSlide(i); setSlideTeaserLockedNotice(false); }}
                          style={{
                            width: '3.25rem', height: '2rem', flexShrink: 0,
                            border: currentSlide === i ? '2px solid #0D9488' : '1px solid #E2E8F0',
                            overflow: 'hidden', padding: 0, cursor: 'pointer', background: '#F1F5F9',
                          }}
                        >
                          <img src={SLIDE_IMAGES[i]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </button>
                      ))}
                      {[3, 4, 5].map((i) => (
                        <div
                          key={i}
                          onClick={() => setSlideTeaserLockedNotice(true)}
                          style={{
                            width: '3.25rem', height: '2rem', flexShrink: 0, border: '1px solid #E2E8F0',
                            overflow: 'hidden', cursor: 'pointer', background: '#F1F5F9',
                            position: 'relative', filter: 'grayscale(1) blur(1.5px)', opacity: 0.6,
                          }}
                        >
                          <img src={SLIDE_IMAGES[i]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem', color: '#0F172A' }}>🔒</div>
                        </div>
                      ))}
                      <button
                        onClick={() => setSlideTeaserLockedNotice(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem', color: '#0D9488', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, paddingLeft: '0.25rem' }}
                      >
                        +12 more 🔒
                      </button>
                    </div>
                  </MediaPhase>
                )}
              </AnimatePresence>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
              <button onClick={prevPage} style={{ background: 'none', border: 'none', fontSize: '0.8125rem', color: '#64748B', cursor: 'pointer' }}>↑</button>
              <button onClick={nextPage} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.35rem',
                backgroundColor: '#1E40AF', color: '#FFFFFF', fontSize: '0.8125rem', fontWeight: 500, border: 'none', cursor: 'pointer',
              }}>↓</button>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════
              PAGE 6 – Pick your unit
          ═══════════════════════════════════════════════════════ */}
          <section className="fullpage-slide" key={`slide-5-${animKey}`}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 className="anim-fade-in" style={{
                fontSize: 'clamp(1.75rem, 3.4vw, 2.5rem)',
                fontFamily: 'var(--font-display)', fontWeight: 500, color: '#0F172A', letterSpacing: '-0.015em',
              }}>
                Pick your unit
              </h2>
              <p className="anim-fade-in" style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.25rem' }}>
                Select a course unit to open notes, explainer video, audio recap, and slide packs.
              </p>
            </div>

            <div className="unit-grid anim-fade-in" style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '0.875rem', marginBottom: '1.5rem',
            }}>
              {UNITS.map((unit) => {
                const slug = unit.code.toLowerCase().replace(/\s+/g, '');
                return (
                  <Link
                    key={unit.code}
                    href={`/unit/${slug}`}
                    className="unit-card"
                    style={{
                      background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '1.125rem',
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                      minHeight: '6.5rem', textDecoration: 'none',
                      transition: 'border-color 0.15s ease, transform 0.15s ease',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1E40AF', fontFamily: 'var(--font-display)' }}>
                        {unit.code}
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0F172A', marginTop: '0.35rem', lineHeight: 1.35 }}>
                        {unit.name}
                      </div>
                    </div>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      marginTop: '0.75rem', borderTop: '1px solid #F1F5F9', paddingTop: '0.5rem',
                      fontSize: '0.6875rem', color: '#64748B',
                    }}>
                      <span>{unit.lecturer}</span>
                      <span style={{ color: '#1E40AF', fontWeight: 500 }}>Open Unit →</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1.125rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => goToPage(0)} style={{ background: 'none', border: 'none', fontSize: '0.8125rem', color: '#1E40AF', cursor: 'pointer', fontWeight: 500 }}>
                ↑ Back to beginning
              </button>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Plug Wa Notes · SOEN 2.1</span>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
