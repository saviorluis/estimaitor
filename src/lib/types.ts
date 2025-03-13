export type ProjectType = 'restaurant' | 'medical' | 'office' | 'retail' | 'industrial' | 'educational' | 'hotel' | 'jewelry_store';

export type CleaningType = 'rough' | 'final' | 'powder_puff' | 'complete';

export interface FormData {
  projectType: ProjectType;
  cleaningType: CleaningType;
  squareFootage: number;
  hasVCT: boolean;
  distanceFromOffice: number;
  gasPrice: number;
  applyMarkup: boolean;
  stayingOvernight: boolean;
  numberOfNights: number;
  numberOfCleaners: number;
  urgencyLevel: number;
  needsPressureWashing: boolean;
  pressureWashingArea: number;
  needsWindowCleaning: boolean;
  numberOfWindows: number;
  numberOfLargeWindows: number;
  numberOfHighAccessWindows: number;
  numberOfDisplayCases: number;
}

export interface EstimateData {
  basePrice: number;
  cleaningTypeMultiplier: number;
  projectTypeMultiplier: number;
  vctCost: number;
  travelCost: number;
  overnightCost: number;
  urgencyMultiplier: number;
  totalBeforeMarkup: number;
  markup: number;
  totalPrice: number;
  estimatedHours: number;
  pricePerSquareFoot: number;
  pressureWashingCost: number;
  windowCleaningCost: number;
  displayCaseCost: number;
  aiRecommendations: string[];
}

export interface AIRecommendationRequest {
  projectType: ProjectType;
  cleaningType: CleaningType;
  squareFootage: number;
  hasVCT: boolean;
  estimatedHours: number;
  numberOfCleaners: number;
  urgencyLevel: number;
  needsPressureWashing: boolean;
  needsWindowCleaning?: boolean;
  numberOfWindows?: number;
  numberOfLargeWindows?: number;
  numberOfHighAccessWindows?: number;
}

export interface AIRecommendationResponse {
  recommendations: string[];
} 