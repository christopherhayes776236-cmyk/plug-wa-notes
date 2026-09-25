'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UNITS } from '@/lib/data';
import { FormatIcon } from '@/components/FormatIcon';
import { StaggerWords } from '@/components/text-animations/StaggerWords';
import { ConvergeLetters } from '@/components/text-animations/ConvergeLetters';
import { WipeReveal } from '@/components/text-animations/WipeReveal';

const TOTAL_PAGES = 6;

const LOADER_STORAGE_KEY = 'pwn_loader_date';

// ─── Loader: runs once-per-day, 1s count-up, 1.5s hard cap ───
function useShouldShowLoader() {
  const [shouldShow, setShouldShow] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const today = new Date().toDateString();
      const last = window.localStorage.getItem(LOADER_STORAGE_KEY);
      if (last !== today) {
        setShouldShow(true);
        window.localStorage.setItem(LOADER_STORAGE_KEY, today);
      }
    } catch {
      // localStorage unavailable — fail safe, skip loader
    }
    setChecked(true);
  }, []);

  return { shouldShow, checked };
}

const springTransition = { duration: 0.52, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] };

// Typewriter text for Audio section
const AUDIO_TEXT = 'Usiache kuosha viombo iku prevent from catching up, kua sharp boy/girl skiza audio overview';

