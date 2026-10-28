import { test, expect, type Page } from '@playwright/test';
import {
  readZipDownload,
  expectValidPdf,
  openEstimator,
  switchMode,
  downloadPackage,
  type ZipEntry,
} from '../helpers/quote';

/**
 * Window-cleaning jobs drive every document from the Window Cleaning proposal template.
 * Expected amounts are hand-computed from the pricing constants (NC 7% tax, 20% markup):
 * per window $18 / $28.80 / $39.60 before markup, $150 window-labor minimum (shortfall only),
 * $100 hourly travel + $99 scheduling + $99 invoicing.
 * Service sides change the stated scope. Per-window rates do not change with this choice yet.
 */

type Sides = 'Exterior Only' | 'Interior Only' | 'Interior + Exterior';

interface WindowJob {
  projectName: string;
  customer: 'Residential' | 'Commercial / Storefront';
  sides: Sides;
  standard: number;
  large: number;
  highAccess: number;
  miles: number;
}

interface PricedJob extends WindowJob {
  lines: Array<[string, string]>;
  subtotal: string;
  tax: string;
  total: string;
}

const SIDES_ES: Record<Sides, string> = {
  'Exterior Only': 'Solo exterior',
  'Interior Only': 'Solo interior',
  'Interior + Exterior': 'Interior y exterior',
};

const STOREFRONT_EXTERIOR: PricedJob = {
  projectName: 'Main Street Storefront',
  customer: 'Commercial / Storefront',
  sides: 'Exterior Only',
  standard: 12,
  large: 8,
  highAccess: 0,
  miles: 12,
  lines: [
    ['Standard windows', '$259.20'],
    ['Large windows', '$276.48'],
    ['Travel and scheduling', '$357.60'],
  ],
  subtotal: '$893.28',
  tax: '$62.53',
  total: '$955.81',
};

const MIXED_HIGH_ACCESS: PricedJob = {
  projectName: 'Ridge Road Two Story',
  customer: 'Residential',
  sides: 'Exterior Only',
  standard: 22,
  large: 4,
  highAccess: 6,
  miles: 25,
  lines: [
    ['Standard windows', '$475.20'],
    ['Large windows', '$138.24'],
    ['High-access windows', '$285.12'],
    ['Travel and scheduling', '$357.60'],
  ],
  subtotal: '$1,256.16',
  tax: '$87.93',
  total: '$1,344.09',
};

const SMALL_JOB: PricedJob = {
  projectName: 'Maple Court Cottage',
  customer: 'Residential',
  sides: 'Exterior Only',
  standard: 5,
  large: 0,
  highAccess: 0,
  miles: 10,
  lines: [
    ['Standard windows', '$108.00'],
    ['Minimum service charge', '$72.00'],
    ['Travel and scheduling', '$357.60'],
  ],
  subtotal: '$537.60',
  tax: '$37.63',
  total: '$575.23',
};

const STANDARD_RESIDENTIAL: PricedJob = {
  projectName: 'Oak Lane Residence',
  customer: 'Residential',
  sides: 'Interior + Exterior',
  standard: 18,
  large: 2,
  highAccess: 0,
  miles: 15,
  lines: [
    ['Standard windows', '$388.80'],
    ['Large windows', '$69.12'],
    ['Travel and scheduling', '$357.60'],
  ],
  subtotal: '$815.52',
  tax: '$57.09',
  total: '$872.61',
};

const INTERIOR_ONLY_STOREFRONT: PricedJob = {
  projectName: 'Lobby Glass',
  customer: 'Commercial / Storefront',
  sides: 'Interior Only',
  standard: 10,
  large: 3,
  highAccess: 2,
  miles: 8,
  lines: [
    ['Standard windows', '$216.00'],
    ['Large windows', '$103.68'],
    ['High-access windows', '$95.04'],
    ['Travel and scheduling', '$357.60'],
  ],
  subtotal: '$772.32',
  tax: '$54.06',
  total: '$826.38',
};

async function fillWindowJob(page: Page, job: WindowJob) {
  await page.locator('#projectName').fill(job.projectName);
  await page.locator('#cleaningType').selectOption('window_cleaning_only');
  await page.getByRole('radio', { name: job.customer }).check();
  await page.getByRole('radio', { name: job.sides }).check();
  await page.locator('#numberOfWindows').fill(String(job.standard));
  await page.locator('#numberOfLargeWindows').fill(String(job.large));
  await page.locator('#numberOfHighAccessWindows').fill(String(job.highAccess));
  await page.locator('#distanceFromOffice').fill(String(job.miles));
}

