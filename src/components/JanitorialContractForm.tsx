'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { ProjectType } from '@/lib/types';

interface JanitorialContractFormProps {
  onContractGenerated: (data: ContractData, formValues: JanitorialFormData) => void;
}

// Janitorial-specific form data
interface JanitorialFormData {
  // Basic Information
  facilityName: string;
  facilityAddress: string;
  city: string;
  state: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  
  // Building Details
  buildingType: ProjectType;
  measurementType: 'square_footage' | 'room_count';
  squareFootage?: number;
  roomCount?: number;
  bathroomCount: number;
  floorType: 'carpet' | 'hard_floor' | 'mixed';
  
  // Service Schedule
  serviceFrequency: 'daily' | 'weekly' | 'bi_weekly' | 'monthly';
  serviceDays: string[];
  serviceTime: 'morning' | 'afternoon' | 'evening' | 'overnight';
  
  // Contract Terms
  contractLength: 6 | 12 | 24 | 36;
  startDate: string;
  specialRequirements?: string;
}

// Contract output data
interface ContractData {
  monthlyRate: number;
  annualRate: number;
  pricePerSqFt?: number;
  pricePerRoom?: number;
  serviceScope: ServiceScope;
  schedule: ServiceSchedule;
  contractTerms: ContractTerms;
}

// Service scope definitions
interface ServiceScope {
  daily: string[];
  weekly: string[];
  monthly: string[];
  quarterly: string[];
}

interface ServiceSchedule {
  frequency: string;
  days: string[];
  time: string;
  estimatedHours: number;
}

interface ContractTerms {
  length: number;
  startDate: string;
  monthlyRate: number;
  annualDiscount: number;
  escalationClause: string;
}

