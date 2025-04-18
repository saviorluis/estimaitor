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
  pet_resort: 1.4
};

// Cleaning type multipliers
export const CLEANING_TYPE_MULTIPLIERS: Record<CleaningType, number> = {
  rough: 0.8,
  final: 1.0,
  powder_puff: 1.3,
  complete: 2.2
};

// Cleaning type descriptions
export const CLEANING_TYPE_DESCRIPTIONS: Record<CleaningType, string> = {
  rough: "First stage cleaning that focuses on debris removal and basic surface cleaning.",
  final: "Second stage cleaning that includes detailed cleaning of all visible surfaces.",
  powder_puff: "Third stage cleaning that adds finishing touches and detail work.",
  complete: "Comprehensive package that includes all three cleaning stages for maximum cleanliness."
};

// Cleaning type time multipliers (how much longer each type takes)
export const CLEANING_TYPE_TIME_MULTIPLIERS: Record<CleaningType, number> = {
  rough: 0.7,
  final: 1.0,
  powder_puff: 1.4,
  complete: 2.7
};

// VCT (Vinyl Composition Tile) additional cost per square foot
export const VCT_COST_PER_SQFT = 0.15;

// Travel cost per mile (accounting for round trip)
export const TRAVEL_COST_PER_MILE = 0.75; // Updated business mileage rate

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
  pet_resort: 400      // Thorough sanitization for animal areas and specialized cleaning
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
    "• Spot clean interior windows and glass (full window service quoted separately)\n" +
    "• Clean/sanitize bathrooms\n" +
    "• Clean light fixtures and perform hi-lo dusting\n" +
    "• Degrease and sanitize kitchen surfaces, hoods, and equipment areas\n" +
    "• Clean and sanitize food preparation surfaces and dining areas\n" +
    "• Detail clean bar areas and beverage stations\n" +
    "• Clean and polish all stainless steel surfaces",

  medical: "Final Cleaning includes:\n" +
    "• Sweep/mop/sanitize all hard surface floors with hospital-grade disinfectants\n" +
    "• Spot clean interior windows and glass (full window service quoted separately)\n" +
    "• Sanitize all bathrooms\n" +
    "• Clean light fixtures and perform hi-lo dusting\n" +
    "• Sanitize all medical equipment surfaces and patient areas\n" +
    "• Detail clean and disinfect exam rooms and waiting areas\n" +
    "• Clean and sanitize reception areas and nurse stations\n" +
    "• Special attention to high-touch surfaces with medical-grade cleaners",

  office: "Final Cleaning includes:\n" +
    "• Sweep/mop all hard surface floors and vacuum carpeted areas\n" +
    "• Spot clean interior windows and glass (full window service quoted separately)\n" +
    "• Clean bathrooms\n" +
    "• Clean light fixtures and perform hi-lo dusting\n" +
    "• Clean and sanitize break rooms and kitchen areas\n" +
    "• Detail clean conference rooms and reception areas\n" +
    "• Clean workstations and common areas\n" +
    "• Dust and clean all office furniture and equipment",

  retail: "Final Cleaning includes:\n" +
    "• Sweep/mop all hard surface floors and clean display areas\n" +
    "• Spot clean entrance glass (full window service quoted separately)\n" +
    "• Clean light fixtures and perform hi-lo dusting\n" +
    "• Detail clean fitting rooms and customer areas\n" +
    "• Clean and sanitize checkout counters and service desks\n" +
    "• Clean display cases and shelving units\n" +
    "• Special attention to customer-facing areas and displays",

  industrial: "Final Cleaning includes:\n" +
    "• Sweep/mop all hard surface floors and clean work areas\n" +
    "• Spot clean accessible windows and skylights (full window service quoted separately)\n" +
    "• Clean light fixtures and perform hi-lo dusting\n" +
    "• Clean and degrease machinery areas (external surfaces only)\n" +
    "• Clean break rooms and bathroom facilities\n" +
    "• Detail clean offices and meeting rooms\n" +
    "• Clean warehouse racking and storage areas as accessible",

  educational: "Final Cleaning includes:\n" +
    "• Sweep/mop all hard surface floors and clean classroom spaces\n" +
    "• Spot clean interior glass surfaces (full window service quoted separately)\n" +
    "• Clean light fixtures and perform hi-lo dusting\n" +
    "• Sanitize desks, chairs, and educational equipment\n" +
    "• Deep clean cafeteria and food service areas\n" +
    "• Clean gymnasium and recreational spaces\n" +
    "• Detail clean administrative offices and common areas",

  hotel: "Final Cleaning includes:\n" +
    "• Sweep/mop all hard surface floors and vacuum carpeted areas\n" +
    "• Spot clean interior glass surfaces (full window service quoted separately)\n" +
    "• Clean light fixtures and perform hi-lo dusting\n" +
    "• Detail clean guest rooms and corridors\n" +
    "• Clean and sanitize all bathroom facilities\n" +
    "• Clean lobby, reception, and common areas\n" +
    "• Detail clean conference rooms and business centers",

  jewelry_store: "Final Cleaning includes:\n" +
    "• Professional cleaning of all glass display cases (interior and exterior)\n" +
    "• Basic cleaning of mirrors and interior glass surfaces (full window service quoted separately)\n" +
    "• Meticulous dusting and polishing of display case lighting fixtures\n" +
    "• Detailed cleaning of customer consultation areas and seating\n" +
    "• Thorough cleaning of security fixtures and entrance areas\n" +
    "• Premium floor care with attention to high-end flooring materials\n" +
    "\nDisplay Cases:\n" +
    "• Interior and exterior cleaning with specialized glass cleaners\n" +
    "• Careful cleaning of display case tracks and locks\n" +
    "• Detailed cleaning of display lighting\n" +
    "• Cleaning and sanitizing of display case shelving\n" +
    "Cost per display case: $30 (includes interior and exterior cleaning)",
    
  apartment: "Final Cleaning includes:\n" +
    "• Sweep/mop all hard surface floors and vacuum carpeted areas in units and common areas\n" +
    "• Spot clean common area windows and entrances (full window service quoted separately)\n" +
    "• Clean light fixtures and perform hi-lo dusting throughout the property\n" +
    "• Detail clean lobbies, mailrooms, and other shared spaces\n" +
    "• Clean and sanitize common area restrooms and laundry facilities\n" +
    "• Clean fitness centers and amenity spaces\n" +
    "• Dust and clean all accessible surfaces in common areas",
    
  warehouse: "Final Cleaning includes:\n" +
    "• Sweep/dust mop warehouse floors and clean office areas\n" +
    "• Spot clean entrance areas (full window service quoted separately)\n" +
    "• Clean light fixtures and perform hi-lo dusting of accessible areas\n" +
    "• Clean break rooms and bathroom facilities\n" +
    "• Detail clean offices and meeting rooms\n" +
    "• Clean accessible warehouse racking and storage areas\n" +
    "• Special attention to loading dock and receiving areas",
    
  dormitory: "Final Cleaning includes:\n" +
    "• Sweep/mop all hard surface floors and vacuum carpeted areas in rooms and common spaces\n" +
    "• Spot clean common area glass and entrances (full window service quoted separately)\n" +
    "• Clean light fixtures and perform hi-lo dusting throughout the facility\n" +
    "• Sanitize shared bathroom facilities and shower areas\n" +
    "• Detail clean lounges, study areas, and communal kitchens\n" +
    "• Clean and sanitize laundry facilities\n" +
    "• Special attention to high-touch surfaces in all common areas",

  grocery_store: "Final Cleaning of ___ Sq Ft ___ includes: Hi-lo dust; sweep, scrub, and mop all hard-surface floors including aisles, checkout lanes, and back areas; clean walls and baseboards; clean and wipe-down all light fixtures; clean and disinfect restrooms; clean and wipe-down shelving, display cases (exterior), and refrigerated units (exterior); deep clean and sanitize high-traffic areas, entrances, and customer service desks; clean and sanitize produce, deli, bakery, and meat department areas (surfaces, sinks, non-food contact areas); spot clean storefront windows and doors (full window service quoted separately); clean break rooms and employee areas; properly clean trash receptacles and surrounding areas; clean and sanitize shopping carts and baskets area.",

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

  fast_food: "Final Cleaning of ___ Sq Ft ___ includes: Hi-lo dust; sweep, scrub, and mop hard-surface floors throughout the building; clean walls and baseboards from floor to ceiling; clean and wipe-down all light fixtures, can lights, and menu boards; remove all mud from grout; wipe-down and dust partitions; clean and wipe-down cabinets (inside and out); wipe-down and dust all surfaces; clean kitchen, clean and wipe-down all equipment in store; clean and wipe-down all kitchen equipment inside and out; wipe-down and polish all stainless steel (including behind equipment); clean and wipe-down all stainless end-caps, corner guards, and trim; spot clean storefront windows and doors (full window service quoted separately); remove protective plastic coating on equipment, cabinets, and dining room furniture; clean tables and chairs; clean all equipment in restrooms; clean, sanitize, and disinfect restrooms; wipe-down, polish, and sanitize restroom fixtures; deep clean and disinfect all food preparation surfaces, countertops, and service areas; clean and disinfect all dining area surfaces, including tables, chairs, and booths; properly clean trash receptacles and surrounding areas.",

  bakery: "Final Cleaning includes:\n" +
    "• Sweep/mop/sanitize all hard surface floors with food-safe cleaners\n" +
    "• Spot clean entrance glass (full window service quoted separately)\n" +
    "• Clean and sanitize all food preparation surfaces and equipment\n" +
    "• Clean and polish all stainless steel surfaces and bakery display cases\n" +
    "• Deep clean ovens, mixers, and specialized bakery equipment (external surfaces)\n" +
    "• Clean and sanitize customer service areas and café seating\n" +
    "• Dust and clean all light fixtures and perform hi-lo dusting\n" +
    "• Detail clean and sanitize storage areas and shelving\n" +
    "• Clean and sanitize bathroom facilities\n" +
    "• Empty all trash receptacles and replace liners\n" +
    "• Clean and sanitize employee break areas\n" +
    "• Special attention to removing flour and other bakery ingredients from surfaces",

  pet_resort: "Final Cleaning includes:\n" +
    "• Sweep/mop/sanitize all hard surface floors with pet-safe cleaners\n" +
    "• Spot clean interior windows and glass (full window service quoted separately)\n" +
    "• Clean and sanitize all bathroom facilities\n" +
    "• Clean light fixtures and perform hi-lo dusting\n" +
    "• Sanitize and deep clean animal boarding areas and kennels\n" +
    "• Clean and disinfect play areas and pet runs\n" +
    "• Detail clean grooming stations and bathing facilities\n" +
    "• Sanitize reception areas and waiting rooms\n" +
    "• Clean and disinfect feeding stations and food prep areas\n" +
    "• Special attention to odor control and pet hair removal"
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
  pet_resort: `${SCOPE_OF_WORK.pet_resort}`
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