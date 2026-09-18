'use client';

import React, { useEffect, useRef } from 'react';
import { UNITS } from '@/lib/data';
import { FormatDemo } from '@/components/FormatDemo';
import { UnitCard } from '@/components/UnitCard';

export default function HomePage() {
  const beatsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
    );

    beatsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    // PWA keep-alive ping
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetch('/api/ping').catch(() => {});
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    fetch('/api/ping').catch(() => {});

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <main className="page-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <div className="beats-stack" style={{ flex: 1 }}>

        {/* BEAT 1 — visible immediately */}
        <section className="beat-first">
          <nav className="nav-bar">
            <span className="nav-brand">Plug Wa Notes</span>
            <span className="nav-badge">SOEN 2.1 Kisii</span>
          </nav>

          <h1 className="h1">
            Welcome to your knowledge bank — learning doesn&apos;t have to be boring.
          </h1>
          <p className="text-sm-muted" style={{ marginTop: '0.75rem' }}>
            Curated lecture transcriptions, exam-focused slide decks, and code walk-throughs
            for Kisii University Software Engineering Year 2 Semester 1.
          </p>
        </section>

        {/* BEAT 2 — Notes */}
        <section
          ref={(el) => { beatsRef.current[0] = el; }}
          className="beat"
        >
          <div className="beat-heading-blue">
            <h2>Feeling behind in class? No stress — pata notes kutoka hapa.</h2>
            <p className="text-xs-muted beat-sub">
              Direct from the lecture hall, cleaned into concise printable summaries.
            </p>
          </div>
          <FormatDemo type="notes" />
        </section>

        {/* BEAT 3 — Video */}
        <section
          ref={(el) => { beatsRef.current[1] = el; }}
          className="beat"
        >
          <div className="beat-heading-teal">
            <h2>Some units just make more sense out loud — pata video kutoka hapa.</h2>
            <p className="text-xs-muted beat-sub">
              Visual breakdown of algorithmic logic and complex database schemas.
            </p>
          </div>
          <FormatDemo type="video" />
        </section>

        {/* BEAT 4 — Audio */}
        <section
          ref={(el) => { beatsRef.current[2] = el; }}
          className="beat"
        >
          <div className="beat-heading-teal">
            <h2>Notes on the go? Pata audio kutoka hapa.</h2>
            <p className="text-xs-muted beat-sub">
              Listen to high-yield topic recaps on your daily commute or walk across campus.
            </p>
          </div>
          <FormatDemo type="audio" />
        </section>

        {/* BEAT 5 — Slides */}
        <section
          ref={(el) => { beatsRef.current[3] = el; }}
          className="beat"
        >
          <div className="beat-heading-blue">
            <h2>Need the short version before an exam? Pata slides kutoka hapa.</h2>
            <p className="text-xs-muted beat-sub">
              Quick-revision bullet decks with past exam question models.
            </p>
          </div>
          <FormatDemo type="slides" />
        </section>

        {/* BEAT 6 — Unit Picker */}
        <section
          ref={(el) => { beatsRef.current[4] = el; }}
          className="beat section-divider"
        >
          <h2 className="h2">Pick your unit.</h2>
          <p className="text-xs-muted" style={{ marginTop: '0.25rem' }}>
            Select any of your 6 course units to access individual study packs.
          </p>
          <div className="unit-grid">
            {UNITS.map((unit) => (
              <UnitCard key={unit.code} unit={unit} />
            ))}
          </div>
        </section>
      </div>

      <footer className="page-footer">
        <p className="page-footer-brand">Plug Wa Notes</p>
        <p>Kisii University SOEN 2.1 — Academic Year 2024/2025</p>
        <p className="page-footer-fine">
          Instant download via M-Pesa STK push. No account required.
        </p>
      </footer>
    </main>
  );
}
