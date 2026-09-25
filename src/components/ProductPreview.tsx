'use client';

import React, { useState, useRef } from 'react';

type PreviewType = 'notes' | 'video' | 'audio' | 'slides' | 'videoSlides' | 'fullPack';

interface ProductPreviewProps {
  type: PreviewType;
  previewSrc?: string;
  previewSlides?: string[];
  disabled?: boolean;
}

function SlidesPreview({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  return (
    <div>
      <img
        src={images[index]}
        alt={`Slide ${index + 1} preview`}
        style={{ width: '100%', display: 'block', borderRadius: '4px 4px 0 0' }}
      />
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.5rem 0.75rem',
        background: '#F8FAFC',
        borderTop: '1px solid var(--line)',
        fontSize: '0.75rem',
        color: 'var(--ink-muted)',
      }}>
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          style={{
            background: 'none', border: 'none', cursor: index === 0 ? 'default' : 'pointer',
            color: index === 0 ? '#CBD5E1' : 'var(--ink-muted)', fontSize: '0.875rem', padding: '0.25rem',
          }}
        >
          ← Prev
        </button>
        <span>{index + 1} / {images.length}</span>
        <button
          onClick={() => setIndex((i) => Math.min(images.length - 1, i + 1))}
          disabled={index === images.length - 1}
          style={{
            background: 'none', border: 'none', cursor: index === images.length - 1 ? 'default' : 'pointer',
            color: index === images.length - 1 ? '#CBD5E1' : 'var(--ink-muted)', fontSize: '0.875rem', padding: '0.25rem',
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

function VideoPreview({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    // Call .play() synchronously within the user gesture (PWA-safe pattern)
    videoRef.current?.play();
  };

  return (
    <div style={{ position: 'relative' }}>
      <video
        ref={videoRef}
        src={src}
        controls
        playsInline
        preload="metadata"
        style={{ width: '100%', display: 'block', maxHeight: '240px', background: '#000' }}
      />
    </div>
  );
}

function AudioPreview({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const handleToggle = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      // Synchronous play call within user gesture — PWA-safe
      audioRef.current.play()
        .then(() => setPlaying(true))
        .catch(() => {});
    } else {
      audioRef.current.pause();
      setPlaying(false);
    }
  };

  return (
    <div style={{ padding: '1rem', background: '#F8FAFC' }}>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        style={{ width: '100%', display: 'block', marginBottom: '0.5rem' }}
        controls
      />
      <div style={{ fontSize: '0.6875rem', color: 'var(--ink-muted)', textAlign: 'center' }}>
        20-second audio highlight
      </div>
    </div>
  );
}

export function ProductPreview({ type, previewSrc, previewSlides, disabled = false }: ProductPreviewProps) {
  const [open, setOpen] = useState(false);

  // Only show for video, audio, slides — notes and packs are disabled by default unless previewSrc given
  const hasPreview = !disabled && (
    (type === 'video' && !!previewSrc) ||
    (type === 'audio' && !!previewSrc) ||
    (type === 'videoSlides' && (!!previewSrc || (previewSlides && previewSlides.length > 0))) ||
    (type === 'notes' && !!previewSrc) ||
    (type === 'slides' && previewSlides && previewSlides.length > 0) ||
    (type === 'fullPack' && !!previewSrc)
  );

  if (!hasPreview) {
    return (
      <div style={{ marginBottom: '0.5rem' }}>
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.75rem',
          color: '#CBD5E1',
          userSelect: 'none',
        }}>
          Preview unavailable
        </span>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.75rem',
          color: open ? 'var(--ink-muted)' : 'var(--blue)',
          background: 'none',
          border: 'none',
          padding: '0.25rem 0',
          cursor: 'pointer',
          textDecoration: 'underline',
          textUnderlineOffset: '2px',
        }}
      >
        {open ? 'Hide preview ↑' : 'Preview ↓'}
      </button>

      {open && (
        <div style={{
          marginTop: '0.5rem',
          borderRadius: '6px',
          overflow: 'hidden',
          border: '1px solid var(--line)',
        }}>
          {type === 'notes' && previewSrc && (
            <img src={previewSrc} alt="Notes page 1 preview" style={{ width: '100%', display: 'block' }} />
          )}
          {type === 'video' && previewSrc && <VideoPreview src={previewSrc} />}
          {type === 'audio' && previewSrc && <AudioPreview src={previewSrc} />}
          {type === 'videoSlides' && (
            previewSlides && previewSlides.length > 0
              ? <SlidesPreview images={previewSlides} />
              : previewSrc
                ? <VideoPreview src={previewSrc} />
                : null
          )}
          {type === 'slides' && previewSlides && previewSlides.length > 0 && (
            <SlidesPreview images={previewSlides} />
          )}
          {type === 'fullPack' && previewSrc && (
            <img src={previewSrc} alt="Pack preview" style={{ width: '100%', display: 'block' }} />
          )}
        </div>
      )}
    </div>
  );
}
