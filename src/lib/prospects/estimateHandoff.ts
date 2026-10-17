import type { CountConfidence, ManualProspect } from './types';

/** Read once by the estimator, then removed. Carries no prices, so the estimator alone sets pricing. */
export const ESTIMATE_HANDOFF_STORAGE_KEY = 'estimaitor_pi_estimate_handoff_v1';
const SCHEMA_VERSION = 1;
const MAX_AGE_MS = 30 * 60 * 1000;

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export interface DraftEstimateHandoff {
  version: number;
  createdAt: string;
  prospectId: string;
  prospectLabel: string;
  projectName: string;
  projectStreet: string;
  projectCity: string;
  projectState: string;
  projectZip: string;
  notes: string;
  windowCountReference?: { count: number; confidence: CountConfidence };
}

export function buildDraftEstimateHandoff(prospect: ManualProspect, now: Date = new Date()): DraftEstimateHandoff {
  const handoff: DraftEstimateHandoff = {
    version: SCHEMA_VERSION,
    createdAt: now.toISOString(),
    prospectId: prospect.id,
    prospectLabel: prospect.name || prospect.address.line1,
    projectName: prospect.name || '',
    projectStreet: prospect.address.line1,
    projectCity: prospect.address.city,
    projectState: prospect.address.state,
    projectZip: prospect.address.zip,
    notes: prospect.internalNotes || '',
  };
  if (prospect.windowCount !== undefined && prospect.countConfidence) {
    handoff.windowCountReference = { count: prospect.windowCount, confidence: prospect.countConfidence };
  }
  return handoff;
}

export function writeDraftEstimateHandoff(storage: StorageLike, handoff: DraftEstimateHandoff): boolean {
  try {
    storage.setItem(ESTIMATE_HANDOFF_STORAGE_KEY, JSON.stringify(handoff));
    return true;
  } catch {
    return false;
  }
}

/** Returns the pending handoff and removes it, so a reload never refills the form. Stale handoffs are dropped. */
export function takeDraftEstimateHandoff(storage: StorageLike, now: Date = new Date()): DraftEstimateHandoff | null {
  let raw: string | null = null;
  try {
    raw = storage.getItem(ESTIMATE_HANDOFF_STORAGE_KEY);
    if (raw !== null) storage.removeItem(ESTIMATE_HANDOFF_STORAGE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const h = JSON.parse(raw) as DraftEstimateHandoff;
    const age = now.getTime() - Date.parse(h.createdAt);
    const strings = [h.prospectId, h.prospectLabel, h.projectName, h.projectStreet, h.projectCity, h.projectState, h.projectZip, h.notes];
    if (
      h.version !== SCHEMA_VERSION ||
      !(age >= 0 && age <= MAX_AGE_MS) ||
      !strings.every((s) => typeof s === 'string') ||
      (h.windowCountReference !== undefined && typeof h.windowCountReference.count !== 'number')
    ) {
      return null;
    }
    return h;
  } catch {
    return null;
  }
}
