'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { AlertTriangle, Info, List, Map as MapIcon } from 'lucide-react';
import {
  buildProspectSearch,
  countBySegment,
  filterProspects,
  getSegment,
  parseProspectUrlState,
  type ProspectUrlState,
} from '@/lib/prospects/filters';
import { loadProspects } from '@/lib/prospects/repository';
import type { Prospect } from '@/lib/prospects/types';
import type { MapMarker } from '@/lib/maps/MapAdapter';
import FilterBar from './FilterBar';
import ProspectCard from './ProspectCard';
import ProspectDetail from './ProspectDetail';
import { EmptyState, ErrorState, LoadingState } from './StateViews';
import SampleMap from './map/SampleMap';
import { useLeads } from './useLeads';

type LoadState = { status: 'loading' } | { status: 'ready'; prospects: Prospect[] } | { status: 'error'; message: string };

const DESKTOP_QUERY = '(min-width: 1024px)';

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

export default function ProspectsExplorer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlState = useMemo(() => parseProspectUrlState(searchParams), [searchParams]);
  const urlStateRef = useRef(urlState);
  urlStateRef.current = urlState;

  const [load, setLoad] = useState<LoadState>({ status: 'loading' });
  const leads = useLeads();
  const isDesktop = useIsDesktop();
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

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

  const prospects = load.status === 'ready' ? load.prospects : [];
  const filter = { query: queryInput, segment: urlState.segment, savedOnly: urlState.savedOnly };
  const results = filterProspects(prospects, filter, leads.savedIds);
  const counts = countBySegment(prospects, { query: queryInput, savedOnly: urlState.savedOnly }, leads.savedIds);
  const selected = urlState.selectedId ? prospects.find((p) => p.id === urlState.selectedId) || null : null;

  const markers: MapMarker[] = useMemo(() => {
    const shown = selected && !results.includes(selected) ? [...results, selected] : results;
    return shown.map((p) => ({
      id: p.id,
      lat: p.location.lat,
      lng: p.location.lng,
      label: `${p.name}, ${p.address.city}`,
      tone: getSegment(p),
      saved: leads.savedIds.has(p.id),
    }));
  }, [results, selected, leads.savedIds]);

  // Back closes a detail opened from this page; a detail opened from a shared link closes in place.
  const openedHere = useRef(false);
  const lastSelectedId = useRef<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

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

  useEffect(() => {
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
  }, [selected, urlState.selectedId, isDesktop]);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      if (e.key === 'Escape' && !typing) close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, close]);

  const clearFilters = () => {
    setQueryInput('');
    syncedQuery.current = '';
    navigate({ query: '', segment: 'all', savedOnly: false }, 'replace');
  };

  const listPanel =
    load.status === 'loading' || isDesktop === null ? (
      <LoadingState />
    ) : load.status === 'error' ? (
      <ErrorState message={load.message} onRetry={fetchProspects} />
    ) : results.length === 0 ? (
      <EmptyState onClear={clearFilters} savedOnly={urlState.savedOnly} />
    ) : (
      <ul className="space-y-3" aria-label="Prospect results">
        {results.map((p) => (
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

  const detail = selected && (
    <ProspectDetail
      ref={headingRef}
      prospect={selected}
      leads={leads}
      onClose={close}
      closeLabel={isDesktop ? 'Back to results' : 'Back'}
    />
  );

  const map = (
    <SampleMap
      markers={load.status === 'ready' ? markers : []}
      selectedId={urlState.selectedId}
      highlightedId={highlightedId}
      onSelect={select}
      onHighlight={setHighlightedId}
      ariaLabel="Sample map of prospects"
    />
  );

  const showMobileDetail = isDesktop === false && selected;

  return (
    <div className="space-y-4">
      {!showMobileDetail && (
        <header className="space-y-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Prospects</h1>
            <p className="mt-1 text-slate-600 dark:text-slate-300">
              Commercial buildings, homes and construction projects worth a cleaning or window bid.
            </p>
          </div>
          <p className="flex gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            Demo with fictional sample data. These are not real properties, projects, or contacts.
          </p>
          {leads.status === 'unreadable' && (
            <p role="alert" className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {leads.error} Saved leads are left untouched, and lead editing is turned off.
            </p>
          )}
          <FilterBar
            query={queryInput}
            onQueryChange={setQueryInput}
            segment={urlState.segment}
            onSegmentChange={(segment) => navigate({ segment }, 'replace')}
            counts={counts}
            savedOnly={urlState.savedOnly}
            onSavedOnlyChange={(savedOnly) => navigate({ savedOnly }, 'replace')}
            savedCount={leads.savedIds.size}
            resultCount={results.length}
          />
        </header>
      )}

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
