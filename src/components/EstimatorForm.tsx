'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { FormData, EstimateData, ProjectType, CleaningType, PressureWashingServiceType } from '@/lib/types';
import { calculateEstimate } from '@/lib/estimator';
import { getRecommendedCleaners, CLEANING_TYPE_DESCRIPTIONS, PRESSURE_WASHING_RATES, PRESSURE_WASHING_SCOPE_OF_WORK } from '@/lib/constants';

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
  const [pressureWashingServices, setPressureWashingServices] = useState<PressureWashingServiceType[]>([]);

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
      chargeForWindowCleaning: false,
      numberOfWindows: 0,
      numberOfLargeWindows: 0,
      numberOfHighAccessWindows: 0,
      numberOfDisplayCases: 0,
      ...getSavedFormData()
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

  // Watch for changes in cleaning type to auto-select pressure washing if pressure_washing_only is selected
  const cleaningType = watch('cleaningType');
  
  useEffect(() => {
    if (cleaningType === 'pressure_washing_only') {
      setValue('needsPressureWashing', true);
      setNeedsPressureWashing(true);
    } else if (cleaningType === 'window_cleaning_only') {
      setValue('needsWindowCleaning', true);
      setNeedsWindowCleaning(true);
    }
  }, [cleaningType, setValue]);

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
        {/* Client Information Section - Add at the beginning of the form */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-gray-700 dark:text-gray-200">
            Client Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-field">
              <label htmlFor="clientName" className="form-label">
                Client Name
              </label>
              <input
                type="text"
                id="clientName"
                {...register('clientName')}
                className="form-input text-gray-800 dark:text-white"
                placeholder="Enter client name"
              />
            </div>
            <div className="form-field">
              <label htmlFor="projectName" className="form-label">
                Project Name
              </label>
              <input
                type="text"
                id="projectName"
                {...register('projectName')}
                className="form-input text-gray-800 dark:text-white"
                placeholder="Enter project name"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project Type
          </label>
          <select
            {...register('projectType', { required: 'Project type is required' })}
            className="input-field"
          >
            <option value="restaurant">Restaurant</option>
            <option value="fast_food">Fast Food Restaurant</option>
            <option value="bakery">Bakery</option>
            <option value="coffee_shop">Coffee Shop</option>
            <option value="medical">Medical Facility</option>
            <option value="office">Office Space</option>
            <option value="retail">Retail Space</option>
            <option value="industrial">Industrial Space</option>
            <option value="educational">Educational Facility</option>
            <option value="hotel">Hotel (up to 100,000 sq ft)</option>
            <option value="jewelry_store">Jewelry Store</option>
            <option value="apartment">Apartment Complex</option>
            <option value="warehouse">Warehouse</option>
            <option value="dormitory">Dormitory</option>
            <option value="grocery_store">Grocery Store</option>
            <option value="yoga_studio">Yoga Studio</option>
            <option value="kids_fitness">Children's Fitness Center</option>
            <option value="pet_resort">Pet Resort/Animal Boarding</option>
            <option value="beauty_store">Beauty/Cosmetics Store</option>
            <option value="interactive_toy_store">Interactive Toy Store (CAMP-style)</option>
            <option value="mailroom">Mailroom/Shipping Center</option>
            <option value="church">Church/Religious Facility</option>
            <option value="residential">Residential</option>
            <option value="car_wash">Car Wash Facility</option>
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
            <option value="rough">Rough Clean (80% of standard rate)</option>
            <option value="final">Final Clean (Standard rate)</option>
            <option value="rough_final">Rough & Final Clean (120% of standard rate)</option>
            <option value="rough_final_touchup">Rough, Final & Touchup (145% of standard rate)</option>
            <option value="pressure_washing_only">Pressure Washing Only Service</option>
            <option value="window_cleaning_only">Window Cleaning Only Service</option>
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
                required: cleaningType !== 'window_cleaning_only' && cleaningType !== 'pressure_washing_only' ? 'Square footage is required' : false,
                min: cleaningType !== 'window_cleaning_only' && cleaningType !== 'pressure_washing_only' ? 
                  { value: 100, message: 'Minimum 100 sq ft' } : undefined,
                max: { value: 100000, message: 'Maximum 100,000 sq ft' }
              })}
              className="input-field"
              disabled={cleaningType === 'window_cleaning_only' || cleaningType === 'pressure_washing_only'}
            />
            {errors.squareFootage && (
              <p className="text-red-500 text-xs mt-1">{errors.squareFootage.message}</p>
            )}
            {(cleaningType === 'window_cleaning_only' || cleaningType === 'pressure_washing_only') && (
              <p className="text-xs text-amber-500 dark:text-amber-400 mt-1">
                {cleaningType === 'window_cleaning_only' ? 'Square footage not applicable for window cleaning only services' : 'Square footage not applicable for pressure washing only services'}
              </p>
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
              disabled={cleaningType === 'pressure_washing_only'}
            />
            <label htmlFor="needsPressureWashing" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Pressure Washing Required
            </label>
          </div>
          
          {(needsPressureWashing || cleaningType === 'pressure_washing_only') && (
            <div className="ml-6 mt-2 p-3 bg-gray-50 dark:bg-slate-700 rounded-md">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Pressure Washing Services
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="service-soft-wash"
                      onChange={(e) => {
                        const services = [...pressureWashingServices];
                        if (e.target.checked) {
                          services.push('soft_wash');
                        } else {
                          const index = services.indexOf('soft_wash');
                          if (index !== -1) services.splice(index, 1);
                        }
                        setPressureWashingServices(services);
                        setValue('pressureWashingServices', services);
                      }}
                      checked={pressureWashingServices.includes('soft_wash')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="service-soft-wash" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Soft Washing (House/Building) - ${PRESSURE_WASHING_RATES.SOFT_WASH.rate}/sq ft
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="service-roof-wash"
                      onChange={(e) => {
                        const services = [...pressureWashingServices];
                        if (e.target.checked) {
                          services.push('roof_wash');
                        } else {
                          const index = services.indexOf('roof_wash');
                          if (index !== -1) services.splice(index, 1);
                        }
                        setPressureWashingServices(services);
                        setValue('pressureWashingServices', services);
                      }}
                      checked={pressureWashingServices.includes('roof_wash')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="service-roof-wash" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Roof Washing - ${PRESSURE_WASHING_RATES.ROOF_WASH.rate}/sq ft
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="service-driveway"
                      onChange={(e) => {
                        const services = [...pressureWashingServices];
                        if (e.target.checked) {
                          services.push('driveway');
                        } else {
                          const index = services.indexOf('driveway');
                          if (index !== -1) services.splice(index, 1);
                        }
                        setPressureWashingServices(services);
                        setValue('pressureWashingServices', services);
                      }}
                      checked={pressureWashingServices.includes('driveway')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="service-driveway" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Driveway - ${PRESSURE_WASHING_RATES.DRIVEWAY.rate}/sq ft
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="service-deck"
                      onChange={(e) => {
                        const services = [...pressureWashingServices];
                        if (e.target.checked) {
                          services.push('deck');
                        } else {
                          const index = services.indexOf('deck');
                          if (index !== -1) services.splice(index, 1);
                        }
                        setPressureWashingServices(services);
                        setValue('pressureWashingServices', services);
                      }}
                      checked={pressureWashingServices.includes('deck')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="service-deck" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Wooden Deck - ${PRESSURE_WASHING_RATES.DECK.rate}/sq ft
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="service-trex"
                      onChange={(e) => {
                        const services = [...pressureWashingServices];
                        if (e.target.checked) {
                          services.push('trex_deck');
                        } else {
                          const index = services.indexOf('trex_deck');
                          if (index !== -1) services.splice(index, 1);
                        }
                        setPressureWashingServices(services);
                        setValue('pressureWashingServices', services);
                      }}
                      checked={pressureWashingServices.includes('trex_deck')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="service-trex" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Trex/Composite Deck - ${PRESSURE_WASHING_RATES.TREX.rate}/sq ft
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="service-dumpster-corral"
                      onChange={(e) => {
                        const services = [...pressureWashingServices];
                        if (e.target.checked) {
                          services.push('dumpster_corral');
                        } else {
                          const index = services.indexOf('dumpster_corral');
                          if (index !== -1) services.splice(index, 1);
                        }
                        setPressureWashingServices(services);
                        setValue('pressureWashingServices', services);
                      }}
                      checked={pressureWashingServices.includes('dumpster_corral')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="service-dumpster-corral" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Dumpster Corral - ${PRESSURE_WASHING_RATES.DUMPSTER_CORRAL.rate}/sq ft
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="service-commercial"
                      onChange={(e) => {
                        const services = [...pressureWashingServices];
                        if (e.target.checked) {
                          services.push('commercial');
                        } else {
                          const index = services.indexOf('commercial');
                          if (index !== -1) services.splice(index, 1);
                        }
                        setPressureWashingServices(services);
                        setValue('pressureWashingServices', services);
                      }}
                      checked={pressureWashingServices.includes('commercial')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="service-commercial" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Commercial Areas - ${PRESSURE_WASHING_RATES.COMMERCIAL.rate}/sq ft
                    </label>
                  </div>
                </div>
              </div>

              {/* Square footage inputs for each selected service */}
              {pressureWashingServices.length > 0 && (
                <div className="mt-4 border-t border-gray-200 dark:border-gray-600 pt-3">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Enter Square Footage for Each Service:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pressureWashingServices.includes('soft_wash') && (
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                          Soft Wash Area (sq ft)
                        </label>
                        <input
                          type="number"
                          className="input-field"
                          placeholder="Enter area"
                          onChange={(e) => {
                            setValue('pressureWashingServiceAreas', {
                              ...(watch('pressureWashingServiceAreas') || {}),
                              soft_wash: parseFloat(e.target.value) || 0
                            });
                          }}
                          value={watch('pressureWashingServiceAreas')?.soft_wash || ''}
                          min={0}
                        />
                        {cleaningType !== 'pressure_washing_only' && (watch('pressureWashingServiceAreas')?.soft_wash || 0) < PRESSURE_WASHING_RATES.SOFT_WASH.minimum / PRESSURE_WASHING_RATES.SOFT_WASH.rate && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                            Note: Minimum charge of ${PRESSURE_WASHING_RATES.SOFT_WASH.minimum} applies
                          </p>
                        )}
                      </div>
                    )}
                    {pressureWashingServices.includes('roof_wash') && (
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                          Roof Area (sq ft)
                        </label>
                        <input
                          type="number"
                          className="input-field"
                          placeholder="Enter area"
                          onChange={(e) => {
                            setValue('pressureWashingServiceAreas', {
                              ...(watch('pressureWashingServiceAreas') || {}),
                              roof_wash: parseFloat(e.target.value) || 0
                            });
                          }}
                          value={watch('pressureWashingServiceAreas')?.roof_wash || ''}
                          min={0}
                        />
                      </div>
                    )}
                    {pressureWashingServices.includes('driveway') && (
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                          Driveway Area (sq ft)
                        </label>
                        <input
                          type="number"
                          className="input-field"
                          placeholder="Enter area"
                          onChange={(e) => {
                            setValue('pressureWashingServiceAreas', {
                              ...(watch('pressureWashingServiceAreas') || {}),
                              driveway: parseFloat(e.target.value) || 0
                            });
                          }}
                          value={watch('pressureWashingServiceAreas')?.driveway || ''}
                          min={0}
                        />
                      </div>
                    )}
                    {pressureWashingServices.includes('deck') && (
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                          Deck Area (sq ft)
                        </label>
                        <input
                          type="number"
                          className="input-field"
                          placeholder="Enter area"
                          onChange={(e) => {
                            setValue('pressureWashingServiceAreas', {
                              ...(watch('pressureWashingServiceAreas') || {}),
                              deck: parseFloat(e.target.value) || 0
                            });
                          }}
                          value={watch('pressureWashingServiceAreas')?.deck || ''}
                          min={0}
                        />
                      </div>
                    )}
                    {pressureWashingServices.includes('trex_deck') && (
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                          Trex/Composite Deck Area (sq ft)
                        </label>
                        <input
                          type="number"
                          className="input-field"
                          placeholder="Enter area"
                          onChange={(e) => {
                            setValue('pressureWashingServiceAreas', {
                              ...(watch('pressureWashingServiceAreas') || {}),
                              trex_deck: parseFloat(e.target.value) || 0
                            });
                          }}
                          value={watch('pressureWashingServiceAreas')?.trex_deck || ''}
                          min={0}
                        />
                      </div>
                    )}
                    {pressureWashingServices.includes('dumpster_corral') && (
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                          Dumpster Corral Area (sq ft)
                        </label>
                        <input
                          type="number"
                          className="input-field"
                          placeholder="Enter area"
                          onChange={(e) => {
                            setValue('pressureWashingServiceAreas', {
                              ...(watch('pressureWashingServiceAreas') || {}),
                              dumpster_corral: parseFloat(e.target.value) || 0
                            });
                          }}
                          value={watch('pressureWashingServiceAreas')?.dumpster_corral || ''}
                          min={0}
                        />
                        {cleaningType !== 'pressure_washing_only' && (watch('pressureWashingServiceAreas')?.dumpster_corral || 0) < PRESSURE_WASHING_RATES.DUMPSTER_CORRAL.minimum / PRESSURE_WASHING_RATES.DUMPSTER_CORRAL.rate && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                            Note: Minimum charge of ${PRESSURE_WASHING_RATES.DUMPSTER_CORRAL.minimum} applies
                          </p>
                        )}
                      </div>
                    )}
                    {pressureWashingServices.includes('commercial') && (
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                          Commercial Area (sq ft)
                        </label>
                        <input
                          type="number"
                          className="input-field"
                          placeholder="Enter area"
                          onChange={(e) => {
                            setValue('pressureWashingServiceAreas', {
                              ...(watch('pressureWashingServiceAreas') || {}),
                              commercial: parseFloat(e.target.value) || 0
                            });
                          }}
                          value={watch('pressureWashingServiceAreas')?.commercial || ''}
                          min={0}
                        />
                        {cleaningType !== 'pressure_washing_only' && (watch('pressureWashingServiceAreas')?.commercial || 0) < PRESSURE_WASHING_RATES.COMMERCIAL.minimum / PRESSURE_WASHING_RATES.COMMERCIAL.rate && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                            Note: Minimum charge of ${PRESSURE_WASHING_RATES.COMMERCIAL.minimum} applies
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Traditional total area input */}
              {pressureWashingServices.length === 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Area to Pressure Wash (sq ft)
                  </label>
                  <input
                    type="number"
                    {...register('pressureWashingArea', {
                      required: needsPressureWashing ? 'Area is required' : false,
                      min: {
                        value: cleaningType === 'pressure_washing_only' ? 1 : 100,
                        message: cleaningType === 'pressure_washing_only' ? 'Area must be positive' : 'Minimum area is 100 sq ft'
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

              {/* Display scopes of work for selected services */}
              {pressureWashingServices.length > 0 && (
                <div className="mt-4 border-t border-gray-200 dark:border-gray-600 pt-3">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Service Details:</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-4">
                    {pressureWashingServices.includes('soft_wash') && (
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                        <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Soft Wash</h5>
                        <p className="whitespace-pre-line text-xs">{PRESSURE_WASHING_SCOPE_OF_WORK.SOFT_WASH}</p>
                        <p className="text-xs mt-1 text-indigo-600 dark:text-indigo-400">Chemical: Bleach mixture (10:1 ratio with 4 oz soap)</p>
                      </div>
                    )}
                    
                    {pressureWashingServices.includes('roof_wash') && (
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                        <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Roof Wash</h5>
                        <p className="whitespace-pre-line text-xs">{PRESSURE_WASHING_SCOPE_OF_WORK.ROOF_WASH}</p>
                        <p className="text-xs mt-1 text-indigo-600 dark:text-indigo-400">Chemical: Bleach mixture (1:1 ratio with 8 oz soap)</p>
                      </div>
                    )}
                    
                    {pressureWashingServices.includes('driveway') && (
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                        <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Driveway</h5>
                        <p className="whitespace-pre-line text-xs">{PRESSURE_WASHING_SCOPE_OF_WORK.DRIVEWAY}</p>
                      </div>
                    )}
                    
                    {pressureWashingServices.includes('deck') && (
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                        <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Deck</h5>
                        <p className="whitespace-pre-line text-xs">{PRESSURE_WASHING_SCOPE_OF_WORK.DECK}</p>
                      </div>
                    )}
                    
                    {pressureWashingServices.includes('trex_deck') && (
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                        <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Trex/Composite Deck</h5>
                        <p className="whitespace-pre-line text-xs">{PRESSURE_WASHING_SCOPE_OF_WORK.TREX}</p>
                      </div>
                    )}
                    
                    {pressureWashingServices.includes('dumpster_corral') && (
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                        <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Dumpster Corral</h5>
                        <p className="whitespace-pre-line text-xs">{PRESSURE_WASHING_SCOPE_OF_WORK.DUMPSTER_CORRAL}</p>
                      </div>
                    )}
                    
                    {pressureWashingServices.includes('commercial') && (
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                        <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Commercial Areas</h5>
                        <p className="whitespace-pre-line text-xs">{PRESSURE_WASHING_SCOPE_OF_WORK.COMMERCIAL}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Add a warning if no services are selected for pressure washing only */}
              {cleaningType === 'pressure_washing_only' && (!pressureWashingServices.length || !pressureWashingServices.some(service => (watch('pressureWashingServiceAreas')?.[service] || 0) > 0)) && (
                <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-md">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    <strong>Important:</strong> Please select at least one pressure washing service and enter a square footage above.
                  </p>
                </div>
              )}
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
              disabled={cleaningType === 'window_cleaning_only'}
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

              <div className="flex items-center mt-3">
                <input
                  type="checkbox"
                  id="chargeForWindowCleaning"
                  {...register('chargeForWindowCleaning')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:border-slate-600"
                  disabled={cleaningType === 'window_cleaning_only'}
                />
                <label htmlFor="chargeForWindowCleaning" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Include window cleaning in quote cost (uncheck to note windows but not charge)
                </label>
              </div>

              {/* Add a warning if no windows are specified for window cleaning only */}
              {cleaningType === 'window_cleaning_only' && (Number(watch('numberOfWindows') || 0) + Number(watch('numberOfLargeWindows') || 0) + Number(watch('numberOfHighAccessWindows') || 0)) === 0 && (
                <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-md">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    <strong>Important:</strong> Please specify at least one window type and quantity above.
                  </p>
                </div>
              )}
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
      <button
        type="button"
        className="btn-secondary w-full py-2 mt-2 text-base"
        onClick={() => {
          // Clear localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY);
          }
          // Reset form to hardcoded defaults
          reset({
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
            chargeForWindowCleaning: false,
            numberOfWindows: 0,
            numberOfLargeWindows: 0,
            numberOfHighAccessWindows: 0,
            numberOfDisplayCases: 0,
            pressureWashingServices: [],
            pressureWashingServiceAreas: {},
          });
          setStayingOvernight(false);
          setUrgencyLevel(1);
          setNeedsPressureWashing(false);
          setNeedsWindowCleaning(false);
          setPressureWashingServices([]);
        }}
      >
        Clear Entries
      </button>
    </div>
  );
} 