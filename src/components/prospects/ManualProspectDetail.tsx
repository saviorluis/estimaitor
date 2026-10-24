'use client';

import { forwardRef, useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, Building2, Calculator, ExternalLink, HardHat, Home, MapPin, MapPinPlus, Pencil, Trash2 } from 'lucide-react';
import { getSegment, prospectName } from '@/lib/prospects/filters';
import { hasValidCoordinates } from '@/lib/prospects/insights';
import type { StatusChange } from '@/lib/prospects/manualUpdates';
import {
  COUNT_CONFIDENCE_LABELS,
  MANUAL_SOURCE_LABELS,
  PROSPECT_STATUSES,
  PROSPECT_STATUS_LABELS,
  type ManualProspect,
  type ProspectStatus,
} from '@/lib/prospects/types';
import type { StatusChangeResult } from './useManualProspects';
import FactBadge from './FactBadge';
import { TONE_LABELS, TONE_PILL, formatIsoDate, formatNumber } from './styles';

const TONE_ICON = { commercial: Building2, residential: Home, construction: HardHat };
const DT = 'text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300';
const META = 'mt-0.5 text-xs text-slate-600 dark:text-slate-300';
const BUTTON =
  'inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-700';

const formatTimestamp = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
const formatDollars = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="py-3" data-fact={label}>
      <dt className={DT}>{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}

function NoteSection({ id, title, text }: { id: string; title: string; text?: string }) {
  if (!text) return null;
  return (
    <section aria-labelledby={id}>
      <h3 id={id} className="font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-1 whitespace-pre-line text-sm text-slate-700 dark:text-slate-200">{text}</p>
    </section>
  );
}

function SafeLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 break-all text-indigo-700 underline dark:text-indigo-300">
      {children}
      <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

interface ManualProspectDetailProps {
  prospect: ManualProspect;
  editable: boolean;
  onClose: () => void;
  closeLabel: string;
  onEdit: () => void;
  onDelete: () => { ok: boolean; error?: string };
  onCreateDraftEstimate: () => void;
  onAddCoordinates: () => void;
  onStatusChange: (status: ProspectStatus) => StatusChangeResult;
  onUndoStatus: (change: StatusChange) => { ok: boolean; error?: string };
}

/** Undo stays offered for this long after a quick status change. */
const UNDO_WINDOW_MS = 10_000;

