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
    chargeForWindowCleaning,
    numberOfWindows,
    numberOfLargeWindows,
    numberOfHighAccessWindows,
    numberOfDisplayCases
  } = formData;

  // Ensure gasPrice is a number
  const gasPrice = typeof rawGasPrice === 'string' ? parseFloat(rawGasPrice) : (rawGasPrice || 3.50);

  // Apply project type multiplier
  const projectTypeMultiplier = PROJECT_TYPE_MULTIPLIERS[projectType];
  
  // Apply cleaning type multiplier
  const cleaningTypeMultiplier = CLEANING_TYPE_MULTIPLIERS[cleaningType];

  // Calculate base price
  const basePrice = squareFootage * BASE_RATE_PER_SQFT * projectTypeMultiplier * cleaningTypeMultiplier;

  // Calculate VCT cost if applicable
  const vctCost = hasVCT ? squareFootage * VCT_COST_PER_SQFT : 0;

  // Calculate travel cost (round trip)
  const roundTripDistance = distanceFromOffice * 2; // Multiply by 2 for round trip
  // Use a fixed rate per mile that already accounts for gas, wear and tear
  const travelCost = roundTripDistance * TRAVEL_COST_PER_MILE;

  // Calculate overnight cost if applicable
  let overnightCost = 0;
  if (stayingOvernight) {
    // Calculate number of hotel rooms (2 people per room)
    const hotelRooms = Math.ceil(numberOfCleaners / 2);
    const hotelCost = hotelRooms * HOTEL_COST_PER_NIGHT * numberOfNights;
    
    // Calculate per diem for meals and incidentals
    const perDiemCost = numberOfCleaners * PER_DIEM_PER_DAY * numberOfNights;
    
    // Calculate additional vehicle costs when more than 2 cleaners
    // Each vehicle can transport 2-3 people, so we need additional vehicles for larger teams
    let vehicleCost = 0;
    if (numberOfCleaners > 2) {
      const additionalVehicles = Math.ceil(numberOfCleaners / 3) - 1; // First vehicle already accounted for
      const additionalMileageCost = additionalVehicles * roundTripDistance * TRAVEL_COST_PER_MILE;
      vehicleCost = additionalMileageCost;
    }
    
    overnightCost = hotelCost + perDiemCost + vehicleCost;
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
  if (needsWindowCleaning && chargeForWindowCleaning) {
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
    basePrice +
    vctCost +
    travelCost +
    overnightCost +
    pressureWashingCost +
    windowCleaningCost +
    displayCaseCost
  ) * urgencyMultiplier;

  // Calculate markup amount
  const markupAmount = applyMarkup ? totalBeforeMarkup * 0.5 : 0;

  // Apply markup to base price if selected
  const totalWithMarkup = totalBeforeMarkup + markupAmount;

  // Calculate sales tax on the total including markup
  const salesTax = totalWithMarkup * 0.07;

  // Calculate final total
  const totalPrice = totalWithMarkup + salesTax;

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
    // Cap the number of windows to prevent unreasonably high hour estimates
    const totalStandardWindows = Math.min(numberOfWindows || 0, 100);
    const totalLargeWindows = Math.min(numberOfLargeWindows || 0, 50);
    const totalHighAccessWindows = Math.min(numberOfHighAccessWindows || 0, 25);
    
    const totalWindows = totalStandardWindows + 
                       (totalLargeWindows * 1.5) + 
                       (totalHighAccessWindows * 2);
                       
    // Cap total window cleaning hours to a reasonable amount
    const windowCleaningHours = Math.min(totalWindows / WINDOW_CLEANING_WINDOWS_PER_HOUR, 40);
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
    markup: markupAmount,
    salesTax,
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
  // Special case for jewelry stores - they need more detailed calculation
  if (projectType === 'jewelry_store') {
    // Jewelry stores have their own calculation that's more conservative
    let jewelryStoreHours;
    
    if (squareFootage <= 1000) {
      jewelryStoreHours = squareFootage / 750; // Base rate for small jewelry stores
    } else if (squareFootage <= 5000) {
      // First 1000 sq ft
      const initialHours = 1000 / 750;
      // Remaining at even more efficient rate
      const remainingSqFt = squareFootage - 1000;
      const additionalHours = remainingSqFt / 1000;
      jewelryStoreHours = initialHours + additionalHours;
    } else {
      // First 1000 sq ft
      const initialHours = 1000 / 750;
      // Next 4000 sq ft
      const tier1Hours = 4000 / 1000;
      // Remaining at even more efficient rate
      const remainingSqFt = squareFootage - 5000;
      const additionalHours = remainingSqFt / 1200;
      jewelryStoreHours = initialHours + tier1Hours + additionalHours;
    }
    
    // Apply cleaning type modifier only (jewelry store modifier already accounted for)
    const cleaningTypeModifier = CLEANING_TYPE_TIME_MULTIPLIERS[cleaningType as CleaningType] || 1;
    jewelryStoreHours *= cleaningTypeModifier;
    
    // Round to nearest quarter hour
    return Math.ceil(jewelryStoreHours * 4) / 4;
  }
  
  // Standard calculation for all other project types
  // Base calculation: 1 hour per 1000 square feet
  // For larger projects, we apply a scaling factor to account for efficiency gains
  let baseHours;
  
  if (squareFootage <= 10000) {
    // Standard calculation for smaller projects
    baseHours = squareFootage / 1000;
  } else {
    // For larger projects, apply diminishing returns for additional square footage
    // First 10,000 sq ft at normal rate
    const initialHours = 10000 / 1000;
    
    // Remaining square footage at reduced rate (more efficient as scale increases)
    let remainingSqFt = squareFootage - 10000;
    let additionalHours = 0;
    
    // 10,001-25,000 at 85% of normal rate
    if (remainingSqFt > 0) {
      const tier1SqFt = Math.min(remainingSqFt, 15000);
      additionalHours += (tier1SqFt / 1000) * 0.85;
      remainingSqFt -= tier1SqFt;
    }
    
    // 25,001-50,000 at 75% of normal rate
    if (remainingSqFt > 0) {
      const tier2SqFt = Math.min(remainingSqFt, 25000);
      additionalHours += (tier2SqFt / 1000) * 0.75;
      remainingSqFt -= tier2SqFt;
    }
    
    // 50,001+ at 65% of normal rate (economies of scale)
    if (remainingSqFt > 0) {
      additionalHours += (remainingSqFt / 1000) * 0.65;
    }
    
    baseHours = initialHours + additionalHours;
  }
  
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
      return 1.2; // Jewelry stores - reduced from 1.7 to be more realistic
    case 'beauty_store':
      return 1.4; // Beauty stores require detailed cleaning of product displays
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