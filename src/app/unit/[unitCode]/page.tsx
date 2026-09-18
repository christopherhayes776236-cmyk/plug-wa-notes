import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { UNITS, getUnitByCode } from '@/lib/data';
import { ProductCard } from '@/components/ProductCard';

interface UnitPageProps {
  params: Promise<{
    unitCode: string;
  }>;
}

export async function generateStaticParams() {
  return UNITS.map((u) => ({
    unitCode: u.code.toLowerCase().replace(/[^a-z0-9]/g, ''),
  }));
}

export default async function UnitPage({ params }: UnitPageProps) {
  const { unitCode } = await params;
  const unit = getUnitByCode(unitCode);

  if (!unit) {
    notFound();
  }

  return (
    <div className="page-shell">
      {/* Sticky header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: 'rgba(246, 244, 239, 0.95)',
        backdropFilter: 'blur(4px)',
        paddingTop: '0.75rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid var(--line)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
      }}>
        <Link href="/" className="back-link">
          <span>&#8592;</span>
          <span>All Units</span>
        </Link>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: '0.6875rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--ink)',
        }}>
          {unit.code}
        </span>
      </header>

      {/* Unit overview */}
      <section style={{ marginBottom: '2rem' }}>
        <div className="unit-detail-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.625rem' }}>
            <span style={{
              fontSize: '0.6875rem',
              fontFamily: 'monospace',
              padding: '0.125rem 0.5rem',
              background: 'var(--blue-tint)',
              color: 'var(--blue)',
              fontWeight: 500,
              border: '1px solid rgba(36, 80, 200, 0.2)',
            }}>
              {unit.code}
            </span>
            {unit.lecturer && (
              <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
                {unit.lecturer}
              </span>
            )}
          </div>
          <h1 className="unit-detail-name">{unit.name}</h1>
          {unit.description && (
            <p className="unit-detail-lecturer" style={{ marginTop: '0.5rem' }}>
              {unit.description}
            </p>
          )}
        </div>
      </section>

      {/* Products */}
      <section>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '0.625rem',
          borderBottom: '1px solid var(--line)',
          marginBottom: '1rem',
        }}>
          <span style={{
            fontSize: '0.6875rem',
            fontFamily: 'monospace',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            fontWeight: 600,
            color: 'var(--ink-muted)',
          }}>
            Select Product to Download
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--ink-muted)' }}>M-Pesa STK Push</span>
        </div>

        <div className="products-stack">
          {unit.products.map((product) => (
            <ProductCard key={product.id} product={product} unitCode={unit.code} />
          ))}
        </div>
      </section>

      {/* Guarantee note */}
      <section style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: 'var(--white)',
        border: '1px solid var(--line)',
      }}>
        <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--ink)', marginBottom: '0.375rem' }}>
          Instant Delivery Guarantee
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', lineHeight: 1.55 }}>
          Files download directly to your browser upon M-Pesa PIN confirmation.
          If your connection interrupts, your transaction ID allows an immediate re-download.
        </p>
      </section>

      <footer className="page-footer">
        <p>Plug Wa Notes · Kisii University SOEN 2.1</p>
      </footer>
    </div>
  );
}
