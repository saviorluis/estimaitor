import { ProjectType, CleaningType } from './types';

// Base rate per square foot (in dollars)
export const BASE_RATE_PER_SQFT = 0.18;

// Project type multipliers
export const PROJECT_TYPE_MULTIPLIERS: Record<ProjectType, number> = {
  restaurant: 1.3,
  medical: 1.4,
  office: 1.0,
  retail: 1.2,
  industrial: 1.3,
  educational: 1.25,
  hotel: 1.35,
  jewelry_store: 1.4,
  apartment: 1.1,
  warehouse: 1.2,
  dormitory: 1.2,
  grocery_store: 1.3,
  yoga_studio: 1.15,
  kids_fitness: 1.25,
  fast_food: 1.3,
  bakery: 1.35,
  pet_resort: 1.4,
  beauty_store: 1.3,
  interactive_toy_store: 1.45
};

// Cleaning type multipliers
export const CLEANING_TYPE_MULTIPLIERS: Record<CleaningType, number> = {
  rough: 0.8,
  final: 1.0,
  rough_final: 1.2,
  rough_final_touchup: 1.45
};

// Cleaning type descriptions
export const CLEANING_TYPE_DESCRIPTIONS: Record<CleaningType, string> = {
  rough: "First stage cleaning that focuses on debris removal and basic surface cleaning (80% of standard rate).",
  final: "Complete detailed cleaning of all surfaces and areas (standard rate).",
  rough_final: "Combination of first stage rough clean followed by final clean (120% of standard rate).",
  rough_final_touchup: "Comprehensive package including rough clean, final clean, and touchup service (145% of standard rate)."
};

// Cleaning type time multipliers (how much longer each type takes)
export const CLEANING_TYPE_TIME_MULTIPLIERS: Record<CleaningType, number> = {
  rough: 0.7,
  final: 1.0,
  rough_final: 1.5,
  rough_final_touchup: 1.8
};

// VCT (Vinyl Composition Tile) additional cost per square foot
export const VCT_COST_PER_SQFT = 0.15;

// Travel cost per mile (accounting for round trip)
export const TRAVEL_COST_PER_MILE: {
  SHORT_DISTANCE: number;
  LONG_DISTANCE: number;
} = {
  SHORT_DISTANCE: 0.35, // For trips under 80 miles (one way)
  LONG_DISTANCE: 0.75  // For trips 80 miles or more (one way)
};

// Hotel cost per night per room
export const HOTEL_COST_PER_NIGHT = 175;

// Per diem rate per person per day
export const PER_DIEM_PER_DAY = 85;

// Pressure washing cost per square foot
export const PRESSURE_WASHING_COST_PER_SQFT = 0.40;

// Pressure washing equipment rental cost per day
export const PRESSURE_WASHING_EQUIPMENT_RENTAL = 180;

// Pressure washing productivity (square feet per hour)
export const PRESSURE_WASHING_SQFT_PER_HOUR = 500;

// Urgency multipliers based on urgency level (1-10)
export const URGENCY_MULTIPLIERS: Record<number, number> = {
  1: 1.00, // No rush
  2: 1.04,
  3: 1.08,
  4: 1.12,
  5: 1.16, // Medium urgency
  6: 1.20,
  7: 1.24,
  8: 1.28,
  9: 1.32,
  10: 1.40 // Extremely urgent
};

// Helper function to get recommended number of cleaners based on square footage
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

// Additional cost per square foot for VCT flooring
export const VCT_ADDITIONAL_COST = 0.15;

// Gas mileage assumptions (miles per gallon)
export const AVERAGE_MPG = 25;

// Productivity rates (square feet per hour per cleaner)
export const PRODUCTIVITY_RATES: Record<ProjectType, number> = {
  restaurant: 450, // More detailed cleaning for health standards
  medical: 400,    // Strict standards require more time
  office: 600,
  retail: 550,
  industrial: 750,
  educational: 500,
  hotel: 425,      // More detailed cleaning of guest rooms
  jewelry_store: 350,  // Requires meticulous detail work
  apartment: 550,     // Similar to residential cleaning but larger scale
  warehouse: 850,     // Large open spaces, more efficient cleaning
  dormitory: 500,      // Similar to hotel but with common areas and shared spaces
  grocery_store: 480,
  yoga_studio: 500,    // Similar to fitness centers, focus on sanitization
  kids_fitness: 450,   // Extra attention to safety and sanitization
  fast_food: 450,      // Similar to restaurants, focused on food service areas
  bakery: 430,         // Detailed cleaning of bakery equipment and food prep areas
  pet_resort: 400,      // Thorough sanitization for animal areas and specialized cleaning
  beauty_store: 420,    // Detailed cleaning of product displays and testing stations
  interactive_toy_store: 380    // Interactive play areas and complex environments require detailed cleaning
};

