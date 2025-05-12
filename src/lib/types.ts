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
  | 'fast_food'
  | 'bakery'
  | 'coffee_shop'
  | 'dental_office'
  | 'pet_resort'
  | 'beauty_store'
  | 'interactive_toy_store'
  | 'mailroom'
  | 'church'
  | 'residential'
  | 'car_wash'
  | 'construction_trailor';

export type CleaningType = 'rough' | 'final' | 'rough_final' | 'rough_final_touchup' | 'pressure_washing_only' | 'window_cleaning_only';

export type PressureWashingServiceType = 
  | 'soft_wash'
  | 'roof_wash'
  | 'driveway'
  | 'deck'
  | 'trex_deck'
  | 'custom'
  | 'dumpster_corral'
  | 'commercial';

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
  pressureWashingServices?: PressureWashingServiceType[];
  pressureWashingServiceAreas?: {
    [key in PressureWashingServiceType]?: number;
  };
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
