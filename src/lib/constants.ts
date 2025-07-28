import { ProjectType, CleaningType } from './types';

// ===================== CORE PRICING CONSTANTS =====================

// Base rate per square foot (in dollars)
export const BASE_RATE_PER_SQFT = 0.18;

// VCT (Vinyl Composition Tile) additional cost per square foot
export const VCT_COST_PER_SQFT = 0.15;

// Sales tax rate
export const SALES_TAX_RATE = 0.07;

// Markup percentage (50% markup = 0.5)
export const MARKUP_PERCENTAGE = 0.5;

// ===================== PROJECT TYPE MULTIPLIERS =====================

export const PROJECT_TYPE_MULTIPLIERS: Record<ProjectType, number> = {
  restaurant: 1.5,
  fast_food: 1.2,
  medical: 1.6,
  retail: 1.0,
  office: 1.0,
  industrial: 1.3,
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

// ===================== CLEANING TYPE CONSTANTS =====================

export const CLEANING_TYPE_MULTIPLIERS: Record<CleaningType, number> = {
  rough: 0.8,
  final: 1.0,
  rough_final: 1.2,
  rough_final_touchup: 1.45,
  pressure_washing: 1.0
} as const;

export const CLEANING_TYPE_TIME_MULTIPLIERS: Record<CleaningType, number> = {
  rough: 0.7,
  final: 1.0,
  rough_final: 1.5,
  rough_final_touchup: 1.8,
  pressure_washing: 1.0
} as const;

export const CLEANING_TYPE_DESCRIPTIONS: Record<CleaningType, string> = {
  rough: "First stage cleaning that focuses on debris removal and basic surface cleaning (80% of standard rate).",
  final: "Complete detailed cleaning of all surfaces and areas (standard rate).",
  rough_final: "Combination of first stage rough clean followed by final clean (120% of standard rate).",
  rough_final_touchup: "Complete three-stage process: rough, final, and touch-up clean (145% of standard rate).",
  pressure_washing: "Professional pressure washing services with appropriate equipment and chemicals (standard rate)."
} as const;

// ===================== TRAVEL AND LOGISTICS =====================

// New hourly-based travel fee structure
export const TRAVEL_FEES = {
  BASE_FEE: 100, // Within 1 hour: $100
  HOURLY_INCREMENT: 100, // Add $100 for each additional hour
  AVERAGE_SPEED_MPH: 60 // Average driving speed for time calculations
} as const;

// Legacy constants (kept for backward compatibility during transition)
export const TRAVEL_COST_PER_MILE = {
  SHORT_DISTANCE: 0.35, 
  LONG_DISTANCE: 0.75   
} as const;

export const DISTANCE_THRESHOLD = 80; 

// ===================== OVERNIGHT COSTS WITH PROPER MARKUPS =====================

// Base costs (actual vendor rates)
export const BASE_COSTS = {
  HOTEL_RATE_PER_NIGHT: 150, // Actual hotel cost
  PER_DIEM_RATE_PER_DAY: 75  // Base per diem allowance
} as const;

// Business markups for travel expenses
export const TRAVEL_MARKUP = 0.20; // 20% markup on travel expenses

// Final costs with markup applied
export const HOTEL_COST_PER_NIGHT = Math.round(BASE_COSTS.HOTEL_RATE_PER_NIGHT * (1 + TRAVEL_MARKUP)); // $180
export const PER_DIEM_PER_DAY = Math.round(BASE_COSTS.PER_DIEM_RATE_PER_DAY * (1 + TRAVEL_MARKUP)); // $90
export const AVERAGE_MPG = 25;

// ===================== URGENCY MULTIPLIERS =====================

export const URGENCY_MULTIPLIERS: Record<number, number> = {
  1: 1.00, 2: 1.04, 3: 1.08, 4: 1.12, 5: 1.16,
  6: 1.20, 7: 1.24, 8: 1.28, 9: 1.32, 10: 1.40
} as const;

// ===================== SPECIALTY SERVICES =====================

// Pressure Washing
export const PRESSURE_WASHING = {
  COST_PER_SQFT: 0.40,
  EQUIPMENT_RENTAL_PER_DAY: 180,
  PRODUCTIVITY_SQFT_PER_HOUR: 500,
  WORK_HOURS_PER_DAY: 8
} as const;

// Window Cleaning
export const WINDOW_CLEANING = {
  COST_PER_WINDOW: 18,
  LARGE_WINDOW_MULTIPLIER: 1.6,
  HIGH_ACCESS_MULTIPLIER: 2.2,
  WINDOWS_PER_HOUR: 5,
  MAX_STANDARD_WINDOWS: 100,
  MAX_LARGE_WINDOWS: 50,
  MAX_HIGH_ACCESS_WINDOWS: 25,
  MAX_TOTAL_HOURS: 40
} as const;

// Display Case Cleaning
export const DISPLAY_CASE = {
  COST_PER_CASE: 30,
  TIME_PER_CASE_HOURS: 0.6
} as const;

// ===================== PRODUCTIVITY RATES =====================

export const PRODUCTIVITY_RATES: Record<ProjectType, number> = {
  restaurant: 450,
  fast_food: 450,
  medical: 400,
  retail: 550,
  office: 600,
  industrial: 750,
  educational: 500,
  hotel: 425,
  jewelry_store: 350,
  grocery_store: 480,
  yoga_studio: 500,
  kids_fitness: 450,
  bakery: 430,
  interactive_toy_store: 380,
  church: 500,
  arcade: 450,
  other: 500
} as const;

// ===================== PERFORMANCE OPTIMIZED FUNCTIONS =====================

// Memoized function for recommended cleaners
const CLEANER_THRESHOLDS = [
  { sqft: 2000, cleaners: 2 },
  { sqft: 5000, cleaners: 3 },
  { sqft: 10000, cleaners: 4 },
  { sqft: 20000, cleaners: 6 },
  { sqft: 40000, cleaners: 8 },
  { sqft: 60000, cleaners: 10 },
  { sqft: 80000, cleaners: 12 }
] as const;

export function getRecommendedCleaners(squareFootage: number): number {
  for (const threshold of CLEANER_THRESHOLDS) {
    if (squareFootage < threshold.sqft) return threshold.cleaners;
  }
  return 15;
}

// Convert distance to drive time in hours (one way)
export function getDriveTimeHours(distanceMiles: number): number {
  return distanceMiles / TRAVEL_FEES.AVERAGE_SPEED_MPH;
}

// Calculate hourly-based travel fee
export function calculateHourlyTravelFee(distanceMiles: number): number {
  const driveTimeHours = getDriveTimeHours(distanceMiles);
  
  if (driveTimeHours <= 1) {
    return TRAVEL_FEES.BASE_FEE;
  }
  
  // Round up to next hour for billing purposes
  const totalHours = Math.ceil(driveTimeHours);
  return TRAVEL_FEES.BASE_FEE + ((totalHours - 1) * TRAVEL_FEES.HOURLY_INCREMENT);
}

// Legacy function (kept for backward compatibility)
export function getTravelRate(distance: number): number {
  return distance < DISTANCE_THRESHOLD 
    ? TRAVEL_COST_PER_MILE.SHORT_DISTANCE 
    : TRAVEL_COST_PER_MILE.LONG_DISTANCE;
}

// ===================== BUSINESS PROTECTION =====================

// Reschedule/Site Access Policy
export const RESCHEDULE_POLICY = {
  MINIMUM_FEE: 250,
  DESCRIPTION: 'If we are required to reschedule due to the site not being ready or poor planning on the client\'s end, a minimum fee of $250 will be charged for the return trip.',
  POLICY_TITLE: 'Reschedule/Site Access Policy'
} as const;

// ===================== PRESSURE WASHING ADVANCED RATES =====================

export const PRESSURE_WASHING_RATES = {
  SOFT_WASH: { rate: 0.18, minimum: 235, description: 'Soft wash service for houses and buildings' },
  ROOF_WASH: { rate: 0.50, description: 'Roof cleaning service' },
  DRIVEWAY: { rate: 0.20, description: 'Driveway cleaning service' },
  DECK: { rate: 1.00, description: 'Deck cleaning service' },
  TREX: { rate: 1.00, description: 'Trex deck cleaning service' },
  DAILY_RATE: 1800
} as const;

export const PRESSURE_WASHING_CHEMICALS = {
  BLEACH: { name: 'Bleach', cost: 4.00, ratios: { HOUSE: '10:1 (4 oz soap)', ROOF: '1:1 (8 oz soap)' } },
  ONE_RESTORE: { name: 'One Restore', costs: { GALLON: 36.20, FIVE_GALLONS: 155.80 }, ratio: 'Whole DP 7 or 10:1', use: 'Fossil' },
  F9: { name: 'F9', costs: { GALLON: 49.00 }, ratios: ['5:1', '10:1'], use: 'Calcium' },
  CLEANSOL: { name: 'Cleansol BC', costs: { GALLON: 30.25, FIVE_GALLONS: 126.10 }, ratio: '40:1', use: 'Oxidization, General Purpose' },
  HOT_STAIN: { name: 'Hot Stain Remover', costs: { GALLON: 32.40, FIVE_GALLONS: 136.85 }, ratio: '5:1', use: 'Organic grade' },
  NMD80: { name: 'NMD80', costs: { GALLON: 22.90, FIVE_GALLONS: 82.00 }, ratio: '5:1', use: 'Masonary mix' },
  F9_BARC: { name: 'F9 BARC', cost: 49.00, use: 'Specialized cleaning' },
  F9_EFFLO: { name: 'F9 Efflo', cost: 49.00, use: 'Specialized cleaning' },
  F9_GROUNDSKEEPER: { name: 'F9 Groundskeeper', cost: 49.00, use: 'Specialized cleaning' },
  DOUBLE_EAGLE: { name: 'Double Eagle Degreaser', cost: 42.50, use: 'Degreasing' },
  TAGINATOR: { name: 'Taginator', cost: 51.00, use: 'Tag removal' },
  TAGAWAY: { name: 'Tagaway', cost: 52.00, use: 'Tag removal' }
} as const;

export const PRESSURE_WASHING_PAYMENT_TERMS = {
  INDUSTRIAL: 'Net 30',
  COMMERCIAL: 'Net 10',
  RESIDENTIAL: 'POI (Payment on Invoice)'
} as const;

// ===================== SCOPE OF WORK TEMPLATES =====================

// Base scope template function for better performance
const createScopeTemplate = (specificTasks: string) => `Final Cleaning includes:
• Sweep/mop all hard surface floors${specificTasks}
• Clean interior/exterior windows (___WINDOW_COUNT___ windows)
• Clean/sanitize bathrooms and ensure all fixtures are spotless
• Clean light fixtures and perform hi-lo dusting
• Clean and sanitize all door handles and high-touch surfaces
• Empty and clean all trash receptacles`;

export const SCOPE_OF_WORK: Record<ProjectType, string> = {
  restaurant: createScopeTemplate(`
• Degrease and sanitize kitchen surfaces, hoods, and equipment areas
• Clean and sanitize food preparation surfaces and dining areas
• Detail clean bar areas and beverage stations
• Clean and polish all stainless steel surfaces
• Clean and sanitize walk-in coolers/freezers (exterior)
• Detail clean host stations and waiting areas`),

  fast_food: createScopeTemplate(`
• Degrease and sanitize kitchen surfaces and equipment
• Clean and sanitize food preparation surfaces
• Detail clean dining areas and seating
• Clean and polish all stainless steel surfaces
• Clean and sanitize drive-thru areas
• Detail clean service counters and registers`),

  medical: createScopeTemplate(`
• Sanitize all medical equipment surfaces and patient areas with hospital-grade disinfectants
• Detail clean and disinfect exam rooms and waiting areas
• Clean and sanitize reception areas and nurse stations
• Special attention to high-touch surfaces with medical-grade cleaners
• Clean and sanitize laboratory areas
• Disinfect all medical waste containers
• Clean and sanitize staff break rooms and locker areas`),

  retail: createScopeTemplate(`
• Detail clean fitting rooms and customer areas
• Clean and sanitize checkout counters and service desks
• Clean display cases and shelving units
• Special attention to customer-facing areas and displays
• Clean break rooms and employee areas
• Dust and clean all merchandise displays`),

  office: createScopeTemplate(`
• Vacuum carpeted areas
• Clean and sanitize break rooms and kitchen areas
• Detail clean conference rooms and reception areas
• Clean workstations and common areas
• Dust and clean all office furniture and equipment`),

  industrial: createScopeTemplate(`
• Clean and degrease machinery areas (external surfaces only)
• Clean break rooms and bathroom facilities
• Detail clean offices and meeting rooms
• Clean and sanitize locker rooms
• Clean and degrease shop floors
• Clean and sanitize all safety equipment stations
• Clean and organize maintenance areas`),

  educational: createScopeTemplate(`
• Sanitize desks, chairs, and educational equipment
• Deep clean cafeteria and food service areas
• Clean gymnasium and recreational spaces
• Detail clean administrative offices and common areas
• Clean and sanitize water fountains
• Clean and sanitize locker rooms
• Clean library and study areas`),

  hotel: createScopeTemplate(`
• Vacuum carpeted areas
• Detail clean guest rooms and corridors
• Clean lobby, reception, and common areas
• Detail clean conference rooms and business centers
• Clean and sanitize fitness center equipment
• Clean pool area and amenities
• Clean and organize housekeeping areas`),

  jewelry_store: createScopeTemplate(`
• Detail clean display cases and jewelry counters (${DISPLAY_CASE.COST_PER_CASE} per case)
• Clean and sanitize customer service areas
• Special attention to glass surfaces and mirrors
• Clean and polish all display fixtures
• Clean break rooms and employee areas`),

  grocery_store: createScopeTemplate(`
• Detail clean checkout areas and service counters
• Clean and sanitize shopping cart areas
• Clean and sanitize food preparation areas
• Special attention to produce and deli sections
• Clean break rooms and employee areas`),

  yoga_studio: createScopeTemplate(`
• Detail clean yoga rooms and meditation spaces
• Clean and sanitize equipment storage areas
• Special attention to mirrors and practice areas
• Clean reception and check-in areas
• Clean locker rooms and changing areas`),

  kids_fitness: createScopeTemplate(`
• Detail clean play equipment and fitness areas
• Clean and sanitize all exercise equipment
• Special attention to children's play zones
• Clean reception and parent waiting areas
• Clean locker rooms and changing areas`),

  bakery: createScopeTemplate(`
• Degrease and sanitize baking equipment and surfaces
• Clean and sanitize food preparation areas
• Detail clean display cases and counters
• Clean and polish all stainless steel surfaces
• Clean and sanitize storage areas
• Detail clean customer seating areas`),

  interactive_toy_store: createScopeTemplate(`
• Detail clean interactive play areas
• Clean and sanitize demonstration stations
• Special attention to hands-on display areas
• Clean break rooms and employee areas
• Special attention to high-touch interactive elements`),

  church: createScopeTemplate(`
• Detail clean sanctuary and seating areas
• Clean and sanitize common areas
• Special attention to altar and pulpit areas
• Clean fellowship halls and meeting rooms
• Clean nursery and children's areas`),

  arcade: createScopeTemplate(`
• Detail clean gaming machines and equipment
• Clean and sanitize prize counter areas
• Special attention to high-traffic gaming zones
• Clean break rooms and employee areas
• Clean seating and refreshment areas`),

  other: createScopeTemplate(`
• Detail clean all work areas
• Clean and sanitize common areas
• Special attention to customer-facing spaces
• Clean break rooms and employee areas`)
} as const;

// Performance optimized project scopes reference
export const PROJECT_SCOPES: Record<ProjectType, string> = SCOPE_OF_WORK; 