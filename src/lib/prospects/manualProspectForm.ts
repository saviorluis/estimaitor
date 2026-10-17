import { US_STATES } from '@/lib/salesTax';
import {
  COUNT_CONFIDENCES,
  MANUAL_PROPERTY_TYPES,
  MANUAL_SOURCE_TYPES,
  PROSPECT_STATUSES,
  type AnyProspect,
  type CountConfidence,
  type ManualPropertyType,
  type ManualProspect,
  type ManualSourceType,
  type ProspectStatus,
} from './types';

/** Everything the form edits, as the strings the inputs hold. */
export interface ProspectDraft {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  propertyType: ManualPropertyType | '';
  windowCount: string;
  countConfidence: CountConfidence | '';
  sourceType: ManualSourceType | '';
  sourceUrl: string;
  sourceNote: string;
  researchedAt: string;
  status: ProspectStatus;
  internalNotes: string;
  lat: string;
  lng: string;
  stories: string;
  squareFootage: string;
  accessNotes: string;
  exteriorScope: string;
  interiorScope: string;
  priceLow: string;
  priceHigh: string;
  referenceUrls: string;
  followUpAt: string;
}

export type DraftField = keyof ProspectDraft;
export type DraftErrors = Partial<Record<DraftField, string>>;
export type ManualProspectFields = Omit<ManualProspect, 'kind' | 'id' | 'dataOrigin' | 'createdAt' | 'updatedAt'>;

export const LIMITS = {
  name: 120,
  street: 120,
  city: 60,
  shortNote: 500,
  longNote: 2000,
  referenceUrls: 10,
  windowCount: 100_000,
  stories: 200,
  squareFootage: 10_000_000,
  price: 10_000_000,
};

export const localIsoDate = (date: Date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export function emptyDraft(today: string = localIsoDate()): ProspectDraft {
  return {
    name: '',
    street: '',
    city: '',
    state: 'NC',
    zip: '',
    propertyType: '',
    windowCount: '',
    countConfidence: '',
    sourceType: '',
    sourceUrl: '',
    sourceNote: '',
    researchedAt: today,
    status: 'new',
    internalNotes: '',
    lat: '',
    lng: '',
    stories: '',
    squareFootage: '',
    accessNotes: '',
    exteriorScope: '',
    interiorScope: '',
    priceLow: '',
    priceHigh: '',
    referenceUrls: '',
    followUpAt: '',
  };
}

const str = (n: number | undefined) => (n === undefined ? '' : String(n));

export function draftFromProspect(p: ManualProspect): ProspectDraft {
  return {
    name: p.name || '',
    street: p.address.line1,
    city: p.address.city,
    state: p.address.state,
    zip: p.address.zip,
    propertyType: p.propertyType,
    windowCount: str(p.windowCount),
    countConfidence: p.countConfidence || '',
    sourceType: p.source.type,
    sourceUrl: p.source.url || '',
    sourceNote: p.source.note || '',
    researchedAt: p.researchedAt,
    status: p.status,
    internalNotes: p.internalNotes || '',
    lat: str(p.coordinates?.lat),
    lng: str(p.coordinates?.lng),
    stories: str(p.stories),
    squareFootage: str(p.squareFootage),
    accessNotes: p.accessNotes || '',
    exteriorScope: p.exteriorScope || '',
    interiorScope: p.interiorScope || '',
    priceLow: str(p.preliminaryPrice?.low),
    priceHigh: str(p.preliminaryPrice?.high),
    referenceUrls: p.referenceUrls.join('\n'),
    followUpAt: p.followUpAt || '',
  };
}

const STATE_CODES = new Set(US_STATES.map((s) => s.code));
const ZIP_PATTERN = /^\d{5}(-\d{4})?$/;
const CITY_PATTERN = /^[A-Za-z][A-Za-z .'-]*$/;
const HOUSE_NUMBER_PATTERN = /^\d+[A-Za-z]?(-\d+)?\s+\S/;

function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

/** Only plain web links are accepted, so a stored link can never run script when clicked. */
export function isWebUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === 'https:' || url.protocol === 'http:') && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function parseNumber(value: string, { integer }: { integer: boolean }): number | null {
  const cleaned = value.replace(/[,$\s]/g, '');
  if (!cleaned || !/^-?\d*\.?\d+$/.test(cleaned)) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || (integer && !Number.isInteger(n))) return null;
  return n;
}

export const splitReferenceUrls = (value: string) =>
  value
    .split(/\n+/)
    .map((u) => u.trim())
    .filter(Boolean);

export interface ValidationResult {
  errors: DraftErrors;
  /** Non-blocking advice, such as a street with no house number. */
  warnings: DraftErrors;
  fields?: ManualProspectFields;
}

