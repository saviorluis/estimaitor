import type { EstimateData, FormData } from '../types';
import type { ProposalJob, ServiceType, WindowCounts } from './types';

export function resolveServiceType(formData: Pick<FormData, 'cleaningType'>): ServiceType {
  if (formData.cleaningType === 'window_cleaning_only') return 'window_cleaning';
  if (formData.cleaningType === 'pressure_washing') return 'pressure_washing';
  return 'cleaning';
}

/** Form inputs arrive as strings; blank, negative, or unparseable counts become 0. */
export function toCount(value: unknown): number {
  const n = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Window counts as numbers. Pricing already coerced them the same way, so totals do not change. */
export function normalizeWindowCounts<T extends Partial<FormData>>(formData: T): T {
  return {
    ...formData,
    numberOfWindows: toCount(formData.numberOfWindows),
    numberOfLargeWindows: toCount(formData.numberOfLargeWindows),
    numberOfHighAccessWindows: toCount(formData.numberOfHighAccessWindows),
  };
}

export function getWindowCounts(formData: Partial<FormData>): WindowCounts {
  const standard = toCount(formData.numberOfWindows);
  const large = toCount(formData.numberOfLargeWindows);
  const highAccess = toCount(formData.numberOfHighAccessWindows);
  return { standard, large, highAccess, total: standard + large + highAccess };
}

export function createProposalJob(formData: FormData, estimateData: EstimateData): ProposalJob {
  return {
    formData: normalizeWindowCounts(formData),
    estimateData,
    windows: getWindowCounts(formData),
  };
}
