import { test, expect } from '@playwright/test';
import { calculateEstimate } from '../../src/lib/estimator';
import { calculateHourlyTravelFee, calculateMobilizationFee } from '../../src/lib/constants';
import { getSalesTaxRate } from '../../src/lib/salesTax';
import { getQuotePreTaxSubtotal } from '../../src/lib/utils';
import type { FormData } from '../../src/lib/types';

/**
 * Expected values are worked out by hand from the published rate rules
 * (base $0.18/sq ft x project x cleaning multiplier, $99 scheduling + $99 invoicing,
 * size/complexity mobilization, hourly travel buckets, 20% markup, home-state tax),
 * written as literal arithmetic so a rate change in src/lib/constants.ts fails loudly.
 */

const NC_TAX = 0.07;

function form(overrides: Partial<FormData>): FormData {
  return {
    projectType: 'office',
    cleaningType: 'final',
    squareFootage: 5000,
    hasVCT: false,
    vctSquareFootage: 0,
    distanceFromOffice: 20,
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
    numberOfWindows: 0,
    numberOfLargeWindows: 0,
    numberOfHighAccessWindows: 0,
    numberOfDisplayCases: 0,
    ...overrides,
  };
}

function totals(totalBeforeMarkup: number, taxRate = NC_TAX) {
  const markup = totalBeforeMarkup * 0.2;
  const salesTax = (totalBeforeMarkup + markup) * taxRate;
  return { totalBeforeMarkup, markup, salesTax, totalPrice: totalBeforeMarkup + markup + salesTax };
}

function expectMoney(actual: number, expected: number) {
  expect(actual).toBeCloseTo(expected, 6);
}

test.describe('Final cleaning calculator (src/lib/estimator.ts)', () => {
  test('office, final clean, 5,000 sq ft, 20 mi, NC tax', () => {
    const e = calculateEstimate(form({}), NC_TAX);
    const base = 5000 * 0.18 * 1.0 * 1.2; // office x final
    const travel = 100; // 20 mi one-way = 0.33 h -> first-hour bucket
    const fees = 99 + 99 + 250; // scheduling + invoicing + medium mobilization (2,501-10,000 sq ft)
    const t = totals(base + travel + fees);

    expectMoney(e.basePrice, 1080);
    expectMoney(e.travelCost, travel);
    expect(e.mobilizationFee).toBe(250);
    expectMoney(e.totalBeforeMarkup, t.totalBeforeMarkup);
    expectMoney(e.markup, t.markup);
    expectMoney(e.salesTax, t.salesTax);
    expectMoney(e.totalPrice, 2090.352);
    expectMoney(e.totalPrice, t.totalPrice);
    expect(e.salesTaxRate).toBe(0.07);
    expect(e.estimatedHours).toBe(6); // 5 h base x 1.0 office x 1.2 final
    expect(e.timeToCompleteInDays).toBe(1);
    expectMoney(e.pricePerSquareFoot, 2090.352 / 5000);
    expectMoney(getQuotePreTaxSubtotal(e), t.totalBeforeMarkup + t.markup);
  });

  test('restaurant rough+final with VCT carved out of building, windows, urgency 5, 60 mi', () => {
    const e = calculateEstimate(
      form({
        projectType: 'restaurant',
        cleaningType: 'rough_final',
        squareFootage: 3500,
        hasVCT: true,
        vctSquareFootage: 2000,
        distanceFromOffice: 60,
        urgencyLevel: 5,
        needsWindowCleaning: true,
        numberOfWindows: 10,
        numberOfLargeWindows: 4,
        numberOfHighAccessWindows: 2,
      }),
      NC_TAX
    );
    const principal = 3500 - 2000;
    const base = principal * 0.18 * 1.5 * 1.4; // restaurant x rough_final
    const vctRate = 2.2 - ((2000 - 1000) / 4000) * 0.7; // $2.20 -> $1.50 sliding scale
    const vct = 2000 * vctRate;
    const windows = 10 * 18 + 4 * 18 * 1.6 + 2 * 18 * 2.2;
    const travel = 200; // 60 mi one-way blends to 67.5 billable mi = 1.125 h -> 2 hour buckets
    const labor = (base + vct + travel + windows) * 1.16; // urgency 5
    const fees = 99 + 99 + 250;
    const t = totals(labor + fees);

    expect(e.principalSquareFootage).toBe(1500);
    expect(e.billedVctSquareFootage).toBe(2000);
    expectMoney(e.basePrice, 567);
    expectMoney(e.vctCost, 4050);
    expectMoney(e.windowCleaningCost, 374.4);
    expectMoney(e.travelCost, travel);
    expect(e.urgencyMultiplier).toBe(1.16);
    expectMoney(e.totalPrice, t.totalPrice);
    expectMoney(e.totalPrice, 8307.510816);
    // Hours: 1.5 h x 1.3 restaurant x 1.6 rough_final = 3.12 -> rounded up to 3.25,
    // + 20 window units / 5 per hour = 4 h, + 2,000 VCT sq ft / 400 per hour = 5 h
    expect(e.estimatedHours).toBe(12.25);
    expect(e.timeToCompleteInDays).toBe(2);
    expectMoney(e.pricePerSquareFoot, 8307.510816 / 3500);
  });

  test('VCT larger than the building is capped at building size', () => {
    const e = calculateEstimate(form({ hasVCT: true, vctSquareFootage: 8000 }), NC_TAX);
    expect(e.billedVctSquareFootage).toBe(5000);
    expect(e.principalSquareFootage).toBe(0);
    expectMoney(e.basePrice, 0);
    expectMoney(e.vctCost, 5000 * 1.5);
  });

  test('window cleaning only prices windows with no base cleaning', () => {
    const e = calculateEstimate(
      form({
        cleaningType: 'window_cleaning_only',
        squareFootage: 0,
        numberOfWindows: 30,
        numberOfLargeWindows: 10,
        numberOfHighAccessWindows: 5,
      }),
      NC_TAX
    );
    const windows = 30 * 18 + 10 * 18 * 1.6 + 5 * 18 * 2.2;
    const t = totals(windows + 100 + 99 + 99 + 150);
    expectMoney(e.basePrice, 0);
    expectMoney(e.windowCleaningCost, 1026);
    expect(e.mobilizationFee).toBe(150);
    expectMoney(e.totalPrice, t.totalPrice);
    expectMoney(e.totalPrice, 1892.616);
    expect(e.estimatedHours).toBe(11); // (30 + 10x1.5 + 5x2) / 5 per hour
  });

  test('home-state tax comes from Settings: OR (no sales tax) vs NC', () => {
    expect(getSalesTaxRate('NC')).toBe(0.07);
    expect(getSalesTaxRate('OR')).toBe(0);
    const e = calculateEstimate(form({}), getSalesTaxRate('OR'));
    expectMoney(e.salesTax, 0);
    expectMoney(e.totalPrice, 1953.6);
  });

  test('markup off removes the 20% professional markup only', () => {
    const e = calculateEstimate(form({ applyMarkup: false }), NC_TAX);
    expectMoney(e.markup, 0);
    expectMoney(e.totalPrice, 1628 * 1.07);
  });
});

