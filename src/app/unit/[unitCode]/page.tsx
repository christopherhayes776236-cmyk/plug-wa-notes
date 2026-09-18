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
      {/* Sticky mini header: Back link and unit code */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        backgroundColor: 'rgba(246, 244, 239, 0.96)',
        backdropFilter: 'blur(6px)',
        paddingTop: '0.875rem',
        paddingBottom: '0.875rem',
        borderBottom: '1px solid var(--line)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.75rem',
      }}>
        <Link href="/" className="back-link" style={{ marginBottom: 0 }}>
          <span>&#8592;</span>
          <span>Back</span>
        </Link>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
          fontSize: '0.9375rem',
          color: 'var(--ink)',
        }}>
          {unit.code}
        </span>
      </header>

      {/* Unit description (1-2 sentences) */}
      <section style={{ marginBottom: '1.75rem' }}>
        <h1 className="unit-detail-name" style={{ fontSize: '1.375rem', marginBottom: '0.5rem' }}>
          {unit.name}
        </h1>
        {unit.description && (
          <p style={{ fontSize: '0.875rem', color: 'var(--ink-muted)', lineHeight: 1.55 }}>
            {unit.description}
          </p>
        )}
      </section>

      {/* Stack of 4 product cards in fixed order */}
      <section>
        <div className="products-stack">
          {unit.products.map((product) => (
            <ProductCard key={product.id} product={product} unitCode={unit.code} />
          ))}
        </div>
      </section>

      {/* Re-download & delivery notice */}
      <section style={{
        marginTop: '1.75rem',
        padding: '0.875rem 1rem',
        background: 'var(--white)',
        border: '1px solid var(--line)',
      }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', lineHeight: 1.5 }}>
          Paid materials download directly to your phone. If interrupted, your transaction unlocks an immediate re-download.
        </p>
      </section>

      <footer className="page-footer">
        <p>Plug Wa Notes &middot; Kisii University SOEN 2.1</p>
      </footer>
    </div>
  );
}
