import { test, expect } from '@playwright/test';
import { SAMPLE_PROSPECTS } from '../../src/lib/prospects/sampleData';
import {
  buildManualProspect,
  draftFromProspect,
  emptyDraft,
  findDuplicateAddresses,
  normalizeStreet,
  validateDraft,
  type ProspectDraft,
} from '../../src/lib/prospects/manualProspectForm';
import {
  MANUAL_PROSPECTS_STORAGE_KEY,
  PROSPECT_SETTINGS_STORAGE_KEY,
  readManualProspects,
  readProspectSettings,
  writeManualProspects,
  writeProspectSettings,
} from '../../src/lib/prospects/manualStore';
import {
  BLANK_QUOTE_NUMBER,
  ESTIMATE_HANDOFF_STORAGE_KEY,
  WINDOW_QUOTE_INPUTS,
  buildDraftEstimateHandoff,
  draftFormResetFromHandoff,
  formValuesFromHandoff,
  missingWindowQuoteInputs,
  missingWindowQuoteInputsFromForm,
  takeDraftEstimateHandoff,
  writeDraftEstimateHandoff,
} from '../../src/lib/prospects/estimateHandoff';
import type { ManualProspect } from '../../src/lib/prospects/types';

const TODAY = '2026-10-15';

class MemoryStorage {
  data = new Map<string, string>();
  getItem(key: string) {
    return this.data.has(key) ? this.data.get(key)! : null;
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
}

const validDraft = (overrides: Partial<ProspectDraft> = {}): ProspectDraft => ({
  ...emptyDraft(TODAY),
  street: '  120 N Elm St ',
  city: 'Greensboro',
  state: 'NC',
  zip: '27401',
  propertyType: 'commercial',
  windowCount: '84',
  countConfidence: 'medium',
  sourceType: 'drive_by',
  sourceNote: 'Counted street-facing windows',
  internalNotes: 'Owner manages three buildings downtown.',
  ...overrides,
});

function record(overrides: Partial<ProspectDraft> = {}, id = 'mp-test-1'): ManualProspect {
  const { fields } = validateDraft(validDraft(overrides), TODAY);
  if (!fields) throw new Error('fixture draft should be valid');
  return buildManualProspect(fields, { id, createdAt: '2026-10-01T12:00:00.000Z', updatedAt: '2026-10-01T12:00:00.000Z' });
}

test.describe('Manual prospect validation', () => {
  test('an empty draft lists every missing required field and saves nothing', () => {
    const { errors, fields } = validateDraft(emptyDraft(TODAY), TODAY);
    expect(fields).toBeUndefined();
    expect(Object.keys(errors).sort()).toEqual(['street', 'city', 'zip', 'propertyType', 'sourceType', 'sourceNote'].sort());
  });

  test('a quick entry needs only type, address and source; status defaults to New and the date to today', () => {
    const { fields, errors } = validateDraft(
      validDraft({ windowCount: '', countConfidence: '', internalNotes: '', sourceNote: '', sourceUrl: 'https://example.com/a' }),
      TODAY
    );
    expect(errors).toEqual({});
    expect(fields).toMatchObject({ status: 'new', researchedAt: TODAY });
    for (const key of ['windowCount', 'countConfidence', 'internalNotes'] as const) expect(fields![key]).toBeUndefined();
  });

  test('count confidence is required only when a window count is entered', () => {
    const withCount = validateDraft(validDraft({ windowCount: '40', countConfidence: '' }), TODAY);
    expect(withCount.fields).toBeUndefined();
    expect(Object.keys(withCount.errors)).toEqual(['countConfidence']);

    const confidenceOnly = validateDraft(validDraft({ windowCount: '', countConfidence: 'high' }), TODAY);
    expect(confidenceOnly.errors).toEqual({});
    expect(confidenceOnly.fields!.countConfidence).toBeUndefined();

    const zero = validateDraft(validDraft({ windowCount: '0', countConfidence: 'verified' }), TODAY);
    expect(zero.fields).toMatchObject({ windowCount: 0, countConfidence: 'verified' });
  });

  test('a valid draft produces trimmed fields and leaves blank optional fields out', () => {
    const p = record();
    expect(p).toMatchObject({
      kind: 'manual',
      dataOrigin: 'manual',
      propertyType: 'commercial',
      address: { line1: '120 N Elm St', city: 'Greensboro', state: 'NC', zip: '27401' },
      windowCount: 84,
      countConfidence: 'medium',
      source: { type: 'drive_by', note: 'Counted street-facing windows' },
      researchedAt: TODAY,
      status: 'new',
      referenceUrls: [],
    });
    for (const key of ['name', 'coordinates', 'stories', 'squareFootage', 'preliminaryPrice', 'followUpAt', 'accessNotes']) {
      expect(p).not.toHaveProperty(key);
    }
    expect(p.source).not.toHaveProperty('url');
  });

  test('address format: street, city, state and ZIP', () => {
    const err = (o: Partial<ProspectDraft>) => validateDraft(validDraft(o), TODAY).errors;
    expect(err({ street: '12' }).street).toBeTruthy();
    expect(err({ city: 'Greensboro 27401' }).city).toBeTruthy();
    expect(err({ state: 'XX' }).state).toBeTruthy();
    for (const zip of ['2740', '274011', '27401-12', 'ABCDE']) expect(err({ zip }).zip, zip).toBeTruthy();
    for (const zip of ['27401', '27401-1234']) expect(err({ zip }).zip, zip).toBeUndefined();
    const noNumber = validateDraft(validDraft({ street: 'Elm Street' }), TODAY);
    expect(noNumber.errors.street).toBeUndefined();
    expect(noNumber.warnings.street).toContain('No street number');
    expect(noNumber.fields).toBeDefined();
  });

  test('numbers, dates, coordinates, links and the preliminary price range', () => {
    const err = (o: Partial<ProspectDraft>) => validateDraft(validDraft(o), TODAY).errors;
    expect(err({ windowCount: '12.5' }).windowCount).toBeTruthy();
    expect(err({ windowCount: '-1' }).windowCount).toBeTruthy();
    expect(err({ windowCount: '0' }).windowCount).toBeUndefined();
    expect(err({ researchedAt: '2026-10-16' }).researchedAt).toContain('future');
    expect(err({ researchedAt: '2026-02-30' }).researchedAt).toBeTruthy();
    expect(err({ followUpAt: '2026-13-01' }).followUpAt).toBeTruthy();
    expect(err({ lat: '36.07' }).lng).toBeTruthy();
    expect(err({ lat: '95', lng: '-79.8' }).lat).toBeTruthy();
    expect(err({ sourceUrl: 'javascript:alert(1)' }).sourceUrl).toBeTruthy();
    expect(err({ sourceUrl: 'ftp://example.com/file' }).sourceUrl).toBeTruthy();
    expect(err({ sourceNote: '', sourceUrl: '' }).sourceNote).toContain('source link or a short source note');
    expect(err({ sourceNote: '', sourceUrl: 'https://example.com/listing' }).sourceNote).toBeUndefined();
    expect(err({ referenceUrls: 'https://example.com/a\nnot a link' }).referenceUrls).toBeTruthy();
    expect(err({ priceLow: '5000', priceHigh: '4000' }).priceHigh).toContain('at least the low');
    expect(err({ priceLow: '5000' }).priceHigh).toBeTruthy();

    const full = record({
      lat: '36.0726',
      lng: '-79.792',
      stories: '3',
      squareFootage: '24,000',
      priceLow: '$1,200',
      priceHigh: '1800.50',
      referenceUrls: ' https://example.com/a \n\nhttps://example.com/b',
    });
    expect(full.coordinates).toEqual({ lat: 36.0726, lng: -79.792 });
    expect(full.squareFootage).toBe(24000);
    expect(full.preliminaryPrice).toEqual({ low: 1200, high: 1800.5 });
    expect(full.referenceUrls).toEqual(['https://example.com/a', 'https://example.com/b']);
  });

  test('editing round-trips: a saved record loads into the form and validates to the same fields', () => {
    const p = record({ name: 'Elm Street Lofts', lat: '36.07', lng: '-79.79', priceLow: '900', priceHigh: '1500', followUpAt: '2026-11-01' });
    const again = validateDraft(draftFromProspect(p), TODAY).fields!;
    expect(buildManualProspect(again, { id: p.id, createdAt: p.createdAt, updatedAt: p.updatedAt })).toEqual(p);
  });
});

test.describe('Duplicate address detection', () => {
  const existing = record({ street: '120 N Elm St', zip: '27401' }, 'mp-existing');

  test('matches the same address written differently, and flags a different suite as similar', () => {
    expect(normalizeStreet('120 North Elm Street.')).toBe('120 n elm st');
    const same = findDuplicateAddresses({ line1: '120 North Elm Street', city: 'Greensboro', state: 'NC', zip: '27401-5555' }, [existing]);
    expect(same.map((d) => [d.prospect.id, d.match])).toEqual([['mp-existing', 'same']]);
    const suite = findDuplicateAddresses({ line1: '120 N Elm St Suite 200', city: 'Greensboro', state: 'NC', zip: '27401' }, [existing]);
    expect(suite.map((d) => d.match)).toEqual(['similar']);
  });

  test('ignores other ZIPs and the record being edited, and compares sample records by city when they lack a ZIP', () => {
    expect(findDuplicateAddresses({ line1: '120 N Elm St', city: 'Greensboro', state: 'NC', zip: '27408' }, [existing])).toEqual([]);
    expect(findDuplicateAddresses({ line1: '120 N Elm St', city: 'Greensboro', state: 'NC', zip: '27401' }, [existing], 'mp-existing')).toEqual([]);
    const sample = SAMPLE_PROSPECTS[0];
    const matches = findDuplicateAddresses(
      { line1: sample.address.line1, city: sample.address.city, state: sample.address.state, zip: sample.address.zip },
      SAMPLE_PROSPECTS
    );
    expect(matches.map((d) => d.prospect.id)).toContain(sample.id);
  });
});

test.describe('Manual prospect storage', () => {
  test('saves and reloads records under their own versioned key', () => {
    const storage = new MemoryStorage();
    expect(readManualProspects(storage)).toEqual({ ok: true, prospects: [] });
    const p = record();
    expect(writeManualProspects(storage, [p])).toEqual({ ok: true });
    expect(JSON.parse(storage.getItem(MANUAL_PROSPECTS_STORAGE_KEY)!).version).toBe(1);
    expect(readManualProspects(storage)).toEqual({ ok: true, prospects: [p] });
  });

  test('reports unreadable, invalid or newer-format data instead of replacing it', () => {
    for (const raw of ['{not json', JSON.stringify({ version: 2, prospects: [] }), JSON.stringify({ version: 1, prospects: [{ id: 'x' }] })]) {
      const storage = new MemoryStorage();
      storage.setItem(MANUAL_PROSPECTS_STORAGE_KEY, raw);
      const result = readManualProspects(storage);
      expect(result.ok, raw).toBe(false);
      expect(storage.getItem(MANUAL_PROSPECTS_STORAGE_KEY)).toBe(raw);
    }
  });

  test('records without a window count or notes are valid, but a count without a confidence is not', () => {
    const quick = record({ windowCount: '', countConfidence: '', internalNotes: '' });
    const storage = new MemoryStorage();
    writeManualProspects(storage, [quick, record({}, 'mp-full')]);
    expect(readManualProspects(storage)).toMatchObject({ ok: true });

    const broken = { ...quick, windowCount: 12 };
    storage.setItem(MANUAL_PROSPECTS_STORAGE_KEY, JSON.stringify({ version: 1, prospects: [broken] }));
    expect(readManualProspects(storage).ok).toBe(false);
  });

  test('a full browser storage is reported, not thrown', () => {
    const full = { getItem: () => null, setItem: () => { throw new Error('QuotaExceededError'); } };
    expect(writeManualProspects(full, [record()])).toMatchObject({ ok: false });
  });

  test('the show-sample-data setting defaults to on and persists when turned off', () => {
    const storage = new MemoryStorage();
    expect(readProspectSettings(storage)).toEqual({ showSampleData: true });
    writeProspectSettings(storage, { showSampleData: false });
    expect(readProspectSettings(storage)).toEqual({ showSampleData: false });
    storage.setItem(PROSPECT_SETTINGS_STORAGE_KEY, 'garbage');
    expect(readProspectSettings(storage)).toEqual({ showSampleData: true });
  });
});

test.describe('Draft estimate handoff', () => {
  const now = new Date('2026-10-15T15:00:00.000Z');
  const p = record({ name: 'Elm Street Lofts', priceLow: '4000', priceHigh: '6000', accessNotes: 'Lift needed' });

  test('carries known prospect details and never prices or invents a window split', () => {
    const handoff = buildDraftEstimateHandoff(p, now);
    expect(handoff).toMatchObject({
      version: 2,
      projectName: 'Elm Street Lofts',
      projectStreet: '120 N Elm St',
      projectCity: 'Greensboro',
      projectState: 'NC',
      projectZip: '27401',
      notes: p.internalNotes,
      accessNotes: 'Lift needed',
      windowCustomerType: 'commercial',
      windowCountReference: { count: 84, confidence: 'medium' },
      clientName: 'Elm Street Lofts',
    });
    expect(handoff).not.toHaveProperty('windowCounts');
    expect(handoff).not.toHaveProperty('windowServiceSides');
    expect(handoff).not.toHaveProperty('distanceFromOffice');
    expect(JSON.stringify(handoff)).not.toMatch(/4000|6000|price/i);
    expect(missingWindowQuoteInputs(handoff)).toEqual([
      WINDOW_QUOTE_INPUTS.sides,
      WINDOW_QUOTE_INPUTS.windowSplit,
      WINDOW_QUOTE_INPUTS.distance,
    ]);
    expect(formValuesFromHandoff(handoff).numberOfWindows).toBe(BLANK_QUOTE_NUMBER);
    expect(formValuesFromHandoff(handoff).distanceFromOffice).toBe(BLANK_QUOTE_NUMBER);
    expect(formValuesFromHandoff(handoff).windowServiceSides).toBeUndefined();
    expect(missingWindowQuoteInputsFromForm(formValuesFromHandoff(handoff))).toEqual([
      WINDOW_QUOTE_INPUTS.sides,
      WINDOW_QUOTE_INPUTS.windowSplit,
      WINDOW_QUOTE_INPUTS.distance,
    ]);

    const noCount = buildDraftEstimateHandoff(record({ windowCount: '', countConfidence: '', internalNotes: '' }), now);
    expect(noCount).not.toHaveProperty('windowCountReference');
    expect(noCount.notes).toBe('');
    const storage = new MemoryStorage();
    writeDraftEstimateHandoff(storage, noCount);
    expect(takeDraftEstimateHandoff(storage, now)?.projectStreet).toBe('120 N Elm St');
  });

  test('a complete quote-ready prospect has no missing estimate inputs and uses the saved split', () => {
    const stored: ManualProspect = {
      ...p,
      propertyType: 'residential',
      windowServiceSides: 'interior_exterior',
      standardWindows: 18,
      largeWindows: 2,
      highAccessWindows: 0,
      distanceFromOffice: 15,
      contactName: 'Dana Oak',
      contactPhone: '336-555-0100',
    };
    const handoff = buildDraftEstimateHandoff(stored, now);
    expect(missingWindowQuoteInputs(handoff)).toEqual([]);
    expect(formValuesFromHandoff(handoff)).toMatchObject({
      cleaningType: 'window_cleaning_only',
      windowCustomerType: 'residential',
      windowServiceSides: 'interior_exterior',
      numberOfWindows: 18,
      numberOfLargeWindows: 2,
      numberOfHighAccessWindows: 0,
      distanceFromOffice: 15,
      clientName: 'Dana Oak',
      clientPhone: '336-555-0100',
      isProspectDraft: true,
    });
    expect(missingWindowQuoteInputsFromForm(formValuesFromHandoff(handoff))).toEqual([]);
  });

  test('a new draft reset drops leftover quote fields from a previous estimator session', () => {
    const leftover = {
      cleaningType: 'window_cleaning_only' as const,
      windowCustomerType: 'residential' as const,
      windowServiceSides: 'interior_exterior' as const,
      numberOfWindows: 18,
      numberOfLargeWindows: 2,
      numberOfHighAccessWindows: 0,
      distanceFromOffice: 15,
      gasPrice: 3.5,
      numberOfCleaners: 4,
      projectName: 'Oak Lane Residence',
    };
    const reset = draftFormResetFromHandoff(buildDraftEstimateHandoff(p, now), leftover);
    expect(reset).toMatchObject({
      cleaningType: 'window_cleaning_only',
      windowCustomerType: 'commercial',
      projectName: 'Elm Street Lofts',
      gasPrice: 3.5,
      numberOfCleaners: 4,
      applyMarkup: true,
    });
    expect(reset.windowServiceSides).toBeUndefined();
    expect(reset.numberOfWindows).toBe(BLANK_QUOTE_NUMBER);
    expect(reset.numberOfLargeWindows).toBe(BLANK_QUOTE_NUMBER);
    expect(reset.numberOfHighAccessWindows).toBe(BLANK_QUOTE_NUMBER);
    expect(reset.distanceFromOffice).toBe(BLANK_QUOTE_NUMBER);
    expect(reset.numberOfWindows).not.toBe(84);
    expect(missingWindowQuoteInputsFromForm(reset)).toEqual([
      WINDOW_QUOTE_INPUTS.sides,
      WINDOW_QUOTE_INPUTS.windowSplit,
      WINDOW_QUOTE_INPUTS.distance,
    ]);
  });

  test('is read once, then removed; stale or malformed handoffs are ignored', () => {
    const storage = new MemoryStorage();
    writeDraftEstimateHandoff(storage, buildDraftEstimateHandoff(p, now));
    expect(takeDraftEstimateHandoff(storage, now)?.prospectId).toBe(p.id);
    expect(storage.getItem(ESTIMATE_HANDOFF_STORAGE_KEY)).toBeNull();
    expect(takeDraftEstimateHandoff(storage, now)).toBeNull();

    writeDraftEstimateHandoff(storage, buildDraftEstimateHandoff(p, now));
    expect(takeDraftEstimateHandoff(storage, new Date(now.getTime() + 31 * 60 * 1000))).toBeNull();
    expect(storage.getItem(ESTIMATE_HANDOFF_STORAGE_KEY)).toBeNull();

    storage.setItem(ESTIMATE_HANDOFF_STORAGE_KEY, JSON.stringify({ version: 1, createdAt: now.toISOString() }));
    expect(takeDraftEstimateHandoff(storage, now)).toBeNull();
  });
});
