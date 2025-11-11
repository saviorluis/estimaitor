'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { FormData, EstimateData, ProjectType, CleaningType } from '@/lib/types';
import { calculateEstimate } from '@/lib/estimator'; // Use original calculations
import { getRecommendedCleaners, CLEANING_TYPE_DESCRIPTIONS } from '@/lib/constants';

interface UnifiedEstimatorProps {
  onEstimateCalculated: (data: EstimateData, formValues: FormData) => void;
  mode?: 'simple' | 'advanced' | 'wizard';
  theme?: 'light' | 'dark';
}

// Form mode descriptions
const MODE_DESCRIPTIONS = {
  simple: {
    title: 'Client Reference Calculator',
    description: 'Quick estimate for client reference - simplified interface',
    icon: '👥'
  },
  advanced: {
    title: 'Professional Estimator',
    description: 'Full-featured calculator for professional use - all options available',
    icon: '⚙️'
  },
  wizard: {
    title: 'Step-by-Step Guide',
    description: 'Guided experience through each step of the estimation process',
    icon: '🧙‍♂️'
  }
} as const;

// Consolidated project types with icons and descriptions
const PROJECT_TYPES = [
  { value: 'restaurant', label: 'Restaurant', icon: '🍽️', description: 'Dining establishments, cafes' },
  { value: 'medical', label: 'Medical Facility', icon: '🏥', description: 'Hospitals, clinics, dental offices' },
  { value: 'office', label: 'Office Building', icon: '🏢', description: 'Corporate offices, coworking spaces' },
  { value: 'retail', label: 'Retail Store', icon: '🛍️', description: 'Shops, boutiques, showrooms' },
  { value: 'industrial', label: 'Industrial', icon: '🏭', description: 'Warehouses, factories, plants' },
  { value: 'educational', label: 'Educational', icon: '🎓', description: 'Schools, universities, training centers' },
  { value: 'hotel', label: 'Hotel', icon: '🏨', description: 'Hotels, hospitality venues' },
  { value: 'jewelry_store', label: 'Jewelry Store', icon: '💎', description: 'Jewelry stores, luxury retail' },
  { value: 'grocery_store', label: 'Grocery Store', icon: '🛒', description: 'Supermarkets, food stores' },
  { value: 'yoga_studio', label: 'Yoga Studio', icon: '🧘', description: 'Fitness studios, wellness centers' },
  { value: 'kids_fitness', label: 'Kids Fitness', icon: '🏃', description: 'Children\'s activity centers' },
  { value: 'bakery', label: 'Bakery', icon: '🥖', description: 'Bakeries, pastry shops' },
  { value: 'church', label: 'Church', icon: '⛪', description: 'Religious facilities' },
  { value: 'arcade', label: 'Arcade', icon: '🎮', description: 'Entertainment venues' },
  { value: 'coffee_shop', label: 'Coffee Shop', icon: '☕', description: 'Coffee shops, cafes' },
  { value: 'fire_station', label: 'Fire Station', icon: '🚒', description: 'Emergency services facilities' },
  { value: 'home_renovation', label: 'Home Renovation', icon: '🏠', description: 'Post-construction cleaning, residential renovation cleanup' },
  { value: 'building_shell', label: 'Building Shell', icon: '🏗️', description: 'Commercial construction cleanup, pre-tenant build-out' },
  { value: 'assisted_living', label: 'Assisted Living Facility', icon: '🏥', description: 'Senior living facilities with multiple bed/baths, cafeteria, laundry, utility rooms' },
  { value: 'other', label: 'Other', icon: '🏢', description: 'Other commercial spaces' }
] as const;

