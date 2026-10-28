import { getWindowCounts } from '../proposals/job';
import type { FormData, WindowCustomerType, WindowServiceSides } from '../types';
import { MANUAL_SOURCE_LABELS, type CountConfidence, type ManualProspect } from './types';

/** Read once by the estimator, then removed. Carries no prices, so the estimator alone sets pricing. */
export const ESTIMATE_HANDOFF_STORAGE_KEY = 'estimaitor_pi_estimate_handoff_v1';
const SCHEMA_VERSION = 2;
const MAX_AGE_MS = 30 * 60 * 1000;

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export const WINDOW_QUOTE_INPUTS = {
  sides: 'Service sides (Exterior Only, Interior Only, or Interior + Exterior)',
  customerType: 'Customer type (Residential or Commercial / Storefront)',
  windowSplit: 'Window-count split (Standard, Large, and High-Access)',
  windows: 'At least one window',
  distance: 'Distance from the office (miles)',
} as const;

export interface WindowCountSplit {
  standard: number;
  large: number;
  highAccess: number;
}

export interface DraftEstimateHandoff {
  version: number;
  createdAt: string;
  prospectId: string;
  prospectLabel: string;
  projectName: string;
  projectStreet: string;
  projectCity: string;
  projectState: string;
  projectZip: string;
  notes: string;
  accessNotes?: string;
  exteriorScope?: string;
  interiorScope?: string;
  sourceLabel?: string;
  sourceUrl?: string;
  sourceNote?: string;
  /** Research total. Never applied as the standard-window count. */
  windowCountReference?: { count: number; confidence: CountConfidence };
  windowCustomerType?: WindowCustomerType;
  windowServiceSides?: WindowServiceSides;
  windowCounts?: WindowCountSplit;
  distanceFromOffice?: number;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
}

const SIDES: WindowServiceSides[] = ['exterior', 'interior', 'interior_exterior'];
const CUSTOMERS: WindowCustomerType[] = ['residential', 'commercial'];

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const optionalText = (value?: string) => (value || '').trim() || undefined;

export function customerTypeFromProspect(prospect: ManualProspect): WindowCustomerType | undefined {
  return prospect.propertyType === 'residential' || prospect.propertyType === 'commercial'
    ? prospect.propertyType
    : undefined;
}

/** Only an explicit saved split is usable. A single research total is not a split. */
export function windowSplitFromProspect(prospect: ManualProspect): WindowCountSplit | undefined {
  if (
    prospect.standardWindows === undefined &&
    prospect.largeWindows === undefined &&
    prospect.highAccessWindows === undefined
  ) {
    return undefined;
  }
  return {
    standard: prospect.standardWindows ?? 0,
    large: prospect.largeWindows ?? 0,
    highAccess: prospect.highAccessWindows ?? 0,
  };
}

export function buildDraftEstimateHandoff(prospect: ManualProspect, now: Date = new Date()): DraftEstimateHandoff {
  const handoff: DraftEstimateHandoff = {
    version: SCHEMA_VERSION,
    createdAt: now.toISOString(),
    prospectId: prospect.id,
    prospectLabel: prospect.name || prospect.address.line1,
    projectName: prospect.name || '',
    projectStreet: prospect.address.line1,
    projectCity: prospect.address.city,
    projectState: prospect.address.state,
    projectZip: prospect.address.zip,
    notes: prospect.internalNotes || '',
  };
  const accessNotes = optionalText(prospect.accessNotes);
  const exteriorScope = optionalText(prospect.exteriorScope);
  const interiorScope = optionalText(prospect.interiorScope);
  if (accessNotes) handoff.accessNotes = accessNotes;
  if (exteriorScope) handoff.exteriorScope = exteriorScope;
  if (interiorScope) handoff.interiorScope = interiorScope;
  if (prospect.source.type) handoff.sourceLabel = MANUAL_SOURCE_LABELS[prospect.source.type];
  if (prospect.source.url) handoff.sourceUrl = prospect.source.url;
  if (prospect.source.note) handoff.sourceNote = prospect.source.note;
  if (prospect.windowCount !== undefined && prospect.countConfidence) {
    handoff.windowCountReference = { count: prospect.windowCount, confidence: prospect.countConfidence };
  }
  const customerType = customerTypeFromProspect(prospect);
  if (customerType) handoff.windowCustomerType = customerType;
  if (prospect.windowServiceSides && SIDES.includes(prospect.windowServiceSides)) {
    handoff.windowServiceSides = prospect.windowServiceSides;
  }
  const split = windowSplitFromProspect(prospect);
  if (split) handoff.windowCounts = split;
  if (isFiniteNumber(prospect.distanceFromOffice) && prospect.distanceFromOffice >= 0) {
    handoff.distanceFromOffice = prospect.distanceFromOffice;
  }
  const clientName = optionalText(prospect.contactName) || optionalText(prospect.name);
  if (clientName) handoff.clientName = clientName;
  const clientPhone = optionalText(prospect.contactPhone);
  const clientEmail = optionalText(prospect.contactEmail);
  if (clientPhone) handoff.clientPhone = clientPhone;
  if (clientEmail) handoff.clientEmail = clientEmail;
  return handoff;
}

