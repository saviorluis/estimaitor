'use client';

import { forwardRef } from 'react';
import { ArrowLeft, Building2, CalendarCheck, HardHat, Home, Info, MapPin } from 'lucide-react';
import { getSegment } from '@/lib/prospects/filters';
import type { Fact, FactKind, Prospect, Source } from '@/lib/prospects/types';
import FactBadge from './FactBadge';
import LeadPanel from './LeadPanel';
import type { LeadsApi } from './useLeads';
import { TONE_LABELS, TONE_PILL, formatIsoDate, formatNumber } from './styles';

const TONE_ICON = { commercial: Building2, residential: Home, construction: HardHat };
const CONFIDENCE_LABEL = { high: 'High confidence', medium: 'Medium confidence', low: 'Low confidence' };
const PRECISION_LABEL = {
  rooftop: 'exact building',
  street: 'street level',
  zip: 'ZIP code area',
  approximate: 'approximate area',
};

interface FactRowProps<T> {
  label: string;
  fact?: Fact<T>;
  format: (value: T) => string;
  sources: Map<string, Source>;
}

function FactRow<T>({ label, fact, format, sources }: FactRowProps<T>) {
  if (!fact) return null;
  return (
    <ProvenanceRow
      label={label}
      value={format(fact.value)}
      kind={fact.kind}
      sources={sources}
      sourceId={fact.sourceId}
      confidence={fact.confidence}
      verifiedAt={fact.verifiedAt}
      assumption={fact.assumption}
    />
  );
}

interface ProvenanceRowProps {
  label: string;
  value: string;
  kind: FactKind;
  sources: Map<string, Source>;
  sourceId?: string;
  confidence?: Fact<unknown>['confidence'];
  verifiedAt?: string;
  assumption?: string;
}

