import { test, expect, type Page } from '@playwright/test';
import { downloadPackage, expectValidPdf, readZipDownload } from '../helpers/quote';
import type { ManualProspect } from '../../src/lib/prospects/types';

const PROSPECTS_KEY = 'estimaitor_pi_prospects_v1';

function record(overrides: Partial<ManualProspect> & { id: string }): ManualProspect {
  return {
    kind: 'manual',
    dataOrigin: 'manual',
    propertyType: 'commercial',
    address: { line1: '120 N Elm St', city: 'Greensboro', state: 'NC', zip: '27401' },
    source: { type: 'drive_by', note: 'Counted street-facing windows' },
    researchedAt: '2026-10-01',
    status: 'ready_to_quote',
    referenceUrls: [],
    createdAt: '2026-10-01T12:00:00.000Z',
    updatedAt: '2026-10-01T12:00:00.000Z',
    ...overrides,
  };
}

const INCOMPLETE = record({
  id: 'mp-incomplete',
  name: 'Elm Street Lofts',
  windowCount: 84,
  countConfidence: 'medium',
  internalNotes: 'Manager prefers email.',
  accessNotes: 'Needs a 40 ft lift',
});

const COMPLETE = record({
  id: 'mp-complete',
  name: 'Oak Lane Residence',
  propertyType: 'residential',
  address: { line1: '18 Oak Ln', city: 'High Point', state: 'NC', zip: '27265' },
  windowCount: 20,
  countConfidence: 'verified',
  windowServiceSides: 'interior_exterior',
  standardWindows: 18,
  largeWindows: 2,
  highAccessWindows: 0,
  distanceFromOffice: 15,
  contactName: 'Dana Oak',
  contactPhone: '336-555-0100',
  accessNotes: 'Gate code 4411',
  internalNotes: 'Prefer morning start.',
});

const EXTERIOR = record({
  id: 'mp-exterior',
  name: 'Main Street Storefront',
  windowServiceSides: 'exterior',
  standardWindows: 12,
  largeWindows: 8,
  highAccessWindows: 0,
  distanceFromOffice: 12,
});

const INTERIOR = record({
  id: 'mp-interior',
  name: 'Lobby Glass',
  windowServiceSides: 'interior',
  standardWindows: 10,
  largeWindows: 3,
  highAccessWindows: 2,
  distanceFromOffice: 8,
});

const detail = (page: Page) => page.getByTestId('prospect-detail');

async function openProspect(page: Page, records: ManualProspect[], id: string) {
  await page.goto(`/prospects?id=${id}`);
  await expect(page.getByTestId('prospects-loading')).toHaveCount(0);
  const opened = records.find((record) => record.id === id);
  await expect(detail(page).getByRole('heading', { level: 2 })).toContainText(
    opened?.name || opened?.address.line1 || ''
  );
}

async function seed(page: Page, records: ManualProspect[], id: string, clearEstimator = true) {
  await page.goto('/prospects');
  await page.evaluate(
    ([key, value, shouldClear]) => {
      window.localStorage.setItem(key, value);
      if (shouldClear) {
        window.localStorage.removeItem('estimaitor_form_data');
        window.localStorage.removeItem('estimaitor_estimate_data');
        window.localStorage.removeItem('estimaitor_saved_form_data');
      }
    },
    [PROSPECTS_KEY, JSON.stringify({ version: 1, prospects: records }), clearEstimator] as const
  );
  await page.reload();
  await openProspect(page, records, id);
}
const flat = (text: string) => text.replace(/\s+/g, ' ').replace(/ :/g, ':');

