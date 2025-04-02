import { ProjectType, CleaningType } from './types';

// Base rate per square foot (in dollars)
export const BASE_RATE_PER_SQFT = 0.18;

// Project type multipliers
export const PROJECT_TYPE_MULTIPLIERS: Record<ProjectType, number> = {
  restaurant: 1.4,
  medical: 1.5,
  office: 1.0,
  retail: 1.2,
  industrial: 1.3,
  educational: 1.25,
  hotel: 1.45,
  jewelry_store: 1.6,
  apartment: 1.1,
  warehouse: 1.2,
  dormitory: 1.3
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
  dormitory: 500      // Similar to hotel but with common areas and shared spaces
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
    "• Wipe interior/exterior windows and clean/sanitize bathrooms\n" +
    "• Clean light fixtures and perform hi-lo dusting\n" +
    "• Degrease and sanitize kitchen surfaces, hoods, and equipment areas\n" +
    "• Clean and sanitize food preparation surfaces and dining areas\n" +
    "• Detail clean bar areas and beverage stations\n" +
    "• Clean and polish all stainless steel surfaces",

  medical: "Final Cleaning includes:\n" +
    "• Sweep/mop/sanitize all hard surface floors with hospital-grade disinfectants\n" +
    "• Wipe interior/exterior windows and sanitize all bathrooms\n" +
    "• Clean light fixtures and perform hi-lo dusting\n" +
    "• Sanitize all medical equipment surfaces and patient areas\n" +
    "• Detail clean and disinfect exam rooms and waiting areas\n" +
    "• Clean and sanitize reception areas and nurse stations\n" +
    "• Special attention to high-touch surfaces with medical-grade cleaners",

  office: "Final Cleaning includes:\n" +
    "• Sweep/mop all hard surface floors and vacuum carpeted areas\n" +
    "• Wipe interior/exterior windows and clean bathrooms\n" +
    "• Clean light fixtures and perform hi-lo dusting\n" +
    "• Clean and sanitize break rooms and kitchen areas\n" +
    "• Detail clean conference rooms and reception areas\n" +
    "• Clean workstations and common areas\n" +
    "• Dust and clean all office furniture and equipment",

  retail: "Final Cleaning includes:\n" +
    "• Sweep/mop all hard surface floors and clean display areas\n" +
    "• Clean all windows (interior/exterior) and entrance glass\n" +
    "• Clean light fixtures and perform hi-lo dusting\n" +
    "• Detail clean fitting rooms and customer areas\n" +
    "• Clean and sanitize checkout counters and service desks\n" +
    "• Clean display cases and shelving units\n" +
    "• Special attention to customer-facing areas and displays",

  industrial: "Final Cleaning includes:\n" +
    "• Sweep/mop all hard surface floors and clean work areas\n" +
    "• Clean windows and skylights (interior/exterior)\n" +
    "• Clean light fixtures and perform hi-lo dusting\n" +
    "• Clean and degrease machinery areas (external surfaces only)\n" +
    "• Clean break rooms and bathroom facilities\n" +
    "• Detail clean offices and meeting rooms\n" +
    "• Clean warehouse racking and storage areas as accessible",

  educational: "Final Cleaning includes:\n" +
    "• Sweep/mop all hard surface floors and clean classroom spaces\n" +
    "• Clean all windows (interior/exterior) and glass surfaces\n" +
    "• Clean light fixtures and perform hi-lo dusting\n" +
    "• Sanitize desks, chairs, and educational equipment\n" +
    "• Deep clean cafeteria and food service areas\n" +
    "• Clean gymnasium and recreational spaces\n" +
    "• Detail clean administrative offices and common areas",

  hotel: "Final Cleaning includes:\n" +
    "• Sweep/mop all hard surface floors and vacuum carpeted areas\n" +
    "• Clean all windows (interior/exterior) and glass surfaces\n" +
    "• Clean light fixtures and perform hi-lo dusting\n" +
    "• Detail clean guest rooms and corridors\n" +
    "• Clean and sanitize all bathroom facilities\n" +
    "• Clean lobby, reception, and common areas\n" +
    "• Detail clean conference rooms and business centers",

  jewelry_store: "Final Cleaning includes:\n" +
    "• Professional cleaning of all glass display cases (interior and exterior)\n" +
    "• Specialized cleaning of mirrors and glass surfaces with jewelry-safe solutions\n" +
    "• Meticulous dusting and polishing of display case lighting fixtures\n" +
    "• Detailed cleaning of customer consultation areas and seating\n" +
    "• Thorough cleaning of security fixtures and entrance areas\n" +
    "• Premium floor care with attention to high-end flooring materials\n" +
    "• Streak-free cleaning of all windows and reflective surfaces\n" +
    "\nDisplay Cases:\n" +
    "• Interior and exterior cleaning with specialized glass cleaners\n" +
    "• Careful cleaning of display case tracks and locks\n" +
    "• Detailed cleaning of display lighting\n" +
    "• Cleaning and sanitizing of display case shelving\n" +
    "Cost per display case: $30 (includes interior and exterior cleaning)",
    
  apartment: "Final Cleaning includes:\n" +
    "• Sweep/mop all hard surface floors and vacuum carpeted areas in units and common areas\n" +
    "• Clean all windows in common areas and entrances\n" +
    "• Clean light fixtures and perform hi-lo dusting throughout the property\n" +
    "• Detail clean lobbies, mailrooms, and other shared spaces\n" +
    "• Clean and sanitize common area restrooms and laundry facilities\n" +
    "• Clean fitness centers and amenity spaces\n" +
    "• Dust and clean all accessible surfaces in common areas",
    
  warehouse: "Final Cleaning includes:\n" +
    "• Sweep/dust mop warehouse floors and clean office areas\n" +
    "• Clean windows and entrance areas\n" +
    "• Clean light fixtures and perform hi-lo dusting of accessible areas\n" +
    "• Clean break rooms and bathroom facilities\n" +
    "• Detail clean offices and meeting rooms\n" +
    "• Clean accessible warehouse racking and storage areas\n" +
    "• Special attention to loading dock and receiving areas",
    
  dormitory: "Final Cleaning includes:\n" +
    "• Sweep/mop all hard surface floors and vacuum carpeted areas in rooms and common spaces\n" +
    "• Clean all common area windows and entrance glass\n" +
    "• Clean light fixtures and perform hi-lo dusting throughout the facility\n" +
    "• Sanitize shared bathroom facilities and shower areas\n" +
    "• Detail clean lounges, study areas, and communal kitchens\n" +
    "• Clean and sanitize laundry facilities\n" +
    "• Special attention to high-touch surfaces in all common areas"
};

