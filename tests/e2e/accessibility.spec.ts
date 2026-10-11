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
  });
}

test('viewport allows pinch-zoom', async ({ page }) => {
  await page.goto('/');
  const content = await page.locator('meta[name="viewport"]').getAttribute('content');
  expect(content).not.toMatch(/maximum-scale\s*=\s*1(\.0)?\b|user-scalable\s*=\s*(no|0)/);
});
