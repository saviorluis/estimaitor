import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { buildManualProspect, emptyDraft, localIsoDate, validateDraft, type ProspectDraft } from '../../src/lib/prospects/manualProspectForm';
import type { ManualProspect } from '../../src/lib/prospects/types';

const PROSPECTS_KEY = 'estimaitor_pi_prospects_v1';
const SETTINGS_KEY = 'estimaitor_pi_settings_v1';
const HANDOFF_KEY = 'estimaitor_pi_estimate_handoff_v1';

function makeRecord(overrides: Partial<ProspectDraft> = {}, id = 'mp-seed-1'): ManualProspect {
  const draft: ProspectDraft = {
    ...emptyDraft(localIsoDate()),
    name: 'Elm Street Lofts',
    street: '120 N Elm St',
    city: 'Greensboro',
    state: 'NC',
    zip: '27401',
    propertyType: 'commercial',
    windowCount: '84',
    countConfidence: 'medium',
    sourceType: 'drive_by',
    sourceNote: 'Counted street-facing windows',
    internalNotes: 'Manager prefers email.',
    ...overrides,
  };
  const { fields, errors } = validateDraft(draft);
  if (!fields) throw new Error(`fixture invalid: ${JSON.stringify(errors)}`);
  return buildManualProspect(fields, { id, createdAt: '2026-10-01T12:00:00.000Z', updatedAt: '2026-10-01T12:00:00.000Z' });
}

async function openProspects(page: Page, search = '') {
  await page.goto(`/prospects${search}`);
  await page.getByRole('heading', { level: 1, name: 'Prospects' }).waitFor();
  await expect(page.getByTestId('prospects-loading')).toHaveCount(0);
}

async function seed(page: Page, records: ManualProspect[], search = '') {
  await page.goto('/prospects');
  await page.evaluate(
    ([key, value]) => window.localStorage.setItem(key, value),
    [PROSPECTS_KEY, JSON.stringify({ version: 1, prospects: records })]
  );
  await openProspects(page, search);
}

const stored = (page: Page) =>
  page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) || 'null'), PROSPECTS_KEY) as Promise<{
    version: number;
    prospects: ManualProspect[];
  } | null>;

const form = (page: Page) => page.getByTestId('prospect-form');
const detail = (page: Page) => page.getByTestId('prospect-detail');
const cards = (page: Page) => page.locator('[data-prospect-id]');

async function fillRequired(page: Page, values: Partial<Record<string, string>> = {}) {
  const v = {
    street: '455 Market Street',
    city: 'Winston-Salem',
    state: 'NC',
    zip: '27101',
    windowCount: '140',
    sourceNote: 'Walked the block and counted',
    internalNotes: 'Glass storefront plus two upper floors.',
    ...values,
  };
  await page.locator('#pf-street').fill(v.street);
  await page.locator('#pf-city').fill(v.city);
  await page.locator('#pf-state').selectOption(v.state);
  await page.locator('#pf-zip').fill(v.zip);
  await page.locator('#pf-propertyType-commercial').check();
  await page.locator('#pf-windowCount').fill(v.windowCount);
  await page.locator('#pf-sourceType').selectOption('site_visit');
  await page.locator('#pf-sourceNote').fill(v.sourceNote);
  await openDetails(page);
  await page.locator('#pf-countConfidence-high').check();
  await page.locator('#pf-internalNotes').fill(v.internalNotes);
}

const detailsToggle = (page: Page) => page.getByRole('button', { name: /^More details/ });

async function openDetails(page: Page) {
  if ((await detailsToggle(page).getAttribute('aria-expanded')) !== 'true') await detailsToggle(page).click();
}

