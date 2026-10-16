import { BadgeCheck, Calculator, FileText } from 'lucide-react';
import type { FactKind } from '@/lib/prospects/types';
import { FACT_STYLES } from './styles';

const ICONS: Record<FactKind, typeof BadgeCheck> = {
  verified: BadgeCheck,
  reported: FileText,
  estimated: Calculator,
};

export default function FactBadge({ kind }: { kind: FactKind }) {
  const Icon = ICONS[kind];
  const { label, className } = FACT_STYLES[kind];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}
      data-fact-kind={kind}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
