'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { FormData, EstimateData, ProjectType, CleaningType } from '@/lib/types';
import { calculateEstimate } from '@/lib/estimator';
import { getRecommendedCleaners, CLEANING_TYPE_DESCRIPTIONS, TEST_MODE, TEST_SCENARIOS } from '@/lib/constants';

interface SimpleEstimatorFormProps {
  onEstimateCalculated: (data: EstimateData, formValues: FormData) => void;
}

// Service type for residential vs commercial
type ServiceType = 'residential' | 'commercial';

// Simplified form data for simple mode
interface SimpleFormData {
  serviceType: ServiceType;
  projectType: ProjectType;
  cleaningType: CleaningType;
  squareFootage: number;
  location: string;
  needsWindowCleaning: boolean;
  numberOfWindows: number;
  pressureWashingArea: number;
  clientName?: string;
  projectName?: string;
}

// Project types by service category
const RESIDENTIAL_TYPES: ProjectType[] = ['other', 'office', 'hotel', 'educational', 'retail', 'industrial']; // Residential property types
const COMMERCIAL_TYPES: ProjectType[] = [
  'restaurant', 'fast_food', 'medical', 'retail', 'office', 'industrial', 
  'educational', 'hotel', 'jewelry_store', 'grocery_store', 'yoga_studio', 
  'kids_fitness', 'bakery', 'interactive_toy_store', 'church', 'arcade', 'other'
];

// Get project type names with residential context
const getProjectTypeName = (type: ProjectType, serviceType: ServiceType): string => {
  if (serviceType === 'residential') {
    switch (type) {
      case 'other': return 'Single Family House';
      case 'office': return 'Apartment Complex';
      case 'hotel': return 'Multifamily Property';
      case 'educational': return 'HOA Community';
      case 'retail': return 'Residential Community';
      case 'industrial': return 'Townhomes/Condos';
      default: return 'Residential Property';
    }
  }
  
  // Commercial names
  switch (type) {
    case 'restaurant': return 'Restaurant';
    case 'fast_food': return 'Fast Food';
    case 'medical': return 'Medical Facility';
    case 'retail': return 'Retail Store';
    case 'office': return 'Office Building';
    case 'industrial': return 'Industrial/Warehouse';
    case 'educational': return 'Educational Facility';
    case 'hotel': return 'Hotel/Hospitality';
    case 'jewelry_store': return 'Jewelry Store';
    case 'grocery_store': return 'Grocery Store';
    case 'yoga_studio': return 'Yoga Studio';
    case 'kids_fitness': return 'Kids Fitness Center';
    case 'bakery': return 'Bakery';
    case 'interactive_toy_store': return 'Toy Store';
    case 'church': return 'Church/Religious';
    case 'arcade': return 'Arcade/Entertainment';
    case 'other': return 'Other Commercial';
    default: return 'Commercial Property';
  }
};

