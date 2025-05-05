import { FormData, EstimateData, CleaningType, PressureWashingServiceType } from './types';
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
  PRESSURE_WASHING_RATES,
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

  // Calculate travel cost (round trip)
  const roundTripDistance = distanceFromOffice * 2; // Multiply by 2 for round trip
  let travelCost = 0;

  if (distanceFromOffice > 100) {
    // For distant jobs (over 100 miles), show the travel cost but at a reduced rate
    // Reduce the per-mile rate for distant jobs to balance pricing
    travelCost = roundTripDistance * (TRAVEL_COST_PER_MILE * 0.65); // Reduced rate for long-distance
    
    // Round to a more even number for cleaner quotes
    travelCost = Math.round(travelCost / 10) * 10;
  } else {
    // For nearby jobs, calculate travel cost but it will be distributed
    // Instead of showing as separate item, we'll add it to the base price later
    travelCost = 0; // Set to 0 as it won't appear as a line item
  }

  // For pressure washing only service type, reset the base price
  let basePrice = 0;
  
  if (cleaningType === 'pressure_washing_only') {
    // For pressure washing only, base price is 0 since we'll calculate it based on the services
    basePrice = 0;
  } else {
    // Calculate normal base price for other cleaning types
    basePrice = squareFootage * BASE_RATE_PER_SQFT * projectTypeMultiplier * cleaningTypeMultiplier;
    
    // For jobs within 100 miles, distribute travel cost into the base price
    if (distanceFromOffice <= 100) {
      const nearbyTravelCost = roundTripDistance * TRAVEL_COST_PER_MILE;
      basePrice += nearbyTravelCost;
      
      // Round the base price to a cleaner number
      basePrice = Math.ceil(basePrice / 5) * 5;
    }
  }

  // Calculate VCT cost if applicable
  const vctCost = hasVCT ? squareFootage * VCT_COST_PER_SQFT : 0;

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

  // Calculate pressure washing cost
  let pressureWashingCost = 0;
  const pressureWashingServiceDetails: Record<PressureWashingServiceType, {area: number, cost: number}> = {} as any;
  
  if (needsPressureWashing || cleaningType === 'pressure_washing_only') {
    if (pressureWashingServices && pressureWashingServices.length > 0 && pressureWashingServiceAreas) {
      // Detailed pressure washing services calculation
      let totalPressureWashingArea = 0;
      
      // Calculate cost for each service
      pressureWashingServices.forEach(service => {
        const area = pressureWashingServiceAreas[service] || 0;
        let serviceCost = 0;
        
        if (area > 0) {
          totalPressureWashingArea += area;
          
          switch(service) {
            case 'soft_wash':
              // Minimum charge for soft wash
              serviceCost = area * PRESSURE_WASHING_RATES.SOFT_WASH.rate;
              // Only apply minimum charges for non-pressure washing only quotes
              if (cleaningType !== 'pressure_washing_only' || serviceCost < PRESSURE_WASHING_RATES.SOFT_WASH.minimum) {
                serviceCost = Math.max(serviceCost, PRESSURE_WASHING_RATES.SOFT_WASH.minimum);
              }
              break;
            case 'roof_wash':
              serviceCost = area * PRESSURE_WASHING_RATES.ROOF_WASH.rate;
              break;
            case 'driveway':
              serviceCost = area * PRESSURE_WASHING_RATES.DRIVEWAY.rate;
              break;
            case 'deck':
              serviceCost = area * PRESSURE_WASHING_RATES.DECK.rate;
              break;
            case 'trex_deck':
              serviceCost = area * PRESSURE_WASHING_RATES.TREX.rate;
              break;
            case 'dumpster_corral':
              serviceCost = area * PRESSURE_WASHING_RATES.DUMPSTER_CORRAL.rate;
              // Apply minimum only for non-pressure washing only quotes
              if (cleaningType !== 'pressure_washing_only' || serviceCost < PRESSURE_WASHING_RATES.DUMPSTER_CORRAL.minimum) {
                serviceCost = Math.max(serviceCost, PRESSURE_WASHING_RATES.DUMPSTER_CORRAL.minimum);
              }
              break;
            case 'commercial':
              serviceCost = area * PRESSURE_WASHING_RATES.COMMERCIAL.rate;
              // Apply minimum only for non-pressure washing only quotes
              if (cleaningType !== 'pressure_washing_only' || serviceCost < PRESSURE_WASHING_RATES.COMMERCIAL.minimum) {
                serviceCost = Math.max(serviceCost, PRESSURE_WASHING_RATES.COMMERCIAL.minimum);
              }
              break;
            default:
              // Use daily rate for custom services
              serviceCost = PRESSURE_WASHING_RATES.DAILY_RATE;
          }
          
          // Store details for this service
          pressureWashingServiceDetails[service] = {
            area,
            cost: serviceCost
          };
          
          // Add to total pressure washing cost
          pressureWashingCost += serviceCost;
        }
      });
      
      // Add equipment rental - once per job
      if (totalPressureWashingArea > 0) {
        // Calculate days needed based on total area
        const hoursNeeded = totalPressureWashingArea / PRESSURE_WASHING_SQFT_PER_HOUR;
        const daysNeeded = Math.ceil(hoursNeeded / 8); // Assuming 8-hour workdays
        const equipmentCost = PRESSURE_WASHING_EQUIPMENT_RENTAL * daysNeeded;
        
        // Add equipment cost
        pressureWashingCost += equipmentCost;
      }
    } else if (pressureWashingArea > 0) {
      // Standard pressure washing calculation (backward compatibility)
      const areaCost = pressureWashingArea * PRESSURE_WASHING_COST_PER_SQFT;
      
      // Calculate equipment rental days needed
      const hoursNeeded = pressureWashingArea / PRESSURE_WASHING_SQFT_PER_HOUR;
      const daysNeeded = Math.ceil(hoursNeeded / 8); // Assuming 8-hour workdays
      const equipmentCost = PRESSURE_WASHING_EQUIPMENT_RENTAL * daysNeeded;
      
      pressureWashingCost = areaCost + equipmentCost;
    }
  }

  // For pressure washing only service type, add the pressure washing cost to the base price
  if (cleaningType === 'pressure_washing_only') {
    basePrice = pressureWashingCost;
    // Reset the pressure washing cost to 0 since we've incorporated it into the base price
    pressureWashingCost = 0;
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

  // For window cleaning only service type, add the window cleaning cost to the base price
  if (cleaningType === 'window_cleaning_only') {
    // For window cleaning only, we always include the cost
    const effectiveWindowCost = (numberOfWindows || 0) * WINDOW_CLEANING_COST_PER_WINDOW +
      (numberOfLargeWindows || 0) * WINDOW_CLEANING_COST_PER_WINDOW * WINDOW_CLEANING_LARGE_WINDOW_MULTIPLIER +
      (numberOfHighAccessWindows || 0) * WINDOW_CLEANING_COST_PER_WINDOW * WINDOW_CLEANING_HIGH_ACCESS_MULTIPLIER;
      
    basePrice = effectiveWindowCost;
    // Reset the window cleaning cost to 0 since we've incorporated it into the base price
    windowCleaningCost = 0;
  }

  // Calculate display case cleaning cost if it's a jewelry store
  let displayCaseCost = 0;
  if (projectType === 'jewelry_store' && numberOfDisplayCases > 0) {
    // Calculate the cost for internal tracking/reporting purposes
    displayCaseCost = numberOfDisplayCases * DISPLAY_CASE_CLEANING_COST;
    
    // For jewelry stores, we'll incorporate this cost into the base price
    // so it appears "included" in the quote
    if (cleaningType !== 'pressure_washing_only') {
      basePrice += displayCaseCost;
      
      // Round base price to nearest $5 for a cleaner quote
      basePrice = Math.ceil(basePrice / 5) * 5;
    }
  }

  // Apply urgency multiplier
  const urgencyMultiplier = URGENCY_MULTIPLIERS[urgencyLevel] || 1;

  // Calculate total before markup - exclude display case cost for jewelry stores
  const totalBeforeMarkup = (
    basePrice +
    vctCost +
    travelCost +
    overnightCost +
    pressureWashingCost +
    windowCleaningCost +
    // Display case cost is not added to the total for jewelry stores
    // It's tracked separately but considered included in the base price
    0 // Explicitly set to 0 instead of displayCaseCost
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
  let estimatedHours = 0;
  
  if (cleaningType === 'pressure_washing_only') {
    // For pressure washing only, hours are based solely on pressure washing services
    if (pressureWashingServices && pressureWashingServices.length > 0 && pressureWashingServiceAreas) {
      let totalArea = 0;
      
      // Sum up all areas
      pressureWashingServices.forEach(service => {
        totalArea += pressureWashingServiceAreas[service] || 0;
      });
      
      // Calculate hours based on productivity rate
      estimatedHours = totalArea / PRESSURE_WASHING_SQFT_PER_HOUR;
    } else if (pressureWashingArea > 0) {
      estimatedHours = pressureWashingArea / PRESSURE_WASHING_SQFT_PER_HOUR;
    }
  } else if (cleaningType === 'window_cleaning_only') {
    // For window cleaning only, hours are based solely on window cleaning
    // Cap the number of windows to prevent unreasonably high hour estimates
    const totalStandardWindows = Math.min(numberOfWindows || 0, 100);
    const totalLargeWindows = Math.min(numberOfLargeWindows || 0, 50);
    const totalHighAccessWindows = Math.min(numberOfHighAccessWindows || 0, 25);
    
    const totalWindows = totalStandardWindows + 
                       (totalLargeWindows * 1.5) + 
                       (totalHighAccessWindows * 2);
                         
    // Cap total window cleaning hours to a reasonable amount
    estimatedHours = Math.min(totalWindows / WINDOW_CLEANING_WINDOWS_PER_HOUR, 40);
  } else {
    // Normal hours calculation for other cleaning types
    estimatedHours = calculateEstimatedHours(
      squareFootage,
      projectType,
      cleaningType
    );
    
    // Add pressure washing hours if applicable
    if (needsPressureWashing) {
      if (pressureWashingServices && pressureWashingServices.length > 0 && pressureWashingServiceAreas) {
        let totalArea = 0;
        
        // Sum up all areas
        pressureWashingServices.forEach(service => {
          totalArea += pressureWashingServiceAreas[service] || 0;
        });
        
        // Calculate hours based on productivity rate
        const pressureWashingHours = totalArea / PRESSURE_WASHING_SQFT_PER_HOUR;
        estimatedHours += pressureWashingHours;
      } else if (pressureWashingArea > 0) {
        const pressureWashingHours = pressureWashingArea / PRESSURE_WASHING_SQFT_PER_HOUR;
        estimatedHours += pressureWashingHours;
      }
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
  }

  // Calculate price per square foot - for special service types, handle differently
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
    // For window cleaning only, we don't use square footage
    totalArea = 0; // This will make pricePerSquareFoot = 0, which is fine for window-only
  }
  
  const pricePerSquareFoot = totalArea > 0 ? totalPrice / totalArea : 0;

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
    pressureWashingServiceDetails,
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
    case 'interactive_toy_store':
      return 1.6; // Interactive toy stores have complex play areas requiring thorough sanitization
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