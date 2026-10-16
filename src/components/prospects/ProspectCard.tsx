'use client';

import { Bookmark, Building2, CalendarClock, HardHat, Home, MapPin } from 'lucide-react';
import { getSegment } from '@/lib/prospects/filters';
import { LEAD_STATUS_LABELS, type Prospect, type SavedLead } from '@/lib/prospects/types';
import { TONE_LABELS, TONE_PILL, formatIsoDate, formatNumber } from './styles';

const TONE_ICON = { commercial: Building2, residential: Home, construction: HardHat };

interface ProspectCardProps {
  prospect: Prospect;
  lead?: SavedLead;
  highlighted: boolean;
  onSelect: (id: string) => void;
  onHighlight: (id: string | null) => void;
}

export function prospectSummary(prospect: Prospect): string {
  return prospect.kind === 'property' ? prospect.buildingType.value : prospect.projectType;
}

export default function ProspectCard({ prospect, lead, highlighted, onSelect, onHighlight }: ProspectCardProps) {
  const tone = getSegment(prospect);
  const Icon = TONE_ICON[tone];
  const sqft = prospect.squareFootage?.value;
  const dateLine =
    prospect.kind === 'construction'
      ? prospect.bidDeadline
        ? `Bids due ${formatIsoDate(prospect.bidDeadline.value)}`
        : prospect.estimatedCompletion
          ? `Est. completion ${formatIsoDate(prospect.estimatedCompletion.value)}`
          : null
      : null;

  return (
    <button
      type="button"
      data-prospect-id={prospect.id}
      data-highlighted={highlighted ? 'true' : undefined}
      onClick={() => onSelect(prospect.id)}
      onMouseEnter={() => onHighlight(prospect.id)}
      onMouseLeave={() => onHighlight(null)}
      onFocus={() => onHighlight(prospect.id)}
      onBlur={() => onHighlight(null)}
      className={`group w-full rounded-xl border bg-white p-4 text-left transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] dark:bg-slate-800 ${
        highlighted
          ? 'border-[var(--brand-primary)] shadow-md'
          : 'border-slate-200 dark:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TONE_PILL[tone]}`}>
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          {TONE_LABELS[tone]}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">
          Sample data
        </span>
      </div>
      <h3 className="mt-2 text-base font-semibold text-slate-900 dark:text-white">{prospect.name}</h3>
      <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {prospect.address.city}, {prospect.address.state}
      </p>
      <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
        {prospectSummary(prospect)}
        {sqft ? <span className="text-slate-600 dark:text-slate-300"> · {formatNumber(sqft)} sq ft</span> : null}
      </p>
      {(dateLine || lead) && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          {dateLine && (
            <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-200">
              <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
              {dateLine}
            </span>
          )}
          {lead && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2 py-0.5 font-medium text-white dark:bg-white dark:text-slate-900">
              <Bookmark className="h-3 w-3" aria-hidden="true" />
              Lead · {LEAD_STATUS_LABELS[lead.status]}
            </span>
          )}
        </div>
      )}
    </button>
  );
}
