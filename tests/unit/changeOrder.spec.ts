import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';
import React from 'react';
import { pdf } from '@react-pdf/renderer';
import ChangeOrderPDF from '../../src/components/ChangeOrderPDF';
import { calculateEstimate } from '../../src/lib/estimator';
import { formatCurrency, getAdjustedQuotePreTaxSubtotal } from '../../src/lib/utils';
import {
  CHANGE_ORDER_AUTHORIZATION,
  CHANGE_ORDER_STATUS,
  buildProposal,
  buildWindowChangeOrder,
  type ChangeOrderLineInput,
  type ProposalDocument,
} from '../../src/lib/proposals';
import type { FormData } from '../../src/lib/types';
import { extractPdfText } from '../helpers/pdfText';

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

function source(proposal: ProposalDocument, lines: ChangeOrderLineInput[] = []) {
  return {
    proposal,
    quoteNumber: 'Q-2026-121',
    date: '10/17/2026',
    clientName: 'Dana Oak',
    clientCompany: 'Oak Household',
    clientPhone: '336-555-0100',
    clientEmail: 'dana@example.com',
    projectName: 'Oak Lane Residence',
    projectAddress: '18 Oak Ln, High Point, NC 27265',
    lines,
  };
}

const line = (overrides: Partial<ChangeOrderLineInput>): ChangeOrderLineInput => ({
  id: overrides.id ?? 'line-1',
  kind: overrides.kind ?? 'addition',
  description: overrides.description ?? '',
  reason: overrides.reason ?? '',
  amount: overrides.amount ?? '',
});

async function renderChangeOrder(formData: FormData, proposal: ProposalDocument | null, lines: ChangeOrderLineInput[] = []) {
  const changeOrder = proposal ? buildWindowChangeOrder(source(proposal, lines)) : null;
  const element = React.createElement(ChangeOrderPDF, {
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
    clientInfo: {
      name: 'Dana Oak',
      company: 'Oak Household',
      address: '18 Oak Ln, High Point, NC 27265',
      email: 'dana@example.com',
      phone: '336-555-0100',
    },
    changeOrderInfo: {
      orderNumber: 'Q-2026-121',
      date: '10/17/2026',
      projectName: formData.projectName || 'Project',
      projectAddress: '18 Oak Ln, High Point, NC 27265',
    },
    changeOrder,
  });
  const blob = await pdf(element as React.ReactElement).toBlob();
  return extractPdfText(Buffer.from(await blob.arrayBuffer())).replace(/\s+/g, ' ');
}

test.describe('Window Cleaning change order totals', () => {
  test('an empty change order keeps the original total and leaves the revision blank', () => {
    const formData = form();
    const proposal = proposalFor(formData);
    const before = proposal.amounts.total;
    const change = buildWindowChangeOrder(source(proposal, [
      line({ id: 'blank', description: '   ', amount: '' }),
    ]));

    expect(change.statusLabel).toBe(CHANGE_ORDER_STATUS);
    expect(change.quoteNumber).toBe('Q-2026-121');
    expect(change.date).toBe('10/17/2026');
    expect(change.clientName).toBe('Dana Oak');
    expect(change.projectAddress).toBe('18 Oak Ln, High Point, NC 27265');
    expect(change.sides).toBe('Interior + Exterior');
    expect(change.windowCount).toContain('18 standard');
    expect(change.windowCount).toContain('2 large');
    expect(change.originalTotal).toBe(before);
    expect(change.lines).toEqual([]);
    expect(change.adjustment).toBeNull();
    expect(change.revisedTotal).toBeNull();
    expect(proposal.amounts.total).toBe(before);
  });

  test('populated lines sum typed amounts and do not apply rates, markup, or tax', () => {
    const proposal = proposalFor(form());
    const change = buildWindowChangeOrder(source(proposal, [
      line({ id: 'add', kind: 'addition', description: 'Extra pane', reason: 'Customer asked', amount: '100' }),
      line({ id: 'remove', kind: 'removal', description: 'Skip the tracks', reason: 'Not this visit', amount: '40' }),
      line({ id: 'move', kind: 'scope_change', description: 'Saturday instead of Friday', reason: 'Store hours', amount: '25' }),
    ]));

    expect(change.lines.map((item) => [item.label, item.amount])).toEqual([
      ['Addition', 100],
      ['Removal', -40],
      ['Scope change', 25],
    ]);
    expect(change.adjustment).toBe(85);
    expect(change.revisedTotal).toBeCloseTo(proposal.amounts.total + 85, 2);
    expect(change.revisedTotal).not.toBeCloseTo((proposal.amounts.total + 85) * (1 + NC_TAX), 2);
    expect(change.adjustment).not.toBeCloseTo(18 * 1.2, 2);
  });

  test('one missing amount leaves the adjustment and revised total blank', () => {
    const proposal = proposalFor(form());
    const change = buildWindowChangeOrder(source(proposal, [
      line({ id: 'add', kind: 'addition', description: 'Extra pane', reason: 'Customer asked', amount: '$100.00' }),
      line({ id: 'open', kind: 'scope_change', description: 'Confirm the side door', reason: 'Added on site', amount: '' }),
    ]));

    expect(change.lines[0].amount).toBe(100);
    expect(change.lines[1].amount).toBeNull();
    expect(change.adjustment).toBeNull();
    expect(change.revisedTotal).toBeNull();
  });

  test('editing an amount and dropping a line recalculates from the lines that remain', () => {
    const proposal = proposalFor(form());
    const originalTotal = proposal.amounts.total;
    const withBoth = buildWindowChangeOrder(source(proposal, [
      line({ id: 'add', description: 'Extra pane', reason: 'Customer asked', amount: '100' }),
      line({ id: 'remove', kind: 'removal', description: 'Skip the tracks', reason: 'Not this visit', amount: '40' }),
    ]));
    const editedAndRemoved = buildWindowChangeOrder(source(proposal, [
      line({ id: 'add', description: 'Extra pane revised', reason: 'Customer asked', amount: '80' }),
    ]));

    expect(withBoth.adjustment).toBe(60);
    expect(editedAndRemoved.lines).toHaveLength(1);
    expect(editedAndRemoved.lines[0].description).toBe('Extra pane revised');
    expect(editedAndRemoved.adjustment).toBe(80);
    expect(editedAndRemoved.revisedTotal).toBeCloseTo(originalTotal + 80, 2);
    expect(proposal.amounts.total).toBe(originalTotal);
    expect(withBoth.originalTotal).toBe(originalTotal);
  });
});