// Location-based defaults and pricing (Home Base: 1200 Eastchester Dr, High Point, NC)
const CITY_LOCATIONS = {
  // North Carolina Cities (Home State)
  'High Point, NC': { distance: 0, gasPrice: 3.50, description: 'High Point, NC (Home Base)' },
  'Greensboro, NC': { distance: 8, gasPrice: 3.50, description: 'Greensboro, NC' },
  'Winston-Salem, NC': { distance: 12, gasPrice: 3.50, description: 'Winston-Salem, NC' },
  'Charlotte, NC': { distance: 75, gasPrice: 3.50, description: 'Charlotte, NC' },
  'Raleigh, NC': { distance: 85, gasPrice: 3.50, description: 'Raleigh, NC' },
  'Durham, NC': { distance: 80, gasPrice: 3.50, description: 'Durham, NC' },
  'Fayetteville, NC': { distance: 110, gasPrice: 3.50, description: 'Fayetteville, NC' },
  'Wilmington, NC': { distance: 140, gasPrice: 3.50, description: 'Wilmington, NC' },
  'Asheville, NC': { distance: 105, gasPrice: 3.50, description: 'Asheville, NC' },
  
  // South Carolina Cities
  'Greenville, SC': { distance: 85, gasPrice: 3.40, description: 'Greenville, SC' },
  'Columbia, SC': { distance: 120, gasPrice: 3.40, description: 'Columbia, SC' },
  'Charleston, SC': { distance: 165, gasPrice: 3.40, description: 'Charleston, SC' },
  'Rock Hill, SC': { distance: 95, gasPrice: 3.40, description: 'Rock Hill, SC' },
  'Mount Pleasant, SC': { distance: 170, gasPrice: 3.40, description: 'Mount Pleasant, SC' },
  'Spartanburg, SC': { distance: 75, gasPrice: 3.40, description: 'Spartanburg, SC' },
  
  // Virginia Cities
  'Richmond, VA': { distance: 125, gasPrice: 3.45, description: 'Richmond, VA' },
  'Virginia Beach, VA': { distance: 165, gasPrice: 3.45, description: 'Virginia Beach, VA' },
  'Norfolk, VA': { distance: 160, gasPrice: 3.45, description: 'Norfolk, VA' },
  'Chesapeake, VA': { distance: 165, gasPrice: 3.45, description: 'Chesapeake, VA' },
  'Newport News, VA': { distance: 155, gasPrice: 3.45, description: 'Newport News, VA' },
  'Alexandria, VA': { distance: 105, gasPrice: 3.45, description: 'Alexandria, VA' },
  'Hampton, VA': { distance: 155, gasPrice: 3.45, description: 'Hampton, VA' },
  'Portsmouth, VA': { distance: 160, gasPrice: 3.45, description: 'Portsmouth, VA' },
  
  // Georgia Cities
  'Atlanta, GA': { distance: 145, gasPrice: 3.35, description: 'Atlanta, GA' },
  'Augusta, GA': { distance: 175, gasPrice: 3.35, description: 'Augusta, GA' },
  'Columbus, GA': { distance: 195, gasPrice: 3.35, description: 'Columbus, GA' },
  'Savannah, GA': { distance: 225, gasPrice: 3.35, description: 'Savannah, GA' },
  'Athens, GA': { distance: 165, gasPrice: 3.35, description: 'Athens, GA' },
  'Macon, GA': { distance: 185, gasPrice: 3.35, description: 'Macon, GA' },
  
  // Tennessee Cities
  'Nashville, TN': { distance: 165, gasPrice: 3.25, description: 'Nashville, TN' },
  'Memphis, TN': { distance: 255, gasPrice: 3.25, description: 'Memphis, TN' },
  'Knoxville, TN': { distance: 125, gasPrice: 3.25, description: 'Knoxville, TN' },
  'Chattanooga, TN': { distance: 145, gasPrice: 3.25, description: 'Chattanooga, TN' },
  'Clarksville, TN': { distance: 185, gasPrice: 3.25, description: 'Clarksville, TN' },
  'Murfreesboro, TN': { distance: 175, gasPrice: 3.25, description: 'Murfreesboro, TN' },
};

// Storage key for saving simple form data
const SIMPLE_STORAGE_KEY = 'estimaitor_simple_form_data';

