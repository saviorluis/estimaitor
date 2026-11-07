import { roundToCents } from '../utils';
import type {
  ChangeOrderDocument,
  ChangeOrderKind,
  ChangeOrderLine,
  ChangeOrderLineInput,
  ProposalDocument,
} from './types';

export const CHANGE_ORDER_STATUS = 'Proposed Change — Pending Customer Authorization';

export const CHANGE_ORDER_AUTHORIZATION =
  'Additional work is not authorized until the customer signs below. This change order does not change the original proposal until it is signed.';

export const CHANGE_ORDER_KIND_LABELS: Record<ChangeOrderKind, string> = {
  addition: 'Addition',
  removal: 'Removal',
  scope_change: 'Scope change',
};

export interface ChangeOrderSource {
  proposal: ProposalDocument;
  quoteNumber: string;
  date: string;
  clientName: string;
  clientCompany: string;
  clientPhone: string;
  clientEmail: string;
  projectName: string;
  projectAddress: string;
  lines: ChangeOrderLineInput[];
}

function fact(proposal: ProposalDocument, label: string): string {
  return proposal.projectFacts.find((item) => item.label === label)?.value ?? 'Not specified';
}

/** Blank, or a signed dollar amount. Anything else is not an amount. */
export function parseChangeAmount(raw: string): number | null {
  const cleaned = raw.trim().replace(/[$,]/g, '');
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? roundToCents(value) : null;
}

function signedAmount(kind: ChangeOrderKind, value: number): number {
  return kind === 'removal' ? -Math.abs(value) : value;
}

function isEntered(line: ChangeOrderLineInput): boolean {
  return Boolean(line.description.trim() || line.reason.trim() || line.amount.trim());
}

/**
 * Describes a proposed change to a window-cleaning proposal.
 * Totals are the sum of typed amounts only. Removals reduce the total.
 * No window rate, markup, or tax is applied, and the proposal argument is not changed.
 */
export function buildWindowChangeOrder(source: ChangeOrderSource): ChangeOrderDocument {
  const lines: ChangeOrderLine[] = source.lines.filter(isEntered).map((line) => {
    const parsed = parseChangeAmount(line.amount);
    return {
      id: line.id,
      kind: line.kind,
      label: CHANGE_ORDER_KIND_LABELS[line.kind],
      description: line.description.trim(),
      reason: line.reason.trim(),
      amount: parsed === null ? null : signedAmount(line.kind, parsed),
    };
  });

  const incomplete = lines.length === 0 || lines.some((line) => line.amount === null);
  const adjustment = incomplete ? null : roundToCents(lines.reduce((sum, line) => sum + (line.amount ?? 0), 0));

  return {
    statusLabel: CHANGE_ORDER_STATUS,
    authorization: CHANGE_ORDER_AUTHORIZATION,
    quoteNumber: source.quoteNumber,
    date: source.date,
    clientName: source.clientName.trim(),
    clientCompany: source.clientCompany.trim(),
    clientPhone: source.clientPhone.trim(),
    clientEmail: source.clientEmail.trim(),
    projectName: source.projectName.trim(),
    projectAddress: source.projectAddress.trim(),
    sides: fact(source.proposal, 'Sides Cleaned'),
    windowCount: fact(source.proposal, 'Windows'),
    originalTotal: source.proposal.amounts.total,
    lines,
    adjustment,
    revisedTotal: adjustment === null ? null : roundToCents(source.proposal.amounts.total + adjustment),
  };
}
