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
  coffee_shop: 1.25,
  dental_office: 1.4,
  pet_resort: 1.4,
  beauty_store: 1.3,
  interactive_toy_store: 1.45,
  mailroom: 1.25,
  church: 1.35,
  residential: 1.0,
  car_wash: 1.2,
  construction_trailor: 1.1,
  shell_building: 0.7
};

// Cleaning type multipliers
export const CLEANING_TYPE_MULTIPLIERS: Record<CleaningType, number> = {
  rough: 0.8,
  final: 1.0,
  rough_final: 1.2,
  rough_final_touchup: 1.45,
  pressure_washing_only: 1.0,
  window_cleaning_only: 1.0
};

// Cleaning type descriptions
export const CLEANING_TYPE_DESCRIPTIONS: Record<CleaningType, string> = {
  rough: "First stage cleaning that focuses on debris removal and basic surface cleaning (80% of standard rate).",
  final: "Complete detailed cleaning of all surfaces and areas (standard rate).",
  rough_final: "Combination of first stage rough clean followed by final clean (120% of standard rate).",
  rough_final_touchup: "Comprehensive package including rough clean, final clean, and touchup service (145% of standard rate).",
  pressure_washing_only: "Specialized exterior pressure washing services only - no interior cleaning included. No minimum requirements - available for any area size.",
  window_cleaning_only: "Specialized window cleaning services only - no interior cleaning included. No minimum requirements - available for any number of windows."
};

// Cleaning type time multipliers (how much longer each type takes)
export const CLEANING_TYPE_TIME_MULTIPLIERS: Record<CleaningType, number> = {
  rough: 0.7,
  final: 1.0,
  rough_final: 1.5,
  rough_final_touchup: 1.8,
  pressure_washing_only: 1.0,
  window_cleaning_only: 1.0
};

// VCT (Vinyl Composition Tile) additional cost per square foot
export const VCT_COST_PER_SQFT = 0.15;

// Travel cost per mile (accounting for round trip)
export const TRAVEL_COST_PER_MILE = 0.60; // Adjusted mileage rate for balanced pricing

// Hotel cost per night per room
export const HOTEL_COST_PER_NIGHT = 175;

// Per diem rate per person per day
export const PER_DIEM_PER_DAY = 85;

// Pressure washing cost per square foot
export const PRESSURE_WASHING_COST_PER_SQFT = 0.25;

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
  restaurant: 450,
  medical: 400,
  office: 600,
  retail: 550,
  industrial: 750,
  educational: 500,
  hotel: 425,
  jewelry_store: 350,
  apartment: 550,
  warehouse: 850,
  dormitory: 500,
  grocery_store: 480,
  yoga_studio: 500,
  kids_fitness: 450,
  fast_food: 450,
  bakery: 430,
  coffee_shop: 460,
  dental_office: 380,
  pet_resort: 400,
  beauty_store: 420,
  interactive_toy_store: 380,
  mailroom: 520,
  church: 430,
  residential: 500,
  car_wash: 500,
  construction_trailor: 400,
  shell_building: 1000
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