// Janitorial service scopes by building type
const SERVICE_SCOPES: Record<ProjectType, ServiceScope> = {
  office: {
    daily: [
      'Empty all trash receptacles and replace liners',
      'Vacuum carpeted areas and sweep hard floors',
      'Dust and wipe down desks, tables, and surfaces',
      'Clean and sanitize restrooms (toilets, sinks, mirrors)',
      'Restock restroom supplies (toilet paper, soap, towels)',
      'Spot clean doors, light switches, and high-touch surfaces'
    ],
    weekly: [
      'Vacuum under and around furniture',
      'Mop all hard floor surfaces with disinfectant',
      'Clean interior glass and mirrors',
      'Dust baseboards and window sills',
      'Sanitize door handles and push plates',
      'Clean break room/kitchen areas (sink, counters, appliances)'
    ],
    monthly: [
      'Deep clean restrooms (scrub tiles, grout)',
      'Clean air vents and light fixtures',
      'Wash interior windows (accessible)',
      'Deep vacuum upholstered furniture',
      'Clean and organize supply closets'
    ],
    quarterly: [
      'Strip and wax hard floor surfaces',
      'Deep clean carpets (extraction or steam cleaning)',
      'Clean baseboards and moldings',
      'Detailed cleaning of HVAC vents',
      'Power wash exterior entryways'
    ]
  },
  medical: {
    daily: [
      'Empty medical waste and regular trash with proper protocols',
      'Disinfect all surfaces with hospital-grade cleaners',
      'Clean and sanitize patient rooms and examination areas',
      'Disinfect restrooms with medical-grade sanitizers',
      'Restock all supplies (gloves, masks, sanitizer)',
      'Follow OSHA bloodborne pathogen protocols'
    ],
    weekly: [
      'Deep disinfection of all high-touch surfaces',
      'Clean medical equipment surfaces (per manufacturer guidelines)',
      'Sanitize waiting areas and reception',
      'Clean interior glass with streak-free disinfectant',
      'Disinfect phones, keyboards, and office equipment'
    ],
    monthly: [
      'Deep clean and disinfect HVAC system components',
      'Sanitize storage areas and supply rooms',
      'Clean and disinfect light fixtures',
      'Deep clean patient restrooms and staff facilities'
    ],
    quarterly: [
      'Terminal cleaning of isolation rooms',
      'Deep disinfection of flooring (strip/wax with antimicrobial)',
      'Clean and sanitize air handling units',
      'Comprehensive infection control audit and cleaning'
    ]
  },
  restaurant: {
    daily: [
      'Clean and sanitize dining areas after each service',
      'Empty grease traps and food waste disposal',
      'Deep clean kitchen surfaces and equipment',
      'Sanitize restrooms and restock supplies',
      'Clean floors with degreasing agents',
      'Sanitize door handles and high-touch surfaces'
    ],
    weekly: [
      'Deep clean kitchen hood and exhaust systems',
      'Sanitize walk-in coolers and freezers',
      'Clean dining room furniture and fixtures',
      'Degrease kitchen floors and walls',
      'Clean interior windows and mirrors'
    ],
    monthly: [
      'Deep clean kitchen equipment (ovens, grills, fryers)',
      'Clean and sanitize storage areas',
      'Detail clean restrooms (tiles, grout)',
      'Clean air vents and replace filters'
    ],
    quarterly: [
      'Professional kitchen deep cleaning',
      'Strip and seal kitchen floors',
      'Deep clean dining room carpets/upholstery',
      'Pressure wash exterior dining areas'
    ]
  },
  retail: {
    daily: [
      'Sweep and vacuum customer areas',
      'Empty trash and replace liners',
      'Clean entrance doors and glass',
      'Sanitize restrooms and restock supplies',
      'Dust merchandise displays (carefully)',
      'Clean checkout areas and counters'
    ],
    weekly: [
      'Mop all hard floor surfaces',
      'Clean interior windows and displays',
      'Vacuum fitting rooms and detailed cleaning',
      'Dust shelving and merchandise (with permission)',
      'Clean break room and employee areas'
    ],
    monthly: [
      'Deep clean restrooms (tiles, fixtures)',
      'Clean air vents and light fixtures',
      'Detailed cleaning of storage areas',
      'Clean exterior entrance areas'
    ],
    quarterly: [
      'Strip and wax hard floors',
      'Deep clean carpeted areas',
      'Wash exterior windows and storefront',
      'Deep clean HVAC components'
    ]
  },
  // Add default scope for other building types
  fast_food: {
    daily: ['Basic daily cleaning tasks', 'Kitchen sanitization', 'Restroom maintenance'],
    weekly: ['Deep clean kitchen areas', 'Dining area maintenance', 'Floor care'],
    monthly: ['Equipment deep cleaning', 'Storage area organization'],
    quarterly: ['Professional deep cleaning', 'Floor refinishing']
  },
  industrial: {
    daily: ['Basic daily cleaning tasks', 'Safety area maintenance', 'Restroom care'],
    weekly: ['Equipment area cleaning', 'Office space maintenance', 'Floor care'],
    monthly: ['Deep facility cleaning', 'Storage area organization'],
    quarterly: ['Professional deep cleaning', 'Floor treatments']
  },
  educational: {
    daily: ['Classroom cleaning', 'Hallway maintenance', 'Restroom care'],
    weekly: ['Deep classroom cleaning', 'Common area maintenance', 'Floor care'],
    monthly: ['Deep facility cleaning', 'Storage area organization'],
    quarterly: ['Professional deep cleaning', 'Floor refinishing']
  },
  hotel: {
    daily: ['Room cleaning', 'Common area maintenance', 'Restroom care'],
    weekly: ['Deep room cleaning', 'Lobby maintenance', 'Floor care'],
    monthly: ['Deep facility cleaning', 'Storage area organization'],
    quarterly: ['Professional deep cleaning', 'Carpet cleaning']
  },
  jewelry_store: {
    daily: ['Display cleaning', 'Security area maintenance', 'Restroom care'],
    weekly: ['Deep display cleaning', 'Customer area maintenance', 'Floor care'],
    monthly: ['Deep facility cleaning', 'Storage area organization'],
    quarterly: ['Professional deep cleaning', 'Security area deep clean']
  },
  grocery_store: {
    daily: ['Aisle cleaning', 'Checkout area maintenance', 'Restroom care'],
    weekly: ['Deep aisle cleaning', 'Storage area maintenance', 'Floor care'],
    monthly: ['Deep facility cleaning', 'Cooler area organization'],
    quarterly: ['Professional deep cleaning', 'Floor refinishing']
  },
  yoga_studio: {
    daily: ['Studio cleaning', 'Equipment sanitization', 'Restroom care'],
    weekly: ['Deep studio cleaning', 'Reception area maintenance', 'Floor care'],
    monthly: ['Deep facility cleaning', 'Storage area organization'],
    quarterly: ['Professional deep cleaning', 'Floor refinishing']
  },
  kids_fitness: {
    daily: ['Play area sanitization', 'Equipment cleaning', 'Restroom care'],
    weekly: ['Deep play area cleaning', 'Common area maintenance', 'Floor care'],
    monthly: ['Deep facility cleaning', 'Storage area organization'],
    quarterly: ['Professional deep cleaning', 'Safety equipment inspection']
  },
  bakery: {
    daily: ['Kitchen sanitization', 'Display area cleaning', 'Restroom care'],
    weekly: ['Deep kitchen cleaning', 'Customer area maintenance', 'Floor care'],
    monthly: ['Equipment deep cleaning', 'Storage area organization'],
    quarterly: ['Professional deep cleaning', 'Floor refinishing']
  },
  interactive_toy_store: {
    daily: ['Play area sanitization', 'Display cleaning', 'Restroom care'],
    weekly: ['Deep play area cleaning', 'Customer area maintenance', 'Floor care'],
    monthly: ['Deep facility cleaning', 'Storage area organization'],
    quarterly: ['Professional deep cleaning', 'Safety area inspection']
  },
  church: {
    daily: ['Sanctuary maintenance', 'Common area cleaning', 'Restroom care'],
    weekly: ['Deep sanctuary cleaning', 'Fellowship area maintenance', 'Floor care'],
    monthly: ['Deep facility cleaning', 'Storage area organization'],
    quarterly: ['Professional deep cleaning', 'Pew and fixture care']
  },
  arcade: {
    daily: ['Game area cleaning', 'High-touch sanitization', 'Restroom care'],
    weekly: ['Deep game area cleaning', 'Common area maintenance', 'Floor care'],
    monthly: ['Deep facility cleaning', 'Storage area organization'],
    quarterly: ['Professional deep cleaning', 'Equipment area deep clean']
  },
  other: {
    daily: ['Basic daily cleaning tasks', 'High-touch sanitization', 'Restroom care'],
    weekly: ['Deep area cleaning', 'Common area maintenance', 'Floor care'],
    monthly: ['Deep facility cleaning', 'Storage area organization'],
    quarterly: ['Professional deep cleaning', 'Floor treatments']
  }
};

