'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { applyLeadChange, createLead, readLeads, writeLeads, type LeadChange } from '@/lib/prospects/leadStore';
import type { SavedLead } from '@/lib/prospects/types';

export type LeadsStatus = 'loading' | 'ready' | 'unreadable';

export function useLeads() {
  const [status, setStatus] = useState<LeadsStatus>('loading');
  const [leads, setLeads] = useState<SavedLead[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const result = readLeads(window.localStorage);
    if (result.ok) {
      setLeads(result.leads);
      setStatus('ready');
    } else {
      setError(result.error);
      setStatus('unreadable');
    }
  }, []);

  const commit = useCallback(
    (next: SavedLead[]) => {
      if (status !== 'ready') return;
      const result = writeLeads(window.localStorage, next);
      if (result.ok) {
        setLeads(next);
        setError(null);
      } else {
        setError(result.error);
      }
    },
    [status]
  );

  const byProspect = useMemo(() => new Map(leads.map((l) => [l.prospectId, l])), [leads]);
  const savedIds = useMemo(() => new Set(leads.map((l) => l.prospectId)), [leads]);

  const save = useCallback(
    (prospectId: string) => {
      if (byProspect.has(prospectId)) return;
      commit([createLead(prospectId), ...leads]);
    },
    [byProspect, commit, leads]
  );

  const update = useCallback(
    (prospectId: string, change: LeadChange) => {
      commit(leads.map((l) => (l.prospectId === prospectId ? applyLeadChange(l, change) : l)));
    },
    [commit, leads]
  );

  const remove = useCallback(
    (prospectId: string) => {
      commit(leads.filter((l) => l.prospectId !== prospectId));
    },
    [commit, leads]
  );

  return { status, error, byProspect, savedIds, save, update, remove, editable: status === 'ready' };
}

export type LeadsApi = ReturnType<typeof useLeads>;
