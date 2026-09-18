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
      { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.1 }
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

        {/* BEAT 1 — Opening (visible immediately, no scroll needed) */}
        <section className="beat-first">
          <nav className="nav-bar">
            <span className="nav-brand">Plug Wa Notes</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>Kisii University</span>
          </nav>

          <h1 className="h1">
            Welcome to your knowledge bank — learning doesn&apos;t have to be boring.
          </h1>
        </section>

        {/* BEAT 2 — Notes */}
        <section
          ref={(el) => { beatsRef.current[0] = el; }}
          className="beat beat-with-backdrop"
        >
          <div className="beat-backdrop-shape beat-backdrop-blue" aria-hidden="true" />
          <div className="beat-heading-blue">
            <h2>Feeling behind in class? No stress — pata notes kutoka hapa.</h2>
          </div>
          <FormatDemo type="notes" />
        </section>

        {/* BEAT 3 — Video */}
        <section
          ref={(el) => { beatsRef.current[1] = el; }}
          className="beat beat-with-backdrop"
        >
          <div className="beat-backdrop-shape beat-backdrop-teal" aria-hidden="true" />
          <div className="beat-heading-teal">
            <h2>Some units just make more sense out loud — pata video kutoka hapa.</h2>
          </div>
          <FormatDemo type="video" />
        </section>

        {/* BEAT 4 — Audio */}
        <section
          ref={(el) => { beatsRef.current[2] = el; }}
          className="beat beat-with-backdrop"
        >
          <div className="beat-backdrop-shape beat-backdrop-teal" aria-hidden="true" />
          <div className="beat-heading-teal">
            <h2>Notes on the go? Pata audio kutoka hapa.</h2>
          </div>
          <FormatDemo type="audio" />
        </section>

        {/* BEAT 5 — Slides */}
        <section
          ref={(el) => { beatsRef.current[3] = el; }}
          className="beat beat-with-backdrop"
        >
          <div className="beat-backdrop-shape beat-backdrop-blue" aria-hidden="true" />
          <div className="beat-heading-blue">
            <h2>Need the short version before an exam? Pata slides kutoka hapa.</h2>
          </div>
          <FormatDemo type="slides" />
        </section>

        {/* BEAT 6 — Unit Picker (closing beat: plain 2-col grid, no prices) */}
        <section
          ref={(el) => { beatsRef.current[4] = el; }}
          className="beat section-divider"
        >
          <h2 className="h2" style={{ marginBottom: '1rem' }}>Pick your unit.</h2>
          <div className="unit-grid">
            {UNITS.map((unit) => (
              <UnitCard key={unit.code} unit={unit} />
            ))}
          </div>
        </section>
      </div>

      <footer className="page-footer">
        <p className="page-footer-brand">Plug Wa Notes</p>
        <p>Kisii University SOEN 2.1</p>
      </footer>
    </main>
  );
}
