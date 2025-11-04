/**
 * Simplified Pricing Constants
 * Consolidated and cleaned up pricing logic
 */

import { ProjectType, CleaningType } from './types';

// ===================== CORE PRICING =====================

export const BASE_RATE_PER_SQFT = 0.18;
export const SALES_TAX_RATE = 0.07;
export const PROFESSIONAL_MARKUP = 0.30; // 30% markup

// ===================== PROJECT TYPE MULTIPLIERS =====================

export const PROJECT_MULTIPLIERS: Record<ProjectType, number> = {
  restaurant: 1.5,
  medical: 1.6,
  office: 1.0,
  retail: 1.0,
  industrial: 1.3,
  educational: 1.25,
  hotel: 1.35,
  jewelry_store: 1.4,
  grocery_store: 1.3,
  yoga_studio: 1.15,
  kids_fitness: 1.25,
  bakery: 1.35,
  church: 1.2,
  arcade: 1.3,
  coffee_shop: 1.25,
  fire_station: 1.4,
  fast_food: 1.2,
  interactive_toy_store: 1.45,
  home_renovation: 1.4,
  building_shell: 1.1,
  other: 1.0
} as const;

// ===================== CLEANING TYPE MULTIPLIERS =====================

export const CLEANING_MULTIPLIERS: Record<CleaningType, number> = {
  rough: 0.8,
  final: 1.2, // Final clean now includes touchup (was 1.0)
  final_touchup: 1.2, // Final & touchup (same as final since final includes touchup)
  rough_final: 1.4, // Rough + final with touchup (adjusted from 1.2)
  rough_final_touchup: 1.6, // Rough + final with touchup + additional touchup (adjusted from 1.45)
  pressure_washing: 1.0,
  vct_only: 1.0,
  window_cleaning_only: 1.0
} as const;

// ===================== URGENCY MULTIPLIERS =====================

export const URGENCY_MULTIPLIERS: Record<number, number> = {
  1: 1.00, 2: 1.04, 3: 1.08, 4: 1.12, 5: 1.16,
  6: 1.20, 7: 1.24, 8: 1.28, 9: 1.32, 10: 1.40
} as const;

// ===================== ADDITIONAL SERVICES =====================

export const ADDITIONAL_SERVICES = {
  VCT_COST_PER_SQFT: 2.20,
  VCT_SMALL_JOB_THRESHOLD: 1000,
  VCT_LARGE_JOB_THRESHOLD: 5000,
  VCT_LARGE_JOB_RATE: 1.50,
  
  WINDOW_CLEANING: {
    STANDARD: 18,
    LARGE_MULTIPLIER: 1.6,
    HIGH_ACCESS_MULTIPLIER: 2.2
  },
  
  PRESSURE_WASHING: {
    SOFT_WASH: { rate: 0.18, minimum: 235 },
    ROOF_WASH: { rate: 0.50 },
    DRIVEWAY: { rate: 0.20 },
    DECK: { rate: 1.00 },
    DAILY_RATE: 1800
  },
  
  DISPLAY_CASE: 30,
  
  TRAVEL: {
    BASE_FEE: 100,
    HOURLY_INCREMENT: 100,
    AVERAGE_SPEED_MPH: 60
  },
  
  OVERNIGHT: {
    HOTEL_PER_NIGHT: 180,
    PER_DIEM_PER_DAY: 90,
    COORDINATION_FEE: 0.05
  },
  
  BUSINESS_FEES: {
    SCHEDULING: 99,
    INVOICING: 99
  }
} as const;

// ===================== HELPER FUNCTIONS =====================

export function getVCTCost(squareFootage: number): number {
  if (squareFootage < ADDITIONAL_SERVICES.VCT_SMALL_JOB_THRESHOLD) {
    return squareFootage * ADDITIONAL_SERVICES.VCT_COST_PER_SQFT;
  } else if (squareFootage <= ADDITIONAL_SERVICES.VCT_LARGE_JOB_THRESHOLD) {
    const ratio = (squareFootage - ADDITIONAL_SERVICES.VCT_SMALL_JOB_THRESHOLD) / 
                  (ADDITIONAL_SERVICES.VCT_LARGE_JOB_THRESHOLD - ADDITIONAL_SERVICES.VCT_SMALL_JOB_THRESHOLD);
    const rate = ADDITIONAL_SERVICES.VCT_COST_PER_SQFT - (ratio * 0.70);
    return squareFootage * rate;
  } else {
    return squareFootage * ADDITIONAL_SERVICES.VCT_LARGE_JOB_RATE;
  }
}