test.describe('Window Cleaning change order PDF', () => {
  test('the empty document names the original proposal and does not invent a price', async () => {
    const formData = form();
    const proposal = proposalFor(formData);
    const text = await renderChangeOrder(formData, proposal);

    expect(text).toContain(CHANGE_ORDER_STATUS);
    expect(text).toContain('Proposal: Q-2026-121');
    expect(text).toContain('Date: 10/17/2026');
    expect(text).toContain('Client: Dana Oak');
    expect(text).toContain('Property: Oak Lane Residence');
    expect(text).toContain('Property address: 18 Oak Ln, High Point, NC 27265');
    expect(text).toContain('Sides cleaned: Interior + Exterior');
    expect(text).toContain(`Windows: ${proposal.projectFacts.find((item) => item.label === 'Windows')?.value}`);
    expect(text).toContain(`Original proposal total: ${formatCurrency(proposal.amounts.total)}`);
    expect(text).toContain('No changes entered.');
    expect(text).toContain('Price adjustment:');
    expect(text).toContain('Revised total:');
    expect(text).not.toMatch(/Price adjustment:\s*\$/);
    expect(text).not.toMatch(/Revised total:\s*\$/);
    expect(text).toContain('Customer signature');
    expect(text).toContain(CHANGE_ORDER_AUTHORIZATION);
    for (const item of proposal.lineItems) {
      expect(text, item.description).not.toContain(formatCurrency(item.amount));
    }
  });

  test('a revised price prints only the typed adjustment', async () => {
    const formData = form();
    const proposal = proposalFor(formData);
    const lines = [
      line({ id: 'add', kind: 'addition', description: 'Extra pane', reason: 'Customer asked', amount: '100' }),
      line({ id: 'remove', kind: 'removal', description: 'Skip the tracks', reason: 'Not this visit', amount: '40' }),
    ];
    const text = await renderChangeOrder(formData, proposal, lines);

    expect(text).toContain('Addition');
    expect(text).toContain('Description: Extra pane');
    expect(text).toContain('Reason: Customer asked');
    expect(text).toContain('Amount: $100.00');
    expect(text).toContain('Removal');
    expect(text).toContain('Description: Skip the tracks');
    expect(text).toContain('Amount: -$40.00');
    expect(text).toContain('Price adjustment: $60.00');
    expect(text).toContain(`Revised total: ${formatCurrency(proposal.amounts.total + 60)}`);
    expect(text).not.toContain(formatCurrency(proposal.lineItems[0].amount));
  });

  test('a missing amount keeps the revision blank on the document', async () => {
    const formData = form();
    const proposal = proposalFor(formData);
    const text = await renderChangeOrder(formData, proposal, [
      line({ id: 'add', description: 'Extra pane', reason: 'Customer asked', amount: '100' }),
      line({ id: 'open', kind: 'scope_change', description: 'Confirm the side door', reason: 'Added on site', amount: 'n/a' }),
    ]);

    expect(text).toContain('Scope change');
    expect(text).toContain('Description: Confirm the side door');
    expect(text).toContain('Amount:');
    expect(text).not.toMatch(/Price adjustment:\s*\$/);
    expect(text).not.toMatch(/Revised total:\s*\$/);
  });
});