// Scope of work descriptions
export const SCOPE_OF_WORK: Record<ProjectType, string> = {
  restaurant: 'Post-construction cleaning of ___ Sq Ft ___ restaurant space including kitchen areas, dining areas, restrooms, and service areas.',
  medical: 'Post-construction cleaning of ___ Sq Ft ___ medical facility including exam rooms, waiting areas, and specialized medical spaces.',
  office: 'Post-construction cleaning of ___ Sq Ft ___ office space including workstations, conference rooms, break rooms, and common areas.',
  retail: 'Post-construction cleaning of ___ Sq Ft ___ retail space including sales floor, stockroom, and customer areas.',
  industrial: 'Post-construction cleaning of ___ Sq Ft ___ industrial space including work areas, equipment spaces, and utility rooms.',
  educational: 'Post-construction cleaning of ___ Sq Ft ___ educational facility including classrooms, administrative areas, and common spaces.',
  hotel: 'Post-construction cleaning of ___ Sq Ft ___ hotel space including guest rooms, lobbies, and service areas.',
  jewelry_store: 'Post-construction cleaning of ___ Sq Ft ___ jewelry store including display areas, security rooms, and customer spaces.',
  apartment: 'Post-construction cleaning of ___ Sq Ft ___ apartment complex including residential units and common areas.',
  warehouse: 'Post-construction cleaning of ___ Sq Ft ___ warehouse space including storage areas and loading docks.',
  dormitory: 'Post-construction cleaning of ___ Sq Ft ___ dormitory including student rooms and common areas.',
  grocery_store: 'Post-construction cleaning of ___ Sq Ft ___ grocery store including retail floor, storage areas, and food prep spaces.',
  yoga_studio: 'Post-construction cleaning of ___ Sq Ft ___ yoga studio including practice areas and changing rooms.',
  kids_fitness: 'Post-construction cleaning of ___ Sq Ft ___ kids fitness center including activity areas and safety equipment.',
  fast_food: 'Post-construction cleaning of ___ Sq Ft ___ fast food restaurant including kitchen, dining, and service areas.',
  bakery: 'Post-construction cleaning of ___ Sq Ft ___ bakery including kitchen, retail, and storage areas.',
  coffee_shop: 'Post-construction cleaning of ___ Sq Ft ___ coffee shop including service counter, seating, and preparation areas.',
  dental_office: 'Post-construction cleaning of ___ Sq Ft ___ dental office including treatment rooms and waiting areas.',
  pet_resort: 'Post-construction cleaning of ___ Sq Ft ___ pet resort including kennels and grooming areas.',
  beauty_store: 'Post-construction cleaning of ___ Sq Ft ___ beauty store including retail floor and testing stations.',
  interactive_toy_store: 'Post-construction cleaning of ___ Sq Ft ___ interactive toy store including play areas and retail spaces.',
  mailroom: 'Post-construction cleaning of ___ Sq Ft ___ mailroom including sorting areas and storage spaces.',
  church: 'Post-construction cleaning of ___ Sq Ft ___ church including worship space and auxiliary rooms.',
  residential: 'Post-construction cleaning of ___ Sq Ft ___ residential property including living spaces and utility areas.',
  car_wash: 'Post-construction cleaning of ___ Sq Ft ___ car wash including wash bays and equipment rooms.',
  construction_trailor: 'Post-construction cleaning of ___ Sq Ft ___ construction trailer including office space and meeting areas.',
  shell_building: 'Post-construction cleaning of ___ Sq Ft ___ retail shell building. Includes:\n' +
    '• Thorough cleaning of restroom fixtures and surfaces\n' +
    '• Removal of construction debris and dust\n' +
    '• Cleaning of concrete floors\n' +
    '• Cleaning of any installed basic fixtures\n' +
    '• Window and glass cleaning (if installed)\n' +
    '• Sanitization of restroom facilities\n' +
    '• Removal of construction labels and stickers\n' +
    '• Basic dusting of exposed surfaces/ductwork'
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
  coffee_shop: `${SCOPE_OF_WORK.coffee_shop}`,
  dental_office: `${SCOPE_OF_WORK.dental_office}`,
  pet_resort: `${SCOPE_OF_WORK.pet_resort}`,
  beauty_store: `${SCOPE_OF_WORK.beauty_store}`,
  interactive_toy_store: `${SCOPE_OF_WORK.interactive_toy_store}`,
  mailroom: `${SCOPE_OF_WORK.mailroom}`,
  church: `${SCOPE_OF_WORK.church}`,
  residential: `${SCOPE_OF_WORK.residential}`,
  car_wash: `${SCOPE_OF_WORK.car_wash}`,
  construction_trailor: `${SCOPE_OF_WORK.construction_trailor}`,
  shell_building: `
    • Thorough cleaning and sanitization of restroom fixtures and surfaces
    • Complete removal of construction debris and dust from all areas
    • Deep cleaning of concrete floors and removal of any construction residue
    • Cleaning and inspection of any installed basic fixtures
    • Window and glass cleaning (if installed) including frame cleaning
    • Detailed sanitization of all restroom facilities and fixtures
    • Removal of all construction labels, stickers, and temporary markings
    • Basic dusting and cleaning of exposed surfaces, ductwork, and ceiling areas
    • Final inspection to ensure all areas meet post-construction standards
  `
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
  DUMPSTER_CORRAL: {
    rate: 0.30, // per square foot
    minimum: 300,
    description: 'Dumpster corral cleaning service'
  },
  COMMERCIAL: {
    rate: 0.25, // per square foot
    minimum: 500,
    description: 'Commercial surface pressure washing'
  },
  DAILY_RATE: 1800 // for jobs outside standard rates
};

