import type { FactKind, ProspectSegment } from '@/lib/prospects/types';

type Tone = Exclude<ProspectSegment, 'all'>;

export const TONE_LABELS: Record<Tone, string> = {
  commercial: 'Commercial',
  residential: 'Residential',
  construction: 'Construction',
};

export const TONE_PILL: Record<Tone, string> = {
  commercial: 'bg-indigo-50 text-indigo-800 ring-indigo-200 dark:bg-indigo-950 dark:text-indigo-200 dark:ring-indigo-800',
  residential: 'bg-teal-50 text-teal-800 ring-teal-200 dark:bg-teal-950 dark:text-teal-200 dark:ring-teal-800',
  construction: 'bg-amber-50 text-amber-900 ring-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:ring-amber-800',
};

/** Marker fills; paired with white or dark icons that meet contrast on each. */
export const TONE_MARKER: Record<Tone, { fill: string; icon: string }> = {
  commercial: { fill: '#4f46e5', icon: '#ffffff' },
  residential: { fill: '#0f766e', icon: '#ffffff' },
  construction: { fill: '#f59e0b', icon: '#1c1917' },
};

export const FACT_STYLES: Record<FactKind, { label: string; className: string }> = {
  verified: {
    label: 'Verified',
    className: 'bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-800',
  },
  reported: {
    label: 'Reported',
    className: 'bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-950 dark:text-sky-200 dark:ring-sky-800',
  },
  estimated: {
    label: 'Estimated',
    className: 'bg-amber-50 text-amber-900 ring-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:ring-amber-700',
  },
};

export const SURFACE = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700';
export const MUTED_TEXT = 'text-slate-600 dark:text-slate-300';

export function formatIsoDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export const formatNumber = (n: number) => n.toLocaleString('en-US');
