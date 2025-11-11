import { ProjectType, CleaningType, RoomType } from './types';

// ===================== CORE PRICING CONSTANTS =====================

// Base rate per square foot (in dollars)
export const BASE_RATE_PER_SQFT = 0.18;

// Building shell specific rate (exterior structural cleanup only)
export const BUILDING_SHELL_RATE_PER_SQFT = 0.12; // Lower rate for exterior-only work

// VCT (Vinyl Composition Tile) stripping and waxing tiered pricing
// Small jobs (< 1,000 sq ft): $2.20/sq ft - higher overhead per sq ft
// Medium jobs (1,000-5,000 sq ft): $2.20 scaling down to $1.50 based on volume
// Large jobs (> 5,000 sq ft): $1.50/sq ft - volume discount
export const getVCTCostPerSqFt = (vctSquareFootage: number): number => {
  if (vctSquareFootage < 1000) {
    return 2.20; // Small job premium
  } else if (vctSquareFootage <= 5000) {
    // Linear interpolation between $2.20 and $1.50 for medium jobs
    const ratio = (vctSquareFootage - 1000) / (5000 - 1000);
    return 2.20 - (ratio * 0.70); // $2.20 down to $1.50
  } else {
    return 1.50; // Large job volume discount
  }
};

// Sales tax rate
export const SALES_TAX_RATE = 0.07;

// Markup percentage (50% markup = 0.5)
export const MARKUP_PERCENTAGE = 0.3; // 30% professional markup

// ===================== BUSINESS FEES =====================

// Fixed business fees added to all quotes
export const SCHEDULING_FEE = 99; // $99 scheduling fee
export const INVOICING_FEE = 99; // $99 invoicing fee

// ===================== MOBILIZATION FEES =====================

// Mobilization fees based on project size and complexity
export const MOBILIZATION_FEES = {
  small: 150,    // Up to 2,500 sq ft - Basic setup, equipment transport
  medium: 250,   // 2,501-10,000 sq ft - Additional equipment, staging area
  large: 400,    // 10,001+ sq ft - Full mobilization, multiple crews, extensive setup
  complex: 500   // Specialized projects requiring specialized equipment or access
} as const;

// Mobilization fee thresholds
export const MOBILIZATION_THRESHOLDS = {
  small: 2500,
  medium: 10000,
  large: Infinity
} as const;

// Function to calculate mobilization fee based on square footage and project type
export function calculateMobilizationFee(squareFootage: number, projectType: ProjectType): number {
  // Complex projects that require specialized equipment or access
  const complexProjects: ProjectType[] = ['medical', 'industrial', 'building_shell', 'home_renovation', 'assisted_living'];
  
  if (complexProjects.includes(projectType)) {
    return MOBILIZATION_FEES.complex;
  }
  
  // Size-based mobilization fees
  if (squareFootage <= MOBILIZATION_THRESHOLDS.small) {
    return MOBILIZATION_FEES.small;
  } else if (squareFootage <= MOBILIZATION_THRESHOLDS.medium) {
    return MOBILIZATION_FEES.medium;
  } else {
    return MOBILIZATION_FEES.large;
  }
}

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
  coffee_shop: 1.25,
  fire_station: 1.4,
  home_renovation: 1.4,
  building_shell: 1.1,
  assisted_living: 1.5,
  other: 1.0
} as const;

// ===================== CLEANING TYPE CONSTANTS =====================

export const CLEANING_TYPE_MULTIPLIERS: Record<CleaningType, number> = {
  rough: 0.8,
  final: 1.2, // Final clean now includes touchup (was 1.0)
  final_touchup: 1.2, // Final & touchup (same as final since final includes touchup)
  rough_final: 1.4, // Rough + final with touchup (adjusted from 1.2)
  rough_final_touchup: 1.6, // Rough + final with touchup + additional touchup (adjusted from 1.45)
  pressure_washing: 1.0,
  vct_only: 1.0,
  window_cleaning_only: 1.0
} as const;

