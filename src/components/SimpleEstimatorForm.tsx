'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { FormData, EstimateData, ProjectType, CleaningType } from '@/lib/types';
import { calculateEstimate } from '@/lib/estimator';
import { getRecommendedCleaners, CLEANING_TYPE_DESCRIPTIONS } from '@/lib/constants';

interface SimpleEstimatorFormProps {
  onEstimateCalculated: (data: EstimateData, formValues: FormData) => void;
}

// Simplified form data for simple mode
interface SimpleFormData {
  projectType: ProjectType;
  cleaningType: CleaningType;
  squareFootage: number;
  city: string;
  state: string;
  clientName?: string;
  projectName?: string;
}

// Location-based defaults and pricing (Home Base: 1200 Eastchester Dr, High Point, NC)
const LOCATION_CONFIGS = {
  // Distance from office based on state/region
  'NC': { distance: 15, gasPrice: 3.50, description: 'North Carolina (Home Base - High Point)' },
  'VA': { distance: 85, gasPrice: 3.45, description: 'Virginia' },
  'SC': { distance: 45, gasPrice: 3.40, description: 'South Carolina' },
  'GA': { distance: 125, gasPrice: 3.35, description: 'Georgia' },
  'TN': { distance: 95, gasPrice: 3.25, description: 'Tennessee' },
  'MD': { distance: 145, gasPrice: 3.55, description: 'Maryland' },
  'DC': { distance: 155, gasPrice: 3.60, description: 'Washington DC' },
  'WV': { distance: 165, gasPrice: 3.30, description: 'West Virginia' },
  'KY': { distance: 185, gasPrice: 3.20, description: 'Kentucky' },
  'FL': { distance: 285, gasPrice: 3.45, description: 'Florida' },
  'OTHER': { distance: 100, gasPrice: 3.50, description: 'Other Location' }
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
    projectType: 'office' as ProjectType,
    cleaningType: 'final' as CleaningType,
    squareFootage: 5000,
    city: '',
    state: 'NC',
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
  const { squareFootage, state } = formValues;

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

  // Get location configuration
  const locationConfig = LOCATION_CONFIGS[state as keyof typeof LOCATION_CONFIGS] || LOCATION_CONFIGS.OTHER;

  // Calculate recommended cleaners
  const recommendedCleaners = useMemo(() => 
    getRecommendedCleaners(squareFootage || 0), 
    [squareFootage]
  );

  // Convert simple form data to full FormData for calculation
  const convertToFullFormData = useCallback((simpleData: SimpleFormData): FormData => {
    const locationConfig = LOCATION_CONFIGS[simpleData.state as keyof typeof LOCATION_CONFIGS] || LOCATION_CONFIGS.OTHER;
    
    return {
      // Basic project info
      projectType: simpleData.projectType,
      cleaningType: simpleData.cleaningType,
      squareFootage: simpleData.squareFootage,
      clientName: simpleData.clientName,
      projectName: simpleData.projectName,
      
      // Location-based defaults
      distanceFromOffice: locationConfig.distance,
      gasPrice: locationConfig.gasPrice,
      
      // Simplified defaults
      hasVCT: false,
      vctSquareFootage: 0,
      applyMarkup: true,
      numberOfCleaners: getRecommendedCleaners(simpleData.squareFootage),
      urgencyLevel: 3, // Medium urgency
      
      // No add-ons in simple mode
      stayingOvernight: false,
      numberOfNights: 1,
      needsPressureWashing: false,
      pressureWashingServices: [],
      pressureWashingArea: 0,
      pressureWashingType: 'soft_wash' as const,
      needsWindowCleaning: false,
      numberOfWindows: 0,
      numberOfLargeWindows: 0,
      numberOfHighAccessWindows: 0,
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
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            Project Type
          </label>
          <select
            id="projectType"
            {...register('projectType', { required: 'Project type is required' })}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
          >
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
            <option value="other">Other</option>
          </select>
          {errors.projectType && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.projectType.message}</p>
          )}
        </div>

        {/* Cleaning Type */}
        <div>
          <label htmlFor="cleaningType" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Cleaning Type
          </label>
          <select
            id="cleaningType"
            {...register('cleaningType', { required: 'Cleaning type is required' })}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
          >
            <option value="rough">Rough Clean (80% rate)</option>
            <option value="final">Final Clean (Standard rate)</option>
            <option value="rough_final">Rough & Final Clean (120% rate)</option>
            <option value="rough_final_touchup">Rough, Final & Touchup (145% rate)</option>
          </select>
          {formValues.cleaningType && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {CLEANING_TYPE_DESCRIPTIONS[formValues.cleaningType]}
            </p>
          )}
          {errors.cleaningType && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cleaningType.message}</p>
          )}
        </div>

        {/* Building Square Footage */}
        <div>
          <label htmlFor="squareFootage" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            🏢 Building Size - Total Square Footage
          </label>
          <input
            id="squareFootage"
            type="number"
            min="100"
            max="1000000"
            {...register('squareFootage', { 
              required: 'Building square footage is required',
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
          {errors.squareFootage && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.squareFootage.message}</p>
          )}
        </div>

        {/* Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              📍 City
            </label>
            <input
              id="city"
              type="text"
              {...register('city', { required: 'City is required' })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              placeholder="Enter city"
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.city.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              🗺️ State
            </label>
            <select
              id="state"
              {...register('state', { required: 'State is required' })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
            >
              <option value="NC">North Carolina (Home Base)</option>
              <option value="SC">South Carolina</option>
              <option value="VA">Virginia</option>
              <option value="TN">Tennessee</option>
              <option value="GA">Georgia</option>
              <option value="MD">Maryland</option>
              <option value="DC">Washington DC</option>
              <option value="WV">West Virginia</option>
              <option value="KY">Kentucky</option>
              <option value="FL">Florida</option>
              <option value="OTHER">Other</option>
            </select>
            {errors.state && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.state.message}</p>
            )}
          </div>
        </div>

        {/* Location Info Display */}
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">📍 Location-Based Pricing</h4>
          <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
            <p><strong>Service Area:</strong> {locationConfig.description}</p>
            <p><strong>Distance from Office:</strong> ~{locationConfig.distance} miles</p>
            <p><strong>Gas Price:</strong> ${locationConfig.gasPrice}/gallon</p>
            <p><strong>Travel Cost:</strong> ${locationConfig.distance <= 60 ? 100 : 100 + Math.ceil((locationConfig.distance / 60) - 1) * 100}</p>
          </div>
        </div>

        {/* Automatic Calculations Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">🤖 Automatic Calculations</h4>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <p>• Professional crew size optimized for your project</p>
            <p>• 30% professional markup included</p>
            <p>• Standard urgency level (no rush charges)</p>
            <p>• Base pricing with location adjustments</p>
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