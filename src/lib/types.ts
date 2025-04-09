export type ProjectType = 
  | 'restaurant'
  | 'medical'
  | 'office'
  | 'retail'
  | 'industrial'
  | 'educational'
  | 'hotel'
  | 'jewelry_store'
  | 'apartment'
  | 'warehouse'
  | 'dormitory'
  | 'grocery_store'
  | 'yoga_studio'
  | 'kids_fitness'
  | 'fast_food';

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
  chargeForWindowCleaning: boolean;
  numberOfWindows: number;
  numberOfLargeWindows: number;
  numberOfHighAccessWindows: number;
  numberOfDisplayCases: number;
  clientName?: string;
  projectName?: string;
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
  salesTax: number;
  totalPrice: number;
  estimatedHours: number;
  pricePerSquareFoot: number;
  pressureWashingCost: number;
  windowCleaningCost: number;
  displayCaseCost: number;
  aiRecommendations: string[];
  adjustedLineItems?: {[key: string]: number};
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
