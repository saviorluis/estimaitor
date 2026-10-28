'use client';

import React from 'react';
import { lineItemCaption, type ProposalDocument } from '@/lib/proposals';
import { formatCurrency } from '@/lib/utils';
import { formatSalesTaxPercent } from '@/lib/salesTax';

interface ProposalSummaryProps {
  proposal: ProposalDocument;
  /** Show scope, inclusions, exclusions, and assumptions below the price table. */
  showSections?: boolean;
}

export default function ProposalSummary({ proposal, showSections = false }: ProposalSummaryProps) {
  const sections: [string, string[]][] = [
    ['Scope of Work', proposal.scopeOfWork],
    ['Included', proposal.included],
    [proposal.excludedTitle, proposal.excluded],
    ['Assumptions', proposal.assumptions],
  ];
  const { amounts } = proposal;

  return (
    <div className="space-y-4" data-testid="proposal-summary">
      {proposal.missingInputs.length > 0 && (
        <div
          role="alert"
          className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
        >
          <p className="font-medium">Before sending this proposal, add:</p>
          <ul className="mt-1 list-disc pl-5">
            {proposal.missingInputs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
        {proposal.projectFacts.map((fact) => (
          <div key={fact.label} className="flex justify-between gap-3">
            <dt className="text-gray-600 dark:text-gray-400">{fact.label}</dt>
            <dd className="text-right font-medium text-gray-800 dark:text-gray-200">{fact.value}</dd>
          </div>
        ))}
      </dl>

      <table className="w-full text-sm">
        <caption className="sr-only">{proposal.displayName} line items</caption>
        <thead>
          <tr className="border-b text-left text-gray-600 dark:text-gray-400">
            <th scope="col" className="py-1 font-medium">Item</th>
            <th scope="col" className="py-1 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {proposal.lineItems.map((item) => {
            const caption = lineItemCaption(item);
            return (
              <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-2">
                  <span className="text-gray-800 dark:text-gray-200">{item.description}</span>
                  {caption && <span className="block text-xs text-gray-500 dark:text-gray-400">{caption}</span>}
                </td>
                <td className="py-2 text-right text-gray-800 dark:text-gray-200">{formatCurrency(item.amount)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" className="pt-2 text-left font-medium text-gray-700 dark:text-gray-300">Subtotal</th>
            <td className="pt-2 text-right font-medium text-gray-800 dark:text-gray-200">
              {formatCurrency(amounts.subtotal)}
            </td>
          </tr>
          <tr>
            <th scope="row" className="text-left font-normal text-gray-600 dark:text-gray-400">
              Sales Tax ({formatSalesTaxPercent(amounts.taxRate)})
            </th>
            <td className="text-right text-gray-800 dark:text-gray-200">{formatCurrency(amounts.salesTax)}</td>
          </tr>
          <tr className="text-lg font-bold">
            <th scope="row" className="pt-1 text-left text-gray-800 dark:text-gray-200">Total</th>
            <td className="pt-1 text-right text-green-700 dark:text-green-400" data-testid="proposal-total">
              {formatCurrency(amounts.total)}
            </td>
          </tr>
        </tfoot>
      </table>

      {showSections && (
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          {sections
            .filter(([, lines]) => lines.length > 0)
            .map(([title, lines]) => (
              <section key={title}>
                <h4 className="mb-1 font-semibold text-gray-800 dark:text-gray-200">{title}</h4>
                <ul className="list-disc space-y-1 pl-5 text-gray-700 dark:text-gray-300">
                  {lines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </section>
            ))}
        </div>
      )}
    </div>
  );
}
