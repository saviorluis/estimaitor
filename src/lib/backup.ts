/**
 * Portable backup of the business data kept in localStorage.
 * Values are copied exactly. The temporary prospect handoff and the
 * app-shell cache are not included. sessionStorage is not included.
 */

import { isSavedLead } from '@/lib/prospects/leadStore';
import { isManualProspect } from '@/lib/prospects/manualStore';
import { QUOTE_ADJUSTMENT_MAX_PERCENT, QUOTE_ADJUSTMENT_MIN_PERCENT } from '@/lib/utils';

export const BACKUP_APP = 'estimaitor';
export const BACKUP_VERSION = 1;
export const RESTORE_NOTICE_KEY = 'estimaitor_restore_notice';

export const BACKUP_LIMITS = {
  imageChars: 3_500_000,
  valueChars: 1_500_000,
  totalChars: 6_000_000,
} as const;

const APP_MODES = ['cleaning', 'pressure_washing', 'contract', 'pro', 'simple', 'wizard'] as const;
const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const IMAGE_DATA_URL = /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/;
const THEME_ID = /^[a-z0-9-]{1,40}$/;

export const BACKUP_KEYS = [
  'estimaitor_company_settings',
  'estimaitor_company_logo',
  'estimaitor_company_capability',
  'quoteCompanyInfo',
  'estimaitor_estimate_data',
  'estimaitor_saved_form_data',
  'estimaitor_past_entries',
  'estimaitor_contract_form_data',
  'quoteCounter',
  'quoteClientInfo',
  'quoteMarkupPercentage',
  'estimaitor_pi_prospects_v1',
  'estimaitor_pi_leads_v1',
  'estimaitor_pi_settings_v1',
  'estimaitor_form_data',
  'estimaitor-theme',
  'estimaitor_app_mode',
  'estimaitor_simple_form_data',
] as const;

export type BackupKey = (typeof BACKUP_KEYS)[number];

export const BACKUP_KEY_LABELS: Record<BackupKey, string> = {
  estimaitor_company_settings: 'Company settings',
  estimaitor_company_logo: 'Company logo',
  estimaitor_company_capability: 'Capability image',
  quoteCompanyInfo: 'Legacy company information',
  estimaitor_estimate_data: 'Current estimate',
  estimaitor_saved_form_data: 'Current estimate form',
  estimaitor_past_entries: 'Past estimates',
  estimaitor_contract_form_data: 'Janitorial form',
  quoteCounter: 'Quote counter',
  quoteClientInfo: 'Quote client information',
  quoteMarkupPercentage: 'Quote adjustment',
  estimaitor_pi_prospects_v1: 'Prospects',
  estimaitor_pi_leads_v1: 'Saved leads',
  estimaitor_pi_settings_v1: 'Prospect settings',
  estimaitor_form_data: 'Calculator preferences',
  'estimaitor-theme': 'Theme',
  estimaitor_app_mode: 'Calculator mode',
  estimaitor_simple_form_data: 'Legacy simple-form data',
};

const KEY_SET = new Set<string>(BACKUP_KEYS);
const JSON_OBJECT_KEYS = new Set<BackupKey>([
  'estimaitor_company_settings',
  'quoteCompanyInfo',
  'estimaitor_estimate_data',
  'estimaitor_saved_form_data',
  'estimaitor_contract_form_data',
  'quoteClientInfo',
  'estimaitor_form_data',
]);
const IMAGE_KEYS = new Set<BackupKey>(['estimaitor_company_logo', 'estimaitor_company_capability']);

export interface BackupStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface BackupFile {
  app: typeof BACKUP_APP;
  backupVersion: typeof BACKUP_VERSION;
  createdAt: string;
  storage: { [key in BackupKey]?: string | null };
}

export interface BackupSummary {
  createdAt: string;
  companyName: string | null;
  pastEstimates: number | null;
  prospects: number | null;
  leads: number | null;
  logoIncluded: boolean;
  replacedKeys: BackupKey[];
  keptKeys: BackupKey[];
}

export type BackupReadResult =
  | { ok: true; backup: BackupFile; summary: BackupSummary }
  | { ok: false; error: string };

export type BackupApplyResult =
  | { ok: true }
  | { ok: false; error: string; rollbackFailed: boolean };

export function backupFilename(createdAt: string): string {
  const day = /^\d{4}-\d{2}-\d{2}/.test(createdAt) ? createdAt.slice(0, 10) : 'undated';
  return `estimaitor-backup-${day}.json`;
}

export function collectBackup(storage: BackupStorage, now: Date = new Date()): BackupFile {
  const saved: BackupFile['storage'] = {};
  for (const key of BACKUP_KEYS) {
    saved[key] = storage.getItem(key);
  }
  return {
    app: BACKUP_APP,
    backupVersion: BACKUP_VERSION,
    createdAt: now.toISOString(),
    storage: saved,
  };
}

export function readBackupText(text: string): BackupReadResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'This file is not valid JSON.' };
  }
  return validateBackup(parsed);
}

