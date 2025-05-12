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
  construction_trailor: 1.1
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
  coffee_shop: 460,    // Specialized cleaning for coffee equipment and customer seating areas
  dental_office: 380,  // Highly detailed cleaning requiring specialized protocols and disinfection
  pet_resort: 400,      // Thorough sanitization for animal areas and specialized cleaning
  beauty_store: 420,    // Detailed cleaning of product displays and testing stations
  interactive_toy_store: 380,    // Interactive play areas and complex environments require detailed cleaning
  mailroom: 520,         // Specialized cleaning for shipping/mailing areas with focus on dust control
  church: 430,          // Large open spaces with detailed cleaning of pews, altars, and religious fixtures
  residential: 500,
  car_wash: 500,
  construction_trailor: 400
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
    "• Cleaning and sanitizing of display case shelving",
    
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

  coffee_shop: "Final Cleaning includes:\n" +
    "• Sweep/mop/sanitize all hard surface floors with food-safe cleaners\n" +
    "• Spot clean interior windows and glass (full window service quoted separately)\n" +
    "• Clean and sanitize all food preparation surfaces and countertops\n" +
    "• Clean and polish all stainless steel surfaces and display cases\n" +
    "• Detail clean espresso machines, coffee grinders, and brewing equipment (external surfaces)\n" +
    "• Clean and sanitize customer seating areas and café tables\n" +
    "• Dust and clean all light fixtures and perform hi-lo dusting\n" +
    "• Detail clean and sanitize storage areas and shelving\n" +
    "• Clean and sanitize bathroom facilities\n" +
    "• Empty all trash receptacles and replace liners\n" +
    "• Clean and sanitize employee break areas\n" +
    "• Special attention to coffee grounds, syrup residues, and milk spills",

  dental_office: "Final Cleaning includes:\n" +
    "• Sweep/mop/sanitize all hard surface floors with hospital-grade disinfectants\n" +
    "• Spot clean interior windows and glass (full window service quoted separately)\n" +
    "• Clean and sanitize all bathroom facilities with medical-grade cleaners\n" +
    "• Clean light fixtures and perform hi-lo dusting\n" +
    "• Deep clean and sanitize dental operatories including chairs, equipment surfaces, and cabinetry\n" +
    "• Sanitize dental equipment surfaces (external surfaces only - no internal components)\n" +
    "• Clean and disinfect sterilization areas and lab spaces\n" +
    "• Detail clean waiting room, reception area, and patient consultation rooms\n" +
    "• Special attention to high-touch surfaces with medical-grade cleaners\n" +
    "• Clean and sanitize employee break areas and staff workstations\n" +
    "• Empty all trash receptacles and properly dispose of non-medical waste\n" +
    "• Special attention to dental material residues and waterlines",

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
    "• Special attention to odor control and pet hair removal",

  beauty_store: "Final Cleaning includes:\n" +
    "• Sweep/mop all hard surface floors and deep clean retail areas\n" +
    "• Spot clean interior windows and mirrors (full window service quoted separately)\n" +
    "• Clean and sanitize all bathroom facilities\n" +
    "• Clean light fixtures and perform hi-lo dusting\n" +
    "• Detail clean product display shelves and cosmetic testing stations\n" +
    "• Sanitize makeup testing areas and applicators\n" +
    "• Clean and polish glass display cases and countertops\n" +
    "• Dust and clean all retail fixtures and shelving\n" +
    "• Detail clean checkout counters and service areas\n" +
    "• Clean and sanitize employee break rooms and back-of-house areas\n" +
    "• Special attention to makeup residue and product spills",

  interactive_toy_store: "Final Cleaning includes:\n" +
    "• Mascot Area: Deep clean costume storage, sanitize mascot props and photo zones\n" +
    "• Hallways: Sweep/mop all hallway floors, clean themed walls and interactive elements\n" +
    "• Retail A: Dust and clean merchandise displays, clean product shelving, sanitize interactive demos\n" +
    "• Retail B: Vacuum carpeted play areas, sanitize toys and activity stations, clean countertops\n" +
    "• Stockroom: Organize and clean storage areas, sweep/mop floors, dust inventory shelving\n" +
    "• Bathrooms: Deep clean and sanitize all toilet facilities, refill soap dispensers, clean mirrors\n" +
    "• Office: Dust and clean workstations, sanitize shared equipment, clean floors\n" +
    "• Janitor Area: Organize cleaning supplies, sanitize mop sinks, clean equipment storage\n" +
    "• Clean light fixtures and perform hi-lo dusting throughout all areas\n" +
    "• Sanitize all high-touch interactive elements and play stations\n" +
    "• Spot clean interior walls, displays, and themed decorations\n" +
    "• Empty all trash receptacles and replace liners\n" +
    "• Special attention to sanitizing children's play areas and interactive installations",

  mailroom: "Final Cleaning includes:\n" +
    "• Sweep/mop all hard surface floors and vacuum carpeted areas\n" +
    "• Dust and clean sorting stations, package shelves, and mailboxes\n" +
    "• Clean and sanitize customer service counters and workstations\n" +
    "• Spot clean interior windows and glass surfaces (full window service quoted separately)\n" +
    "• Clean light fixtures and perform hi-lo dusting of package racks and shelving\n" +
    "• Sanitize high-touch surfaces including scanners, scales, and POS equipment\n" +
    "• Clean and sanitize bathroom facilities\n" +
    "• Detail clean break rooms and employee areas\n" +
    "• Clean shipping/mailing equipment exteriors and packaging stations\n" +
    "• Empty all trash receptacles and replace liners\n" +
    "• Special attention to removing tape residue, label backing, and packaging debris",

  church: "Final Cleaning includes:\n" +
    "• Sweep/vacuum/mop all flooring in sanctuary, narthex, and common areas\n" +
    "• Clean and polish pews, altars, pulpits, and religious fixtures\n" +
    "• Dust and clean all surfaces including choir areas and instrument sections\n" +
    "• Spot clean interior windows and glass (full window service quoted separately)\n" +
    "• Clean light fixtures and perform hi-lo dusting of cathedral ceilings and high areas\n" +
    "• Clean and sanitize all bathroom facilities\n" +
    "• Detail clean fellowship halls and community spaces\n" +
    "• Clean office areas and private pastoral spaces\n" +
    "• Dust and clean all religious symbols, artwork, and decorative elements\n" +
    "• Empty all trash receptacles and replace liners\n" +
    "• Special attention to high-touch surfaces in children's ministry areas\n" +
    "• Clean and sanitize kitchen/pantry areas used for communion and events",

  residential: "Final Cleaning includes:\n" +
    "• Sweep, vacuum, and mop all hard surface floors and stairs\n" +
    "• Clean and sanitize bathrooms, kitchens, and laundry areas\n" +
    "• Clean interior windows, sills, and tracks (full window service quoted separately)\n" +
    "• Remove dust from all surfaces, baseboards, and trim\n" +
    "• Clean light fixtures, switches, and outlets\n" +
    "• Remove stickers and construction debris from all surfaces\n" +
    "• Clean cabinets, closets, and storage areas\n" +
    "• Detail clean all rooms, including bedrooms, living areas, and hallways\n" +
    "• Final touch-up and inspection prior to client walk-through",

  car_wash: "Car Wash Cleaning includes:\n" +
    "• Pressure wash all exterior and interior bay surfaces\n" +
    "• Clean and vacuum all customer and equipment areas\n" +
    "• Remove trash and debris from all bays and vacuum stations\n" +
    "• Clean and polish all glass, mirrors, and payment kiosks\n" +
    "• Wipe down and sanitize all touchpoints (buttons, handles, hoses)\n" +
    "• Clean and degrease equipment pads and pump areas\n" +
    "• Inspect and clean signage and lighting fixtures\n" +
    "• Final inspection for spot cleaning and detail work",

  construction_trailor: `• Clean and disinfect all surfaces, desks, and workstations\n• Sweep and mop floors\n• Clean restrooms and restock supplies\n• Empty trash and replace liners\n• Clean windows and glass surfaces\n• Sanitize high-touch areas (door handles, switches, etc.)`
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
  construction_trailor: `${SCOPE_OF_WORK.construction_trailor}`
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