export function missingWindowQuoteInputs(handoff: DraftEstimateHandoff): string[] {
  const missing: string[] = [];
  if (!handoff.windowServiceSides) missing.push(WINDOW_QUOTE_INPUTS.sides);
  if (!handoff.windowCustomerType) missing.push(WINDOW_QUOTE_INPUTS.customerType);
  if (!handoff.windowCounts) missing.push(WINDOW_QUOTE_INPUTS.windowSplit);
  else if (handoff.windowCounts.standard + handoff.windowCounts.large + handoff.windowCounts.highAccess <= 0) {
    missing.push(WINDOW_QUOTE_INPUTS.windows);
  }
  if (!isFiniteNumber(handoff.distanceFromOffice) || handoff.distanceFromOffice < 0) {
    missing.push(WINDOW_QUOTE_INPUTS.distance);
  }
  return missing;
}

function isBlankNumber(value: unknown): boolean {
  return value === '' || value === undefined || value === null || (typeof value === 'number' && Number.isNaN(value));
}

/** Live form values for a prospect draft. Blank travel or counts are missing, not zero. */
export function missingWindowQuoteInputsFromForm(values: Partial<FormData>): string[] {
  const missing: string[] = [];
  if (!values.windowServiceSides) missing.push(WINDOW_QUOTE_INPUTS.sides);
  if (!values.windowCustomerType) missing.push(WINDOW_QUOTE_INPUTS.customerType);
  const splitBlank =
    isBlankNumber(values.numberOfWindows) &&
    isBlankNumber(values.numberOfLargeWindows) &&
    isBlankNumber(values.numberOfHighAccessWindows);
  if (splitBlank) missing.push(WINDOW_QUOTE_INPUTS.windowSplit);
  else if (getWindowCounts(values).total <= 0) missing.push(WINDOW_QUOTE_INPUTS.windows);
  if (isBlankNumber(values.distanceFromOffice)) missing.push(WINDOW_QUOTE_INPUTS.distance);
  return missing;
}

export function quoteNotesFromHandoff(handoff: DraftEstimateHandoff): string {
  return [handoff.accessNotes, handoff.exteriorScope, handoff.interiorScope].filter(Boolean).join('\n\n');
}

/** Empty numeric quote field. Missing travel or counts stay blank, not 0 or a leftover value. */
export const BLANK_QUOTE_NUMBER = '' as unknown as number;

const PERSISTED_QUOTE_FIELDS = [
  'cleaningType',
  'needsWindowCleaning',
  'windowCustomerType',
  'windowServiceSides',
  'numberOfWindows',
  'numberOfLargeWindows',
  'numberOfHighAccessWindows',
  'distanceFromOffice',
  'clientName',
  'clientPhone',
  'clientEmail',
  'projectName',
  'projectStreet',
  'projectCity',
  'projectState',
  'projectZip',
  'isProspectDraft',
  'prospectId',
  'quoteNotes',
] as const;

