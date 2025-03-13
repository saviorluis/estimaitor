import { FormData, EstimateData, CleaningType } from './types';
import { 
  BASE_RATE_PER_SQFT, 
  PROJECT_TYPE_MULTIPLIERS, 
  CLEANING_TYPE_MULTIPLIERS,
  CLEANING_TYPE_TIME_MULTIPLIERS,
  VCT_COST_PER_SQFT,
  TRAVEL_COST_PER_MILE,
  HOTEL_COST_PER_NIGHT,
  PER_DIEM_PER_DAY,
  URGENCY_MULTIPLIERS,
  PRESSURE_WASHING_COST_PER_SQFT,
  PRESSURE_WASHING_EQUIPMENT_RENTAL,
  PRESSURE_WASHING_SQFT_PER_HOUR,
  WINDOW_CLEANING_COST_PER_WINDOW,
  WINDOW_CLEANING_LARGE_WINDOW_MULTIPLIER,
  WINDOW_CLEANING_HIGH_ACCESS_MULTIPLIER,
  WINDOW_CLEANING_WINDOWS_PER_HOUR,
  DISPLAY_CASE_CLEANING_COST,
  DISPLAY_CASE_TIME_PER_UNIT
} from './constants';

export function calculateEstimate(formData: FormData): EstimateData {
  // Extract form data
  const {
    projectType,
    cleaningType,
    squareFootage,
    hasVCT,
    distanceFromOffice,
    gasPrice: rawGasPrice,
    applyMarkup,
    stayingOvernight,
    numberOfNights,
    numberOfCleaners,
    urgencyLevel,
    needsPressureWashing,
    pressureWashingArea,
    needsWindowCleaning,
    numberOfWindows,
    numberOfLargeWindows,
    numberOfHighAccessWindows,
    numberOfDisplayCases
  } = formData;

  // Ensure gasPrice is a number
  const gasPrice = typeof rawGasPrice === 'string' ? parseFloat(rawGasPrice) : (rawGasPrice || 3.50);

  // Calculate base price
  const basePrice = squareFootage * BASE_RATE_PER_SQFT;

  // Apply project type multiplier
  const projectTypeMultiplier = PROJECT_TYPE_MULTIPLIERS[projectType];
  
  // Apply cleaning type multiplier
  const cleaningTypeMultiplier = CLEANING_TYPE_MULTIPLIERS[cleaningType];

  // Calculate VCT cost if applicable
  const vctCost = hasVCT ? squareFootage * VCT_COST_PER_SQFT : 0;

  // Calculate travel cost (round trip)
  const roundTripDistance = distanceFromOffice * 2; // Multiply by 2 for round trip
  const travelCost = roundTripDistance * TRAVEL_COST_PER_MILE * gasPrice;

  // Calculate overnight cost if applicable
  let overnightCost = 0;
  if (stayingOvernight) {
    const hotelRooms = Math.ceil(numberOfCleaners / 2); // 2 people per room
    const hotelCost = hotelRooms * HOTEL_COST_PER_NIGHT * numberOfNights;
    const perDiemCost = numberOfCleaners * PER_DIEM_PER_DAY * numberOfNights;
    overnightCost = hotelCost + perDiemCost;
  }

  // Calculate pressure washing cost if applicable
  let pressureWashingCost = 0;
  if (needsPressureWashing && pressureWashingArea > 0) {
    // Cost includes equipment rental and per square foot cost
    const areaCost = pressureWashingArea * PRESSURE_WASHING_COST_PER_SQFT;
    
    // Calculate how many days of equipment rental are needed
    const hoursNeeded = pressureWashingArea / PRESSURE_WASHING_SQFT_PER_HOUR;
    const daysNeeded = Math.ceil(hoursNeeded / 8); // Assuming 8-hour workdays
    const equipmentCost = PRESSURE_WASHING_EQUIPMENT_RENTAL * daysNeeded;
    
    pressureWashingCost = areaCost + equipmentCost;
  }

  // Calculate window cleaning cost if applicable
  let windowCleaningCost = 0;
  if (needsWindowCleaning) {
    // Standard windows
    const standardWindowsCost = (numberOfWindows || 0) * WINDOW_CLEANING_COST_PER_WINDOW;
    
    // Large windows (1.5x standard cost)
    const largeWindowsCost = (numberOfLargeWindows || 0) * 
      WINDOW_CLEANING_COST_PER_WINDOW * WINDOW_CLEANING_LARGE_WINDOW_MULTIPLIER;
    
    // High access windows (2x standard cost)
    const highAccessWindowsCost = (numberOfHighAccessWindows || 0) * 
      WINDOW_CLEANING_COST_PER_WINDOW * WINDOW_CLEANING_HIGH_ACCESS_MULTIPLIER;
    
    windowCleaningCost = standardWindowsCost + largeWindowsCost + highAccessWindowsCost;
  }

  // Calculate display case cleaning cost if it's a jewelry store
  let displayCaseCost = 0;
  if (projectType === 'jewelry_store' && numberOfDisplayCases > 0) {
    displayCaseCost = numberOfDisplayCases * DISPLAY_CASE_CLEANING_COST;
  }

  // Apply urgency multiplier
  const urgencyMultiplier = URGENCY_MULTIPLIERS[urgencyLevel] || 1;

  // Calculate total before markup
  const totalBeforeMarkup = (
    (basePrice * projectTypeMultiplier * cleaningTypeMultiplier) +
    vctCost +
    travelCost +
    overnightCost +
    pressureWashingCost +
    windowCleaningCost +
    displayCaseCost
  ) * urgencyMultiplier;

  // Apply markup if selected
  const markup = applyMarkup ? totalBeforeMarkup * 0.5 : 0;
  const totalPrice = totalBeforeMarkup + markup;

  // Calculate estimated hours based on square footage, project type, and cleaning type
  let estimatedHours = calculateEstimatedHours(
    squareFootage,
    projectType,
    cleaningType
  );

  // Add pressure washing hours if applicable
  if (needsPressureWashing && pressureWashingArea > 0) {
    const pressureWashingHours = pressureWashingArea / PRESSURE_WASHING_SQFT_PER_HOUR;
    estimatedHours += pressureWashingHours;
  }

  // Add window cleaning hours if applicable
  if (needsWindowCleaning) {
    const totalWindows = (numberOfWindows || 0) + 
                         (numberOfLargeWindows || 0) * 1.5 + 
                         (numberOfHighAccessWindows || 0) * 2;
    const windowCleaningHours = totalWindows / WINDOW_CLEANING_WINDOWS_PER_HOUR;
    estimatedHours += windowCleaningHours;
  }

  // Add display case cleaning hours if applicable
  if (projectType === 'jewelry_store' && numberOfDisplayCases > 0) {
    const displayCaseHours = numberOfDisplayCases * DISPLAY_CASE_TIME_PER_UNIT;
    estimatedHours += displayCaseHours;
  }

  // Calculate price per square foot
  const pricePerSquareFoot = totalPrice / squareFootage;

  // Return estimate data
  return {
    basePrice,
    cleaningTypeMultiplier,
    projectTypeMultiplier,
    vctCost,
    travelCost,
    overnightCost,
    urgencyMultiplier,
    totalBeforeMarkup,
    markup,
    totalPrice,
    estimatedHours,
    pricePerSquareFoot,
    pressureWashingCost,
    windowCleaningCost,
    displayCaseCost,
    aiRecommendations: []
  };
}

