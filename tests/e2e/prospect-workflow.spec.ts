import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { addDays } from '../../src/lib/prospects/insights';
import { localIsoDate } from '../../src/lib/prospects/manualProspectForm';
import type { ManualProspect } from '../../src/lib/prospects/types';

const PROSPECTS_KEY = 'estimaitor_pi_prospects_v1';
const SETTINGS_KEY = 'estimaitor_pi_settings_v1';
const today = localIsoDate();

function record(overrides: Partial<ManualProspect> & { id: string }): ManualProspect {
  return {
    kind: 'manual',
    dataOrigin: 'manual',
    propertyType: 'commercial',
    address: { line1: `${overrides.id} Main St`, city: 'Greensboro', state: 'NC', zip: '27401' },
    source: { type: 'drive_by', note: 'Seen from the road' },
    researchedAt: '2026-09-01',
    status: 'new',
    referenceUrls: [],
    createdAt: '2026-09-01T12:00:00.000Z',
    updatedAt: '2026-09-01T12:00:00.000Z',
    ...overrides,
  };
}

const ELM = record({
  id: 'mp-elm',
  name: 'Elm Street Lofts',
  coordinates: { lat: 36.0726, lng: -79.792 },
  windowCount: 84,
  countConfidence: 'medium',
  status: 'ready_to_quote',
  followUpAt: addDays(today, -1),
  internalNotes: 'Manager prefers email.',
  createdAt: '2026-09-05T12:00:00.000Z',
});
const OAK = record({
  id: 'mp-oak',
  name: 'Oak Duplex',
  propertyType: 'residential',
  windowCount: 22,
  countConfidence: 'low',
  followUpAt: today,
  source: { type: 'site_visit', note: 'Walked the lot' },
  createdAt: new Date().toISOString(),
});
const PINE = record({
  id: 'mp-pine',
  name: 'Pine Plaza',
  windowCount: 300,
  countConfidence: 'high',
  status: 'researching',
  followUpAt: addDays(today, 1),
  researchedAt: '2026-10-10',
  createdAt: '2026-09-02T12:00:00.000Z',
});
const WON = record({ id: 'mp-won', name: 'Birch Office', status: 'won', followUpAt: addDays(today, -3), createdAt: '2026-09-01T12:00:00.000Z' });

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
  page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) || 'null'), PROSPECTS_KEY) as Promise<{ version: number; prospects: ManualProspect[] }>;
const storedById = async (page: Page, id: string) => (await stored(page)).prospects.find((p) => p.id === id)!;

const detail = (page: Page) => page.getByTestId('prospect-detail');
const yours = (page: Page) => page.getByRole('list', { name: 'Your prospects' }).locator('[data-prospect-id]');
const sampleCards = (page: Page) => page.getByRole('list', { name: 'Sample prospects' }).locator('[data-prospect-id]');
const yourIds = async (page: Page) => yours(page).evaluateAll((els) => els.map((e) => e.getAttribute('data-prospect-id')));
const openFilters = async (page: Page) => {
  const toggle = page.getByRole('button', { name: /^Filters/ });
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
};

/** No search text, notes, ids or addresses ever reach the address bar. */
async function expectCleanUrl(page: Page) {
  const params = Array.from(new URL(page.url()).searchParams.keys());
  expect(params.filter((k) => !['type', 'saved', 'view', 'data', 'status', 'source', 'confidence', 'map', 'sort', 'next'].includes(k))).toEqual([]);
  expect(page.url()).not.toMatch(/mp-|sp-|sc-|Elm|Oak|Main|email/i);
}

