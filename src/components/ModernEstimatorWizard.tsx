'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormData, ProjectType, CleaningType } from '@/lib/types';
import { Camera, ArrowRight, ArrowLeft, CheckCircle, MapPin, Clock, Users, DollarSign } from 'lucide-react';

interface ModernEstimatorWizardProps {
  onEstimateCalculated: (data: any, formValues: FormData) => void;
}

// Step definitions
const STEPS = [
  { id: 'welcome', title: 'Welcome', icon: '👋' },
  { id: 'project-type', title: 'Project Type', icon: '🏢' },
  { id: 'space-details', title: 'Space Details', icon: '📐' },
  { id: 'cleaning-level', title: 'Cleaning Level', icon: '✨' },
  { id: 'additional-details', title: 'Additional Details', icon: '🔧' },
  { id: 'photos', title: 'Photos', icon: '📸' },
  { id: 'contact', title: 'Contact Info', icon: '📞' },
  { id: 'review', title: 'Review', icon: '✅' }
];

// Project types with descriptions and visual indicators
const PROJECT_TYPES = [
  { 
    value: 'office' as ProjectType, 
    label: 'Office Building', 
    icon: '🏢', 
    description: 'Corporate offices, coworking spaces',
    baseRate: 0.15 
  },
  { 
    value: 'medical' as ProjectType, 
    label: 'Medical Facility', 
    icon: '🏥', 
    description: 'Hospitals, clinics, dental offices',
    baseRate: 0.25 
  },
  { 
    value: 'restaurant' as ProjectType, 
    label: 'Restaurant', 
    icon: '🍽️', 
    description: 'Restaurants, cafes, food courts',
    baseRate: 0.20 
  },
  { 
    value: 'retail' as ProjectType, 
    label: 'Retail Store', 
    icon: '🛍️', 
    description: 'Shops, boutiques, showrooms',
    baseRate: 0.18 
  },
  { 
    value: 'industrial' as ProjectType, 
    label: 'Industrial', 
    icon: '🏭', 
    description: 'Warehouses, factories, plants',
    baseRate: 0.12 
  },
  { 
    value: 'educational' as ProjectType, 
    label: 'Educational', 
    icon: '🎓', 
    description: 'Schools, universities, training centers',
    baseRate: 0.16 
  },
  { 
    value: 'home_renovation' as ProjectType, 
    label: 'Home Renovation', 
    icon: '🏠', 
    description: 'Post-construction cleaning, residential renovation cleanup',
    baseRate: 0.25 
  },
  { 
    value: 'building_shell' as ProjectType, 
    label: 'Building Shell', 
    icon: '🏗️', 
    description: 'Commercial construction cleanup, pre-tenant build-out',
    baseRate: 0.20 
  }
];

const CLEANING_LEVELS = [
  {
    value: 'rough' as CleaningType,
    label: 'Rough Clean',
    icon: '🧹',
    description: 'Basic debris removal, dust control',
    multiplier: 1.0,
    tasks: ['Remove construction debris', 'Basic dusting', 'Sweep floors']
  },
  {
    value: 'final' as CleaningType,
    label: 'Final Clean',
    icon: '✨',
    description: 'Detailed cleaning, move-in ready',
    multiplier: 1.5,
    tasks: ['Deep cleaning', 'Window cleaning', 'Floor finishing', 'Detail work']
  },
  {
    value: 'powder_puff' as CleaningType,
    label: 'Powder Puff',
    icon: '💫',
    description: 'Touch-up cleaning, final inspection prep',
    multiplier: 0.75,
    tasks: ['Light touch-ups', 'Final inspection prep', 'Minor detail work']
  }
];

