import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';
import React from 'react';
import { pdf } from '@react-pdf/renderer';
import QuotePDF from '../../src/components/QuotePDF';
import { calculateEstimate } from '../../src/lib/estimator';
import { getAdjustedQuotePreTaxSubtotal } from '../../src/lib/utils';
import { buildProposal, formatProposalTerms, type ProposalDocument } from '../../src/lib/proposals';
import type { FormData } from '../../src/lib/types';
import { extractPdfPageTexts, extractPdfText } from '../helpers/pdfText';

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

async function renderQuote(formData: FormData, proposal: ProposalDocument, notes = '') {
  const estimate = calculateEstimate(formData, NC_TAX);
  const element = React.createElement(QuotePDF, {
    estimateData: estimate,
    formData,
    preTaxSubtotal: proposal.amounts.subtotal,
    companyInfo: {
      name: 'Big Brother Property Solutions',
      address: '1200 Eastchester Dr.',
      city: 'High Point, NC 27265',
      phone: '(336) 624-7442',
      email: 'bids@bigbroprops.com',
      website: 'www.bigbrotherpropertysolutions.com',
      logoSrc: LOGO_SRC,
    },
    clientInfo: {
      name: 'Dana Oak',
      company: 'Oak Household',
      address: '18 Oak Ln, High Point, NC 27265',
      email: 'dana@example.com',
      phone: '336-555-0100',
    },
    quoteInfo: {
      quoteNumber: 'Q-2026-121',
      date: '10/17/2026',
      validUntil: '11/16/2026',
      projectName: formData.projectName || 'Oak Lane Residence',
      projectAddress: '18 Oak Ln, High Point, NC 27265',
      notes,
      terms: formatProposalTerms(proposal.terms),
    },
    proposal,
  });
  const blob = await pdf(element as React.ReactElement).toBlob();
  return Buffer.from(await blob.arrayBuffer());
}

const flat = (text: string) => text.replace(/\s+/g, ' ').replace(/ ·/g, '·').replace(/:·/g, ': ');

test.describe('Window Cleaning quote PDF layout', () => {
  test('the closing line stays with the signature block on a typical quote', async () => {
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
      const pages = extractPdfPageTexts(await renderQuote(formData, proposal)).map(flat);
      const all = pages.join(' ');

      expect(all, formData.projectName).toContain('WINDOW CLEANING');
      expect(all, formData.projectName).toContain(proposal.amounts.total.toLocaleString('en-US', { style: 'currency', currency: 'USD' }));
      expect(all, formData.projectName).toContain('Terms & Conditions');
      expect(all, formData.projectName).toContain('Thank you for your business!');

      const closing = pages.filter((page) => page.includes('Thank you for your business!'));
      expect(closing, formData.projectName).toHaveLength(1);
      expect(closing[0], formData.projectName).toContain('Client Signature');
      expect(closing[0], formData.projectName).toContain('Acceptance');
      expect(closing[0], formData.projectName).toContain('Terms & Conditions');
      expect(closing[0], formData.projectName).toContain('Payment is due on completion');
    }
  });

  test('a longer quote can paginate without leaving the thank-you line alone', async () => {
    const formData = form({ projectName: 'Long Window Quote' });
    const proposal = proposalFor(formData);
    const notes = Array.from({ length: 12 }, (_, i) => `Site note ${i + 1}: confirm access before the crew arrives.`).join('\n');
    const pdfBytes = await renderQuote(formData, proposal, notes);
    const pages = extractPdfPageTexts(pdfBytes).map(flat);

    expect(pages.length).toBeGreaterThan(2);
    const closing = pages.filter((page) => page.includes('Thank you for your business!'));
    expect(closing).toHaveLength(1);
    expect(closing[0]).toContain('Client Signature');
    expect(closing[0]).toContain('Terms & Conditions');
    expect(flat(extractPdfText(pdfBytes))).toContain('Site note 12');
  });
});
