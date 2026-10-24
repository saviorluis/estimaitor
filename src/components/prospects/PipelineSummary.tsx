'use client';

import { NEXT_ACTIONS, type NextActionId } from '@/lib/prospects/insights';
import { PROSPECT_STATUSES, PROSPECT_STATUS_LABELS, type ProspectStatus } from '@/lib/prospects/types';

interface PipelineSummaryProps {
  nextCounts: Record<NextActionId, number>;
  statusCounts: Record<ProspectStatus, number>;
  activeNext: NextActionId | null;
  activeStatus: ProspectStatus | null;
  onNextChange: (next: NextActionId | null) => void;
  onStatusChange: (status: ProspectStatus | null) => void;
}

const CHIP = 'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-sm';
const chipTone = (active: boolean) =>
  active
    ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
    : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700';
const ROW_LABEL = 'shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300';

/** Counts cover all of your prospects; each chip filters the list and map to that group. */
export default function PipelineSummary({ nextCounts, statusCounts, activeNext, activeStatus, onNextChange, onStatusChange }: PipelineSummaryProps) {
  return (
    <section aria-label="Your pipeline" className="space-y-2" data-testid="pipeline-summary">
      <div role="group" aria-labelledby="next-actions-label" className="flex items-center gap-2 overflow-x-auto pb-1">
        <span id="next-actions-label" className={ROW_LABEL}>
          Next actions
        </span>
        {NEXT_ACTIONS.map(({ id, label }) => {
          const active = activeNext === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => onNextChange(active ? null : id)}
              className={`${CHIP} ${chipTone(active)}`}
              data-next-action={id}
            >
              {label}
              <span className="font-semibold tabular-nums">{nextCounts[id]}</span>
            </button>
          );
        })}
      </div>
      <div role="group" aria-labelledby="pipeline-label" className="flex items-center gap-2 overflow-x-auto pb-1">
        <span id="pipeline-label" className={ROW_LABEL}>
          Pipeline
        </span>
        {PROSPECT_STATUSES.map((s) => {
          const active = activeStatus === s;
          return (
            <button
              key={s}
              type="button"
              aria-pressed={active}
              onClick={() => onStatusChange(active ? null : s)}
              className={`${CHIP} ${chipTone(active)}`}
              data-status={s}
            >
              {PROSPECT_STATUS_LABELS[s]}
              <span className="font-semibold tabular-nums">{statusCounts[s]}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
