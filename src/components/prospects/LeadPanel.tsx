'use client';

import { useState } from 'react';
import { Bookmark, BookmarkPlus, Trash2 } from 'lucide-react';
import { MAX_NOTE_LENGTH } from '@/lib/prospects/leadStore';
import { LEAD_STATUSES, LEAD_STATUS_LABELS, type LeadStatus } from '@/lib/prospects/types';
import type { LeadsApi } from './useLeads';
import { formatIsoDate } from './styles';

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function LeadPanel({ prospectId, leads }: { prospectId: string; leads: LeadsApi }) {
  const lead = leads.byProspect.get(prospectId);
  const [note, setNote] = useState('');
  const [confirmRemove, setConfirmRemove] = useState(false);

  if (leads.status === 'loading') return null;

  return (
    <section aria-labelledby="lead-heading" className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-2">
        <h3 id="lead-heading" className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <Bookmark className="h-4 w-4" aria-hidden="true" />
          Lead tracking
        </h3>
        {lead && <span className="text-xs text-slate-600 dark:text-slate-300">Saved on this device</span>}
      </div>

      {leads.error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          {leads.error}
          {!leads.editable && ' Lead editing is turned off so nothing already saved is overwritten.'}
        </p>
      )}

      {!lead ? (
        <button
          type="button"
          disabled={!leads.editable}
          onClick={() => leads.save(prospectId)}
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          <BookmarkPlus className="h-4 w-4" aria-hidden="true" />
          Save as lead
        </button>
      ) : (
        <div className="mt-3 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="lead-status" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
                Status
              </label>
              <select
                id="lead-status"
                value={lead.status}
                disabled={!leads.editable}
                onChange={(e) => leads.update(prospectId, { type: 'status', status: e.target.value as LeadStatus })}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {LEAD_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="lead-follow-up" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
                Follow-up date
              </label>
              <input
                id="lead-follow-up"
                type="date"
                value={lead.followUpAt || ''}
                disabled={!leads.editable}
                onChange={(e) => leads.update(prospectId, { type: 'followUp', date: e.target.value || null })}
                aria-describedby={lead.followUpAt && lead.followUpAt < todayIso() ? 'lead-follow-up-overdue' : undefined}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:[color-scheme:dark]"
              />
              {lead.followUpAt && lead.followUpAt < todayIso() && (
                <p id="lead-follow-up-overdue" className="mt-1 text-xs font-medium text-red-700 dark:text-red-300">
                  Overdue since {formatIsoDate(lead.followUpAt)}
                </p>
              )}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!note.trim()) return;
              leads.update(prospectId, { type: 'addNote', text: note });
              setNote('');
            }}
          >
            <label htmlFor="lead-note" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Add a note
            </label>
            <textarea
              id="lead-note"
              rows={2}
              value={note}
              maxLength={MAX_NOTE_LENGTH}
              disabled={!leads.editable}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              placeholder="e.g. Called the front desk; manager back Monday"
            />
            <button
              type="submit"
              disabled={!leads.editable || !note.trim()}
              className="mt-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              Add note
            </button>
          </form>

          {lead.notes.length > 0 && (
            <ul className="space-y-2" aria-label="Lead notes">
              {lead.notes.map((n, i) => (
                <li key={`${n.at}-${i}`} className="rounded-lg bg-white p-2 text-sm dark:bg-slate-800">
                  <p className="whitespace-pre-wrap text-slate-800 dark:text-slate-100">{n.text}</p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    {new Date(n.at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-slate-200 pt-3 dark:border-slate-700">
            {!confirmRemove ? (
              <button
                type="button"
                disabled={!leads.editable}
                onClick={() => setConfirmRemove(true)}
                className="inline-flex items-center gap-1 text-sm font-medium text-red-700 hover:underline disabled:opacity-60 dark:text-red-300"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove lead
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-slate-700 dark:text-slate-200">Remove this lead and its notes?</span>
                <button
                  type="button"
                  onClick={() => {
                    leads.remove(prospectId);
                    setConfirmRemove(false);
                  }}
                  className="rounded-lg bg-red-700 px-3 py-1 font-medium text-white hover:bg-red-800"
                >
                  Yes, remove
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmRemove(false)}
                  className="rounded-lg border border-slate-300 px-3 py-1 font-medium text-slate-800 dark:border-slate-600 dark:text-slate-100"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