export function validateDraft(draft: ProspectDraft, today: string = localIsoDate()): ValidationResult {
  const errors: DraftErrors = {};
  const warnings: DraftErrors = {};
  const t = (v: string) => v.trim();

  const name = t(draft.name);
  if (name.length > LIMITS.name) errors.name = `Keep the property name under ${LIMITS.name} characters.`;

  const street = t(draft.street).replace(/\s+/g, ' ');
  if (!street) errors.street = 'Enter the street address.';
  else if (street.length < 3 || !/[A-Za-z]/.test(street)) errors.street = 'Enter a street address such as 123 Main St.';
  else if (street.length > LIMITS.street) errors.street = `Keep the street under ${LIMITS.street} characters.`;
  else if (!HOUSE_NUMBER_PATTERN.test(street)) warnings.street = 'No street number. Add one if the property has it.';

  const city = t(draft.city).replace(/\s+/g, ' ');
  if (!city) errors.city = 'Enter the city.';
  else if (city.length < 2 || city.length > LIMITS.city || !CITY_PATTERN.test(city)) errors.city = 'Enter a city name using letters only.';

  if (!STATE_CODES.has(draft.state)) errors.state = 'Choose a state.';

  const zip = t(draft.zip);
  if (!zip) errors.zip = 'Enter the ZIP code.';
  else if (!ZIP_PATTERN.test(zip)) errors.zip = 'Enter a 5-digit ZIP code, such as 27401 or 27401-1234.';

  if (!MANUAL_PROPERTY_TYPES.includes(draft.propertyType as ManualPropertyType)) errors.propertyType = 'Choose a property type.';

  // Window count is optional, but a count without a confidence would read as more certain than it is.
  let windowCount: number | undefined;
  let countConfidence: CountConfidence | undefined;
  if (t(draft.windowCount)) {
    const n = parseNumber(draft.windowCount, { integer: true });
    if (n === null || n < 0 || n > LIMITS.windowCount) errors.windowCount = 'Enter a whole number of windows, 0 or more.';
    else windowCount = n;
    if (COUNT_CONFIDENCES.includes(draft.countConfidence as CountConfidence)) countConfidence = draft.countConfidence as CountConfidence;
    else errors.countConfidence = 'Choose a confidence for the window count.';
  }

  if (!MANUAL_SOURCE_TYPES.includes(draft.sourceType as ManualSourceType)) errors.sourceType = 'Choose where this information came from.';
  const sourceUrl = t(draft.sourceUrl);
  const sourceNote = t(draft.sourceNote);
  if (sourceUrl && !isWebUrl(sourceUrl)) errors.sourceUrl = 'Enter a full web address starting with https://';
  if (!sourceUrl && !sourceNote) errors.sourceNote = 'Add a source link or a short source note.';
  if (sourceNote.length > LIMITS.shortNote) errors.sourceNote = `Keep the source note under ${LIMITS.shortNote} characters.`;

  if (!isRealDate(draft.researchedAt)) errors.researchedAt = 'Enter the date you researched or entered this prospect.';
  else if (draft.researchedAt > today) errors.researchedAt = 'The research date cannot be in the future.';

  if (!PROSPECT_STATUSES.includes(draft.status)) errors.status = 'Choose a status.';

  const internalNotes = t(draft.internalNotes);
  if (internalNotes.length > LIMITS.longNote) errors.internalNotes = `Keep notes under ${LIMITS.longNote} characters.`;

  let coordinates: ManualProspectFields['coordinates'];
  if (t(draft.lat) || t(draft.lng)) {
    const lat = parseNumber(draft.lat, { integer: false });
    const lng = parseNumber(draft.lng, { integer: false });
    if (lat === null || lat < -90 || lat > 90) errors.lat = 'Enter a latitude between -90 and 90, or leave both blank.';
    if (lng === null || lng < -180 || lng > 180) errors.lng = 'Enter a longitude between -180 and 180, or leave both blank.';
    if (lat !== null && lng !== null && !errors.lat && !errors.lng) coordinates = { lat, lng };
  }

  const optionalInt = (field: 'stories' | 'squareFootage', max: number, message: string) => {
    if (!t(draft[field])) return undefined;
    const n = parseNumber(draft[field], { integer: true });
    if (n === null || n < 1 || n > max) {
      errors[field] = message;
      return undefined;
    }
    return n;
  };
  const stories = optionalInt('stories', LIMITS.stories, 'Enter a whole number of stories, 1 or more.');
  const squareFootage = optionalInt('squareFootage', LIMITS.squareFootage, 'Enter square footage as a whole number.');

  let preliminaryPrice: ManualProspectFields['preliminaryPrice'];
  if (t(draft.priceLow) || t(draft.priceHigh)) {
    const low = parseNumber(draft.priceLow, { integer: false });
    const high = parseNumber(draft.priceHigh, { integer: false });
    if (low === null || low < 0 || low > LIMITS.price) errors.priceLow = 'Enter a low amount in dollars, or leave both blank.';
    if (high === null || high < 0 || high > LIMITS.price) errors.priceHigh = 'Enter a high amount in dollars, or leave both blank.';
    if (low !== null && high !== null && !errors.priceLow && !errors.priceHigh) {
      if (low > high) errors.priceHigh = 'The high amount must be at least the low amount.';
      else preliminaryPrice = { low, high };
    }
  }

  for (const field of ['accessNotes', 'exteriorScope', 'interiorScope'] as const) {
    if (t(draft[field]).length > LIMITS.longNote) errors[field] = `Keep this under ${LIMITS.longNote} characters.`;
  }

  const referenceUrls = splitReferenceUrls(draft.referenceUrls);
  if (referenceUrls.length > LIMITS.referenceUrls) errors.referenceUrls = `Add at most ${LIMITS.referenceUrls} links.`;
  else if (referenceUrls.some((u) => !isWebUrl(u))) errors.referenceUrls = 'Put one full web address per line, each starting with https://';

  if (t(draft.followUpAt) && !isRealDate(draft.followUpAt)) errors.followUpAt = 'Enter a valid follow-up date.';

  if (Object.keys(errors).length > 0) return { errors, warnings };

  const optionalText = (v: string) => t(v) || undefined;
  return {
    errors,
    warnings,
    fields: {
      name: name || undefined,
      propertyType: draft.propertyType as ManualPropertyType,
      address: { line1: street, city, state: draft.state, zip },
      coordinates,
      windowCount,
      countConfidence,
      source: { type: draft.sourceType as ManualSourceType, url: sourceUrl || undefined, note: sourceNote || undefined },
      researchedAt: draft.researchedAt,
      status: draft.status,
      internalNotes: internalNotes || undefined,
      stories,
      squareFootage,
      accessNotes: optionalText(draft.accessNotes),
      exteriorScope: optionalText(draft.exteriorScope),
      interiorScope: optionalText(draft.interiorScope),
      preliminaryPrice,
      referenceUrls,
      followUpAt: optionalText(draft.followUpAt),
    },
  };
}