// Consolidated cleaning types
const CLEANING_TYPES = [
  { 
    value: 'final', 
    label: 'Final Clean', 
    description: 'Complete detailed cleaning with touchup (120% of standard rate)',
    icon: '✨'
  },
  { 
    value: 'final_touchup', 
    label: 'Final & Touchup', 
    description: 'Final cleaning with touchup service (120% of standard rate)',
    icon: '✨'
  },
  { 
    value: 'rough', 
    label: 'Rough Clean', 
    description: 'Basic debris removal (80% of standard rate)',
    icon: '🧹'
  },
  { 
    value: 'rough_final', 
    label: 'Rough & Final', 
    description: 'Two-stage cleaning process (140% of standard rate)',
    icon: '🔄'
  },
  { 
    value: 'rough_final_touchup', 
    label: 'Complete Package', 
    description: 'Three-stage process (160% of standard rate)',
    icon: '⭐'
  },
  { 
    value: 'pressure_washing', 
    label: 'Pressure Washing Only', 
    description: 'Exterior pressure washing services',
    icon: '💦'
  },
  { 
    value: 'vct_only', 
    label: 'VCT Flooring Only', 
    description: 'Vinyl tile stripping and waxing',
    icon: '🏗️'
  },
  { 
    value: 'window_cleaning_only', 
    label: 'Window Cleaning Only', 
    description: 'Professional window cleaning services',
    icon: '🪟'
  }
] as const;

