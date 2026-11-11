'use client';

import React, { useRef, useState } from 'react';
import { Building2, FileImage, Palette, SlidersHorizontal, X } from 'lucide-react';
import { useCompanySettings } from '@/contexts/CompanySettingsContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  BRAND_COLOR_PRESETS,
  EMPTY_COMPANY_SETTINGS,
  fileToCompressedDataUrl,
} from '@/lib/companySettings';
import { US_STATES, formatSalesTaxPercent, getSalesTaxRate } from '@/lib/salesTax';
import { getQuoteCounter } from '@/lib/utils';
import {
  applyBackup,
  backupFilename,
  BACKUP_KEY_LABELS,
  collectBackup,
  readBackupText,
  RESTORE_NOTICE_KEY,
  type BackupFile,
  type BackupSummary,
} from '@/lib/backup';

type SettingsTab = 'company' | 'documents' | 'appearance' | 'preferences';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'company', label: 'Company', icon: <Building2 className="w-4 h-4" /> },
  { id: 'documents', label: 'Documents', icon: <FileImage className="w-4 h-4" /> },
  { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
  { id: 'preferences', label: 'Preferences', icon: <SlidersHorizontal className="w-4 h-4" /> },
];

const fieldClass =
  'mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)]';

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, replaceSettings } = useCompanySettings();
  const { currentTheme, setTheme, themes } = useTheme();
  const [tab, setTab] = useState<SettingsTab>('company');
  const [uploadError, setUploadError] = useState('');
  const [quoteNumberDraft, setQuoteNumberDraft] = useState(() => String(getQuoteCounter()));
  const [backupMessage, setBackupMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const [restorePreview, setRestorePreview] = useState<{ backup: BackupFile; summary: BackupSummary } | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const capInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  const downloadBackup = () => {
    try {
      const backup = collectBackup(window.localStorage);
      const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = backupFilename(backup.createdAt);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setRestorePreview(null);
      setBackupMessage({ tone: 'ok', text: 'Backup downloaded.' });
    } catch (error) {
      console.error(error);
      setBackupMessage({ tone: 'error', text: 'Could not create a backup.' });
    }
  };

  const chooseBackup = async (file: File | undefined) => {
    if (!file) return;
    try {
      const result = readBackupText(await file.text());
      if (!result.ok) {
        setRestorePreview(null);
        setBackupMessage({ tone: 'error', text: result.error });
        return;
      }
      setBackupMessage(null);
      setRestorePreview({ backup: result.backup, summary: result.summary });
    } catch (error) {
      console.error(error);
      setRestorePreview(null);
      setBackupMessage({ tone: 'error', text: 'Could not read that backup file.' });
    }
  };

  const confirmRestore = () => {
    if (!restorePreview) return;
    const result = applyBackup(window.localStorage, restorePreview.backup);
    if (!result.ok) {
      setBackupMessage({ tone: 'error', text: result.error });
      return;
    }
    sessionStorage.setItem(RESTORE_NOTICE_KEY, 'Backup restored.');
    window.location.reload();
  };

  if (!isOpen) return null;

  const handleText =
    (key: keyof typeof settings) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateSettings({ [key]: e.target.value } as Partial<typeof settings>);
    };

  const handleUpload = async (file: File | undefined, field: 'logoDataUrl' | 'capabilityStatementDataUrl') => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload a PNG, JPG, or WebP image.');
      return;
    }
    try {
      setUploadError('');
      const dataUrl = await fileToCompressedDataUrl(file, field === 'logoDataUrl' ? 900 : 1600);
      const result = updateSettings({ [field]: dataUrl });
      if (!result.ok) {
        setUploadError(result.error || 'Could not save that image.');
      }
    } catch (error) {
      console.error(error);
      setUploadError('Could not process that image. Try a smaller PNG or JPG.');
    }
  };

  const handleQuoteNumberSave = () => {
    const next = parseInt(quoteNumberDraft, 10);
    if (Number.isFinite(next) && next > 0) {
      localStorage.setItem('quoteCounter', String(next));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-3xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Company branding used on quotes, work orders, and the estimator.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-gray-200 dark:border-slate-700 px-2 overflow-x-auto">
          {TABS.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
                tab === item.id
                  ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
                  : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-6">
          {tab === 'company' && (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                This is the source of truth for quote packages. Fill this in once instead of retyping it on every estimate.
                Sales tax on estimates uses the combined average rate for the company home state.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="sm:col-span-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Company name</span>
                  <input className={fieldClass} value={settings.name} onChange={handleText('name')} />
                </label>
                <label className="sm:col-span-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Street address</span>
                  <input className={fieldClass} value={settings.address} onChange={handleText('address')} />
                </label>
                <label>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">City</span>
                  <input className={fieldClass} value={settings.city} onChange={handleText('city')} />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">State</span>
                    <select
                      className={fieldClass}
                      value={settings.state}
                      onChange={(e) => updateSettings({ state: e.target.value })}
                    >
                      {US_STATES.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.name} ({item.code})
                        </option>
                      ))}
                    </select>
                    <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                      Sales tax: {formatSalesTaxPercent(getSalesTaxRate(settings.state))}
                    </span>
                  </label>
                  <label>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ZIP</span>
                    <input className={fieldClass} value={settings.zip} onChange={handleText('zip')} />
                  </label>
                </div>
                <label>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</span>
                  <input className={fieldClass} value={settings.phone} onChange={handleText('phone')} />
                </label>
                <label>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</span>
                  <input className={fieldClass} type="email" value={settings.email} onChange={handleText('email')} />
                </label>
                <label className="sm:col-span-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Website</span>
                  <input className={fieldClass} value={settings.website} onChange={handleText('website')} />
                </label>
              </div>
            </>
          )}

          {tab === 'documents' && (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Upload your logo and capability statement so quote PDFs no longer use the built-in Big Brother assets.
              </p>
              {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Company logo</h3>
                  <p className="text-xs text-gray-500 mb-3">Used on quote covers, work orders, invoices, and POs.</p>
                  <div className="h-28 rounded-md bg-gray-50 dark:bg-slate-800 flex items-center justify-center mb-3 overflow-hidden border border-dashed border-gray-300 dark:border-slate-600">
                    {settings.logoDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={settings.logoDataUrl} alt="Company logo preview" className="max-h-24 max-w-full object-contain" />
                    ) : (
                      <span className="text-xs text-gray-400 px-3 text-center">Using default logo until you upload one</span>
                    )}
                  </div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => handleUpload(e.target.files?.[0], 'logoDataUrl')}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-white text-sm px-3 py-2 rounded-md"
                      style={{ backgroundColor: settings.brandColor }}
                      onClick={() => logoInputRef.current?.click()}
                    >
                      Upload logo
                    </button>
                    {settings.logoDataUrl && (
                      <button
                        type="button"
                        className="text-sm px-3 py-2 rounded-md border border-gray-300 dark:border-slate-600"
                        onClick={() => updateSettings({ logoDataUrl: '' })}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Capability statement</h3>
                  <p className="text-xs text-gray-500 mb-3">Full-page image inserted after the quote cover. PNG or JPG.</p>
                  <div className="h-28 rounded-md bg-gray-50 dark:bg-slate-800 flex items-center justify-center mb-3 overflow-hidden border border-dashed border-gray-300 dark:border-slate-600">
                    {settings.capabilityStatementDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={settings.capabilityStatementDataUrl}
                        alt="Capability statement preview"
                        className="max-h-24 max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-gray-400 px-3 text-center">Using built-in project images until you upload one</span>
                    )}
                  </div>
                  <input
                    ref={capInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => handleUpload(e.target.files?.[0], 'capabilityStatementDataUrl')}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-white text-sm px-3 py-2 rounded-md"
                      style={{ backgroundColor: settings.brandColor }}
                      onClick={() => capInputRef.current?.click()}
                    >
                      Upload statement
                    </button>
                    {settings.capabilityStatementDataUrl && (
                      <button
                        type="button"
                        className="text-sm px-3 py-2 rounded-md border border-gray-300 dark:border-slate-600"
                        onClick={() => updateSettings({ capabilityStatementDataUrl: '' })}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === 'appearance' && (
            <>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Estimator color</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Changes the header, settings gear, and primary buttons for a demo-ready company look.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {BRAND_COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      title={preset.name}
                      onClick={() => updateSettings({ brandColor: preset.value })}
                      className={`w-9 h-9 rounded-full border-2 ${
                        settings.brandColor.toLowerCase() === preset.value.toLowerCase()
                          ? 'border-gray-900 dark:border-white scale-110'
                          : 'border-white shadow'
                      }`}
                      style={{ backgroundColor: preset.value }}
                    />
                  ))}
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 ml-1">
                    Custom
                    <input
                      type="color"
                      value={settings.brandColor}
                      onChange={(e) => updateSettings({ brandColor: e.target.value })}
                      className="h-9 w-12 rounded cursor-pointer border border-gray-300"
                    />
                  </label>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Theme style</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Broader look-and-feel presets for spacing and supporting colors.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.values(themes).map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setTheme(theme)}
                      className={`text-left border rounded-lg p-3 ${
                        currentTheme.id === theme.id
                          ? 'border-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]'
                          : 'border-gray-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">{theme.name}</span>
                        <span className="flex gap-1">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.accent }} />
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{theme.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === 'preferences' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">App name in header</span>
                  <input className={fieldClass} value={settings.appName} onChange={handleText('appName')} />
                </label>
                <label>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Estimator / contact name</span>
                  <input
                    className={fieldClass}
                    value={settings.estimatorName}
                    onChange={handleText('estimatorName')}
                    placeholder="Shown as the person preparing quotes"
                  />
                </label>
                <label>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Home base</span>
                  <input
                    className={fieldClass}
                    value={settings.homeBase}
                    onChange={handleText('homeBase')}
                    placeholder="City, ST"
                  />
                </label>
                <label>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quote prefix</span>
                  <input className={fieldClass} value={settings.quotePrefix} onChange={handleText('quotePrefix')} />
                </label>
                <label>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Next quote number</span>
                  <input
                    className={fieldClass}
                    value={quoteNumberDraft}
                    onChange={(e) => setQuoteNumberDraft(e.target.value)}
                    onBlur={handleQuoteNumberSave}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">
                Quote numbers look like {settings.quotePrefix || 'Q'}-{new Date().getFullYear()}-{quoteNumberDraft || '121'}.
              </p>

              <section className="rounded-lg border border-gray-200 dark:border-slate-700 p-4 space-y-3" aria-labelledby="backup-heading">
                <div>
                  <h3 id="backup-heading" className="font-semibold text-gray-900 dark:text-white">Backup</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Keep a backup of your business data somewhere safe.
                    You can use it to restore your information if you change browsers or clear this browser&apos;s storage.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Unsaved quote-screen edits and other temporary information are not included.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={downloadBackup}
                    className="px-4 py-2 rounded-md text-sm font-medium text-white"
                    style={{ backgroundColor: settings.brandColor }}
                  >
                    Download Backup
                  </button>
                  <button
                    type="button"
                    onClick={() => backupInputRef.current?.click()}
                    className="px-4 py-2 rounded-md border border-gray-300 dark:border-slate-600 text-sm font-medium text-gray-800 dark:text-gray-100"
                  >
                    Restore Backup
                  </button>
                  <input
                    ref={backupInputRef}
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    aria-label="Backup file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      void chooseBackup(file);
                    }}
                  />
                </div>
                {backupMessage && (
                  <p
                    role={backupMessage.tone === 'error' ? 'alert' : 'status'}
                    className={backupMessage.tone === 'error' ? 'text-sm text-red-700 dark:text-red-300' : 'text-sm text-green-800 dark:text-green-200'}
                  >
                    {backupMessage.text}
                  </p>
                )}
                {restorePreview && (
                  <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 space-y-2 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100" role="region" aria-label="Confirm backup restore">
                    <p className="font-medium">This will replace the items listed below. Empty items in the file will not remove data already in this browser.</p>
                    <p>Backup date: {new Date(restorePreview.summary.createdAt).toLocaleString()}</p>
                    <p>Company: {restorePreview.summary.companyName ?? 'Not included'}</p>
                    <p>Past estimates: {restorePreview.summary.pastEstimates === null ? 'Not included' : restorePreview.summary.pastEstimates}</p>
                    <p>Prospects: {restorePreview.summary.prospects === null ? 'Not included' : restorePreview.summary.prospects}</p>
                    <p>Saved leads: {restorePreview.summary.leads === null ? 'Not included' : restorePreview.summary.leads}</p>
                    <p>Company logo: {restorePreview.summary.logoIncluded ? 'Included' : 'Not included'}</p>
                    <div>
                      <p className="font-medium">Will be replaced</p>
                      <ul className="list-disc pl-5">
                        {restorePreview.summary.replacedKeys.map((key) => (
                          <li key={key}>{BACKUP_KEY_LABELS[key]}</li>
                        ))}
                      </ul>
                    </div>
                    {restorePreview.summary.keptKeys.length > 0 && (
                      <div>
                        <p className="font-medium">Left unchanged</p>
                        <ul className="list-disc pl-5">
                          {restorePreview.summary.keptKeys.map((key) => (
                            <li key={key}>{BACKUP_KEY_LABELS[key]}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3 pt-1">
                      <button
                        type="button"
                        onClick={confirmRestore}
                        className="px-4 py-2 rounded-md text-sm font-medium text-white"
                        style={{ backgroundColor: settings.brandColor }}
                      >
                        Confirm restore
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRestorePreview(null);
                          setBackupMessage({ tone: 'ok', text: 'Restore cancelled. Nothing was changed.' });
                        }}
                        className="px-4 py-2 rounded-md border border-gray-300 dark:border-slate-600 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </section>

              <button
                type="button"
                className="text-sm text-red-600 hover:underline"
                onClick={() => {
                  if (confirm('Clear company branding and uploaded files? Estimates, pricing, and saved quotes are not affected.')) {
                    const result = replaceSettings({ ...EMPTY_COMPANY_SETTINGS });
                    if (!result.ok && result.error) {
                      setUploadError(result.error);
                    }
                  }
                }}
              >
                Reset to built-in defaults
              </button>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-white px-5 py-2 rounded-md font-medium"
            style={{ backgroundColor: settings.brandColor }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
