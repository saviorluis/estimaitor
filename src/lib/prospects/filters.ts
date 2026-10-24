import { hasValidCoordinates, matchesNextAction, NEXT_ACTION_IDS, type NextActionId } from './insights';
import {
  COUNT_CONFIDENCES,
  MANUAL_SOURCE_TYPES,
  PROSPECT_STATUSES,
  PROSPECT_STATUS_LABELS,
  type AnyProspect,
  type CountConfidence,
  type ManualProspect,
  type ManualSourceType,
  type ProspectSegment,
  type ProspectStatus,
} from './types';

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

/** Only coordinates someone entered; a record without valid ones is never placed on the map. */
export function prospectCoordinates(prospect: AnyProspect): { lat: number; lng: number } | null {
  const c = prospect.kind === 'manual' ? prospect.coordinates : prospect.location;
  return c && hasValidCoordinates(c) ? { lat: c.lat, lng: c.lng } : null;
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
    parts.push(
      prospect.propertyType,
      PROSPECT_STATUS_LABELS[prospect.status],
      prospect.internalNotes || '',
      prospect.source.note || ''
    );
  } else if (prospect.kind === 'property') {
    parts.push(prospect.buildingType.value);
  } else {
    parts.push(prospect.projectType, prospect.generalContractor?.value || '');
  }
  return normalize(parts.join(' '));
}

/** Every word in the query must appear in the name, address, type, status, contractor, or (your records) notes. */
export function matchesQuery(prospect: AnyProspect, query: string): boolean {
  const words = normalize(query).split(' ').filter(Boolean);
  if (words.length === 0) return true;
  const haystack = searchableText(prospect);
  return words.every((word) => haystack.includes(word));
}

export type DataScope = 'all' | 'mine' | 'sample';
export type MapScope = 'all' | 'mapped' | 'unmapped';

export interface ProspectFilter {
  query: string;
  segment: ProspectSegment;
  savedOnly: boolean;
  scope?: DataScope;
  status?: ProspectStatus | null;
  source?: ManualSourceType | null;
  confidence?: CountConfidence | null;
  mapped?: MapScope;
  next?: NextActionId | null;
}

/** Status, source, confidence and next-action filters use fields only your records have. */
export function isYourDataOnly(filter: Pick<ProspectFilter, 'status' | 'source' | 'confidence' | 'next'>): boolean {
  return Boolean(filter.status || filter.source || filter.confidence || filter.next);
}

export function filterProspects<P extends AnyProspect>(
  prospects: P[],
  filter: ProspectFilter,
  savedProspectIds: ReadonlySet<string> = new Set(),
  today?: string
): P[] {
  const yoursOnly = isYourDataOnly(filter);
  return prospects.filter((p) => {
    const manual: ManualProspect | null = p.kind === 'manual' ? p : null;
    if (filter.segment !== 'all' && getSegment(p) !== filter.segment) return false;
    if (filter.savedOnly && !savedProspectIds.has(p.id)) return false;
    if (filter.scope === 'mine' && !manual) return false;
    if (filter.scope === 'sample' && manual) return false;
    if (yoursOnly && !manual) return false;
    if (filter.status && manual?.status !== filter.status) return false;
    if (filter.source && manual?.source.type !== filter.source) return false;
    if (filter.confidence && manual?.countConfidence !== filter.confidence) return false;
    if (filter.mapped === 'mapped' && !prospectCoordinates(p)) return false;
    if (filter.mapped === 'unmapped' && prospectCoordinates(p)) return false;
    if (filter.next && !(manual && today && matchesNextAction(manual, filter.next, today))) return false;
    return matchesQuery(p, filter.query);
  });
}

/** Counts per tab for the current search and filters, so each tab shows how many results it would give. */
export function countBySegment(
  prospects: AnyProspect[],
  filter: Omit<ProspectFilter, 'segment'>,
  savedProspectIds: ReadonlySet<string> = new Set(),
  today?: string
): Record<ProspectSegment, number> {
  const counts: Record<ProspectSegment, number> = { all: 0, commercial: 0, residential: 0, construction: 0 };
  for (const p of filterProspects(prospects, { ...filter, segment: 'all' }, savedProspectIds, today)) {
    counts.all++;
    counts[getSegment(p)]++;
  }
  return counts;
}