/** Drops keys whose value is undefined so stored records stay compact and comparable. */
export function buildManualProspect(
  fields: ManualProspectFields,
  meta: { id: string; createdAt: string; updatedAt: string }
): ManualProspect {
  const record = { kind: 'manual', dataOrigin: 'manual', ...meta, ...fields } as ManualProspect;
  (Object.keys(record) as (keyof ManualProspect)[]).forEach((k) => {
    if (record[k] === undefined) delete record[k];
  });
  record.source = { ...record.source };
  if (record.source.url === undefined) delete record.source.url;
  if (record.source.note === undefined) delete record.source.note;
  return record;
}

const STREET_ABBREVIATIONS: Record<string, string> = {
  street: 'st',
  avenue: 'ave',
  av: 'ave',
  road: 'rd',
  drive: 'dr',
  boulevard: 'blvd',
  lane: 'ln',
  court: 'ct',
  place: 'pl',
  parkway: 'pkwy',
  highway: 'hwy',
  circle: 'cir',
  terrace: 'ter',
  trail: 'trl',
  square: 'sq',
  north: 'n',
  south: 's',
  east: 'e',
  west: 'w',
  northeast: 'ne',
  northwest: 'nw',
  southeast: 'se',
  southwest: 'sw',
};
const UNIT_WORDS = /\b(suite|ste|unit|apt|apartment|bldg|building|floor|fl|rm|room)\b.*$|#.*$/;

/** Lowercase, punctuation-free street with common words abbreviated, e.g. "120 N Elm Street" -> "120 n elm st". */
export function normalizeStreet(street: string, { dropUnit = false } = {}): string {
  let s = street.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (dropUnit) s = s.replace(UNIT_WORDS, '');
  return s
    .replace(/[^a-z0-9#]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((w) => STREET_ABBREVIATIONS[w] || w)
    .join(' ');
}

const normalizeCity = (city: string) => city.toLowerCase().replace(/[^a-z]+/g, ' ').trim();

export interface DuplicateMatch {
  prospect: AnyProspect;
  /** 'same' when street and place match exactly; 'similar' when they match once suite or unit is ignored. */
  match: 'same' | 'similar';
}

/** Possible duplicates for the user to review. Nothing is merged or overwritten. */
export function findDuplicateAddresses(
  address: { line1: string; city: string; state: string; zip?: string },
  existing: AnyProspect[],
  excludeId?: string
): DuplicateMatch[] {
  const street = normalizeStreet(address.line1);
  const base = normalizeStreet(address.line1, { dropUnit: true });
  if (!base) return [];
  const zip5 = (address.zip || '').slice(0, 5);
  const city = normalizeCity(address.city);
  const matches: DuplicateMatch[] = [];
  for (const p of existing) {
    if (p.id === excludeId) continue;
    const otherZip = (p.address.zip || '').slice(0, 5);
    const samePlace =
      zip5 && otherZip
        ? zip5 === otherZip
        : normalizeCity(p.address.city) === city && p.address.state.toUpperCase() === address.state.toUpperCase();
    if (!samePlace) continue;
    if (normalizeStreet(p.address.line1) === street) matches.push({ prospect: p, match: 'same' });
    else if (normalizeStreet(p.address.line1, { dropUnit: true }) === base) matches.push({ prospect: p, match: 'similar' });
  }
  return matches;
}
