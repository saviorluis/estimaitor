import { FormData, EstimateData, CleaningType, ProjectType } from './types';
import { 
  BASE_RATE_PER_SQFT, 
  PROJECT_TYPE_MULTIPLIERS, 
  CLEANING_TYPE_MULTIPLIERS,
  CLEANING_TYPE_TIME_MULTIPLIERS,
  VCT_COST_PER_SQFT,
  getTravelRate,
  calculateHourlyTravelFee,
  getDriveTimeHours,
  HOTEL_COST_PER_NIGHT,
  PER_DIEM_PER_DAY,
  PRESSURE_WASHING,
  PRESSURE_WASHING_RATES,
  WINDOW_CLEANING,
  DISPLAY_CASE,
  SALES_TAX_RATE,
  MARKUP_PERCENTAGE,
  URGENCY_MULTIPLIERS
} from './constants';

// ===================== CALCULATION CACHE =====================

// Cache for expensive calculations
const calculationCache = new Map<string, number>();

// Cache key generator for calculations
function generateCacheKey(prefix: string, ...params: (string | number | boolean)[]): string {
  return `${prefix}:${params.join(':')}`;
}

// ===================== OPTIMIZED CALCULATION FUNCTIONS =====================

function calculateBasePrice(
  squareFootage: number,
  projectType: ProjectType,
  cleaningType: CleaningType
): number {
  const cacheKey = generateCacheKey('basePrice', squareFootage, projectType, cleaningType);
  
  if (calculationCache.has(cacheKey)) {
    return calculationCache.get(cacheKey)!;
  }

  const projectMultiplier = PROJECT_TYPE_MULTIPLIERS[projectType];
  const cleaningMultiplier = CLEANING_TYPE_MULTIPLIERS[cleaningType];
  const result = squareFootage * BASE_RATE_PER_SQFT * projectMultiplier * cleaningMultiplier;
  
  calculationCache.set(cacheKey, result);
  return result;
}

function calculateTravelCost(distanceFromOffice: number): number {
  const cacheKey = generateCacheKey('travel', distanceFromOffice);
  
  if (calculationCache.has(cacheKey)) {
    return calculationCache.get(cacheKey)!;
  }

  // Use new hourly-based travel fee structure
  const result = calculateHourlyTravelFee(distanceFromOffice);
  
  calculationCache.set(cacheKey, result);
  return result;
}

function calculateOvernightCost(
  stayingOvernight: boolean,
  numberOfCleaners: number,
  numberOfNights: number,
  distanceFromOffice: number
): number {
  if (!stayingOvernight) return 0;

  const cacheKey = generateCacheKey('overnight', numberOfCleaners, numberOfNights, distanceFromOffice);
  
  if (calculationCache.has(cacheKey)) {
    return calculationCache.get(cacheKey)!;
  }

  // Hotel cost (2 people per room, with proper markup already applied)
  const hotelRooms = Math.ceil(numberOfCleaners / 2);
  const hotelCost = hotelRooms * HOTEL_COST_PER_NIGHT * numberOfNights;
  
  // Per diem cost (per person, with markup already applied)
  const perDiemCost = numberOfCleaners * PER_DIEM_PER_DAY * numberOfNights;
  
  // Additional vehicle costs for teams larger than 2 (using new hourly travel fee)
  let additionalVehicleCost = 0;
  if (numberOfCleaners > 2) {
    const additionalVehicles = Math.ceil(numberOfCleaners / 3) - 1;
    // Each additional vehicle needs the same travel fee
    additionalVehicleCost = additionalVehicles * calculateHourlyTravelFee(distanceFromOffice);
  }
  
  // Administrative fee for overnight coordination (5% of total costs)
  const subtotal = hotelCost + perDiemCost + additionalVehicleCost;
  const coordinationFee = subtotal * 0.05;
  
  const result = subtotal + coordinationFee;
  calculationCache.set(cacheKey, result);
  return result;
}