// Project type specific scopes of work
export const PROJECT_SCOPES: Record<string, string> = {
  fast_food: `Final Cleaning of ___ Sq Ft ___ includes: Hi-lo dust; sweep, scrub, and mop hard-surface floors throughout the building; scrub and buff kitchen floors with a floor scrubber; clean walls and baseboards from floor to ceiling; clean and wipe-down all light fixtures, can lights, and menu boards; remove all mud from grout; wipe-down and dust partitions; clean and wipe-down cabinets (inside and out); wipe-down and dust all surfaces; clean kitchen, clean and wipe-down all equipment in store; clean and wipe-down all kitchen equipment inside and out; wipe-down and polish all stainless steel (including behind equipment); clean and wipe-down all stainless end-caps, corner guards, and trim; clean interior/exterior storefront windows and doors; remove protective plastic coating on equipment, cabinets, and dining room furniture; clean tables and chairs; clean all equipment in restrooms; clean, sanitize, and disinfect restrooms; wipe-down, polish, and sanitize restroom fixtures; deep clean and disinfect all food preparation surfaces, countertops, and service areas; clean and disinfect all dining area surfaces, including tables, chairs, and booths; properly clean trash receptacles and surrounding areas.`,
  
  restaurant: `Final Cleaning of ___ Sq Ft ___ includes: Hi-lo dust; sweep, scrub, and mop hard-surface floors throughout the building; scrub and buff kitchen floors with a floor scrubber; clean walls and baseboards from floor to ceiling; clean and wipe-down all light fixtures, can lights, and menu boards; remove all mud from grout; wipe-down and dust partitions; clean and wipe-down cabinets (inside and out); wipe-down and dust all surfaces; clean kitchen, clean and wipe-down all equipment in store; clean and wipe-down all kitchen equipment inside and out; wipe-down and polish all stainless steel (including behind equipment); clean and wipe-down all stainless end-caps, corner guards, and trim; clean interior/exterior storefront windows and doors; remove protective plastic coating on equipment, cabinets, and dining room furniture; clean tables and chairs; clean all equipment in restrooms; clean, sanitize, and disinfect restrooms; wipe-down, polish, and sanitize restroom fixtures; deep clean and disinfect all food preparation surfaces, countertops, and service areas; clean and disinfect all dining area surfaces, including tables, chairs, and booths; properly clean trash receptacles and surrounding areas.`,
  
  hotel: `Final Cleaning of ___ Sq Ft ___ includes: Hi-lo dust; sweep, scrub, and mop all hard-surface floors; clean walls and baseboards from floor to ceiling; clean and wipe-down all light fixtures and ceiling fans; remove all mud from grout; wipe-down and dust partitions; clean and wipe-down cabinets (inside and out); wipe-down and dust all surfaces; clean and sanitize all guest rooms and bathrooms; clean and disinfect all public areas including lobbies, hallways, and elevators; clean and polish all glass surfaces including mirrors and windows; clean and sanitize all furniture including beds, chairs, and tables; clean and disinfect all bathroom fixtures and surfaces; clean and sanitize all high-touch areas including door handles, light switches, and remote controls; properly clean trash receptacles and surrounding areas; clean and sanitize all fitness center equipment and areas; clean and sanitize all meeting rooms and conference areas; clean and sanitize all pool areas and equipment.`,
  
  medical: `Final Cleaning of ___ Sq Ft ___ includes: Hi-lo dust; sweep, scrub, and mop all hard-surface floors; clean walls and baseboards from floor to ceiling; clean and wipe-down all light fixtures and ceiling fans; remove all mud from grout; wipe-down and dust partitions; clean and wipe-down cabinets (inside and out); wipe-down and dust all surfaces; clean and disinfect all patient rooms and bathrooms; clean and sanitize all medical equipment and surfaces; clean and disinfect all public areas including waiting rooms, hallways, and elevators; clean and polish all glass surfaces including mirrors and windows; clean and sanitize all furniture including chairs and tables; clean and disinfect all bathroom fixtures and surfaces; clean and sanitize all high-touch areas including door handles, light switches, and elevator buttons; properly clean trash receptacles and surrounding areas; clean and sanitize all exam rooms and medical equipment; clean and sanitize all nurse stations and medical supply areas; clean and sanitize all laboratory areas and equipment.`,
  
  retail: `Final Cleaning of ___ Sq Ft ___ includes: Hi-lo dust; sweep, scrub, and mop all hard-surface floors; clean walls and baseboards from floor to ceiling; clean and wipe-down all light fixtures and ceiling fans; remove all mud from grout; wipe-down and dust partitions; clean and wipe-down cabinets (inside and out); wipe-down and dust all surfaces; clean and sanitize all sales areas and display cases; clean and disinfect all public areas including entrances, hallways, and elevators; clean and polish all glass surfaces including mirrors and windows; clean and sanitize all furniture including display tables and chairs; clean and disinfect all bathroom fixtures and surfaces; clean and sanitize all high-touch areas including door handles, light switches, and elevator buttons; properly clean trash receptacles and surrounding areas; clean and sanitize all fitting rooms and storage areas; clean and sanitize all checkout areas and POS systems; clean and sanitize all employee break rooms and offices.`,
  
  office: `Final Cleaning of ___ Sq Ft ___ includes: Hi-lo dust; sweep, scrub, and mop all hard-surface floors; clean walls and baseboards from floor to ceiling; clean and wipe-down all light fixtures and ceiling fans; remove all mud from grout; wipe-down and dust partitions; clean and wipe-down cabinets (inside and out); wipe-down and dust all surfaces; clean and sanitize all workstations and desks; clean and disinfect all public areas including lobbies, hallways, and elevators; clean and polish all glass surfaces including mirrors and windows; clean and sanitize all furniture including chairs and tables; clean and disinfect all bathroom fixtures and surfaces; clean and sanitize all high-touch areas including door handles, light switches, and elevator buttons; properly clean trash receptacles and surrounding areas; clean and sanitize all conference rooms and meeting areas; clean and sanitize all break rooms and kitchen areas; clean and sanitize all reception areas and waiting rooms.`,
  
  default: `Final Cleaning of ___ Sq Ft ___ includes: sweep/mop all hard surface floors; wipe interior/exterior windows and clean bathrooms; clean light fixtures, hi-lo dusting; clean and sanitize all surfaces; clean and disinfect all high-touch areas; properly clean trash receptacles and surrounding areas.`
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