// Updated chemical information with detailed ratios and costs
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
  },
  EFFORTLESS: {
    name: 'Effortless',
    costs: {
      GALLON: 31.20,
      FIVE_GALLONS: 130.95
    },
    use: 'General purpose cleaning'
  },
  HD_BRITENOL: {
    name: 'HD Britenol',
    costs: {
      GALLON: 29.85,
      FIVE_GALLONS: 124.05
    },
    use: 'Brightening agent'
  }
};

export const PRESSURE_WASHING_PAYMENT_TERMS = {
  INDUSTRIAL: 'Net 30',
  COMMERCIAL: 'Net 10',
  RESIDENTIAL: 'POI (Payment on Invoice)'
};

// Add pressure washing scope of work
export const PRESSURE_WASHING_SCOPE_OF_WORK = {
  SOFT_WASH: "Soft Wash Service includes:\n" +
    "• Professional high-volume, low-pressure cleaning system\n" +
    "• Eco-friendly cleaning solutions customized for your surface\n" +
    "• Complete treatment of all specified exterior surfaces\n" +
    "• Removal of dirt, algae, mold, mildew, and light staining\n" +
    "• Detailed attention to trouble areas and corners\n" +
    "• Thorough rinsing to remove all cleaning solutions\n" +
    "• Basic landscape protection during service\n" +
    "• All necessary equipment and cleaning supplies",
  
  ROOF_WASH: "Roof Wash Service includes:\n" +
    "• Specialized low-pressure roof cleaning system\n" +
    "• Treatment with professional-grade cleaning solutions\n" +
    "• Safe removal of black streaks, moss, and algae\n" +
    "• Complete treatment of all roof surfaces\n" +
    "• Cleaning of gutters from roof debris\n" +
    "• Protection of surrounding landscaping\n" +
    "• Safe application techniques that protect roof integrity\n" +
    "• All necessary equipment and cleaning supplies",
  
  DRIVEWAY: "Driveway Pressure Washing includes:\n" +
    "• High-pressure cleaning of concrete or asphalt surface\n" +
    "• Pre-treatment with appropriate degreasing agents\n" +
    "• Removal of oil stains, tire marks, and organic growth\n" +
    "• Special attention to edges and trouble spots\n" +
    "• Thorough rinsing to remove all cleaning solutions\n" +
    "• Post-cleaning inspection with customer\n" +
    "• All necessary equipment and cleaning supplies",
  
  DECK: "Deck Pressure Washing includes:\n" +
    "• Appropriate pressure cleaning for wooden surfaces\n" +
    "• Pre-treatment with wood-appropriate cleaning solutions\n" +
    "• Removal of mildew, algae, and weathered gray surface\n" +
    "• Detailed cleaning of railings, steps, and between boards\n" +
    "• Safe techniques that protect wood integrity\n" +
    "• Post-cleaning inspection\n" +
    "• All necessary equipment and cleaning supplies",
  
  TREX: "Trex/Composite Deck Cleaning includes:\n" +
    "• Low-pressure cleaning safe for composite surfaces\n" +
    "• Specialized cleaning solutions for composite material\n" +
    "• Safe removal of mold, mildew, food stains, and dirt\n" +
    "• Detailed cleaning of railings, steps, and between boards\n" +
    "• Techniques that maintain manufacturer warranty\n" +
    "• Post-cleaning inspection\n" +
    "• All necessary equipment and cleaning supplies",
  
  DUMPSTER_CORRAL: "Dumpster Corral Cleaning includes:\n" +
    "• High-pressure deep cleaning of concrete pad\n" +
    "• Treatment with heavy-duty degreasing agents\n" +
    "• Sanitizing treatment to reduce odors\n" +
    "• Cleaning of surrounding walls and enclosure\n" +
    "• Removal of organic matter and waste residue\n" +
    "• Proper disposal of cleaning wastewater\n" +
    "• All necessary equipment and cleaning supplies",
  
  COMMERCIAL: "Commercial Pressure Washing Service includes:\n" +
    "• Professional high-pressure cleaning of all specified areas\n" +
    "• Pre-treatment with appropriate cleaning agents\n" +
    "• Removal of dirt, grime, oil, and organic growth\n" +
    "• Careful attention to high-traffic areas\n" +
    "• Safe techniques for various surface materials\n" +
    "• All necessary equipment, chemicals, and cleaning supplies\n" +
    "• Compliance with local wastewater regulations\n" +
    "• Professional uniformed technicians"
}; 