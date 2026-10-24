import type { ManualProspectFields } from './manualProspectForm';
import type { ManualProspect, ProspectStatus } from './types';

/** Fields the edit form owns. Anything else on a stored record is carried over untouched. */
const FORM_FIELDS: (keyof ManualProspectFields)[] = [
  'name', 'propertyType', 'address', 'coordinates', 'windowCount', 'countConfidence', 'source', 'researchedAt', 'status',
  'internalNotes', 'stories', 'squareFootage', 'accessNotes', 'exteriorScope', 'interiorScope', 'preliminaryPrice',
  'referenceUrls', 'followUpAt',
];

/** Applies a saved edit on top of the stored record, so fields the form does not manage survive. */
export function mergeEdit(stored: ManualProspect, edited: ManualProspect): ManualProspect {
  const rest: Partial<ManualProspect> = { ...stored };
  for (const key of FORM_FIELDS) delete rest[key];
  return { ...rest, ...edited };
}

export interface StatusChange {
  id: string;
  previous: { status: ProspectStatus; updatedAt: string };
  applied: { status: ProspectStatus; updatedAt: string };
}

export function applyStatusChange(
  prospects: ManualProspect[],
  id: string,
  status: ProspectStatus,
  now: Date = new Date()
): { prospects: ManualProspect[]; change: StatusChange | null } {
  let change: StatusChange | null = null;
  const next = prospects.map((p) => {
    if (p.id !== id || p.status === status) return p;
    const updatedAt = now.toISOString();
    change = { id, previous: { status: p.status, updatedAt: p.updatedAt }, applied: { status, updatedAt } };
    return { ...p, status, updatedAt };
  });
  return { prospects: next, change };
}

/** Restores the previous status and timestamp only if the record still matches the change exactly. */
export function undoStatusChange(prospects: ManualProspect[], change: StatusChange): { prospects: ManualProspect[]; restored: boolean } {
  let restored = false;
  const next = prospects.map((p) => {
    if (p.id !== change.id || p.status !== change.applied.status || p.updatedAt !== change.applied.updatedAt) return p;
    restored = true;
    return { ...p, status: change.previous.status, updatedAt: change.previous.updatedAt };
  });
  return { prospects: next, restored };
}
