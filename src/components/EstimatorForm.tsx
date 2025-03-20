'use client';

import { useState, useEffect } from 'react';
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
  const [stayingOvernight, setStayingOvernight] = useState(false);
  const [recommendedCleaners, setRecommendedCleaners] = useState(3);
  const [urgencyLevel, setUrgencyLevel] = useState(1);
  const [needsPressureWashing, setNeedsPressureWashing] = useState(false);
  const [needsWindowCleaning, setNeedsWindowCleaning] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Get saved form data from localStorage
  const getSavedFormData = (): Partial<FormData> => {
    if (typeof window === 'undefined') return {};
    
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      return savedData ? JSON.parse(savedData) : {};
    } catch (error) {
      console.error('Error loading saved form data:', error);
      return {};
    }
  };

  // Initialize form with saved data or defaults
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      projectType: 'office',
      cleaningType: 'final',
      squareFootage: 5000,
      hasVCT: false,
      distanceFromOffice: 20,
      gasPrice: 3.50,
      applyMarkup: false,
      stayingOvernight: false,
      numberOfNights: 1,
      numberOfCleaners: 3,
      urgencyLevel: 1,
      needsPressureWashing: false,
      pressureWashingArea: 0,
      needsWindowCleaning: false,
      numberOfWindows: 0,
      numberOfLargeWindows: 0,
      numberOfHighAccessWindows: 0,
      numberOfDisplayCases: 0
    }
  });

  // Load saved form data on component mount
  useEffect(() => {
    const savedData = getSavedFormData();
    if (Object.keys(savedData).length > 0) {
      reset(savedData as FormData);
      
      // Update UI state based on saved data
      if (savedData.stayingOvernight) setStayingOvernight(savedData.stayingOvernight);
      if (savedData.urgencyLevel) setUrgencyLevel(savedData.urgencyLevel);
      if (savedData.needsPressureWashing) setNeedsPressureWashing(savedData.needsPressureWashing);
      if (savedData.needsWindowCleaning) setNeedsWindowCleaning(savedData.needsWindowCleaning);
    }
    setIsLoaded(true);
  }, [reset]);

  // Watch for changes in square footage, project type, and staying overnight
  const squareFootage = watch('squareFootage');
  const stayingOvernightWatch = watch('stayingOvernight');
  const urgencyLevelWatch = watch('urgencyLevel');
  const needsPressureWashingWatch = watch('needsPressureWashing');
  const needsWindowCleaningWatch = watch('needsWindowCleaning');
  const formValues = watch();

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (!isLoaded) return;
    
    try {
      // Ensure gasPrice is stored as a number
      const formDataToSave = {
        ...formValues,
        gasPrice: typeof formValues.gasPrice === 'string' ? parseFloat(formValues.gasPrice) : formValues.gasPrice
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formDataToSave));
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  }, [formValues, isLoaded]);

  // Update recommended cleaners when square footage changes
  useEffect(() => {
    if (squareFootage) {
      const newRecommendedCleaners = getRecommendedCleaners(squareFootage);
      setRecommendedCleaners(newRecommendedCleaners);
      setValue('numberOfCleaners', newRecommendedCleaners);
    }
  }, [squareFootage, setValue]);

  // Update staying overnight state
  useEffect(() => {
    setStayingOvernight(stayingOvernightWatch);
  }, [stayingOvernightWatch]);

  // Update urgency level state
  useEffect(() => {
    setUrgencyLevel(urgencyLevelWatch);
  }, [urgencyLevelWatch]);

  // Update pressure washing state
  useEffect(() => {
    setNeedsPressureWashing(needsPressureWashingWatch);
  }, [needsPressureWashingWatch]);

  // Update window cleaning state
  useEffect(() => {
    setNeedsWindowCleaning(needsWindowCleaningWatch);
  }, [needsWindowCleaningWatch]);

  // Handle form submission
  const onSubmit: SubmitHandler<FormData> = (data) => {
    // Ensure gasPrice is a number
    const formData = {
      ...data,
      gasPrice: typeof data.gasPrice === 'string' ? parseFloat(data.gasPrice) : data.gasPrice
    };
    
    const estimate = calculateEstimate(formData);
    onEstimateCalculated(estimate, formData);
  };

  // Helper function to get urgency description
  const getUrgencyDescription = (level: number): string => {
    if (level <= 2) return 'Low (No Rush)';
    if (level <= 5) return 'Medium';
    if (level <= 8) return 'High';
    return 'Urgent (ASAP)';
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white border-b pb-2">Project Details</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project Type
          </label>
          <select
            {...register('projectType', { required: 'Project type is required' })}
            className="input-field"
          >
            <option value="restaurant">Restaurant</option>
            <option value="medical">Medical Facility</option>
            <option value="office">Office Space</option>
            <option value="retail">Retail Space</option>
            <option value="industrial">Industrial Space</option>
            <option value="educational">Educational Facility</option>
            <option value="hotel">Hotel (up to 100,000 sq ft)</option>
            <option value="jewelry_store">Jewelry Store</option>
          </select>
          {errors.projectType && (
            <p className="text-red-500 text-xs mt-1">{errors.projectType.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cleaning Type
          </label>
          <select
            {...register('cleaningType', { required: 'Cleaning type is required' })}
            className="input-field"
          >
            <option value="rough">Rough Clean (First Stage - 80% of standard rate)</option>
            <option value="final">Final Clean (Second Stage - Standard rate)</option>
            <option value="powder_puff">Powder Puff Clean (Third Stage - 130% of standard rate)</option>
            <option value="complete">Complete Package (All Three Stages - 200% of standard rate)</option>
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {CLEANING_TYPE_DESCRIPTIONS[watch('cleaningType') as CleaningType]}
          </p>
          {errors.cleaningType && (
            <p className="text-red-500 text-xs mt-1">{errors.cleaningType.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Square Footage
            </label>
            <input
              type="number"
              {...register('squareFootage', { 
                required: 'Square footage is required',
                min: { value: 500, message: 'Minimum 500 sq ft' },
                max: { value: 100000, message: 'Maximum 100,000 sq ft' }
              })}
              className="input-field"
            />
            {errors.squareFootage && (
              <p className="text-red-500 text-xs mt-1">{errors.squareFootage.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Number of Cleaners
            </label>
            <select
              {...register('numberOfCleaners', { required: 'Number of cleaners is required' })}
              className="input-field"
            >
              {[...Array(20)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} {i + 1 === recommendedCleaners ? '(Recommended)' : ''}
                </option>
              ))}
            </select>
            {errors.numberOfCleaners && (
              <p className="text-red-500 text-xs mt-1">{errors.numberOfCleaners.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            {...register('hasVCT')}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            VCT Flooring (Vinyl Composition Tile)
          </label>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="needsPressureWashing"
              {...register('needsPressureWashing')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="needsPressureWashing" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Pressure Washing Required
            </label>
          </div>
          
          {needsPressureWashing && (
            <div className="ml-6 mt-2 p-3 bg-gray-50 dark:bg-slate-700 rounded-md">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Area to Pressure Wash (sq ft)
              </label>
              <input
                type="number"
                {...register('pressureWashingArea', {
                  required: needsPressureWashing ? 'Area is required' : false,
                  min: {
                    value: 100,
                    message: 'Minimum area is 100 sq ft'
                  },
                  max: {
                    value: 100000,
                    message: 'Maximum area is 100,000 sq ft'
                  }
                })}
                className="input-field"
              />
              {errors.pressureWashingArea && (
                <p className="text-red-500 text-xs mt-1">{errors.pressureWashingArea.message}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Includes concrete, driveways, walkways, and exterior surfaces.
                Cost: $0.35/sq ft plus equipment rental.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="needsWindowCleaning"
              {...register('needsWindowCleaning')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="needsWindowCleaning" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Window Cleaning Required
            </label>
          </div>
          
          {needsWindowCleaning && (
            <div className="ml-6 mt-2 p-3 bg-gray-50 dark:bg-slate-700 rounded-md space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Number of Standard Windows
                </label>
                <input
                  type="number"
                  {...register('numberOfWindows', {
                    required: needsWindowCleaning ? 'Number of windows is required' : false,
                    min: {
                      value: 0,
                      message: 'Cannot be negative'
                    }
                  })}
                  className="input-field"
                />
                {errors.numberOfWindows && (
                  <p className="text-red-500 text-xs mt-1">{errors.numberOfWindows.message}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Standard windows (up to 3ft x 5ft). Cost: $15 per window.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Number of Large Windows
                </label>
                <input
                  type="number"
                  {...register('numberOfLargeWindows', {
                    min: {
                      value: 0,
                      message: 'Cannot be negative'
                    }
                  })}
                  className="input-field"
                />
                {errors.numberOfLargeWindows && (
                  <p className="text-red-500 text-xs mt-1">{errors.numberOfLargeWindows.message}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Large windows (over 3ft x 5ft). Cost: $22.50 per window.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Number of High-Access Windows
                </label>
                <input
                  type="number"
                  {...register('numberOfHighAccessWindows', {
                    min: {
                      value: 0,
                      message: 'Cannot be negative'
                    }
                  })}
                  className="input-field"
                />
                {errors.numberOfHighAccessWindows && (
                  <p className="text-red-500 text-xs mt-1">{errors.numberOfHighAccessWindows.message}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Windows requiring ladders or lifts (above 12ft). Cost: $30 per window.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Distance from Office (miles)
            </label>
            <input
              type="number"
              {...register('distanceFromOffice', { 
                required: 'Distance is required',
                min: { value: 0, message: 'Minimum 0 miles' },
                max: { value: 500, message: 'Maximum 500 miles' }
              })}
              className="input-field"
            />
            {errors.distanceFromOffice && (
              <p className="text-red-500 text-xs mt-1">{errors.distanceFromOffice.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Gas Price ($/gallon)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('gasPrice', { 
                required: 'Gas price is required',
                min: { value: 1, message: 'Minimum $1.00' },
                max: { value: 10, message: 'Maximum $10.00' }
              })}
              className="input-field"
            />
            {errors.gasPrice && (
              <p className="text-red-500 text-xs mt-1">{errors.gasPrice.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Urgency Level (1-10)
          </label>
          <div className="flex items-center">
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              {...register('urgencyLevel', { 
                required: 'Urgency level is required',
                min: 1,
                max: 10
              })}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[120px]">
              {urgencyLevel} - {getUrgencyDescription(urgencyLevel)}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Higher urgency may increase costs by up to 30%
          </p>
          {errors.urgencyLevel && (
            <p className="text-red-500 text-xs mt-1">{errors.urgencyLevel.message}</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="applyMarkup"
            {...register('applyMarkup')}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="applyMarkup" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Include Additional Cleaning Costs
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            {...register('stayingOvernight')}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Staying Overnight
          </label>
        </div>

        {stayingOvernight && (
          <div className="ml-6 pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Number of Nights
            </label>
            <input
              type="number"
              {...register('numberOfNights', { 
                required: 'Number of nights is required',
                min: { value: 1, message: 'Minimum 1 night' },
                max: { value: 30, message: 'Maximum 30 nights' }
              })}
              className="input-field"
            />
            {errors.numberOfNights && (
              <p className="text-red-500 text-xs mt-1">{errors.numberOfNights.message}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Includes per diem ($75/person/day) and hotel costs ($150/room/night, 2 people per room)
            </p>
          </div>
        )}

        <button type="submit" className="btn-primary w-full py-3 text-lg">
          Calculate Estimate
        </button>
      </form>
    </div>
  );
} 