async function calculate(page: Page, job: WindowJob) {
  await openEstimator(page);
  await fillWindowJob(page, job);
  await page.getByRole('button', { name: 'Calculate Estimate' }).click();
  await expect(page.getByTestId('proposal-summary').first()).toContainText(job.sides);
}

/** Document text with PDF line breaks collapsed; label and value are separate text runs ("Label : value"). */
const flat = (entry: ZipEntry) => entry.text.replace(/\s+/g, ' ').replace(/ :/g, ':');

function expectNoLeakedContent(entry: ZipEntry) {
  const text = flat(entry);
  expect(text, entry.name).not.toContain('window_cleaning_only');
  expect(text, entry.name).not.toMatch(/sq\.? ?ft|square f(oo|ee)t|pies cuadrados|Área Total/i);
  expect(text, entry.name).not.toMatch(/POST CONSTRUCTION|post-construction clean/i);
  expect(text, entry.name).not.toMatch(/Detail clean conference rooms|workstations|restroom/i);
  expect(text, entry.name).not.toMatch(/punch[- ]list|lista de pendientes/i);
  expect(text, entry.name).not.toMatch(/Project Type|Tipo de Proyecto/);
  expect(text, entry.name).not.toMatch(/Capability Statement|CAPABILITY/i);
}

async function expectPricedSummary(page: Page, job: PricedJob) {
  const summary = page.getByTestId('proposal-summary').first();
  await expect(summary).toContainText(job.customer);
  for (const [label, amount] of job.lines) {
    await expect(summary.getByRole('row', { name: new RegExp(label) })).toContainText(amount);
  }
  await expect(page.getByTestId('proposal-total').first()).toContainText(job.total);
  await expect(summary).not.toContainText(/sq ft|square f(oo|ee)t/i);
  await expect(page.getByTestId('internal-estimate-details')).not.toContainText(/sq ft|square f(oo|ee)t|Project Type/i);
}

/** Generates the package and checks that every document agrees with the quote. */
async function issuePackage(page: Page, job: PricedJob, outputPath: (name: string) => string) {
  await page.getByRole('button', { name: 'Generate Quote' }).click();
  await expect(page.getByTestId('proposal-preview')).toContainText('Window Cleaning Proposal preview');
  await expect(page.getByTestId('adjusted-quote-total')).toContainText(job.subtotal);
  await expect(page.getByTestId('adjusted-quote-total')).toContainText(job.total);

  const download = await downloadPackage(page, 'Download Package');
  await download.saveAs(outputPath(download.suggestedFilename()));
  const entries = await readZipDownload(download);
  expect(entries).toHaveLength(6);
  entries.forEach(expectValidPdf);
  entries.forEach(expectNoLeakedContent);

  const byName = (suffix: string) => entries.find((e) => e.name.endsWith(suffix))!;
  const quote = byName('quote.pdf');
  const invoice = byName('Invoice.pdf');
  expect(invoice.pages, `${invoice.name} keeps totals and payment on one page`).toBe(1);

  expect(quote.text).toContain('WINDOW CLEANING');
  expect(flat(quote)).toContain(`Customer Type: ${job.customer}`);
  expect(flat(quote)).toContain(`Sides Cleaned: ${job.sides}`);
  expect(flat(quote)).toContain('Not Included Unless Separately Selected and Priced');
  expect(flat(quote)).toContain('Window screens and window tracks.');
  for (const doc of [quote, invoice]) {
    for (const [label, amount] of job.lines) {
      expect(flat(doc), `${doc.name} ${label}`).toContain(label);
      expect(flat(doc), `${doc.name} ${label}`).toContain(amount);
    }
    expect(flat(doc), doc.name).toContain(job.subtotal);
    expect(flat(doc), doc.name).toContain(job.tax);
    expect(flat(doc), doc.name).toContain(job.total);
  }
  if (job.highAccess === 0) {
    expect(flat(quote)).not.toContain('High-access windows');
    expect(flat(invoice)).not.toContain('High-access windows');
  }

  // Crew and vendor documents describe the same windows and sides as the quote.
  const windowsFact = flat(quote).match(/Windows: (.+? \(\d+ total\))/)?.[1];
  expect(windowsFact).toBeTruthy();
  const workOrder = flat(byName('Work Order.pdf'));
  const purchaseOrder = flat(byName('Purchase Order.pdf'));
  for (const [name, text] of [['work order', workOrder], ['purchase order', purchaseOrder]] as const) {
    expect(text, name).toContain('Window Cleaning');
    expect(text, name).toContain(windowsFact!);
    expect(text, name).toContain(job.sides);
  }
  expect(workOrder).toContain('Quality Check');
  expect(workOrder).toContain('Do Not Perform Without an Approved Change Order');
  const spanish = flat(byName('Work Order Spanish.pdf'));
  expect(spanish).toContain('Limpieza de Ventanas');
  expect(spanish).toContain('Revisión de Calidad');
  expect(spanish).toContain(SIDES_ES[job.sides]);
  expect(spanish).toContain(`(${job.standard + job.large + job.highAccess} en total)`);

  return entries;
}

