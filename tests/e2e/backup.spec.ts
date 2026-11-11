import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { openEstimator } from '../helpers/quote';

const LOGO = 'data:image/png;base64,iVBORw0KGgo=';

async function openPreferences(page: import('@playwright/test').Page) {
  await openEstimator(page);
  await page.getByRole('button', { name: 'Open settings' }).click();
  await page.getByRole('button', { name: 'Preferences' }).click();
}

test('downloaded backup restores company data after a reload', async ({ page }) => {
  await openPreferences(page);
  await page.evaluate((logo) => {
    localStorage.setItem('estimaitor_company_settings', JSON.stringify({ name: 'North Glass Clean' }));
    localStorage.setItem('estimaitor_company_logo', logo);
    localStorage.setItem('quoteCounter', '480');
    localStorage.setItem(
      'estimaitor_pi_prospects_v1',
      JSON.stringify({
        version: 1,
        prospects: [
          {
            kind: 'manual',
            dataOrigin: 'manual',
            id: 'mp-1',
            name: 'Oak Lane',
            propertyType: 'residential',
            address: { line1: '18 Oak Ln', city: 'High Point', state: 'NC', zip: '27265' },
            source: { type: 'site_visit' },
            researchedAt: '2026-11-08',
            status: 'new',
            referenceUrls: [],
            createdAt: '2026-11-08T12:00:00.000Z',
            updatedAt: '2026-11-08T12:00:00.000Z',
          },
        ],
      })
    );
    localStorage.setItem(
      'estimaitor_past_entries',
      JSON.stringify([{ id: '1', clientName: 'Dana Oak' }])
    );
  }, LOGO);

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download Backup' }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^estimaitor-backup-\d{4}-\d{2}-\d{2}\.json$/);
  await expect(page.getByText('Backup downloaded.')).toBeVisible();
  const backupText = readFileSync((await download.path())!, 'utf8');
  const backup = JSON.parse(backupText);
  expect(backup.storage.estimaitor_company_logo).toBe(LOGO);
  expect(backup.storage.quoteCounter).toBe('480');
  expect(backup.storage).not.toHaveProperty('estimaitor_pi_estimate_handoff_v1');

  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('estimaitor_company_settings', JSON.stringify({ name: 'Other Co' }));
    localStorage.setItem('quoteCounter', '5');
  });
  await page.getByLabel('Backup file').setInputFiles({
    name: 'estimaitor-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(backupText),
  });

  await expect(page.getByRole('region', { name: 'Confirm backup restore' })).toBeVisible();
  await expect(page.getByText('Company: North Glass Clean')).toBeVisible();
  await expect(page.getByText('Past estimates: 1')).toBeVisible();
  await expect(page.getByText('Prospects: 1')).toBeVisible();
  await expect(page.getByText('Saved leads: Not included')).toBeVisible();
  await expect(page.getByText('Company logo: Included')).toBeVisible();
  await expect(page.getByText('Will be replaced')).toBeVisible();
  await expect(page.getByText('Left unchanged')).toBeVisible();

  await page.getByRole('button', { name: 'Confirm restore' }).click();
  await expect(page.getByRole('status')).toHaveText('Backup restored.');
  await expect(page.getByRole('heading', { name: 'EstimAItor' })).toBeVisible();
  const restored = await page.evaluate(() => ({
    settings: localStorage.getItem('estimaitor_company_settings'),
    logo: localStorage.getItem('estimaitor_company_logo'),
    counter: localStorage.getItem('quoteCounter'),
    prospects: localStorage.getItem('estimaitor_pi_prospects_v1'),
  }));
  expect(restored.settings).toContain('North Glass Clean');
  expect(restored.logo).toBe(LOGO);
  expect(restored.counter).toBe('480');
  expect(restored.prospects).toContain('Oak Lane');
});

test('cancelling a restore leaves existing data in place', async ({ page }) => {
  await openPreferences(page);
  await page.evaluate(() => localStorage.setItem('quoteCounter', '15'));
  await page.getByLabel('Backup file').setInputFiles({
    name: 'estimaitor-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(
      JSON.stringify({
        app: 'estimaitor',
        backupVersion: 1,
        createdAt: '2026-11-10T15:00:00.000Z',
        storage: { quoteCounter: '999' },
      })
    ),
  });
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('Restore cancelled. Nothing was changed.')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('quoteCounter'))).toBe('15');
});

test('an invalid backup file does not change storage', async ({ page }) => {
  await openPreferences(page);
  await page.evaluate(() => localStorage.setItem('quoteCounter', '15'));
  await page.getByLabel('Backup file').setInputFiles({
    name: 'broken.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{'),
  });
  await expect(page.getByText('This file is not valid JSON.')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('quoteCounter'))).toBe('15');

  await page.getByLabel('Backup file').setInputFiles({
    name: 'future.json',
    mimeType: 'application/json',
    buffer: Buffer.from(
      JSON.stringify({
        app: 'estimaitor',
        backupVersion: 2,
        createdAt: '2026-11-10T15:00:00.000Z',
        storage: { quoteCounter: '999' },
      })
    ),
  });
  await expect(page.getByText('newer version of EstimAItor')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('quoteCounter'))).toBe('15');
});
