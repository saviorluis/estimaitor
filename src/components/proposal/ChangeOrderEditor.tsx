'use client';

import React from 'react';
import {
  CHANGE_ORDER_AUTHORIZATION,
  CHANGE_ORDER_KIND_LABELS,
  CHANGE_ORDER_STATUS,
  type ChangeOrderKind,
  type ChangeOrderLineInput,
} from '@/lib/proposals';
import { formatCurrency } from '@/lib/utils';

const KINDS = Object.keys(CHANGE_ORDER_KIND_LABELS) as ChangeOrderKind[];

interface ChangeOrderEditorProps {
  lines: ChangeOrderLineInput[];
  onChange: (lines: ChangeOrderLineInput[]) => void;
  originalTotal: number;
  adjustment: number | null;
  revisedTotal: number | null;
}

export default function ChangeOrderEditor({
  lines,
  onChange,
  originalTotal,
  adjustment,
  revisedTotal,
}: ChangeOrderEditorProps) {
  const update = (id: string, patch: Partial<ChangeOrderLineInput>) => {
    onChange(lines.map((line) => (line.id === id ? { ...line, ...patch } : line)));
  };

  const addLine = () => {
    onChange([
      ...lines,
      { id: `change-${lines.length + 1}-${Date.now()}`, kind: 'addition', description: '', reason: '', amount: '' },
    ]);
  };

  return (
    <section
      aria-labelledby="change-order-heading"
      className="mb-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700"
      data-testid="change-order-editor"
    >
      <h4 id="change-order-heading" className="text-base font-semibold text-gray-800 dark:text-gray-200">
        Proposed change
      </h4>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Type each dollar change yourself. Removals reduce the total. Window rates, markup, and tax are not added.
        The original quote stays {formatCurrency(originalTotal)} until the customer signs.
      </p>
      <div
        className="mt-3 rounded-md border-2 border-orange-700 bg-orange-50 p-3 dark:border-orange-400 dark:bg-orange-950"
        data-testid="change-order-authorization"
      >
        <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">{CHANGE_ORDER_STATUS}</p>
        <p className="mt-1 text-sm text-orange-950 dark:text-orange-50">{CHANGE_ORDER_AUTHORIZATION}</p>
      </div>

      <div className="mt-3 space-y-3">
        {lines.map((line, index) => (
          <fieldset key={line.id} className="rounded-md border border-gray-200 p-3 dark:border-gray-700">
            <legend className="px-1 text-sm font-medium text-gray-700 dark:text-gray-300">Change {index + 1}</legend>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label htmlFor={`${line.id}-kind`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Change type
                </label>
                <select
                  id={`${line.id}-kind`}
                  value={line.kind}
                  onChange={(event) => update(line.id, { kind: event.target.value as ChangeOrderKind })}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-slate-800"
                >
                  {KINDS.map((kind) => (
                    <option key={kind} value={kind}>
                      {CHANGE_ORDER_KIND_LABELS[kind]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor={`${line.id}-amount`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Amount
                </label>
                <input
                  id={`${line.id}-amount`}
                  inputMode="decimal"
                  value={line.amount}
                  onChange={(event) => update(line.id, { amount: event.target.value })}
                  placeholder="0.00"
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-slate-800"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor={`${line.id}-description`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <input
                  id={`${line.id}-description`}
                  value={line.description}
                  onChange={(event) => update(line.id, { description: event.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-slate-800"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor={`${line.id}-reason`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reason
                </label>
                <input
                  id={`${line.id}-reason`}
                  value={line.reason}
                  onChange={(event) => update(line.id, { reason: event.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-slate-800"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => onChange(lines.filter((item) => item.id !== line.id))}
              className="mt-2 text-sm text-red-700 dark:text-red-400"
            >
              Remove change {index + 1}
            </button>
          </fieldset>
        ))}
      </div>

      <button
        type="button"
        onClick={addLine}
        className="mt-3 rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
      >
        Add change
      </button>

      <p className="mt-3 text-sm text-gray-800 dark:text-gray-200" data-testid="change-order-totals">
        {adjustment === null || revisedTotal === null
          ? 'Price adjustment and revised total stay blank until every change has an amount.'
          : `Price adjustment ${formatCurrency(adjustment)}. Revised total ${formatCurrency(revisedTotal)}.`}
      </p>
    </section>
  );
}