export default function SimpleEstimatorForm({ onEstimateCalculated }: SimpleEstimatorFormProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Get saved form data from localStorage
  const getSavedFormData = useCallback((): Partial<SimpleFormData> => {
    if (typeof window === 'undefined') return {};
    
    try {
      const savedData = localStorage.getItem(SIMPLE_STORAGE_KEY);
      return savedData ? JSON.parse(savedData) : {};
    } catch (error) {
      console.error('Error loading saved simple form data:', error);
      return {};
    }
  }, []);

  // Default values for simple form
  const defaultValues = useMemo(() => ({
    serviceType: 'residential' as ServiceType,
    projectType: 'other' as ProjectType,
    cleaningType: 'window_cleaning_only' as CleaningType,
    squareFootage: 2000,
    location: 'High Point, NC',
    needsWindowCleaning: false,
    numberOfWindows: 10,
    pressureWashingArea: 1000,
    clientName: '',
    projectName: '',
    ...getSavedFormData()
  }), [getSavedFormData]);

  // Initialize form
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<SimpleFormData>({
    defaultValues
  });

  // Watch form values
  const formValues = watch();
  const { serviceType, squareFootage, location, needsWindowCleaning } = formValues;

  // Load saved form data on component mount
  useEffect(() => {
    const savedData = getSavedFormData();
    if (Object.keys(savedData).length > 0) {
      reset(savedData as SimpleFormData);
    }
    setIsLoaded(true);
  }, [getSavedFormData, reset]);

  // Save form data to localStorage when it changes
  useEffect(() => {
    if (!isLoaded) return;
    
    try {
      localStorage.setItem(SIMPLE_STORAGE_KEY, JSON.stringify(formValues));
    } catch (error) {
      console.error('Error saving simple form data:', error);
    }
  }, [formValues, isLoaded]);

  // Auto-update project type, cleaning type, and sizing when service type changes
  useEffect(() => {
    if (!isLoaded) return;
    
    // Set appropriate defaults based on service type
    if (serviceType === 'residential') {
      setValue('projectType', 'other'); // Default to "Residential Home"
      setValue('cleaningType', 'window_cleaning_only'); // Default to window cleaning
      setValue('squareFootage', 2000); // Typical residential size
      setValue('numberOfWindows', 10); // Default window count
      setValue('pressureWashingArea', 1000); // Default pressure washing area
    } else if (serviceType === 'commercial') {
      setValue('projectType', 'office'); // Default to "Office Building"
      setValue('cleaningType', 'final'); // Default to final clean
      setValue('squareFootage', 5000); // Typical commercial size
      setValue('numberOfWindows', 0); // Reset windows
      setValue('pressureWashingArea', 0); // Reset pressure washing
    }
  }, [serviceType, isLoaded, setValue]);

  // Get location configuration
  const locationConfig = CITY_LOCATIONS[location as keyof typeof CITY_LOCATIONS] || CITY_LOCATIONS['High Point, NC'];

  // Calculate recommended cleaners
  const recommendedCleaners = useMemo(() => 
    getRecommendedCleaners(squareFootage || 0), 
    [squareFootage]
  );

  // Convert simple form data to full FormData for calculation
  const convertToFullFormData = useCallback((simpleData: SimpleFormData): FormData => {
    const locationConfig = CITY_LOCATIONS[simpleData.location as keyof typeof CITY_LOCATIONS] || CITY_LOCATIONS['High Point, NC'];
    
    // Handle different service types
    const isWindowCleaningOnly = simpleData.serviceType === 'residential' && simpleData.cleaningType === 'window_cleaning_only';
    const isPressureWashingOnly = simpleData.serviceType === 'residential' && simpleData.cleaningType === 'pressure_washing';
    
    return {
      // Basic project info
      projectType: simpleData.projectType,
      cleaningType: simpleData.cleaningType,
      squareFootage: isWindowCleaningOnly ? 1000 : (isPressureWashingOnly ? simpleData.pressureWashingArea : simpleData.squareFootage), // Use default for window cleaning, pressure washing area for pressure washing
      clientName: simpleData.clientName,
      projectName: simpleData.projectName,
      
      // Location-based defaults
      distanceFromOffice: locationConfig.distance,
      gasPrice: locationConfig.gasPrice,
      
      // Simplified defaults
      hasVCT: false,
      vctSquareFootage: 0,
      applyMarkup: true,
      numberOfCleaners: getRecommendedCleaners(simpleData.squareFootage || 1000),
      urgencyLevel: 3, // Medium urgency
      
      // Window cleaning - conditional
      needsWindowCleaning: isWindowCleaningOnly ? true : simpleData.needsWindowCleaning,
      numberOfWindows: isWindowCleaningOnly ? simpleData.numberOfWindows : (simpleData.needsWindowCleaning ? simpleData.numberOfWindows : 0),
      numberOfLargeWindows: 0,
      numberOfHighAccessWindows: 0,
      
      // Pressure washing - conditional
      stayingOvernight: false,
      numberOfNights: 1,
      needsPressureWashing: isPressureWashingOnly ? true : false,
      pressureWashingServices: [],
      pressureWashingArea: isPressureWashingOnly ? simpleData.pressureWashingArea : 0,
      pressureWashingType: 'soft_wash' as const,
      numberOfDisplayCases: 0
    };
  }, []);

  // Form submission handler
  const onSubmit: SubmitHandler<SimpleFormData> = useCallback((data) => {
    const fullFormData = convertToFullFormData(data);
    const estimate = calculateEstimate(fullFormData);
    onEstimateCalculated(estimate, fullFormData);
  }, [onEstimateCalculated, convertToFullFormData]);

  // Show loading state
  if (!isLoaded) {
    return (
      <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
        Quick Estimate Calculator
      </h2>
      
      {/* Test Mode Controls */}
      {TEST_MODE && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <h3 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-200">Test Mode</h3>
          <div className="space-y-2">
            {TEST_SCENARIOS.map((scenario, index) => (
              <button
                key={index}
                onClick={() => {
                  // Set form values from test scenario
                  Object.entries(scenario.input).forEach(([key, value]) => {
                    setValue(key as keyof SimpleFormData, value);
                  });
                }}
                className="block w-full text-left px-4 py-2 rounded bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
              >
                Run Test: {scenario.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Service Type Selection */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-lg border border-green-200 dark:border-green-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
            🏠 What type of cleaning service do you need?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="radio"
                id="residential"
                value="residential"
                {...register('serviceType', { required: 'Service type is required' })}
                className="sr-only"
              />
              <label
                htmlFor="residential"
                className={`block w-full p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  serviceType === 'residential'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/30 shadow-md'
                    : 'border-gray-300 dark:border-gray-600 hover:border-green-300 hover:bg-green-25 dark:hover:bg-green-900/10'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    serviceType === 'residential' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                  } flex items-center justify-center`}>
                    {serviceType === 'residential' && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-200">🏡 Residential</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Homes, apartments, condos</div>
                  </div>
                </div>
              </label>
            </div>
            
            <div>
              <input
                type="radio"
                id="commercial"
                value="commercial"
                {...register('serviceType', { required: 'Service type is required' })}
                className="sr-only"
              />
              <label
                htmlFor="commercial"
                className={`block w-full p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  serviceType === 'commercial'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/30 shadow-md'
                    : 'border-gray-300 dark:border-gray-600 hover:border-green-300 hover:bg-green-25 dark:hover:bg-green-900/10'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    serviceType === 'commercial' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                  } flex items-center justify-center`}>
                    {serviceType === 'commercial' && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-200">🏗️ Post Construction</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Construction cleanup, final clean</div>
                  </div>
                </div>
              </label>
            </div>
          </div>
          {errors.serviceType && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.serviceType.message}</p>
          )}
        </div>

        {/* Client Information - Optional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="clientName" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Client Name (Optional)
            </label>
            <input
              id="clientName"
              type="text"
              {...register('clientName')}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              placeholder="Enter client name"
            />
          </div>
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Project Name (Optional)
            </label>
            <input
              id="projectName"
              type="text"
              {...register('projectName')}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              placeholder="Enter project name"
            />
          </div>
        </div>

        {/* Project Type */}
        <div>
          <label htmlFor="projectType" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            {serviceType === 'residential' ? '🏡 Property Type' : '🏢 Business Type'}
          </label>
          <select
            id="projectType"
            {...register('projectType', { required: 'Project type is required' })}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
          >
            {serviceType === 'residential' ? (
              <>
                <option value="other">🏠 Single Family House</option>
                <option value="office">🏬 Apartment Complex</option>
                <option value="hotel">🏘️ Multifamily Property</option>
                <option value="educational">🏛️ HOA Community</option>
                <option value="retail">🏘️ Residential Community</option>
                <option value="industrial">🏘️ Townhomes/Condos</option>
              </>
            ) : (
              <>
                <option value="restaurant">Restaurant</option>
                <option value="fast_food">Fast Food</option>
                <option value="medical">Medical Facility</option>
                <option value="retail">Retail Store</option>
                <option value="office">Office Building</option>
                <option value="industrial">Industrial/Warehouse</option>
                <option value="educational">Educational Facility</option>
                <option value="hotel">Hotel</option>
                <option value="jewelry_store">Jewelry Store</option>
                <option value="grocery_store">Grocery Store</option>
                <option value="yoga_studio">Yoga Studio</option>
                <option value="kids_fitness">Kids Fitness</option>
                <option value="bakery">Bakery</option>
                <option value="interactive_toy_store">Interactive Toy Store</option>
                <option value="church">Church</option>
                <option value="arcade">Arcade</option>
                <option value="other">Other Commercial</option>
              </>
            )}
          </select>
          {errors.projectType && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.projectType.message}</p>
          )}
        </div>

        {/* Cleaning Type - Conditional based on service type */}
        <div>
          <label htmlFor="cleaningType" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            {serviceType === 'residential' ? 'Service Type' : 'Cleaning Type'}
          </label>
          <select
            id="cleaningType"
            {...register('cleaningType', { required: 'Service type is required' })}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
          >
            {serviceType === 'residential' ? (
              <>
                <option value="window_cleaning_only">🪟 Window Cleaning Service</option>
                <option value="pressure_washing">💧 Pressure Washing Service</option>
              </>
            ) : (
              <>
                <option value="rough">Rough Clean (80% rate)</option>
                <option value="final">Final Clean (Standard rate)</option>
                <option value="rough_final">Rough & Final Clean (120% rate)</option>
                <option value="rough_final_touchup">Rough, Final & Touchup (145% rate)</option>
              </>
            )}
          </select>
          {formValues.cleaningType && CLEANING_TYPE_DESCRIPTIONS[formValues.cleaningType] && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {CLEANING_TYPE_DESCRIPTIONS[formValues.cleaningType]}
            </p>
          )}
          {errors.cleaningType && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cleaningType.message}</p>
          )}
        </div>

        {/* Area/Size Input - Conditional based on service type */}
        <div>
          {serviceType === 'residential' && formValues.cleaningType === 'window_cleaning_only' ? (
            <>
              <label htmlFor="numberOfWindows" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                🪟 Number of Windows
              </label>
              <input
                id="numberOfWindows"
                type="number"
                min="1"
                max="500"
                {...register('numberOfWindows', { 
                  required: formValues.cleaningType === 'window_cleaning_only' ? 'Number of windows is required' : false,
                  min: { value: 1, message: 'Minimum 1 window' },
                  max: { value: 500, message: 'Maximum 500 windows' }
                })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter number of windows to clean"
              />
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                Count all windows that need cleaning (interior and exterior)
              </p>
            </>
          ) : serviceType === 'residential' && formValues.cleaningType === 'pressure_washing' ? (
            <>
              <label htmlFor="pressureWashingArea" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                💧 Area to Pressure Wash (sq ft)
              </label>
              <input
                id="pressureWashingArea"
                type="number"
                min="100"
                max="50000"
                {...register('pressureWashingArea', { 
                  required: formValues.cleaningType === 'pressure_washing' ? 'Pressure washing area is required' : false,
                  min: { value: 100, message: 'Minimum 100 sq ft' },
                  max: { value: 50000, message: 'Maximum 50,000 sq ft' }
                })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter total area to pressure wash"
              />
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                Driveways, sidewalks, decks, building exterior, etc.
              </p>
            </>
          ) : (
            <>
              <label htmlFor="squareFootage" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                🏢 Building Size - Total Square Footage
              </label>
              <input
                id="squareFootage"
                type="number"
                min="100"
                max="1000000"
                {...register('squareFootage', { 
                  required: serviceType === 'commercial' ? 'Building square footage is required' : false,
                  min: { value: 100, message: 'Minimum 100 sq ft' },
                  max: { value: 1000000, message: 'Maximum 1,000,000 sq ft' }
                })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter total building square footage"
              />
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                Interior space to be cleaned (offices, hallways, bathrooms, etc.)
              </p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Recommended cleaners: {recommendedCleaners}
              </p>
            </>
          )}
          {errors.squareFootage && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.squareFootage.message}</p>
          )}
          {errors.numberOfWindows && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.numberOfWindows.message}</p>
          )}
          {errors.pressureWashingArea && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.pressureWashingArea.message}</p>
          )}
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            📍 Project Location
          </label>
          <select
            id="location"
            {...register('location', { required: 'Location is required' })}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
          >
            <optgroup label="North Carolina (Home State)">
              <option value="High Point, NC">High Point, NC (Home Base)</option>
              <option value="Greensboro, NC">Greensboro, NC</option>
              <option value="Winston-Salem, NC">Winston-Salem, NC</option>
              <option value="Charlotte, NC">Charlotte, NC</option>
              <option value="Raleigh, NC">Raleigh, NC</option>
              <option value="Durham, NC">Durham, NC</option>
              <option value="Fayetteville, NC">Fayetteville, NC</option>
              <option value="Wilmington, NC">Wilmington, NC</option>
              <option value="Asheville, NC">Asheville, NC</option>
            </optgroup>
            <optgroup label="South Carolina">
              <option value="Greenville, SC">Greenville, SC</option>
              <option value="Columbia, SC">Columbia, SC</option>
              <option value="Charleston, SC">Charleston, SC</option>
              <option value="Rock Hill, SC">Rock Hill, SC</option>
              <option value="Mount Pleasant, SC">Mount Pleasant, SC</option>
              <option value="Spartanburg, SC">Spartanburg, SC</option>
            </optgroup>
            <optgroup label="Virginia">
              <option value="Richmond, VA">Richmond, VA</option>
              <option value="Virginia Beach, VA">Virginia Beach, VA</option>
              <option value="Norfolk, VA">Norfolk, VA</option>
              <option value="Chesapeake, VA">Chesapeake, VA</option>
              <option value="Newport News, VA">Newport News, VA</option>
              <option value="Alexandria, VA">Alexandria, VA</option>
              <option value="Hampton, VA">Hampton, VA</option>
              <option value="Portsmouth, VA">Portsmouth, VA</option>
            </optgroup>
            <optgroup label="Georgia">
              <option value="Atlanta, GA">Atlanta, GA</option>
              <option value="Augusta, GA">Augusta, GA</option>
              <option value="Columbus, GA">Columbus, GA</option>
              <option value="Savannah, GA">Savannah, GA</option>
              <option value="Athens, GA">Athens, GA</option>
              <option value="Macon, GA">Macon, GA</option>
            </optgroup>
            <optgroup label="Tennessee">
              <option value="Nashville, TN">Nashville, TN</option>
              <option value="Memphis, TN">Memphis, TN</option>
              <option value="Knoxville, TN">Knoxville, TN</option>
              <option value="Chattanooga, TN">Chattanooga, TN</option>
              <option value="Clarksville, TN">Clarksville, TN</option>
              <option value="Murfreesboro, TN">Murfreesboro, TN</option>
            </optgroup>
          </select>
          {errors.location && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.location.message}</p>
          )}
        </div>

        {/* Window Cleaning Option */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <input
              id="needsWindowCleaning"
              type="checkbox"
              {...register('needsWindowCleaning')}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 dark:border-gray-600 rounded"
            />
            <label htmlFor="needsWindowCleaning" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              🪟 Add Window Cleaning (+$8 per window)
            </label>
          </div>
          
          {needsWindowCleaning && (
            <div>
              <label htmlFor="numberOfWindows" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Number of Standard Windows
              </label>
              <input
                id="numberOfWindows"
                type="number"
                min="0"
                max="100"
                {...register('numberOfWindows', { 
                  min: { value: 0, message: 'Cannot be negative' },
                  max: { value: 100, message: 'Maximum 100 windows' }
                })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter number of windows"
              />
              {errors.numberOfWindows && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.numberOfWindows.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Location Info Display */}
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">📍 Location-Based Pricing</h4>
          <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
            <p><strong>Service Area:</strong> {locationConfig.description}</p>
            <p><strong>Distance from Office:</strong> {locationConfig.distance === 0 ? 'Home Base' : `~${locationConfig.distance} miles`}</p>
            <p><strong>Gas Price:</strong> ${locationConfig.gasPrice}/gallon</p>
            <p><strong>Travel Cost:</strong> ${locationConfig.distance <= 60 ? 100 : 100 + Math.ceil((locationConfig.distance / 60) - 1) * 100}</p>
          </div>
        </div>

        {/* Automatic Calculations Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
            🤖 {serviceType === 'residential' ? 'Residential' : 'Commercial'} Pricing Included
          </h4>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <p>• Professional crew size optimized for your {serviceType} project ({recommendedCleaners} cleaners)</p>
            <p>• <strong>30% professional markup included</strong> (overhead, insurance, profit)</p>
            <p>• Standard urgency level (no rush charges)</p>
            <p>• Accurate distance-based travel costs</p>
            <p>• Optional window cleaning available</p>
            {serviceType === 'residential' ? (
              <p>• Residential rates and smaller crew configurations</p>
            ) : (
              <p>• Commercial insurance and specialized equipment included</p>
            )}
            <p>• For detailed estimates, switch to Professional Mode</p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 font-medium text-lg"
        >
          Get Quick Estimate
        </button>
      </form>
    </div>
  );
} 