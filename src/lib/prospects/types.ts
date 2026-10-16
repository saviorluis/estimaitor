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
