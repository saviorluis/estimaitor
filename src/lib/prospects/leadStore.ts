import { LEAD_STATUSES, type LeadStatus, type SavedLead } from './types';

/** Kept separate from estimator keys, so "Clear Current Data" on the estimator never touches leads. */
export const LEADS_STORAGE_KEY = 'estimaitor_pi_leads_v1';
const SCHEMA_VERSION = 1;

interface StoredLeads {
  version: number;
  leads: SavedLead[];
}

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export type LeadReadResult = { ok: true; leads: SavedLead[] } | { ok: false; error: string };

const isIsoDate = (value: unknown) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);

function isSavedLead(value: unknown): value is SavedLead {
  if (!value || typeof value !== 'object') return false;
  const lead = value as Record<string, unknown>;
  return (
    typeof lead.id === 'string' &&
    typeof lead.prospectId === 'string' &&
    LEAD_STATUSES.includes(lead.status as LeadStatus) &&
    Array.isArray(lead.notes) &&
    lead.notes.every((n) => n && typeof n.at === 'string' && typeof n.text === 'string') &&
    (lead.followUpAt === undefined || isIsoDate(lead.followUpAt)) &&
    typeof lead.createdAt === 'string' &&
    typeof lead.updatedAt === 'string'
  );
}

/**
 * Unreadable data is reported, never silently replaced, so a corrupted or newer-format
 * save is not overwritten by this version of the app.
 */
export function readLeads(storage: StorageLike): LeadReadResult {
  let raw: string | null;
  try {
    raw = storage.getItem(LEADS_STORAGE_KEY);
  } catch {
    return { ok: false, error: 'Browser storage is not available.' };
  }
  if (!raw) return { ok: true, leads: [] };
  try {
    const parsed = JSON.parse(raw) as StoredLeads;
    if (parsed?.version !== SCHEMA_VERSION || !Array.isArray(parsed.leads) || !parsed.leads.every(isSavedLead)) {
      return { ok: false, error: 'Saved leads are in a format this version does not recognize.' };
    }
    return { ok: true, leads: parsed.leads };
  } catch {
    return { ok: false, error: 'Saved leads could not be read.' };
  }
}

export function writeLeads(storage: StorageLike, leads: SavedLead[]): { ok: true } | { ok: false; error: string } {
  try {
    const data: StoredLeads = { version: SCHEMA_VERSION, leads };
    storage.setItem(LEADS_STORAGE_KEY, JSON.stringify(data));
    return { ok: true };
  } catch {
    return { ok: false, error: 'Browser storage is full or unavailable, so the change was not saved.' };
  }
}

export function createLead(prospectId: string, now: Date = new Date()): SavedLead {
  const at = now.toISOString();
  return {
    id: `lead-${prospectId}-${now.getTime()}`,
    prospectId,
    status: 'new',
    notes: [],
    createdAt: at,
    updatedAt: at,
  };
}

export type LeadChange =
  | { type: 'status'; status: LeadStatus }
  | { type: 'followUp'; date: string | null }
  | { type: 'addNote'; text: string };

export const MAX_NOTE_LENGTH = 2000;

export function applyLeadChange(lead: SavedLead, change: LeadChange, now: Date = new Date()): SavedLead {
  const updatedAt = now.toISOString();
  switch (change.type) {
    case 'status':
      return { ...lead, status: change.status, updatedAt };
    case 'followUp': {
      const next = { ...lead, updatedAt };
      if (change.date && isIsoDate(change.date)) next.followUpAt = change.date;
      else delete next.followUpAt;
      return next;
    }
    case 'addNote': {
      const text = change.text.trim().slice(0, MAX_NOTE_LENGTH);
      if (!text) return lead;
      return { ...lead, notes: [{ at: updatedAt, text }, ...lead.notes], updatedAt };
    }
  }
}
