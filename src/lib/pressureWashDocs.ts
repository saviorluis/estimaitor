import { FormData } from './types';

export function isPressureWashingJob(formData: FormData): boolean {
  return formData.cleaningType === 'pressure_washing';
}

const SERVICE_LABELS: Record<string, string> = {
  soft_wash: 'Soft wash',
  roof_wash: 'Roof wash',
  driveway: 'Driveway wash',
  deck: 'Deck / Trex wash',
  daily_rate: 'Daily rate (reference)',
};

export function getPressureWashingServiceLabel(type?: string): string {
  return SERVICE_LABELS[type || ''] || 'Pressure washing';
}

function serviceScopeLines(formData: FormData): string[] {
  const area = Math.max(0, formData.pressureWashingArea || 0);
  const sq = area.toLocaleString();
  const type = formData.pressureWashingType || 'soft_wash';

  switch (type) {
    case 'roof_wash':
      return [
        `Roof wash of ${sq} sq ft of roof surface only (not lot size).`,
        'Apply roof-cleaning solution and rinse. Gutters, downspouts, siding, windows, and interiors are not included unless listed below.',
      ];
    case 'driveway':
      return [
        `Pressure wash of ${sq} sq ft of driveway/concrete (or specified hardscape) surface.`,
        'Oil, rust, paint, and tire marks may lighten but are not guaranteed removed unless written on this quote.',
      ];
    case 'deck':
      return [
        `Wash of ${sq} sq ft of deck / Trex surface.`,
        'Does not include sanding, staining, sealing, fastener repair, or board replacement.',
      ];
    case 'daily_rate':
      return [
        `One crew-day of pressure washing as directed on site (reference daily rate), covering approximately ${sq} sq ft if an area was entered.`,
        'Work beyond a standard crew-day, or surfaces not directed that day, is extra.',
      ];
    case 'soft_wash':
    default:
      return [
        `Soft wash of ${sq} sq ft of washable building exterior (siding/walls or other specified vertical surface — not lot or building interior size).`,
        'Low-pressure application of cleaning solution and rinse. This is not a high-pressure blast of siding and is not a post-construction interior clean.',
      ];
  }
}

export function getPressureWashingScopeLines(formData: FormData): string[] {
  const lines = [
    ...serviceScopeLines(formData),
    'Includes labor, equipment, water use from the on-site spigot, chemicals as specified, rinse, and travel as quoted.',
    'Protect adjacent surfaces as practical, rinse thoroughly, and leave the work area reasonably free of wash residue.',
  ];
  if (formData.needsChimneyWash && (formData.chimneyCount || 0) > 0) {
    const count = formData.chimneyCount || 0;
    lines.push(
      `Exterior chimney wash only: ${count} chimney${count === 1 ? '' : 's'}. Does not include flue, cap, or interior chimney work.`
    );
  }
  return lines;
}

export function getPressureWashingScopeText(formData: FormData): string {
  return getPressureWashingScopeLines(formData).join('\n');
}

export function getPressureWashingLineTitle(formData: FormData): string {
  const area = Math.max(0, formData.pressureWashingArea || 0);
  return `${getPressureWashingServiceLabel(formData.pressureWashingType)} — ${area.toLocaleString()} sq ft`;
}

/** Default T&Cs for pressure/soft-wash quotes (not post-construction interior cleaning). */
export const PRESSURE_WASHING_QUOTE_TERMS = `1. Payment: Due upon completion unless otherwise noted on the invoice. If invoiced, Net 15 from invoice date. A 10% late fee may be added after the due date.
2. Cancellation: 48-hour notice required to cancel or reschedule without charge.
3. Site not ready: If we arrive and cannot perform the wash (no working water, locked access, vehicles or obstacles on the quoted surface, unsafe conditions), a minimum $250 return-trip fee applies.
4. Scope: This quote covers only the pressure/soft-wash service, square footage, and add-ons listed. Quoted area is washable surface, not lot size. This is not an interior post-construction clean.
5. Exclusions: Windows, gutters, interiors, roofs, driveways, decks, chimneys, stain/oil/rust/paint removal, repairs, and sealing are extra unless written on this quote.
6. Access: Client must provide clear, safe access to all quoted surfaces, move vehicles and obstacles, and close windows and doors.
7. Water: Client provides a working hose bib/spigot and sufficient water on site unless water supply is quoted separately.
8. Weather: Work may be postponed for rain, freeze, or unsafe wind. Weather delays are not a contractor cancellation.
9. Existing conditions: Washing may reveal oxidation, failing paint, or loose caulk. That is not damage from this service. Contractor will take reasonable care with plants and adjacent surfaces; pre-wet sensitive landscaping if concerned about runoff.
10. Quote validity: This quote is valid for 30 days from the date issued.`;

export const PRESSURE_WASHING_INVOICE_PAYMENT_TERMS =
  'Due upon completion. If invoiced, Net 15 from invoice date. A late payment fee of 10% of the invoice total may be added if payment is not received by the due date.';

export const PRESSURE_WASHING_QUOTE_NOTES =
  'This quote is for the exterior pressure/soft-wash scope listed (washable surface sq ft and service type). It includes labor, equipment, chemicals as specified, and travel. It is not an interior post-construction cleaning bid.';
