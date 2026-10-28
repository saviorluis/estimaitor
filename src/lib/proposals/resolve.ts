import { roundToCents } from '../utils';
import type {
  FactRule,
  LineItemRule,
  ProposalFact,
  ProposalJob,
  ProposalTokens,
  QuoteLineItem,
  TemplateText,
} from './types';

export function fillTokens(text: string, tokens: ProposalTokens): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => (key in tokens ? tokens[key] : match));
}

export function resolveLines(lines: TemplateText[], job: ProposalJob, tokens: ProposalTokens): string[] {
  return lines
    .filter((line) => typeof line === 'string' || line.when(job))
    .map((line) => fillTokens(typeof line === 'string' ? line : line.text, tokens))
    .filter((line) => line.trim().length > 0);
}

export function resolveFacts(rules: FactRule[], job: ProposalJob): ProposalFact[] {
  return rules.flatMap((rule) => {
    const value = rule.value(job);
    return value ? [{ label: rule.label, value }] : [];
  });
}

const UNEXPLAINED_COST_RULE: LineItemRule = {
  id: 'additional_services',
  description: 'Additional services',
  costBasis: () => 0,
};

/**
 * Splits the document subtotal across line items in proportion to each line's pre-markup cost,
 * the same method the quote has always used for the window-cleaning share. Each line is rounded to
 * the cent and the absorbing line takes the remainder, so the lines always add up to the subtotal.
 */
export function allocateLineItems(rules: LineItemRule[], job: ProposalJob, subtotal: number): QuoteLineItem[] {
  const totalCost = job.estimateData.totalBeforeMarkup || 0;
  const lines = rules
    .map((rule) => ({ rule, cost: rule.costBasis(job) }))
    .filter(({ rule, cost }) => !(rule.omitWhenZero && cost <= 0));

  const explained = lines.reduce((sum, line) => sum + line.cost, 0);
  if (totalCost - explained > 0.005) {
    lines.push({ rule: UNEXPLAINED_COST_RULE, cost: totalCost - explained });
  }
  if (lines.length === 0) return [];

  let absorbIndex = lines.findIndex(({ rule }) => rule.absorbsRounding);
  if (absorbIndex < 0) absorbIndex = lines.length - 1;

  const amounts = lines.map(({ cost }) => (totalCost > 0 ? roundToCents((subtotal * cost) / totalCost) : 0));
  const others = amounts.reduce((sum, amount, i) => (i === absorbIndex ? sum : sum + amount), 0);
  amounts[absorbIndex] = roundToCents(subtotal - others);

  return lines.map(({ rule }, i) => toLineItem(rule, job, amounts[i]));
}

function toLineItem(rule: LineItemRule, job: ProposalJob, amount: number): QuoteLineItem {
  const item: QuoteLineItem = { id: rule.id, description: rule.description, amount };
  const detail = rule.detail?.(job);
  if (detail) item.detail = detail;
  if (rule.quantity) item.quantity = rule.quantity(job);
  if (rule.unit) item.unit = rule.unit;
  return item;
}