export const CLEANING_TYPE_TIME_MULTIPLIERS: Record<CleaningType, number> = {
  rough: 0.7,
  final: 1.2, // Final clean with touchup takes more time (was 1.0)
  final_touchup: 1.2, // Same as final since it includes touchup
  rough_final: 1.6, // Rough + final with touchup (adjusted from 1.5)
  rough_final_touchup: 2.0, // Rough + final with touchup + additional touchup (adjusted from 1.8)
  pressure_washing: 1.0,
  vct_only: 1.0,
  window_cleaning_only: 1.0
} as const;

export const CLEANING_TYPE_DESCRIPTIONS: Record<CleaningType, string> = {
  rough: "First stage cleaning that focuses on debris removal and basic surface cleaning (80% of standard rate).",
  final: "Complete detailed cleaning of all surfaces and areas with touchup (120% of standard rate).",
  final_touchup: "Final cleaning with touchup service - complete detailed cleaning plus final touchup (120% of standard rate).",
  rough_final: "Combination of first stage rough clean followed by final clean with touchup (140% of standard rate).",
  rough_final_touchup: "Complete three-stage process: rough, final with touchup, and additional touch-up clean (160% of standard rate).",
  pressure_washing: "Professional pressure washing services with appropriate equipment and chemicals (standard rate).",
  vct_only: "Professional VCT stripping, waxing, and buffing services for vinyl composition tile flooring (standard rate).",
  window_cleaning_only: "Professional window cleaning services including standard and high-access windows (standard rate)."
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

// ===================== ROOM-BASED PRICING (HOME RENOVATION) =====================

export const ROOM_PRICING: Record<RoomType, { baseRate: number; description: string }> = {
  bedroom: { baseRate: 85, description: 'Standard bedroom cleaning' },
  bathroom: { baseRate: 125, description: 'Bathroom deep clean and sanitization' },
  kitchen: { baseRate: 150, description: 'Kitchen deep clean including appliances' },
  living_room: { baseRate: 95, description: 'Living room and common area cleaning' },
  dining_room: { baseRate: 75, description: 'Dining room cleaning' },
  office: { baseRate: 80, description: 'Home office cleaning' },
  basement: { baseRate: 100, description: 'Basement cleaning (unfinished areas)' },
  garage: { baseRate: 90, description: 'Garage cleaning and organization' },
  laundry_room: { baseRate: 60, description: 'Laundry room cleaning' },
  other: { baseRate: 70, description: 'Other room types' }
} as const;

// Room-based pricing multipliers for different cleaning types
export const ROOM_CLEANING_MULTIPLIERS: Record<CleaningType, number> = {
  rough: 0.7,
  final: 1.2, // Final clean with touchup (was 1.0)
  final_touchup: 1.2, // Same as final since it includes touchup
  rough_final: 1.4, // Rough + final with touchup (adjusted from 1.3)
  rough_final_touchup: 1.6, // Rough + final with touchup + additional touchup (adjusted from 1.5)
  pressure_washing: 1.0,
  vct_only: 1.0,
  window_cleaning_only: 1.0
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

// Assisted Living Facility Pricing
export const ASSISTED_LIVING_PRICING = {
  COST_PER_BED_BATH: 150, // Cost per bed/bath unit (includes bedroom + bathroom)
  BASE_FACILITY_FEE: 500, // Base fee for cafeteria, laundry, utility rooms, common areas
  TIME_PER_BED_BATH_HOURS: 2.5 // Hours per bed/bath unit
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
  coffee_shop: 440,
  fire_station: 550,
  home_renovation: 400,
  building_shell: 800,
  assisted_living: 450,
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

// ===================== ROOM-BASED PRICING FUNCTIONS =====================

export function calculateRoomBasedPrice(
  rooms: Array<{ type: RoomType; count: number; squareFootage?: number }>,
  cleaningType: CleaningType
): number {
  const cleaningMultiplier = ROOM_CLEANING_MULTIPLIERS[cleaningType];
  
  return rooms.reduce((total, room) => {
    const roomPricing = ROOM_PRICING[room.type];
    const roomCost = roomPricing.baseRate * room.count * cleaningMultiplier;
    return total + roomCost;
  }, 0);
}

export function calculateRoomBasedHours(
  rooms: Array<{ type: RoomType; count: number; squareFootage?: number }>,
  cleaningType: CleaningType
): number {
  const cleaningMultiplier = ROOM_CLEANING_MULTIPLIERS[cleaningType];
  
  // Base hours per room type (rough estimate)
  const ROOM_HOURS: Record<RoomType, number> = {
    bedroom: 1.5,
    bathroom: 2.0,
    kitchen: 2.5,
    living_room: 1.5,
    dining_room: 1.0,
    office: 1.5,
    basement: 2.0,
    garage: 1.5,
    laundry_room: 1.0,
    other: 1.0
  };
  
  return rooms.reduce((total, room) => {
    const roomHours = ROOM_HOURS[room.type] * room.count * cleaningMultiplier;
    return total + roomHours;
  }, 0);
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

  coffee_shop: createScopeTemplate(`
• Deep clean and sanitize espresso machines and coffee equipment
• Clean and sanitize food preparation areas and counters
• Detail clean seating areas and customer tables
• Clean and disinfect condiment stations and self-service areas
• Clean and sanitize display cases for pastries and food items
• Special attention to high-touch surfaces like door handles and registers
• Clean barista stations and work areas behind counter
• Clean and sanitize restrooms and ensure all fixtures are spotless`),

  fire_station: createScopeTemplate(`
• Detail clean apparatus bay floors and equipment storage areas
• Clean and sanitize living quarters, kitchens, and dining areas
• Deep clean and disinfect dormitory and sleeping areas
• Clean and sanitize exercise/fitness equipment and areas
• Special attention to gear storage and turnout equipment areas
• Clean meeting rooms, offices, and administrative areas
• Detail clean vehicle maintenance areas and workshops
• Clean and sanitize decontamination areas
• Special attention to high-touch surfaces and emergency equipment areas`),

  home_renovation: createScopeTemplate(`
• Remove construction debris, dust, and residue from all surfaces
• Deep clean and sanitize all bathrooms and fixtures
• Clean and polish all kitchen surfaces, cabinets, and appliances
• Detail clean all windows, mirrors, and glass surfaces
• Vacuum and clean all carpeted areas and rugs
• Sweep, mop, and sanitize all hard surface floors
• Clean and sanitize all door handles, light switches, and high-touch surfaces
• Clean light fixtures and perform high/low dusting throughout
• Clean and sanitize all baseboards, trim, and molding
• Remove paint splatters and construction adhesive residue
• Clean and sanitize HVAC vents and air returns
• Empty and clean all trash receptacles
• Final walk-through inspection to ensure construction cleanup standards`),

  building_shell: createScopeTemplate(`
• Remove construction debris, dust, and concrete residue from all surfaces
• Clean exposed concrete floors and structural elements
• Remove construction adhesive, paint splatters, and construction markings
• Clean and sanitize exposed plumbing rough-ins and electrical boxes
• Clean exposed HVAC ductwork and mechanical systems
• Remove construction dust from exposed beams, columns, and structural steel
• Clean exposed concrete walls and structural elements
• Remove construction debris from elevator shafts and mechanical rooms
• Clean exposed utility rooms and mechanical spaces
• Remove construction dust from exposed ceilings and overhead structures
• Clean and organize construction storage areas
• Remove construction debris from loading docks and service areas
• Final inspection to ensure building shell is ready for tenant build-out`),

  assisted_living: createScopeTemplate(`
• Deep clean and sanitize all resident bedrooms and bathrooms
• Clean and sanitize cafeteria and dining areas with hospital-grade disinfectants
• Detail clean laundry rooms and utility areas
• Sanitize all common areas, lounges, and activity rooms
• Clean and sanitize medical equipment areas and medication rooms
• Detail clean administrative offices and reception areas
• Sanitize all high-touch surfaces including handrails, door handles, and light switches
• Clean and sanitize kitchen and food preparation areas
• Detail clean all windows and glass surfaces
• Clean and sanitize HVAC vents and air returns
• Empty and sanitize all trash receptacles
• Final walk-through inspection to ensure healthcare-grade cleaning standards`),

  other: createScopeTemplate(`
• Detail clean all work areas
• Clean and sanitize common areas
• Special attention to customer-facing spaces
• Clean break rooms and employee areas`)
} as const;

// Performance optimized project scopes reference
export const PROJECT_SCOPES: Record<ProjectType, string> = SCOPE_OF_WORK; 

// Test Mode Configuration
export const TEST_MODE = process.env.NODE_ENV === 'development';

// Test Scenarios for Quick Validation
export const TEST_SCENARIOS = [
  {
    name: 'Small Office',
    input: {
      projectType: 'office',
      cleaningType: 'final',
      squareFootage: 2500,
      location: 'High Point, NC',
      needsWindowCleaning: true,
      numberOfWindows: 12,
      clientName: 'John Smith',
      projectName: 'Downtown Office Renovation'
    },
    expectedRange: {
      minPrice: 800,
      maxPrice: 1200
    },
    quoteValidation: {
      requiredSections: [
        'Client Information',
        'Project Information',
        'Service Details & Pricing',
        'Detailed Scope of Work',
        'Professional Terms & Conditions'
      ],
      expectedLineItems: [
        'Final Clean',
        'Travel Expenses',
        'Window Cleaning'
      ],
      formatting: {
        companyLogo: true,
        quoteNumber: true,
        validDates: true,
        signatures: true,
        pricing: {
          subtotal: true,
          markup: true,
          tax: true,
          total: true
        }
      }
    }
  },
  {
    name: 'Restaurant',
    input: {
      projectType: 'restaurant',
      cleaningType: 'rough_final',
      squareFootage: 3500,
      location: 'Greensboro, NC',
      needsWindowCleaning: true,
      numberOfWindows: 20,
      clientName: 'Sarah Johnson',
      projectName: 'New Restaurant Build'
    },
    expectedRange: {
      minPrice: 1500,
      maxPrice: 2200
    },
    quoteValidation: {
      requiredSections: [
        'Client Information',
        'Project Information',
        'Service Details & Pricing',
        'Detailed Scope of Work',
        'Professional Terms & Conditions'
      ],
      expectedLineItems: [
        'Rough & Final Clean',
        'Travel Expenses',
        'Window Cleaning'
      ],
      formatting: {
        companyLogo: true,
        quoteNumber: true,
        validDates: true,
        signatures: true,
        pricing: {
          subtotal: true,
          markup: true,
          tax: true,
          total: true
        }
      }
    }
  },
  {
    name: 'Retail Space',
    input: {
      projectType: 'retail',
      cleaningType: 'final',
      squareFootage: 5000,
      location: 'High Point, NC',
      needsWindowCleaning: true,
      numberOfWindows: 18,
      clientName: 'Robert Chen',
      projectName: 'Uptown Retail Center',
      hasVCT: true,
      vctSquareFootage: 3000
    },
    expectedRange: {
      minPrice: 2000,
      maxPrice: 3000
    },
    quoteValidation: {
      requiredSections: [
        'Client Information',
        'Project Information',
        'Service Details & Pricing',
        'Detailed Scope of Work',
        'Professional Terms & Conditions'
      ],
      expectedLineItems: [
        'Final Clean',
        'Travel Expenses',
        'Window Cleaning',
        'VCT Flooring Treatment'
      ],
      formatting: {
        companyLogo: true,
        quoteNumber: true,
        validDates: true,
        signatures: true,
        pricing: {
          subtotal: true,
          markup: true,
          tax: true,
          total: true
        }
      }
    }
  }
]; 