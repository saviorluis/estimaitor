import type { ProjectType } from '@/lib/types';

/** How sure we are about a single fact shown on a prospect. */
export type FactKind = 'verified' | 'reported' | 'estimated';
export type Confidence = 'high' | 'medium' | 'low';

export interface Fact<T> {
  value: T;
  kind: FactKind;
  sourceId?: string;
  confidence?: Confidence;
  /** ISO date (YYYY-MM-DD) */
  verifiedAt?: string;
  /** Required whenever kind is 'estimated'. */
  assumption?: string;
}

export type SourceType =
  | 'official_procurement'
  | 'public_permit'
  | 'official_announcement'
  | 'licensed_api'
  | 'authorized_feed'
  | 'user_supplied'
  | 'site_visit'
  | 'sample';

export interface Source {
  id: string;
  type: SourceType;
  name: string;
  url?: string;
  /** ISO date (YYYY-MM-DD) */
  retrievedAt: string;
  termsNote?: string;
}

export type ProspectCategory = 'commercial' | 'residential';
export type DataOrigin = 'sample' | 'manual' | 'import' | 'feed';

export interface ProspectAddress {
  line1: string;
  city: string;
  state: string;
  zip?: string;
}

export interface ProspectLocation {
  lat: number;
  lng: number;
  precision: 'rooftop' | 'street' | 'zip' | 'approximate';
  sourceId: string;
}

interface ProspectBase {
  id: string;
  name: string;
  category: ProspectCategory;
  address: ProspectAddress;
  location: ProspectLocation;
  /** Sample records are always labeled as such in the UI. */
  dataOrigin: DataOrigin;
  sources: Source[];
  /** ISO date (YYYY-MM-DD) */
  lastVerifiedAt?: string;
  notes?: string;
}

export interface PropertyProspect extends ProspectBase {
  kind: 'property';
  buildingType: Fact<string>;
  mapsToProjectType?: ProjectType;
  squareFootage?: Fact<number>;
  stories?: Fact<number>;
  windows?: { standard?: Fact<number>; large?: Fact<number>; highAccess?: Fact<number> };
  accessNotes?: string;
}

export interface Milestone {
  label: string;
  /** ISO date (YYYY-MM-DD) */
  date?: string;
  kind: FactKind;
  sourceId?: string;
  assumption?: string;
}

export interface ConstructionProspect extends ProspectBase {
  kind: 'construction';
  projectType: string;
  mapsToProjectType?: ProjectType;
  squareFootage?: Fact<number>;
  generalContractor?: Fact<string>;
  bidDeadline?: Fact<string>;
  milestones: Milestone[];
  estimatedCompletion?: Fact<string>;
}

export type Prospect = PropertyProspect | ConstructionProspect;

export const MANUAL_PROPERTY_TYPES = ['residential', 'commercial', 'construction'] as const;
export type ManualPropertyType = (typeof MANUAL_PROPERTY_TYPES)[number];

/** Only 'verified' means a person confirmed the count; every other level is an estimate. */
export const COUNT_CONFIDENCES = ['low', 'medium', 'high', 'verified'] as const;
export type CountConfidence = (typeof COUNT_CONFIDENCES)[number];
export const COUNT_CONFIDENCE_LABELS: Record<CountConfidence, string> = {
  low: 'Low confidence',
  medium: 'Medium confidence',
  high: 'High confidence',
  verified: 'Verified',
};

export const MANUAL_SOURCE_TYPES = [
  'site_visit',
  'client_provided',
  'public_record',
  'online_listing',
  'drive_by',
  'past_job',
  'other',
] as const;
export type ManualSourceType = (typeof MANUAL_SOURCE_TYPES)[number];
export const MANUAL_SOURCE_LABELS: Record<ManualSourceType, string> = {
  site_visit: 'Site visit',
  client_provided: 'Provided by owner or client',
  public_record: 'Public record',
  online_listing: 'Online listing',
  drive_by: 'Drive-by observation',
  past_job: 'Past job records',
  other: 'Other',
};

export const PROSPECT_STATUSES = ['new', 'researching', 'ready_to_quote', 'quoted', 'follow_up', 'won', 'lost'] as const;
export type ProspectStatus = (typeof PROSPECT_STATUSES)[number];
export const PROSPECT_STATUS_LABELS: Record<ProspectStatus, string> = {
  new: 'New',
  researching: 'Researching',
  ready_to_quote: 'Ready to quote',
  quoted: 'Quoted',
  follow_up: 'Follow-up',
  won: 'Won',
  lost: 'Lost',
};

/** A real prospect entered by hand. Stored in browser storage, never in the sample-data file. */
export interface ManualProspect {
  kind: 'manual';
  id: string;
  dataOrigin: 'manual';
  name?: string;
  propertyType: ManualPropertyType;
  address: Required<ProspectAddress>;
  coordinates?: { lat: number; lng: number };
  /** Optional; when present it always has a confidence. */
  windowCount?: number;
  countConfidence?: CountConfidence;
  source: { type: ManualSourceType; url?: string; note?: string };
  /** ISO date (YYYY-MM-DD) */
  researchedAt: string;
  status: ProspectStatus;
  internalNotes?: string;
  stories?: number;
  squareFootage?: number;
  accessNotes?: string;
  exteriorScope?: string;
  interiorScope?: string;
  /** Rough research figure only. The estimator is the source of truth for pricing. */
  preliminaryPrice?: { low: number; high: number };
  referenceUrls: string[];
  /** ISO date (YYYY-MM-DD) */
  followUpAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type AnyProspect = Prospect | ManualProspect;

/** The four tabs in the filter bar. Construction projects get their own tab regardless of category. */
export type ProspectSegment = 'all' | 'commercial' | 'residential' | 'construction';

export const LEAD_STATUSES = [
  'new',
  'researching',
  'contacted',
  'site_visit',
  'quoted',
  'won',
  'lost',
  'not_a_fit',
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  researching: 'Researching',
  contacted: 'Contacted',
  site_visit: 'Site visit',
  quoted: 'Quoted',
  won: 'Won',
  lost: 'Lost',
  not_a_fit: 'Not a fit',
};

export interface LeadNote {
  /** ISO timestamp */
  at: string;
  text: string;
}

export interface SavedLead {
  id: string;
  prospectId: string;
  status: LeadStatus;
  notes: LeadNote[];
  /** ISO date (YYYY-MM-DD) */
  followUpAt?: string;
  createdAt: string;
  updatedAt: string;
}