export function getTravelCost(distanceMiles: number): number {
  const driveTimeHours = distanceMiles / ADDITIONAL_SERVICES.TRAVEL.AVERAGE_SPEED_MPH;
  
  if (driveTimeHours <= 1) {
    return ADDITIONAL_SERVICES.TRAVEL.BASE_FEE;
  }
  
  const totalHours = Math.ceil(driveTimeHours);
  return ADDITIONAL_SERVICES.TRAVEL.BASE_FEE + 
         ((totalHours - 1) * ADDITIONAL_SERVICES.TRAVEL.HOURLY_INCREMENT);
}

export function getWindowCleaningCost(
  standard: number,
  large: number,
  highAccess: number
): number {
  const standardCost = standard * ADDITIONAL_SERVICES.WINDOW_CLEANING.STANDARD;
  const largeCost = large * ADDITIONAL_SERVICES.WINDOW_CLEANING.STANDARD * 
                    ADDITIONAL_SERVICES.WINDOW_CLEANING.LARGE_MULTIPLIER;
  const highAccessCost = highAccess * ADDITIONAL_SERVICES.WINDOW_CLEANING.STANDARD * 
                         ADDITIONAL_SERVICES.WINDOW_CLEANING.HIGH_ACCESS_MULTIPLIER;
  
  return standardCost + largeCost + highAccessCost;
}

export function getPressureWashingCost(
  type: keyof typeof ADDITIONAL_SERVICES.PRESSURE_WASHING,
  area: number
): number {
  const service = ADDITIONAL_SERVICES.PRESSURE_WASHING[type];
  
  if (type === 'DAILY_RATE') {
    return service as number;
  }
  
  const rate = (service as { rate: number; minimum?: number }).rate;
  const minimum = (service as { rate: number; minimum?: number }).minimum;
  
  const cost = area * rate;
  return minimum ? Math.max(cost, minimum) : cost;
}

export function getOvernightCost(
  cleaners: number,
  nights: number,
  distance: number
): number {
  const hotelRooms = Math.ceil(cleaners / 2);
  const hotelCost = hotelRooms * ADDITIONAL_SERVICES.OVERNIGHT.HOTEL_PER_NIGHT * nights;
  const perDiemCost = cleaners * ADDITIONAL_SERVICES.OVERNIGHT.PER_DIEM_PER_DAY * nights;
  
  // Additional vehicle costs for large teams
  let additionalVehicleCost = 0;
  if (cleaners > 2) {
    const additionalVehicles = Math.ceil(cleaners / 3) - 1;
    additionalVehicleCost = additionalVehicles * getTravelCost(distance);
  }
  
  const subtotal = hotelCost + perDiemCost + additionalVehicleCost;
  const coordinationFee = subtotal * ADDITIONAL_SERVICES.OVERNIGHT.COORDINATION_FEE;
  
  return subtotal + coordinationFee;
}

// ===================== RECOMMENDED CLEANERS =====================

export function getRecommendedCleaners(squareFootage: number): number {
  if (squareFootage < 2000) return 2;
  if (squareFootage < 5000) return 3;
  if (squareFootage < 10000) return 4;
  if (squareFootage < 20000) return 6;
  if (squareFootage < 40000) return 8;
  if (squareFootage < 60000) return 10;
  if (squareFootage < 80000) return 12;
  return 15;
}

// ===================== HOURS CALCULATION =====================

export function calculateHours(
  squareFootage: number,
  projectType: ProjectType,
  cleaningType: CleaningType
): number {
  const baseHours = squareFootage / 1000; // Base rate: 1000 sq ft per hour
  const projectMultiplier = PROJECT_MULTIPLIERS[projectType];
  const cleaningMultiplier = CLEANING_MULTIPLIERS[cleaningType];
  
  return Math.ceil(baseHours * projectMultiplier * cleaningMultiplier * 4) / 4;
}

