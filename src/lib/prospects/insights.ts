import { PROSPECT_STATUSES, type ManualProspect, type ProspectStatus } from './types';

export const NEXT_ACTIONS = [
  { id: 'followup_due', label: 'Follow-up due' },
  { id: 'ready', label: 'Ready to quote' },
  { id: 'unmapped', label: 'Not on map' },
  { id: 'new', label: 'Added in last 7 days' },
  { id: 'low_conf', label: 'Low-confidence count' },
] as const;
export type NextActionId = (typeof NEXT_ACTIONS)[number]['id'];
export const NEXT_ACTION_IDS = NEXT_ACTIONS.map((a) => a.id);

/** YYYY-MM-DD for the device's local calendar day. */
export function localDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Shifts a YYYY-MM-DD date by whole calendar days, unaffected by daylight-saving changes. */
export function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  return localDate(new Date(y, m - 1, d + days));
}

export function hasValidCoordinates(c: { lat: number; lng: number } | undefined): boolean {
  return (
    !!c && Number.isFinite(c.lat) && Number.isFinite(c.lng) && Math.abs(c.lat) <= 90 && Math.abs(c.lng) <= 180
  );
}

const CLOSED: ProspectStatus[] = ['won', 'lost'];
const isOpen = (p: ManualProspect) => !CLOSED.includes(p.status);

/**
 * Next actions use existing fields only and skip won and lost prospects.
 * Dates compare as local calendar days: a follow-up is due when its date is today or earlier.
 */
export function matchesNextAction(p: ManualProspect, action: NextActionId, today: string): boolean {
  if (!isOpen(p)) return false;
  switch (action) {
    case 'followup_due':
      return Boolean(p.followUpAt) && (p.followUpAt as string) <= today;
    case 'ready':
      return p.status === 'ready_to_quote';
    case 'unmapped':
      return !hasValidCoordinates(p.coordinates);
    case 'new': {
      const created = new Date(p.createdAt);
      if (Number.isNaN(created.getTime())) return false;
      return localDate(created) >= addDays(today, -6);
    }
    case 'low_conf':
      return p.windowCount !== undefined && p.countConfidence === 'low';
  }
}

export function countNextActions(prospects: ManualProspect[], today: string): Record<NextActionId, number> {
  const counts = Object.fromEntries(NEXT_ACTION_IDS.map((id) => [id, 0])) as Record<NextActionId, number>;
  for (const p of prospects) for (const id of NEXT_ACTION_IDS) if (matchesNextAction(p, id, today)) counts[id]++;
  return counts;
}

export function countStatuses(prospects: ManualProspect[]): Record<ProspectStatus, number> {
  const counts = Object.fromEntries(PROSPECT_STATUSES.map((s) => [s, 0])) as Record<ProspectStatus, number>;
  for (const p of prospects) counts[p.status]++;
  return counts;
}
