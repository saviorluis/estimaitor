import { test, expect } from '@playwright/test';
import { SAMPLE_PROSPECTS } from '../../src/lib/prospects/sampleData';
import { filterProspects, sortManualProspects, type ProspectFilter } from '../../src/lib/prospects/filters';
import { addDays, countNextActions, countStatuses, localDate, matchesNextAction } from '../../src/lib/prospects/insights';
import {
  MANUAL_PROSPECTS_STORAGE_KEY,
  readManualProspects,
  writeManualProspects,
} from '../../src/lib/prospects/manualStore';
import { buildManualProspect, draftFromProspect, validateDraft } from '../../src/lib/prospects/manualProspectForm';
import { applyStatusChange, mergeEdit, undoStatusChange } from '../../src/lib/prospects/manualUpdates';
import { buildDraftEstimateHandoff } from '../../src/lib/prospects/estimateHandoff';
import type { AnyProspect, ManualProspect } from '../../src/lib/prospects/types';

function memoryStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (k: string) => (k in data ? data[k] : null),
    setItem: (k: string, v: string) => {
      data[k] = v;
    },
  };
}

/** Minimal record exactly as Phase 2 saves it when only the required fields are filled in. */
const MINIMAL: ManualProspect = {
  kind: 'manual',
  id: 'mp-min',
  dataOrigin: 'manual',
  propertyType: 'residential',
  address: { line1: '9 Oak Ave', city: 'High Point', state: 'NC', zip: '27262' },
  source: { type: 'client_provided', url: 'https://example.com/oak' },
  researchedAt: '2026-10-01',
  status: 'new',
  referenceUrls: [],
  createdAt: '2026-10-01T12:00:00.000Z',
  updatedAt: '2026-10-01T12:00:00.000Z',
};

function record(overrides: Partial<ManualProspect> & { id: string }): ManualProspect {
  return { ...MINIMAL, ...overrides };
}

const base: ProspectFilter = { query: '', segment: 'all', savedOnly: false };
const ids = (list: AnyProspect[]) => list.map((p) => p.id);