// Pricing rates per square foot (monthly)
const MONTHLY_RATES_PER_SQFT: Record<ProjectType, number> = {
  office: 0.85,
  medical: 1.50,
  restaurant: 2.25,
  retail: 0.95,
  fast_food: 2.00,
  industrial: 0.75,
  educational: 0.80,
  hotel: 1.75,
  jewelry_store: 1.25,
  grocery_store: 1.10,
  yoga_studio: 0.90,
  kids_fitness: 1.00,
  bakery: 1.80,
  interactive_toy_store: 1.15,
  church: 0.70,
  arcade: 1.05,
  other: 0.85
};

// Pricing rates per room (monthly)
const MONTHLY_RATES_PER_ROOM: Record<ProjectType, number> = {
  office: 125,
  medical: 225,
  restaurant: 350,
  retail: 150,
  fast_food: 300,
  industrial: 110,
  educational: 120,
  hotel: 275,
  jewelry_store: 175,
  grocery_store: 165,
  yoga_studio: 135,
  kids_fitness: 145,
  bakery: 280,
  interactive_toy_store: 170,
  church: 100,
  arcade: 155,
  other: 125
};

// Bathroom pricing (additional monthly cost per bathroom)
const BATHROOM_RATE = 45;

// Storage key for saving contract form data
const CONTRACT_STORAGE_KEY = 'estimaitor_contract_form_data';

