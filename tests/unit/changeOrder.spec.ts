import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';
import React from 'react';
import { pdf } from '@react-pdf/renderer';
import ChangeOrderPDF from '../../src/components/ChangeOrderPDF';
import type { FormData } from '../../src/lib/types';
import { extractPdfText } from '../helpers/pdfText';

const LOGO_SRC = `data:image/png;base64,${readFileSync(join(process.cwd(), 'public/assets/logo.png')).toString('base64')}`;

function form(cleaningType: FormData['cleaningType']): FormData {
  return {
    projectType: 'other',
    cleaningType,
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
    numberOfWindows: 12,
    numberOfLargeWindows: 8,
    numberOfHighAccessWindows: 0,
    numberOfDisplayCases: 0,
    windowCustomerType: 'commercial',
    windowServiceSides: 'exterior',
    projectName: 'Main Street Storefront',
    projectStreet: '100 Main St',
    projectCity: 'High Point',
    projectState: 'NC',
    projectZip: '27260',
    clientName: 'Dana Oak',
  };
}

async function renderChangeOrder(cleaningType: FormData['cleaningType']) {
  const element = React.createElement(ChangeOrderPDF, {
    formData: form(cleaningType),
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
      address: '100 Main St, High Point, NC 27260',
      email: 'dana@example.com',
      phone: '336-555-0100',
    },
    changeOrderInfo: {
      orderNumber: 'Q-2026-121',
      date: '10/17/2026',
      projectName: 'Main Street Storefront',
      projectAddress: '100 Main St, High Point, NC 27260',
    },
  });
  const blob = await pdf(element as React.ReactElement).toBlob();
  return extractPdfText(Buffer.from(await blob.arrayBuffer())).replace(/\s+/g, ' ');
}

test.describe('Window Cleaning blank change order', () => {
  test('prints the customer and property and leaves the price blank to write in', async () => {
    const text = await renderChangeOrder('window_cleaning_only');

    expect(text).toContain('CHANGE ORDER');
    expect(text).toContain('Original proposal: Q-2026-121');
    expect(text).toContain('Date: 10/17/2026');
    expect(text).toContain('Dana Oak');
    expect(text).toContain('336-555-0100');
    expect(text).toContain('dana@example.com');
    expect(text).toContain('Main Street Storefront');
    expect(text).toContain('100 Main St, High Point, NC 27260');
    expect(text).toContain('Description of additional work or reason for change');
    expect(text).toContain('Additional cost');
    expect(text).toContain('Revised contract total');
    expect(text).toContain('Customer approval');
    expect(text).toContain('Date of approval');
    expect(text).toContain('not authorized until the customer signs');
    expect(text).not.toMatch(/\$\d/);
    expect(text).not.toContain('Price adjustment');
    expect(text).not.toContain('Proposed Change');
  });
});
