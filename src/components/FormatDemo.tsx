'use client';

import React, { useState } from 'react';

type DemoType = 'notes' | 'video' | 'audio' | 'slides';

interface FormatDemoProps {
  type: DemoType;
}

export const FormatDemo: React.FC<FormatDemoProps> = ({ type }) => {
  const [isActive, setIsActive] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  const triggerDemo = () => {
    if (isActive) return;
    setIsActive(true);

    if (type === 'notes' || type === 'video' || type === 'audio') {
      setTimeout(() => setIsActive(false), 2200);
    } else if (type === 'slides') {
      setSlideIndex(1);
      setTimeout(() => setSlideIndex(2), 700);
      setTimeout(() => { setSlideIndex(0); setIsActive(false); }, 2100);
    }
  };

  return (
    <div
      onClick={triggerDemo}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && triggerDemo()}
      className="format-demo-wrap"
      aria-label={`Tap to preview ${type} demo`}
    >
      <div className="format-demo-header">
        <span className="format-demo-label">Format Preview</span>
        <span style={{ color: isActive ? 'var(--blue)' : 'var(--ink-muted)', transition: 'color 150ms' }}>
          {isActive ? 'Playing demo...' : 'Tap to try demo'}
        </span>
      </div>

      {type === 'notes' && (
        <div style={{
          position: 'relative',
          height: '7rem',
          background: 'var(--paper)',
          border: '1px solid var(--line)',
          padding: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
        }}>
          <div>
            <div style={{ height: '0.625rem', width: '33%', background: 'rgba(36,80,200,0.3)', marginBottom: '0.5rem' }} />
            <p style={{
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              color: 'var(--ink)',
              fontWeight: 500,
              opacity: isActive ? 1 : 0.7,
              transition: 'opacity 500ms',
            }}>
              {isActive
                ? 'Theorem 2.1: Let R be an equivalence relation on set A...'
                : 'Scanned manuscript transcribed into high-clarity formula summary.'}
            </p>
            <div style={{ height: '0.375rem', width: '100%', background: 'var(--line)', marginTop: '0.5rem' }} />
            <div style={{ height: '0.375rem', width: '80%', background: 'var(--line)', marginTop: '0.25rem' }} />
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.625rem',
            color: 'var(--ink-muted)',
            borderTop: '1px solid var(--line)',
            paddingTop: '0.25rem',
          }}>
            <span>Clean Page Layout</span>
            <span style={{ fontFamily: 'monospace' }}>{isActive ? 'Page 2/14' : 'Page 1/14'}</span>
          </div>
        </div>
      )}

      {type === 'video' && (
        <div style={{
          position: 'relative',
          height: '7rem',
          background: 'var(--ink)',
          color: '#fff',
          padding: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.625rem', fontFamily: 'monospace', letterSpacing: '0.07em', color: 'rgba(255,255,255,0.5)' }}>
              1080P EXPLAINER
            </span>
            <div style={{
              width: '1.25rem',
              height: '1.25rem',
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isActive ? 'var(--teal)' : 'transparent',
              transition: 'background 300ms, transform 300ms',
              transform: isActive ? 'scale(1.1)' : 'scale(1)',
            }}>
              <span style={{ fontSize: '0.5625rem', paddingLeft: '1px' }}>&#9654;</span>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)' }}>
              {isActive ? 'Audio breakdown & board markup' : 'Visual step-by-step'}
            </p>
          </div>
          <div>
            <div style={{ width: '100%', height: '0.375rem', background: 'rgba(255,255,255,0.15)', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: isActive ? '100%' : '0%',
                background: 'var(--teal)',
                transition: isActive ? 'width 2000ms linear' : 'width 200ms',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.5625rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>
              <span>{isActive ? '01:42' : '00:00'}</span>
              <span>08:15</span>
            </div>
          </div>
        </div>
      )}

      {type === 'audio' && (
        <div style={{
          position: 'relative',
          height: '7rem',
          background: 'var(--teal-tint)',
          border: '1px solid rgba(21,127,114,0.3)',
          padding: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', fontFamily: 'monospace', fontWeight: 500, color: 'var(--teal)' }}>
            <span>AUDIO WALKTHROUGH</span>
            <span>{isActive ? 'ACTIVE' : 'IDLE'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '0.25rem', height: '3rem' }}>
            {[16, 28, 40, 24, 36, 48, 30, 44, 20, 32, 18, 42, 26, 38, 22].map((h, i) => (
              <div
                key={i}
                style={{
                  width: '0.375rem',
                  height: isActive ? `${(h % 35) + 12}px` : '6px',
                  background: 'var(--teal)',
                  opacity: isActive ? 0.9 : 0.4,
                  transition: 'height 200ms ease-in-out, opacity 200ms',
                  transitionDelay: `${i * 20}ms`,
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', color: 'var(--ink-muted)' }}>
            <span>Fast recap for commute & walking</span>
            <span style={{ fontFamily: 'monospace' }}>1.25x speed</span>
          </div>
        </div>
      )}

      {type === 'slides' && (
        <div style={{
          position: 'relative',
          height: '7rem',
          background: 'var(--blue-tint)',
          border: '1px solid rgba(36,80,200,0.3)',
          padding: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', fontFamily: 'monospace', fontWeight: 500, color: 'var(--blue)' }}>
            <span>EXAM SLIDE DECK</span>
            <span>Slide {slideIndex + 1} of 3</span>
          </div>
          <div style={{ padding: '0.25rem 0' }}>
            {slideIndex === 0 && (
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink)' }}>1. Key Concepts &amp; Definitions</p>
                <p style={{ fontSize: '0.6875rem', color: 'var(--ink-muted)', marginTop: '0.125rem' }}>High-priority exam questions and terminology.</p>
              </div>
            )}
            {slideIndex === 1 && (
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink)' }}>2. Diagram &amp; Data Structures</p>
                <p style={{ fontSize: '0.6875rem', color: 'var(--ink-muted)', marginTop: '0.125rem' }}>Quick-glance breakdown of structural patterns.</p>
              </div>
            )}
            {slideIndex === 2 && (
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink)' }}>3. Common Mistakes &amp; Pitfalls</p>
                <p style={{ fontSize: '0.6875rem', color: 'var(--ink-muted)', marginTop: '0.125rem' }}>Where marks are lost in past papers.</p>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.375rem' }}>
            {[0, 1, 2].map((dot) => (
              <div
                key={dot}
                style={{
                  height: '0.375rem',
                  borderRadius: '9999px',
                  transition: 'width 200ms, background 200ms',
                  width: slideIndex === dot ? '1rem' : '0.375rem',
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
