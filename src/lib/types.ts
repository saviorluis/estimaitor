// ===================== CORE TYPES =====================

export type ProjectType = 
  | 'restaurant'
  | 'fast_food'
  | 'medical'
  | 'retail'
  | 'office'
  | 'industrial'
  | 'educational'
  | 'hotel'
  | 'jewelry_store'
  | 'grocery_store'
  | 'yoga_studio'
  | 'kids_fitness'
  | 'bakery'
  | 'interactive_toy_store'
  | 'church'
  | 'arcade'
  | 'other';

export type CleaningType = 'rough' | 'final' | 'rough_final' | 'rough_final_touchup';

// ===================== FORM DATA INTERFACE =====================

export interface FormData {
  // Project Information
  projectType: ProjectType;
  cleaningType: CleaningType;
  squareFootage: number;
  
  // Basic Options
  hasVCT: boolean;
  vctSquareFootage: number;
  distanceFromOffice: number;
  gasPrice: number;
  applyMarkup: boolean;
  
  // Team Configuration
  numberOfCleaners: number;
  urgencyLevel: number;
  
  // Overnight Stay
  stayingOvernight: boolean;
  numberOfNights: number;
  
  // Specialty Services
  needsPressureWashing: boolean;
  pressureWashingArea: number;
  needsWindowCleaning: boolean;
  chargeForWindowCleaning: boolean;
  
  // Window Details
  numberOfWindows: number;
  numberOfLargeWindows: number;
  numberOfHighAccessWindows: number;
  
  // Project-Specific
  numberOfDisplayCases: number;
  
  // Client Information (Optional)
  clientName?: string;
  projectName?: string;
}

// ===================== ESTIMATE DATA INTERFACE =====================

export interface EstimateData {
  // Base Calculations
  basePrice: number;
  cleaningTypeMultiplier: number;
  projectTypeMultiplier: number;
  
  // Additional Costs
  vctCost: number;
  travelCost: number;
  overnightCost: number;
  pressureWashingCost: number;
  windowCleaningCost: number;
  displayCaseCost: number;
  
  // Adjustments
  urgencyMultiplier: number;
  
  // Totals
  totalBeforeMarkup: number;
  markup: number;
  salesTax: number;
  totalPrice: number;
  
  // Time and Metrics
  estimatedHours: number;
  pricePerSquareFoot: number;
  
  // AI and Optional Data
  aiRecommendations: string[];
  adjustedLineItems?: Record<string, number>;
  windowCount?: number;
}

// ===================== AI RECOMMENDATION TYPES =====================

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

// ===================== UTILITY TYPES =====================

// Type for validation errors
export interface ValidationError {
  field: keyof FormData;
  message: string;
}

// Type for cost calculation breakdown
export interface CostBreakdown {
  description: string;
  amount: number;
  isOptional: boolean;
  category: 'base' | 'addon' | 'adjustment' | 'tax';
}

// Type for project metrics
export interface ProjectMetrics {
  efficiency: number; // cost per square foot
  laborProductivity: number; // square feet per hour per cleaner
  profitMargin: number; // percentage
  competitiveness: 'low' | 'medium' | 'high';
}

// ===================== PERFORMANCE OPTIMIZED TYPES =====================

// Readonly versions for immutable data
export type ReadonlyFormData = Readonly<FormData>;
export type ReadonlyEstimateData = Readonly<EstimateData>;

// Partial types for form updates
export type PartialFormData = Partial<FormData>;
export type FormDataUpdate = Pick<FormData, 'squareFootage' | 'projectType' | 'cleaningType' | 'numberOfCleaners'>;

// ===================== COMPONENT PROP TYPES =====================

// Common props for components that need form data
export interface FormDataProps {
  formData: FormData;
}

// Common props for components that need estimate data
export interface EstimateDataProps {
  estimateData: EstimateData;
}

// Combined props for complex components
export interface EstimateFormProps extends FormDataProps, EstimateDataProps {}

// ===================== CALCULATION CACHE TYPES =====================

export interface CalculationCache {
  key: string;
  value: number;
  timestamp: number;
  dependencies: Array<keyof FormData>;
}

export interface CacheStats {
  size: number;
  hitRate: number;
  missRate: number;
  totalRequests: number;
}

// ===================== TYPE GUARDS =====================

export function isValidProjectType(value: string): value is ProjectType {
  const validTypes: ProjectType[] = [
    'restaurant', 'fast_food', 'medical', 'retail', 'office', 'industrial',
    'educational', 'hotel', 'jewelry_store', 'grocery_store', 'yoga_studio',
    'kids_fitness', 'bakery', 'interactive_toy_store', 'church', 'arcade', 'other'
  ];
  return validTypes.includes(value as ProjectType);
}

export function isValidCleaningType(value: string): value is CleaningType {
  const validTypes: CleaningType[] = ['rough', 'final', 'rough_final', 'rough_final_touchup'];
  return validTypes.includes(value as CleaningType);
}

export function isValidFormData(data: unknown): data is FormData {
  if (!data || typeof data !== 'object') return false;
  
  const formData = data as Partial<FormData>;
  
  return (
    isValidProjectType(formData.projectType as string) &&
    isValidCleaningType(formData.cleaningType as string) &&
    typeof formData.squareFootage === 'number' &&
    formData.squareFootage > 0 &&
    typeof formData.numberOfCleaners === 'number' &&
    formData.numberOfCleaners > 0
  );
}

// ===================== LEGACY COMPATIBILITY =====================

// For backward compatibility with existing code
export type { FormData as LegacyFormData };
export type { EstimateData as LegacyEstimateData };

// ===================== EXPORT COLLECTIONS =====================

// Export all core types as a collection for easier imports
export type CoreTypes = {
  ProjectType: ProjectType;
  CleaningType: CleaningType;
  FormData: FormData;
  EstimateData: EstimateData;
};

// Export all utility types
export type UtilityTypes = {
  ValidationError: ValidationError;
  CostBreakdown: CostBreakdown;
  ProjectMetrics: ProjectMetrics;
  CalculationCache: CalculationCache;
  CacheStats: CacheStats;
};
