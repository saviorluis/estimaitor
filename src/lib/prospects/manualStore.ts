import {
  COUNT_CONFIDENCES,
  MANUAL_PROPERTY_TYPES,
  MANUAL_SOURCE_TYPES,
  PROSPECT_STATUSES,
  type ManualProspect,
} from './types';

/** Real prospects live under their own key, apart from sample data, leads and estimator keys. */
export const MANUAL_PROSPECTS_STORAGE_KEY = 'estimaitor_pi_prospects_v1';
export const PROSPECT_SETTINGS_STORAGE_KEY = 'estimaitor_pi_settings_v1';
const SCHEMA_VERSION = 1;

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

interface StoredProspects {
  version: number;
  prospects: ManualProspect[];
}

export type ManualReadResult = { ok: true; prospects: ManualProspect[] } | { ok: false; error: string };
export type WriteResult = { ok: true } | { ok: false; error: string };

const isIsoDate = (value: unknown) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
const isOptionalString = (value: unknown) => value === undefined || typeof value === 'string';
const isOptionalNumber = (value: unknown) => value === undefined || (typeof value === 'number' && Number.isFinite(value));
const includes = (list: readonly string[], value: unknown) => typeof value === 'string' && list.includes(value);

export function isManualProspect(value: unknown): value is ManualProspect {
  if (!value || typeof value !== 'object') return false;
  const p = value as Record<string, unknown>;
  const address = p.address as Record<string, unknown> | undefined;
  const source = p.source as Record<string, unknown> | undefined;
  const coords = p.coordinates as Record<string, unknown> | undefined;
  const price = p.preliminaryPrice as Record<string, unknown> | undefined;
  return (
    p.kind === 'manual' &&
    p.dataOrigin === 'manual' &&
    typeof p.id === 'string' &&
    isOptionalString(p.name) &&
    includes(MANUAL_PROPERTY_TYPES, p.propertyType) &&
    !!address &&
    ['line1', 'city', 'state', 'zip'].every((k) => typeof address[k] === 'string') &&
    (coords === undefined || (typeof coords.lat === 'number' && typeof coords.lng === 'number')) &&
    isOptionalNumber(p.windowCount) &&
    (p.countConfidence === undefined || includes(COUNT_CONFIDENCES, p.countConfidence)) &&
    (p.windowCount === undefined || p.countConfidence !== undefined) &&
    isOptionalNumber(p.standardWindows) &&
    isOptionalNumber(p.largeWindows) &&
    isOptionalNumber(p.highAccessWindows) &&
    (p.windowServiceSides === undefined || includes(['exterior', 'interior', 'interior_exterior'], p.windowServiceSides)) &&
    isOptionalNumber(p.distanceFromOffice) &&
    isOptionalString(p.contactName) &&
    isOptionalString(p.contactPhone) &&
    isOptionalString(p.contactEmail) &&
    !!source &&
    includes(MANUAL_SOURCE_TYPES, source.type) &&
    isOptionalString(source.url) &&
    isOptionalString(source.note) &&
    isIsoDate(p.researchedAt) &&
    includes(PROSPECT_STATUSES, p.status) &&
    isOptionalString(p.internalNotes) &&
    isOptionalNumber(p.stories) &&
    isOptionalNumber(p.squareFootage) &&
    isOptionalString(p.accessNotes) &&
    isOptionalString(p.exteriorScope) &&
    isOptionalString(p.interiorScope) &&
    (price === undefined || (typeof price.low === 'number' && typeof price.high === 'number')) &&
    Array.isArray(p.referenceUrls) &&
    p.referenceUrls.every((u) => typeof u === 'string') &&
    (p.followUpAt === undefined || isIsoDate(p.followUpAt)) &&
    typeof p.createdAt === 'string' &&
    typeof p.updatedAt === 'string'
  );
}

/** Unreadable data is reported, never replaced, so a corrupted or newer-format save survives. */
export function readManualProspects(storage: StorageLike): ManualReadResult {
  let raw: string | null;
  try {
    raw = storage.getItem(MANUAL_PROSPECTS_STORAGE_KEY);
  } catch {
    return { ok: false, error: 'Browser storage is not available.' };
  }
  if (!raw) return { ok: true, prospects: [] };
  try {
    const parsed = JSON.parse(raw) as StoredProspects;
    if (parsed?.version !== SCHEMA_VERSION || !Array.isArray(parsed.prospects) || !parsed.prospects.every(isManualProspect)) {
      return { ok: false, error: 'Your saved prospects are in a format this version does not recognize.' };
    }
    return { ok: true, prospects: parsed.prospects };
  } catch {
    return { ok: false, error: 'Your saved prospects could not be read.' };
  }
}

export function writeManualProspects(storage: StorageLike, prospects: ManualProspect[]): WriteResult {
  try {
    const data: StoredProspects = { version: SCHEMA_VERSION, prospects };
    storage.setItem(MANUAL_PROSPECTS_STORAGE_KEY, JSON.stringify(data));
    return { ok: true };
  } catch {
    return { ok: false, error: 'Browser storage is full or unavailable, so the prospect was not saved.' };
  }
}

export function createManualProspectId(now: Date = new Date()): string {
  return `mp-${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface ProspectSettings {
  showSampleData: boolean;
}

export const DEFAULT_PROSPECT_SETTINGS: ProspectSettings = { showSampleData: true };

export function readProspectSettings(storage: StorageLike): ProspectSettings {
  try {
    const parsed = JSON.parse(storage.getItem(PROSPECT_SETTINGS_STORAGE_KEY) || 'null');
    if (parsed?.version === SCHEMA_VERSION && typeof parsed.showSampleData === 'boolean') {
      return { showSampleData: parsed.showSampleData };
    }
  } catch {
    // Fall through to defaults; sample data stays visible.
  }
  return DEFAULT_PROSPECT_SETTINGS;
}

export function writeProspectSettings(storage: StorageLike, settings: ProspectSettings): WriteResult {
  try {
    storage.setItem(PROSPECT_SETTINGS_STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, ...settings }));
    return { ok: true };
  } catch {
    return { ok: false, error: 'Browser storage is full or unavailable, so the setting was not saved.' };
  }
}
