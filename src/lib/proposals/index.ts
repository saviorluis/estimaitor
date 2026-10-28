import type { EstimateData, FormData } from '../types';
import { getQuoteDocumentAmounts } from '../utils';
import { createProposalJob, resolveServiceType } from './job';
import { allocateLineItems, resolveFacts, resolveLines } from './resolve';
import { windowCleaningTemplate } from './templates/windowCleaning';
import type {
  CrewLocale,
  CrewTemplate,
  ProposalDocument,
  ProposalJob,
  ProposalTokens,
  ResolvedCrewContent,
  ServiceProposalTemplate,
  ServiceType,
} from './types';

export * from './types';
export { resolveServiceType, normalizeWindowCounts, getWindowCounts, toCount } from './job';

const TEMPLATES: Partial<Record<ServiceType, ServiceProposalTemplate>> = {
  window_cleaning: windowCleaningTemplate,
};

/** Services not yet migrated to templates return null and keep their existing documents. */
export function getProposalTemplate(formData: Pick<FormData, 'cleaningType'>): ServiceProposalTemplate | null {
  return TEMPLATES[resolveServiceType(formData)] ?? null;
}

function resolveCrew(crew: CrewTemplate, job: ProposalJob, tokens: ProposalTokens): ResolvedCrewContent {
  return {
    serviceLabel: crew.serviceLabel,
    facts: resolveFacts(crew.facts, job),
    scopeOfWork: resolveLines(crew.scopeOfWork, job, tokens),
    excludedTitle: crew.excludedTitle,
    excluded: resolveLines(crew.excluded, job, tokens),
    sections: crew.sections.map((section) => ({ title: section.title, lines: resolveLines(section.lines, job, tokens) })),
  };
}

export function buildProposal(
  formData: FormData,
  estimateData: EstimateData,
  options: { preTaxSubtotal?: number } = {}
): ProposalDocument | null {
  const template = getProposalTemplate(formData);
  if (!template || !estimateData) return null;

  const job = createProposalJob(formData, estimateData);
  const tokens = template.tokens(job);
  const { subtotal, taxRate, salesTax, finalTotal } = getQuoteDocumentAmounts(
    job.formData,
    job.estimateData,
    options.preTaxSubtotal
  );
  const crew = {} as Record<CrewLocale, ResolvedCrewContent>;
  (Object.keys(template.crew) as CrewLocale[]).forEach((locale) => {
    crew[locale] = resolveCrew(template.crew[locale], job, tokens);
  });

  return {
    serviceType: template.serviceType,
    templateVersion: template.templateVersion,
    displayName: template.displayName,
    documentTitle: template.documentTitle,
    coverTitle: template.coverTitle,
    projectFacts: resolveFacts(template.projectFacts, job),
    scopeOfWork: resolveLines(template.scopeOfWork, job, tokens),
    included: resolveLines(template.included, job, tokens),
    excludedTitle: template.excludedTitle,
    excluded: resolveLines(template.excluded, job, tokens),
    assumptions: resolveLines(template.assumptions, job, tokens),
    lineItems: allocateLineItems(template.lineItems, job, subtotal),
    amounts: { subtotal, taxRate, salesTax, total: finalTotal },
    pricingNote: template.pricingNote,
    quoteNotes: template.quoteNotes,
    terms: resolveLines(template.terms, job, tokens),
    invoicePaymentTerms: template.invoicePaymentTerms,
    documents: template.documents,
    showCapabilityStatement: template.showCapabilityStatement,
    crew,
    missingInputs: template.missingInputs(job),
  };
}

/** "12 windows · Exterior glass" */
export function lineItemCaption(item: { quantity?: number; unit?: string; detail?: string }): string {
  const quantity =
    item.quantity !== undefined ? `${item.quantity.toLocaleString('en-US')}${item.unit ? ` ${item.unit}` : ''}` : '';
  return [quantity, item.detail].filter(Boolean).join(' · ');
}

/** Numbered terms text used to seed the quote editor's Terms & Conditions box. */
export function formatProposalTerms(terms: string[]): string {
  return terms.map((term, i) => `${i + 1}. ${term}`).join('\n');
}