export default function UnifiedEstimator({ 
  onEstimateCalculated, 
  mode = 'simple',
  theme = 'light' 
}: UnifiedEstimatorProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      projectType: 'office',
      cleaningType: 'final',
      squareFootage: 0,
      hasVCT: false,
      vctSquareFootage: 0,
      distanceFromOffice: 0,
      gasPrice: 3.50,
      applyMarkup: true,
      numberOfCleaners: 2,
      urgencyLevel: 5,
      stayingOvernight: false,
      numberOfNights: 0,
      needsPressureWashing: false,
      pressureWashingArea: 0,
      pressureWashingType: 'soft_wash',
      needsWindowCleaning: false,
      numberOfWindows: 0,
      numberOfLargeWindows: 0,
      numberOfHighAccessWindows: 0,
      numberOfDisplayCases: 0,
      numberOfBedBaths: 0,
      clientName: '',
      projectName: ''
    }
  });

  const watchedValues = watch();
  const recommendedCleaners = getRecommendedCleaners(watchedValues.squareFootage || 0);

  // Auto-update cleaners when square footage changes
  useEffect(() => {
    if (watchedValues.squareFootage > 0) {
      setValue('numberOfCleaners', recommendedCleaners);
    }
  }, [watchedValues.squareFootage, recommendedCleaners, setValue]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    try {
      const estimateData = calculateEstimate(data);
      onEstimateCalculated(estimateData, data);
    } catch (error) {
      console.error('Calculation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAIRecommendations = async () => {
    try {
      const response = await fetch('/api/ai-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(watchedValues)
      });
      const data = await response.json();
      setRecommendations([data.recommendations]);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  // Wizard steps for step-by-step mode
  const wizardSteps = [
    { id: 'project', title: 'Project Details', icon: '🏢' },
    { id: 'cleaning', title: 'Cleaning Type', icon: '✨' },
    { id: 'extras', title: 'Additional Services', icon: '🔧' },
    { id: 'details', title: 'Project Details', icon: '📋' },
    { id: 'review', title: 'Review & Calculate', icon: '✅' }
  ];

  const renderStep = (stepId: string) => {
    switch (stepId) {
      case 'project':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Project Information</h3>
            
            {/* Project Type */}
            <div>
              <label className="block text-sm font-medium mb-3">Project Type</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PROJECT_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      watchedValues.projectType === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value={type.value}
                      {...register('projectType')}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <div className="font-medium text-sm">{type.label}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Square Footage or Bed/Baths based on project type */}
            {watchedValues.projectType === 'assisted_living' ? (
              <div>
                <label className="block text-sm font-medium mb-2">Number of Bed/Bath Units</label>
                <input
                  type="number"
                  {...register('numberOfBedBaths', { 
                    required: 'Number of bed/bath units is required',
                    min: { value: 1, message: 'Must be at least 1 unit' }
                  })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter number of bed/bath units"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Each unit includes one bedroom and one bathroom
                </p>
                {errors.numberOfBedBaths && (
                  <p className="text-red-500 text-sm mt-1">{errors.numberOfBedBaths.message}</p>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-2">Square Footage</label>
                <input
                  type="number"
                  {...register('squareFootage', { 
                    required: 'Square footage is required',
                    min: { value: 1, message: 'Must be at least 1 sq ft' }
                  })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter square footage"
                />
                {errors.squareFootage && (
                  <p className="text-red-500 text-sm mt-1">{errors.squareFootage.message}</p>
                )}
              </div>
            )}
          </div>
        );

      case 'cleaning':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Cleaning Type</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CLEANING_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    watchedValues.cleaningType === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    value={type.value}
                    {...register('cleaningType')}
                    className="sr-only"
                  />
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{type.icon}</div>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-gray-600">{type.description}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );

      case 'extras':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Additional Services</h3>
            
            {/* VCT Flooring */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                {...register('hasVCT')}
                className="w-4 h-4 text-blue-600"
              />
              <label className="text-sm font-medium">VCT Flooring Treatment</label>
            </div>
            {watchedValues.hasVCT && (
              <div className="ml-7">
                <label className="block text-sm font-medium mb-2">VCT Square Footage</label>
                <input
                  type="number"
                  {...register('vctSquareFootage')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter VCT square footage"
                />
              </div>
            )}

            {/* Window Cleaning */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                {...register('needsWindowCleaning')}
                className="w-4 h-4 text-blue-600"
                defaultChecked={watchedValues.projectType === 'assisted_living'}
              />
              <label className="text-sm font-medium">Window Cleaning</label>
            </div>
            {(watchedValues.needsWindowCleaning || watchedValues.projectType === 'assisted_living') && (
              <div className="ml-7 space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Standard Windows</label>
                  <input
                    type="number"
                    {...register('numberOfWindows')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Number of standard windows"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Large Windows</label>
                  <input
                    type="number"
                    {...register('numberOfLargeWindows')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Number of large windows"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">High-Access Windows</label>
                  <input
                    type="number"
                    {...register('numberOfHighAccessWindows')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Number of high-access windows"
                  />
                </div>
              </div>
            )}

            {/* Pressure Washing */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                {...register('needsPressureWashing')}
                className="w-4 h-4 text-blue-600"
              />
              <label className="text-sm font-medium">Pressure Washing</label>
            </div>
            {watchedValues.needsPressureWashing && (
              <div className="ml-7 space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Pressure Washing Area (sq ft)</label>
                  <input
                    type="number"
                    {...register('pressureWashingArea')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter area to be pressure washed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    {...register('pressureWashingType')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="soft_wash">Soft Wash</option>
                    <option value="roof_wash">Roof Wash</option>
                    <option value="driveway">Driveway</option>
                    <option value="deck">Deck</option>
                    <option value="daily_rate">Daily Rate</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        );

      case 'details':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Project Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Distance from Office (miles)</label>
                <input
                  type="number"
                  {...register('distanceFromOffice')}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Number of Cleaners</label>
                <input
                  type="number"
                  {...register('numberOfCleaners', { min: 1 })}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  placeholder="2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: {recommendedCleaners} cleaners
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Urgency Level (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  {...register('urgencyLevel')}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low (1)</span>
                  <span>High (10)</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  {...register('stayingOvernight')}
                  className="w-4 h-4 text-blue-600"
                />
                <label className="text-sm font-medium">Overnight Stay Required</label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Client Name (Optional)</label>
                <input
                  type="text"
                  {...register('clientName')}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  placeholder="Enter client name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Project Name (Optional)</label>
                <input
                  type="text"
                  {...register('projectName')}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  placeholder="Enter project name"
                />
              </div>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Review & Calculate</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Project Type:</span>
                <span>{PROJECT_TYPES.find(t => t.value === watchedValues.projectType)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Cleaning Type:</span>
                <span>{CLEANING_TYPES.find(t => t.value === watchedValues.cleaningType)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Square Footage:</span>
                <span>{watchedValues.squareFootage?.toLocaleString()} sq ft</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Cleaners:</span>
                <span>{watchedValues.numberOfCleaners}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Urgency:</span>
                <span>{watchedValues.urgencyLevel}/10</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Calculating...' : 'Calculate Estimate'}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (mode === 'wizard') {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {wizardSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <span className="ml-2 text-sm font-medium">{step.title}</span>
                {index < wizardSteps.length - 1 && (
                  <div className="w-16 h-0.5 bg-gray-200 mx-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow">
          {renderStep(wizardSteps[currentStep].id)}
          
          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            
            {currentStep < wizardSteps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(Math.min(wizardSteps.length - 1, currentStep + 1))}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Calculating...' : 'Calculate Estimate'}
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  // Simple/Advanced mode - single form
  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">{MODE_DESCRIPTIONS[mode].icon}</div>
            <h2 className="text-2xl font-bold text-gray-900">{MODE_DESCRIPTIONS[mode].title}</h2>
            <p className="text-gray-600 mt-1">{MODE_DESCRIPTIONS[mode].description}</p>
          </div>
          
          {/* All form fields in a single view */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Type */}
            <div>
              <label className="block text-sm font-medium mb-3">Project Type</label>
              <select
                {...register('projectType', { required: 'Project type is required' })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {PROJECT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Square Footage or Bed/Baths based on project type */}
            {watchedValues.projectType === 'assisted_living' ? (
              <div>
                <label className="block text-sm font-medium mb-2">Number of Bed/Bath Units</label>
                <input
                  type="number"
                  {...register('numberOfBedBaths', { 
                    required: 'Number of bed/bath units is required',
                    min: { value: 1, message: 'Must be at least 1 unit' }
                  })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter number of bed/bath units"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Each unit includes one bedroom and one bathroom
                </p>
                {errors.numberOfBedBaths && (
                  <p className="text-red-500 text-sm mt-1">{errors.numberOfBedBaths.message}</p>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-2">Square Footage</label>
                <input
                  type="number"
                  {...register('squareFootage', { 
                    required: 'Square footage is required',
                    min: { value: 1, message: 'Must be at least 1 sq ft' }
                  })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter square footage"
                />
                {errors.squareFootage && (
                  <p className="text-red-500 text-sm mt-1">{errors.squareFootage.message}</p>
                )}
              </div>
            )}

            {/* Cleaning Type */}
            <div>
              <label className="block text-sm font-medium mb-3">Cleaning Type</label>
              <select
                {...register('cleaningType', { required: 'Cleaning type is required' })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {CLEANING_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Number of Cleaners */}
            <div>
              <label className="block text-sm font-medium mb-2">Number of Cleaners</label>
              <input
                type="number"
                {...register('numberOfCleaners', { min: 1 })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Recommended: {recommendedCleaners} cleaners
              </p>
            </div>

            {/* Distance */}
            <div>
              <label className="block text-sm font-medium mb-2">Distance from Office (miles)</label>
              <input
                type="number"
                {...register('distanceFromOffice')}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            {/* Urgency Level */}
            <div>
              <label className="block text-sm font-medium mb-2">Urgency Level: {watchedValues.urgencyLevel}/10</label>
              <input
                type="range"
                min="1"
                max="10"
                {...register('urgencyLevel')}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low (1)</span>
                <span>High (10)</span>
              </div>
            </div>
          </div>

          {/* Additional Services */}
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold">Additional Services</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* VCT Flooring */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  {...register('hasVCT')}
                  className="w-4 h-4 text-blue-600"
                />
                <label className="text-sm font-medium">VCT Flooring Treatment</label>
              </div>

              {/* Window Cleaning */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  {...register('needsWindowCleaning')}
                  className="w-4 h-4 text-blue-600"
                  defaultChecked={watchedValues.projectType === 'assisted_living'}
                />
                <label className="text-sm font-medium">Window Cleaning</label>
              </div>
              {watchedValues.projectType === 'assisted_living' && (
                <div className="col-span-2 space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Standard Windows</label>
                    <input
                      type="number"
                      {...register('numberOfWindows')}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Number of standard windows"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Large Windows</label>
                    <input
                      type="number"
                      {...register('numberOfLargeWindows')}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Number of large windows"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">High-Access Windows</label>
                    <input
                      type="number"
                      {...register('numberOfHighAccessWindows')}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Number of high-access windows"
                    />
                  </div>
                </div>
              )}

              {/* Pressure Washing */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  {...register('needsPressureWashing')}
                  className="w-4 h-4 text-blue-600"
                />
                <label className="text-sm font-medium">Pressure Washing</label>
              </div>

              {/* Overnight Stay */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  {...register('stayingOvernight')}
                  className="w-4 h-4 text-blue-600"
                />
                <label className="text-sm font-medium">Overnight Stay Required</label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Calculating...' : 'Calculate Estimate'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
