import { test, expect } from '@playwright/test';
import { SAMPLE_PROSPECTS } from '../../src/lib/prospects/sampleData';
import {
  buildProspectSearch,
  countBySegment,
  filterProspects,
  getSegment,
  matchesQuery,
  parseProspectUrlState,
} from '../../src/lib/prospects/filters';
import {
  LEADS_STORAGE_KEY,
  applyLeadChange,
  createLead,
  readLeads,
  writeLeads,
} from '../../src/lib/prospects/leadStore';
import type { Fact, Prospect } from '../../src/lib/prospects/types';

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

function factsOf(p: Prospect): Fact<unknown>[] {
  const facts: (Fact<unknown> | undefined)[] =
    p.kind === 'property'
      ? [p.buildingType, p.squareFootage, p.stories, p.windows?.standard, p.windows?.large, p.windows?.highAccess]
      : [p.squareFootage, p.generalContractor, p.bidDeadline, p.estimatedCompletion];
  return facts.filter((f): f is Fact<unknown> => Boolean(f));
}

test.describe('Prospect sample data (src/lib/prospects/sampleData.ts)', () => {
  test('about 25 fictional records across all three segments, each labeled as sample data', () => {
    expect(SAMPLE_PROSPECTS.length).toBe(25);
    expect(new Set(SAMPLE_PROSPECTS.map((p) => p.id)).size).toBe(25);
    const segments = SAMPLE_PROSPECTS.map(getSegment);
    expect(segments.filter((s) => s === 'commercial').length).toBe(10);
    expect(segments.filter((s) => s === 'residential').length).toBe(6);
    expect(segments.filter((s) => s === 'construction').length).toBe(9);
    for (const p of SAMPLE_PROSPECTS) {
      expect(p.dataOrigin, p.id).toBe('sample');
      expect(p.sources.length, p.id).toBeGreaterThan(0);
      for (const s of p.sources) expect(s.type, `${p.id} ${s.id}`).toBe('sample');
    }
  });

  test('every estimated value states its assumption, and cited sources exist on the record', () => {
    for (const p of SAMPLE_PROSPECTS) {
      const sourceIds = new Set(p.sources.map((s) => s.id));
      for (const f of factsOf(p)) {
        if (f.kind === 'estimated') expect(f.assumption, p.id).toBeTruthy();
        if (f.sourceId) expect(sourceIds.has(f.sourceId), `${p.id} cites ${f.sourceId}`).toBe(true);
      }
      if (p.kind === 'construction') {
        for (const m of p.milestones) {
          if (m.kind === 'estimated') expect(m.assumption, `${p.id} ${m.label}`).toBeTruthy();
          if (m.sourceId) expect(sourceIds.has(m.sourceId), `${p.id} ${m.label}`).toBe(true);
        }
      }
    }
  });

  test('records sit inside the Triad map area and contain no contact details', () => {
    for (const p of SAMPLE_PROSPECTS) {
      expect(p.location.lat).toBeGreaterThan(35.86);
      expect(p.location.lat).toBeLessThan(36.21);
      expect(p.location.lng).toBeGreaterThan(-80.42);
      expect(p.location.lng).toBeLessThan(-79.38);
      const text = JSON.stringify(p);
      expect(text, p.id).not.toMatch(/@|\(\d{3}\)|\d{3}-\d{3}-\d{4}/);
    }
  });
});

