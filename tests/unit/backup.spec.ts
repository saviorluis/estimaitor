import { test, expect } from '@playwright/test';
import {
  applyBackup,
  BACKUP_KEYS,
  BACKUP_LIMITS,
  collectBackup,
  readBackupText,
  type BackupStorage,
} from '../../src/lib/backup';

const LOGO = 'data:image/png;base64,iVBORw0KGgo=';
const CAPABILITY = 'data:image/jpeg;base64,/9j/4AAQ';

function memory(initial: Record<string, string> = {}): BackupStorage & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
    },
    setItem(key, value) {
      data[key] = value;
    },
    removeItem(key) {
      delete data[key];
    },
  };
}

function prospect() {
  return {
    kind: 'manual',
    dataOrigin: 'manual',
    id: 'mp-1',
    name: 'Oak Lane',
    propertyType: 'residential',
    address: { line1: '18 Oak Ln', city: 'High Point', state: 'NC', zip: '27265' },
    source: { type: 'site_visit' },
    researchedAt: '2026-11-08',
    status: 'new',
    referenceUrls: [],
    createdAt: '2026-11-08T12:00:00.000Z',
    updatedAt: '2026-11-08T12:00:00.000Z',
  };
}

function lead() {
  return {
    id: 'lead-1',
    prospectId: 'mp-1',
    status: 'new',
    notes: [{ at: '2026-11-08T12:00:00.000Z', text: 'Called the owner' }],
    createdAt: '2026-11-08T12:00:00.000Z',
    updatedAt: '2026-11-08T12:00:00.000Z',
  };
}

function seed(): Record<string, string> {
  return {
    estimaitor_company_settings: JSON.stringify({ name: 'North Glass Clean', phone: '(336) 555-0199' }),
    estimaitor_company_logo: LOGO,
    estimaitor_company_capability: CAPABILITY,
    quoteCompanyInfo: JSON.stringify({ name: 'North Glass Clean' }),
    estimaitor_estimate_data: JSON.stringify({ totalPrice: 613.75 }),
    estimaitor_saved_form_data: JSON.stringify({ clientName: 'Dana Oak', projectStreet: '18 Oak Ln' }),
    estimaitor_past_entries: JSON.stringify([{ id: '1', clientName: 'Dana Oak' }, { id: '2', clientName: 'Pat Sample' }]),
    estimaitor_contract_form_data: JSON.stringify({ facilityName: 'Sample Office Park' }),
    quoteCounter: '480',
    quoteClientInfo: JSON.stringify({ name: 'Dana Oak', email: 'dana@example.com' }),
    quoteMarkupPercentage: '0',
    estimaitor_pi_prospects_v1: JSON.stringify({ version: 1, prospects: [prospect()] }),
    estimaitor_pi_leads_v1: JSON.stringify({ version: 1, leads: [lead()] }),
    estimaitor_pi_settings_v1: JSON.stringify({ version: 1, showSampleData: false }),
    estimaitor_form_data: JSON.stringify({ gasPrice: 3.5, numberOfCleaners: 4 }),
    'estimaitor-theme': 'minimalist',
    estimaitor_app_mode: 'cleaning',
    estimaitor_simple_form_data: JSON.stringify({ squareFootage: 1000 }),
    estimaitor_pi_estimate_handoff_v1: JSON.stringify({ version: 2, prospectId: 'temporary' }),
  };
}

function restoreText(storage: BackupStorage, text: string) {
  const before = JSON.stringify(storageSnapshot(storage));
  const read = readBackupText(text);
  if (!read.ok) {
    return { read, applied: null, before, after: storageSnapshot(storage) };
  }
  const applied = applyBackup(storage, read.backup);
  return { read, applied, before, after: storageSnapshot(storage) };
}

function storageSnapshot(storage: BackupStorage): Record<string, string | null> {
  const snapshot: Record<string, string | null> = {};
  for (const key of [...BACKUP_KEYS, 'estimaitor_pi_estimate_handoff_v1']) {
    snapshot[key] = storage.getItem(key);
  }
  return snapshot;
}