test.describe('Next actions and dates (src/lib/prospects/insights.ts)', () => {
  const today = '2026-10-16';

  test('follow-up due includes today and earlier only, and never blank dates', () => {
    const due = (followUpAt?: string) => matchesNextAction(record({ id: 'x', followUpAt }), 'followup_due', today);
    expect(due('2026-10-15')).toBe(true);
    expect(due('2026-10-16')).toBe(true);
    expect(due('2026-10-17')).toBe(false);
    expect(due(undefined)).toBe(false);
    expect(due('2025-01-01')).toBe(true);
  });

  test('won and lost prospects are left out of every next action', () => {
    for (const status of ['won', 'lost'] as const) {
      const p = record({ id: 'x', status, followUpAt: '2026-10-01', windowCount: 5, countConfidence: 'low' });
      expect(Object.values(countNextActions([p], today)).every((n) => n === 0)).toBe(true);
    }
  });

  test('"Added in last 7 days" counts the device-local calendar day, including today, at local-midnight boundaries', () => {
    const [y, m, d] = today.split('-').map(Number);
    const at = (dayOffset: number, h: number, min = 0, s = 0, ms = 0) => new Date(y, m - 1, d + dayOffset, h, min, s, ms).toISOString();
    const isNew = (createdAt: string) => matchesNextAction(record({ id: 'x', createdAt }), 'new', today);
    expect(isNew(at(0, 0))).toBe(true);
    expect(isNew(at(0, 23, 59, 59, 999))).toBe(true);
    expect(isNew(at(-6, 0))).toBe(true);
    expect(isNew(at(-7, 23, 59, 59, 999))).toBe(false);
    expect(isNew(at(-30, 12))).toBe(false);
    expect(isNew('not a date')).toBe(false);
  });

  test('local dates come from the local clock, and day math holds across months and daylight-saving changes', () => {
    expect(localDate(new Date(2026, 0, 1, 0, 0, 0))).toBe('2026-01-01');
    expect(localDate(new Date(2025, 11, 31, 23, 59, 59))).toBe('2025-12-31');
    expect(addDays('2026-10-16', -6)).toBe('2026-10-10');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDays('2026-03-08', 1)).toBe('2026-03-09');
    expect(addDays('2026-11-01', 1)).toBe('2026-11-02');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  test('ready, unmapped and low-confidence use existing fields only', () => {
    const list = [
      record({ id: 'a', status: 'ready_to_quote', coordinates: { lat: 36.07, lng: -79.79 } }),
      record({ id: 'b', windowCount: 12, countConfidence: 'low' }),
      record({ id: 'c', coordinates: { lat: 200, lng: 0 } }),
      record({ id: 'd', countConfidence: 'low' }),
    ];
    const counts = countNextActions(list, today);
    expect(counts.ready).toBe(1);
    expect(counts.unmapped).toBe(3);
    expect(counts.low_conf).toBe(1);
    expect(countStatuses(list)).toMatchObject({ new: 3, ready_to_quote: 1, won: 0 });
  });
});

test.describe('Filters and sorting for your prospects (src/lib/prospects/filters.ts)', () => {
  const mine = [
    record({ id: 'm1', propertyType: 'commercial', status: 'ready_to_quote', coordinates: { lat: 36.07, lng: -79.79 }, source: { type: 'site_visit', note: 'Rooftop atrium seen' } }),
    record({ id: 'm2', propertyType: 'commercial', status: 'new', windowCount: 40, countConfidence: 'low', internalNotes: 'Ask about gutter scope' }),
    record({ id: 'm3', propertyType: 'residential', status: 'ready_to_quote' }),
  ];
  const all: AnyProspect[] = [...mine, ...SAMPLE_PROSPECTS];

  test('search covers internal notes and source notes', () => {
    expect(ids(filterProspects(all, { ...base, query: 'gutter' }))).toEqual(['m2']);
    expect(ids(filterProspects(all, { ...base, query: 'atrium seen' }))).toEqual(['m1']);
  });

  test('filters combine with AND and status/source/confidence never return sample data', () => {
    expect(ids(filterProspects(all, { ...base, status: 'ready_to_quote' }))).toEqual(['m1', 'm3']);
    expect(ids(filterProspects(all, { ...base, status: 'ready_to_quote', segment: 'commercial' }))).toEqual(['m1']);
    expect(ids(filterProspects(all, { ...base, status: 'ready_to_quote', mapped: 'unmapped' }))).toEqual(['m3']);
    expect(ids(filterProspects(all, { ...base, source: 'site_visit' }))).toEqual(['m1']);
    expect(ids(filterProspects(all, { ...base, confidence: 'low' }))).toEqual(['m2']);
    expect(filterProspects(all, { ...base, status: 'new', query: 'gutter', confidence: 'high' })).toEqual([]);
  });

  test('data scope and mapped scope keep sample and real records apart', () => {
    expect(ids(filterProspects(all, { ...base, scope: 'mine' }))).toEqual(['m1', 'm2', 'm3']);
    const sampleOnly = filterProspects(all, { ...base, scope: 'sample' });
    expect(sampleOnly).toHaveLength(SAMPLE_PROSPECTS.length);
    expect(sampleOnly.every((p) => p.kind !== 'manual')).toBe(true);
    const mapped = filterProspects(all, { ...base, mapped: 'mapped' });
    expect(mapped.filter((p) => p.kind === 'manual').map((p) => p.id)).toEqual(['m1']);
    expect(mapped).toHaveLength(SAMPLE_PROSPECTS.length + 1);
    expect(ids(filterProspects(all, { ...base, mapped: 'unmapped' }))).toEqual(['m2', 'm3']);
  });

  test('a next-action filter needs today and returns only your matching prospects', () => {
    expect(ids(filterProspects(all, { ...base, next: 'ready' }, new Set(), '2026-10-16'))).toEqual(['m1', 'm3']);
    expect(filterProspects(all, { ...base, next: 'ready' })).toEqual([]);
  });

  test('sorting puts blanks last and breaks ties by newest first', () => {
    const list = [
      record({ id: 'a', createdAt: '2026-10-01T00:00:00.000Z', researchedAt: '2026-09-01', windowCount: 10, countConfidence: 'low' }),
      record({ id: 'b', createdAt: '2026-10-03T00:00:00.000Z', researchedAt: '2026-10-02', followUpAt: '2026-10-20' }),
      record({ id: 'c', createdAt: '2026-10-02T00:00:00.000Z', researchedAt: '2026-10-02', followUpAt: '2026-10-18', windowCount: 300, countConfidence: 'high' }),
      record({ id: 'd', createdAt: '2026-10-04T00:00:00.000Z', researchedAt: '2026-08-01' }),
    ];
    expect(ids(sortManualProspects(list, 'added'))).toEqual(['d', 'b', 'c', 'a']);
    expect(ids(sortManualProspects(list, 'researched'))).toEqual(['b', 'c', 'a', 'd']);
    expect(ids(sortManualProspects(list, 'followup'))).toEqual(['c', 'b', 'd', 'a']);
    expect(ids(sortManualProspects(list, 'windows'))).toEqual(['c', 'a', 'd', 'b']);
    expect(ids(list)).toEqual(['a', 'b', 'c', 'd']);
  });
});

test.describe('Storage compatibility with Phase 2 records', () => {
  const FULL: ManualProspect = {
    kind: 'manual',
    id: 'mp-full',
    dataOrigin: 'manual',
    name: 'Elm Street Lofts',
    propertyType: 'commercial',
    address: { line1: '120 N Elm St', city: 'Greensboro', state: 'NC', zip: '27401' },
    coordinates: { lat: 36.0726, lng: -79.792 },
    windowCount: 84,
    countConfidence: 'medium',
    source: { type: 'drive_by', note: 'Counted street-facing windows' },
    researchedAt: '2026-10-01',
    status: 'researching',
    internalNotes: 'Manager prefers email.',
    stories: 3,
    preliminaryPrice: { low: 900, high: 1400 },
    referenceUrls: ['https://example.com/photo-1'],
    followUpAt: '2026-10-20',
    createdAt: '2026-10-01T12:00:00.000Z',
    updatedAt: '2026-10-02T08:30:00.000Z',
  };
  const raw = (prospects: unknown[]) => JSON.stringify({ version: 1, prospects });

  test('existing records, including ones missing every optional field, read back unchanged', () => {
    const storage = memoryStorage({ [MANUAL_PROSPECTS_STORAGE_KEY]: raw([FULL, MINIMAL]) });
    const result = readManualProspects(storage);
    expect(result).toEqual({ ok: true, prospects: [FULL, MINIMAL] });
    expect(countNextActions([FULL, MINIMAL], '2026-10-16')).toMatchObject({ unmapped: 1, followup_due: 0 });
    expect(sortManualProspects([MINIMAL, FULL], 'windows').map((p) => p.id)).toEqual(['mp-full', 'mp-min']);
  });

  test('a status change and its undo touch only status and last-updated, and keep unknown fields', () => {
    const withExtra = { ...MINIMAL, futureField: { keep: true } } as ManualProspect;
    const storage = memoryStorage({ [MANUAL_PROSPECTS_STORAGE_KEY]: raw([FULL, withExtra]) });
    const read = readManualProspects(storage);
    if (!read.ok) throw new Error(read.error);

    const now = new Date('2026-10-16T15:00:00.000Z');
    const { prospects, change } = applyStatusChange(read.prospects, 'mp-min', 'ready_to_quote', now);
    expect(change).toEqual({
      id: 'mp-min',
      previous: { status: 'new', updatedAt: MINIMAL.updatedAt },
      applied: { status: 'ready_to_quote', updatedAt: now.toISOString() },
    });
    expect(prospects[0]).toBe(read.prospects[0]);
    expect(prospects[1]).toEqual({ ...withExtra, status: 'ready_to_quote', updatedAt: now.toISOString() });
    writeManualProspects(storage, prospects);

    const reread = readManualProspects(storage);
    if (!reread.ok) throw new Error(reread.error);
    const undone = undoStatusChange(reread.prospects, change!);
    expect(undone.restored).toBe(true);
    expect(undone.prospects[1]).toEqual(withExtra);

    expect(applyStatusChange(read.prospects, 'mp-min', 'new').change).toBeNull();
    expect(applyStatusChange(read.prospects, 'missing', 'won').change).toBeNull();
  });

  test('undo never overwrites a later edit or a later status change', () => {
    const first = applyStatusChange([MINIMAL], 'mp-min', 'researching', new Date('2026-10-16T15:00:00.000Z'));
    const laterStatus = applyStatusChange(first.prospects, 'mp-min', 'quoted', new Date('2026-10-16T15:00:05.000Z'));
    expect(undoStatusChange(laterStatus.prospects, first.change!)).toEqual({ prospects: laterStatus.prospects, restored: false });

    const laterEdit = first.prospects.map((p) => ({ ...p, internalNotes: 'Edited', updatedAt: '2026-10-16T15:00:03.000Z' }));
    expect(undoStatusChange(laterEdit, first.change!).restored).toBe(false);
    expect(undoStatusChange(laterEdit, first.change!).prospects[0].internalNotes).toBe('Edited');
  });

  test('saving the edit form keeps fields the form does not manage', () => {
    const stored = { ...FULL, futureField: 'keep me' } as ManualProspect;
    const { fields } = validateDraft({ ...draftFromProspect(stored), windowCount: '90' });
    if (!fields) throw new Error('fixture invalid');
    const edited = buildManualProspect(fields, { id: stored.id, createdAt: stored.createdAt, updatedAt: '2026-10-16T15:00:00.000Z' });
    const merged = mergeEdit(stored, edited);
    expect(merged).toMatchObject({ windowCount: 90, createdAt: FULL.createdAt, futureField: 'keep me' });

    const { fields: cleared } = validateDraft({ ...draftFromProspect(stored), internalNotes: '' });
    const clearedRecord = mergeEdit(stored, buildManualProspect(cleared!, { id: stored.id, createdAt: stored.createdAt, updatedAt: stored.updatedAt }));
    expect(clearedRecord).not.toHaveProperty('internalNotes');
  });

  test('the estimate handoff is unchanged for Phase 2 records', () => {
    const handoff = buildDraftEstimateHandoff(MINIMAL, new Date('2026-10-16T15:00:00.000Z'));
    expect(handoff).toMatchObject({ projectStreet: '9 Oak Ave', projectCity: 'High Point', projectState: 'NC', projectZip: '27262', notes: '' });
    expect(handoff).not.toHaveProperty('windowCountReference');
  });
});
