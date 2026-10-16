import { test, expect, type Page, type TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openEstimator, switchMode } from '../helpers/quote';

async function scan(page: Page, testInfo: TestInfo, label: string) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  await testInfo.attach(`axe-${label}.json`, {
    body: JSON.stringify(results.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => n.target.join(' ')), help: v.help })), null, 2),
    contentType: 'application/json',
  });
  return results.violations.map((v) => `${v.impact}: ${v.id} (${v.nodes.length}) ${v.help}`);
}

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`axe (${colorScheme} mode)`, () => {
    test.use({ colorScheme });

    test('estimator page has no WCAG A/AA violations', async ({ page }, testInfo) => {
      await openEstimator(page);
      expect(await scan(page, testInfo, `${colorScheme}-estimator`)).toEqual([]);
    });

    test('pressure washing and janitorial modes have no WCAG A/AA violations', async ({ page }, testInfo) => {
      await openEstimator(page);
      await switchMode(page, 'Pressure Washing');
      await page.getByRole('button', { name: 'Calculate Pressure Washing Estimate' }).waitFor();
      expect(await scan(page, testInfo, `${colorScheme}-pressure`)).toEqual([]);
      await switchMode(page, 'Janitorial Contract');
      await page.getByRole('button', { name: 'Generate Janitorial Contract' }).waitFor();
      expect(await scan(page, testInfo, `${colorScheme}-janitorial`)).toEqual([]);
    });

    test('estimate result, quote preview, and contract summary have no WCAG A/AA violations', async ({ page }, testInfo) => {
      await openEstimator(page);
      await page.locator('#projectName').fill('Sample Office Fitout');
      await page.getByRole('button', { name: 'Calculate Estimate' }).click();
      await page.getByRole('button', { name: 'Generate Quote' }).waitFor();
      expect(await scan(page, testInfo, `${colorScheme}-result`)).toEqual([]);
      await page.getByRole('button', { name: 'Generate Quote' }).click();
      await page.getByRole('button', { name: 'Download Package' }).waitFor();
      expect(await scan(page, testInfo, `${colorScheme}-quote`)).toEqual([]);

      await page.goto('/');
      await switchMode(page, 'Janitorial Contract');
      await page.locator('#facilityName').fill('Sample Office Park');
      await page.locator('#contactName').fill('Pat Sample');
      await page.locator('#facilityAddress').fill('100 Example Way');
      await page.locator('#city').fill('Greensboro');
      await page.locator('#contactEmail').fill('pat.sample@example.com');
      await page.locator('#contactPhone').fill('(336) 555-0100');
      await page.getByRole('button', { name: 'Generate Janitorial Contract' }).click();
      await page.getByRole('heading', { name: 'Janitorial Contract Summary' }).waitFor();
      expect(await scan(page, testInfo, `${colorScheme}-contract`)).toEqual([]);
    });

    test('prospects list, detail with a saved lead, empty state and phone map have no WCAG A/AA violations', async ({ page }, testInfo) => {
      await page.goto('/prospects');
      await page.getByRole('list', { name: 'Prospect results' }).waitFor();
      expect(await scan(page, testInfo, `${colorScheme}-prospects-list`)).toEqual([]);

      await page.getByRole('list', { name: 'Prospect results' }).getByRole('button', { name: /Quillmark Medical Pavilion/ }).click();
      await page.getByRole('button', { name: 'Save as lead' }).click();
      await page.getByLabel('Follow-up date').fill('2020-01-01');
      await page.getByLabel('Add a note').fill('Left a voicemail.');
      await page.getByRole('button', { name: 'Add note' }).click();
      await page.getByRole('list', { name: 'Lead notes' }).waitFor();
      expect(await scan(page, testInfo, `${colorScheme}-prospects-detail`)).toEqual([]);

      await page.goto('/prospects?q=zzzz');
      await page.getByRole('heading', { name: 'No prospects match' }).waitFor();
      expect(await scan(page, testInfo, `${colorScheme}-prospects-empty`)).toEqual([]);

      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/prospects?view=map');
      await page.getByTestId('sample-map').waitFor();
      expect(await scan(page, testInfo, `${colorScheme}-prospects-phone-map`)).toEqual([]);
    });
  });
}

test('project address validation errors are linked to their fields for screen readers', async ({ page }, testInfo) => {
  await openEstimator(page);
  await page.locator('#projectStreet').fill('9'.repeat(121));
  await page.locator('#projectCity').fill('C'.repeat(61));
  await page.locator('#projectZip').fill('123');
  await page.getByRole('button', { name: 'Calculate Estimate' }).click();

  const expected = [
    ['projectStreet', 'Street is too long'],
    ['projectCity', 'City is too long'],
    ['projectZip', 'Use a 5-digit ZIP (or ZIP+4)'],
  ] as const;
  for (const [id, message] of expected) {
    const field = page.locator(`#${id}`);
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await expect(field).toHaveAttribute('aria-describedby', `${id}-error`);
    await expect(field).toHaveAccessibleDescription(message);
    await expect(page.locator(`#${id}-error`)).toHaveAttribute('role', 'alert');
  }
  expect(await scan(page, testInfo, 'address-errors')).toEqual([]);

  // Fixing a field removes its error and its description link.
  await page.locator('#projectStreet').fill('12 Main St');
  await page.locator('#projectCity').fill('High Point');
  await page.locator('#projectZip').fill('27265');
  await page.getByRole('button', { name: 'Calculate Estimate' }).click();
  for (const [id] of expected) {
    await expect(page.locator(`#${id}`)).toHaveAttribute('aria-invalid', 'false');
    await expect(page.locator(`#${id}`)).not.toHaveAttribute('aria-describedby', /.+/);
    await expect(page.locator(`#${id}-error`)).toHaveCount(0);
  }
});

test('viewport allows pinch-zoom', async ({ page }) => {
  await page.goto('/');
  const content = await page.locator('meta[name="viewport"]').getAttribute('content');
  expect(content).not.toMatch(/maximum-scale\s*=\s*1(\.0)?\b|user-scalable\s*=\s*(no|0)/);
});