test('a backup round trip keeps stored strings, images, prospects, leads, and the quote counter', () => {
  const source = memory(seed());
  const backup = collectBackup(source, new Date('2026-11-10T15:00:00.000Z'));
  expect(backup.app).toBe('estimaitor');
  expect(backup.backupVersion).toBe(1);
  expect(backup.createdAt).toBe('2026-11-10T15:00:00.000Z');
  expect(backup.storage.estimaitor_company_logo).toBe(LOGO);
  expect(backup.storage.estimaitor_company_capability).toBe(CAPABILITY);
  expect(backup.storage.quoteCounter).toBe('480');
  expect(JSON.parse(backup.storage.estimaitor_pi_prospects_v1 || '{}').prospects).toHaveLength(1);
  expect(JSON.parse(backup.storage.estimaitor_pi_leads_v1 || '{}').leads).toHaveLength(1);
  expect(backup.storage).not.toHaveProperty('estimaitor_pi_estimate_handoff_v1');

  const text = JSON.stringify(backup);
  const destination = memory();
  const result = restoreText(destination, text);
  expect(result.read.ok).toBe(true);
  expect(result.applied).toEqual({ ok: true });
  expect(destination.getItem('estimaitor_company_logo')).toBe(LOGO);
  expect(destination.getItem('estimaitor_company_capability')).toBe(CAPABILITY);
  expect(destination.getItem('quoteCounter')).toBe('480');
  expect(destination.getItem('estimaitor_pi_prospects_v1')).toBe(source.getItem('estimaitor_pi_prospects_v1'));
  expect(destination.getItem('estimaitor_pi_leads_v1')).toBe(source.getItem('estimaitor_pi_leads_v1'));
  expect(destination.getItem('estimaitor_simple_form_data')).toBe(source.getItem('estimaitor_simple_form_data'));
  expect(destination.getItem('estimaitor_pi_estimate_handoff_v1')).toBeNull();
  if (result.read.ok) {
    expect(result.read.summary.companyName).toBe('North Glass Clean');
    expect(result.read.summary.pastEstimates).toBe(2);
    expect(result.read.summary.prospects).toBe(1);
    expect(result.read.summary.leads).toBe(1);
    expect(result.read.summary.logoIncluded).toBe(true);
  }
});

test('null and missing backup values do not delete existing records', () => {
  const storage = memory({
    estimaitor_company_logo: LOGO,
    quoteCounter: '121',
    estimaitor_pi_prospects_v1: JSON.stringify({ version: 1, prospects: [prospect()] }),
  });
  const backup = collectBackup(memory({ quoteCounter: '200' }), new Date('2026-11-10T15:00:00.000Z'));
  expect(backup.storage.estimaitor_company_logo).toBeNull();
  const read = readBackupText(JSON.stringify(backup));
  expect(read.ok).toBe(true);
  if (!read.ok) return;
  expect(read.summary.keptKeys).toContain('estimaitor_company_logo');
  expect(read.summary.replacedKeys).toContain('quoteCounter');
  expect(applyBackup(storage, read.backup)).toEqual({ ok: true });
  expect(storage.getItem('estimaitor_company_logo')).toBe(LOGO);
  expect(storage.getItem('estimaitor_pi_prospects_v1')).toContain('Oak Lane');
  expect(storage.getItem('quoteCounter')).toBe('200');

  delete read.backup.storage.quoteCounter;
  read.backup.storage.estimaitor_company_settings = JSON.stringify({ name: 'Kept Co' });
  expect(applyBackup(storage, read.backup)).toEqual({ ok: true });
  expect(storage.getItem('quoteCounter')).toBe('200');
  expect(storage.getItem('estimaitor_company_settings')).toContain('Kept Co');
});

