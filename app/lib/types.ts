export type CleaningType = 
  | 'post_construction'
  | 'rough'
  | 'final'
  | 'touchup'
  | 'rough_final_touchup'
  | 'pressure_washing_only'
  | 'window_cleaning_only';

export type PressureWashingServiceType =
  | 'concrete'
  | 'brick'
  | 'siding'
  | 'deck'
  | 'fence'
  | 'driveway'
  | 'sidewalk'
  | 'patio';

export interface FormData {
  projectType: string;
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
  pressureWashingServices: PressureWashingServiceType[];
  pressureWashingServiceAreas: {
    [key in PressureWashingServiceType]?: number;
  };
  needsWindowCleaning: boolean;
  chargeForWindowCleaning: boolean;
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
  salesTax: number;
  totalPrice: number;
  estimatedHours: number;
  pricePerSquareFoot: number;
  pressureWashingCost: number;
  pressureWashingServiceDetails?: {
    [key in PressureWashingServiceType]?: {
      area: number;
      cost: number;
    };
  };
  windowCleaningCost: number;
  displayCaseCost: number;
  aiRecommendations: string[];
  adjustedLineItems?: {[key: string]: number};
} 