/** Values to write onto the Window Cleaning form. Unknown estimate fields stay blank. */
export function formValuesFromHandoff(handoff: DraftEstimateHandoff): Partial<FormData> {
  const notes = quoteNotesFromHandoff(handoff);
  const values: Partial<FormData> = {
    cleaningType: 'window_cleaning_only',
    isProspectDraft: true,
    prospectId: handoff.prospectId,
    projectName: handoff.projectName,
    projectStreet: handoff.projectStreet,
    projectCity: handoff.projectCity,
    projectState: handoff.projectState,
    projectZip: handoff.projectZip,
    needsWindowCleaning: false,
    windowCustomerType: handoff.windowCustomerType,
    windowServiceSides: handoff.windowServiceSides,
    numberOfWindows: handoff.windowCounts ? handoff.windowCounts.standard : BLANK_QUOTE_NUMBER,
    numberOfLargeWindows: handoff.windowCounts ? handoff.windowCounts.large : BLANK_QUOTE_NUMBER,
    numberOfHighAccessWindows: handoff.windowCounts ? handoff.windowCounts.highAccess : BLANK_QUOTE_NUMBER,
    distanceFromOffice: isFiniteNumber(handoff.distanceFromOffice)
      ? handoff.distanceFromOffice
      : BLANK_QUOTE_NUMBER,
  };
  if (handoff.clientName) values.clientName = handoff.clientName;
  if (handoff.clientPhone) values.clientPhone = handoff.clientPhone;
  if (handoff.clientEmail) values.clientEmail = handoff.clientEmail;
  if (notes) values.quoteNotes = notes;
  return values;
}

/**
 * Full form reset for Make Quote. Keeps generic estimator settings (gas, crew, urgency)
 * and replaces every quote-ready field from this prospect only. Leftover sides, counts,
 * customer type, and mileage from a previous session cannot remain.
 */
export function draftFormResetFromHandoff(
  handoff: DraftEstimateHandoff,
  persisted: Partial<FormData> = {}
): Partial<FormData> {
  const kept = { ...persisted };
  for (const key of PERSISTED_QUOTE_FIELDS) {
    delete kept[key];
  }
  return {
    ...kept,
    ...formValuesFromHandoff(handoff),
    applyMarkup: true,
  };
}

export function writeDraftEstimateHandoff(storage: StorageLike, handoff: DraftEstimateHandoff): boolean {
  try {
    storage.setItem(ESTIMATE_HANDOFF_STORAGE_KEY, JSON.stringify(handoff));
    return true;
  } catch {
    return false;
  }
}

function isCountSplit(value: unknown): value is WindowCountSplit {
  if (!value || typeof value !== 'object') return false;
  const split = value as WindowCountSplit;
  return [split.standard, split.large, split.highAccess].every(isFiniteNumber);
}

/** Returns the pending handoff and removes it, so a reload never refills the form. Stale handoffs are dropped. */
export function takeDraftEstimateHandoff(storage: StorageLike, now: Date = new Date()): DraftEstimateHandoff | null {
  let raw: string | null = null;
  try {
    raw = storage.getItem(ESTIMATE_HANDOFF_STORAGE_KEY);
    if (raw !== null) storage.removeItem(ESTIMATE_HANDOFF_STORAGE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const h = JSON.parse(raw) as DraftEstimateHandoff;
    const age = now.getTime() - Date.parse(h.createdAt);
    const strings = [h.prospectId, h.prospectLabel, h.projectName, h.projectStreet, h.projectCity, h.projectState, h.projectZip, h.notes];
    if (
      (h.version !== 1 && h.version !== SCHEMA_VERSION) ||
      !(age >= 0 && age <= MAX_AGE_MS) ||
      !strings.every((s) => typeof s === 'string') ||
      (h.windowCountReference !== undefined && typeof h.windowCountReference.count !== 'number') ||
      (h.windowCustomerType !== undefined && !CUSTOMERS.includes(h.windowCustomerType)) ||
      (h.windowServiceSides !== undefined && !SIDES.includes(h.windowServiceSides)) ||
      (h.windowCounts !== undefined && !isCountSplit(h.windowCounts)) ||
      (h.distanceFromOffice !== undefined && !isFiniteNumber(h.distanceFromOffice))
    ) {
      return null;
    }
    return h;
  } catch {
    return null;
  }
}
