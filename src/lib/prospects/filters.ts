import { PROSPECT_STATUS_LABELS, type AnyProspect, type ProspectSegment } from './types';

export const SEGMENTS: { id: ProspectSegment; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'residential', label: 'Residential' },
  { id: 'construction', label: 'Construction' },
];

/** Construction projects get their own tab; existing buildings are grouped by category. */
export function getSegment(prospect: AnyProspect): Exclude<ProspectSegment, 'all'> {
  if (prospect.kind === 'manual') return prospect.propertyType;
  return prospect.kind === 'construction' ? 'construction' : prospect.category;
}

/** Manually entered prospects may have no property name; the street stands in. */
export function prospectName(prospect: AnyProspect): string {
  return prospect.kind === 'manual' ? prospect.name || prospect.address.line1 : prospect.name;
}

export function prospectCoordinates(prospect: AnyProspect): { lat: number; lng: number } | null {
  if (prospect.kind === 'manual') return prospect.coordinates || null;
  return prospect.location;
}

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

function searchableText(prospect: AnyProspect): string {
  const parts = [
    prospectName(prospect),
    prospect.address.line1,
    prospect.address.city,
    prospect.address.state,
    prospect.address.zip || '',
  ];
  if (prospect.kind === 'manual') {
    parts.push(prospect.propertyType, PROSPECT_STATUS_LABELS[prospect.status]);
  } else if (prospect.kind === 'property') {
    parts.push(prospect.buildingType.value);
  } else {
    parts.push(prospect.projectType, prospect.generalContractor?.value || '');
  }
  return normalize(parts.join(' '));
}

/** Every word in the query must appear somewhere in the prospect's name, address, type, status, or contractor. */
export function matchesQuery(prospect: AnyProspect, query: string): boolean {
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

export function filterProspects<P extends AnyProspect>(
  prospects: P[],
  filter: ProspectFilter,
  savedProspectIds: ReadonlySet<string> = new Set()
): P[] {
  return prospects.filter(
    (p) =>
      (filter.segment === 'all' || getSegment(p) === filter.segment) &&
      (!filter.savedOnly || savedProspectIds.has(p.id)) &&
      matchesQuery(p, filter.query)
  );
}

/** Counts per tab for the current search, so each tab shows how many results it would give. */
export function countBySegment(
  prospects: AnyProspect[],
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
  /** 'new' for the add form, otherwise the id of the prospect being edited. */
  edit: string | null;
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
    edit: params.get('edit') || null,
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
  if (state.edit) params.set('edit', state.edit);
  const search = params.toString();
  return search ? `?${search}` : '';
}