test.describe('Window Cleaning: Exterior Only uses the calculated price', () => {
  test('storefront exterior job: itemized, exterior-only scope, no square footage anywhere', async ({ page }, testInfo) => {
    await calculate(page, STOREFRONT_EXTERIOR);
    await expectPricedSummary(page, STOREFRONT_EXTERIOR);
    const entries = await issuePackage(page, STOREFRONT_EXTERIOR, (n) => testInfo.outputPath(n));
    const quote = flat(entries.find((e) => e.name === 'quote.pdf')!);
    expect(quote).toContain('Interior glass.');
    expect(quote).toMatch(/business hours/i);
    expect(quote).not.toContain('Minimum service charge');
  });

  test('mixed standard and high-access job: three window lines and ladder scope', async ({ page }, testInfo) => {
    await calculate(page, MIXED_HIGH_ACCESS);
    await expectPricedSummary(page, MIXED_HIGH_ACCESS);
    const entries = await issuePackage(page, MIXED_HIGH_ACCESS, (n) => testInfo.outputPath(n));
    const quote = flat(entries.find((e) => e.name === 'quote.pdf')!);
    expect(quote).toContain('32 total');
    expect(quote).toMatch(/ladder/i);
  });

  test('a small job shows the $150 minimum as its own line', async ({ page }, testInfo) => {
    await calculate(page, SMALL_JOB);
    await expectPricedSummary(page, SMALL_JOB);
    await issuePackage(page, SMALL_JOB, (n) => testInfo.outputPath(n));
  });
});

test.describe('Window Cleaning: Interior and Interior + Exterior use the calculated price', () => {
  test('standard residential job: both sides stated, same per-window rates', async ({ page }, testInfo) => {
    await calculate(page, STANDARD_RESIDENTIAL);
    await expectPricedSummary(page, STANDARD_RESIDENTIAL);
    const entries = await issuePackage(page, STANDARD_RESIDENTIAL, (n) => testInfo.outputPath(n));
    const quote = flat(entries.find((e) => e.name === 'quote.pdf')!);
    expect(quote).not.toContain('Interior glass.');
    expect(quote).not.toContain('Exterior glass.');
    expect(quote).toMatch(/adult/i);
    expect(quote).toContain('Travel and scheduling');
  });

  test('interior-only storefront job states interior scope and excludes exterior glass', async ({ page }, testInfo) => {
    await calculate(page, INTERIOR_ONLY_STOREFRONT);
    await expectPricedSummary(page, INTERIOR_ONLY_STOREFRONT);
    const entries = await issuePackage(page, INTERIOR_ONLY_STOREFRONT, (n) => testInfo.outputPath(n));
    expect(flat(entries.find((e) => e.name === 'quote.pdf')!)).toContain('Exterior glass.');
  });
});

