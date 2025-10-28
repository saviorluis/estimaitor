/**
 * Simplified Estimator - Uses EXACT same calculations as original
 * Ensures pricing consistency for user experience
 */

import { FormData, EstimateData } from './types';
import { calculateEstimate as originalCalculateEstimate } from './estimator';

// Re-export the original calculation function to maintain exact pricing
export function calculateEstimate(formData: FormData): EstimateData {
  // Use the original calculation logic to ensure pricing stays exactly the same
  return originalCalculateEstimate(formData);
}
