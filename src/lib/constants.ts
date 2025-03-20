import { ProjectType, CleaningType } from './types';

// Base rate per square foot (in dollars)
export const BASE_RATE_PER_SQFT = 0.15;

// Project type multipliers
export const PROJECT_TYPE_MULTIPLIERS: Record<ProjectType, number> = {
  restaurant: 1.3,
  medical: 1.4,
  office: 1.0,
  retail: 1.1,
  industrial: 1.2,
  educational: 1.15,
  hotel: 1.35,
  jewelry_store: 1.5
};

// Cleaning type multipliers
export const CLEANING_TYPE_MULTIPLIERS: Record<CleaningType, number> = {
  rough: 0.8,
  final: 1.0,
  powder_puff: 1.3,
  complete: 2.0
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
  complete: 2.5
};

// VCT (Vinyl Composition Tile) additional cost per square foot
export const VCT_COST_PER_SQFT = 0.10;

// Travel cost per mile (accounting for round trip)
export const TRAVEL_COST_PER_MILE = 0.65; // Standard business mileage rate

// Hotel cost per night per room
export const HOTEL_COST_PER_NIGHT = 150;

// Per diem rate per person per day
export const PER_DIEM_PER_DAY = 75;

// Pressure washing cost per square foot
export const PRESSURE_WASHING_COST_PER_SQFT = 0.35;

// Pressure washing equipment rental cost per day
export const PRESSURE_WASHING_EQUIPMENT_RENTAL = 150;

// Pressure washing productivity (square feet per hour)
export const PRESSURE_WASHING_SQFT_PER_HOUR = 500;

// Urgency multipliers based on urgency level (1-10)
export const URGENCY_MULTIPLIERS: Record<number, number> = {
  1: 1.00, // No rush
  2: 1.03,
  3: 1.06,
  4: 1.09,
  5: 1.12, // Medium urgency
  6: 1.15,
  7: 1.18,
  8: 1.21,
  9: 1.25,
  10: 1.30 // Extremely urgent
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
  restaurant: 500,
  medical: 450,
  office: 650,
  retail: 600,
  industrial: 800,
  educational: 550,
  hotel: 480,      // Hotels require more detailed cleaning of guest rooms
  jewelry_store: 400  // Jewelry stores require meticulous attention to detail
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
export const WINDOW_CLEANING_COST_PER_WINDOW = 15; // Base cost per standard window
export const WINDOW_CLEANING_LARGE_WINDOW_MULTIPLIER = 1.5; // Multiplier for large windows
export const WINDOW_CLEANING_HIGH_ACCESS_MULTIPLIER = 2.0; // Multiplier for windows requiring lifts/ladders
export const WINDOW_CLEANING_WINDOWS_PER_HOUR = 6; // Average windows cleaned per hour

// Display case cleaning costs
export const DISPLAY_CASE_CLEANING_COST = 25; // Cost per display case
export const DISPLAY_CASE_TIME_PER_UNIT = 0.5; // Hours per display case

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
    "Cost per display case: $25 (includes interior and exterior cleaning)"
}; 