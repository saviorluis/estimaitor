/**
 * Simplified Estimator - Uses EXACT same calculations as original
 * Ensures pricing consistency for user experience
 */

import { FormData, EstimateData } from './types';
import { calculateEstimate as originalCalculateEstimate } from './estimator';
import { SALES_TAX_RATE } from './salesTax';

export function calculateEstimate(formData: FormData, salesTaxRate: number = SALES_TAX_RATE): EstimateData {
  return originalCalculateEstimate(formData, salesTaxRate);
}