function calculatePressureWashingCost(
  needsPressureWashing: boolean,
  pressureWashingArea: number,
  pressureWashingType: 'soft_wash' | 'roof_wash' | 'driveway' | 'deck' | 'daily_rate'
): number {
  if (!needsPressureWashing) return 0;

  const cacheKey = generateCacheKey('pressureWashing', pressureWashingArea, pressureWashingType);
  
  if (calculationCache.has(cacheKey)) {
    return calculationCache.get(cacheKey)!;
  }

  let result = 0;

  switch (pressureWashingType) {
    case 'soft_wash':
      result = Math.max(pressureWashingArea * PRESSURE_WASHING_RATES.SOFT_WASH.rate, PRESSURE_WASHING_RATES.SOFT_WASH.minimum);
      break;
    case 'roof_wash':
      result = pressureWashingArea * PRESSURE_WASHING_RATES.ROOF_WASH.rate;
      break;
    case 'driveway':
      result = pressureWashingArea * PRESSURE_WASHING_RATES.DRIVEWAY.rate;
      break;
    case 'deck':
      result = pressureWashingArea * PRESSURE_WASHING_RATES.DECK.rate;
      break;
    case 'daily_rate':
      result = PRESSURE_WASHING_RATES.DAILY_RATE;
      break;
    default:
      result = 0;
  }
  
  calculationCache.set(cacheKey, result);
  return result;
}

function calculateWindowCleaningCost(
  needsWindowCleaning: boolean,
  chargeForWindowCleaning: boolean,
  numberOfWindows: number = 0,
  numberOfLargeWindows: number = 0,
  numberOfHighAccessWindows: number = 0
): number {
  if (!needsWindowCleaning || !chargeForWindowCleaning) return 0;

  const cacheKey = generateCacheKey(
    'windowCleaning',
    numberOfWindows,
    numberOfLargeWindows,
    numberOfHighAccessWindows
  );
  
  if (calculationCache.has(cacheKey)) {
    return calculationCache.get(cacheKey)!;
  }

  const standardCost = numberOfWindows * WINDOW_CLEANING.COST_PER_WINDOW;
  const largeCost = numberOfLargeWindows * WINDOW_CLEANING.COST_PER_WINDOW * WINDOW_CLEANING.LARGE_WINDOW_MULTIPLIER;
  const highAccessCost = numberOfHighAccessWindows * WINDOW_CLEANING.COST_PER_WINDOW * WINDOW_CLEANING.HIGH_ACCESS_MULTIPLIER;
  
  const result = standardCost + largeCost + highAccessCost;
  calculationCache.set(cacheKey, result);
  return result;
}

function calculateDisplayCaseCost(projectType: ProjectType, numberOfDisplayCases: number): number {
  if (projectType !== 'jewelry_store' || numberOfDisplayCases <= 0) return 0;

  const cacheKey = generateCacheKey('displayCase', numberOfDisplayCases);
  
  if (calculationCache.has(cacheKey)) {
    return calculationCache.get(cacheKey)!;
  }

  const result = numberOfDisplayCases * DISPLAY_CASE.COST_PER_CASE;
  calculationCache.set(cacheKey, result);
  return result;
}

// ===================== PROJECT TYPE TIME MODIFIERS =====================

const PROJECT_TYPE_TIME_MODIFIERS: Record<ProjectType, number> = {
  restaurant: 1.3,
  fast_food: 1.3,
  medical: 1.4,
  retail: 1.2,
  office: 1.0,
  industrial: 1.1,
  educational: 1.25,
  hotel: 1.35,
  jewelry_store: 1.4,
  grocery_store: 1.3,
  yoga_studio: 1.15,
  kids_fitness: 1.25,
  bakery: 1.35,
  interactive_toy_store: 1.45,
  church: 1.2,
  arcade: 1.3,
  other: 1.0
} as const;

// ===================== OPTIMIZED HOURS CALCULATION =====================