// Markup percentage (1.5x = 50% markup)
export const MARKUP_PERCENTAGE = 0.5;

// Hotel markup percentage (50% markup on hotel costs)
export const HOTEL_MARKUP_PERCENTAGE = 0.5;

// Urgency multiplier (up to 30% increase for highest urgency)
export const calculateUrgencyMultiplier = (urgencyLevel: number): number => {
  // Scale from 1-10 to 0-0.3 (0% to 30% increase)
  return (urgencyLevel - 1) * (0.3 / 9);
};

// Window cleaning costs
export const WINDOW_CLEANING_COST_PER_WINDOW = 18; // Base cost per standard window
export const WINDOW_CLEANING_LARGE_WINDOW_MULTIPLIER = 1.6; // Multiplier for large windows
export const WINDOW_CLEANING_HIGH_ACCESS_MULTIPLIER = 2.2; // Multiplier for windows requiring lifts/ladders
export const WINDOW_CLEANING_WINDOWS_PER_HOUR = 5; // Average windows cleaned per hour

// Display case cleaning costs
export const DISPLAY_CASE_CLEANING_COST = 30; // Cost per display case
export const DISPLAY_CASE_TIME_PER_UNIT = 0.6; // Hours per display case

export const SCOPE_OF_WORK: { [key: string]: string } = {
  restaurant: "Final Cleaning includes:\n" +
    "• Sweep/mop all hard surface floors and deep clean kitchen areas\n" +
    "• Clean interior/exterior windows (___WINDOW_COUNT___ windows)\n" +
    "• Clean/sanitize bathrooms and ensure all fixtures are spotless\n" +
    "• Clean light fixtures and perform hi-lo dusting\n" +
    "• Degrease and sanitize kitchen surfaces, hoods, and equipment areas\n" +
    "• Clean and sanitize food preparation surfaces and dining areas\n" +
    "• Detail clean bar areas and beverage stations\n" +
    "• Clean and polish all stainless steel surfaces\n" +
    "• Clean and sanitize walk-in coolers/freezers (exterior)\n" +
    "• Detail clean host stations and waiting areas\n" +
    "• Clean and sanitize all door handles and high-touch surfaces\n" +
    "• Empty and clean all trash receptacles",

  medical: "Final Cleaning includes:\n" +
    "• Sweep/mop/sanitize all hard surface floors with hospital-grade disinfectants\n" +
    "• Clean interior/exterior windows (___WINDOW_COUNT___ windows)\n" +
    "• Sanitize all bathrooms with medical-grade cleaners\n" +
    "• Clean light fixtures and perform hi-lo dusting\n" +
    "• Sanitize all medical equipment surfaces and patient areas\n" +
    "• Detail clean and disinfect exam rooms and waiting areas\n" +
    "• Clean and sanitize reception areas and nurse stations\n" +
    "• Special attention to high-touch surfaces with medical-grade cleaners\n" +
    "• Clean and sanitize laboratory areas\n" +
    "• Disinfect all medical waste containers\n" +
    "• Clean and sanitize staff break rooms and locker areas\n" +
    "• Empty and sanitize all trash receptacles",

  office: "Final Cleaning includes:\n" +
    "• Sweep/mop all hard surface floors and vacuum carpeted areas\n" +
    "• Clean interior/exterior windows (___WINDOW_COUNT___ windows)\n" +
    "• Clean bathrooms\n" +
    "• Clean light fixtures and perform hi-lo dusting\n" +
    "• Clean and sanitize break rooms and kitchen areas\n" +
    "• Detail clean conference rooms and reception areas\n" +
    "• Clean workstations and common areas\n" +
    "• Dust and clean all office furniture and equipment",

  retail: "Final Cleaning includes:\n" +
    "• Sweep/mop all hard surface floors and clean display areas\n" +
    "• Clean interior/exterior windows (___WINDOW_COUNT___ windows)\n" +
    "• Clean and sanitize all bathrooms\n" +
    "• Clean light fixtures and perform hi-lo dusting\n" +
    "• Detail clean fitting rooms and customer areas\n" +
    "• Clean and sanitize checkout counters and service desks\n" +
    "• Clean display cases and shelving units\n" +
    "• Special attention to customer-facing areas and displays\n" +
    "• Clean and sanitize door handles and high-touch surfaces\n" +
    "• Empty and clean all trash receptacles\n" +
    "• Clean break rooms and employee areas\n" +
    "• Dust and clean all merchandise displays",

  industrial: "Final Cleaning includes:\n" +
    "• Sweep/mop all hard surface floors and clean work areas\n" +
    "• Clean interior/exterior windows (___WINDOW_COUNT___ windows)\n" +
    "• Clean light fixtures and perform hi-lo dusting\n" +
    "• Clean and degrease machinery areas (external surfaces only)\n" +
    "• Clean break rooms and bathroom facilities\n" +
    "• Detail clean offices and meeting rooms\n" +
    "• Clean warehouse racking and storage areas as accessible\n" +
    "• Clean and sanitize locker rooms\n" +
    "• Clean and degrease shop floors\n" +
    "• Clean and sanitize all safety equipment stations\n" +
    "• Empty and clean all trash receptacles\n" +
    "• Clean and organize maintenance areas",

  educational: "Final Cleaning includes:\n" +
    "• Sweep/mop all hard surface floors and clean classroom spaces\n" +
    "• Clean interior/exterior windows (___WINDOW_COUNT___ windows)\n" +
    "• Clean and sanitize all bathrooms\n" +
    "• Clean light fixtures and perform hi-lo dusting\n" +
    "• Sanitize desks, chairs, and educational equipment\n" +
    "• Deep clean cafeteria and food service areas\n" +
    "• Clean gymnasium and recreational spaces\n" +
    "• Detail clean administrative offices and common areas\n" +
    "• Clean and sanitize water fountains\n" +
    "• Clean and sanitize locker rooms\n" +
    "• Clean library and study areas\n" +
    "• Empty and clean all trash receptacles",

  hotel: "Final Cleaning includes:\n" +
    "• Sweep/mop all hard surface floors and vacuum carpeted areas\n" +
    "• Clean interior/exterior windows (___WINDOW_COUNT___ windows)\n" +
    "• Clean and sanitize all bathrooms\n" +
    "• Clean light fixtures and perform hi-lo dusting\n" +
    "• Detail clean guest rooms and corridors\n" +
    "• Clean and sanitize all bathroom facilities\n" +
    "• Clean lobby, reception, and common areas\n" +
    "• Detail clean conference rooms and business centers\n" +
    "• Clean and sanitize fitness center equipment\n" +
    "• Clean pool area and amenities\n" +
    "• Clean and organize housekeeping areas\n" +
    "• Empty and clean all trash receptacles",

  jewelry_store: "Final Cleaning includes:\n" +
    "• Professional cleaning of all glass display cases (interior and exterior)\n" +
    "• Clean interior/exterior windows (___WINDOW_COUNT___ windows)\n" +
    "• Clean and sanitize all bathrooms\n" +
    "• Meticulous dusting and polishing of display case lighting fixtures\n" +
    "• Detailed cleaning of customer consultation areas and seating\n" +
    "• Thorough cleaning of security fixtures and entrance areas\n" +
    "• Premium floor care with attention to high-end flooring materials\n" +
    "• Clean and polish all mirrors and glass surfaces\n" +
    "• Detail clean staff areas and workshops\n" +
    "• Clean and sanitize all door handles and surfaces\n" +
    "• Empty and clean all trash receptacles\n" +
    "\nDisplay Cases:\n" +
    "• Interior and exterior cleaning with specialized glass cleaners\n" +
    "• Careful cleaning of display case tracks and locks\n" +
    "• Detailed cleaning of display lighting\n" +
    "• Cleaning and sanitizing of display case shelving",

  apartment: "Final Cleaning includes:\n" +
    "• Sweep/mop all hard surface floors and vacuum carpeted areas\n" +
    "• Clean interior/exterior windows (___WINDOW_COUNT___ windows)\n" +
    "• Clean and sanitize all bathrooms\n" +
    "• Clean light fixtures and perform hi-lo dusting\n" +
    "• Detail clean lobbies, mailrooms, and other shared spaces\n" +
    "• Clean and sanitize common area restrooms and laundry facilities\n" +
    "• Clean fitness centers and amenity spaces\n" +
    "• Clean and sanitize elevators and stairwells\n" +
    "• Clean outdoor common areas and entrances\n" +
    "• Clean and organize maintenance areas\n" +
    "• Empty and clean all trash receptacles\n" +
    "• Clean and sanitize door handles and railings",

  warehouse: "Final Cleaning includes:\n" +
    "• Sweep/dust mop warehouse floors and clean office areas\n" +
    "• Clean interior/exterior windows (___WINDOW_COUNT___ windows)\n" +
    "• Clean and sanitize all bathrooms\n" +
    "• Clean light fixtures and perform hi-lo dusting\n" +
    "• Clean break rooms and bathroom facilities\n" +
    "• Detail clean offices and meeting rooms\n" +
    "• Clean accessible warehouse racking and storage areas\n" +
    "• Clean and organize shipping/receiving areas\n" +
    "• Clean and sanitize equipment charging stations\n" +
    "• Clean and degrease maintenance areas\n" +
    "• Empty and clean all trash receptacles\n" +
    "• Clean and sanitize door handles and high-touch surfaces",

  dormitory: "Final Cleaning includes:\n" +
    "• Sweep/mop all hard surface floors and vacuum carpeted areas\n" +
    "• Clean interior/exterior windows (___WINDOW_COUNT___ windows)\n" +
    "• Clean and sanitize all bathrooms\n" +
    "• Clean light fixtures and perform hi-lo dusting\n" +
    "• Sanitize shared bathroom facilities and shower areas\n" +
    "• Detail clean lounges, study areas, and communal kitchens\n" +
    "• Clean and sanitize laundry facilities\n" +
    "• Clean and sanitize vending areas\n" +
    "• Clean and organize storage rooms\n" +
    "• Clean and sanitize elevators and stairwells\n" +
    "• Empty and clean all trash receptacles\n" +
    "• Clean and sanitize door handles and railings",

  grocery_store: "Final Cleaning includes:\n" +
    "• Sweep/scrub/mop all hard surface floors including aisles and checkout lanes\n" +
    "• Clean interior/exterior windows (___WINDOW_COUNT___ windows)\n" +
    "• Clean and sanitize all bathrooms\n" +
    "• Clean light fixtures and perform hi-lo dusting\n" +
    "• Clean and sanitize shopping carts and baskets\n" +
    "• Clean and sanitize checkout areas and service counters\n" +
    "• Clean and sanitize deli, bakery, and meat department areas\n" +
    "• Clean and sanitize produce department fixtures\n" +
    "• Clean refrigerated cases and freezer doors\n" +
    "• Clean and organize stockroom and storage areas\n" +
    "• Empty and clean all trash receptacles\n" +
    "• Clean and sanitize door handles and high-touch surfaces",

  yoga_studio: "Final Cleaning includes:\n" +
    "• Sweep/mop studio floors with yoga mat-safe cleaners\n" +
    "• Clean interior/exterior windows (___WINDOW_COUNT___ windows)\n" +
    "• Clean and sanitize all bathrooms\n" +
    "• Clean light fixtures and ceiling fans\n" +
    "• Clean and sanitize changing rooms and shower areas\n" +
    "• Clean and sanitize yoga equipment and props\n" +
    "• Clean reception area and retail displays\n" +
    "• Clean and organize storage areas\n" +
    "• Clean and sanitize water stations\n" +
    "• Clean mirrors and glass surfaces\n" +
    "• Empty and clean all trash receptacles\n" +
    "• Clean and sanitize door handles and high-touch surfaces",

  kids_fitness: "Final Cleaning includes:\n" +
    "• Clean and sanitize all gym equipment and play structures\n" +
    "• Clean interior/exterior windows (___WINDOW_COUNT___ windows)\n" +
    "• Clean and sanitize all bathrooms\n" +
    "• Clean light fixtures and perform hi-lo dusting\n" +
    "• Sanitize mats, padding, and soft play areas\n" +
    "• Clean and sanitize cubbies and storage areas\n" +
    "• Clean and sanitize water fountains\n" +
    "• Clean reception and parent waiting areas\n" +
    "• Clean and sanitize party rooms\n" +
    "• Clean and organize equipment storage\n" +
    "• Empty and clean all trash receptacles\n" +
    "• Special attention to sanitizing high-touch play equipment",

  fast_food: "Final Cleaning includes:\n" +
    "• Sweep/scrub/mop all hard surface floors\n" +
    "• Clean interior/exterior windows (___WINDOW_COUNT___ windows)\n" +
    "• Clean and sanitize all bathrooms\n" +
    "• Clean light fixtures and menu boards\n" +
    "• Deep clean and degrease kitchen equipment\n" +
    "• Clean and sanitize food prep areas\n" +
    "• Clean and sanitize dining areas and furniture\n" +
    "• Clean and polish all stainless steel surfaces\n" +
    "• Clean and sanitize drive-thru areas\n" +
    "• Clean and organize storage areas\n" +
    "• Empty and clean all trash receptacles\n" +
    "• Clean and sanitize door handles and high-touch surfaces",

  bakery: "Final Cleaning includes:\n" +
    "• Sweep/mop/sanitize floors with food-safe cleaners\n" +
    "• Clean interior/exterior windows (___WINDOW_COUNT___ windows)\n" +
    "• Clean and sanitize all bathrooms\n" +
    "• Clean light fixtures and perform hi-lo dusting\n" +
    "• Clean and sanitize food prep surfaces and equipment\n" +
    "• Clean and polish display cases and counters\n" +
    "• Deep clean ovens and baking equipment (exterior)\n" +
    "• Clean and sanitize café seating areas\n" +
    "• Clean and organize storage areas\n" +
    "• Clean and sanitize dish washing areas\n" +
    "• Empty and clean all trash receptacles\n" +
    "• Special attention to flour and ingredient residue",

  pet_resort: "Final Cleaning includes:\n" +
    "• Sweep/mop/sanitize floors with pet-safe cleaners\n" +
    "• Clean interior/exterior windows (___WINDOW_COUNT___ windows)\n" +
    "• Clean and sanitize all bathrooms\n" +
    "• Clean light fixtures and perform hi-lo dusting\n" +
    "• Deep clean and sanitize kennels and runs\n" +
    "• Clean and sanitize play areas and equipment\n" +
    "• Clean and sanitize grooming stations\n" +
    "• Clean and sanitize reception and waiting areas\n" +
    "• Clean and sanitize food prep areas\n" +
    "• Clean and organize storage areas\n" +
    "• Empty and clean all trash receptacles\n" +
    "• Special attention to pet hair and odor control",

  beauty_store: "Final Cleaning includes:\n" +
    "• Sweep/mop all hard surface floors\n" +
    "• Clean interior/exterior windows (___WINDOW_COUNT___ windows)\n" +
    "• Clean and sanitize all bathrooms\n" +
    "• Clean light fixtures and perform hi-lo dusting\n" +
    "• Clean and sanitize product displays\n" +
    "• Clean and sanitize makeup testing stations\n" +
    "• Clean and polish mirrors and glass surfaces\n" +
    "• Clean and sanitize salon stations if applicable\n" +
    "• Clean and organize stockroom\n" +
    "• Clean and sanitize break rooms\n" +
    "• Empty and clean all trash receptacles\n" +
    "• Special attention to makeup and product residue",

  interactive_toy_store: "Final Cleaning includes:\n" +
    "• Sweep/mop all hard surface floors\n" +
    "• Clean interior/exterior windows (___WINDOW_COUNT___ windows)\n" +
    "• Clean and sanitize all bathrooms\n" +
    "• Clean light fixtures and perform hi-lo dusting\n" +
    "• Clean and sanitize interactive play areas\n" +
    "• Clean and sanitize demonstration stations\n" +
    "• Clean and organize merchandise displays\n" +
    "• Clean and sanitize party/event rooms\n" +
    "• Clean and organize stockroom\n" +
    "• Clean mascot storage and prep areas\n" +
    "• Empty and clean all trash receptacles\n" +
    "• Special attention to high-touch interactive elements"
};

