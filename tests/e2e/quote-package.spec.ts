import { test, expect } from '@playwright/test';
import { readZipDownload, expectValidPdf, openEstimator, switchMode, downloadPackage } from '../helpers/quote';

/**
 * Expected dollar amounts are the hand-computed values from tests/unit/estimator.spec.ts
 * for the calculators' default inputs, so UI, quote PDF, and invoice must all agree
 * with the pricing rules (not just with each other).
 */

test.describe('Final Cleaning mode: estimate -> quote -> ZIP package', () => {
  test('office 5,000 sq ft default estimate produces a six-document package with matching totals', async ({ page }) => {
    await openEstimator(page);
    await page.locator('#projectName').fill('Sample Office Fitout');
    await page.getByRole('button', { name: 'Calculate Estimate' }).click();

    await expect(page.getByText('$2,090.35').first()).toBeVisible();
    await expect(page.getByText('Sales Tax (7%)')).toBeVisible();

    await page.getByRole('button', { name: 'Generate Quote' }).click();
    await expect(page.getByRole('button', { name: 'Download Package' })).toBeVisible();

    const download = await downloadPackage(page, 'Download Package');
    const quoteNumberInName = /^Sample Office Fitout (\d+) Location\.zip$/.exec(download.suggestedFilename());
    expect(quoteNumberInName, `zip name: ${download.suggestedFilename()}`).not.toBeNull();
    const n = quoteNumberInName![1];

    const entries = await readZipDownload(download);
    expect(entries.map((e) => e.name)).toEqual(
      [
        `${n} Sample Office Fitout Invoice.pdf`,
        'Sample Office Fitout Change Order.pdf',
        'Sample Office Fitout Purchase Order.pdf',
        'Sample Office Fitout Work Order Spanish.pdf',
        'Sample Office Fitout Work Order.pdf',
        'quote.pdf',
      ].sort()
    );
    entries.forEach(expectValidPdf);

    const byName = (suffix: string) => entries.find((e) => e.name.endsWith(suffix))!;
    const quote = byName('quote.pdf');
    const invoice = byName('Invoice.pdf');
    const year = new Date().getFullYear();
    const quoteNumber = `Q-${year}-${n}`;

    expect(quote.text).toContain('POST CONSTRUCTION');
    expect(quote.text).toContain('Sample Office Fitout');
    expect(quote.text).toContain(quoteNumber);
    expect(quote.text).toContain('Final Clean');
    expect(quote.text).toContain('5,000');
    expect(quote.text).toContain('Detail clean conference rooms and reception areas'); // office scope of work
    expect(quote.text).toContain('$1,953.60'); // subtotal = labor + fees + 20% markup
    expect(quote.text).toContain('$136.75'); // 7% NC tax
    expect(quote.text).toContain('$2,090.35');
    expect(quote.text).toContain('Payment Terms: Net 15');

    expect(invoice.text).toContain(`Q-${year}-${n}`);
    expect(invoice.text).toContain('$1,953.60');
    expect(invoice.text).toContain('$136.75');
    expect(invoice.text).toContain('$2,090.35');

    expect(byName('Work Order.pdf').text).toContain('Work Order');
    expect(byName('Work Order Spanish.pdf').text).toContain('Orden de Trabajo');
    expect(byName('Purchase Order.pdf').text).toContain('Purchase Order');
    expect(byName('Change Order.pdf').text).toContain('CHANGE ORDER');
    expect(byName('Change Order.pdf').text).toContain(quoteNumber);
  });

  test('downloading a package advances the quote counter', async ({ page }) => {
    await openEstimator(page);
    await page.locator('#projectName').fill('Counter Check');
    await page.getByRole('button', { name: 'Calculate Estimate' }).click();
    await page.getByRole('button', { name: 'Generate Quote' }).click();
    const first = await downloadPackage(page, 'Download Package');
    const a = Number(/ (\d+) Location\.zip$/.exec(first.suggestedFilename())![1]);
    const second = await downloadPackage(page, 'Download Package');
    const b = Number(/ (\d+) Location\.zip$/.exec(second.suggestedFilename())![1]);
    expect(b).toBe(a + 1);
  });
});