export default function HomePage() {
  // ─── Loader state ───────────────────────────────────────────
  const [loadPercent, setLoadPercent] = useState(0);
  const [loaderDone, setLoaderDone] = useState(false);
  const { shouldShow, checked } = useShouldShowLoader();
  const showLoader = checked && shouldShow && !loaderDone;

  useEffect(() => {
    if (!shouldShow || !checked) {
      setLoaderDone(true);
      return;
    }

    const COUNT_MS = 1000;
    const HOLD_MS = 150;
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / COUNT_MS, 1);
      setLoadPercent(Math.round(progress * 100));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => setLoaderDone(true), HOLD_MS);
      }
    };
    raf = requestAnimationFrame(tick);

    // Hard cap — never trap user longer than 1.5s
    const hardCap = setTimeout(() => setLoaderDone(true), 1500);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hardCap);
    };
  }, [shouldShow, checked]);

  // ─── Page navigation ─────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(0);
  const isTransitioningRef = useRef(false);
  const touchStartYRef = useRef(0);
  const [animKey, setAnimKey] = useState(0);
  const router = useRouter();

  // ─── Media playback refs and states ──────────────────────────
  const notesVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [notesVideoPlaying, setNotesVideoPlaying] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  // ─── Slide deck state ────────────────────────────────────────
  const [currentSlide, setCurrentSlide] = useState(0);
  const SLIDE_IMAGES = Array.from({ length: 15 }, (_, i) => `/media/slides/image${i + 1}.png`);

  useEffect(() => {
    if (currentPage !== 1 && notesVideoRef.current && !notesVideoRef.current.paused) {
      notesVideoRef.current.pause();
      setNotesVideoPlaying(false);
    }
    if (currentPage !== 2 && videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
      setVideoPlaying(false);
    }
    if (currentPage !== 3 && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setAudioPlaying(false);
    }
  }, [currentPage]);

  const isMediaTarget = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    return Boolean(target.closest('video, audio, #homepage-video-btn, #homepage-audio-btn, #homepage-notes-video-btn, .slide-deck-container'));
  };

  const toggleNotesVideo = () => {
    if (!notesVideoRef.current) return;
    if (notesVideoRef.current.paused) {
      notesVideoRef.current.play().then(() => setNotesVideoPlaying(true)).catch((e) => console.log('Notes video play error:', e));
    } else {
      notesVideoRef.current.pause();
      setNotesVideoPlaying(false);
    }
  };

  const toggleVideo = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setVideoPlaying(true)).catch((e) => console.log('Video play error:', e));
    } else {
      videoRef.current.pause();
      setVideoPlaying(false);
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().then(() => setAudioPlaying(true)).catch((e) => console.log('Audio play error:', e));
    } else {
      audioRef.current.pause();
      setAudioPlaying(false);
    }
  };

  // ─── Typewriter for audio page ───────────────────────────────
  const [typedAudioText, setTypedAudioText] = useState('');
  const [typingComplete, setTypingComplete] = useState(false);

  useEffect(() => {
    if (currentPage !== 3) {
      setTypedAudioText('');
      setTypingComplete(false);
      return;
    }

    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setTypedAudioText(AUDIO_TEXT.slice(0, idx));
      if (idx >= AUDIO_TEXT.length) {
        clearInterval(interval);
        setTypingComplete(true);
      }
    }, 26);

    return () => clearInterval(interval);
  }, [currentPage, animKey]);

  // ─── Prefetch unit routes during idle ────────────────────────
  useEffect(() => {
    try {
      UNITS.forEach((unit) => {
        const slug = unit.code.toLowerCase().replace(/\s+/g, '');
        router.prefetch(`/unit/${slug}`);
      });
    } catch { /* ignore */ }
  }, [router]);

  const goToPage = useCallback((index: number) => {
    if (index < 0 || index >= TOTAL_PAGES) return;
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setCurrentPage(index);
    setAnimKey((k) => k + 1);
    setTimeout(() => { isTransitioningRef.current = false; }, 650);
  }, []);

  const nextPage = useCallback(() => {
    if (currentPage < TOTAL_PAGES - 1) goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 0) goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  // ─── Wheel + Keyboard ────────────────────────────────────────
  useEffect(() => {
    if (showLoader) return;

    const onWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.unit-grid')) return;
      if (isMediaTarget(target) || notesVideoPlaying || videoPlaying || audioPlaying) return;
      if (Math.abs(e.deltaY) > 28) {
        e.deltaY > 0 ? nextPage() : prevPage();
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        if (currentPage === 1) {
          e.preventDefault();
          toggleNotesVideo();
          return;
        }
        if (currentPage === 2) {
          e.preventDefault();
          toggleVideo();
          return;
        }
        if (currentPage === 3) {
          e.preventDefault();
          toggleAudio();
          return;
        }
        e.preventDefault();
        nextPage();
        return;
      }
      if (notesVideoPlaying || videoPlaying || audioPlaying) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault(); nextPage();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault(); prevPage();
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
    };
  }, [showLoader, nextPage, prevPage, currentPage, notesVideoPlaying, videoPlaying, audioPlaying]);

  // ─── Touch ───────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isMediaTarget(e.target) || notesVideoPlaying || videoPlaying || audioPlaying) return;
    const deltaY = touchStartYRef.current - e.changedTouches[0].clientY;
    if (Math.abs(deltaY) > 42) deltaY > 0 ? nextPage() : prevPage();
  };

  return (
    <>
      {/* ─── Loader ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showLoader && (
          <motion.div
            key="loader"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              backgroundColor: '#F6F4EF',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '0.75rem',
            }}
          >
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 600,
              fontSize: '1.25rem', color: '#0F172A', letterSpacing: '-0.015em',
            }}>
              Plug Wa Notes
            </div>
            <div style={{
              fontFamily: 'var(--font-body)', fontVariantNumeric: 'tabular-nums',
              fontWeight: 600, fontSize: '0.9375rem', color: '#1E40AF',
            }}>
              {loadPercent}%
            </div>
            <div style={{
              width: '140px', height: '3px',
              backgroundColor: '#E2E8F0', borderRadius: '999px', overflow: 'hidden',
            }}>
              <div style={{
                width: `${loadPercent}%`, height: '100%',
                backgroundColor: '#1E40AF', borderRadius: '999px',
                transition: 'width 0.05s linear',
              }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Full-page container ────────────────────────────── */}
      <div
        className="fullpage-wrapper"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ opacity: showLoader ? 0 : 1, transition: 'opacity 0.3s ease' }}
      >

        {/* Floating Header */}
        <header style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '4.25rem', zIndex: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.5rem', maxWidth: '1180px', margin: '0 auto', pointerEvents: 'none',
        }}>
          <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 600,
              fontSize: '1.05rem', color: '#0F172A', letterSpacing: '-0.01em',
            }}>
              Plug Wa Notes
            </span>
            <span style={{
              fontSize: '0.6875rem', fontFamily: 'monospace', color: '#475569',
              background: '#F1F5F9', padding: '0.125rem 0.45rem', border: '1px solid #E2E8F0',
            }}>
              {currentPage + 1}/{TOTAL_PAGES}
            </span>
          </div>

          {currentPage < TOTAL_PAGES - 1 ? (
            <button
              onClick={() => goToPage(5)}
              style={{
                pointerEvents: 'auto', fontSize: '0.75rem', fontWeight: 500,
                color: '#1E40AF', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE',
                padding: '0.35rem 0.85rem', cursor: 'pointer',
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

        {/* Floating Right Pagination dots */}
        <nav className="fullpage-hud" aria-label="Page navigation">
          {[0, 1, 2, 3, 4, 5].map((idx) => {
            const isTeal = idx === 2 || idx === 3;
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

        {/* ─── Animated Vertical Track ──────────────────────── */}
        <div className="fullpage-track" style={{ transform: `translate3d(0, -${currentPage * 100}%, 0)` }}>

          {/* ═══════════ PAGE 1 – Welcome ═══════════ */}
          <section className="fullpage-slide" key={`slide-0-${animKey}`}>
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
              maxWidth: '1100px', margin: '0 auto', width: '100%',
            }}>
              <h1
                className="anim-fade-in"
                style={{
                  fontSize: 'clamp(2rem, 4.2vw, 3.25rem)',
                  fontFamily: 'var(--font-display)', fontWeight: 500, color: '#0F172A',
                  lineHeight: 1.18, letterSpacing: '-0.02em', maxWidth: '820px',
                }}
              >
                &ldquo;Welcome to Your Knowledge Bank - where learning is made fun&rdquo;
              </h1>

              <div
                className="anim-fade-in"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                  gap: '1rem', marginTop: '2.5rem',
                }}
              >
                {[
                  { idx: 1, label: 'Notes',  title: 'Clean Lecture Notes',   color: '#1E40AF' },
                  { idx: 2, label: 'Video',  title: 'Explainer Review',       color: '#0D9488' },
                  { idx: 3, label: 'Audio',  title: 'Audio Overview',         color: '#1E40AF' },
                  { idx: 4, label: 'Slides', title: 'Exam Revision Deck',     color: '#0D9488' },
                ].map(({ idx, label, title, color }) => (
                  <button
                    key={idx}
                    onClick={() => goToPage(idx)}
                    style={{
                      background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '1.25rem',
                      textAlign: 'left', cursor: 'pointer',
                      transition: 'border-color 0.15s ease, transform 0.15s ease',
                    }}
                  >
                    <div style={{ color, fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                      {label}
                    </div>
                    <div style={{ color: '#0F172A', marginTop: '0.35rem', fontWeight: 600, fontSize: '0.9375rem' }}>
                      {title}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem',
            }}>
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

          {/* ═══════════ PAGE 2 – Notes ═══════════ */}
          <section className="fullpage-slide" key="slide-1">
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: '1.25rem', maxWidth: '750px', margin: '0 auto',
              width: '100%', textAlign: 'center', padding: '1rem',
            }}>
              <FormatIcon type="notes" color="#2450C8" size={48} />
              <h2 style={{
                fontSize: 'clamp(1.4rem, 2.8vw, 2.25rem)',
                fontFamily: 'var(--font-display)', fontWeight: 500, lineHeight: 1.25,
              }}>
                <StaggerWords
                  text="Feeling behind in class? No stress - Pata notes hapa."
                  color="#1E40AF"
                />
              </h2>

              {/* Notes Video Player Card */}
              <div style={{
                width: '100%',
                maxWidth: '520px',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #E2E8F0',
                boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                backgroundColor: '#0F172A',
                position: 'relative',
              }}>
                <video
                  ref={notesVideoRef}
                  id="homepage-notes-video"
                  src="/media/notes-overview.mp4"
                  controls
                  playsInline
                  preload="metadata"
                  onPlay={() => setNotesVideoPlaying(true)}
                  onPause={() => setNotesVideoPlaying(false)}
                  onEnded={() => setNotesVideoPlaying(false)}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                  style={{ width: '100%', maxHeight: '280px', display: 'block' }}
                />
              </div>

              <button
                id="homepage-notes-video-btn"
                onClick={toggleNotesVideo}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 1.25rem', borderRadius: '999px',
                  backgroundColor: notesVideoPlaying ? '#F1F5F9' : '#1E40AF',
                  color: notesVideoPlaying ? '#0F172A' : '#FFFFFF',
                  fontSize: '0.8125rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                  transition: 'background-color 0.15s ease, transform 0.15s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <span>{notesVideoPlaying ? 'Pause Notes ⏸' : 'Play Notes Video ▶'}</span>
              </button>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem',
            }}>
              <button onClick={prevPage} style={{ background: 'none', border: 'none', fontSize: '0.8125rem', color: '#64748B', cursor: 'pointer' }}>↑</button>
              <button onClick={nextPage} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.35rem',
                backgroundColor: '#0D9488', color: '#FFFFFF', fontSize: '0.8125rem', fontWeight: 500, border: 'none', cursor: 'pointer',
              }}>↓</button>
            </div>
          </section>

          {/* ═══════════ PAGE 3 – Video ═══════════ */}
          <section className="fullpage-slide" key="slide-2">
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: '1.25rem', maxWidth: '750px', margin: '0 auto',
              width: '100%', textAlign: 'center', padding: '1rem',
            }}>
              <FormatIcon type="video" color="#157F72" size={48} />
              <h2 style={{
                fontSize: 'clamp(1.4rem, 2.8vw, 2.25rem)',
                fontFamily: 'var(--font-display)', fontWeight: 500, lineHeight: 1.25,
              }}>
                <ConvergeLetters
                  text="Some units just make more sense in visuals - Pata video review hapa ndani."
                  color="#0D9488"
                />
              </h2>

              {/* Video Player Card */}
              <div style={{
                width: '100%',
                maxWidth: '520px',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #E2E8F0',
                boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                backgroundColor: '#0F172A',
                position: 'relative',
              }}>
                <video
                  ref={videoRef}
                  id="homepage-video"
                  src="/media/video-overview.mp4"
                  controls
                  playsInline
                  preload="metadata"
                  onPlay={() => setVideoPlaying(true)}
                  onPause={() => setVideoPlaying(false)}
                  onEnded={() => setVideoPlaying(false)}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                  style={{ width: '100%', maxHeight: '280px', display: 'block' }}
                />
              </div>

              <button
                id="homepage-video-btn"
                onClick={toggleVideo}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 1.25rem', borderRadius: '999px',
                  backgroundColor: videoPlaying ? '#F1F5F9' : '#0D9488',
                  color: videoPlaying ? '#0F172A' : '#FFFFFF',
                  fontSize: '0.8125rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                  transition: 'background-color 0.15s ease, transform 0.15s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <span>{videoPlaying ? 'Pause Video ⏸' : 'Play Explainer Video ▶'}</span>
              </button>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem',
            }}>
              <button onClick={prevPage} style={{ background: 'none', border: 'none', fontSize: '0.8125rem', color: '#64748B', cursor: 'pointer' }}>↑</button>
              <button onClick={nextPage} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.35rem',
                backgroundColor: '#1E40AF', color: '#FFFFFF', fontSize: '0.8125rem', fontWeight: 500, border: 'none', cursor: 'pointer',
              }}>↓</button>
            </div>
          </section>

          {/* ═══════════ PAGE 4 – Audio (typewriter) ═══════════ */}
          <section className="fullpage-slide" key="slide-3">
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: '1.25rem', maxWidth: '750px', margin: '0 auto',
              width: '100%', textAlign: 'center', padding: '1rem',
            }}>
              <FormatIcon type="audio" color="#157F72" size={48} />
              <h2 style={{
                fontSize: 'clamp(1.2rem, 2.5vw, 1.85rem)',
                fontFamily: 'var(--font-display)', fontWeight: 500, color: '#1E40AF',
                lineHeight: 1.3, minHeight: '3.5rem',
              }}>
                &ldquo;{typedAudioText}&rdquo;
                {!typingComplete && <span className="typewriter-cursor" />}
              </h2>

              {/* Audio Player Card */}
              <div style={{
                width: '100%',
                maxWidth: '460px',
                padding: '1.25rem 1.5rem',
                borderRadius: '12px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.85rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1E40AF', fontSize: '0.8125rem', fontWeight: 600 }}>
                  <span>🎧 Audio Overview Preview (20s)</span>
                </div>
                <audio
                  ref={audioRef}
                  id="homepage-audio"
                  controls
                  preload="metadata"
                  onPlay={() => setAudioPlaying(true)}
                  onPause={() => setAudioPlaying(false)}
                  onEnded={() => setAudioPlaying(false)}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                  style={{ width: '100%', height: '44px' }}
                >
                  <source src="/media/audio-highlight.mp3" type="audio/mpeg" />
                  <source src="/media/audio-highlight.m4a" type="audio/mp4" />
                  Your browser does not support the audio element.
                </audio>

                <button
                  id="homepage-audio-btn"
                  onClick={toggleAudio}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 1.25rem', borderRadius: '999px',
                    backgroundColor: audioPlaying ? '#F1F5F9' : '#1E40AF',
                    color: audioPlaying ? '#0F172A' : '#FFFFFF',
                    fontSize: '0.8125rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                    transition: 'background-color 0.15s ease, transform 0.15s ease',
                  }}
                >
                  <span>{audioPlaying ? 'Pause Audio ⏸' : 'Play Audio Overview ▶'}</span>
                </button>
              </div>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem',
            }}>
              <button onClick={prevPage} style={{ background: 'none', border: 'none', fontSize: '0.8125rem', color: '#64748B', cursor: 'pointer' }}>↑</button>
              <button onClick={nextPage} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.35rem',
                backgroundColor: '#0D9488', color: '#FFFFFF', fontSize: '0.8125rem', fontWeight: 500, border: 'none', cursor: 'pointer',
              }}>↓</button>
            </div>
          </section>

          {/* ═══════════ PAGE 5 – Slides ═══════════ */}
          <section className="fullpage-slide" key="slide-4">
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: '1.25rem', maxWidth: '750px', margin: '0 auto',
              width: '100%', textAlign: 'center', padding: '1rem',
            }}>
              <FormatIcon type="slides" color="#2450C8" size={48} />
              <h2 style={{
                fontSize: 'clamp(1.4rem, 2.8vw, 2.25rem)',
                fontFamily: 'var(--font-display)', fontWeight: 500, lineHeight: 1.25,
              }}>
                <WipeReveal
                  text="Need a short version before cats or exams? Pata slides hapa."
                  color="#1E40AF"
                />
              </h2>

              {/* Slide Deck Viewer */}
              <div
                className="slide-deck-container"
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
                onWheel={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  maxWidth: '520px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                  backgroundColor: '#FFFFFF',
                }}
              >
                {/* Header with pill counter and Prev / Next buttons */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.625rem 1rem',
                  borderBottom: '1px solid #F1F5F9',
                  backgroundColor: '#F8FAFC',
                }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#0D9488',
                    backgroundColor: '#F0FDFA',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                    border: '1px solid #CCFBF1',
                  }}>
                    Slide {currentSlide + 1} of {SLIDE_IMAGES.length}
                  </span>

                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      id="slide-deck-prev-btn"
                      onClick={() => setCurrentSlide((prev) => (prev > 0 ? prev - 1 : SLIDE_IMAGES.length - 1))}
                      style={{
                        padding: '0.3rem 0.65rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#475569',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      ← Prev
                    </button>
                    <button
                      id="slide-deck-next-btn"
                      onClick={() => setCurrentSlide((prev) => (prev < SLIDE_IMAGES.length - 1 ? prev + 1 : 0))}
                      style={{
                        padding: '0.3rem 0.65rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#FFFFFF',
                        backgroundColor: '#0D9488',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Next →
                    </button>
                  </div>
                </div>

                {/* Main slide image view */}
                <div style={{
                  position: 'relative',
                  aspectRatio: '16/9',
                  backgroundColor: '#0F172A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <img
                    id="homepage-slide-image"
                    src={SLIDE_IMAGES[currentSlide]}
                    alt={`Slide ${currentSlide + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                  />
                </div>

                {/* Horizontal thumbnail selector strip */}
                <div style={{
                  display: 'flex',
                  gap: '0.4rem',
                  overflowX: 'auto',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#F8FAFC',
                  borderTop: '1px solid #F1F5F9',
                }}>
                  {SLIDE_IMAGES.map((src, i) => (
                    <button
                      key={i}
                      id={`slide-thumb-${i + 1}`}
                      onClick={() => setCurrentSlide(i)}
                      style={{
                        flexShrink: 0,
                        width: '44px',
                        height: '26px',
                        padding: 0,
                        border: currentSlide === i ? '2px solid #0D9488' : '1px solid #E2E8F0',
                        borderRadius: '3px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        opacity: currentSlide === i ? 1 : 0.65,
                        transition: 'opacity 0.15s ease',
                      }}
                    >
                      <img src={src} alt={`Thumb ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem',
            }}>
              <button onClick={prevPage} style={{ background: 'none', border: 'none', fontSize: '0.8125rem', color: '#64748B', cursor: 'pointer' }}>↑</button>
              <button onClick={nextPage} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.35rem',
                backgroundColor: '#1E40AF', color: '#FFFFFF', fontSize: '0.8125rem', fontWeight: 500, border: 'none', cursor: 'pointer',
              }}>↓</button>
            </div>
          </section>

          {/* ═══════════ PAGE 6 – Pick your unit ═══════════ */}
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

            <div
              className="unit-grid anim-fade-in"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '0.875rem', marginBottom: '1.5rem',
              }}
            >
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

            <div style={{
              borderTop: '1px solid #E2E8F0', paddingTop: '1.125rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <button
                onClick={() => goToPage(0)}
                style={{ background: 'none', border: 'none', fontSize: '0.8125rem', color: '#1E40AF', cursor: 'pointer', fontWeight: 500 }}
              >
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
