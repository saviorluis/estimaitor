'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { AlertTriangle, Eye, EyeOff, Info, List, Map as MapIcon, Plus } from 'lucide-react';
import {
  buildProspectSearch,
  countBySegment,
  filterProspects,
  getSegment,
  parseProspectUrlState,
  prospectCoordinates,
  prospectName,
  type ProspectUrlState,
} from '@/lib/prospects/filters';
import { buildDraftEstimateHandoff, writeDraftEstimateHandoff } from '@/lib/prospects/estimateHandoff';
import { draftFromProspect, emptyDraft } from '@/lib/prospects/manualProspectForm';
import { loadProspects } from '@/lib/prospects/repository';
import type { AnyProspect, ManualProspect, Prospect } from '@/lib/prospects/types';
import type { MapMarker } from '@/lib/maps/MapAdapter';
import FilterBar from './FilterBar';
import ManualProspectDetail from './ManualProspectDetail';
import ProspectCard from './ProspectCard';
import ProspectDetail from './ProspectDetail';
import ProspectForm from './ProspectForm';
import { EmptyState, ErrorState, LoadingState, NoDataState } from './StateViews';
import SampleMap from './map/SampleMap';
import { useLeads } from './useLeads';
import { useManualProspects } from './useManualProspects';

type LoadState = { status: 'loading' } | { status: 'ready'; prospects: Prospect[] } | { status: 'error'; message: string };

const DESKTOP_QUERY = '(min-width: 1024px)';
/** Same key the estimator page reads to restore its mode; a draft estimate always opens the final-cleaning form. */
const APP_MODE_KEY = 'estimaitor_app_mode';

function useIsDesktop(): boolean | null {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return isDesktop;
}

const BANNER = 'flex flex-wrap items-start gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200';
const LINK_BUTTON = 'inline-flex items-center gap-1 font-medium text-indigo-700 underline hover:text-indigo-900 dark:text-indigo-300 dark:hover:text-indigo-100';

