/** Combined state + average local sales tax (Tax Foundation, July 1 2025). NC stays 7%. */

export const DEFAULT_TAX_STATE = 'NC';

export const US_STATES: { code: string; name: string }[] = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'DC', name: 'District of Columbia' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
];

/** Combined average rate by state code. States with no sales tax are 0. */
export const STATE_SALES_TAX_RATE: Record<string, number> = {
  AL: 0.0944,
  AK: 0.0182,
  AZ: 0.0852,
  AR: 0.0948,
  CA: 0.0898,
  CO: 0.0786,
  CT: 0.0635,
  DE: 0,
  DC: 0.06,
  FL: 0.0702,
  GA: 0.0744,
  HI: 0.045,
  ID: 0.0603,
  IL: 0.0892,
  IN: 0.07,
  IA: 0.0694,
  KS: 0.0878,
  KY: 0.06,
  LA: 0.1011,
  ME: 0.055,
  MD: 0.06,
  MA: 0.0625,
  MI: 0.06,
  MN: 0.0813,
  MS: 0.0706,
  MO: 0.0841,
  MT: 0,
  NE: 0.0698,
  NV: 0.0824,
  NH: 0,
  NJ: 0.066,
  NM: 0.0767,
  NY: 0.0854,
  NC: 0.07,
  ND: 0.0708,
  OH: 0.073,
  OK: 0.0905,
  OR: 0,
  PA: 0.0634,
  RI: 0.07,
  SC: 0.0749,
  SD: 0.0611,
  TN: 0.0961,
  TX: 0.082,
  UT: 0.0742,
  VT: 0.0639,
  VA: 0.0577,
  WA: 0.0947,
  WV: 0.0658,
  WI: 0.0572,
  WY: 0.0556,
};

export const SALES_TAX_RATE = STATE_SALES_TAX_RATE[DEFAULT_TAX_STATE];

const NAME_TO_CODE: Record<string, string> = Object.fromEntries(
  US_STATES.flatMap(({ code, name }) => [
    [name.toUpperCase(), code],
    [code, code],
  ])
);

export function normalizeStateCode(value?: string): string {
  const raw = (value || '').trim().toUpperCase().replace(/\./g, '');
  if (!raw) return DEFAULT_TAX_STATE;
  if (STATE_SALES_TAX_RATE[raw] !== undefined) return raw;
  const mapped = NAME_TO_CODE[raw];
  if (mapped) return mapped;
  return DEFAULT_TAX_STATE;
}

export function getSalesTaxRate(state?: string): number {
  const code = normalizeStateCode(state);
  return STATE_SALES_TAX_RATE[code] ?? SALES_TAX_RATE;
}

export function formatSalesTaxPercent(rate: number): string {
  const pct = rate * 100;
  if (pct === 0) return '0%';
  const rounded = Math.round(pct * 1000) / 1000;
  if (Number.isInteger(rounded)) return `${rounded}%`;
  return `${parseFloat(rounded.toFixed(2))}%`;
}

export function resolveEstimateSalesTaxRate(estimate?: { salesTaxRate?: number } | null): number {
  if (typeof estimate?.salesTaxRate === 'number' && Number.isFinite(estimate.salesTaxRate)) {
    return estimate.salesTaxRate;
  }
  return SALES_TAX_RATE;
}
