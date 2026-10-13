'use client';

import React, { useState, useEffect } from 'react';
import { Unit } from '@/lib/types';
import { ProductCard } from './ProductCard';

interface UnitBatchViewProps {
  unit: Unit;
}

export const UnitBatchView: React.FC<UnitBatchViewProps> = ({ unit }) => {
  const sections = unit.sections || [];

  // Track expanded state for each section ID. By default, open the first section.
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sections.forEach((sec, idx) => {
      // First section is open by default
      initial[sec.id] = idx === 0;
    });
    return initial;
  });

  // Track viewed section badges in localStorage so "NEW" disappears automatically once opened
  const [viewedBadges, setViewedBadges] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem('pwn_viewed_badges');
      const parsed: Record<string, boolean> = stored ? JSON.parse(stored) : {};

      const updated = { ...parsed };
      let changed = false;

      // Mark sections that are currently open as viewed
      sections.forEach((sec) => {
        const key = `${unit.code}_${sec.id}`;
        if (openSections[sec.id] && !updated[key]) {
          updated[key] = true;
          changed = true;
        }
      });

      if (changed) {
        localStorage.setItem('pwn_viewed_badges', JSON.stringify(updated));
      }
      setViewedBadges(updated);
    } catch {
      // Ignore localStorage errors
    }
  }, [unit.code]);

  const toggleSection = (sectionId: string) => {
    const willBeOpen = !openSections[sectionId];
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: willBeOpen,
    }));

    if (willBeOpen) {
      const key = `${unit.code}_${sectionId}`;
      setViewedBadges((prev) => {
        if (prev[key]) return prev;
        const next = { ...prev, [key]: true };
        try {
          localStorage.setItem('pwn_viewed_badges', JSON.stringify(next));
        } catch {}
        return next;
      });
    }
  };

  if (!sections.length) {
    return null;
  }

  return (
    <div className="unit-batch-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {sections.map((section) => {
        const isOpen = !!openSections[section.id];
        const productCount = section.products?.length || 0;
        const sectionKey = `${unit.code}_${section.id}`;
        const shouldShowBadge = section.badge && (section.badge !== 'NEW' || !viewedBadges[sectionKey]);

        return (
          <div
            key={section.id}
            style={{
              backgroundColor: 'var(--white, #FFFFFF)',
              borderRadius: '16px',
              border: isOpen ? '1.5px solid #0F172A' : '1px solid rgba(15, 23, 42, 0.09)',
              boxShadow: isOpen
                ? '0 6px 20px -4px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(15, 23, 42, 0.04)'
                : '0 2px 8px -2px rgba(15, 23, 42, 0.04)',
              overflow: 'hidden',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            {/* ─── Clickable Week Button / Accordion Header ─── */}
            <button
              type="button"
              onClick={() => toggleSection(section.id)}
              aria-expanded={isOpen}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.125rem 1.25rem',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                WebkitTapHighlightColor: 'transparent',
                gap: '0.75rem',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-display, inherit)',
                      fontWeight: 700,
                      fontSize: '1.125rem',
                      color: 'var(--ink, #0F172A)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {section.title}
                  </span>

                  {shouldShowBadge && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        backgroundColor: section.badge === 'ASSIGNMENT' ? '#7C3AED' : '#10B981',
                        color: '#FFFFFF',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '9999px',
                        textTransform: 'uppercase',
                        lineHeight: 1.2,
                        transition: 'opacity 0.2s ease',
                      }}
                    >
                      {section.badge}
                    </span>
                  )}
                </div>

                <p
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--ink-muted, #64748B)',
                    margin: '0.25rem 0 0 0',
                    lineHeight: 1.4,
                  }}
                >
                  {section.subtitle || `${productCount} study materials (Notes, Video, Audio, Packs)`}
                </p>
              </div>

              {/* ─── Expand / Collapse Indicator Arrow ─── */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: isOpen ? '#0F172A' : '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background-color 0.2s ease, transform 0.2s ease',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={isOpen ? '#FFFFFF' : '#475569'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </button>

            {/* ─── Accordion Body ─── */}
            {isOpen && (
              <div
                style={{
                  padding: '0 1.25rem 1.25rem 1.25rem',
                  borderTop: '1px solid rgba(15, 23, 42, 0.06)',
                  backgroundColor: '#FAFAF9',
                }}
              >
                <div style={{ marginTop: '1.25rem' }}>
                  <div className="products-stack">
                    {section.products?.map((product) => (
                      <ProductCard key={product.id} product={product} unitCode={unit.code} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
