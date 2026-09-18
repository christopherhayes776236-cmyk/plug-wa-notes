import React from 'react';
import Link from 'next/link';
import { Unit } from '@/lib/types';

interface UnitCardProps {
  unit: Unit;
}

export const UnitCard: React.FC<UnitCardProps> = ({ unit }) => {
  const slug = unit.code.toLowerCase().replace(/[^a-z0-9]/g, '');

  return (
    <Link href={`/unit/${slug}`} className="unit-card">
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: '0.625rem' }}>
        <div>
          <span className="unit-card-code">{unit.code}</span>
          <p className="unit-card-name">{unit.name}</p>
        </div>
        <div className="unit-card-footer">
          <span>View study pack</span>
          <span className="unit-card-arrow">&#8594;</span>
        </div>
      </div>
    </Link>
  );
};