const ManualProspectDetail = forwardRef<HTMLHeadingElement, ManualProspectDetailProps>(function ManualProspectDetail(
  { prospect, editable, onClose, closeLabel, onEdit, onDelete, onCreateDraftEstimate, onAddCoordinates, onStatusChange, onUndoStatus },
  headingRef
) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [undoChange, setUndoChange] = useState<StatusChange | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const mapped = hasValidCoordinates(prospect.coordinates);

  useEffect(() => {
    if (!undoChange) return;
    const timer = setTimeout(() => setUndoChange(null), UNDO_WINDOW_MS);
    return () => clearTimeout(timer);
  }, [undoChange]);

  const changeStatus = (status: ProspectStatus) => {
    const result = onStatusChange(status);
    if (result.ok) {
      setUndoChange(result.change);
      setStatusMessage(`Status changed to ${PROSPECT_STATUS_LABELS[status]}.`);
    } else {
      setUndoChange(null);
      setStatusMessage(result.error);
    }
  };

  const undo = () => {
    if (!undoChange) return;
    const result = onUndoStatus(undoChange);
    setStatusMessage(result.ok ? `Status restored to ${PROSPECT_STATUS_LABELS[undoChange.previous.status]}.` : result.error || 'Not undone.');
    setUndoChange(null);
  };
  const tone = getSegment(prospect);
  const Icon = TONE_ICON[tone];
  const verifiedCount = prospect.countConfidence === 'verified';
  const unverified = <p className={META}>Entered manually · not verified</p>;

  const remove = () => {
    const result = onDelete();
    if (!result.ok) setDeleteError(result.error || 'The prospect could not be deleted.');
  };

  return (
    <article aria-labelledby="prospect-detail-heading" className="space-y-5" data-testid="prospect-detail" data-origin="manual">
      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {closeLabel}
      </button>

      <header>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TONE_PILL[tone]}`}>
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {TONE_LABELS[tone]}
          </span>
          <span className="rounded-full bg-emerald-700 px-2 py-0.5 text-xs font-medium text-white">Your data</span>
          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs font-medium text-white dark:bg-white dark:text-slate-900">
            {PROSPECT_STATUS_LABELS[prospect.status]}
          </span>
        </div>
        <h2
          id="prospect-detail-heading"
          ref={headingRef}
          tabIndex={-1}
          className="mt-2 text-2xl font-semibold text-slate-900 focus:outline-none dark:text-white"
        >
          {prospectName(prospect)}
        </h2>
        <p className="mt-1 flex items-start gap-1 text-sm text-slate-600 dark:text-slate-300">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            {prospect.address.line1}, {prospect.address.city}, {prospect.address.state} {prospect.address.zip}
            <span className="block text-xs">
              {mapped ? 'Map position: coordinates you entered' : 'No coordinates, so this prospect is not on the map'}
            </span>
          </span>
        </p>
        {!mapped && editable && (
          <button type="button" onClick={onAddCoordinates} className={`${BUTTON} mt-2`}>
            <MapPinPlus className="h-4 w-4" aria-hidden="true" />
            Add coordinates
          </button>
        )}
      </header>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onCreateDraftEstimate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-primary)] px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          <Calculator className="h-4 w-4" aria-hidden="true" />
          Create Draft Estimate
        </button>
        <button type="button" onClick={onEdit} disabled={!editable} className={BUTTON}>
          <Pencil className="h-4 w-4" aria-hidden="true" />
          Edit
        </button>
        {!confirmDelete && (
          <button type="button" onClick={() => setConfirmDelete(true)} disabled={!editable} className={BUTTON}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete
          </button>
        )}
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-300">
        A draft estimate copies the address, name and notes into the estimator. Nothing is priced, saved as a quote, or sent.
      </p>

      {confirmDelete && (
        <div role="group" aria-label="Confirm delete" className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
          <p className="font-medium">Delete this prospect from this browser? This cannot be undone.</p>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={remove} className="rounded-lg bg-red-700 px-3 py-1.5 font-medium text-white hover:bg-red-800">
              Yes, delete
            </button>
            <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
              Cancel
            </button>
          </div>
          {deleteError && <p role="alert" className="mt-2">{deleteError}</p>}
        </div>
      )}

      <dl className="divide-y divide-slate-200 dark:divide-slate-700">
        <Row label="Estimated window count">
          {prospect.windowCount !== undefined && prospect.countConfidence ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-slate-900 dark:text-white">{formatNumber(prospect.windowCount)}</span>
                <FactBadge kind={verifiedCount ? 'verified' : 'estimated'} />
              </div>
              <p className={META}>
                {COUNT_CONFIDENCE_LABELS[prospect.countConfidence]}
                {verifiedCount ? ' · marked verified by you' : ' · not verified'}
              </p>
            </>
          ) : (
            <span className="text-slate-700 dark:text-slate-200">Not entered</span>
          )}
        </Row>
        {prospect.stories !== undefined && (
          <Row label="Stories">
            <span className="font-medium text-slate-900 dark:text-white">{formatNumber(prospect.stories)}</span>
            {unverified}
          </Row>
        )}
        {prospect.squareFootage !== undefined && (
          <Row label="Square footage">
            <span className="font-medium text-slate-900 dark:text-white">{formatNumber(prospect.squareFootage)} sq ft</span>
            {unverified}
          </Row>
        )}
        <div className="py-3" data-fact="Status">
          <dt>
            <label htmlFor="quick-status" className={DT}>
              Status
            </label>
          </dt>
          <dd className="mt-1">
            <select
              id="quick-status"
              value={prospect.status}
              disabled={!editable}
              onChange={(e) => changeStatus(e.target.value as ProspectStatus)}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            >
              {PROSPECT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {PROSPECT_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <p role="status" className="mt-1 min-h-[1.25rem] text-xs text-slate-700 dark:text-slate-200" data-testid="status-message">
              {statusMessage}
              {undoChange && (
                <>
                  {' '}
                  <button type="button" onClick={undo} className="font-medium text-indigo-700 underline dark:text-indigo-300">
                    Undo
                  </button>
                </>
              )}
            </p>
            {prospect.followUpAt && <p className={META}>Follow up {formatIsoDate(prospect.followUpAt)}</p>}
          </dd>
        </div>
      </dl>

      {prospect.preliminaryPrice && (
        <section aria-labelledby="price-heading" className="rounded-xl border border-amber-300 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-950" data-testid="preliminary-price">
          <h3 id="price-heading" className="text-sm font-semibold text-amber-950 dark:text-amber-100">
            Preliminary price range · not a customer quote
          </h3>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
            {formatDollars(prospect.preliminaryPrice.low)} – {formatDollars(prospect.preliminaryPrice.high)}
          </p>
          <p className="text-xs text-amber-950 dark:text-amber-100">Your research figure. Price the job in the estimator before quoting.</p>
        </section>
      )}

      <NoteSection id="internal-notes-heading" title="Internal notes" text={prospect.internalNotes} />
      <NoteSection id="access-heading" title="Access and job complexity" text={prospect.accessNotes} />
      <NoteSection id="exterior-heading" title="Exterior scope" text={prospect.exteriorScope} />
      <NoteSection id="interior-heading" title="Interior scope" text={prospect.interiorScope} />

      {prospect.referenceUrls.length > 0 && (
        <section aria-labelledby="references-heading">
          <h3 id="references-heading" className="font-semibold text-slate-900 dark:text-white">
            Photo and reference links
          </h3>
          <ul className="mt-1 space-y-1 text-sm">
            {prospect.referenceUrls.map((url) => (
              <li key={url}>
                <SafeLink href={url}>{url}</SafeLink>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="sources-heading" data-testid="manual-provenance">
        <h3 id="sources-heading" className="font-semibold text-slate-900 dark:text-white">
          Source and history
        </h3>
        <dl className="mt-1 space-y-2 text-sm">
          <div>
            <dt className={DT}>Source</dt>
            <dd className="text-slate-900 dark:text-white">
              {MANUAL_SOURCE_LABELS[prospect.source.type]}
              {prospect.source.note && <span className="block text-slate-700 dark:text-slate-200">{prospect.source.note}</span>}
              {prospect.source.url && (
                <span className="block">
                  <SafeLink href={prospect.source.url}>{prospect.source.url}</SafeLink>
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className={DT}>Researched</dt>
            <dd className="text-slate-900 dark:text-white">{formatIsoDate(prospect.researchedAt)}</dd>
          </div>
          <div>
            <dt className={DT}>Record</dt>
            <dd className="text-slate-900 dark:text-white">
              Created {formatTimestamp(prospect.createdAt)}
              <span className="block">Last updated {formatTimestamp(prospect.updatedAt)}</span>
            </dd>
          </div>
        </dl>
      </section>
    </article>
  );
});

export default ManualProspectDetail;
