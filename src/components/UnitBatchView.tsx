'use client';

import React, { useState } from 'react';
import { Unit } from '@/lib/types';
import { ProductCard } from './ProductCard';

interface UnitBatchViewProps {
  unit: Unit;
}

export const UnitBatchView: React.FC<UnitBatchViewProps> = ({ unit }) => {
  const sections = unit.sections || [];
  const [activeSectionId, setActiveSectionId] = useState<string>(
    sections[0]?.id || ''
  );

  const activeSection = sections.find((s) => s.id === activeSectionId) || sections[0];

  if (!sections.length) {
    return null;
  }

  return (
    <div className="unit-batch-container">
      {/* ─── Segmented Batch Pill Switcher ─────────────────────── */}
      {sections.length > 1 && (
        <div
          role="tablist"
          aria-label="Study material batches"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.05)',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            borderRadius: '9999px',
            padding: '4px',
            gap: '4px',
            marginBottom: '1.75rem',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}
        >
          {sections.map((section) => {
            const isActive = section.id === activeSection?.id;
            return (
              <button
                key={section.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveSectionId(section.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  padding: '0.625rem 1rem',
                  borderRadius: '9999px',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-display, inherit)',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#FFFFFF' : 'var(--ink-muted, #64748B)',
                  backgroundColor: isActive ? '#0F172A' : 'transparent',
                  boxShadow: isActive
                    ? '0 2px 8px rgba(15, 23, 42, 0.18), 0 1px 2px rgba(15, 23, 42, 0.12)'
                    : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <span>{section.title}</span>
                {section.badge && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      backgroundColor: isActive ? '#10B981' : '#059669',
                      color: '#FFFFFF',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      padding: '0.125rem 0.45rem',
                      borderRadius: '9999px',
                      textTransform: 'uppercase',
                      lineHeight: 1.2,
                    }}
                  >
                    {section.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ─── Active Section Content ────────────────────────────── */}
      {activeSection && (
        <section key={activeSection.id} className="week-section">
          <div className="week-section-header">
            <h2 className="week-section-title">{activeSection.title}</h2>
            <p className="week-section-sub">
              {activeSection.subtitle ||
                'Exam notes, slide blueprint, explainer video, audio overview, and complete study pack.'}
            </p>
          </div>

          <div className="products-stack">
            {activeSection.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                unitCode={unit.code}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
