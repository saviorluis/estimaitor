import { FormData, EstimateData, CleaningType, PressureWashingServiceType } from './types';

// Constants
const BASE_RATE_PER_SQFT = 0.18;
const PROJECT_TYPE_MULTIPLIERS: { [key: string]: number } = {
  office: 1.0,
  retail: 1.1,
  medical: 1.3,
  school: 1.2,
  industrial: 0.9,
  restaurant: 1.4,
  gym: 1.2,
  church: 1.1,
  theater: 1.2,
  hotel: 1.3,
  apartment: 1.2,
  jewelry_store: 1.5
};

const CLEANING_TYPE_MULTIPLIERS: { [key in CleaningType]: number } = {
  post_construction: 1.0,
  rough: 0.7,
  final: 0.8,
  touchup: 0.5,
  rough_final_touchup: 1.8,
  pressure_washing_only: 1.0,
  window_cleaning_only: 1.0
};

const VCT_COST_PER_SQFT = 0.15;
const TRAVEL_COST_PER_MILE = 1.25;
const HOTEL_COST_PER_NIGHT = 150;
const PER_DIEM_PER_DAY = 50;
const URGENCY_MULTIPLIERS: { [key: number]: number } = {
  1: 1.0,   // Normal
  2: 1.05,  // Slight urgency
  3: 1.1,   // Moderate urgency
  4: 1.15,  // High urgency
  5: 1.2,   // Very high urgency
  6: 1.25,  // Critical
  7: 1.3,   // Emergency
  8: 1.35,  // Extreme emergency
  9: 1.4,   // Critical emergency
  10: 1.5   // Maximum urgency
};

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
    pressureWashingServices,
    pressureWashingServiceAreas,
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
  let basePrice = squareFootage * BASE_RATE_PER_SQFT * projectTypeMultiplier * cleaningTypeMultiplier;

  // Calculate VCT cost if applicable
  const vctCost = hasVCT ? squareFootage * VCT_COST_PER_SQFT : 0;

  // Calculate travel cost (round trip)
  const roundTripDistance = distanceFromOffice * 2;
  const travelCost = roundTripDistance * TRAVEL_COST_PER_MILE;

  // Calculate overnight cost if applicable
  const overnightCost = stayingOvernight
    ? (HOTEL_COST_PER_NIGHT + PER_DIEM_PER_DAY) * numberOfNights * numberOfCleaners
    : 0;

  // Calculate pressure washing cost if applicable
  let pressureWashingCost = 0;
  let pressureWashingServiceDetails: { [key in PressureWashingServiceType]?: { area: number; cost: number } } = {};

  if (needsPressureWashing) {
    if (pressureWashingServices && pressureWashingServices.length > 0 && pressureWashingServiceAreas) {
      pressureWashingServices.forEach(service => {
        const area = pressureWashingServiceAreas[service] || 0;
        const rate = 0.25; // Base rate per square foot
        const cost = area * rate;
        pressureWashingServiceDetails[service] = { area, cost };
        pressureWashingCost += cost;
      });
    } else {
      pressureWashingCost = pressureWashingArea * 0.25;
    }

    // Add equipment rental cost
    pressureWashingCost += 150;
  }

  // Calculate window cleaning cost if applicable
  let windowCleaningCost = 0;
  if (needsWindowCleaning && chargeForWindowCleaning) {
    const baseWindowCost = numberOfWindows * 5;
    const largeWindowCost = numberOfLargeWindows * 8;
    const highAccessCost = numberOfHighAccessWindows * 12;
    windowCleaningCost = baseWindowCost + largeWindowCost + highAccessCost;
  }

  // Calculate display case cleaning cost for jewelry stores
  let displayCaseCost = 0;
  if (projectType === 'jewelry_store' && numberOfDisplayCases > 0) {
    displayCaseCost = numberOfDisplayCases * 25;
    basePrice += displayCaseCost;
    basePrice = Math.ceil(basePrice / 5) * 5;
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
    windowCleaningCost
  ) * urgencyMultiplier;

  // Calculate markup amount
  const markupAmount = applyMarkup ? totalBeforeMarkup * 0.5 : 0;

  // Apply markup to base price if selected
  const totalWithMarkup = totalBeforeMarkup + markupAmount;

  // Calculate sales tax on the total including markup
  const salesTax = totalWithMarkup * 0.07;

  // Calculate final total
  const totalPrice = totalWithMarkup + salesTax;

  // Calculate estimated hours
  let estimatedHours = Math.ceil(squareFootage / (numberOfCleaners * 500));

  // Add additional hours for VCT if applicable
  if (hasVCT) {
    estimatedHours += Math.ceil(squareFootage / (numberOfCleaners * 1000));
  }

  // Add hours for pressure washing if applicable
  if (needsPressureWashing) {
    const pressureWashingHours = Math.ceil(pressureWashingArea / 1000);
    estimatedHours += pressureWashingHours;
  }

  // Add hours for window cleaning if applicable
  if (needsWindowCleaning) {
    const totalWindows = numberOfWindows + numberOfLargeWindows + numberOfHighAccessWindows;
    const windowCleaningHours = Math.ceil(totalWindows / 20);
    estimatedHours += windowCleaningHours;
  }

  // Add hours for display case cleaning if applicable
  if (projectType === 'jewelry_store' && numberOfDisplayCases > 0) {
    const displayCaseHours = Math.ceil(numberOfDisplayCases * 0.5);
    estimatedHours += displayCaseHours;
  }

  // Calculate price per square foot
  let totalArea = squareFootage;
  if (cleaningType === 'pressure_washing_only') {
    if (pressureWashingServices && pressureWashingServices.length > 0 && pressureWashingServiceAreas) {
      totalArea = 0;
      pressureWashingServices.forEach(service => {
        totalArea += pressureWashingServiceAreas[service] || 0;
      });
    } else {
      totalArea = pressureWashingArea;
    }
  } else if (cleaningType === 'window_cleaning_only') {
    totalArea = 0;
  }
  
  const pricePerSquareFoot = totalArea > 0 ? totalPrice / totalArea : 0;

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
    pressureWashingServiceDetails,
    windowCleaningCost,
    displayCaseCost,
    aiRecommendations: []
  };
} 