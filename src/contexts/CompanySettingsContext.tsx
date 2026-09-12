'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  applyBrandColor,
  CompanySettings,
  FALLBACK_COMPANY_SETTINGS,
  loadCompanySettings,
  saveCompanySettings,
  toDocumentCompanyInfo,
  type DocumentCompanyInfo,
} from '@/lib/companySettings';
import { getSalesTaxRate } from '@/lib/salesTax';

interface SaveResult {
  ok: boolean;
  error?: string;
}

interface CompanySettingsContextType {
  settings: CompanySettings;
  documentCompanyInfo: DocumentCompanyInfo;
  salesTaxRate: number;
  updateSettings: (patch: Partial<CompanySettings>) => SaveResult;
  replaceSettings: (next: CompanySettings) => SaveResult;
}

const CompanySettingsContext = createContext<CompanySettingsContextType | undefined>(undefined);

export const useCompanySettings = () => {
  const context = useContext(CompanySettingsContext);
  if (!context) {
    throw new Error('useCompanySettings must be used within a CompanySettingsProvider');
  }
  return context;
};

export const CompanySettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<CompanySettings>(FALLBACK_COMPANY_SETTINGS);

  useEffect(() => {
    setSettings(loadCompanySettings());
  }, []);

  useEffect(() => {
    applyBrandColor(settings.brandColor);
  }, [settings.brandColor]);

  const replaceSettings = useCallback((next: CompanySettings): SaveResult => {
    const result = saveCompanySettings(next);
    if (!result.ok) return result;
    setSettings(next);
    applyBrandColor(next.brandColor);
    return result;
  }, []);

  const updateSettings = useCallback((patch: Partial<CompanySettings>): SaveResult => {
    let result: SaveResult = { ok: true };
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      result = saveCompanySettings(next);
      if (!result.ok) return prev;
      if (patch.brandColor) {
        applyBrandColor(patch.brandColor);
      }
      return next;
    });
    return result;
  }, []);

  const documentCompanyInfo = useMemo(
    () => toDocumentCompanyInfo(settings),
    [
      settings.name,
      settings.address,
      settings.city,
      settings.state,
      settings.zip,
      settings.phone,
      settings.email,
      settings.website,
      settings.logoDataUrl,
      settings.capabilityStatementDataUrl,
    ]
  );

  const salesTaxRate = useMemo(() => getSalesTaxRate(settings.state), [settings.state]);

  const value = useMemo(
    () => ({
      settings,
      documentCompanyInfo,
      salesTaxRate,
      updateSettings,
      replaceSettings,
    }),
    [settings, documentCompanyInfo, salesTaxRate, updateSettings, replaceSettings]
  );

  return <CompanySettingsContext.Provider value={value}>{children}</CompanySettingsContext.Provider>;
};
