import type { EstimateData, FormData } from '../types';

export type ServiceType = 'cleaning' | 'window_cleaning' | 'pressure_washing';

export type DocumentKind = 'quote' | 'work_order' | 'work_order_es' | 'purchase_order' | 'invoice' | 'change_order';

export type CrewLocale = 'en' | 'es';

export interface WindowCounts {
  standard: number;
  large: number;
  highAccess: number;
  total: number;
}

/** Normalized job facts the templates read. */
export interface ProposalJob {
  formData: FormData;
  estimateData: EstimateData;
  windows: WindowCounts;
}

/** Template text. `{token}` placeholders are filled from the template's tokens; `when` limits a line to matching jobs. */
export type TemplateText = string | { text: string; when: (job: ProposalJob) => boolean };

export type ProposalTokens = Record<string, string>;

export interface ProposalFact {
  label: string;
  value: string;
}

export interface FactRule {
  label: string;
  /** Returning null leaves the fact off the document. */
  value: (job: ProposalJob) => string | null;
}

export interface QuoteLineItem {
  id: string;
  description: string;
  detail?: string;
  quantity?: number;
  unit?: string;
  /** Pre-tax dollars, cent-rounded; the priced lines of a document sum exactly to its subtotal. */
  amount: number;
}

export interface LineItemRule {
  id: string;
  description: string;
  detail?: (job: ProposalJob) => string | undefined;
  quantity?: (job: ProposalJob) => number;
  unit?: string;
  /** Pre-markup cost this line represents, read from the estimate. Never computes a price. */
  costBasis: (job: ProposalJob) => number;
  omitWhenZero?: boolean;
  /** Takes the cent remainder so the lines add up to the subtotal. */
  absorbsRounding?: boolean;
}

export interface CrewSectionTemplate {
  title: string;
  lines: TemplateText[];
}

export interface CrewTemplate {
  serviceLabel: string;
  facts: FactRule[];
  scopeOfWork: TemplateText[];
  excludedTitle: string;
  excluded: TemplateText[];
  sections: CrewSectionTemplate[];
}

export interface ServiceProposalTemplate {
  serviceType: ServiceType;
  templateVersion: number;
  displayName: string;
  documentTitle: string;
  coverTitle: [string, string];
  projectFacts: FactRule[];
  scopeOfWork: TemplateText[];
  included: TemplateText[];
  excludedTitle: string;
  excluded: TemplateText[];
  assumptions: TemplateText[];
  lineItems: LineItemRule[];
  pricingNote: string;
  quoteNotes: string;
  terms: TemplateText[];
  invoicePaymentTerms: string;
  documents: DocumentKind[];
  showCapabilityStatement: boolean;
  crew: Record<CrewLocale, CrewTemplate>;
  tokens: (job: ProposalJob) => ProposalTokens;
  /** Inputs the proposal needs but the job does not have yet (e.g. estimates saved before a field existed). */
  missingInputs: (job: ProposalJob) => string[];
}

export interface ResolvedCrewSection {
  title: string;
  lines: string[];
}

export interface ResolvedCrewContent {
  serviceLabel: string;
  facts: ProposalFact[];
  scopeOfWork: string[];
  excludedTitle: string;
  excluded: string[];
  sections: ResolvedCrewSection[];
}

export interface ProposalAmounts {
  subtotal: number;
  taxRate: number;
  salesTax: number;
  total: number;
}

/** The single resolved object every document and preview renders. */
export interface ProposalDocument {
  serviceType: ServiceType;
  templateVersion: number;
  displayName: string;
  documentTitle: string;
  coverTitle: [string, string];
  projectFacts: ProposalFact[];
  scopeOfWork: string[];
  included: string[];
  excludedTitle: string;
  excluded: string[];
  assumptions: string[];
  lineItems: QuoteLineItem[];
  amounts: ProposalAmounts;
  pricingNote: string;
  quoteNotes: string;
  terms: string[];
  invoicePaymentTerms: string;
  documents: DocumentKind[];
  showCapabilityStatement: boolean;
  crew: Record<CrewLocale, ResolvedCrewContent>;
  missingInputs: string[];
}
