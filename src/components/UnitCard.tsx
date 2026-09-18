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
      <span className="unit-card-code">{unit.code}</span>
      <p className="unit-card-name">{unit.name}</p>
    </Link>
  );
};