test.describe('Prospect filters (src/lib/prospects/filters.ts)', () => {
  test('segments: construction projects get their own tab, buildings group by category', () => {
    const all = { query: '', savedOnly: false };
    expect(filterProspects(SAMPLE_PROSPECTS, { ...all, segment: 'all' })).toHaveLength(25);
    expect(filterProspects(SAMPLE_PROSPECTS, { ...all, segment: 'construction' }).every((p) => p.kind === 'construction')).toBe(true);
    expect(
      filterProspects(SAMPLE_PROSPECTS, { ...all, segment: 'residential' }).every(
        (p) => p.kind === 'property' && p.category === 'residential'
      )
    ).toBe(true);
  });

  test('search matches every word across name, address, ZIP, type and contractor, ignoring case and punctuation', () => {
    const quill = SAMPLE_PROSPECTS.find((p) => p.id === 'sp-quillmark-medical')!;
    expect(matchesQuery(quill, 'QUILLMARK')).toBe(true);
    expect(matchesQuery(quill, 'medical greensboro')).toBe(true);
    expect(matchesQuery(quill, '27410')).toBe(true);
    expect(matchesQuery(quill, 'medical winston')).toBe(false);
    expect(matchesQuery(quill, '   ')).toBe(true);
    const ironbark = SAMPLE_PROSPECTS.find((p) => p.id === 'sc-ironbark-office')!;
    expect(matchesQuery(ironbark, 'example interiors')).toBe(true);
    expect(matchesQuery(ironbark, 'Winston-Salem')).toBe(true);
  });

  test('search, segment and saved-only combine, and tab counts follow the search', () => {
    const results = filterProspects(SAMPLE_PROSPECTS, { query: 'greensboro', segment: 'construction', savedOnly: false });
    expect(results.map((p) => p.id).sort()).toEqual(['sc-goldfinch-restaurant', 'sc-quarrystone-clinic', 'sc-saltmarsh-apartments']);

    const saved = new Set(['sc-goldfinch-restaurant', 'sp-orchardmere-home']);
    expect(
      filterProspects(SAMPLE_PROSPECTS, { query: 'greensboro', segment: 'construction', savedOnly: true }, saved).map((p) => p.id)
    ).toEqual(['sc-goldfinch-restaurant']);

    const counts = countBySegment(SAMPLE_PROSPECTS, { query: 'greensboro', savedOnly: false });
    expect(counts.construction).toBe(3);
    expect(counts.all).toBe(counts.commercial + counts.residential + counts.construction);
    expect(counts.all).toBe(filterProspects(SAMPLE_PROSPECTS, { query: 'greensboro', segment: 'all', savedOnly: false }).length);
  });

  test('URL state round-trips and ignores unknown values', () => {
    const state = {
      query: 'medical',
      segment: 'commercial' as const,
      savedOnly: true,
      selectedId: 'sp-quillmark-medical',
      view: 'map' as const,
      edit: 'new',
    };
    const search = buildProspectSearch(state);
    expect(parseProspectUrlState(new URLSearchParams(search))).toEqual(state);
    expect(buildProspectSearch({ query: '  ', segment: 'all', savedOnly: false, selectedId: null, view: 'list', edit: null })).toBe('');
    expect(parseProspectUrlState(new URLSearchParams('type=bogus&view=globe&saved=yes'))).toEqual({
      query: '',
      segment: 'all',
      savedOnly: false,
      selectedId: null,
      view: 'list',
      edit: null,
    });
  });
});

test.describe('Lead storage (src/lib/prospects/leadStore.ts)', () => {
  test('saves and reads leads under its own versioned key', () => {
    const storage = memoryStorage();
    expect(readLeads(storage)).toEqual({ ok: true, leads: [] });
    const lead = createLead('sp-quillmark-medical', new Date('2026-10-15T12:00:00Z'));
    expect(writeLeads(storage, [lead])).toEqual({ ok: true });
    expect(Object.keys(storage.data)).toEqual([LEADS_STORAGE_KEY]);
    expect(JSON.parse(storage.data[LEADS_STORAGE_KEY]).version).toBe(1);
    expect(readLeads(storage)).toEqual({ ok: true, leads: [lead] });
  });

  test('status, follow-up date and notes update immutably', () => {
    const lead = createLead('p1', new Date('2026-10-15T12:00:00Z'));
    const later = new Date('2026-10-16T09:30:00Z');
    const contacted = applyLeadChange(lead, { type: 'status', status: 'contacted' }, later);
    expect(contacted.status).toBe('contacted');
    expect(contacted.updatedAt).toBe(later.toISOString());
    expect(lead.status).toBe('new');

    const withDate = applyLeadChange(contacted, { type: 'followUp', date: '2026-10-20' });
    expect(withDate.followUpAt).toBe('2026-10-20');
    expect(applyLeadChange(withDate, { type: 'followUp', date: null })).not.toHaveProperty('followUpAt');
    expect(applyLeadChange(withDate, { type: 'followUp', date: '10/20/2026' })).not.toHaveProperty('followUpAt');

    const noted = applyLeadChange(withDate, { type: 'addNote', text: '  Called front desk  ' }, later);
    expect(noted.notes).toEqual([{ at: later.toISOString(), text: 'Called front desk' }]);
    expect(applyLeadChange(noted, { type: 'addNote', text: '   ' })).toBe(noted);
  });

  test('corrupted or unknown-format data is reported and left untouched', () => {
    for (const raw of ['{not json', JSON.stringify({ version: 2, leads: [] }), JSON.stringify({ version: 1, leads: [{ id: 1 }] })]) {
      const storage = memoryStorage({ [LEADS_STORAGE_KEY]: raw });
      const result = readLeads(storage);
      expect(result.ok, raw).toBe(false);
      expect(storage.data[LEADS_STORAGE_KEY]).toBe(raw);
    }
  });

  test('storage failures are reported instead of thrown', () => {
    const broken = {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('quota');
      },
    };
    expect(readLeads(broken).ok).toBe(false);
    expect(writeLeads(broken, []).ok).toBe(false);
  });
});