function calculateEstimatedHours(
  squareFootage: number,
  projectType: ProjectType,
  cleaningType: CleaningType
): number {
  const cacheKey = generateCacheKey('hours', squareFootage, projectType, cleaningType);
  
  if (calculationCache.has(cacheKey)) {
    return calculationCache.get(cacheKey)!;
  }

  let baseHours: number;

  // Special handling for jewelry stores
  if (projectType === 'jewelry_store') {
    baseHours = calculateJewelryStoreHours(squareFootage);
  } else {
    baseHours = calculateStandardHours(squareFootage);
  }
  
  // Apply modifiers
  const projectModifier = PROJECT_TYPE_TIME_MODIFIERS[projectType];
  const cleaningModifier = CLEANING_TYPE_TIME_MULTIPLIERS[cleaningType];
  
  const result = Math.ceil(baseHours * projectModifier * cleaningModifier * 4) / 4;
  calculationCache.set(cacheKey, result);
  return result;
}

function calculateJewelryStoreHours(squareFootage: number): number {
  if (squareFootage <= 1000) {
    return squareFootage / 750;
  } else if (squareFootage <= 5000) {
    return (1000 / 750) + ((squareFootage - 1000) / 1000);
  } else {
    return (1000 / 750) + (4000 / 1000) + ((squareFootage - 5000) / 1200);
  }
}

function calculateStandardHours(squareFootage: number): number {
  if (squareFootage <= 10000) {
    return squareFootage / 1000;
  }
  
  // Optimized tier calculation for large projects
  const initialHours = 10;
  let remainingSqFt = squareFootage - 10000;
  let additionalHours = 0;
  
  // Process tiers efficiently
  const tiers = [
    { limit: 15000, rate: 0.85 },
    { limit: 25000, rate: 0.75 },
    { limit: Infinity, rate: 0.65 }
  ];
  
  for (const tier of tiers) {
    if (remainingSqFt <= 0) break;
    
    const tierSqFt = Math.min(remainingSqFt, tier.limit);
    additionalHours += (tierSqFt / 1000) * tier.rate;
    remainingSqFt -= tierSqFt;
  }
  
  return initialHours + additionalHours;
}

function calculateAdditionalHours(
  needsPressureWashing: boolean,
  pressureWashingArea: number,
  needsWindowCleaning: boolean,
  numberOfWindows: number = 0,
  numberOfLargeWindows: number = 0,
  numberOfHighAccessWindows: number = 0,
  projectType: ProjectType,
  numberOfDisplayCases: number = 0
): number {
  let additionalHours = 0;

  // Pressure washing hours
  if (needsPressureWashing && pressureWashingArea > 0) {
    additionalHours += pressureWashingArea / PRESSURE_WASHING.PRODUCTIVITY_SQFT_PER_HOUR;
  }

  // Window cleaning hours
  if (needsWindowCleaning) {
    const cappedStandard = Math.min(numberOfWindows, WINDOW_CLEANING.MAX_STANDARD_WINDOWS);
    const cappedLarge = Math.min(numberOfLargeWindows, WINDOW_CLEANING.MAX_LARGE_WINDOWS);
    const cappedHighAccess = Math.min(numberOfHighAccessWindows, WINDOW_CLEANING.MAX_HIGH_ACCESS_WINDOWS);
    
    const totalWindows = cappedStandard + (cappedLarge * 1.5) + (cappedHighAccess * 2);
    const windowHours = Math.min(totalWindows / WINDOW_CLEANING.WINDOWS_PER_HOUR, WINDOW_CLEANING.MAX_TOTAL_HOURS);
    additionalHours += windowHours;
  }

  // Display case hours
  if (projectType === 'jewelry_store' && numberOfDisplayCases > 0) {
    additionalHours += numberOfDisplayCases * DISPLAY_CASE.TIME_PER_CASE_HOURS;
  }

  return additionalHours;
}

// ===================== MAIN CALCULATION FUNCTION =====================