test.describe('Window Cleaning: form and saved entries', () => {
  test('customer type and service sides are required; project type and square footage are hidden', async ({ page }) => {
    await openEstimator(page);
    await page.locator('#projectName').fill('Missing Choices');
    await page.locator('#cleaningType').selectOption('window_cleaning_only');
    await expect(page.locator('#projectType')).toBeHidden();
    await expect(page.locator('#squareFootage')).toHaveCount(0);
    await page.locator('#numberOfWindows').fill('10');
    await page.getByRole('button', { name: 'Calculate Estimate' }).click();

    await expect(page.locator('#windowCustomerType-error')).toHaveText('Select the customer type');
    await expect(page.locator('#windowServiceSides-error')).toHaveText('Select which sides of the glass are cleaned');
    await expect(page.getByRole('button', { name: 'Generate Quote' })).toHaveCount(0);

    await page.getByRole('radio', { name: 'Residential' }).check();
    await page.getByRole('radio', { name: 'Exterior Only' }).check();
    await page.getByRole('button', { name: 'Calculate Estimate' }).click();
    await expect(page.getByRole('button', { name: 'Generate Quote' })).toBeVisible();
  });

  test('a window job saved before the template still loads, lists every window type, and does not claim sides', async ({ page }) => {
    await calculate(page, { ...STOREFRONT_EXTERIOR, projectName: 'Legacy Windows' });
    await page.getByRole('button', { name: 'Generate Quote' }).waitFor();

    // Older entries had string counts and no customer type or sides.
    await page.evaluate(() => {
      const entries = JSON.parse(localStorage.getItem('estimaitor_past_entries') || '[]');
      const { windowCustomerType, windowServiceSides, ...rest } = entries[0].formData;
      void windowCustomerType;
      void windowServiceSides;
      entries[0].formData = { ...rest, numberOfWindows: '18', numberOfLargeWindows: '2', numberOfHighAccessWindows: '3' };
      localStorage.setItem('estimaitor_past_entries', JSON.stringify(entries));
    });

    await page.reload();
    await page.getByRole('heading', { name: 'Estimate Calculator' }).waitFor();
    await page.getByRole('button', { name: /Show Past Entries/ }).click();
    const row = page.getByRole('row', { name: /Legacy Windows/ });
    await expect(row).toContainText('Window Cleaning');
    await expect(row).toContainText('23 windows');
    await row.getByRole('button', { name: 'Load' }).click();

    const summary = page.getByTestId('proposal-summary').first();
    await expect(summary.getByRole('alert')).toContainText(/sides/i);
    await expect(summary.getByRole('row', { name: /High-access windows/ })).toContainText('3');
    await expect(summary.getByRole('row', { name: /Sides Cleaned/ })).toHaveCount(0);
    await page.getByRole('button', { name: 'Generate Quote' }).click();
    const entries = await readZipDownload(await downloadPackage(page, 'Download Package'));
    const quote = flat(entries.find((e) => e.name === 'quote.pdf')!);
    expect(quote).toContain('High-access windows');
    expect(quote).not.toMatch(/Exterior Only|Interior Only|Interior \+ Exterior|Sides Cleaned/);
    entries.forEach(expectNoLeakedContent);
  });
});

test.describe('Customer-facing quote notes print on every service', () => {
  test('final cleaning quote PDF includes the Notes text', async ({ page }) => {
    await openEstimator(page);
    await page.locator('#projectName').fill('Notes Cleaning');
    await page.getByRole('button', { name: 'Calculate Estimate' }).click();
    await page.getByRole('button', { name: 'Generate Quote' }).click();
    await page.locator('textarea[name="notes"]').fill('Gate code provided by the site supervisor.');
    const entries = await readZipDownload(await downloadPackage(page, 'Download Package'));
    expect(flat(entries.find((e) => e.name === 'quote.pdf')!)).toContain('Gate code provided by the site supervisor.');
  });

  test('pressure washing quote PDF includes the Notes text', async ({ page }) => {
    await openEstimator(page);
    await switchMode(page, 'Pressure Washing');
    await page.getByPlaceholder('Project name').fill('Notes Wash');
    await page.getByRole('button', { name: 'Calculate Pressure Washing Estimate' }).click();
    await page.getByRole('button', { name: 'Generate Quote' }).click();
    await page.locator('textarea[name="notes"]').fill('Water spigot on the north wall.');
    const entries = await readZipDownload(await downloadPackage(page, 'Download Package (Quote, WO, PO, Invoice)'));
    expect(flat(entries.find((e) => e.name === 'quote.pdf')!)).toContain('Water spigot on the north wall.');
  });

  test('window cleaning quote PDF includes the Notes text', async ({ page }) => {
    await calculate(page, STOREFRONT_EXTERIOR);
    await page.getByRole('button', { name: 'Generate Quote' }).click();
    await page.locator('textarea[name="notes"]').fill('Clean before the store opens at 10 AM.');
    const entries = await readZipDownload(await downloadPackage(page, 'Download Package'));
    expect(flat(entries.find((e) => e.name === 'quote.pdf')!)).toContain('Clean before the store opens at 10 AM.');
  });
});