// Project type specific scopes of work
export const PROJECT_SCOPES: Record<ProjectType, string> = {
  restaurant: `${SCOPE_OF_WORK.restaurant}`,
  medical: `${SCOPE_OF_WORK.medical}`,
  office: `${SCOPE_OF_WORK.office}`,
  retail: `${SCOPE_OF_WORK.retail}`,
  industrial: `${SCOPE_OF_WORK.industrial}`,
  educational: `${SCOPE_OF_WORK.educational}`,
  hotel: `${SCOPE_OF_WORK.hotel}`,
  jewelry_store: `${SCOPE_OF_WORK.jewelry_store}`,
  apartment: `${SCOPE_OF_WORK.apartment}`,
  warehouse: `${SCOPE_OF_WORK.warehouse}`,
  dormitory: `${SCOPE_OF_WORK.dormitory}`,
  grocery_store: `${SCOPE_OF_WORK.grocery_store}`,
  fast_food: `${SCOPE_OF_WORK.fast_food}`,
  yoga_studio: `
    • Dust and clean all surfaces, including yoga equipment storage areas and props
    • Vacuum and mop studio floors with appropriate cleaning solutions safe for yoga mats
    • Clean and sanitize changing rooms, lockers, and shower facilities
    • Empty all trash receptacles and replace liners
    • Clean and sanitize water stations and common areas
    • Dust light fixtures and ceiling fans
    • Clean and sanitize bathroom facilities
    • Wipe down reception desk and lobby area
    • Sanitize yoga mats and props storage areas
  `,
  kids_fitness: `
    • Clean and sanitize all gym equipment and play structures
    • Vacuum and mop all floor areas with child-safe cleaning solutions
    • Sanitize mats, padding, and soft play areas
    • Dust and wipe down all surfaces, including cubbies and storage areas
    • Clean and sanitize bathroom facilities
    • Empty all trash receptacles and replace liners
    • Clean and sanitize water fountains
    • Wipe down reception desk and parent waiting areas
    • Special attention to sanitizing high-touch areas and equipment
    • Clean and organize equipment storage areas
  `,
  bakery: `${SCOPE_OF_WORK.bakery}`,
  pet_resort: `${SCOPE_OF_WORK.pet_resort}`,
  beauty_store: `${SCOPE_OF_WORK.beauty_store}`,
  interactive_toy_store: `${SCOPE_OF_WORK.interactive_toy_store}`
};

