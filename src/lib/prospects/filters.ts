import type { Prospect, ProspectSegment } from './types';

export const SEGMENTS: { id: ProspectSegment; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'residential', label: 'Residential' },
  { id: 'construction', label: 'Construction' },
];

/** Construction projects get their own tab; existing buildings are grouped by category. */
export function getSegment(prospect: Prospect): Exclude<ProspectSegment, 'all'> {
  return prospect.kind === 'construction' ? 'construction' : prospect.category;
}

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

function searchableText(prospect: Prospect): string {
  const parts = [
    prospect.name,
    prospect.address.line1,
    prospect.address.city,
    prospect.address.state,
    prospect.address.zip || '',
  ];
  if (prospect.kind === 'property') {
    parts.push(prospect.buildingType.value);
  } else {
    parts.push(prospect.projectType, prospect.generalContractor?.value || '');
  }
  return normalize(parts.join(' '));
}

/** Every word in the query must appear somewhere in the prospect's name, address, type, or contractor. */
export function matchesQuery(prospect: Prospect, query: string): boolean {
  const words = normalize(query).split(' ').filter(Boolean);
  if (words.length === 0) return true;
  const haystack = searchableText(prospect);
  return words.every((word) => haystack.includes(word));
}

export interface ProspectFilter {
  query: string;
  segment: ProspectSegment;
  savedOnly: boolean;
}

export function filterProspects(
  prospects: Prospect[],
  filter: ProspectFilter,
  savedProspectIds: ReadonlySet<string> = new Set()
): Prospect[] {
  return prospects.filter(
    (p) =>
      (filter.segment === 'all' || getSegment(p) === filter.segment) &&
      (!filter.savedOnly || savedProspectIds.has(p.id)) &&
      matchesQuery(p, filter.query)
  );
}

/** Counts per tab for the current search, so each tab shows how many results it would give. */
export function countBySegment(
  prospects: Prospect[],
  filter: Omit<ProspectFilter, 'segment'>,
  savedProspectIds: ReadonlySet<string> = new Set()
): Record<ProspectSegment, number> {
  const counts: Record<ProspectSegment, number> = { all: 0, commercial: 0, residential: 0, construction: 0 };
  for (const p of filterProspects(prospects, { ...filter, segment: 'all' }, savedProspectIds)) {
    counts.all++;
    counts[getSegment(p)]++;
  }
  return counts;
}

export type ProspectView = 'list' | 'map';

export interface ProspectUrlState {
  query: string;
  segment: ProspectSegment;
  savedOnly: boolean;
  selectedId: string | null;
  view: ProspectView;
}

const SEGMENT_IDS = SEGMENTS.map((s) => s.id);

export function parseProspectUrlState(params: { get(name: string): string | null }): ProspectUrlState {
  const segment = params.get('type') as ProspectSegment | null;
  return {
    query: (params.get('q') || '').slice(0, 100),
    segment: segment && SEGMENT_IDS.includes(segment) ? segment : 'all',
    savedOnly: params.get('saved') === '1',
    selectedId: params.get('id') || null,
    view: params.get('view') === 'map' ? 'map' : 'list',
  };
}

/** Default values are left out so a fresh page has a clean URL. */
export function buildProspectSearch(state: ProspectUrlState): string {
  const params = new URLSearchParams();
  if (state.query.trim()) params.set('q', state.query);
  if (state.segment !== 'all') params.set('type', state.segment);
  if (state.savedOnly) params.set('saved', '1');
  if (state.selectedId) params.set('id', state.selectedId);
  if (state.view === 'map') params.set('view', 'map');
  const search = params.toString();
  return search ? `?${search}` : '';
}