test.describe('Pressure washing calculator (src/lib/estimator.ts)', () => {
  const pw = (overrides: Partial<FormData>) =>
    form({
      projectType: 'other',
      cleaningType: 'pressure_washing',
      squareFootage: 0,
      numberOfCleaners: 2,
      numberOfNights: 0,
      needsPressureWashing: true,
      ...overrides,
    });

  test('soft wash 2,000 sq ft + 1 chimney, 20 mi', () => {
    const e = calculateEstimate(
      pw({ pressureWashingArea: 2000, needsChimneyWash: true, chimneyCount: 1 }),
      NC_TAX
    );
    const t = totals(2000 * 0.18 + 95 + 100 + 99 + 99 + 150);
    expectMoney(e.basePrice, 0);
    expectMoney(e.pressureWashingCost, 360);
    expectMoney(e.chimneyWashCost, 95);
    expect(e.mobilizationFee).toBe(150);
    expectMoney(e.totalPrice, t.totalPrice);
    expectMoney(e.totalPrice, 1159.452);
  });

  test('soft wash minimum charge is $235', () => {
    const e = calculateEstimate(pw({ pressureWashingArea: 1000 }), NC_TAX);
    expectMoney(e.pressureWashingCost, 235);
  });

  test('roof, driveway, deck, and daily-rate pricing', () => {
    expectMoney(calculateEstimate(pw({ pressureWashingArea: 1500, pressureWashingType: 'roof_wash' }), NC_TAX).pressureWashingCost, 750);
    expectMoney(calculateEstimate(pw({ pressureWashingArea: 1000, pressureWashingType: 'driveway' }), NC_TAX).pressureWashingCost, 200);
    expectMoney(calculateEstimate(pw({ pressureWashingArea: 300, pressureWashingType: 'deck' }), NC_TAX).pressureWashingCost, 300);
    expectMoney(calculateEstimate(pw({ pressureWashingArea: 1, pressureWashingType: 'daily_rate' }), NC_TAX).pressureWashingCost, 1800);
  });
});

test.describe('Shared fee rules (src/lib/constants.ts)', () => {
  test('hourly travel buckets', () => {
    expect(calculateHourlyTravelFee(0)).toBe(100);
    expect(calculateHourlyTravelFee(40)).toBe(100); // local radius, 0.67 h
    expect(calculateHourlyTravelFee(60)).toBe(200);
    expect(calculateHourlyTravelFee(200)).toBe(700); // full round trip 400 mi = 6.67 h -> 7 buckets
  });

  test('mobilization by size and complexity', () => {
    expect(calculateMobilizationFee(2500, 'office')).toBe(150);
    expect(calculateMobilizationFee(2501, 'office')).toBe(250);
    expect(calculateMobilizationFee(10001, 'office')).toBe(400);
    expect(calculateMobilizationFee(1000, 'medical')).toBe(500);
    expect(calculateMobilizationFee(1000, 'luxury_garage')).toBe(500);
  });
});