export function validateBackup(raw: unknown): BackupReadResult {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, error: 'This file is not an EstimAItor backup.' };
  }
  const record = raw as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (key !== 'app' && key !== 'backupVersion' && key !== 'createdAt' && key !== 'storage') {
      return { ok: false, error: 'This file is not an EstimAItor backup.' };
    }
  }
  if (record.app !== BACKUP_APP) {
    return { ok: false, error: 'This file is not an EstimAItor backup.' };
  }
  if (typeof record.backupVersion !== 'number' || !Number.isInteger(record.backupVersion)) {
    return { ok: false, error: 'This backup version is not supported.' };
  }
  if (record.backupVersion > BACKUP_VERSION) {
    return {
      ok: false,
      error: 'This backup was created by a newer version of EstimAItor. Update the app before restoring it.',
    };
  }
  if (record.backupVersion !== BACKUP_VERSION) {
    return { ok: false, error: 'This backup version is not supported.' };
  }
  if (typeof record.createdAt !== 'string' || !ISO_TIMESTAMP.test(record.createdAt) || Number.isNaN(Date.parse(record.createdAt))) {
    return { ok: false, error: 'This backup has an invalid date.' };
  }
  if (!record.storage || typeof record.storage !== 'object' || Array.isArray(record.storage)) {
    return { ok: false, error: 'This backup is missing its saved data.' };
  }

  const storage = record.storage as Record<string, unknown>;
  for (const key of Object.keys(storage)) {
    if (!KEY_SET.has(key)) {
      return { ok: false, error: `This backup contains unsupported data (${key}).` };
    }
  }

  let total = 0;
  const parsed = new Map<BackupKey, unknown>();
  for (const key of BACKUP_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(storage, key)) continue;
    const value = storage[key];
    if (value === null) continue;
    if (typeof value !== 'string') {
      return { ok: false, error: `${BACKUP_KEY_LABELS[key]} must be saved text.` };
    }
    const max = IMAGE_KEYS.has(key) ? BACKUP_LIMITS.imageChars : BACKUP_LIMITS.valueChars;
    if (value.length > max) {
      return { ok: false, error: `${BACKUP_KEY_LABELS[key]} is too large to restore.` };
    }
    total += value.length;
    if (total > BACKUP_LIMITS.totalChars) {
      return { ok: false, error: 'This backup is too large to restore in this browser.' };
    }
    const checked = checkValue(key, value);
    if (!checked.ok) return checked;
    parsed.set(key, checked.value);
  }

  const backup: BackupFile = {
    app: BACKUP_APP,
    backupVersion: BACKUP_VERSION,
    createdAt: record.createdAt,
    storage: {},
  };
  for (const key of BACKUP_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(storage, key)) continue;
    const value = storage[key];
    backup.storage[key] = value === null ? null : (value as string);
  }

  return { ok: true, backup, summary: summarize(backup, parsed) };
}

function checkValue(key: BackupKey, value: string): { ok: true; value: unknown } | { ok: false; error: string } {
  if (IMAGE_KEYS.has(key)) {
    if (!IMAGE_DATA_URL.test(value)) {
      return { ok: false, error: `${BACKUP_KEY_LABELS[key]} is not a supported image.` };
    }
    return { ok: true, value };
  }
  if (key === 'quoteCounter') {
    if (!/^\d+$/.test(value)) return { ok: false, error: 'Quote counter is not a valid number.' };
    const counter = Number(value);
    if (!Number.isSafeInteger(counter) || counter < 1 || counter > 999_999_999) {
      return { ok: false, error: 'Quote counter is not a valid number.' };
    }
    return { ok: true, value: counter };
  }
  if (key === 'quoteMarkupPercentage') {
    if (!/^-?\d+(?:\.\d+)?$/.test(value)) return { ok: false, error: 'Quote adjustment is not a valid number.' };
    const percent = Number(value);
    if (percent < QUOTE_ADJUSTMENT_MIN_PERCENT || percent > QUOTE_ADJUSTMENT_MAX_PERCENT) {
      return { ok: false, error: 'Quote adjustment is outside the supported range.' };
    }
    return { ok: true, value: percent };
  }
  if (key === 'estimaitor-theme') {
    if (!THEME_ID.test(value)) return { ok: false, error: 'Theme is not recognized.' };
    return { ok: true, value };
  }
  if (key === 'estimaitor_app_mode') {
    if (!APP_MODES.includes(value as (typeof APP_MODES)[number])) {
      return { ok: false, error: 'Calculator mode is not recognized.' };
    }
    return { ok: true, value };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return { ok: false, error: `${BACKUP_KEY_LABELS[key]} could not be read.` };
  }

  if (key === 'estimaitor_simple_form_data') {
    if (parsed === null || typeof parsed !== 'object') {
      return { ok: false, error: 'Legacy simple-form data could not be read.' };
    }
    return { ok: true, value: parsed };
  }
  if (JSON_OBJECT_KEYS.has(key)) {
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ok: false, error: `${BACKUP_KEY_LABELS[key]} could not be read.` };
    }
    return { ok: true, value: parsed };
  }
  if (key === 'estimaitor_past_entries') {
    if (!Array.isArray(parsed) || parsed.some((entry) => !entry || typeof entry !== 'object' || Array.isArray(entry))) {
      return { ok: false, error: 'Past estimates could not be read.' };
    }
    return { ok: true, value: parsed };
  }
  if (key === 'estimaitor_pi_prospects_v1') return checkProspects(parsed);
  if (key === 'estimaitor_pi_leads_v1') return checkLeads(parsed);
  if (key === 'estimaitor_pi_settings_v1') return checkProspectSettings(parsed);
  return { ok: false, error: `${BACKUP_KEY_LABELS[key]} could not be read.` };
}