function calculateEstimatedHours(
  squareFootage: number,
  projectType: string,
  cleaningType: string
): number {
  // Base calculation: 1 hour per 1000 square feet
  let baseHours = squareFootage / 1000;
  
  // Apply project type modifier
  const projectTypeModifier = getProjectTypeTimeModifier(projectType);
  baseHours *= projectTypeModifier;
  
  // Apply cleaning type modifier
  const cleaningTypeModifier = CLEANING_TYPE_TIME_MULTIPLIERS[cleaningType as CleaningType] || 1;
  baseHours *= cleaningTypeModifier;
  
  // Round to nearest quarter hour
  return Math.ceil(baseHours * 4) / 4;
}

function getProjectTypeTimeModifier(projectType: string): number {
  switch (projectType) {
    case 'restaurant':
      return 1.5; // Restaurants take 50% longer due to kitchen areas
    case 'medical':
      return 1.3; // Medical facilities require more detailed cleaning
    case 'retail':
      return 0.9; // Retail spaces are often more open and quicker to clean
    case 'industrial':
      return 1.2; // Industrial spaces may have specialized cleaning needs
    case 'educational':
      return 1.1; // Educational facilities have varied spaces
    case 'hotel':
      return 1.6; // Hotels have many rooms and bathrooms requiring detailed cleaning
    case 'jewelry_store':
      return 1.7; // Jewelry stores require meticulous attention to detail and security
    case 'office':
    default:
      return 1.0; // Office is the baseline
  }
}

export function recalculateHours(
  squareFootage: number, 
  projectType: string,
  cleaningType: string = 'final'
): number {
  return calculateEstimatedHours(squareFootage, projectType, cleaningType);
} 