test.describe('Prospect map, filters and daily priorities (/prospects)', () => {
  test('real prospects with coordinates are square markers that sync with their cards; samples stay round', async ({ page }) => {
    await seed(page, [ELM, OAK]);
    const elmMarker = page.locator('[data-marker-id="mp-elm"]');
    await expect(elmMarker).toHaveAttribute('data-origin', 'manual');
    await expect(elmMarker).toHaveClass(/rounded-md/);
    await expect(page.locator('[data-marker-id="mp-oak"]')).toHaveCount(0);
    await expect(page.locator('[data-marker-id][data-origin="sample"]').first()).toHaveClass(/rounded-full/);

    await yours(page).filter({ hasText: 'Elm Street Lofts' }).hover();
    await expect(elmMarker).toHaveAttribute('data-highlighted', 'true');
    await elmMarker.click();
    await expect(detail(page).getByRole('heading', { level: 2 })).toHaveText('Elm Street Lofts');
    await expect(elmMarker).toHaveAttribute('aria-pressed', 'true');
    await expectCleanUrl(page);

    await page.goBack();
    await expect(detail(page)).toHaveCount(0);
    await yours(page).filter({ hasText: 'Elm Street Lofts' }).click();
    await expect(elmMarker).toHaveAttribute('aria-pressed', 'true');
  });

  test('the unmapped note counts only matching real prospects, and Add coordinates puts one on the map', async ({ page }) => {
    await seed(page, [ELM, OAK, PINE]);
    const note = page.getByTestId('unmapped-note');
    await expect(note).toHaveText(/2 of your prospects in these results aren't on the map/);
    await page.getByRole('group', { name: 'Prospect type' }).getByRole('button', { name: /^Residential/ }).click();
    await expect(note).toHaveText(/1 of your prospects in these results isn't on the map/);
    await page.getByRole('group', { name: 'Prospect type' }).getByRole('button', { name: /^All/ }).click();

    await note.getByRole('button', { name: 'Show unmapped' }).click();
    await expect(page).toHaveURL(/[?&]map=unmapped/);
    expect((await yourIds(page)).sort()).toEqual(['mp-oak', 'mp-pine']);
    await expect(sampleCards(page)).toHaveCount(0);
    await expect(yours(page).first()).toContainText('Not on map');

    await yours(page).filter({ hasText: 'Oak Duplex' }).click();
    await detail(page).getByRole('button', { name: 'Add coordinates' }).click();
    await expect(page.getByRole('heading', { name: 'Edit prospect' })).toBeVisible();
    await expect(page.getByRole('button', { name: /^More details/ })).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#pf-lat')).toBeFocused();
    await page.locator('#pf-lat').fill('35.9557');
    await page.locator('#pf-lng').fill('-80.0053');
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect(detail(page)).toContainText('Map position: coordinates you entered');
    await expect(detail(page).getByRole('button', { name: 'Add coordinates' })).toHaveCount(0);
    expect((await storedById(page, 'mp-oak')).coordinates).toEqual({ lat: 35.9557, lng: -80.0053 });
    await page.getByRole('button', { name: 'Back to results' }).click();
    await page.getByRole('button', { name: 'Remove filter: Not on map' }).click();
    await expect(page.locator('[data-marker-id="mp-oak"]')).toHaveAttribute('data-origin', 'manual');
    await expect(note).toHaveText(/1 of your prospects/);
  });

  test('filters combine for list and map, live in the URL without prospect content, and clear in one step', async ({ page }) => {
    await seed(page, [ELM, OAK, PINE]);
    await openFilters(page);
    await expect(page.locator('#prospect-filter-panel')).toContainText('Status, source and confidence filters show your prospects only.');

    await page.locator('#filter-status').selectOption('ready_to_quote');
    expect(await yourIds(page)).toEqual(['mp-elm']);
    await expect(sampleCards(page)).toHaveCount(0);
    await expect(page.locator('[data-marker-id]')).toHaveCount(1);
    await expect(page).toHaveURL(/[?&]status=ready_to_quote/);

    await page.locator('#filter-status').selectOption('');
    await page.locator('#filter-confidence').selectOption('high');
    await page.locator('#filter-map').selectOption('unmapped');
    expect(await yourIds(page)).toEqual(['mp-pine']);
    await page.getByLabel('Search prospects').fill('email');
    await expect(page.getByTestId('empty-state')).toContainText('Search: “email”');
    await expect(page.getByTestId('empty-state')).toContainText('Count: High confidence');
    await expect(page.getByTestId('empty-state')).toContainText('Not on map');
    await expect(page.getByTestId('empty-state')).toContainText('show your prospects only, never sample data');
    await page.waitForFunction(() => window.history.state?.pi?.query === 'email');
    await expectCleanUrl(page);

    await page.reload();
    await expect(page.getByTestId('empty-state')).toBeVisible();
    await page.getByTestId('empty-state').getByRole('button', { name: 'Clear all filters' }).click();
    await expect(page.getByLabel('Search prospects')).toHaveValue('');
    await expect(yours(page)).toHaveCount(3);
    await expect(sampleCards(page)).toHaveCount(25);
    await expect(page).toHaveURL(/\/prospects$/);

    await openFilters(page);
    await page.locator('#filter-source').selectOption('site_visit');
    expect(await yourIds(page)).toEqual(['mp-oak']);
    await page.locator('#filter-source').selectOption('');
    await page.locator('#filter-data').selectOption('sample');
    await expect(yours(page)).toHaveCount(0);
    await expect(sampleCards(page)).toHaveCount(25);
    await page.locator('#filter-data').selectOption('mine');
    await expect(yours(page)).toHaveCount(3);
    await expect(sampleCards(page)).toHaveCount(0);
    await expect(page.locator('[data-marker-id][data-origin="sample"]')).toHaveCount(0);
  });

  test('sorting reorders only your prospects and survives a reload', async ({ page }) => {
    await seed(page, [ELM, OAK, PINE]);
    expect(await yourIds(page)).toEqual(['mp-oak', 'mp-elm', 'mp-pine']);
    const sampleOrder = await sampleCards(page).evaluateAll((els) => els.map((e) => e.getAttribute('data-prospect-id')));

    await page.locator('#prospect-sort').selectOption('windows');
    expect(await yourIds(page)).toEqual(['mp-pine', 'mp-elm', 'mp-oak']);
    await page.locator('#prospect-sort').selectOption('followup');
    expect(await yourIds(page)).toEqual(['mp-elm', 'mp-oak', 'mp-pine']);
    await page.locator('#prospect-sort').selectOption('researched');
    expect((await yourIds(page))[0]).toBe('mp-pine');
    await expect(page).toHaveURL(/[?&]sort=researched/);
    await page.reload();
    await expect(page.locator('#prospect-sort')).toHaveValue('researched');
    expect(await sampleCards(page).evaluateAll((els) => els.map((e) => e.getAttribute('data-prospect-id')))).toEqual(sampleOrder);
  });

  test('next actions and pipeline counts filter your prospects; won and lost are left out of next actions', async ({ page }) => {
    await seed(page, [ELM, OAK, PINE, WON]);
    const summary = page.getByTestId('pipeline-summary');
    const chip = (id: string) => summary.locator(`[data-next-action="${id}"]`);
    await expect(chip('followup_due')).toContainText('2');
    await expect(chip('ready')).toContainText('1');
    await expect(chip('unmapped')).toContainText('2');
    await expect(chip('new')).toContainText('1');
    await expect(chip('low_conf')).toContainText('1');
    await expect(summary.locator('[data-status="won"]')).toContainText('1');
    await expect(summary.locator('[data-status="new"]')).toContainText('1');

    await chip('followup_due').click();
    await expect(chip('followup_due')).toHaveAttribute('aria-pressed', 'true');
    expect((await yourIds(page)).sort()).toEqual(['mp-elm', 'mp-oak']);
    await expect(sampleCards(page)).toHaveCount(0);
    await expect(page).toHaveURL(/[?&]next=followup_due/);
    await chip('followup_due').click();
    await expect(page).not.toHaveURL(/next=/);

    await summary.locator('[data-status="won"]').click();
    expect(await yourIds(page)).toEqual(['mp-won']);
    await expect(page.getByRole('button', { name: 'Remove filter: Status: Won' })).toBeVisible();
  });

  test('quick status saves at once, survives reload, and Undo restores the previous status and timestamp for at least 8 seconds', async ({ page }) => {
    test.setTimeout(60_000);
    await seed(page, [PINE, { ...OAK, futureField: 'keep' } as ManualProspect]);
    await yours(page).filter({ hasText: 'Pine Plaza' }).click();
    const select = detail(page).locator('#quick-status');
    await expect(select).toHaveValue('researching');

    await select.selectOption('quoted');
    const message = page.getByTestId('status-message');
    await expect(message).toContainText('Status changed to Quoted.');
    const changed = await storedById(page, 'mp-pine');
    expect(changed.status).toBe('quoted');
    expect(changed.updatedAt > PINE.updatedAt).toBe(true);
    expect({ ...changed, status: PINE.status, updatedAt: PINE.updatedAt }).toEqual(PINE);
    expect(await storedById(page, 'mp-oak')).toEqual({ ...OAK, futureField: 'keep' });

    await page.waitForTimeout(8_500);
    await message.getByRole('button', { name: 'Undo' }).click();
    await expect(message).toContainText('Status restored to Researching.');
    expect(await storedById(page, 'mp-pine')).toEqual(PINE);

    await select.selectOption('follow_up');
    await page.reload();
    await expect(detail(page).locator('#quick-status')).toHaveValue('follow_up');
    await expect(page.getByTestId('status-message').getByRole('button', { name: 'Undo' })).toHaveCount(0);
  });

  test('Undo never overwrites a later change made elsewhere', async ({ page }) => {
    await seed(page, [PINE]);
    await yours(page).first().click();
    await detail(page).locator('#quick-status').selectOption('quoted');
    await expect(page.getByTestId('status-message')).toContainText('Status changed to Quoted.');

    // Another tab edits the same record after the status change.
    const later = await page.evaluate((key) => {
      const data = JSON.parse(window.localStorage.getItem(key)!);
      data.prospects[0].internalNotes = 'Edited in another tab';
      data.prospects[0].updatedAt = new Date(Date.now() + 1000).toISOString();
      window.localStorage.setItem(key, JSON.stringify(data));
      return data.prospects[0];
    }, PROSPECTS_KEY);

    await page.getByTestId('status-message').getByRole('button', { name: 'Undo' }).click();
    await expect(page.getByTestId('status-message')).toContainText('Not undone: this prospect was changed after that update.');
    expect(await storedById(page, 'mp-pine')).toEqual(later);
  });

  test('older links with a search or record id still open, then drop that content from the address bar', async ({ page }) => {
    await seed(page, [ELM], '?q=lofts&id=mp-elm&type=commercial');
    await expect(detail(page).getByRole('heading', { level: 2 })).toHaveText('Elm Street Lofts');
    await expect(page).toHaveURL(/\/prospects\?type=commercial$/);
    await page.getByRole('button', { name: 'Back to results' }).click();
    await expect(page.getByLabel('Search prospects')).toHaveValue('lofts');
    expect(await yourIds(page)).toEqual(['mp-elm']);
  });

  test('with sample data hidden, the sample scope is disabled and only your prospects show', async ({ page }) => {
    await page.goto('/prospects');
    await page.evaluate(([key]) => window.localStorage.setItem(key, JSON.stringify({ version: 1, showSampleData: false })), [SETTINGS_KEY]);
    await seed(page, [ELM, OAK]);
    await openFilters(page);
    await expect(page.locator('#filter-data option[value="sample"]')).toBeDisabled();
    await expect(page.locator('[data-marker-id][data-origin="sample"]')).toHaveCount(0);
    await expect(yours(page)).toHaveCount(2);
  });

  test('mobile: priorities scroll sideways without page overflow, and the map note switches to the list', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await seed(page, [ELM, OAK, PINE]);
    await expect(page.getByTestId('pipeline-summary')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    await page.getByRole('group', { name: 'Show results as' }).getByRole('button', { name: 'Map' }).click();
    await page.getByTestId('unmapped-note').getByRole('button', { name: 'Show unmapped' }).click();
    await expect(page).toHaveURL(/map=unmapped/);
    await expect(page).not.toHaveURL(/view=map/);
    expect((await yourIds(page)).sort()).toEqual(['mp-oak', 'mp-pine']);
  });

  for (const scheme of ['light', 'dark'] as const) {
    test(`filters, priorities and quick status have no axe violations (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await seed(page, [ELM, OAK, PINE]);
      await openFilters(page);
      await page.locator('#filter-status').selectOption('ready_to_quote');
      const check = async () => {
        const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
        expect(result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
      };
      await check();
      await yours(page).first().click();
      await detail(page).locator('#quick-status').selectOption('quoted');
      await expect(page.getByTestId('status-message')).toContainText('Undo');
      await check();
    });
  }
});
