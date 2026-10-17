import { test, expect, type Page } from '@playwright/test';

const LEADS_KEY = 'estimaitor_pi_leads_v1';

async function openProspects(page: Page, search = '') {
  await page.goto(`/prospects${search}`);
  await page.getByRole('heading', { level: 1, name: 'Prospects' }).waitFor();
  await expect(page.getByTestId('prospects-loading')).toHaveCount(0);
}

const results = (page: Page) => page.getByRole('list', { name: 'Prospect results' }).getByRole('listitem');
const card = (page: Page, name: string | RegExp) => page.getByRole('list', { name: 'Prospect results' }).getByRole('button', { name });
const marker = (page: Page, id: string) => page.locator(`[data-marker-id="${id}"]`);
const detail = (page: Page) => page.getByTestId('prospect-detail');
const tab = (page: Page, name: string) => page.getByRole('group', { name: 'Prospect type' }).getByRole('button', { name: new RegExp(`^${name}`) });

test.describe('Prospects page (/prospects)', () => {
  test('shows 25 labeled sample prospects on a list and a sample map, with nav to and from the estimator', async ({ page }) => {
    await openProspects(page);
    await expect(results(page)).toHaveCount(25);
    await expect(page.getByTestId('result-count')).toHaveText('25 prospects');
    await expect(page.getByText('Sample data', { exact: true })).toHaveCount(25);
    await expect(page.getByText('Demo with fictional sample data')).toBeVisible();
    await expect(page.locator('[data-marker-id]')).toHaveCount(25);
    await expect(page.getByText('Schematic map · not to scale')).toBeVisible();

    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(nav.getByRole('link', { name: 'Prospects' })).toHaveAttribute('aria-current', 'page');
    await nav.getByRole('link', { name: 'Estimator' }).click();
    await page.getByRole('heading', { name: 'Estimate Calculator' }).waitFor();
    await expect(nav.getByRole('link', { name: 'Estimator' })).toHaveAttribute('aria-current', 'page');
    await nav.getByRole('link', { name: 'Prospects' }).click();
    await expect(page).toHaveURL(/\/prospects$/);
  });

  test('search, type tabs and counts combine, live in the URL, and survive a reload', async ({ page }) => {
    await openProspects(page);
    await tab(page, 'Construction').click();
    await expect(tab(page, 'Construction')).toHaveAttribute('aria-pressed', 'true');
    await expect(results(page)).toHaveCount(9);
    await page.getByLabel('Search prospects').fill('greensboro');
    await expect(results(page)).toHaveCount(3);
    await expect(page.getByTestId('result-count')).toHaveText('3 prospects');
    await expect(tab(page, 'All')).toContainText(/\d+/);
    await expect(page.locator('[data-marker-id]')).toHaveCount(3);
    await expect(page).toHaveURL(/[?&]type=construction/);
    await expect(page).toHaveURL(/[?&]q=greensboro/);

    await page.reload();
    await expect(page.getByTestId('prospects-loading')).toHaveCount(0);
    await expect(page.getByLabel('Search prospects')).toHaveValue('greensboro');
    await expect(results(page)).toHaveCount(3);

    await page.getByLabel('Search prospects').fill('no such place zzz');
    await expect(page.getByRole('heading', { name: 'No prospects match' })).toBeVisible();
    await expect(page.getByTestId('result-count')).toHaveText('0 prospects');
    await page.getByRole('button', { name: 'Clear filters' }).click();
    await expect(results(page)).toHaveCount(25);
    await expect(page).toHaveURL(/\/prospects$/);
  });

  test('cards and markers highlight each other, and either one opens the detail', async ({ page }) => {
    await openProspects(page);
    await card(page, /Quillmark Medical Pavilion/).hover();
    await expect(marker(page, 'sp-quillmark-medical')).toHaveAttribute('data-highlighted', 'true');

    await marker(page, 'sp-tinmoor-hotel').hover();
    await expect(card(page, /Tinmoor Suites Hotel/)).toHaveAttribute('data-highlighted', 'true');
    await marker(page, 'sp-tinmoor-hotel').click();
    await expect(detail(page).getByRole('heading', { level: 2 })).toHaveText('Tinmoor Suites Hotel');
    await expect(marker(page, 'sp-tinmoor-hotel')).toHaveAttribute('aria-pressed', 'true');
    await expect(page).toHaveURL(/[?&]id=sp-tinmoor-hotel/);

    // Choosing another marker swaps the detail; Back then returns to the list in one step.
    await marker(page, 'sp-wrenfield-coffee').click();
    await expect(detail(page).getByRole('heading', { level: 2 })).toHaveText('Wrenfield Roastery & Café');
    await page.goBack();
    await expect(detail(page)).toHaveCount(0);
    await expect(results(page)).toHaveCount(25);
  });

  test('keyboard: Enter opens a card, focus moves to the detail, Escape returns to the same card', async ({ page }) => {
    await openProspects(page);
    await card(page, /Copperline Village Shops/).focus();
    await page.keyboard.press('Enter');
    const heading = detail(page).getByRole('heading', { level: 2 });
    await expect(heading).toHaveText('Copperline Village Shops');
    await expect(heading).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(detail(page)).toHaveCount(0);
    await expect(card(page, /Copperline Village Shops/)).toBeFocused();
  });

  test('details show Verified / Reported / Estimated with sources, and estimates state their assumption', async ({ page }) => {
    await openProspects(page, '?id=sp-quillmark-medical');
    const d = detail(page);
    await expect(d.getByRole('heading', { level: 2 })).toHaveText('Quillmark Medical Pavilion');
    await expect(d.getByText('Fictional sample record for the demo')).toBeVisible();
    const sqft = d.locator('[data-fact="Square footage"]');
    await expect(sqft).toContainText('42,000 sq ft');
    await expect(sqft).toContainText('Verified');
    await expect(sqft).toContainText('Fictional site walk notes');
    await expect(sqft).toContainText('Verified Sep 15, 2026');
    await expect(d.locator('[data-fact="Large windows"]')).toContainText('Reported');
    const highAccess = d.locator('[data-fact="High-access windows"]');
    await expect(highAccess).toContainText('Estimated');
    await expect(highAccess).toContainText('Assumption: Third-floor atrium glass');
    await expect(d.getByText('Last verified Sep 15, 2026')).toBeVisible();

    // A shared link closes in place rather than leaving the page.
    await d.getByRole('button', { name: 'Back to results' }).click();
    await expect(page).toHaveURL(/\/prospects$/);
    await expect(results(page)).toHaveCount(25);

    await openProspects(page, '?type=construction&id=sc-goldfinch-restaurant');
    const c = detail(page);
    await expect(c.locator('[data-fact="Estimated completion"]')).toContainText('Assumption: Opening date mentioned');
    const milestones = c.getByRole('region', { name: 'Milestones' });
    await expect(milestones).toContainText('Health inspection');
    await expect(milestones).toContainText('Assumption: Usually 2 weeks before opening');
  });

  test('a lead keeps its status, follow-up date and notes after reload, and the saved filter finds it', async ({ page }) => {
    await openProspects(page, '?id=sp-ambergate-grocery');
    await page.getByRole('button', { name: 'Save as lead' }).click();
    await page.getByLabel('Status').selectOption('site_visit');
    await page.getByLabel('Follow-up date').fill('2099-01-15');
    await page.getByLabel('Add a note').fill('Store manager asked for a quote after the remodel.');
    await page.getByRole('button', { name: 'Add note' }).click();
    await expect(page.getByRole('list', { name: 'Lead notes' })).toContainText('Store manager asked for a quote');

    await page.reload();
    await expect(detail(page)).toBeVisible();
    await expect(page.getByLabel('Status')).toHaveValue('site_visit');
    await expect(page.getByLabel('Follow-up date')).toHaveValue('2099-01-15');
    await expect(page.getByRole('list', { name: 'Lead notes' })).toContainText('Store manager asked for a quote');

    await page.getByRole('button', { name: 'Back to results' }).click();
    await expect(card(page, /Ambergate Fresh Market/)).toContainText('Lead · Site visit');
    await page.getByLabel('Saved leads only').check();
    await expect(results(page)).toHaveCount(1);
    await expect(marker(page, 'sp-ambergate-grocery')).toHaveAttribute('aria-label', /saved lead/);

    const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), LEADS_KEY);
    expect(stored.version).toBe(1);
    expect(stored.leads).toHaveLength(1);
    expect(stored.leads[0]).toMatchObject({ prospectId: 'sp-ambergate-grocery', status: 'site_visit', followUpAt: '2099-01-15' });
  });

  test('removing a lead asks first; clearing estimator data does not erase leads', async ({ page }) => {
    await openProspects(page, '?id=sp-bellhaven-office');
    await page.getByRole('button', { name: 'Save as lead' }).click();
    await page.getByRole('button', { name: 'Remove lead' }).click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByLabel('Status')).toBeVisible();

    await page.goto('/');
    await page.getByRole('heading', { name: 'Estimate Calculator' }).waitFor();
    await page.getByRole('button', { name: 'Calculate Estimate' }).click();
    await page.getByRole('button', { name: 'Clear Current Data' }).click();
    await page.getByRole('heading', { name: 'Estimate Calculator' }).waitFor();

    await openProspects(page, '?id=sp-bellhaven-office');
    await expect(page.getByLabel('Status')).toHaveValue('new');
    await page.getByRole('button', { name: 'Remove lead' }).click();
    await page.getByRole('button', { name: 'Yes, remove' }).click();
    await expect(page.getByRole('button', { name: 'Save as lead' })).toBeVisible();
    const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), LEADS_KEY);
    expect(stored.leads).toEqual([]);
  });

  test('unreadable saved leads are reported, left untouched, and editing is turned off', async ({ page }) => {
    await page.addInitScript((key) => localStorage.setItem(key, '{"version":99,"leads":"future format"}'), LEADS_KEY);
    await openProspects(page, '?id=sp-quillmark-medical');
    await expect(page.getByRole('alert').first()).toContainText('format this version does not recognize');
    await expect(page.getByRole('button', { name: 'Save as lead' })).toBeDisabled();
    const raw = await page.evaluate((key) => localStorage.getItem(key), LEADS_KEY);
    expect(raw).toBe('{"version":99,"leads":"future format"}');
  });

  test('/prospects does not load the PDF or ZIP libraries', async ({ page }) => {
    const scripts = new Map<string, string>();
    page.on('response', async (res) => {
      if (res.request().resourceType() === 'script') {
        try {
          scripts.set(res.url(), await res.text());
        } catch {
          /* ignore aborted responses */
        }
      }
    });
    const pdfMarker = /@react-pdf[\\/]|node_modules[\\/]jszip/;

    await page.goto('/');
    await page.getByRole('heading', { name: 'Estimate Calculator' }).waitFor();
    await page.waitForLoadState('networkidle');
    const estimatorLoadsPdf = Array.from(scripts.values()).some((body) => pdfMarker.test(body));
    test.skip(!estimatorLoadsPdf, 'Module paths are minified in this build, so the check cannot tell libraries apart.');

    scripts.clear();
    await page.context().clearCookies();
    const fresh = await page.context().newPage();
    fresh.on('response', async (res) => {
      if (res.request().resourceType() === 'script') {
        try {
          scripts.set(res.url(), await res.text());
        } catch {
          /* ignore aborted responses */
        }
      }
    });
    await fresh.goto('/prospects');
    await fresh.getByRole('heading', { level: 1, name: 'Prospects' }).waitFor();
    await fresh.waitForLoadState('networkidle');
    const offenders = Array.from(scripts.entries()).filter(([, body]) => pdfMarker.test(body)).map(([url]) => url);
    expect(offenders).toEqual([]);
  });
});