test.describe('Real prospect entry (/prospects)', () => {
  test('validates, creates, saves and reloads a real prospect, kept apart from sample data', async ({ page }) => {
    await openProspects(page);
    await page.getByRole('button', { name: 'Add Prospect' }).click();
    await expect(page.getByRole('heading', { name: 'Add prospect' })).toBeFocused();
    await expect(page).toHaveURL(/\/prospects$/);

    await page.getByRole('button', { name: 'Save prospect' }).click();
    const summary = page.getByTestId('form-error-summary');
    await expect(summary).toBeFocused();
    await expect(summary).toContainText('Fix 6 fields before saving');
    await expect(detailsToggle(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#pf-street')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#pf-street')).toHaveAttribute('aria-describedby', /pf-street-error/);

    await fillRequired(page, { zip: '2710' });
    await page.locator('#pf-sourceUrl').fill('javascript:alert(1)');
    await page.locator('#pf-priceLow').fill('5000');
    await page.locator('#pf-priceHigh').fill('3000');
    await page.getByRole('button', { name: 'Save prospect' }).click();
    await expect(page.locator('#pf-zip-error')).toHaveText(/5-digit ZIP/);
    await expect(page.locator('#pf-sourceUrl-error')).toBeVisible();
    await expect(page.locator('#pf-priceHigh-error')).toHaveText(/at least the low/);
    expect(await stored(page)).toBeNull();

    await page.locator('#pf-zip').fill('27101');
    await page.locator('#pf-sourceUrl').fill('https://example.com/listing/455');
    await page.locator('#pf-priceHigh').fill('7500');
    await page.locator('#pf-name').fill('Market Street Commons');
    await page.getByRole('button', { name: 'Save prospect' }).click();

    await expect(detail(page).getByRole('heading', { level: 2 })).toHaveText('Market Street Commons');
    await expect(detail(page)).toContainText('Your data');
    const count = detail(page).locator('[data-fact="Estimated window count"]');
    await expect(count).toContainText('140');
    await expect(count.locator('[data-fact-kind]')).toHaveAttribute('data-fact-kind', 'estimated');
    await expect(count).toContainText('High confidence · not verified');
    await expect(page.getByTestId('preliminary-price')).toContainText('Preliminary price range · not a customer quote');
    const provenance = page.getByTestId('manual-provenance');
    await expect(provenance).toContainText('Site visit');
    await expect(provenance).toContainText('Walked the block and counted');
    await expect(provenance.getByRole('link', { name: /example\.com\/listing\/455/ })).toHaveAttribute('rel', /noopener/);
    await expect(provenance).toContainText('Researched');
    await expect(provenance).toContainText(/Created [\s\S]*Last updated/);
    await expect(detail(page)).toContainText('No coordinates, so this prospect is not on the map');

    const saved = await stored(page);
    expect(saved?.version).toBe(1);
    expect(saved?.prospects).toHaveLength(1);
    expect(saved?.prospects[0]).toMatchObject({ dataOrigin: 'manual', windowCount: 140, countConfidence: 'high', status: 'new' });

    await page.reload();
    await expect(detail(page).getByRole('heading', { level: 2 })).toHaveText('Market Street Commons');
    await page.getByRole('button', { name: 'Back to results' }).click();
    await expect(page.getByRole('heading', { name: 'Your prospects · 1' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Sample data · 25' })).toBeVisible();
    await expect(page.getByRole('list', { name: 'Your prospects' }).getByText('Your data')).toHaveCount(1);
    await expect(page.getByRole('list', { name: 'Sample prospects' }).getByText('Sample data', { exact: true })).toHaveCount(25);
    await expect(page.locator('[data-marker-id]')).toHaveCount(25);
  });

  test('edits a saved prospect, keeps its created time, and asks before discarding changes', async ({ page }) => {
    await seed(page, [makeRecord()], '?id=mp-seed-1');
    await detail(page).getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByRole('heading', { name: 'Edit prospect' })).toBeFocused();
    await expect(page.locator('#pf-street')).toHaveValue('120 N Elm St');

    await page.locator('#pf-windowCount').fill('90');
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByText('Discard your changes?')).toBeVisible();
    await page.getByRole('button', { name: 'Keep editing' }).click();

    await expect(detailsToggle(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(detailsToggle(page)).toContainText('2 filled');
    await openDetails(page);
    await expect(page.locator('#pf-countConfidence-medium')).toBeChecked();
    await expect(page.locator('#pf-internalNotes')).toHaveValue('Manager prefers email.');
    await page.locator('#pf-status').selectOption('ready_to_quote');
    await page.locator('#pf-countConfidence-verified').check();
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect(page).not.toHaveURL(/edit=|id=/);
    const count = detail(page).locator('[data-fact="Estimated window count"]');
    await expect(count).toContainText('90');
    await expect(count.locator('[data-fact-kind]')).toHaveAttribute('data-fact-kind', 'verified');
    await expect(count).toContainText('marked verified by you');
    await expect(detail(page).locator('#quick-status')).toHaveValue('ready_to_quote');

    const [p] = (await stored(page))!.prospects;
    expect(p.createdAt).toBe('2026-10-01T12:00:00.000Z');
    expect(p.updatedAt > p.createdAt).toBe(true);
    expect(p).toMatchObject({ windowCount: 90, status: 'ready_to_quote', countConfidence: 'verified' });

    await page.goBack();
    await expect(page.getByRole('heading', { name: 'Your prospects · 1' })).toBeVisible();
  });

  test('quick add: only type, address and source are needed; More details starts collapsed with New and today as defaults', async ({ page }) => {
    await openProspects(page, '?edit=new');
    await expect(detailsToggle(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#prospect-more-details')).toBeHidden();

    await page.locator('#pf-propertyType-residential').check();
    await page.locator('#pf-street').fill('9 Oak Ave');
    await page.locator('#pf-city').fill('High Point');
    await page.locator('#pf-zip').fill('27262');
    await page.locator('#pf-sourceType').selectOption('client_provided');
    await page.locator('#pf-sourceUrl').fill('https://example.com/oak');

    await openDetails(page);
    await expect(page.locator('#pf-status')).toHaveValue('new');
    await expect(page.locator('#pf-researchedAt')).toHaveValue(localIsoDate());
    await detailsToggle(page).click();

    await page.getByRole('button', { name: 'Save prospect' }).click();
    await expect(detail(page).getByRole('heading', { level: 2 })).toHaveText('9 Oak Ave');
    await expect(detail(page).locator('[data-fact="Estimated window count"]')).toContainText('Not entered');
    const [p] = (await stored(page))!.prospects;
    expect(p).toMatchObject({ propertyType: 'residential', status: 'new', researchedAt: localIsoDate(), source: { url: 'https://example.com/oak' } });
    expect(p).not.toHaveProperty('windowCount');
    expect(p).not.toHaveProperty('internalNotes');
  });

  test('a window count needs a confidence; the collapsed section opens to show the error and keeps its values', async ({ page }) => {
    await openProspects(page, '?edit=new');
    await fillRequired(page);
    await page.locator('#pf-stories').fill('3');
    await page.locator('#pf-priceLow').fill('900');
    await page.locator('#pf-priceHigh').fill('1400');
    await detailsToggle(page).click();
    await expect(page.locator('#prospect-more-details')).toBeHidden();
    await detailsToggle(page).click();
    await expect(page.locator('#pf-stories')).toHaveValue('3');
    await expect(page.locator('#pf-priceHigh')).toHaveValue('1400');
    await expect(page.locator('#pf-internalNotes')).toHaveValue('Glass storefront plus two upper floors.');
    await detailsToggle(page).click();
    await expect(detailsToggle(page)).toContainText('5 filled');
  });

  test('saving a window count without a confidence opens More details at the error', async ({ page }) => {
    await openProspects(page, '?edit=new');
    await page.locator('#pf-propertyType-commercial').check();
    await page.locator('#pf-street').fill('77 Pine St');
    await page.locator('#pf-city').fill('Greensboro');
    await page.locator('#pf-zip').fill('27401');
    await page.locator('#pf-sourceType').selectOption('drive_by');
    await page.locator('#pf-sourceNote').fill('Seen from the road');
    await page.locator('#pf-windowCount').fill('30');
    await expect(page.locator('#pf-windowCount-hint')).toHaveText('Set its confidence under More details.');

    await page.getByRole('button', { name: 'Save prospect' }).click();
    await expect(page.getByTestId('form-error-summary')).toContainText('Fix 1 field before saving');
    await expect(detailsToggle(page)).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#pf-countConfidence-error')).toBeVisible();
    expect(await stored(page)).toBeNull();

    await page.locator('#pf-countConfidence-low').check();
    await page.getByRole('button', { name: 'Save prospect' }).click();
    await expect(detail(page).locator('[data-fact="Estimated window count"]')).toContainText('Low confidence · not verified');
  });

  test('deletes only after confirmation', async ({ page }) => {
    await seed(page, [makeRecord(), makeRecord({ street: '9 Oak Ave', name: 'Oak Duplex', propertyType: 'residential' }, 'mp-seed-2')], '?id=mp-seed-1');
    await detail(page).getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('group', { name: 'Confirm delete' }).getByRole('button', { name: 'Cancel' }).click();
    expect((await stored(page))!.prospects).toHaveLength(2);

    await detail(page).getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Yes, delete' }).click();
    await expect(detail(page)).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Your prospects · 1' })).toBeVisible();
    expect((await stored(page))!.prospects.map((p) => p.id)).toEqual(['mp-seed-2']);
    await page.reload();
    await expect(cards(page).filter({ hasText: 'Elm Street Lofts' })).toHaveCount(0);
  });

  test('warns about a possible duplicate address and saves a second record only when confirmed', async ({ page }) => {
    await seed(page, [makeRecord()]);
    await page.getByRole('button', { name: 'Add Prospect' }).click();
    await fillRequired(page, { street: '120 North Elm Street', city: 'Greensboro', zip: '27401' });

    const warning = page.getByTestId('duplicate-warning');
    await expect(warning).toContainText('Possible duplicate address');
    await expect(warning).toContainText('Elm Street Lofts');
    await expect(warning).toContainText('Your data · same address');
    await expect(warning).toContainText('Nothing will be merged or overwritten');

    await page.getByRole('button', { name: 'Save prospect' }).click();
    await expect(page.locator('#pf-duplicate-error')).toBeVisible();
    expect((await stored(page))!.prospects).toHaveLength(1);

    await warning.getByRole('checkbox', { name: /different prospect/ }).check();
    await page.getByRole('button', { name: 'Save prospect' }).click();
    await expect(detail(page)).toBeVisible();
    const all = (await stored(page))!.prospects;
    expect(all).toHaveLength(2);
    expect(all.find((p) => p.id === 'mp-seed-1')).toEqual(makeRecord());
  });

  test('sample data can be hidden and shown again without deleting it', async ({ page }) => {
    await seed(page, [makeRecord({ lat: '36.0726', lng: '-79.792' })]);
    await expect(cards(page)).toHaveCount(26);
    await expect(page.locator('[data-marker-id][data-origin="manual"]')).toHaveCount(1);
    await expect(page.locator('[data-marker-id][data-origin="sample"]')).toHaveCount(25);

    await page.getByRole('button', { name: 'Hide sample data' }).click();
    await expect(cards(page)).toHaveCount(1);
    await expect(page.getByText('Sample data', { exact: true })).toHaveCount(0);
    await expect(page.getByTestId('sample-data-banner')).toContainText('Sample data is hidden (25 fictional records kept, not deleted)');
    await expect(page.locator('[data-marker-id]')).toHaveCount(1);

    await page.reload();
    await expect(cards(page)).toHaveCount(1);
    expect(await page.evaluate((key) => window.localStorage.getItem(key), SETTINGS_KEY)).toContain('"showSampleData":false');

    await page.getByRole('button', { name: 'Show sample data' }).click();
    await expect(cards(page)).toHaveCount(26);
    await expect(page.getByRole('heading', { name: 'Sample data · 25' })).toBeVisible();
  });

  test('Create Draft Estimate prefills only the address, name and notes, and prices nothing', async ({ page }) => {
    await seed(page, [makeRecord({ priceLow: '4100', priceHigh: '6900', accessNotes: 'Needs a 40 ft lift' })], '?id=mp-seed-1');
    await page.evaluate(() => window.localStorage.setItem('estimaitor_app_mode', 'pressure_washing'));
    await detail(page).getByRole('button', { name: 'Create Draft Estimate' }).click();

    await expect(page).toHaveURL(/\/$/);
    const banner = page.getByTestId('prospect-draft-banner');
    await expect(banner).toContainText('Draft from prospect: Elm Street Lofts');
    await expect(banner).toContainText('Nothing has been priced, saved as a quote, or sent');
    await expect(banner).toContainText('Window count from your research (reference only, not applied): 84 · Medium confidence');
    await expect(banner).toContainText('Manager prefers email.');
    await expect(page.locator('#projectName')).toHaveValue('Elm Street Lofts');
    await expect(page.locator('#projectStreet')).toHaveValue('120 N Elm St');
    await expect(page.locator('#projectCity')).toHaveValue('Greensboro');
    await expect(page.locator('#projectState')).toHaveValue('NC');
    await expect(page.locator('#projectZip')).toHaveValue('27401');
    await expect(page.locator('#needsWindowCleaning')).not.toBeChecked();
    await expect(page.locator('#squareFootage')).toHaveValue('5000');
    await expect(page.getByText(/4,100|6,900/)).toHaveCount(0);

    const state = await page.evaluate((key) => ({
      handoff: window.localStorage.getItem(key),
      estimate: window.localStorage.getItem('estimaitor_estimate_data'),
    }), HANDOFF_KEY);
    expect(state).toEqual({ handoff: null, estimate: null });

    await page.reload();
    await page.getByRole('heading', { name: 'Estimate Calculator' }).waitFor();
    await expect(page.getByTestId('prospect-draft-banner')).toHaveCount(0);
    await expect(page.locator('#projectStreet')).toHaveValue('');
  });

  test('unreadable saved prospects are left untouched and editing is turned off', async ({ page }) => {
    await page.goto('/prospects');
    await page.evaluate((key) => window.localStorage.setItem(key, '{broken'), PROSPECTS_KEY);
    await openProspects(page);
    await expect(page.getByRole('alert').filter({ hasText: 'could not be read' })).toContainText('adding or editing prospects is turned off');
    await expect(page.getByRole('button', { name: 'Add Prospect' })).toBeDisabled();
    expect(await page.evaluate((key) => window.localStorage.getItem(key), PROSPECTS_KEY)).toBe('{broken');
  });

  test('mobile: add a prospect, then use its full-screen detail', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openProspects(page);
    await page.getByRole('button', { name: 'Add Prospect' }).click();
    await fillRequired(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await page.getByRole('button', { name: 'Save prospect' }).click();
    await expect(detail(page).getByRole('heading', { level: 2 })).toHaveText('455 Market Street');
    await expect(page.getByRole('heading', { level: 1, name: 'Prospects' })).toHaveCount(0);
    await expect(detail(page).getByRole('button', { name: 'Create Draft Estimate' })).toBeVisible();
    await detail(page).getByRole('button', { name: 'Back' }).click();
    await expect(page.getByRole('heading', { name: 'Your prospects · 1' })).toBeVisible();
  });

  for (const scheme of ['light', 'dark'] as const) {
    test(`form errors and real-prospect detail have no axe violations (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await seed(page, [makeRecord({ priceLow: '900', priceHigh: '1400', referenceUrls: 'https://example.com/photo-1' })], '?id=mp-seed-1');
      const check = async () => {
        const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
        expect(result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
      };
      await check();
      await page.getByRole('button', { name: 'Back to results' }).click();
      await page.getByRole('button', { name: 'Add Prospect' }).click();
      await page.getByRole('button', { name: 'Save prospect' }).click();
      await expect(page.getByTestId('form-error-summary')).toBeVisible();
      await check();
    });
  }
});
