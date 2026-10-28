import { expect, type Download, type Page } from '@playwright/test';
import JSZip from 'jszip';
import { readFileSync } from 'fs';
import { extractPdfText, countPdfPages } from './pdfText';

export interface ZipEntry {
  name: string;
  bytes: Buffer;
  text: string;
  pages: number;
}

export async function readZipDownload(download: Download): Promise<ZipEntry[]> {
  const path = await download.path();
  if (!path) throw new Error('Download did not produce a file');
  const zip = await JSZip.loadAsync(readFileSync(path));
  const entries: ZipEntry[] = [];
  for (const name of Object.keys(zip.files).sort()) {
    const bytes = Buffer.from(await zip.files[name].async('uint8array'));
    entries.push({ name, bytes, text: extractPdfText(bytes), pages: countPdfPages(bytes) });
  }
  return entries;
}

export async function readPdfDownload(download: Download): Promise<ZipEntry> {
  const path = await download.path();
  if (!path) throw new Error('Download did not produce a file');
  const bytes = readFileSync(path);
  return { name: download.suggestedFilename(), bytes, text: extractPdfText(bytes), pages: countPdfPages(bytes) };
}

export function expectValidPdf(entry: ZipEntry) {
  expect(entry.bytes.subarray(0, 5).toString('latin1'), `${entry.name} is a PDF`).toBe('%PDF-');
  expect(entry.pages, `${entry.name} has pages`).toBeGreaterThan(0);
}

/** Fresh browser context = empty localStorage = built-in fallback company settings (NC tax). */
export async function openEstimator(page: Page) {
  await page.goto('/');
  await page.getByRole('heading', { name: 'Estimate Calculator' }).waitFor();
}

export async function switchMode(page: Page, title: 'Final Cleaning' | 'Pressure Washing' | 'Janitorial Contract') {
  await page.getByRole('button', { name: new RegExp(`^${title}`) }).click();
}

export async function downloadPackage(page: Page, buttonName: string | RegExp) {
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 60_000 }),
    page.getByRole('button', { name: buttonName }).click(),
  ]);
  return download;
}
