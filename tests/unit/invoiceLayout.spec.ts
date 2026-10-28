import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';
import React from 'react';
import { pdf } from '@react-pdf/renderer';
import InvoicePDF from '../../src/components/InvoicePDF';
import { calculateEstimate } from '../../src/lib/estimator';
import { getAdjustedQuotePreTaxSubtotal } from '../../src/lib/utils';
import { buildProposal, type ProposalDocument, type QuoteLineItem } from '../../src/lib/proposals';
import type { FormData } from '../../src/lib/types';
import { countPdfPages, extractPdfPageTexts, extractPdfText } from '../helpers/pdfText';

const NC_TAX = 0.07;
const LOGO_SRC = `data:image/png;base64,${readFileSync(join(process.cwd(), 'public/assets/logo.png')).toString('base64')}`;

function form(overrides: Partial<FormData> = {}): FormData {
  return {
    projectType: 'other',
    cleaningType: 'window_cleaning_only',
    squareFootage: 5000,
    hasVCT: false,
    vctSquareFootage: 0,
    distanceFromOffice: 15,
    gasPrice: 3.5,
    applyMarkup: true,
    numberOfCleaners: 3,
    urgencyLevel: 1,
    stayingOvernight: false,
    numberOfNights: 1,
    needsPressureWashing: false,
    pressureWashingServices: [],
    pressureWashingArea: 0,
    pressureWashingType: 'soft_wash',
    needsWindowCleaning: false,
    numberOfWindows: 18,
    numberOfLargeWindows: 2,
    numberOfHighAccessWindows: 0,
    numberOfDisplayCases: 0,
    windowCustomerType: 'residential',
    windowServiceSides: 'interior_exterior',
    projectName: 'Oak Lane Residence',
    projectStreet: '18 Oak Ln',
    projectCity: 'High Point',
    projectState: 'NC',
    projectZip: '27265',
    clientName: 'Dana Oak',
    ...overrides,
  };
}

function proposalFor(formData: FormData): ProposalDocument {
  const estimate = calculateEstimate(formData, NC_TAX);
  const proposal = buildProposal(formData, estimate, {
    preTaxSubtotal: getAdjustedQuotePreTaxSubtotal(estimate, 0),
  });
  if (!proposal) throw new Error('expected a window-cleaning proposal');
  return proposal;
}

async function renderInvoice(formData: FormData, proposal: ProposalDocument) {
  const estimate = calculateEstimate(formData, NC_TAX);
  const element = React.createElement(InvoicePDF, {
    estimateData: estimate,
    formData,
    companyInfo: {
      name: 'Big Brother Property Solutions',
      address: '1200 Eastchester Dr.',
      city: 'High Point, NC 27265',
      phone: '(336) 624-7442',
      email: 'bids@bigbroprops.com',
      website: 'www.bigbrotherpropertysolutions.com',
      logoSrc: LOGO_SRC,
    },
    quoteInfo: {
      quoteNumber: 'Q-2026-121',
      projectName: formData.projectName || 'Oak Lane Residence',
      projectAddress: '18 Oak Ln, High Point, NC 27265',
      notes: 'Gate code 4411',
      total: proposal.amounts.total,
    },
    invoiceInfo: {
      invoiceNumber: 'Q-2026-121',
      date: '10/17/2026',
      dueDate: '11/01/2026',
      paymentTerms: proposal.invoicePaymentTerms,
    },
    clientInfo: {
      name: 'Dana Oak',
      address: '18 Oak Ln, High Point, NC 27265',
      phone: '336-555-0100',
    },
    proposal,
  });
  const blob = await pdf(element as React.ReactElement).toBlob();
  return Buffer.from(await blob.arrayBuffer());
}

const flat = (text: string) => text.replace(/\s+/g, ' ').replace(/ ·/g, '·').replace(/:·/g, ': ');

function pageWith(pages: string[], snippet: string) {
  const index = pages.findIndex((page) => flat(page).includes(snippet));
  expect(index, `expected a page containing "${snippet}"`).toBeGreaterThan(-1);
  return { index, text: flat(pages[index]) };
}

test.describe('Window Cleaning invoice PDF layout', () => {
  test('a typical job keeps totals and payment instructions on page one', async () => {
    const jobs = [
      form(),
      form({
        projectName: 'Ridge Road Two Story',
        windowServiceSides: 'exterior',
        numberOfWindows: 22,
        numberOfLargeWindows: 4,
        numberOfHighAccessWindows: 6,
        distanceFromOffice: 25,
      }),
    ];

    for (const formData of jobs) {
      const proposal = proposalFor(formData);
      const pdfBytes = await renderInvoice(formData, proposal);
      const pages = extractPdfPageTexts(pdfBytes);
      const all = flat(extractPdfText(pdfBytes));
      const page = flat(pages[0]);

      expect(countPdfPages(pdfBytes), formData.projectName).toBe(1);
      expect(pages, formData.projectName).toHaveLength(1);
      expect(all).toContain(proposal.amounts.subtotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' }));
      expect(all).toContain('Payment is due on completion');
      expect(all).toContain('late fee of 10%');
      expect(page).toContain('TOTAL');
      expect(page).toContain('Payment Information');
      expect(page).toContain('Please make checks payable to:');
      expect(page).toContain('Payment Terms');
      expect(page).toContain('Payment is due on completion');
      expect(page).toContain('Balance Due');
    }
  });

  test('a longer invoice keeps the payment block with the totals instead of stranding it', async () => {
    const formData = form({ projectName: 'Long Service Invoice' });
    const proposal = proposalFor(formData);
    const extras: QuoteLineItem[] = Array.from({ length: 18 }, (_, i) => ({
      id: `extra-${i + 1}`,
      description: `Additional access setup ${i + 1}`,
      detail: 'Crew time and equipment for a multi-building site.',
      amount: 0,
    }));
    const longProposal: ProposalDocument = {
      ...proposal,
      lineItems: [...proposal.lineItems, ...extras],
    };

    const pdfBytes = await renderInvoice(formData, longProposal);
    const pages = extractPdfPageTexts(pdfBytes);
    expect(countPdfPages(pdfBytes)).toBeGreaterThan(1);

    const totals = pageWith(pages, 'TOTAL');
    expect(totals.text).toContain('$872.61');
    expect(totals.text).toContain('Payment Information');
    expect(totals.text).toContain('Please make checks payable to:');
    expect(totals.text).toContain('Payment Terms');
    expect(totals.text).toContain('Payment is due on completion');
    expect(totals.text).toContain('Balance Due');

    const stranded = pages.filter(
      (page) => flat(page).includes('Payment Information') && !flat(page).includes('TOTAL')
    );
    expect(stranded, 'payment must not appear on a page without the totals').toEqual([]);
  });
});