export default function JanitorialContractForm({ onContractGenerated }: JanitorialContractFormProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Get saved form data from localStorage
  const getSavedFormData = useCallback((): Partial<JanitorialFormData> => {
    if (typeof window === 'undefined') return {};
    
    try {
      const savedData = localStorage.getItem(CONTRACT_STORAGE_KEY);
      return savedData ? JSON.parse(savedData) : {};
    } catch (error) {
      console.error('Error loading saved contract form data:', error);
      return {};
    }
  }, []);

  // Default values
  const defaultValues = useMemo(() => ({
    facilityName: '',
    facilityAddress: '',
    city: '',
    state: 'NC',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    buildingType: 'office' as ProjectType,
    measurementType: 'square_footage' as 'square_footage' | 'room_count',
    squareFootage: 5000,
    roomCount: 15,
    bathroomCount: 2,
    floorType: 'mixed' as 'carpet' | 'hard_floor' | 'mixed',
    serviceFrequency: 'weekly' as 'daily' | 'weekly' | 'bi_weekly' | 'monthly',
    serviceDays: ['monday', 'wednesday', 'friday'],
    serviceTime: 'evening' as 'morning' | 'afternoon' | 'evening' | 'overnight',
    contractLength: 12 as 6 | 12 | 24 | 36,
    startDate: new Date().toISOString().split('T')[0],
    specialRequirements: '',
    ...getSavedFormData()
  }), [getSavedFormData]);

  // Initialize form
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<JanitorialFormData>({
    defaultValues
  });

  // Watch form values
  const formValues = watch();
  const { buildingType, measurementType, squareFootage, roomCount, bathroomCount, serviceFrequency } = formValues;

  // Load saved form data on component mount
  useEffect(() => {
    const savedData = getSavedFormData();
    if (Object.keys(savedData).length > 0) {
      reset(savedData as JanitorialFormData);
    }
    setIsLoaded(true);
  }, [getSavedFormData, reset]);

  // Save form data to localStorage when it changes
  useEffect(() => {
    if (!isLoaded) return;
    
    try {
      localStorage.setItem(CONTRACT_STORAGE_KEY, JSON.stringify(formValues));
    } catch (error) {
      console.error('Error saving contract form data:', error);
    }
  }, [formValues, isLoaded]);

  // Calculate contract pricing
  const calculateContractPricing = useCallback((data: JanitorialFormData): ContractData => {
    const baseMonthlyRate = data.measurementType === 'square_footage' 
      ? (data.squareFootage || 0) * MONTHLY_RATES_PER_SQFT[data.buildingType]
      : (data.roomCount || 0) * MONTHLY_RATES_PER_ROOM[data.buildingType];
    
    const bathroomCost = data.bathroomCount * BATHROOM_RATE;
    
    // Frequency multipliers
    const frequencyMultipliers = {
      daily: 4.5,
      weekly: 1.0,
      bi_weekly: 0.6,
      monthly: 0.3
    };
    
    const monthlyRate = (baseMonthlyRate + bathroomCost) * frequencyMultipliers[data.serviceFrequency];
    const annualRate = monthlyRate * 12;
    
    // Contract length discounts
    const lengthDiscounts = { 6: 0, 12: 0.05, 24: 0.10, 36: 0.15 };
    const discountedAnnualRate = annualRate * (1 - lengthDiscounts[data.contractLength]);
    
    return {
      monthlyRate: Math.round(monthlyRate * 100) / 100,
      annualRate: Math.round(discountedAnnualRate * 100) / 100,
      pricePerSqFt: data.measurementType === 'square_footage' ? monthlyRate / (data.squareFootage || 1) : undefined,
      pricePerRoom: data.measurementType === 'room_count' ? monthlyRate / (data.roomCount || 1) : undefined,
      serviceScope: SERVICE_SCOPES[data.buildingType],
      schedule: {
        frequency: data.serviceFrequency,
        days: data.serviceDays,
        time: data.serviceTime,
        estimatedHours: Math.ceil((baseMonthlyRate / 125) * frequencyMultipliers[data.serviceFrequency])
      },
      contractTerms: {
        length: data.contractLength,
        startDate: data.startDate,
        monthlyRate: Math.round(monthlyRate * 100) / 100,
        annualDiscount: lengthDiscounts[data.contractLength] * 100,
        escalationClause: `3% annual increase effective on contract anniversary date`
      }
    };
  }, []);

  // Form submission handler
  const onSubmit: SubmitHandler<JanitorialFormData> = useCallback((data) => {
    const contractData = calculateContractPricing(data);
    onContractGenerated(contractData, data);
  }, [onContractGenerated, calculateContractPricing]);

  // Get current pricing preview
  const pricingPreview = useMemo(() => 
    calculateContractPricing(formValues), 
    [formValues, calculateContractPricing]
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
        Janitorial Contract Generator
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Facility Information */}
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
          <h3 className="text-lg font-semibold mb-4 text-purple-800 dark:text-purple-200">📋 Facility Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="facilityName" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Facility Name *
              </label>
              <input
                id="facilityName"
                type="text"
                {...register('facilityName', { required: 'Facility name is required' })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter facility name"
              />
              {errors.facilityName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.facilityName.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="contactName" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Contact Name *
              </label>
              <input
                id="contactName"
                type="text"
                {...register('contactName', { required: 'Contact name is required' })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                placeholder="Primary contact name"
              />
              {errors.contactName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.contactName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label htmlFor="facilityAddress" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Address *
              </label>
              <input
                id="facilityAddress"
                type="text"
                {...register('facilityAddress', { required: 'Address is required' })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                placeholder="Street address"
              />
              {errors.facilityAddress && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.facilityAddress.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="city" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                City *
              </label>
              <input
                id="city"
                type="text"
                {...register('city', { required: 'City is required' })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                placeholder="City"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.city.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="state" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                State *
              </label>
              <select
                id="state"
                {...register('state', { required: 'State is required' })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              >
                <option value="NC">North Carolina (Home Base)</option>
                <option value="SC">South Carolina</option>
                <option value="VA">Virginia</option>
                <option value="TN">Tennessee</option>
                <option value="GA">Georgia</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.state && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.state.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Email *
              </label>
              <input
                id="contactEmail"
                type="email"
                {...register('contactEmail', { 
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                placeholder="contact@company.com"
              />
              {errors.contactEmail && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.contactEmail.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Phone *
              </label>
              <input
                id="contactPhone"
                type="tel"
                {...register('contactPhone', { required: 'Phone number is required' })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                placeholder="(555) 123-4567"
              />
              {errors.contactPhone && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.contactPhone.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Building Details */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <h3 className="text-lg font-semibold mb-4 text-blue-800 dark:text-blue-200">🏢 Building Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="buildingType" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Building Type *
              </label>
              <select
                id="buildingType"
                {...register('buildingType', { required: 'Building type is required' })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              >
                <option value="office">Office Building</option>
                <option value="medical">Medical Facility</option>
                <option value="restaurant">Restaurant</option>
                <option value="retail">Retail Store</option>
                <option value="educational">Educational Facility</option>
                <option value="industrial">Industrial/Warehouse</option>
                <option value="hotel">Hotel</option>
                <option value="other">Other</option>
              </select>
              {errors.buildingType && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.buildingType.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="measurementType" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Measurement Method *
              </label>
              <select
                id="measurementType"
                {...register('measurementType', { required: 'Measurement type is required' })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              >
                <option value="square_footage">Square Footage</option>
                <option value="room_count">Room Count</option>
              </select>
            </div>
          </div>

          {measurementType === 'square_footage' ? (
            <div className="mt-4">
              <label htmlFor="squareFootage" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Total Square Footage *
              </label>
              <input
                id="squareFootage"
                type="number"
                min="100"
                max="1000000"
                {...register('squareFootage', { 
                  required: measurementType === 'square_footage' ? 'Square footage is required' : false,
                  min: { value: 100, message: 'Minimum 100 sq ft' },
                  max: { value: 1000000, message: 'Maximum 1,000,000 sq ft' }
                })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter total square footage"
              />
              {errors.squareFootage && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.squareFootage.message}</p>
              )}
            </div>
          ) : (
            <div className="mt-4">
              <label htmlFor="roomCount" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Number of Rooms *
              </label>
              <input
                id="roomCount"
                type="number"
                min="1"
                max="500"
                {...register('roomCount', { 
                  required: measurementType === 'room_count' ? 'Room count is required' : false,
                  min: { value: 1, message: 'Minimum 1 room' },
                  max: { value: 500, message: 'Maximum 500 rooms' }
                })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter number of rooms"
              />
              {errors.roomCount && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.roomCount.message}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="bathroomCount" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Number of Bathrooms *
              </label>
              <input
                id="bathroomCount"
                type="number"
                min="0"
                max="50"
                {...register('bathroomCount', { 
                  required: 'Bathroom count is required',
                  min: { value: 0, message: 'Cannot be negative' },
                  max: { value: 50, message: 'Maximum 50 bathrooms' }
                })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                placeholder="Number of bathrooms"
              />
              {errors.bathroomCount && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bathroomCount.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="floorType" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Primary Floor Type
              </label>
              <select
                id="floorType"
                {...register('floorType')}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              >
                <option value="mixed">Mixed (Carpet & Hard)</option>
                <option value="carpet">Primarily Carpet</option>
                <option value="hard_floor">Primarily Hard Floor</option>
              </select>
            </div>
          </div>
        </div>

        {/* Service Schedule */}
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
          <h3 className="text-lg font-semibold mb-4 text-green-800 dark:text-green-200">📅 Service Schedule</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="serviceFrequency" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Service Frequency *
              </label>
              <select
                id="serviceFrequency"
                {...register('serviceFrequency', { required: 'Service frequency is required' })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              >
                <option value="daily">Daily (5 days/week)</option>
                <option value="weekly">Weekly</option>
                <option value="bi_weekly">Bi-Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              {errors.serviceFrequency && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.serviceFrequency.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="serviceTime" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Preferred Service Time
              </label>
              <select
                id="serviceTime"
                {...register('serviceTime')}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              >
                <option value="morning">Morning (6 AM - 12 PM)</option>
                <option value="afternoon">Afternoon (12 PM - 6 PM)</option>
                <option value="evening">Evening (6 PM - 10 PM)</option>
                <option value="overnight">Overnight (10 PM - 6 AM)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contract Terms */}
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
          <h3 className="text-lg font-semibold mb-4 text-orange-800 dark:text-orange-200">📄 Contract Terms</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contractLength" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Contract Length *
              </label>
              <select
                id="contractLength"
                {...register('contractLength', { required: 'Contract length is required' })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              >
                <option value={6}>6 Months (No discount)</option>
                <option value={12}>12 Months (5% discount)</option>
                <option value={24}>24 Months (10% discount)</option>
                <option value={36}>36 Months (15% discount)</option>
              </select>
              {errors.contractLength && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.contractLength.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Proposed Start Date *
              </label>
              <input
                id="startDate"
                type="date"
                {...register('startDate', { required: 'Start date is required' })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.startDate.message}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="specialRequirements" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Special Requirements (Optional)
            </label>
            <textarea
              id="specialRequirements"
              rows={3}
              {...register('specialRequirements')}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              placeholder="Any special cleaning requirements, restrictions, or notes..."
            />
          </div>
        </div>

        {/* Pricing Preview */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-700">
          <h3 className="text-lg font-semibold mb-4 text-indigo-800 dark:text-indigo-200">💰 Pricing Preview</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">Monthly Rate</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                ${pricingPreview.monthlyRate.toLocaleString()}
              </p>
              {pricingPreview.pricePerSqFt && (
                <p className="text-xs text-gray-500">${pricingPreview.pricePerSqFt.toFixed(2)}/sq ft</p>
              )}
              {pricingPreview.pricePerRoom && (
                <p className="text-xs text-gray-500">${pricingPreview.pricePerRoom.toFixed(2)}/room</p>
              )}
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">Annual Rate</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${pricingPreview.annualRate.toLocaleString()}
              </p>
              {pricingPreview.contractTerms.annualDiscount > 0 && (
                <p className="text-xs text-green-600">{pricingPreview.contractTerms.annualDiscount}% contract discount applied</p>
              )}
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">Service Hours</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {pricingPreview.schedule.estimatedHours}
              </p>
              <p className="text-xs text-gray-500">hours per {serviceFrequency === 'daily' ? 'week' : serviceFrequency}</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-3 px-6 rounded-md hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200 font-medium text-lg"
        >
          Generate Janitorial Contract
        </button>
      </form>
    </div>
  );
} 