export const SORTS = [
  { id: 'added', label: 'Recently added' },
  { id: 'researched', label: 'Recently researched' },
  { id: 'followup', label: 'Follow-up (soonest)' },
  { id: 'windows', label: 'Window count (highest)' },
] as const;
export type ProspectSort = (typeof SORTS)[number]['id'];

const desc = (a?: string | number, b?: string | number) => (a === b ? 0 : a === undefined ? 1 : b === undefined ? -1 : a < b ? 1 : -1);
const asc = (a?: string | number, b?: string | number) => (a === b ? 0 : a === undefined ? 1 : b === undefined ? -1 : a < b ? -1 : 1);

/** Sorts your records; blanks go last and ties fall back to newest first. Sample records keep their own order. */
export function sortManualProspects(prospects: ManualProspect[], sort: ProspectSort): ManualProspect[] {
  const newest = (a: ManualProspect, b: ManualProspect) => desc(a.createdAt, b.createdAt) || asc(a.id, b.id);
  const by: Record<ProspectSort, (a: ManualProspect, b: ManualProspect) => number> = {
    added: newest,
    researched: (a, b) => desc(a.researchedAt, b.researchedAt) || newest(a, b),
    followup: (a, b) => asc(a.followUpAt, b.followUpAt) || newest(a, b),
    windows: (a, b) => desc(a.windowCount, b.windowCount) || newest(a, b),
  };
  return [...prospects].sort(by[sort]);
}

export type ProspectView = 'list' | 'map';

/** Only enumerated view settings live in the URL; search text, ids and record content never do. */
export interface ProspectUrlState {
  segment: ProspectSegment;
  savedOnly: boolean;
  view: ProspectView;
  scope: DataScope;
  status: ProspectStatus | null;
  source: ManualSourceType | null;
  confidence: CountConfidence | null;
  mapped: MapScope;
  sort: ProspectSort;
  next: NextActionId | null;
}

export const DEFAULT_URL_STATE: ProspectUrlState = {
  segment: 'all',
  savedOnly: false,
  view: 'list',
  scope: 'all',
  status: null,
  source: null,
  confidence: null,
  mapped: 'all',
  sort: 'added',
  next: null,
};

const SEGMENT_IDS = SEGMENTS.map((s) => s.id);
const SORT_IDS = SORTS.map((s) => s.id);

function pick<T extends string>(value: string | null, allowed: readonly T[]): T | null {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : null;
}

export function parseProspectUrlState(params: { get(name: string): string | null }): ProspectUrlState {
  return {
    segment: pick(params.get('type'), SEGMENT_IDS) || 'all',
    savedOnly: params.get('saved') === '1',
    view: params.get('view') === 'map' ? 'map' : 'list',
    scope: pick(params.get('data'), ['mine', 'sample'] as const) || 'all',
    status: pick(params.get('status'), PROSPECT_STATUSES),
    source: pick(params.get('source'), MANUAL_SOURCE_TYPES),
    confidence: pick(params.get('confidence'), COUNT_CONFIDENCES),
    mapped: pick(params.get('map'), ['mapped', 'unmapped'] as const) || 'all',
    sort: pick(params.get('sort'), SORT_IDS) || 'added',
    next: pick(params.get('next'), NEXT_ACTION_IDS),
  };
}

/** Default values are left out so a fresh page has a clean URL. */
export function buildProspectSearch(state: ProspectUrlState): string {
  const params = new URLSearchParams();
  if (state.segment !== 'all') params.set('type', state.segment);
  if (state.savedOnly) params.set('saved', '1');
  if (state.view === 'map') params.set('view', 'map');
  if (state.scope !== 'all') params.set('data', state.scope);
  if (state.status) params.set('status', state.status);
  if (state.source) params.set('source', state.source);
  if (state.confidence) params.set('confidence', state.confidence);
  if (state.mapped !== 'all') params.set('map', state.mapped);
  if (state.sort !== 'added') params.set('sort', state.sort);
  if (state.next) params.set('next', state.next);
  const search = params.toString();
  return search ? `?${search}` : '';
}

/** Parameters older versions put in the URL; read once, then removed from the address bar. */
export const LEGACY_URL_PARAMS = ['q', 'id', 'edit'] as const;
