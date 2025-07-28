'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { FormData, EstimateData, ProjectType, CleaningType } from '@/lib/types';
import { calculateEstimate } from '@/lib/estimator';
import { getRecommendedCleaners, CLEANING_TYPE_DESCRIPTIONS } from '@/lib/constants';

interface EstimatorFormProps {
  onEstimateCalculated: (data: EstimateData, formValues: FormData) => void;
}

// Storage key for saving form data
const STORAGE_KEY = 'estimaitor_form_data';

export default function EstimatorForm({ onEstimateCalculated }: EstimatorFormProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Get saved form data from localStorage (memoized)
  const getSavedFormData = useCallback((): Partial<FormData> => {
    if (typeof window === 'undefined') return {};
    
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      return savedData ? JSON.parse(savedData) : {};
    } catch (error) {
      console.error('Error loading saved form data:', error);
      return {};
    }
  }, []);

  // Memoized default values
  const defaultValues = useMemo(() => ({
    projectType: 'office' as ProjectType,
    cleaningType: 'final' as CleaningType,
    squareFootage: 5000,
    hasVCT: false,
    vctSquareFootage: 0,
    distanceFromOffice: 20,
    gasPrice: 3.50,
    applyMarkup: false,
    stayingOvernight: false,
    numberOfNights: 1,
    numberOfCleaners: 3,
    urgencyLevel: 1,
    needsPressureWashing: false,
    pressureWashingArea: 0,
    pressureWashingType: 'soft_wash' as 'soft_wash' | 'roof_wash' | 'driveway' | 'deck' | 'daily_rate',
    needsWindowCleaning: false,
    chargeForWindowCleaning: false,
    numberOfWindows: 0,
    numberOfLargeWindows: 0,
    numberOfHighAccessWindows: 0,
    numberOfDisplayCases: 0,
    ...getSavedFormData()
  }), [getSavedFormData]);

  // Initialize form
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({
    defaultValues
  });

  // Watch form values
  const formValues = watch();
  const watchedDistance = watch('distanceFromOffice');
  const {
    squareFootage,
    stayingOvernight,
    urgencyLevel,
    needsPressureWashing,
    needsWindowCleaning
  } = formValues;

  // Load saved form data on component mount
  useEffect(() => {
    const savedData = getSavedFormData();
    if (Object.keys(savedData).length > 0) {
      reset(savedData as FormData);
    }
    setIsLoaded(true);
  }, [getSavedFormData, reset]);

  // Combined effect for form updates and localStorage saving
  useEffect(() => {
    if (!isLoaded) return;
    
    // Update recommended cleaners when square footage changes
    if (squareFootage) {
      const newRecommendedCleaners = getRecommendedCleaners(squareFootage);
      setValue('numberOfCleaners', newRecommendedCleaners);
    }
    
    // Save form data to localStorage
    try {
      const formDataToSave = {
        ...formValues,
        gasPrice: typeof formValues.gasPrice === 'string' 
          ? parseFloat(formValues.gasPrice) 
          : formValues.gasPrice
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formDataToSave));
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  }, [formValues, isLoaded, squareFootage, setValue]);

  // Optimized form submission handler
  const onSubmit: SubmitHandler<FormData> = useCallback((data) => {
    const formData = {
      ...data,
      gasPrice: typeof data.gasPrice === 'string' ? parseFloat(data.gasPrice) : data.gasPrice
    };
    
    const estimate = calculateEstimate(formData);
    onEstimateCalculated(estimate, formData);
  }, [onEstimateCalculated]);

  // Memoized urgency description function
  const getUrgencyDescription = useCallback((level: number): string => {
    if (level <= 2) return 'Low (No Rush)';
    if (level <= 5) return 'Medium';
    if (level <= 8) return 'High';
    return 'Urgent (ASAP)';
  }, []);

  // Memoized recommended cleaners
  const recommendedCleaners = useMemo(() => 
    getRecommendedCleaners(squareFootage || 0), 
    [squareFootage]
  );

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
        Estimate Calculator
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Client Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="clientName" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Client Name (Optional)
            </label>
            <input
              id="clientName"
              type="text"
              {...register('clientName')}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
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
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
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
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
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
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
          >
            <option value="rough">Rough Clean (80% rate)</option>
            <option value="final">Final Clean (Standard rate)</option>
            <option value="rough_final">Rough & Final Clean (120% rate)</option>
            <option value="rough_final_touchup">Rough, Final & Touchup (145% rate)</option>
            <option value="pressure_washing">Pressure Washing (Standard rate)</option>
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
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
            placeholder="Enter total building square footage for interior cleaning"
          />
          <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
            This is the total interior space to be cleaned (offices, hallways, bathrooms, etc.)
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Recommended cleaners: {recommendedCleaners}
          </p>
          {errors.squareFootage && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.squareFootage.message}</p>
          )}
        </div>

        {/* VCT Flooring */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <input
              id="hasVCT"
              type="checkbox"
              {...register('hasVCT')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
            />
            <label htmlFor="hasVCT" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Has VCT Flooring (+$0.15/sq ft)
            </label>
          </div>
          
          {watch('hasVCT') && (
            <div>
              <label htmlFor="vctSquareFootage" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                VCT Square Footage
              </label>
              <input
                id="vctSquareFootage"
                type="number"
                min="0"
                max="1000000"
                {...register('vctSquareFootage', { 
                  required: watch('hasVCT') ? 'VCT square footage is required when VCT is selected' : false,
                  min: { value: 0, message: 'VCT square footage cannot be negative' },
                  max: { value: 1000000, message: 'Maximum 1,000,000 sq ft' }
                })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter VCT square footage"
              />
              {errors.vctSquareFootage && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.vctSquareFootage.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Distance and Gas Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="distanceFromOffice" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Distance from Office (miles)
            </label>
            <input
              id="distanceFromOffice"
              type="number"
              min="0"
              max="500"
              {...register('distanceFromOffice', { 
                required: 'Distance is required',
                min: { value: 0, message: 'Distance cannot be negative' },
                max: { value: 500, message: 'Maximum 500 miles' }
              })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              placeholder="Distance in miles"
            />
            {errors.distanceFromOffice && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.distanceFromOffice.message}</p>
            )}
            {/* Travel Time and Cost Display */}
            {watchedDistance > 0 && (
              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Drive time: ~{Math.round((watchedDistance / 60) * 10) / 10} hours | 
                  Travel fee: ${watchedDistance <= 60 ? 100 : 100 + Math.ceil((watchedDistance / 60) - 1) * 100}
                </p>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="gasPrice" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Gas Price per Gallon ($)
            </label>
            <input
              id="gasPrice"
              type="number"
              step="0.01"
              min="1"
              max="10"
              {...register('gasPrice', { 
                required: 'Gas price is required',
                min: { value: 1, message: 'Minimum $1.00' },
                max: { value: 10, message: 'Maximum $10.00' }
              })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              placeholder="3.50"
            />
            {errors.gasPrice && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.gasPrice.message}</p>
            )}
          </div>
        </div>

        {/* Team and Urgency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="numberOfCleaners" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Number of Cleaners
            </label>
            <input
              id="numberOfCleaners"
              type="number"
              min="1"
              max="50"
              {...register('numberOfCleaners', { 
                required: 'Number of cleaners is required',
                min: { value: 1, message: 'Minimum 1 cleaner' },
                max: { value: 50, message: 'Maximum 50 cleaners' }
              })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
            />
            {errors.numberOfCleaners && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.numberOfCleaners.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="urgencyLevel" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Urgency Level: {urgencyLevel} - {getUrgencyDescription(urgencyLevel)}
            </label>
            <input
              id="urgencyLevel"
              type="range"
              min="1"
              max="10"
              {...register('urgencyLevel')}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>No Rush</span>
              <span>Medium</span>
              <span>Urgent</span>
            </div>
          </div>
        </div>

        {/* Staying Overnight */}
        <div className="border-t pt-4">
          <div className="flex items-center space-x-3 mb-4">
            <input
              id="stayingOvernight"
              type="checkbox"
              {...register('stayingOvernight')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
            />
            <label htmlFor="stayingOvernight" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Team will be staying overnight
            </label>
          </div>
          
          {stayingOvernight && (
            <div>
              <label htmlFor="numberOfNights" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Number of Nights
              </label>
              <input
                id="numberOfNights"
                type="number"
                min="1"
                max="30"
                {...register('numberOfNights', { 
                  min: { value: 1, message: 'Minimum 1 night' },
                  max: { value: 30, message: 'Maximum 30 nights' }
                })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              />
              {errors.numberOfNights && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.numberOfNights.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Pressure Washing */}
        <div className="border-t pt-4">
          <div className="flex items-center space-x-3 mb-4">
            <input
              id="needsPressureWashing"
              type="checkbox"
              {...register('needsPressureWashing')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
            />
            <label htmlFor="needsPressureWashing" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Needs Pressure Washing
            </label>
          </div>
          
          {needsPressureWashing && (
            <div className="space-y-4 bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Pressure Washing Details</h4>
              
              {/* Pressure Washing Type */}
              <div>
                <label htmlFor="pressureWashingType" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Service Type
                </label>
                <select
                  id="pressureWashingType"
                  {...register('pressureWashingType', { 
                    required: needsPressureWashing ? 'Pressure washing type is required' : false
                  })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select service type</option>
                  <option value="soft_wash">Soft Wash - $0.18/sq ft (min $235)</option>
                  <option value="roof_wash">Roof Wash - $0.50/sq ft</option>
                  <option value="driveway">Driveway Cleaning - $0.20/sq ft</option>
                  <option value="deck">Deck/Trex Cleaning - $1.00/sq ft</option>
                  <option value="daily_rate">Custom/Daily Rate - $1,800/day</option>
                </select>
                {errors.pressureWashingType && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.pressureWashingType.message}</p>
                )}
              </div>

              {/* Pressure Washing Area Input (hide for daily rate) */}
              {watch('pressureWashingType') !== 'daily_rate' && (
                <div>
                  <label htmlFor="pressureWashingArea" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    🚿 Pressure Washing Area (sq ft)
                  </label>
                  <input
                    id="pressureWashingArea"
                    type="number"
                    min="0"
                    max="100000"
                    {...register('pressureWashingArea', { 
                      required: needsPressureWashing && watch('pressureWashingType') !== 'daily_rate' ? 'Pressure washing area is required' : false,
                      min: { value: 0, message: 'Area cannot be negative' },
                      max: { value: 100000, message: 'Maximum 100,000 sq ft' }
                    })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                    placeholder="Enter exterior/concrete area to pressure wash (separate from building size above)"
                  />
                  <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                    ⚠️ This is separate from building size - enter only the exterior surfaces to be pressure washed (sidewalks, driveways, building exterior, etc.)
                  </p>
                  {errors.pressureWashingArea && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.pressureWashingArea.message}</p>
                  )}
                </div>
              )}

              {/* Service Information */}
              <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Service Includes:</h5>
                <ul className="space-y-1">
                  <li>• Professional pressure washing equipment</li>
                  <li>• Specialized cleaning chemicals as needed</li>
                  <li>• Surface-appropriate cleaning methods</li>
                  <li>• Proper waste water management</li>
                  {watch('pressureWashingType') === 'daily_rate' && (
                    <li>• Full day service with complete crew</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Window Cleaning */}
        <div className="border-t pt-4">
          <div className="flex items-center space-x-3 mb-4">
            <input
              id="needsWindowCleaning"
              type="checkbox"
              {...register('needsWindowCleaning')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
            />
            <label htmlFor="needsWindowCleaning" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Needs Window Cleaning
            </label>
          </div>
          
          {needsWindowCleaning && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  id="chargeForWindowCleaning"
                  type="checkbox"
                  {...register('chargeForWindowCleaning')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label htmlFor="chargeForWindowCleaning" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Charge for Window Cleaning
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="numberOfWindows" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Standard Windows
                  </label>
                  <input
                    id="numberOfWindows"
                    type="number"
                    min="0"
                    {...register('numberOfWindows', { 
                      min: { value: 0, message: 'Cannot be negative' }
                    })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label htmlFor="numberOfLargeWindows" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Large Windows
                  </label>
                  <input
                    id="numberOfLargeWindows"
                    type="number"
                    min="0"
                    {...register('numberOfLargeWindows', { 
                      min: { value: 0, message: 'Cannot be negative' }
                    })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label htmlFor="numberOfHighAccessWindows" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    High Access Windows
                  </label>
                  <input
                    id="numberOfHighAccessWindows"
                    type="number"
                    min="0"
                    {...register('numberOfHighAccessWindows', { 
                      min: { value: 0, message: 'Cannot be negative' }
                    })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Display Cases (Jewelry Store) */}
        {formValues.projectType === 'jewelry_store' && (
          <div className="border-t pt-4">
            <label htmlFor="numberOfDisplayCases" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Number of Display Cases
            </label>
            <input
              id="numberOfDisplayCases"
              type="number"
              min="0"
              max="1000"
              {...register('numberOfDisplayCases', { 
                min: { value: 0, message: 'Cannot be negative' },
                max: { value: 1000, message: 'Maximum 1,000 cases' }
              })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              placeholder="Enter number of display cases"
            />
            {errors.numberOfDisplayCases && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.numberOfDisplayCases.message}</p>
            )}
          </div>
        )}



        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 font-medium text-lg"
        >
          Calculate Estimate
        </button>
      </form>
    </div>
  );
} 