export default function ProspectsExplorer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlState = useMemo(() => parseProspectUrlState(searchParams), [searchParams]);
  const urlStateRef = useRef(urlState);
  urlStateRef.current = urlState;

  const [load, setLoad] = useState<LoadState>({ status: 'loading' });
  const leads = useLeads();
  const manual = useManualProspects();
  const isDesktop = useIsDesktop();
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [handoffError, setHandoffError] = useState<string | null>(null);

  // The search box updates results immediately; the URL follows after a short pause.
  const [queryInput, setQueryInput] = useState(urlState.query);
  const syncedQuery = useRef(urlState.query);

  // Next 14 syncs useSearchParams with the History API, so filters update without a server round-trip.
  const navigate = useCallback(
    (patch: Partial<ProspectUrlState>, mode: 'push' | 'replace') => {
      const url = `${pathname}${buildProspectSearch({ ...urlStateRef.current, ...patch })}`;
      if (mode === 'push') window.history.pushState(null, '', url);
      else window.history.replaceState(null, '', url);
    },
    [pathname]
  );

  useEffect(() => {
    if (urlState.query !== syncedQuery.current) {
      syncedQuery.current = urlState.query;
      setQueryInput(urlState.query);
    }
  }, [urlState.query]);

  useEffect(() => {
    if (queryInput === syncedQuery.current) return;
    const timer = setTimeout(() => {
      syncedQuery.current = queryInput;
      navigate({ query: queryInput }, 'replace');
    }, 250);
    return () => clearTimeout(timer);
  }, [queryInput, navigate]);

  const fetchProspects = useCallback(() => {
    setLoad({ status: 'loading' });
    loadProspects()
      .then((prospects) => setLoad({ status: 'ready', prospects }))
      .catch(() => setLoad({ status: 'error', message: 'Prospects could not be loaded.' }));
  }, []);
  useEffect(fetchProspects, [fetchProspects]);

  const sample = useMemo(() => (load.status === 'ready' ? load.prospects : []), [load]);
  const prospects: AnyProspect[] = useMemo(
    () => [...manual.prospects, ...(manual.showSampleData ? sample : [])],
    [manual.prospects, manual.showSampleData, sample]
  );
  // Duplicate checks look at every record, including hidden sample data.
  const allRecords: AnyProspect[] = useMemo(() => [...manual.prospects, ...sample], [manual.prospects, sample]);
  // Records you entered are always "saved"; sample records count once saved as a lead.
  const savedIds = useMemo(
    () => new Set([...Array.from(leads.savedIds), ...manual.prospects.map((p) => p.id)]),
    [leads.savedIds, manual.prospects]
  );

  const filter = { query: queryInput, segment: urlState.segment, savedOnly: urlState.savedOnly };
  const results = filterProspects(prospects, filter, savedIds);
  const counts = countBySegment(prospects, { query: queryInput, savedOnly: urlState.savedOnly }, savedIds);
  const selected = urlState.selectedId ? prospects.find((p) => p.id === urlState.selectedId) || null : null;

  const editing: ManualProspect | null =
    urlState.edit && urlState.edit !== 'new' ? manual.prospects.find((p) => p.id === urlState.edit) || null : null;
  const formMode: 'new' | 'edit' | null = !manual.editable ? null : urlState.edit === 'new' ? 'new' : editing ? 'edit' : null;

  const markers: MapMarker[] = useMemo(() => {
    const shown = selected && !results.includes(selected) ? [...results, selected] : results;
    return shown.flatMap((p) => {
      const coords = prospectCoordinates(p);
      if (!coords) return [];
      return [
        {
          id: p.id,
          lat: coords.lat,
          lng: coords.lng,
          label: `${prospectName(p)}, ${p.address.city}`,
          tone: getSegment(p),
          saved: leads.savedIds.has(p.id),
          origin: p.kind === 'manual' ? ('manual' as const) : ('sample' as const),
        },
      ];
    });
  }, [results, selected, leads.savedIds]);

  // Back closes a detail opened from this page; a detail opened from a shared link closes in place.
  const openedHere = useRef(false);
  const formOpenedHere = useRef(false);
  const lastSelectedId = useRef<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formHeadingRef = useRef<HTMLHeadingElement>(null);

  const select = useCallback(
    (id: string) => {
      if (urlStateRef.current.selectedId === id) return;
      const alreadyOpen = Boolean(urlStateRef.current.selectedId);
      if (!alreadyOpen) openedHere.current = true;
      navigate({ selectedId: id }, alreadyOpen ? 'replace' : 'push');
    },
    [navigate]
  );

  const close = useCallback(() => {
    if (openedHere.current) {
      openedHere.current = false;
      window.history.back();
    } else {
      navigate({ selectedId: null }, 'replace');
    }
  }, [navigate]);

  const openForm = (edit: string) => {
    formOpenedHere.current = true;
    navigate({ edit }, 'push');
  };

  const closeForm = () => {
    if (formOpenedHere.current) {
      formOpenedHere.current = false;
      window.history.back();
    } else {
      navigate({ edit: null }, 'replace');
    }
  };

  const onSaved = (id: string) => {
    if (formMode === 'edit' && formOpenedHere.current) {
      formOpenedHere.current = false;
      window.history.back();
      return;
    }
    // A new record replaces the form entry, so Back from its detail returns to the list.
    if (formOpenedHere.current && !urlStateRef.current.selectedId) openedHere.current = true;
    formOpenedHere.current = false;
    navigate({ edit: null, selectedId: id }, 'replace');
  };

  const deleteSelected = (id: string) => {
    const result = manual.remove(id);
    if (result.ok) {
      lastSelectedId.current = null;
      openedHere.current = false;
      navigate({ selectedId: null, edit: null }, 'replace');
      requestAnimationFrame(() => document.getElementById('prospect-search')?.focus());
    }
    return result;
  };

  const createDraftEstimate = (prospect: ManualProspect) => {
    setHandoffError(null);
    const ok = writeDraftEstimateHandoff(window.localStorage, buildDraftEstimateHandoff(prospect));
    if (!ok) {
      setHandoffError('Browser storage is unavailable, so the draft estimate could not be started.');
      return;
    }
    try {
      window.localStorage.setItem(APP_MODE_KEY, 'cleaning');
    } catch {
      // The estimator falls back to its saved mode; the draft still applies when the cleaning form is shown.
    }
    window.location.assign('/');
  };

  useEffect(() => {
    if (formMode) {
      formHeadingRef.current?.focus();
      window.scrollTo({ top: 0 });
    }
  }, [formMode]);

  useEffect(() => {
    if (formMode) return;
    if (selected) {
      lastSelectedId.current = selected.id;
      headingRef.current?.focus();
      if (isDesktop === false) window.scrollTo({ top: 0 });
      return;
    }
    if (!urlState.selectedId) openedHere.current = false;
    const previous = lastSelectedId.current;
    lastSelectedId.current = null;
    if (previous) {
      const card = document.querySelector<HTMLElement>(`[data-prospect-id="${previous}"]`);
      (card || document.getElementById('prospect-search'))?.focus();
    }
  }, [selected?.id, urlState.selectedId, isDesktop, formMode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selected || formMode) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      if (e.key === 'Escape' && !typing) close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, close, formMode]);

  const clearFilters = () => {
    setQueryInput('');
    syncedQuery.current = '';
    navigate({ query: '', segment: 'all', savedOnly: false }, 'replace');
  };

  const ready = load.status !== 'loading' && manual.status !== 'loading' && isDesktop !== null;
  const manualResults = results.filter((p) => p.kind === 'manual');
  const sampleResults = results.filter((p) => p.kind !== 'manual');

  const renderCards = (items: AnyProspect[], label: string) => (
    <ul className="space-y-3" aria-label={label}>
      {items.map((p) => (
        <li key={p.id}>
          <ProspectCard
            prospect={p}
            lead={leads.byProspect.get(p.id)}
            highlighted={highlightedId === p.id || urlState.selectedId === p.id}
            onSelect={select}
            onHighlight={setHighlightedId}
          />
        </li>
      ))}
    </ul>
  );

  const groupHeading = 'mb-2 text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300';
  const listPanel = !ready ? (
    <LoadingState />
  ) : load.status === 'error' ? (
    <ErrorState message={load.message} onRetry={fetchProspects} />
  ) : prospects.length === 0 ? (
    <NoDataState
      onAdd={manual.editable ? () => openForm('new') : undefined}
      onShowSample={manual.showSampleData ? undefined : () => manual.setShowSampleData(true)}
    />
  ) : results.length === 0 ? (
    <EmptyState onClear={clearFilters} savedOnly={urlState.savedOnly} />
  ) : manual.prospects.length === 0 ? (
    <div data-testid="prospect-results">{renderCards(results, 'Prospect results')}</div>
  ) : (
    <div className="space-y-5" data-testid="prospect-results">
      {manualResults.length > 0 && (
        <section aria-labelledby="your-prospects-heading">
          <h2 id="your-prospects-heading" className={groupHeading}>
            Your prospects · {manualResults.length}
          </h2>
          {renderCards(manualResults, 'Your prospects')}
        </section>
      )}
      {sampleResults.length > 0 && (
        <section aria-labelledby="sample-prospects-heading">
          <h2 id="sample-prospects-heading" className={groupHeading}>
            Sample data · {sampleResults.length}
          </h2>
          {renderCards(sampleResults, 'Sample prospects')}
        </section>
      )}
    </div>
  );

  const detail =
    selected &&
    (selected.kind === 'manual' ? (
      <ManualProspectDetail
        key={selected.id}
        ref={headingRef}
        prospect={selected}
        editable={manual.editable}
        onClose={close}
        closeLabel={isDesktop ? 'Back to results' : 'Back'}
        onEdit={() => openForm(selected.id)}
        onDelete={() => deleteSelected(selected.id)}
        onCreateDraftEstimate={() => createDraftEstimate(selected)}
      />
    ) : (
      <ProspectDetail ref={headingRef} prospect={selected} leads={leads} onClose={close} closeLabel={isDesktop ? 'Back to results' : 'Back'} />
    ));

  const map = (
    <SampleMap
      markers={ready ? markers : []}
      selectedId={urlState.selectedId}
      highlightedId={highlightedId}
      onSelect={select}
      onHighlight={setHighlightedId}
      ariaLabel="Schematic map of prospects"
    />
  );

  const showMobileDetail = isDesktop === false && selected;
  const sampleCount = sample.length;

  const header = (
    <header className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Prospects</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-300">
            Commercial buildings, homes and construction projects worth a cleaning or window bid.
          </p>
        </div>
        {!formMode && (
          <button
            type="button"
            onClick={() => openForm('new')}
            disabled={!manual.editable}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Prospect
          </button>
        )}
      </div>
      {manual.status === 'unreadable' && (
        <p role="alert" className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {manual.error} They are left untouched, and adding or editing prospects is turned off.
        </p>
      )}
      {leads.status === 'unreadable' && (
        <p role="alert" className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {leads.error} Saved leads are left untouched, and lead editing is turned off.
        </p>
      )}
      {handoffError && (
        <p role="alert" className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {handoffError}
        </p>
      )}
      {!formMode && (
        <div className={BANNER} data-testid="sample-data-banner">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {manual.showSampleData ? (
            <p className="flex-1">
              {manual.prospects.length === 0
                ? 'Demo with fictional sample data. These are not real properties, projects, or contacts. Add Prospect to enter a real one.'
                : 'Sample records are fictional and marked Sample data. Records you entered are marked Your data.'}{' '}
              <button type="button" onClick={() => manual.setShowSampleData(false)} className={LINK_BUTTON}>
                <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                Hide sample data
              </button>
            </p>
          ) : (
            <p className="flex-1">
              Sample data is hidden ({sampleCount} fictional records kept, not deleted).{' '}
              <button type="button" onClick={() => manual.setShowSampleData(true)} className={LINK_BUTTON}>
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                Show sample data
              </button>
            </p>
          )}
        </div>
      )}
      {!formMode && (
        <FilterBar
          query={queryInput}
          onQueryChange={setQueryInput}
          segment={urlState.segment}
          onSegmentChange={(segment) => navigate({ segment }, 'replace')}
          counts={counts}
          savedOnly={urlState.savedOnly}
          onSavedOnlyChange={(savedOnly) => navigate({ savedOnly }, 'replace')}
          savedCount={savedIds.size}
          resultCount={results.length}
        />
      )}
    </header>
  );

  if (formMode && ready) {
    return (
      <div className="space-y-4">
        {header}
        <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-700 dark:bg-slate-800">
          <ProspectForm
            key={urlState.edit || 'new'}
            ref={formHeadingRef}
            mode={formMode}
            initialDraft={editing ? draftFromProspect(editing) : emptyDraft()}
            editingId={editing?.id}
            existing={allRecords}
            onSave={(fields) => (editing ? manual.update(editing.id, fields) : manual.create(fields))}
            onSaved={onSaved}
            onCancel={closeForm}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!showMobileDetail && header}

      {isDesktop !== false ? (
        <div className="grid gap-4 lg:h-[calc(100vh-17rem)] lg:min-h-[560px] lg:grid-cols-[380px_minmax(0,1fr)]">
          <div className="min-h-0 overflow-y-auto rounded-xl lg:pr-1" data-testid="prospect-panel">
            {detail ? <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">{detail}</div> : listPanel}
          </div>
          <div className="hidden min-h-0 lg:block">{map}</div>
        </div>
      ) : showMobileDetail ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800" data-testid="prospect-panel">
          {detail}
        </div>
      ) : (
        <>
          <div role="group" aria-label="Show results as" className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
            {(['list', 'map'] as const).map((view) => {
              const active = urlState.view === view;
              const ViewIcon = view === 'list' ? List : MapIcon;
              return (
                <button
                  key={view}
                  type="button"
                  aria-pressed={active}
                  onClick={() => navigate({ view }, 'replace')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium ${
                    active ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <ViewIcon className="h-4 w-4" aria-hidden="true" />
                  {view === 'list' ? 'List' : 'Map'}
                </button>
              );
            })}
          </div>
          {urlState.view === 'map' ? <div className="h-[65vh]">{map}</div> : <div data-testid="prospect-panel">{listPanel}</div>}
        </>
      )}
    </div>
  );
}