test.describe('Prospect Make Quote draft', () => {
  test('a complete prospect opens a populated Window Cleaning draft without asking again', async ({ page }) => {
    await seed(page, [COMPLETE], 'mp-complete');
    const before = await page.evaluate((key) => window.localStorage.getItem(key), PROSPECTS_KEY);
    await detail(page).getByRole('button', { name: 'Make Quote' }).click();

    await expect(page).toHaveURL(/\/$/);
    const banner = page.getByTestId('prospect-draft-banner');
    await expect(banner).toContainText('Draft proposal from prospect: Oak Lane Residence');
    await expect(banner).toContainText('not a signed, approved, or final contract');
    await expect(page.getByTestId('draft-missing-inputs')).toHaveCount(0);
    await expect(page.getByTestId('window-count-reference')).toHaveCount(0);

    await expect(page.locator('#cleaningType')).toHaveValue('window_cleaning_only');
    await expect(page.getByRole('radio', { name: 'Residential' })).toBeChecked();
    await expect(page.getByRole('radio', { name: 'Interior + Exterior' })).toBeChecked();
    await expect(page.locator('#numberOfWindows')).toHaveValue('18');
    await expect(page.locator('#numberOfLargeWindows')).toHaveValue('2');
    await expect(page.locator('#numberOfHighAccessWindows')).toHaveValue('0');
    await expect(page.locator('#distanceFromOffice')).toHaveValue('15');
    await expect(page.locator('#projectName')).toHaveValue('Oak Lane Residence');
    await expect(page.locator('#projectStreet')).toHaveValue('18 Oak Ln');

    await expect(page.getByRole('heading', { name: 'Draft proposal', exact: true })).toBeVisible();
    await expect(page.getByTestId('draft-proposal-note')).toBeVisible();
    await expect(page.getByTestId('proposal-total').first()).toHaveText('$872.61');
    await expect(page.getByText('Needs Pricing Approval')).toHaveCount(0);

    await page.getByRole('button', { name: 'Generate Quote' }).click();
    const download = await downloadPackage(page, 'Download Package');
    const entries = await readZipDownload(download);
    entries.forEach(expectValidPdf);
    const quote = flat(entries.find((e) => e.name === 'quote.pdf')!.text);
    const invoice = flat(entries.find((e) => e.name.endsWith('Invoice.pdf'))!.text);
    const workOrder = flat(entries.find((e) => e.name.endsWith('Work Order.pdf'))!.text);
    for (const text of [quote, invoice, workOrder]) {
      expect(text).toContain('18 standard and 2 large (20 total)');
      expect(text).toContain('Interior + Exterior');
    }
    for (const text of [quote, invoice]) {
      expect(text).toContain('$815.52');
      expect(text).toContain('$872.61');
    }
    expect(quote).toContain('Clean both the interior and exterior side of each window.');
    expect(quote).toContain('Window screens and window tracks.');

    await page.goto('/prospects?id=mp-complete');
    const after = await page.evaluate((key) => window.localStorage.getItem(key), PROSPECTS_KEY);
    expect(after).toBe(before);
    await expect(detail(page)).toContainText('Oak Lane Residence');
    await expect(detail(page)).toContainText('Prefer morning start.');
  });

  test('a prospect missing estimate fields asks only for those fields and invents nothing', async ({ page }) => {
    await seed(page, [INCOMPLETE], 'mp-incomplete');
    await detail(page).getByRole('button', { name: 'Make Quote' }).click();

    await expect(page.locator('#cleaningType')).toHaveValue('window_cleaning_only');
    await expect(page.getByRole('radio', { name: 'Commercial / Storefront' })).toBeChecked();
    await expect(page.getByRole('radio', { name: 'Exterior Only' })).not.toBeChecked();
    await expect(page.getByRole('radio', { name: 'Interior Only' })).not.toBeChecked();
    await expect(page.getByRole('radio', { name: 'Interior + Exterior' })).not.toBeChecked();
    await expect(page.locator('#numberOfWindows')).toHaveValue('');
    await expect(page.locator('#numberOfLargeWindows')).toHaveValue('');
    await expect(page.locator('#numberOfHighAccessWindows')).toHaveValue('');
    await expect(page.locator('#distanceFromOffice')).toHaveValue('');
    await expect(page.getByTestId('window-count-reference')).toContainText('84');
    await expect(page.getByTestId('draft-missing-inputs')).toContainText('Service sides');
    await expect(page.getByTestId('draft-missing-inputs')).toContainText('Window-count split');
    await expect(page.getByTestId('draft-missing-inputs')).toContainText('Distance from the office');
    await expect(page.getByTestId('draft-missing-inputs')).not.toContainText('Customer type');
    await expect(page.getByTestId('proposal-total')).toHaveCount(0);
    await expect(page.getByText('Needs Pricing Approval')).toHaveCount(0);
  });

  test('Make Quote after another draft does not keep the previous prospect values', async ({ page }) => {
    const records = [COMPLETE, INCOMPLETE, EXTERIOR];
    await seed(page, records, 'mp-complete');
    await detail(page).getByRole('button', { name: 'Make Quote' }).click();
    await expect(page.getByRole('radio', { name: 'Residential' })).toBeChecked();
    await expect(page.locator('#numberOfWindows')).toHaveValue('18');
    await expect(page.locator('#distanceFromOffice')).toHaveValue('15');
    await expect(page.getByTestId('proposal-total').first()).toHaveText('$872.61');

    await openProspect(page, records, 'mp-incomplete');
    await detail(page).getByRole('button', { name: 'Make Quote' }).click();

    await expect(page.getByTestId('prospect-draft-banner')).toContainText('Elm Street Lofts');
    await expect(page.getByRole('radio', { name: 'Commercial / Storefront' })).toBeChecked();
    await expect(page.getByRole('radio', { name: 'Residential' })).not.toBeChecked();
    await expect(page.getByRole('radio', { name: 'Exterior Only' })).not.toBeChecked();
    await expect(page.getByRole('radio', { name: 'Interior Only' })).not.toBeChecked();
    await expect(page.getByRole('radio', { name: 'Interior + Exterior' })).not.toBeChecked();
    await expect(page.locator('#numberOfWindows')).toHaveValue('');
    await expect(page.locator('#numberOfLargeWindows')).toHaveValue('');
    await expect(page.locator('#numberOfHighAccessWindows')).toHaveValue('');
    await expect(page.locator('#distanceFromOffice')).toHaveValue('');
    await expect(page.locator('#projectName')).toHaveValue('Elm Street Lofts');
    await expect(page.locator('#projectStreet')).toHaveValue('120 N Elm St');
    await expect(page.getByTestId('window-count-reference')).toContainText('84');
    await expect(page.getByTestId('draft-missing-inputs')).toContainText('Service sides');
    await expect(page.getByTestId('draft-missing-inputs')).toContainText('Window-count split');
    await expect(page.getByTestId('draft-missing-inputs')).toContainText('Distance from the office');
    await expect(page.getByTestId('proposal-total')).toHaveCount(0);
    await expect(page.locator('#projectName')).not.toHaveValue('Oak Lane Residence');
    await expect(page.getByTestId('prospect-draft-banner')).not.toContainText('Oak Lane');

    await openProspect(page, records, 'mp-exterior');
    await detail(page).getByRole('button', { name: 'Make Quote' }).click();
    await expect(page.getByTestId('prospect-draft-banner')).toContainText('Main Street Storefront');
    await expect(page.getByRole('radio', { name: 'Commercial / Storefront' })).toBeChecked();
    await expect(page.getByRole('radio', { name: 'Exterior Only', exact: true })).toBeChecked();
    await expect(page.locator('#numberOfWindows')).toHaveValue('12');
    await expect(page.locator('#numberOfLargeWindows')).toHaveValue('8');
    await expect(page.locator('#numberOfHighAccessWindows')).toHaveValue('0');
    await expect(page.locator('#distanceFromOffice')).toHaveValue('12');
    await expect(page.getByTestId('proposal-total').first()).toHaveText('$955.81');
    await expect(page.getByText('Needs Pricing Approval')).toHaveCount(0);
  });

  test('estimator persistence still works when the visit is not a prospect handoff', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.removeItem('estimaitor_pi_estimate_handoff_v1');
      window.localStorage.removeItem('estimaitor_form_data');
    });
    await page.reload();
    await page.getByRole('heading', { name: 'Estimate Calculator' }).waitFor();
    await page.locator('#cleaningType').selectOption('final');
    await page.locator('#distanceFromOffice').fill('7');
    await page.reload();
    await page.getByRole('heading', { name: 'Estimate Calculator' }).waitFor();
    await expect(page.locator('#cleaningType')).toHaveValue('final');
    await expect(page.locator('#distanceFromOffice')).toHaveValue('7');
    await expect(page.getByTestId('prospect-draft-banner')).toHaveCount(0);
  });

  test('all three side selections issue a draft without a pricing-approval step', async ({ page }) => {
    for (const [prospect, sides, standard, total] of [
      [EXTERIOR, 'Exterior Only', '12', '$955.81'],
      [INTERIOR, 'Interior Only', '10', '$826.38'],
      [COMPLETE, 'Interior + Exterior', '18', '$872.61'],
    ] as const) {
      await seed(page, [prospect], prospect.id);
      await detail(page).getByRole('button', { name: 'Make Quote' }).click();
      await expect(page.locator('#numberOfWindows')).toHaveValue(standard);
      await expect(page.getByRole('radio', { name: sides, exact: true })).toBeChecked();
      await expect(page.getByTestId('proposal-total').first()).toHaveText(total);
      await expect(page.getByText('Needs Pricing Approval')).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Generate Quote' })).toBeVisible();
    }
  });
});