function versionError(parsed: unknown, label: string): string | null {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return `${label} could not be read.`;
  const version = (parsed as { version?: unknown }).version;
  if (version !== 1) {
    return `${label} are in a format this version of EstimAItor does not support.`;
  }
  return null;
}

function checkProspects(parsed: unknown): { ok: true; value: unknown } | { ok: false; error: string } {
  const version = versionError(parsed, 'Prospects');
  if (version) return { ok: false, error: version };
  const prospects = (parsed as { prospects?: unknown }).prospects;
  if (!Array.isArray(prospects) || !prospects.every(isManualProspect)) {
    return { ok: false, error: 'Prospects could not be read.' };
  }
  return { ok: true, value: parsed };
}

function checkLeads(parsed: unknown): { ok: true; value: unknown } | { ok: false; error: string } {
  const version = versionError(parsed, 'Saved leads');
  if (version) return { ok: false, error: version };
  const leads = (parsed as { leads?: unknown }).leads;
  if (!Array.isArray(leads) || !leads.every(isSavedLead)) {
    return { ok: false, error: 'Saved leads could not be read.' };
  }
  return { ok: true, value: parsed };
}

function checkProspectSettings(parsed: unknown): { ok: true; value: unknown } | { ok: false; error: string } {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, error: 'Prospect settings could not be read.' };
  }
  const settings = parsed as { version?: unknown; showSampleData?: unknown };
  if (settings.version !== 1) {
    return { ok: false, error: 'Prospect settings are in a format this version of EstimAItor does not support.' };
  }
  if (typeof settings.showSampleData !== 'boolean') {
    return { ok: false, error: 'Prospect settings could not be read.' };
  }
  return { ok: true, value: parsed };
}

function summarize(backup: BackupFile, parsed: Map<BackupKey, unknown>): BackupSummary {
  const company = parsed.get('estimaitor_company_settings') as { name?: unknown } | undefined;
  const companyName = company && typeof company.name === 'string' && company.name.trim() ? company.name.trim() : null;
  const past = parsed.get('estimaitor_past_entries');
  const prospects = parsed.get('estimaitor_pi_prospects_v1') as { prospects?: unknown[] } | undefined;
  const leads = parsed.get('estimaitor_pi_leads_v1') as { leads?: unknown[] } | undefined;
  const replacedKeys = BACKUP_KEYS.filter((key) => typeof backup.storage[key] === 'string');
  const keptKeys = BACKUP_KEYS.filter((key) => backup.storage[key] == null);
  return {
    createdAt: backup.createdAt,
    companyName,
    pastEstimates: Array.isArray(past) ? past.length : null,
    prospects: prospects ? prospects.prospects?.length ?? null : null,
    leads: leads ? leads.leads?.length ?? null : null,
    logoIncluded: typeof backup.storage.estimaitor_company_logo === 'string',
    replacedKeys,
    keptKeys,
  };
}

/**
 * Writes only keys that have a string value. Null and missing keys are left
 * untouched, so an empty backup value cannot delete existing records.
 * If a write throws, every key already changed is put back.
 */
export function applyBackup(storage: BackupStorage, backup: BackupFile): BackupApplyResult {
  const planned = BACKUP_KEYS.filter((key) => typeof backup.storage[key] === 'string');
  const snapshot = planned.map((key) => ({ key, previous: storage.getItem(key) }));
  const written: typeof snapshot = [];

  const undo = (): boolean => {
    let rollbackFailed = false;
    for (let i = written.length - 1; i >= 0; i--) {
      const item = written[i];
      try {
        if (item.previous === null) storage.removeItem(item.key);
        else storage.setItem(item.key, item.previous);
      } catch {
        rollbackFailed = true;
      }
    }
    return rollbackFailed;
  };

  try {
    for (const item of snapshot) {
      try {
        storage.setItem(item.key, backup.storage[item.key] as string);
      } catch (error) {
        written.push(item);
        throw error;
      }
      written.push(item);
    }
    return { ok: true };
  } catch {
    const rollbackFailed = undo();
    return {
      ok: false,
      error: rollbackFailed
        ? 'Restore failed, and the previous data could not be put back. Download a new backup before trying again.'
        : 'Restore failed before it finished, so your existing data was left unchanged.',
      rollbackFailed,
    };
  }
}
