import { test, expect } from '@playwright/test';
import React from 'react';
import { pdf } from '@react-pdf/renderer';
import ContractPDF from '../../src/components/ContractPDF';
import '../../src/components/QuotePDF';
import { pdfContainsRgbPixel, pdfImageCount, rgbPng } from '../helpers/pdfImage';

const company = {
  name: 'North Glass Clean',
  address: '10 Market St',
  city: 'High Point, NC 27265',
  phone: '(336) 555-0199',
  email: 'office@northglass.example',
  website: 'northglass.example',
};

const formData = {
  facilityName: 'Sample Office Park',
  facilityAddress: '100 Example Way',
  city: 'Greensboro',
  state: 'NC',
  contactName: 'Pat Sample',
  contactEmail: 'pat.sample@example.com',
  contactPhone: '(336) 555-0100',
  buildingType: 'office' as const,
  measurementType: 'square_footage' as const,
  squareFootage: 5000,
  bathroomCount: 2,
  floorType: 'mixed' as const,
  serviceFrequency: 'weekly' as const,
  serviceDays: ['monday'],
  serviceTime: 'evening' as const,
  contractLength: 12 as const,
  startDate: '2026-06-01',
};

const contractData = {
  monthlyRate: 4340,
  annualRate: 49476,
  pricePerSqFt: 0.87,
  serviceScope: {
    daily: ['Empty trash'],
    weekly: ['Vacuum floors'],
    monthly: ['Clean vents'],
    quarterly: ['Strip floors'],
  },
  schedule: {
    frequency: 'weekly',
    days: ['monday'],
    time: 'evening',
    estimatedHours: 4,
  },
  contractTerms: {
    length: 12,
    startDate: '2026-06-01',
    monthlyRate: 4340,
    annualDiscount: 5,
    escalationClause: '3% annual increase effective on contract anniversary date',
  },
};

async function renderContract(logo: Buffer) {
  const element = React.createElement(ContractPDF, {
    contractData,
    formData,
    companyInfo: { ...company, logoSrc: `data:image/png;base64,${logo.toString('base64')}` },
    contractNumber: 'CONTRACT-2026-100001',
  });
  const blob = await pdf(element as React.ReactElement).toBlob();
  return Buffer.from(await blob.arrayBuffer());
}

test('janitorial contract PDF embeds the logo passed from company settings', async () => {
  const selected: [number, number, number] = [0x11, 0xe4, 0x7a];
  const other: [number, number, number] = [0x22, 0x10, 0x9b];
  const rendered = await renderContract(rgbPng(...selected));

  expect(rendered.subarray(0, 5).toString('latin1')).toBe('%PDF-');
  expect(pdfImageCount(rendered)).toBe(1);
  expect(pdfContainsRgbPixel(rendered, selected)).toBe(true);
  expect(pdfContainsRgbPixel(rendered, other)).toBe(false);
});
