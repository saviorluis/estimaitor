'use client';

import { useState } from 'react';
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { SEGMENTS, SORTS, type ProspectSort, type ProspectUrlState } from '@/lib/prospects/filters';
import {
  COUNT_CONFIDENCES,
  COUNT_CONFIDENCE_LABELS,
  MANUAL_SOURCE_LABELS,
  MANUAL_SOURCE_TYPES,
  PROSPECT_STATUSES,
  PROSPECT_STATUS_LABELS,
  type ProspectSegment,
} from '@/lib/prospects/types';

export interface ActiveFilter {
  key: string;
  label: string;
  onRemove: () => void;
}

interface FilterBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  view: ProspectUrlState;
  onViewChange: (patch: Partial<ProspectUrlState>) => void;
  counts: Record<ProspectSegment, number>;
  savedCount: number;
  resultCount: number;
  sampleHidden: boolean;
  hasYourProspects: boolean;
  activeFilters: ActiveFilter[];
  onClearAll: () => void;
}

const SELECT =
  'w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100';
const SMALL_LABEL = 'block text-xs font-medium text-slate-700 dark:text-slate-200';

export default function FilterBar({
  query,
  onQueryChange,
  view,
  onViewChange,
  counts,
  savedCount,
  resultCount,
  sampleHidden,
  hasYourProspects,
  activeFilters,
  onClearAll,
}: FilterBarProps) {
  const [open, setOpen] = useState(false);
  const panelCount = [view.scope !== 'all', view.status, view.source, view.confidence, view.mapped !== 'all'].filter(Boolean).length;

  return (
    <div className="space-y-2">
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
            placeholder="Search name, address, ZIP or notes"
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
              const active = view.segment === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onViewChange({ segment: id })}
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
              checked={view.savedOnly}
              onChange={(e) => onViewChange({ savedOnly: e.target.checked })}
              className="h-4 w-4 rounded border-slate-400 text-indigo-600 focus:ring-indigo-500"
            />
            Saved leads only
            <span className="text-xs tabular-nums text-slate-600 dark:text-slate-300">{savedCount}</span>
          </label>

          <button
            type="button"
            aria-expanded={open}
            aria-controls={open ? 'prospect-filter-panel' : undefined}
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Filters
            {panelCount > 0 && (
              <span className="rounded-full bg-slate-900 px-1.5 text-xs text-white dark:bg-white dark:text-slate-900">{panelCount}</span>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>

          {hasYourProspects && (
            <span className="inline-flex items-center gap-1.5">
              <label htmlFor="prospect-sort" className="text-sm text-slate-700 dark:text-slate-200">
                Sort
              </label>
              <select
                id="prospect-sort"
                value={view.sort}
                onChange={(e) => onViewChange({ sort: e.target.value as ProspectSort })}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                aria-describedby="prospect-sort-hint"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <span id="prospect-sort-hint" className="sr-only">
                Sorts your prospects. Sample data keeps its order.
              </span>
            </span>
          )}

          <p className="text-sm text-slate-600 dark:text-slate-300" aria-live="polite" data-testid="result-count">
            {resultCount} {resultCount === 1 ? 'prospect' : 'prospects'}
          </p>
        </div>
      </div>

      {open && <FilterPanel view={view} onViewChange={onViewChange} sampleHidden={sampleHidden} />}

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2" aria-label="Active filters" role="group">
          {activeFilters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={f.onRemove}
              aria-label={`Remove filter: ${f.label}`}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-800 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
            >
              {f.label}
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          ))}
          <button type="button" onClick={onClearAll} className="text-xs font-medium text-indigo-700 underline dark:text-indigo-300">
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

function FilterPanel({
  view,
  onViewChange,
  sampleHidden,
}: Pick<FilterBarProps, 'view' | 'onViewChange' | 'sampleHidden'>) {
  return (
    <div id="prospect-filter-panel" className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div>
          <label htmlFor="filter-data" className={SMALL_LABEL}>
            Data
          </label>
          <select id="filter-data" value={view.scope} onChange={(e) => onViewChange({ scope: e.target.value as ProspectUrlState['scope'] })} className={SELECT}>
            <option value="all">All</option>
            <option value="mine">Your prospects</option>
            <option value="sample" disabled={sampleHidden}>
              {sampleHidden ? 'Sample data (hidden)' : 'Sample data'}
            </option>
          </select>
        </div>
        <div>
          <label htmlFor="filter-status" className={SMALL_LABEL}>
            Status
          </label>
          <select id="filter-status" value={view.status || ''} onChange={(e) => onViewChange({ status: (e.target.value || null) as ProspectUrlState['status'] })} className={SELECT}>
            <option value="">Any</option>
            {PROSPECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {PROSPECT_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-source" className={SMALL_LABEL}>
            Source
          </label>
          <select id="filter-source" value={view.source || ''} onChange={(e) => onViewChange({ source: (e.target.value || null) as ProspectUrlState['source'] })} className={SELECT}>
            <option value="">Any</option>
            {MANUAL_SOURCE_TYPES.map((s) => (
              <option key={s} value={s}>
                {MANUAL_SOURCE_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-confidence" className={SMALL_LABEL}>
            Count confidence
          </label>
          <select
            id="filter-confidence"
            value={view.confidence || ''}
            onChange={(e) => onViewChange({ confidence: (e.target.value || null) as ProspectUrlState['confidence'] })}
            className={SELECT}
          >
            <option value="">Any</option>
            {COUNT_CONFIDENCES.map((c) => (
              <option key={c} value={c}>
                {COUNT_CONFIDENCE_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-map" className={SMALL_LABEL}>
            Map
          </label>
          <select id="filter-map" value={view.mapped} onChange={(e) => onViewChange({ mapped: e.target.value as ProspectUrlState['mapped'] })} className={SELECT}>
            <option value="all">Any</option>
            <option value="mapped">On map</option>
            <option value="unmapped">Not on map</option>
          </select>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">Status, source and confidence filters show your prospects only.</p>
    </div>
  );
}
