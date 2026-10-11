import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { openEstimator, switchMode } from '../helpers/quote';
import { extractPdfText } from '../helpers/pdfText';

async function fillContractForm(page: import('@playwright/test').Page) {
  await openEstimator(page);
  await switchMode(page, 'Janitorial Contract');
  await page.locator('#facilityName').fill('Sample Office Park');
  await page.locator('#contactName').fill('Pat Sample');
  await page.locator('#facilityAddress').fill('100 Example Way');
  await page.locator('#city').fill('Greensboro');
  await page.locator('#contactEmail').fill('pat.sample@example.com');
  await page.locator('#contactPhone').fill('(336) 555-0100');
}

test.describe('Janitorial Contract mode', () => {
  // Defaults: office, 5,000 sq ft, 2 bathrooms, weekly, 12-month term.
  // 5,000 x $0.85 + 2 x $45 = $4,340/month; x 12 x (1 - 5%) = $49,476/year.
  test('pricing preview and contract summary match the rate rules', async ({ page }) => {
    await fillContractForm(page);
    await expect(page.getByText('$4,340').first()).toBeVisible();
    await expect(page.getByText('$49,476').first()).toBeVisible();

    await page.getByRole('button', { name: 'Generate Janitorial Contract' }).click();
    await expect(page.getByRole('heading', { name: 'Janitorial Contract Summary' })).toBeVisible();
    await expect(page.getByText('5% contract discount applied').first()).toBeVisible();
  });

  test('contract PDF downloads with facility and monthly rate', async ({ page }) => {
    await fillContractForm(page);
    await page.getByRole('button', { name: 'Generate Janitorial Contract' }).click();
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 60_000 }),
      page.getByRole('button', { name: /Download Contract PDF/ }).click(),
    ]);
    expect(download.suggestedFilename()).toBe('Sample_Office_Park_Janitorial_Contract.pdf');
    const pdf = readFileSync((await download.path())!);
    expect(pdf.subarray(0, 5).toString('latin1')).toBe('%PDF-');
    const text = extractPdfText(pdf);
    expect(text).toContain('Sample Office Park');
    expect(text).toMatch(/4,340/);
  });

  test('Email Contract posts a contract payload with the PDF attached to /api/email', async ({ page }) => {
    await fillContractForm(page);
    await page.getByRole('button', { name: 'Generate Janitorial Contract' }).click();

    let body: any;
    await page.route('**/api/email', async (route) => {
      body = route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    });
    const dialog = page.waitForEvent('dialog');
    await page.getByRole('button', { name: /Email Contract/ }).click();
    const d = await dialog;
    expect(d.message()).toBe('Contract sent successfully!');
    await d.dismiss();

    expect(body.type).toBe('contract');
    expect(body.data.clientEmail).toBe('pat.sample@example.com');
    expect(body.data.clientName).toBe('Pat Sample');
    expect(body.data.facilityName).toBe('Sample Office Park');
    expect(body.data.monthlyRate).toBe(4340);
    expect(body.data.contractTerm).toBe(12);
    expect(body.data.pdfAttachment.filename).toBe('Sample_Office_Park_Contract.pdf');
    expect(Buffer.from(body.data.pdfAttachment.content, 'base64').subarray(0, 5).toString('latin1')).toBe('%PDF-');
  });

  test('real /api/email accepts the page payload (24-month term) and reports email not configured', async ({ page }) => {
    await fillContractForm(page);
    await page.locator('#contractLength').selectOption('24');
    await page.getByRole('button', { name: 'Generate Janitorial Contract' }).click();
    const dialog = page.waitForEvent('dialog', { timeout: 30_000 });
    await page.getByRole('button', { name: /Email Contract/ }).click();
    const d = await dialog;
    expect(d.message()).toBe('Error sending email: Email is not configured');
    await d.dismiss();
  });
});