test.describe('Pressure Washing mode: estimate -> four-document wash package', () => {
  test('soft wash 2,000 sq ft default produces Quote, WO, PO, Invoice with wash terms', async ({ page }) => {
    await openEstimator(page);
    await switchMode(page, 'Pressure Washing');
    await page.getByPlaceholder('Project name').fill('Sample House Wash');
    await page.getByRole('button', { name: 'Calculate Pressure Washing Estimate' }).click();

    // 2,000 x $0.18 + $100 travel + $99 + $99 + $150 mobilization = $808; +20% = $969.60; +7% = $1,037.47
    await expect(page.getByText('$1,037.47').first()).toBeVisible();

    await page.getByRole('button', { name: 'Generate Quote' }).click();
    const download = await downloadPackage(page, 'Download Package (Quote, WO, PO, Invoice)');
    const entries = await readZipDownload(download);
    const names = entries.map((e) => e.name);

    expect(names).toHaveLength(4);
    expect(names).toContain('quote.pdf');
    expect(names.some((x) => x.endsWith('Sample House Wash Work Order.pdf'))).toBe(true);
    expect(names.some((x) => x.endsWith('Sample House Wash Purchase Order.pdf'))).toBe(true);
    expect(names.some((x) => x.endsWith('Invoice.pdf'))).toBe(true);
    expect(names.some((x) => /Spanish|Change Order/.test(x))).toBe(false);
    entries.forEach(expectValidPdf);

    const quote = entries.find((e) => e.name === 'quote.pdf')!;
    expect(quote.text).toContain('$969.60');
    expect(quote.text).toContain('$1,037.47');
    expect(quote.text).toMatch(/soft wash/i);
    expect(quote.text).toContain('not lot size');
    expect(quote.text).toContain('Weather');
    expect(quote.text).not.toContain('POST CONSTRUCTION');

    const invoice = entries.find((e) => e.name.endsWith('Invoice.pdf'))!;
    expect(invoice.text).toContain('$1,037.47');
    expect(invoice.text).toContain('Due upon completion');
  });
});

test.describe('Quote adjustment and client details flow into every document', () => {
  test('+10% adjustment, client name on quote and invoice Bill To, no hardcoded suite', async ({ page }) => {
    await openEstimator(page);
    await page.locator('#clientName').fill('Sample Client LLC');
    await page.locator('#projectName').fill('Sample Office Fitout');
    await page.getByRole('button', { name: 'Calculate Estimate' }).click();
    await page.getByRole('button', { name: 'Generate Quote' }).click();

    await expect(page.locator('input[name="name"]').first()).toHaveValue('Sample Client LLC');
    // 0%: estimator subtotal $1,953.60 / total $2,090.35
    await expect(page.getByTestId('adjusted-quote-total')).toContainText('$1,953.60');
    await expect(page.getByTestId('adjusted-quote-total')).toContainText('$2,090.35');
    // +10% of the whole subtotal: $1,953.60 x 1.1 = $2,148.96; tax $150.43; total $2,299.39
    await page.locator('#markupAdjustment').fill('10');
    await expect(page.getByTestId('adjusted-quote-total')).toContainText('$2,148.96');
    await expect(page.getByTestId('adjusted-quote-total')).toContainText('$2,299.39');
    await expect(page.getByTestId('below-cost-warning')).toHaveCount(0);

    const entries = await readZipDownload(await downloadPackage(page, 'Download Package'));
    const quote = entries.find((e) => e.name === 'quote.pdf')!;
    const invoice = entries.find((e) => e.name.endsWith('Invoice.pdf'))!;

    for (const doc of [quote, invoice]) {
      expect(doc.text, doc.name).toContain('$2,148.96');
      expect(doc.text, doc.name).toContain('$150.43');
      expect(doc.text, doc.name).toContain('$2,299.39');
      expect(doc.text, doc.name).not.toContain('$2,090.35');
    }
    expect(quote.text).toContain('Sample Client LLC');

    const billTo = invoice.text.slice(invoice.text.indexOf('Bill To'), invoice.text.indexOf('Project Location'));
    expect(billTo).toContain('Sample Client LLC');
    expect(billTo).not.toContain('Big Brother Property Solutions');
    expect(invoice.text).not.toMatch(/Ste\.? ?203/);
  });

  test("a previous client's saved details are not carried onto a different client's quote", async ({ page }) => {
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('seeded')) {
        localStorage.setItem(
          'quoteClientInfo',
          JSON.stringify({ name: 'Old Client Co', company: 'Old Co', address: '9 Old Rd', email: 'old@example.com', phone: '555-0199' })
        );
        sessionStorage.setItem('seeded', '1');
      }
    });
    await openEstimator(page);
    await page.locator('#clientName').fill('New Client Inc');
    await page.locator('#projectName').fill('New Job');
    await page.getByRole('button', { name: 'Calculate Estimate' }).click();
    await page.getByRole('button', { name: 'Generate Quote' }).click();

    const entries = await readZipDownload(await downloadPackage(page, 'Download Package'));
    for (const doc of entries.filter((e) => /quote\.pdf|Invoice\.pdf/.test(e.name))) {
      expect(doc.text, doc.name).toContain('New Client Inc');
      expect(doc.text, doc.name).not.toContain('Old Client Co');
      expect(doc.text, doc.name).not.toContain('9 Old Rd');
      expect(doc.text, doc.name).not.toContain('old@example.com');
    }
  });

  test('a discount past the markup shows a below-cost warning', async ({ page }) => {
    await openEstimator(page);
    await page.locator('#projectName').fill('Discount Check');
    await page.getByRole('button', { name: 'Calculate Estimate' }).click();
    await page.getByRole('button', { name: 'Generate Quote' }).click();
    await page.locator('#markupAdjustment').fill('-16');
    await expect(page.getByTestId('below-cost-warning')).toHaveCount(0);
    await page.locator('#markupAdjustment').fill('-17');
    await expect(page.getByTestId('below-cost-warning')).toContainText('below cost');
    await expect(page.getByTestId('adjusted-quote-total')).toContainText('$1,621.49'); // 1,953.60 x 0.83
  });
});
