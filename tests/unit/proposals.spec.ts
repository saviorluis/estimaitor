import { test, expect } from '@playwright/test';
import { calculateEstimate } from '../../src/lib/estimator';
import { getQuoteDocumentAmounts, getEstimateDisplayTotals, getAdjustedQuotePreTaxSubtotal } from '../../src/lib/utils';
import {
  buildProposal,
  formatProposalTerms,
  getProposalTemplate,
  normalizeWindowCounts,
  resolveServiceType,
  type ProposalDocument,
} from '../../src/lib/proposals';
import type { FormData, WindowCustomerType, WindowServiceSides } from '../../src/lib/types';

/**
 * Window-cleaning proposals. Expected dollar amounts are worked out by hand:
 * $18 standard, x1.6 large, x2.2 high-access for both sides. Interior only or exterior only
 * is half that window labor. Poor condition then multiplies window labor by 1.15.
 * $100 travel (first-hour bucket), $99 scheduling, $99 invoicing, $150 window-labor minimum
 * (only the shortfall is charged, after side, condition, and urgency), 20% markup, 7% NC tax.
 */

const NC_TAX = 0.07;

function form(overrides: Partial<FormData>): FormData {
  return {
    projectType: 'office',
    cleaningType: 'window_cleaning_only',
    squareFootage: 5000,
    hasVCT: false,
    vctSquareFootage: 0,
    distanceFromOffice: 12,
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

const STOREFRONT = form({
  projectName: 'Main Street Storefront',
  projectType: 'retail',
  windowCustomerType: 'commercial',
  windowServiceSides: 'exterior',
  numberOfWindows: 12,
  numberOfLargeWindows: 8,
  distanceFromOffice: 12,
});

const MIXED_EXTERIOR = form({
  projectName: 'Ridge Road Two Story',
  projectType: 'other',
  windowCustomerType: 'residential',
  windowServiceSides: 'exterior',
  numberOfWindows: 22,
  numberOfLargeWindows: 4,
  numberOfHighAccessWindows: 6,
  distanceFromOffice: 25,
});

const SMALL_JOB = form({
  projectName: 'Cottage',
  windowCustomerType: 'residential',
  windowServiceSides: 'exterior',
  numberOfWindows: 5,
  distanceFromOffice: 10,
});

const RESIDENTIAL_BOTH_SIDES = form({
  projectName: 'Oak Lane Residence',
  projectType: 'other',
  windowCustomerType: 'residential',
  windowServiceSides: 'interior_exterior',
  numberOfWindows: 18,
  numberOfLargeWindows: 2,
  distanceFromOffice: 15,
});

function proposalFor(formData: FormData, adjustmentPercent = 0): ProposalDocument {
  const estimate = calculateEstimate(formData, NC_TAX);
  const proposal = buildProposal(formData, estimate, {
    preTaxSubtotal: getAdjustedQuotePreTaxSubtotal(estimate, adjustmentPercent),
  });
  if (!proposal) throw new Error('expected a window-cleaning proposal');
  return proposal;
}

function pricedProposal(formData: FormData, adjustmentPercent = 0) {
  const p = proposalFor(formData, adjustmentPercent);
  if (!p.amounts) throw new Error('expected a priced proposal');
  return { ...p, amounts: p.amounts };
}

const amountsById = (proposal: ProposalDocument) =>
  Object.fromEntries(proposal.lineItems.map((item) => [item.id, item.amount]));

const sumCents = (proposal: ProposalDocument) =>
  proposal.lineItems.reduce((sum, item) => sum + Math.round((item.amount ?? 0) * 100), 0);

/** Every customer- and crew-facing string in the proposal. */
const allText = (proposal: ProposalDocument) =>
  JSON.stringify({ ...proposal, documents: undefined, serviceType: undefined });

test.describe('Window-only pricing (src/lib/estimator.ts)', () => {
  test('hidden square footage, project type, and mobilization settings cannot change window pricing', () => {
    for (const windows of [5, 10]) {
      const variants = [
        form({ numberOfWindows: windows, squareFootage: 0, projectType: 'other' }),
        form({ numberOfWindows: windows, squareFootage: 5000, projectType: 'retail' }),
        form({ numberOfWindows: windows, squareFootage: 50000, projectType: 'home_renovation' }),
        form({ numberOfWindows: windows, squareFootage: 2000, projectType: 'medical', mobilizationType: 'complex' }),
        form({ numberOfWindows: windows, squareFootage: 8000, projectType: 'office', mobilizationType: 'large', customMobilizationFee: 900 }),
      ].map((f) => calculateEstimate(f, NC_TAX));
      for (const e of variants) expect(e.totalPrice).toBe(variants[0].totalPrice);
    }
  });

  test('the $150 minimum charges only the shortfall in window labor', () => {
    // No side selection is both sides: 5 x $18 = $90 -> $60; 8 -> $144 -> $6; 9 -> $162 -> none
    expect(calculateEstimate(form({ numberOfWindows: 5 }), NC_TAX).mobilizationFee).toBe(60);
    expect(calculateEstimate(form({ numberOfWindows: 8 }), NC_TAX).mobilizationFee).toBe(6);
    expect(calculateEstimate(form({ numberOfWindows: 9 }), NC_TAX).mobilizationFee).toBe(0);
    expect(calculateEstimate(form({ numberOfWindows: 12, numberOfLargeWindows: 8 }), NC_TAX).mobilizationFee).toBe(0);
    // Urgency-adjusted labor counts toward the minimum: 90 x 1.24 = 111.60 -> 38.40
    expect(calculateEstimate(form({ numberOfWindows: 5, urgencyLevel: 7 }), NC_TAX).mobilizationFee).toBeCloseTo(38.4, 6);
  });

  test('other cleaning types keep size and project-type mobilization', () => {
    expect(calculateEstimate(form({ cleaningType: 'final' }), NC_TAX).mobilizationFee).toBe(250);
    expect(calculateEstimate(form({ cleaningType: 'final', projectType: 'medical' }), NC_TAX).mobilizationFee).toBe(500);
    expect(calculateEstimate(form({ cleaningType: 'final', squareFootage: 2000 }), NC_TAX).mobilizationFee).toBe(150);
  });

  test('window counts entered as text price the same as numbers', () => {
    const asText = form({
      numberOfWindows: '12' as unknown as number,
      numberOfLargeWindows: '8' as unknown as number,
      numberOfHighAccessWindows: '' as unknown as number,
    });
    const asNumbers = form({ numberOfWindows: 12, numberOfLargeWindows: 8, numberOfHighAccessWindows: 0 });
    expect(calculateEstimate(asText, NC_TAX)).toEqual(calculateEstimate(asNumbers, NC_TAX));
    expect(normalizeWindowCounts(asText)).toMatchObject({
      numberOfWindows: 12,
      numberOfLargeWindows: 8,
      numberOfHighAccessWindows: 0,
    });
  });
});

test.describe('Exterior Only jobs use the calculated price', () => {
  test('storefront: 12 standard + 8 large, no minimum charge', () => {
    const p = pricedProposal(STOREFRONT);
    // Exterior labor is half: 108 + 115.20 + 100 + 198 = 521.20; x1.2 = 625.44
    expect(amountsById(p)).toEqual({ standard_windows: 129.6, large_windows: 138.24, travel_scheduling: 357.6 });
    expect(p.amounts).toEqual({ subtotal: 625.44, taxRate: 0.07, salesTax: 43.78, total: 669.22 });
    expect(p.projectFacts).toEqual([
      { label: 'Service', value: 'Window Cleaning' },
      { label: 'Customer Type', value: 'Commercial / Storefront' },
      { label: 'Sides Cleaned', value: 'Exterior Only' },
      { label: 'Windows', value: '12 standard and 8 large (20 total)' },
    ]);
    expect(p.scopeOfWork).toEqual([
      'Clean the glass of 20 windows (12 standard and 8 large).',
      'Clean the exterior side of each window only.',
      'Remove typical paint specks, adhesive, stickers, and construction residue from the glass being cleaned.',
      'Wipe down window sills that can be reached safely.',
    ]);
    expect(p.excluded).toContain('Interior glass.');
  });

  test('mixed standard, large, and high-access windows', () => {
    const p = pricedProposal(MIXED_EXTERIOR);
    // Exterior labor is half: 198 + 57.60 + 118.80 + 100 + 198 = 672.40; x1.2 = 806.88
    expect(amountsById(p)).toEqual({
      standard_windows: 237.6,
      large_windows: 69.12,
      high_access_windows: 142.56,
      travel_scheduling: 357.6,
    });
    expect(p.amounts).toEqual({ subtotal: 806.88, taxRate: 0.07, salesTax: 56.48, total: 863.36 });
    expect(p.lineItems.find((i) => i.id === 'high_access_windows')).toMatchObject({
      quantity: 6,
      unit: 'windows',
      detail: 'Exterior glass, ladder or extension-pole access',
    });
    expect(p.scopeOfWork).toContain('Use ladders or extension poles to reach the 6 high-access windows listed.');
  });

  test('a small job shows the minimum charge as its own line', () => {
    const p = pricedProposal(SMALL_JOB);
    // Exterior labor is $45, so the minimum shortfall is $105. The customer total stays $575.23.
    expect(p.lineItems.map((i) => [i.id, i.amount])).toEqual([
      ['standard_windows', 54],
      ['minimum_charge', 126],
      ['travel_scheduling', 357.6],
    ]);
    expect(p.lineItems[1].description).toBe('Minimum service charge');
    expect(p.amounts).toEqual({ subtotal: 537.6, taxRate: 0.07, salesTax: 37.63, total: 575.23 });
  });

  for (const [name, fixture] of [
    ['storefront', STOREFRONT],
    ['mixed', MIXED_EXTERIOR],
    ['small', SMALL_JOB],
  ] as const) {
    test(`${name}: proposal totals equal the estimator's document and screen totals`, () => {
      const estimate = calculateEstimate(fixture, NC_TAX);
      const p = pricedProposal(fixture);
      const doc = getQuoteDocumentAmounts(fixture, estimate);
      expect(p.amounts.subtotal).toBe(doc.subtotal);
      expect(p.amounts.salesTax).toBe(doc.salesTax);
      expect(p.amounts.total).toBe(doc.finalTotal);
      expect(p.amounts.total).toBe(getEstimateDisplayTotals(fixture, estimate).total);
      expect(p.amounts.total).toBeCloseTo(estimate.totalPrice, 2);
      expect(sumCents(p)).toBe(Math.round(p.amounts.subtotal * 100));
    });
  }

  test('line items sum to the subtotal to the cent at every quote adjustment', () => {
    for (const fixture of [STOREFRONT, MIXED_EXTERIOR, SMALL_JOB, { ...SMALL_JOB, urgencyLevel: 7 }]) {
      for (let pct = -50; pct <= 100; pct += 3) {
        const p = pricedProposal(fixture, pct);
        expect(sumCents(p), `${pct}%`).toBe(Math.round(p.amounts.subtotal * 100));
        expect(Math.round((p.amounts.subtotal + p.amounts.salesTax) * 100)).toBe(Math.round(p.amounts.total * 100));
      }
    }
  });

  test('itemization does not depend on the hidden "Needs Window Cleaning" checkbox', () => {
    const off = proposalFor({ ...STOREFRONT, needsWindowCleaning: false });
    const on = proposalFor({ ...STOREFRONT, needsWindowCleaning: true });
    expect(on.lineItems).toEqual(off.lineItems);
    expect(on.amounts).toEqual(off.amounts);
  });

});

test.describe('Service sides and customer type: all six combinations', () => {
  const SIDES: Array<[WindowServiceSides, string, string]> = [
    ['exterior', 'Exterior Only', 'Clean the exterior side of each window only.'],
    ['interior', 'Interior Only', 'Clean the interior side of each window only.'],
    ['interior_exterior', 'Interior + Exterior', 'Clean both the interior and exterior side of each window.'],
  ];
  const CUSTOMERS: Array<[WindowCustomerType, string]> = [
    ['residential', 'Residential'],
    ['commercial', 'Commercial / Storefront'],
  ];

  for (const [sides, sidesLabel, sidesScope] of SIDES) {
    for (const [customer, customerLabel] of CUSTOMERS) {
      test(`${sidesLabel}, ${customerLabel}`, () => {
        const f = form({ windowServiceSides: sides, windowCustomerType: customer, numberOfWindows: 10, numberOfHighAccessWindows: 2 });
        const p = proposalFor(f);
        const assumptions = p.assumptions.join(' ');

        expect(p.projectFacts).toContainEqual({ label: 'Sides Cleaned', value: sidesLabel });
        expect(p.projectFacts).toContainEqual({ label: 'Customer Type', value: customerLabel });
        expect(p.scopeOfWork).toContain(sidesScope);
        expect(p.crew.en.facts).toContainEqual({ label: 'Sides', value: sidesLabel });
        expect(p.excluded.includes('Interior glass.')).toBe(sides === 'exterior');
        expect(p.excluded.includes('Exterior glass.')).toBe(sides === 'interior');
        expect(p.scopeOfWork.some((l) => l.includes('drop cloths'))).toBe(sides !== 'exterior');
        expect(assumptions.includes('dry weather')).toBe(sides !== 'interior');
        expect(assumptions.includes('pets')).toBe(customer === 'residential');
        expect(assumptions.includes('business hours')).toBe(customer === 'commercial');

        const fullRate = pricedProposal(form({ numberOfWindows: 10, numberOfHighAccessWindows: 2 }));
        if (sides === 'interior_exterior') {
          expect(p.amounts.total).toBe(fullRate.amounts.total);
        } else {
          expect(amountsById(p).standard_windows).toBe(amountsById(fullRate).standard_windows / 2);
          expect(amountsById(p).high_access_windows).toBe(amountsById(fullRate).high_access_windows / 2);
          expect(amountsById(p).travel_scheduling).toBe(amountsById(fullRate).travel_scheduling);
        }
        expect(p.lineItems.filter((i) => i.quantity).map((i) => [i.id, i.quantity])).toEqual([
          ['standard_windows', 10],
          ['high_access_windows', 2],
        ]);
      });
    }
  }
});

test.describe('Interior + Exterior uses the same calculated rates as Exterior Only', () => {
  test('states both sides and itemizes the estimator price', () => {
    const p = pricedProposal(RESIDENTIAL_BOTH_SIDES);
    // 18 x $18 + 2 x $28.80 = $381.60; + $298 travel/fees = $679.60; x 1.2 = $815.52
    expect(amountsById(p)).toEqual({ standard_windows: 388.8, large_windows: 69.12, travel_scheduling: 357.6 });
    expect(p.amounts).toEqual({ subtotal: 815.52, taxRate: 0.07, salesTax: 57.09, total: 872.61 });
    expect(p.projectFacts).toContainEqual({ label: 'Sides Cleaned', value: 'Interior + Exterior' });
    expect(p.scopeOfWork).toContain('Clean both the interior and exterior side of each window.');
    expect(p.lineItems.map((i) => i.detail)).toEqual(['Interior and exterior glass', 'Interior and exterior glass', undefined]);
  });
});

test.describe('Window-cleaning proposal text', () => {
  test('no raw service codes, square footage, or post-construction copy in any text', () => {
    for (const fixture of [STOREFRONT, MIXED_EXTERIOR, SMALL_JOB, RESIDENTIAL_BOTH_SIDES]) {
      const text = allText(proposalFor(fixture));
      expect(text).not.toMatch(/window_cleaning_only|interior_exterior|"(exterior|interior|residential|commercial)"/);
      expect(text).not.toMatch(/sq\.? ?ft|square f(oo|ee)t|pies cuadrados/i);
      expect(text).not.toMatch(/POST CONSTRUCTION|"CLEANING PROPOSAL"/);
      expect(text).not.toMatch(/punch[- ]list|touch-up|conference rooms|workstations/i);
      expect(text).not.toMatch(/\{\w+\}/);
      expect(text).not.toContain('5,000');
    }
  });

  test('counts entered as text are shown as numbers, not joined strings', () => {
    const p = proposalFor({
      ...STOREFRONT,
      numberOfWindows: '12' as unknown as number,
      numberOfLargeWindows: '8' as unknown as number,
    });
    expect(p.crew.en.facts.find((f) => f.label === 'Windows')?.value).toBe('12 standard and 8 large (20 total)');
    expect(p.crew.es.facts.find((f) => f.label === 'Ventanas')?.value).toBe('12 estándar y 8 grandes (20 en total)');
  });

  test('priority urgency is stated and its cost stays inside the window and travel lines', () => {
    const p = proposalFor({ ...STOREFRONT, urgencyLevel: 7 });
    expect(amountsById(p).standard_windows).toBeCloseTo(108 * 1.24 * 1.2, 2);
    expect(p.scopeOfWork).toContain('Priority scheduling (urgency level 7/10) is included in this price.');
    expect(p.projectFacts).toContainEqual({ label: 'Scheduling', value: 'Priority (level 7/10)' });
  });

  test('crew documents get English and Spanish window scope with exclusions and no punch list', () => {
    const p = proposalFor(MIXED_EXTERIOR);
    expect(p.crew.en.serviceLabel).toBe('Window Cleaning');
    expect(p.crew.en.scopeOfWork).toEqual(p.scopeOfWork);
    expect(p.crew.en.excluded).toEqual(p.excluded);
    expect(p.crew.en.facts.find((f) => f.label === 'Windows')?.value).toBe(p.projectFacts.find((f) => f.label === 'Windows')?.value);
    expect(p.crew.es.serviceLabel).toBe('Limpieza de Ventanas');
    expect(p.crew.es.scopeOfWork[0]).toBe('Limpiar el vidrio de 32 ventanas (22 estándar, 4 grandes y 6 de difícil acceso).');
    expect(p.crew.es.facts).toContainEqual({ label: 'Lados', value: 'Solo exterior' });
    expect(p.crew.es.scopeOfWork).toContain('Retirar motas de pintura, adhesivo, calcomanías y residuos de construcción normales del vidrio que se limpia.');
    expect(p.crew.es.excluded).toContain('Contaminación severa, o residuos que puedan dañar el vidrio. Esas condiciones requieren una revisión aparte antes de realizar el trabajo.');
    expect(p.excluded).not.toContain('Paint, adhesive, sticker, and construction-debris removal.');
    expect(p.crew.es.sections.map((s) => s.title)).toEqual(['Revisión de Calidad']);
  });

  test('documents, terms and invoice payment terms come from the template', () => {
    const p = proposalFor(STOREFRONT);
    expect(p.documents).toEqual(['quote', 'work_order', 'work_order_es', 'purchase_order', 'invoice', 'change_order']);
    expect(p.showCapabilityStatement).toBe(false);
    expect(p.coverTitle).toEqual(['WINDOW CLEANING', 'PROPOSAL']);
    expect(formatProposalTerms(p.terms).split('\n')[0]).toMatch(/^1\. Payment: Payment is due on completion\./);
    expect(p.invoicePaymentTerms).toContain('within 15 days of the invoice date');
    expect(p.missingInputs).toEqual([]);
  });
});

test.describe('One side and poor condition', () => {
  test('one side is half the window labor and leaves travel and fees unchanged', () => {
    const both = pricedProposal(form({
      windowServiceSides: 'interior_exterior',
      numberOfWindows: 12,
      numberOfLargeWindows: 8,
      numberOfHighAccessWindows: 3,
    }));
    for (const sides of ['exterior', 'interior'] as const) {
      const one = pricedProposal(form({
        windowServiceSides: sides,
        numberOfWindows: 12,
        numberOfLargeWindows: 8,
        numberOfHighAccessWindows: 3,
      }));
      expect(amountsById(one).standard_windows).toBe(amountsById(both).standard_windows / 2);
      expect(amountsById(one).large_windows).toBe(amountsById(both).large_windows / 2);
      expect(amountsById(one).high_access_windows).toBe(amountsById(both).high_access_windows / 2);
      expect(amountsById(one).travel_scheduling).toBe(amountsById(both).travel_scheduling);
      expect(one.amounts.total).not.toBe(both.amounts.total);
    }
  });

  test('poor condition adds 15% to window labor only, after the side factor', () => {
    const standard = pricedProposal(STOREFRONT);
    const poor = pricedProposal({ ...STOREFRONT, windowCondition: 'poor' });
    // Exterior labor 223.20 x 1.15 = 256.68; + 298 fees = 554.68; x1.2 = 665.62
    expect(amountsById(poor)).toEqual({ standard_windows: 149.04, large_windows: 158.98, travel_scheduling: 357.6 });
    expect(poor.amounts).toEqual({ subtotal: 665.62, taxRate: 0.07, salesTax: 46.59, total: 712.21 });
    expect(amountsById(poor).travel_scheduling).toBe(amountsById(standard).travel_scheduling);
    expect(calculateEstimate({ ...STOREFRONT, windowCondition: 'poor' }, NC_TAX).mobilizationFee).toBe(0);
  });

  test('the $150 floor hides poor condition until adjusted labor passes $150', () => {
    const five = form({ windowServiceSides: 'interior_exterior', numberOfWindows: 5 });
    const standard = pricedProposal(five);
    const poor = pricedProposal({ ...five, windowCondition: 'poor' });
    expect(calculateEstimate({ ...five, windowCondition: 'poor' }, NC_TAX).mobilizationFee).toBeCloseTo(46.5, 6);
    expect(poor.amounts.total).toBe(standard.amounts.total);
    expect(poor.amounts.total).toBe(575.23);

    const eight = form({ windowServiceSides: 'interior_exterior', numberOfWindows: 8 });
    const released = pricedProposal({ ...eight, windowCondition: 'poor' });
    // 8 x $18 x 1.15 = $165.60, so the floor no longer applies.
    expect(calculateEstimate({ ...eight, windowCondition: 'poor' }, NC_TAX).mobilizationFee).toBe(0);
    expect(amountsById(released)).toEqual({ standard_windows: 198.72, travel_scheduling: 357.6 });
    expect(released.amounts).toEqual({ subtotal: 556.32, taxRate: 0.07, salesTax: 38.94, total: 595.26 });
  });

  test('urgency still multiplies the adjusted window labor before the floor', () => {
    const poorSmall = form({ windowServiceSides: 'exterior', windowCondition: 'poor', numberOfWindows: 5, urgencyLevel: 7 });
    // 5 x $9 x 1.15 x 1.24 = $64.17; shortfall $85.83
    expect(calculateEstimate(poorSmall, NC_TAX).windowCleaningCost).toBeCloseTo(51.75, 6);
    expect(calculateEstimate(poorSmall, NC_TAX).mobilizationFee).toBeCloseTo(85.83, 6);
    const priced = pricedProposal(poorSmall);
    expect(priced.lineItems.map((item) => item.id)).not.toContain('additional_services');
    expect(priced.amounts.total).toBe(getQuoteDocumentAmounts(poorSmall, calculateEstimate(poorSmall, NC_TAX)).finalTotal);
  });

  test('the customer proposal shows the adjusted price without the internal condition', () => {
    const poor = proposalFor({ ...STOREFRONT, windowCondition: 'poor' });
    const text = allText(poor);
    expect(poor.scopeOfWork).toContain('Remove typical paint specks, adhesive, stickers, and construction residue from the glass being cleaned.');
    expect(poor.excluded).toContain('Severe contamination, or residue that could damage the glass. Those conditions need a separate review before any work.');
    expect(text).not.toMatch(/Poor Condition|Standard Condition|Window Condition|surcharge/i);
    expect(text).not.toMatch(/15%/);
    expect(poor.lineItems.map((item) => item.description).join(' ')).not.toMatch(/condition|surcharge/i);
    expect(poor.projectFacts.map((fact) => fact.label)).not.toContain('Window Condition');
    expect(poor.amounts.total).toBe(712.21);
  });
});

test.describe('Saved estimates from before the window template', () => {
  /** Shape of a window-only entry saved earlier: hidden default sq ft, office type, unticked checkbox, no sides or customer type. */
  const legacy = form({
    projectType: 'office',
    squareFootage: 5000,
    needsWindowCleaning: false,
    numberOfWindows: '30' as unknown as number,
    numberOfLargeWindows: 10,
    numberOfHighAccessWindows: 5,
    distanceFromOffice: 20,
  });

  test('still opens, lists every window type, asks for the missing inputs, and still prices the windows', () => {
    const p = proposalFor(legacy);
    expect(p.lineItems.filter((i) => i.quantity).map((i) => [i.id, i.quantity])).toEqual([
      ['standard_windows', 30],
      ['large_windows', 10],
      ['high_access_windows', 5],
    ]);
    expect(p.amounts.total).toBeGreaterThan(0);
    expect(calculateEstimate(legacy, NC_TAX).windowCleaningCost).toBe(1026);
    expect(p.missingInputs).toEqual([
      'Service sides (Exterior Only, Interior Only, or Interior + Exterior)',
      'Customer type (Residential or Commercial / Storefront)',
    ]);
  });

  test('does not state or imply which sides are cleaned', () => {
    const p = proposalFor(legacy);
    expect(p.projectFacts.map((f) => f.label)).toEqual(['Service', 'Windows']);
    const customerText = [...p.scopeOfWork, ...p.included, ...p.excluded, ...p.assumptions].join(' ');
    expect(customerText).not.toMatch(/exterior side|interior side|Interior glass\.|Exterior glass\.|drop cloths|dry weather/);
    expect(p.lineItems.every((i) => !/glass/.test(i.detail || ''))).toBe(true);
    expect(p.crew.en.facts).toContainEqual({ label: 'Sides', value: 'Not specified - confirm with supervisor' });
  });
});

test.describe('Services not yet on templates keep their existing documents', () => {
  test('cleaning and pressure washing have no proposal template in Phase 1', () => {
    for (const cleaningType of ['final', 'rough_final', 'vct_only', 'pressure_washing'] as const) {
      const f = form({ cleaningType });
      expect(getProposalTemplate(f), cleaningType).toBeNull();
      expect(buildProposal(f, calculateEstimate(f, NC_TAX)), cleaningType).toBeNull();
    }
    expect(resolveServiceType({ cleaningType: 'window_cleaning_only' })).toBe('window_cleaning');
    expect(resolveServiceType({ cleaningType: 'pressure_washing' })).toBe('pressure_washing');
    expect(resolveServiceType({ cleaningType: 'final' })).toBe('cleaning');
  });
});