export function calculateEstimate(formData: FormData): EstimateData {
  // Destructure with optimized access
  const {
    projectType,
    cleaningType,
    squareFootage,
    hasVCT,
    vctSquareFootage,
    distanceFromOffice,
    gasPrice: rawGasPrice,
    applyMarkup,
    stayingOvernight,
    numberOfNights,
    numberOfCleaners,
    urgencyLevel,
    needsPressureWashing,
    pressureWashingArea,
    pressureWashingType,
    needsWindowCleaning,
    chargeForWindowCleaning,
    numberOfWindows = 0,
    numberOfLargeWindows = 0,
    numberOfHighAccessWindows = 0,
    numberOfDisplayCases = 0
  } = formData;

  // Normalize gas price once
  const gasPrice = typeof rawGasPrice === 'string' ? parseFloat(rawGasPrice) : (rawGasPrice || 3.50);

  // Get multipliers once
  const projectTypeMultiplier = PROJECT_TYPE_MULTIPLIERS[projectType];
  const cleaningTypeMultiplier = CLEANING_TYPE_MULTIPLIERS[cleaningType];
  const urgencyMultiplier = URGENCY_MULTIPLIERS[urgencyLevel] || 1;

  // Calculate all cost components
  const basePrice = calculateBasePrice(squareFootage, projectType, cleaningType);
  const vctCost = hasVCT ? (vctSquareFootage || 0) * VCT_COST_PER_SQFT : 0;
  const travelCost = calculateTravelCost(distanceFromOffice);
  const overnightCost = calculateOvernightCost(stayingOvernight, numberOfCleaners, numberOfNights, distanceFromOffice);
  const pressureWashingCost = calculatePressureWashingCost(needsPressureWashing, pressureWashingArea, pressureWashingType);
  const windowCleaningCost = calculateWindowCleaningCost(
    needsWindowCleaning,
    chargeForWindowCleaning,
    numberOfWindows,
    numberOfLargeWindows,
    numberOfHighAccessWindows
  );
  const displayCaseCost = calculateDisplayCaseCost(projectType, numberOfDisplayCases);

  // Calculate totals
  const totalBeforeMarkup = (
    basePrice + vctCost + travelCost + overnightCost + 
    pressureWashingCost + windowCleaningCost + displayCaseCost
  ) * urgencyMultiplier;

  // Always apply 30% professional markup
  const markupAmount = totalBeforeMarkup * MARKUP_PERCENTAGE;
  const totalWithMarkup = totalBeforeMarkup + markupAmount;
  const salesTax = totalWithMarkup * SALES_TAX_RATE;
  const totalPrice = totalWithMarkup + salesTax;

  // Calculate hours
  const baseHours = calculateEstimatedHours(squareFootage, projectType, cleaningType);
  const additionalHours = calculateAdditionalHours(
    needsPressureWashing,
    pressureWashingArea,
    needsWindowCleaning,
    numberOfWindows,
    numberOfLargeWindows,
    numberOfHighAccessWindows,
    projectType,
    numberOfDisplayCases
  );
  const estimatedHours = baseHours + additionalHours;

  // Calculate price per square foot
  const pricePerSquareFoot = totalPrice / squareFootage;

  // Return optimized estimate data
  return {
    basePrice,
    cleaningTypeMultiplier,
    projectTypeMultiplier,
    vctCost,
    travelCost,
    overnightCost,
    urgencyMultiplier,
    totalBeforeMarkup,
    markup: markupAmount,
    salesTax,
    totalPrice,
    estimatedHours,
    pricePerSquareFoot,
    timeToCompleteInDays: Math.ceil(estimatedHours / 8), // Assuming 8-hour work days
    pressureWashingCost,
    windowCleaningCost,
    displayCaseCost,
    aiRecommendations: []
  };
}

// ===================== UTILITY FUNCTIONS =====================

export function recalculateHours(
  squareFootage: number, 
  projectType: ProjectType,
  cleaningType: CleaningType = 'final'
): number {
  return calculateEstimatedHours(squareFootage, projectType, cleaningType);
}

// Cache management
export function clearCalculationCache(): void {
  calculationCache.clear();
}

export function getCacheSize(): number {
  return calculationCache.size;
} 