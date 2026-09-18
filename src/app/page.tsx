'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { UNITS } from '@/lib/data';

export default function HomePage() {
  // Loading screen (1.8s)
  const [isLoading, setIsLoading] = useState(true);

  // Active animation step (0 = loading, 1 = welcome, 2 = notes, 3 = video, 4 = audio, 5 = slides, 6 = units)
  const [activeStep, setActiveStep] = useState(1);

  // Media playback states
  const [notesPlaying, setNotesPlaying] = useState(false);
  const [notesProgress, setNotesProgress] = useState(0);

  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  // Typewriter for Message 4
  const audioHookFullText = "Ukisoma text ukiskia audio overview — uko sharp.";
  const [audioHookText, setAudioHookText] = useState("");
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  // Slides for Message 5
  const [slideIndex, setSlideIndex] = useState(0);

  // Section references for gentle auto-scroll
  const step1Ref = useRef<HTMLElement | null>(null);
  const step2Ref = useRef<HTMLElement | null>(null);
  const step3Ref = useRef<HTMLElement | null>(null);
  const step4Ref = useRef<HTMLElement | null>(null);
  const step5Ref = useRef<HTMLElement | null>(null);
  const unitsRef = useRef<HTMLElement | null>(null);

  // User manual scroll detection: don't hijack scroll if user manually scrolled recently
  const userScrolledRef = useRef(false);
  const lastUserScrollTimeRef = useRef(0);

  const gentleScrollTo = (ref: React.RefObject<HTMLElement | null>) => {
    // If user touched or scrolled manually within the last 3.5s, skip auto-scroll
    if (Date.now() - lastUserScrollTimeRef.current < 3500) return;
    if (ref.current) {
      const top = ref.current.getBoundingClientRect().top + window.scrollY - 32;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleTouchOrWheel = () => {
      lastUserScrollTimeRef.current = Date.now();
      userScrolledRef.current = true;
    };
    window.addEventListener('wheel', handleTouchOrWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchOrWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleTouchOrWheel);
      window.removeEventListener('touchstart', handleTouchOrWheel);
    };
  }, []);

  /* ─────────────────────────────────────────────────────────────
     Orchestration Timeline
  ───────────────────────────────────────────────────────────── */
  // 1. Initial Loading Screen
  useEffect(() => {
    const loadTimer = setTimeout(() => {
      setIsLoading(false);
      setActiveStep(1);
    }, 1600);
    return () => clearTimeout(loadTimer);
  }, []);

  // 2. Step 1 (Welcome) -> Step 2 (Notes Hook)
  useEffect(() => {
    if (isLoading || activeStep !== 1) return;
    const timer = setTimeout(() => {
      setActiveStep(2);
      gentleScrollTo(step2Ref);
    }, 2200);
    return () => clearTimeout(timer);
  }, [isLoading, activeStep]);

  // 3. Step 2 (Notes Hook) -> Play Notes PDF Scroll (7s) -> Step 3
  useEffect(() => {
    if (activeStep !== 2) return;
    // Start notes scroll after fly-in text finishes (600ms)
    const startDelay = setTimeout(() => {
      setNotesPlaying(true);
      const startTime = Date.now();
      const duration = 6500;

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const p = Math.min(elapsed / duration, 1);
        setNotesProgress(p);

        if (p >= 1) {
          clearInterval(interval);
          setNotesPlaying(false);
          // Advance to Step 3
          setTimeout(() => {
            setActiveStep(3);
            gentleScrollTo(step3Ref);
          }, 800);
        }
      }, 50);

      return () => clearInterval(interval);
    }, 600);

    return () => clearTimeout(startDelay);
  }, [activeStep]);

  // 4. Step 3 (Video Review) -> Play Video Clip Preview (6s) -> Step 4
  useEffect(() => {
    if (activeStep !== 3) return;
    const startDelay = setTimeout(() => {
      setVideoPlaying(true);
      const startTime = Date.now();
      const duration = 6000;

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const p = Math.min(elapsed / duration, 1);
        setVideoProgress(p * 100);

        if (p >= 1) {
          clearInterval(interval);
          setVideoPlaying(false);
          // Advance to Step 4
          setTimeout(() => {
            setActiveStep(4);
            gentleScrollTo(step4Ref);
          }, 800);
        }
      }, 50);

      return () => clearInterval(interval);
    }, 600);

    return () => clearTimeout(startDelay);
  }, [activeStep]);

  // 5. Step 4 (Audio Overview) -> Typewriter Effect -> Play Waveform (6s) -> Step 5
  useEffect(() => {
    if (activeStep !== 4) return;
    setAudioHookText("");
    let charIndex = 0;

    // Typewriter
    const typeInterval = setInterval(() => {
      charIndex++;
      setAudioHookText(audioHookFullText.slice(0, charIndex));

      if (charIndex >= audioHookFullText.length) {
        clearInterval(typeInterval);

        // Typing finished: start playing audio overview immediately
        setTimeout(() => {
          setAudioPlaying(true);
          const startTime = Date.now();
          const duration = 6000;

          const progressInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const p = Math.min(elapsed / duration, 1);
            setAudioProgress(p * 100);

            if (p >= 1) {
              clearInterval(progressInterval);
              setAudioPlaying(false);
              // Advance to Step 5
              setTimeout(() => {
                setActiveStep(5);
                gentleScrollTo(step5Ref);
              }, 800);
            }
          }, 60);
        }, 400);
      }
    }, 38);

    return () => clearInterval(typeInterval);
  }, [activeStep]);

  // 6. Step 5 (Slides Hook) -> Auto-Advance Slides -> Step 6 (Units)
  useEffect(() => {
    if (activeStep !== 5) return;
    setSlideIndex(0);

    const s1 = setTimeout(() => setSlideIndex(1), 1600);
    const s2 = setTimeout(() => setSlideIndex(2), 3200);
    const s3 = setTimeout(() => {
      setActiveStep(6);
      gentleScrollTo(unitsRef);
    }, 4800);

    return () => {
      clearTimeout(s1);
      clearTimeout(s2);
      clearTimeout(s3);
    };
  }, [activeStep]);

  // Quick skip directly to units
  const handleSkipToUnits = () => {
    setActiveStep(6);
    unitsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* ─── 1. Minimal Loading Animation Screen (1.6s) ──────────────── */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          backgroundColor: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            fontWeight: 500,
            color: '#0F172A',
            letterSpacing: '-0.01em',
            marginBottom: '1rem',
          }}>
            Plug Wa Notes
          </div>
          <div style={{
            width: '8rem',
            height: '3px',
            backgroundColor: '#E2E8F0',
            borderRadius: '9999px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#1E40AF',
              borderRadius: '9999px',
              animation: 'fadeInSoft 1.5s ease-out forwards',
            }} />
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#475569',
            marginTop: '0.75rem',
          }}>
            Loading your study materials...
          </p>
        </div>
      )}

      {/* ─── Main Content Shell ──────────────────────────────────────── */}
      <main className="page-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
        
        {/* Sticky Minimal Navigation with quick skip */}
        <nav className="nav-bar" style={{ marginBottom: '2rem' }}>
          <div>
            <span className="nav-brand">Plug Wa Notes</span>
            <span style={{ fontSize: '0.75rem', color: '#475569', marginLeft: '0.5rem' }}>SOEN 2.1</span>
          </div>
          <button
            onClick={handleSkipToUnits}
            style={{
              fontSize: '0.75rem',
              color: '#1E40AF',
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              padding: '0.25rem 0.625rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Pick Unit &darr;
          </button>
        </nav>

        <div className="beats-stack" style={{ flex: 1 }}>

          {/* ─── 2. Message 1 – Welcome ─────────────────────────────── */}
          <section
            ref={step1Ref}
            className="beat-first anim-fade-in"
            style={{ minHeight: 'auto', paddingBottom: '1rem' }}
          >
            <h1
              className="h1"
              style={{
                color: '#0F172A',
                fontSize: '1.625rem',
                lineHeight: 1.3,
                fontWeight: 500,
                maxWidth: '620px',
              }}
            >
              Welcome to Your Knowledge Bank &ndash; where learning is made fun.
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.5rem' }}>
              Clean lecture notes, explainer video reviews, and quick revision slides for Kisii University classmates.
            </p>
          </section>

          {/* ─── 3. Message 2 – Notes Hook & PDF Scroll ─────────────── */}
          <section
            ref={step2Ref}
            className="beat-with-backdrop"
            style={{
              opacity: activeStep >= 2 ? 1 : 0.45,
              transition: 'opacity 0.4s ease',
            }}
          >
            <div className="beat-backdrop-shape beat-backdrop-blue" aria-hidden="true" />
            
            <div className={`beat-heading-blue ${activeStep >= 2 ? 'anim-fly-left' : ''}`}>
              <h2 style={{ color: '#1E40AF', fontSize: '1.25rem', fontWeight: 500 }}>
                Feeling behind in class? No stress &mdash; Pata notes hapa.
              </h2>
            </div>

            {/* Screen-recorded clean notes PDF preview with auto-scrolling */}
            <div
              className="format-demo-wrap"
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                padding: '1rem',
                cursor: 'pointer',
              }}
              onClick={() => { setNotesPlaying(true); setNotesProgress(0); }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#0F172A' }}>
                  Clean notes sample (PDF)
                </span>
                <span style={{ fontSize: '0.6875rem', color: '#1E40AF', fontWeight: 500 }}>
                  {notesPlaying ? 'Scrolling notes...' : 'Auto-previewing'}
                </span>
              </div>

              {/* Scrolling Simulated PDF Document */}
              <div style={{
                position: 'relative',
                height: '8.5rem',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                borderRadius: '4px',
                padding: '0.875rem',
              }}>
                <div style={{
                  transform: `translateY(-${notesProgress * 110}px)`,
                  transition: 'transform 0.1s linear',
                }}>
                  {/* Page header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.375rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#1E40AF' }}>SOEN 2.1 LECTURE SUMMARY</span>
                    <span style={{ fontSize: '0.625rem', color: '#475569' }}>PAGE 1/12</span>
                  </div>

                  {/* Note block 1 */}
                  <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#0F172A', lineHeight: 1.4 }}>
                    <strong>1.1 Discrete Relations &amp; Partitions</strong>
                    <p style={{ color: '#475569', fontSize: '0.6875rem', margin: '0.25rem 0' }}>
                      A relation R on set A is an equivalence relation if and only if it satisfies reflexivity, symmetry, and transitivity.
                    </p>
                  </div>

                  {/* Visual formula chip */}
                  <div style={{ background: '#EFF6FF', borderLeft: '2px solid #1E40AF', padding: '0.375rem 0.5rem', margin: '0.5rem 0', fontSize: '0.6875rem', fontFamily: 'monospace', color: '#1E40AF' }}>
                    Theorem: [a] = &#123; x &isin; A : x R a &#125; &rArr; A = &cup; [a]
                  </div>

                  {/* Note block 2 */}
                  <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#0F172A', marginTop: '0.75rem', lineHeight: 1.4 }}>
                    <strong>1.2 Exam Model Problem</strong>
                    <p style={{ color: '#475569', fontSize: '0.6875rem', margin: '0.25rem 0' }}>
                      Given set S = &#123;1, 2, 3, 4, 5&#125; modulo 3, write all distinct equivalence classes and prove disjointness.
                    </p>
                  </div>

                  {/* Note block 3 */}
                  <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#0F172A', marginTop: '0.75rem', lineHeight: 1.4 }}>
                    <strong>1.3 Verification Matrix</strong>
                    <div style={{ height: '0.375rem', width: '90%', background: '#E2E8F0', marginTop: '0.25rem' }} />
                    <div style={{ height: '0.375rem', width: '70%', background: '#E2E8F0', marginTop: '0.25rem' }} />
                  </div>
                </div>

                {/* Simulated scrollbar indicator */}
                <div style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '3px',
                  height: 'calc(100% - 8px)',
                  background: '#E2E8F0',
                  borderRadius: '2px',
                }}>
                  <div style={{
                    width: '100%',
                    height: '35%',
                    backgroundColor: '#1E40AF',
                    borderRadius: '2px',
                    transform: `translateY(${notesProgress * 180}%)`,
                    transition: 'transform 0.1s linear',
                  }} />
                </div>
              </div>
            </div>
          </section>

          {/* ─── 4. Message 3 – Video Review ────────────────────────── */}
          <section
            ref={step3Ref}
            className="beat-with-backdrop"
            style={{
              opacity: activeStep >= 3 ? 1 : 0.45,
              transition: 'opacity 0.4s ease',
            }}
          >
            <div className="beat-backdrop-shape beat-backdrop-teal" aria-hidden="true" />
            
            <div className={`beat-heading-teal ${activeStep >= 3 ? 'anim-fly-right' : ''}`}>
              <h2 style={{ color: '#0D9488', fontSize: '1.25rem', fontWeight: 500 }}>
                Some units just make more sense after watching &mdash; Pata video review hapa ndani.
              </h2>
            </div>

            {/* Video clip player simulator (6 seconds) */}
            <div
              className="format-demo-wrap"
              style={{
                background: '#0F172A',
                color: '#FFFFFF',
                padding: '1rem',
                border: '1px solid #334155',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              onClick={() => { setVideoPlaying(true); setVideoProgress(0); }}
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
                  transition: 'background 0.2s ease',
                }}>
                  <span style={{ fontSize: '0.625rem', paddingLeft: '1px', color: '#fff' }}>&#9654;</span>
                </div>
              </div>

              {/* Whiteboard animation simulation */}
              <div style={{ textAlign: 'center', padding: '0.875rem 0' }}>
                <p style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.9)' }}>
                  {videoPlaying ? 'Walking through algorithm trace & diagrams...' : 'Visual walkthrough of complex concepts'}
                </p>
                <div style={{
                  display: 'inline-flex',
                  gap: '0.5rem',
                  marginTop: '0.5rem',
                  fontSize: '0.6875rem',
                  color: '#94A3B8',
                }}>
                  <span>&bull; Step 1: Input Matrix</span>
                  <span>&bull; Step 2: Traverse</span>
                  <span>&bull; Step 3: Result</span>
                </div>
              </div>

              {/* Progress Scrub Bar */}
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.15)', overflow: 'hidden', borderRadius: '2px' }}>
                  <div style={{
                    height: '100%',
                    width: `${videoProgress}%`,
                    background: '#0D9488',
                    transition: 'width 0.1s linear',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', fontFamily: 'monospace', color: '#94A3B8', marginTop: '0.375rem' }}>
                  <span>{videoPlaying ? `00:0${Math.floor(videoProgress / 16)}` : '00:00'}</span>
                  <span>06:00 clip preview</span>
                </div>
              </div>
            </div>
          </section>

          {/* ─── 5. Message 4 – Audio Overview (Typewriter + Soundwave) ─ */}
          <section
            ref={step4Ref}
            className="beat-with-backdrop"
            style={{
              opacity: activeStep >= 4 ? 1 : 0.45,
              transition: 'opacity 0.4s ease',
            }}
          >
            <div className="beat-backdrop-shape beat-backdrop-blue" aria-hidden="true" />
            
            <div className="beat-heading-blue">
              <h2 style={{ color: '#1E40AF', fontSize: '1.25rem', fontWeight: 500, minHeight: '3.25rem' }}>
                {activeStep >= 4 ? audioHookText : ""}
                {activeStep === 4 && audioHookText.length < audioHookFullText.length && (
                  <span className="typewriter-cursor" />
                )}
              </h2>
            </div>

            {/* Audio Overview Player & Soundwave animation */}
            <div
              className="format-demo-wrap"
              style={{
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                padding: '1rem',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              onClick={() => { setAudioPlaying(true); setAudioProgress(0); }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#1E40AF' }}>
                  Audio overview walk-through
                </span>
                <span style={{ fontSize: '0.6875rem', color: audioPlaying ? '#1E40AF' : '#475569', fontWeight: 500 }}>
                  {audioPlaying ? 'Playing overview...' : 'Tap to play audio'}
                </span>
              </div>

              {/* Bouncing Sound-Wave Equalizer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3125rem',
                height: '3.5rem',
                padding: '0 0.5rem',
              }}>
                {[16, 28, 42, 22, 36, 48, 30, 44, 18, 34, 46, 24, 38, 20, 32, 40].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      width: '0.3125rem',
                      height: audioPlaying ? `${((h * 1.2) % 36) + 10}px` : '6px',
                      backgroundColor: '#1E40AF',
                      borderRadius: '2px',
                      opacity: audioPlaying ? 0.9 : 0.35,
                      transition: 'height 160ms ease-in-out, opacity 160ms ease-in-out',
                      transitionDelay: `${(i % 6) * 30}ms`,
                    }}
                  />
                ))}
              </div>

              {/* Audio progress bar */}
              <div style={{ marginTop: '0.625rem' }}>
                <div style={{ width: '100%', height: '3px', background: '#DBEAFE', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${audioProgress}%`,
                    background: '#1E40AF',
                    transition: 'width 0.1s linear',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', color: '#475569', marginTop: '0.375rem' }}>
                  <span>Listen on your commute</span>
                  <span>1.25x high-yield</span>
                </div>
              </div>
            </div>
          </section>

          {/* ─── 6. Message 5 – Slides Hook ─────────────────────────── */}
          <section
            ref={step5Ref}
            className="beat-with-backdrop"
            style={{
              opacity: activeStep >= 5 ? 1 : 0.45,
              transition: 'opacity 0.4s ease',
            }}
          >
            <div className="beat-backdrop-shape beat-backdrop-teal" aria-hidden="true" />
            
            <div className={`beat-heading-teal ${activeStep >= 5 ? 'anim-fly-up' : ''}`}>
              <h2 style={{ color: '#0D9488', fontSize: '1.25rem', fontWeight: 500 }}>
                Need a short version before CATs or exams? Pata slides hapa.
              </h2>
            </div>

            {/* Slide Deck preview */}
            <div
              className="format-demo-wrap"
              style={{
                background: '#F0FDFA',
                border: '1px solid #99F6E4',
                padding: '1rem',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              onClick={() => setSlideIndex((prev) => (prev + 1) % 3)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#0D9488' }}>
                  Exam revision slide deck
                </span>
                <span style={{ fontSize: '0.6875rem', fontFamily: 'monospace', color: '#0D9488', fontWeight: 600 }}>
                  Slide {slideIndex + 1} of 3
                </span>
              </div>

              <div style={{ padding: '0.5rem 0', minHeight: '3.75rem' }}>
                {slideIndex === 0 && (
                  <div>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A' }}>
                      Slide 1: Core Definitions &amp; High-Yield Formulas
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>
                      Quick-reference bullet summary of the top definitions asked in past papers.
                    </p>
                  </div>
                )}
                {slideIndex === 1 && (
                  <div>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A' }}>
                      Slide 2: Architecture &amp; System Flow Diagrams
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>
                      Visual charts to sketch easily in answering 10-mark essay questions.
                    </p>
                  </div>
                )}
                {slideIndex === 2 && (
                  <div>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A' }}>
                      Slide 3: Common Pitfalls &amp; Exam Traps
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>
                      Common student errors pointed out during coursework marking.
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
                      width: slideIndex === i ? '1.25rem' : '0.375rem',
                      backgroundColor: slideIndex === i ? '#0D9488' : '#99F6E4',
                      transition: 'all 0.2s ease',
                    }}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* ─── 7. Bottom Section – Unit Links ─────────────────────── */}
          <section
            ref={unitsRef}
            className="beat section-divider"
            style={{
              paddingTop: '2.5rem',
              borderTop: '1px solid #E2E8F0',
            }}
          >
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 500, color: '#0F172A' }}>
                Pick your unit
              </h2>
              <p style={{ fontSize: '0.8125rem', color: '#475569', marginTop: '0.25rem' }}>
                Direct access to notes, video walkthroughs, audio overviews, and slide packs.
              </p>
            </div>

            {/* 6 large, clear unit tap targets opening in same tab */}
            <div className="unit-grid">
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
                      padding: '1.125rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      minHeight: '5.5rem',
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
          </section>
        </div>

        <footer className="page-footer" style={{ marginTop: '4rem', borderTop: '1px solid #E2E8F0' }}>
          <p className="page-footer-brand" style={{ color: '#0F172A' }}>Plug Wa Notes</p>
          <p style={{ color: '#475569' }}>Kisii University SOEN 2.1</p>
        </footer>
      </main>
    </>
  );
}