function ProvenanceRow({ label, value, kind, sources, sourceId, confidence, verifiedAt, assumption }: ProvenanceRowProps) {
  const source = sourceId ? sources.get(sourceId) : undefined;
  const meta = [
    source?.name,
    confidence ? CONFIDENCE_LABEL[confidence] : null,
    verifiedAt ? `Verified ${formatIsoDate(verifiedAt)}` : null,
  ].filter(Boolean);
  return (
    <div className="py-3" data-fact={label}>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">{label}</dt>
      <dd className="mt-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-slate-900 dark:text-white">{value}</span>
          <FactBadge kind={kind} />
        </div>
        {kind === 'estimated' && (
          <p className="mt-1 text-sm text-amber-900 dark:text-amber-200">
            Assumption: {assumption || 'Not stated. Treat this value as unconfirmed.'}
          </p>
        )}
        {meta.length > 0 && <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">{meta.join(' · ')}</p>}
      </dd>
    </div>
  );
}

interface ProspectDetailProps {
  prospect: Prospect;
  leads: LeadsApi;
  onClose: () => void;
  closeLabel: string;
}

const ProspectDetail = forwardRef<HTMLHeadingElement, ProspectDetailProps>(function ProspectDetail(
  { prospect, leads, onClose, closeLabel },
  headingRef
) {
  const tone = getSegment(prospect);
  const Icon = TONE_ICON[tone];
  const sources = new Map(prospect.sources.map((s) => [s.id, s]));
  const sqft = (n: number) => `${formatNumber(n)} sq ft`;
  const count = (n: number) => formatNumber(n);

  return (
    <article aria-labelledby="prospect-detail-heading" className="space-y-5" data-testid="prospect-detail">
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
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">
            Sample data
          </span>
        </div>
        <h2
          id="prospect-detail-heading"
          ref={headingRef}
          tabIndex={-1}
          className="mt-2 text-2xl font-semibold text-slate-900 focus:outline-none dark:text-white"
        >
          {prospect.name}
        </h2>
        <p className="mt-1 flex items-start gap-1 text-sm text-slate-600 dark:text-slate-300">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            {prospect.address.line1}, {prospect.address.city}, {prospect.address.state} {prospect.address.zip}
            <span className="block text-xs">Map position: {PRECISION_LABEL[prospect.location.precision]}</span>
          </span>
        </p>
      </header>

      {prospect.dataOrigin === 'sample' && (
        <p className="flex gap-2 rounded-lg bg-slate-100 p-3 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Fictional sample record for the demo. Names, addresses and figures are invented.
        </p>
      )}

      <dl className="divide-y divide-slate-200 dark:divide-slate-700">
        {prospect.kind === 'property' ? (
          <>
            <FactRow label="Building type" fact={prospect.buildingType} format={String} sources={sources} />
            <FactRow label="Square footage" fact={prospect.squareFootage} format={sqft} sources={sources} />
            <FactRow label="Stories" fact={prospect.stories} format={count} sources={sources} />
            <FactRow label="Standard windows" fact={prospect.windows?.standard} format={count} sources={sources} />
            <FactRow label="Large windows" fact={prospect.windows?.large} format={count} sources={sources} />
            <FactRow label="High-access windows" fact={prospect.windows?.highAccess} format={count} sources={sources} />
          </>
        ) : (
          <>
            <div className="py-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">Project</dt>
              <dd className="mt-1 font-medium text-slate-900 dark:text-white">{prospect.projectType}</dd>
            </div>
            <FactRow label="Square footage" fact={prospect.squareFootage} format={sqft} sources={sources} />
            <FactRow label="General contractor" fact={prospect.generalContractor} format={String} sources={sources} />
            <FactRow label="Bid deadline" fact={prospect.bidDeadline} format={formatIsoDate} sources={sources} />
            <FactRow label="Estimated completion" fact={prospect.estimatedCompletion} format={formatIsoDate} sources={sources} />
          </>
        )}
      </dl>

      {prospect.kind === 'construction' && prospect.milestones.length > 0 && (
        <section aria-labelledby="milestones-heading">
          <h3 id="milestones-heading" className="font-semibold text-slate-900 dark:text-white">
            Milestones
          </h3>
          <ol className="mt-2 space-y-3 border-l-2 border-slate-200 pl-4 dark:border-slate-700">
            {prospect.milestones.map((m) => (
              <li key={m.label}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{m.label}</span>
                  <FactBadge kind={m.kind} />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {m.date ? formatIsoDate(m.date) : 'Date not known'}
                  {m.sourceId && sources.get(m.sourceId) ? ` · ${sources.get(m.sourceId)!.name}` : ''}
                </p>
                {m.kind === 'estimated' && (
                  <p className="text-xs text-amber-900 dark:text-amber-200">
                    Assumption: {m.assumption || 'Not stated. Treat this as unconfirmed.'}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {prospect.kind === 'property' && prospect.accessNotes && (
        <section aria-labelledby="access-heading">
          <h3 id="access-heading" className="font-semibold text-slate-900 dark:text-white">
            Access notes
          </h3>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{prospect.accessNotes}</p>
        </section>
      )}

      <LeadPanel key={prospect.id} prospectId={prospect.id} leads={leads} />

      <section aria-labelledby="sources-heading">
        <h3 id="sources-heading" className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <CalendarCheck className="h-4 w-4" aria-hidden="true" />
          Sources
        </h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          {prospect.lastVerifiedAt ? `Last verified ${formatIsoDate(prospect.lastVerifiedAt)}` : 'Not yet verified by a person'}
        </p>
        <ul className="mt-2 space-y-2">
          {prospect.sources.map((s) => (
            <li key={s.id} className="text-sm">
              <span className="font-medium text-slate-900 dark:text-white">{s.name}</span>
              <span className="text-slate-600 dark:text-slate-300"> · retrieved {formatIsoDate(s.retrievedAt)}</span>
              {s.termsNote && <span className="block text-xs text-slate-600 dark:text-slate-300">{s.termsNote}</span>}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
});

export default ProspectDetail;