export default function ModernEstimatorWizard({ onEstimateCalculated }: ModernEstimatorWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<FormData>>({
    squareFootage: 5000,
    distanceFromOffice: 20,
    gasPrice: 3.50,
    numberOfCleaners: 3,
    urgencyLevel: 1
  });
  const [estimatePreview, setEstimatePreview] = useState<number | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);

  // Calculate real-time estimate preview
  const calculateEstimate = useCallback(() => {
    if (!formData.projectType || !formData.cleaningType || !formData.squareFootage) return null;
    
    const projectType = PROJECT_TYPES.find(p => p.value === formData.projectType);
    const cleaningLevel = CLEANING_LEVELS.find(c => c.value === formData.cleaningType);
    
    if (!projectType || !cleaningLevel) return null;
    
    const baseEstimate = formData.squareFootage * projectType.baseRate * cleaningLevel.multiplier;
    return Math.round(baseEstimate * 1.3); // 30% markup
  }, [formData]);

  useEffect(() => {
    setEstimatePreview(calculateEstimate());
  }, [calculateEstimate]);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🏗️</div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
              Welcome to EstimAItor
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Get an instant, AI-powered estimate for your post-construction cleaning project
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 This should take about 3-4 minutes. We'll ask you some simple questions about your project.
              </p>
            </div>
          </div>
        );

      case 'project-type':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                What type of space needs cleaning?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Different spaces have different cleaning requirements
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PROJECT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => updateFormData({ projectType: type.value })}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-lg ${
                    formData.projectType === type.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{type.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                        {type.label}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {type.description}
                      </p>
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                        Base rate: ${type.baseRate}/sq ft
                      </div>
                    </div>
                    {formData.projectType === type.value && (
                      <CheckCircle className="w-6 h-6 text-blue-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'space-details':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Tell us about the space
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                We need some measurements to calculate your estimate
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg">
                <label className="block text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                  <MapPin className="inline w-5 h-5 mr-2" />
                  Total Square Footage
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="500"
                    max="50000"
                    step="500"
                    value={formData.squareFootage || 5000}
                    onChange={(e) => updateFormData({ squareFootage: parseInt(e.target.value) })}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border min-w-[120px] text-center">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formData.squareFootage?.toLocaleString()}
                    </span>
                    <div className="text-xs text-gray-500">sq ft</div>
                  </div>
                </div>
              </div>

              {estimatePreview && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <DollarSign className="inline w-5 h-5 mr-2 text-green-600" />
                      <span className="text-green-800 dark:text-green-200 font-medium">
                        Estimated Cost
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ${estimatePreview.toLocaleString()}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        );

      case 'cleaning-level':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                What level of cleaning do you need?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Choose the cleaning level that matches your requirements
              </p>
            </div>
            
            <div className="space-y-4">
              {CLEANING_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => updateFormData({ cleaningType: level.value })}
                  className={`w-full p-6 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-lg ${
                    formData.cleaningType === level.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="text-3xl">{level.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                          {level.label}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {level.description}
                        </p>
                        <div className="mt-3">
                          <div className="text-sm text-gray-500 mb-2">Includes:</div>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            {level.tasks.map((task, index) => (
                              <li key={index} className="flex items-center">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                                {task}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {formData.cleaningType === level.value && (
                        <CheckCircle className="w-6 h-6 text-blue-500 mb-2" />
                      )}
                      <div className="text-sm text-blue-600 dark:text-blue-400">
                        {level.multiplier}x rate
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'photos':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Add photos (optional)
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Photos help us provide more accurate recommendations
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                Tap to add photos of the space
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
              >
                <Camera className="w-5 h-5 mr-2" />
                Choose Photos
              </label>
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      // Add other steps here...
      default:
        return <div>Step not implemented yet</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-500">
            Step {currentStep + 1} of {STEPS.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(((currentStep + 1) / STEPS.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-blue-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Current Step Icon */}
      <div className="text-center mb-8">
        <div className="inline-block text-4xl mb-2">
          {STEPS[currentStep].icon}
        </div>
        <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">
          {STEPS[currentStep].title}
        </h3>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 mb-8"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
            currentStep === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        {estimatePreview && currentStep > 1 && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <DollarSign className="w-4 h-4" />
            <span>Current estimate: ${estimatePreview.toLocaleString()}</span>
          </div>
        )}

        <button
          onClick={nextStep}
          disabled={currentStep === STEPS.length - 1}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
}