test('malformed, foreign, and unsupported backups do not change storage', () => {
  const storage = memory({ quoteCounter: '121', estimaitor_company_logo: LOGO });
  const before = storage.getItem('quoteCounter');
  const cases = [
    '{',
    JSON.stringify({ app: 'other', backupVersion: 1, createdAt: '2026-11-10T15:00:00.000Z', storage: {} }),
    JSON.stringify({ app: 'estimaitor', backupVersion: 2, createdAt: '2026-11-10T15:00:00.000Z', storage: {} }),
    JSON.stringify({ app: 'estimaitor', backupVersion: 0, createdAt: '2026-11-10T15:00:00.000Z', storage: {} }),
    JSON.stringify({ app: 'estimaitor', backupVersion: 1, createdAt: 'yesterday', storage: {} }),
    JSON.stringify({
      app: 'estimaitor',
      backupVersion: 1,
      createdAt: '2026-11-10T15:00:00.000Z',
      storage: { estimaitor_company_logo: 'http://example.com/logo.png' },
    }),
    JSON.stringify({
      app: 'estimaitor',
      backupVersion: 1,
      createdAt: '2026-11-10T15:00:00.000Z',
      storage: { estimaitor_company_logo: 'data:image/svg+xml;base64,PHN2Zy8+' },
    }),
    JSON.stringify({
      app: 'estimaitor',
      backupVersion: 1,
      createdAt: '2026-11-10T15:00:00.000Z',
      storage: { not_a_real_key: 'value' },
    }),
    JSON.stringify({
      app: 'estimaitor',
      backupVersion: 1,
      createdAt: '2026-11-10T15:00:00.000Z',
      storage: { estimaitor_pi_prospects_v1: JSON.stringify({ version: 99, prospects: [] }) },
    }),
    JSON.stringify({
      app: 'estimaitor',
      backupVersion: 1,
      createdAt: '2026-11-10T15:00:00.000Z',
      storage: { estimaitor_pi_leads_v1: JSON.stringify({ version: 2, leads: [] }) },
    }),
    JSON.stringify({
      app: 'estimaitor',
      backupVersion: 1,
      createdAt: '2026-11-10T15:00:00.000Z',
      storage: { estimaitor_company_logo: `data:image/png;base64,${'A'.repeat(BACKUP_LIMITS.imageChars)}` },
    }),
  ];

  for (const text of cases) {
    const result = restoreText(storage, text);
    expect(result.read.ok, text.slice(0, 80)).toBe(false);
    expect(result.applied).toBeNull();
    expect(storage.getItem('quoteCounter')).toBe(before);
    expect(storage.getItem('estimaitor_company_logo')).toBe(LOGO);
  }
});

test('a write failure restores the previous values', () => {
  const data: Record<string, string> = {
    estimaitor_company_settings: JSON.stringify({ name: 'Original Co' }),
    quoteCounter: '15',
  };
  const storage: BackupStorage = {
    getItem: (key) => data[key] ?? null,
    setItem(key, value) {
      if (key === 'quoteCounter' && value === '999') throw new Error('full');
      data[key] = value;
    },
    removeItem(key) {
      delete data[key];
    },
  };
  const backup = collectBackup(
    memory({
      estimaitor_company_settings: JSON.stringify({ name: 'Incoming Co' }),
      quoteCounter: '999',
    }),
    new Date('2026-11-10T15:00:00.000Z')
  );
  const read = readBackupText(JSON.stringify(backup));
  if (!read.ok) throw new Error('expected a valid backup');
  const applied = applyBackup(storage, read.backup);
  expect(applied).toEqual({
    ok: false,
    error: 'Restore failed before it finished, so your existing data was left unchanged.',
    rollbackFailed: false,
  });
  expect(data.estimaitor_company_settings).toContain('Original Co');
  expect(data.quoteCounter).toBe('15');
});

test('a failed rollback is reported and is not described as a successful restore', () => {
  const data: Record<string, string> = {};
  const storage: BackupStorage = {
    getItem: (key) => data[key] ?? null,
    setItem(key, value) {
      data[key] = value;
      throw new Error('full');
    },
    removeItem() {
      throw new Error('full');
    },
  };
  const backup = collectBackup(memory({ quoteCounter: '40' }), new Date('2026-11-10T15:00:00.000Z'));
  const read = readBackupText(JSON.stringify(backup));
  if (!read.ok) throw new Error('expected a valid backup');
  const applied = applyBackup(storage, read.backup);
  expect(applied.ok).toBe(false);
  if (!applied.ok) {
    expect(applied.rollbackFailed).toBe(true);
    expect(applied.error).toContain('could not be put back');
    expect(applied.error).not.toContain('succeeded');
  }
});
