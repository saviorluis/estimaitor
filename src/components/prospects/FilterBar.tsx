'use client';

import { Search, X } from 'lucide-react';
import { SEGMENTS } from '@/lib/prospects/filters';
import type { ProspectSegment } from '@/lib/prospects/types';

interface FilterBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  segment: ProspectSegment;
  onSegmentChange: (segment: ProspectSegment) => void;
  counts: Record<ProspectSegment, number>;
  savedOnly: boolean;
  onSavedOnlyChange: (savedOnly: boolean) => void;
  savedCount: number;
  resultCount: number;
}

export default function FilterBar({
  query,
  onQueryChange,
  segment,
  onSegmentChange,
  counts,
  savedOnly,
  onSavedOnlyChange,
  savedCount,
  resultCount,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:max-w-sm">
        <label htmlFor="prospect-search" className="sr-only">
          Search prospects
        </label>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" aria-hidden="true" />
        <input
          id="prospect-search"
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search name, city, ZIP, building or contractor"
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
          maxLength={100}
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Prospect type" className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
          {SEGMENTS.map(({ id, label }) => {
            const active = segment === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => onSegmentChange(id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-slate-700 hover:bg-white/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
              >
                {label}
                <span className="ml-1.5 text-xs tabular-nums text-slate-600 dark:text-slate-300">{counts[id]}</span>
              </button>
            );
          })}
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-3 py-1.5 text-sm text-slate-700 dark:border-slate-600 dark:text-slate-200">
          <input
            type="checkbox"
            checked={savedOnly}
            onChange={(e) => onSavedOnlyChange(e.target.checked)}
            className="h-4 w-4 rounded border-slate-400 text-indigo-600 focus:ring-indigo-500"
          />
          Saved leads only
          <span className="text-xs tabular-nums text-slate-600 dark:text-slate-300">{savedCount}</span>
        </label>

        <p className="text-sm text-slate-600 dark:text-slate-300" aria-live="polite" data-testid="result-count">
          {resultCount} {resultCount === 1 ? 'prospect' : 'prospects'}
        </p>
      </div>
    </div>
  );
}