test.describe('Prospects responsive layout', () => {
  for (const width of [390, 768, 1280, 1440]) {
    test(`no horizontal scrolling at ${width}px in list, map and detail views`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const noOverflow = async (label: string) => {
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, `${label} at ${width}px`).toBeLessThanOrEqual(0);
      };
      await openProspects(page);
      await noOverflow('list');
      if (width < 1024) {
        await page.getByRole('button', { name: 'Map', exact: true }).click();
        await expect(page.getByTestId('sample-map')).toBeVisible();
        await expect(page).toHaveURL(/view=map/);
        await noOverflow('map');
        await page.getByRole('button', { name: 'Zoom in' }).click();
        await expect(page.getByTestId('sample-map')).toHaveAttribute('data-zoom', '2');
        await marker(page, 'sp-heronwick-apartments').click();
        await expect(detail(page).getByRole('heading', { level: 2 })).toHaveText('Heronwick Flats');
        // On small screens the detail takes over the page.
        await expect(page.getByTestId('sample-map')).toHaveCount(0);
        await noOverflow('detail');
        await detail(page).getByRole('button', { name: 'Back' }).click();
        await expect(page.getByTestId('sample-map')).toBeVisible();
      } else {
        await expect(page.getByTestId('sample-map')).toBeVisible();
        await card(page, /Heronwick Flats/).click();
        await expect(detail(page)).toBeVisible();
        await expect(page.getByTestId('sample-map')).toBeVisible();
        await noOverflow('detail');
      }
    });
  }
});