// Pressure Washing Constants
export const PRESSURE_WASHING_RATES = {
  SOFT_WASH: {
    rate: 0.18, // per square foot
    minimum: 235,
    description: 'Soft wash service for houses and buildings'
  },
  ROOF_WASH: {
    rate: 0.50, // per square foot
    description: 'Roof cleaning service'
  },
  DRIVEWAY: {
    rate: 0.20, // per square foot
    description: 'Driveway cleaning service'
  },
  DECK: {
    rate: 1.00, // per square foot
    description: 'Deck cleaning service'
  },
  TREX: {
    rate: 1.00, // per square foot
    description: 'Trex deck cleaning service'
  },
  DAILY_RATE: 1800 // for jobs outside standard rates
};

export const PRESSURE_WASHING_CHEMICALS = {
  BLEACH: {
    name: 'Bleach',
    cost: 4.00,
    ratios: {
      HOUSE: '10:1 (4 oz soap)',
      ROOF: '1:1 (8 oz soap)'
    }
  },
  ONE_RESTORE: {
    name: 'One Restore',
    costs: {
      GALLON: 36.20,
      FIVE_GALLONS: 155.80
    },
    ratio: 'Whole DP 7 or 10:1',
    use: 'Fossil'
  },
  F9: {
    name: 'F9',
    costs: {
      GALLON: 49.00
    },
    ratios: ['5:1', '10:1'],
    use: 'Calcium'
  },
  CLEANSOL: {
    name: 'Cleansol BC',
    costs: {
      GALLON: 30.25,
      FIVE_GALLONS: 126.10
    },
    ratio: '40:1',
    use: 'Oxidization, General Purpose'
  },
  HOT_STAIN: {
    name: 'Hot Stain Remover',
    costs: {
      GALLON: 32.40,
      FIVE_GALLONS: 136.85
    },
    ratio: '5:1',
    use: 'Organic grade'
  },
  NMD80: {
    name: 'NMD80',
    costs: {
      GALLON: 22.90,
      FIVE_GALLONS: 82.00
    },
    ratio: '5:1',
    use: 'Masonary mix'
  },
  F9_BARC: {
    name: 'F9 BARC',
    cost: 49.00,
    use: 'Specialized cleaning'
  },
  F9_EFFLO: {
    name: 'F9 Efflo',
    cost: 49.00,
    use: 'Specialized cleaning'
  },
  F9_GROUNDSKEEPER: {
    name: 'F9 Groundskeeper',
    cost: 49.00,
    use: 'Specialized cleaning'
  },
  DOUBLE_EAGLE: {
    name: 'Double Eagle Degreaser',
    cost: 42.50,
    use: 'Degreasing'
  },
  TAGINATOR: {
    name: 'Taginator',
    cost: 51.00,
    use: 'Tag removal'
  },
  TAGAWAY: {
    name: 'Tagaway',
    cost: 52.00,
    use: 'Tag removal'
  }
};

export const PRESSURE_WASHING_PAYMENT_TERMS = {
  INDUSTRIAL: 'Net 30',
  COMMERCIAL: 'Net 10',
  RESIDENTIAL: 'POI (Payment on Invoice)'
}; 