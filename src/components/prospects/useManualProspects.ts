'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_PROSPECT_SETTINGS,
  createManualProspectId,
  readManualProspects,
  readProspectSettings,
  writeManualProspects,
  writeProspectSettings,
  type ProspectSettings,
  type WriteResult,
} from '@/lib/prospects/manualStore';
import { buildManualProspect, type ManualProspectFields } from '@/lib/prospects/manualProspectForm';
import type { ManualProspect } from '@/lib/prospects/types';

export type ManualStatus = 'loading' | 'ready' | 'unreadable';
export type SaveResult = { ok: true; prospect: ManualProspect } | { ok: false; error: string };

export function useManualProspects() {
  const [status, setStatus] = useState<ManualStatus>('loading');
  const [prospects, setProspects] = useState<ManualProspect[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<ProspectSettings>(DEFAULT_PROSPECT_SETTINGS);

  useEffect(() => {
    const result = readManualProspects(window.localStorage);
    if (result.ok) {
      setProspects(result.prospects);
      setStatus('ready');
    } else {
      setError(result.error);
      setStatus('unreadable');
    }
    setSettings(readProspectSettings(window.localStorage));
  }, []);

  // Always re-read before writing, so a change made in another tab is not overwritten.
  const commit = useCallback(
    (change: (current: ManualProspect[]) => ManualProspect[]): WriteResult => {
      if (status !== 'ready') return { ok: false, error: 'Saved prospects cannot be changed right now.' };
      const latest = readManualProspects(window.localStorage);
      if (!latest.ok) return latest;
      const next = change(latest.prospects);
      const result = writeManualProspects(window.localStorage, next);
      if (result.ok) setProspects(next);
      return result;
    },
    [status]
  );

  const create = useCallback(
    (fields: ManualProspectFields): SaveResult => {
      const now = new Date();
      const at = now.toISOString();
      const prospect = buildManualProspect(fields, { id: createManualProspectId(now), createdAt: at, updatedAt: at });
      const result = commit((current) => [prospect, ...current]);
      return result.ok ? { ok: true, prospect } : result;
    },
    [commit]
  );

  const update = useCallback(
    (id: string, fields: ManualProspectFields): SaveResult => {
      const box: { saved?: ManualProspect } = {};
      const result = commit((current) =>
        current.map((p) => {
          if (p.id !== id) return p;
          box.saved = buildManualProspect(fields, { id, createdAt: p.createdAt, updatedAt: new Date().toISOString() });
          return box.saved;
        })
      );
      if (!result.ok) return result;
      return box.saved ? { ok: true, prospect: box.saved } : { ok: false, error: 'This prospect no longer exists.' };
    },
    [commit]
  );

  const remove = useCallback((id: string) => commit((current) => current.filter((p) => p.id !== id)), [commit]);

  const setShowSampleData = useCallback((showSampleData: boolean) => {
    const next = { showSampleData };
    setSettings(next);
    writeProspectSettings(window.localStorage, next);
  }, []);

  return {
    status,
    error,
    prospects,
    create,
    update,
    remove,
    editable: status === 'ready',
    showSampleData: settings.showSampleData,
    setShowSampleData,
  };
}

export type ManualProspectsApi = ReturnType<typeof useManualProspects>;
