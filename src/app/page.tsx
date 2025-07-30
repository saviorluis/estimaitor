'use client';

import { useState, useEffect } from 'react';
import EstimatorForm from '@/components/EstimatorForm';
import SimpleEstimatorForm from '@/components/SimpleEstimatorForm';
import JanitorialContractForm from '@/components/JanitorialContractForm';
import EstimateResult from '@/components/EstimateResult';
import AdminThemeMenu from '@/components/AdminThemeMenu';
import { EstimateData, FormData } from '@/lib/types';

// Storage keys for saved data
const ESTIMATE_STORAGE_KEY = 'estimaitor_estimate_data';
const FORM_STORAGE_KEY = 'estimaitor_saved_form_data';
const PAST_ENTRIES_KEY = 'estimaitor_past_entries';
const APP_MODE_KEY = 'estimaitor_app_mode';

// Type for past entries
interface PastEntry {
  id: string;
  date: string;
  clientName: string;
  projectName: string;
  projectType: string;
  squareFootage: number;
  totalPrice: number;
  estimateData: EstimateData;
  formData: FormData;
}

// Types for contract data (imported from JanitorialContractForm)
interface ContractData {
  monthlyRate: number;
  annualRate: number;
  pricePerSqFt?: number;
  pricePerRoom?: number;
  serviceScope: any;
  schedule: any;
  contractTerms: any;
}

interface JanitorialFormData {
  facilityName: string;
  facilityAddress: string;
  city: string;
  state: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  buildingType: any;
  measurementType: 'square_footage' | 'room_count';
  squareFootage?: number;
  roomCount?: number;
  bathroomCount: number;
  floorType: 'carpet' | 'hard_floor' | 'mixed';
  serviceFrequency: 'daily' | 'weekly' | 'bi_weekly' | 'monthly';
  serviceDays: string[];
  serviceTime: 'morning' | 'afternoon' | 'evening' | 'overnight';
  contractLength: 6 | 12 | 24 | 36;
  startDate: string;
  specialRequirements?: string;
}

// App modes
export type AppMode = 'pro' | 'simple' | 'contract';

interface ModeConfig {
  title: string;
  subtitle: string;
  description: string;
  color: string;
  features: string[];
}

const MODE_CONFIGS: Record<AppMode, ModeConfig> = {
  pro: {
    title: 'Professional Mode',
    subtitle: 'Complete Commercial Cleaning Estimator',
    description: 'Full-featured calculator with detailed cost breakdowns, markup controls, and professional quote generation.',
    color: 'from-indigo-600 to-indigo-800',
    features: ['Detailed cost breakdowns', 'Markup controls', 'AI recommendations', 'Professional quotes', 'All calculation options']
  },
  simple: {
    title: 'Simple Reference Mode',
    subtitle: 'Quick Price Estimates & Budget Planning',
    description: 'Streamlined calculator with just 4 essential fields: project type, cleaning type, square footage, and location. Automatic location-based pricing included.',
    color: 'from-green-600 to-green-800',
    features: ['4 simple fields', 'Location-based pricing', 'Auto calculations', 'Instant estimates', 'Customer-friendly']
  },
  contract: {
    title: 'Janitorial Contract Generator',
    subtitle: 'Recurring Service Contract Creation',
    description: 'Specialized tool for creating ongoing janitorial service contracts with recurring pricing, service schedules, and maintenance agreements.',
    color: 'from-purple-600 to-purple-800',
    features: ['Contract templates', 'Recurring schedules', 'Service level agreements', 'Maintenance contracts', 'Annual pricing']
  }
};

import Image from 'next/image';

export default function Home() {
  const [estimateData, setEstimateData] = useState<EstimateData | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [janitorialFormData, setJanitorialFormData] = useState<JanitorialFormData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [pastEntries, setPastEntries] = useState<PastEntry[]>([]);
  const [showPastEntries, setShowPastEntries] = useState(false);
  const [currentMode, setCurrentMode] = useState<AppMode>('pro');
  const [showAdminThemeMenu, setShowAdminThemeMenu] = useState(false);

  // Load saved data on initial render
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    try {
      const savedEstimate = localStorage.getItem(ESTIMATE_STORAGE_KEY);
      const savedForm = localStorage.getItem(FORM_STORAGE_KEY);
      const savedEntries = localStorage.getItem(PAST_ENTRIES_KEY);
      const savedMode = localStorage.getItem(APP_MODE_KEY) as AppMode;
      
      if (savedEstimate && savedForm) {
        setEstimateData(JSON.parse(savedEstimate));
        setFormData(JSON.parse(savedForm));
      }
      
      if (savedEntries) {
        setPastEntries(JSON.parse(savedEntries));
      }

      if (savedMode && ['pro', 'simple', 'contract'].includes(savedMode)) {
        setCurrentMode(savedMode);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
    
    setIsLoaded(true);
  }, []);

  // Save mode when it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(APP_MODE_KEY, currentMode);
    }
  }, [currentMode, isLoaded]);

  const handleEstimateCalculated = (data: EstimateData, formValues: FormData) => {
    setEstimateData(data);
    setFormData(formValues);
    
    // Save to past entries
    const newEntry: PastEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      clientName: formValues.clientName || 'Unnamed Client',
      projectName: formValues.projectName || 'Unnamed Project',
      projectType: formValues.projectType,
      squareFootage: formValues.squareFootage,
      totalPrice: data.totalPrice,
      estimateData: data,
      formData: formValues
    };
    
    const updatedEntries = [newEntry, ...pastEntries].slice(0, 20); // Keep only the 20 most recent entries
    setPastEntries(updatedEntries);
    localStorage.setItem(PAST_ENTRIES_KEY, JSON.stringify(updatedEntries));
  };

  const handleContractGenerated = (data: ContractData, formValues: JanitorialFormData) => {
    setContractData(data);
    setJanitorialFormData(formValues);
  };

  // Function to clear saved data
  const handleClearSavedData = () => {
    localStorage.removeItem(ESTIMATE_STORAGE_KEY);
    localStorage.removeItem(FORM_STORAGE_KEY);
    localStorage.removeItem('estimaitor_form_data');
    localStorage.removeItem('estimaitor_simple_form_data');
    localStorage.removeItem('estimaitor_contract_form_data');
    setEstimateData(null);
    setFormData(null);
    setContractData(null);
    setJanitorialFormData(null);
    window.location.reload();
  };
  
  // Function to load a past entry
  const handleLoadPastEntry = (entry: PastEntry) => {
    setEstimateData(entry.estimateData);
    setFormData(entry.formData);
    localStorage.setItem(ESTIMATE_STORAGE_KEY, JSON.stringify(entry.estimateData));
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(entry.formData));
    setShowPastEntries(false);
  };
  
  // Function to delete a past entry
  const handleDeletePastEntry = (id: string) => {
    const updatedEntries = pastEntries.filter(entry => entry.id !== id);
    setPastEntries(updatedEntries);
    localStorage.setItem(PAST_ENTRIES_KEY, JSON.stringify(updatedEntries));
  };

  // Function to switch modes
  const handleModeSwitch = (mode: AppMode) => {
    setCurrentMode(mode);
    // Clear current data when switching modes
    setEstimateData(null);
    setFormData(null);
    setContractData(null);
    setJanitorialFormData(null);
  };

  const currentConfig = MODE_CONFIGS[currentMode];

  // Add a loading state to prevent rendering until data is loaded
  if (!isLoaded) {
    return (
      <main className="flex flex-col min-h-screen">
        <header className="py-8 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-xl shadow-lg mb-8">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">EstimAItor</h1>
            <p className="text-xl text-indigo-100">
              AI Commercial Cleaning Estimator for Construction Projects
            </p>
          </div>
        </header>
        <div className="container mx-auto px-4 flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">Loading application...</p>
            <div className="animate-pulse w-16 h-16 mx-auto rounded-full bg-indigo-400"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen">
      <header className={`py-8 bg-gradient-to-r ${currentConfig.color} text-white rounded-xl shadow-lg mb-8`}>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">EstimAItor</h1>
          <p className="text-xl opacity-90 mb-2">
            {currentConfig.subtitle}
          </p>
          <p className="text-sm opacity-75 max-w-2xl mx-auto">
            {currentConfig.description}
          </p>
          <div className="mt-4 flex justify-center space-x-4">
            {pastEntries.length > 0 && currentMode === 'pro' && (
              <button
                onClick={() => setShowPastEntries(!showPastEntries)}
                className="text-sm text-white bg-black bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded transition-colors"
              >
                {showPastEntries ? 'Hide Past Entries' : 'Show Past Entries'} ({pastEntries.length})
              </button>
            )}
            {(estimateData || formData || contractData || janitorialFormData) && (
              <button
                onClick={handleClearSavedData}
                className="text-sm text-white bg-black bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded transition-colors"
              >
                Clear Current Data
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 mb-12">
        {/* Past Entries Section - Only show in Pro mode */}
        {showPastEntries && currentMode === 'pro' && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white border-b pb-2">Past Estimates</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="py-2 px-4 text-left">Date</th>
                    <th className="py-2 px-4 text-left">Client</th>
                    <th className="py-2 px-4 text-left">Project</th>
                    <th className="py-2 px-4 text-left">Type</th>
                    <th className="py-2 px-4 text-right">Square Footage</th>
                    <th className="py-2 px-4 text-right">Total</th>
                    <th className="py-2 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pastEntries.map((entry) => (
                    <tr key={entry.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="py-2 px-4">{entry.date}</td>
                      <td className="py-2 px-4">{entry.clientName}</td>
                      <td className="py-2 px-4">{entry.projectName}</td>
                      <td className="py-2 px-4">{entry.projectType.replace('_', ' ')}</td>
                      <td className="py-2 px-4 text-right">{entry.squareFootage.toLocaleString()}</td>
                      <td className="py-2 px-4 text-right">${entry.totalPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                      <td className="py-2 px-4 flex justify-center space-x-2">
                        <button 
                          onClick={() => handleLoadPastEntry(entry)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                        >
                          Load
                        </button>
                        <button 
                          onClick={() => handleDeletePastEntry(entry.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card h-full">
            {currentMode === 'contract' ? (
              <JanitorialContractForm onContractGenerated={handleContractGenerated} />
            ) : currentMode === 'simple' ? (
              <SimpleEstimatorForm onEstimateCalculated={handleEstimateCalculated} />
            ) : (
              <EstimatorForm onEstimateCalculated={handleEstimateCalculated} />
            )}
          </div>
          
          {(estimateData && formData && currentMode !== 'contract') || (contractData && janitorialFormData && currentMode === 'contract') ? (
            <div className="card h-full">
              {currentMode === 'contract' && contractData && janitorialFormData ? (
                <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow">
                  <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
                    Janitorial Contract Summary
                  </h2>
                  
                  {/* Contract Overview */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700 mb-6">
                    <h3 className="text-lg font-semibold mb-4 text-purple-800 dark:text-purple-200">📄 Contract Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Facility</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{janitorialFormData.facilityName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Contact</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{janitorialFormData.contactName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Building Type</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{janitorialFormData.buildingType.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Service Frequency</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{janitorialFormData.serviceFrequency.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Summary */}
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700 mb-6">
                    <h3 className="text-lg font-semibold mb-4 text-green-800 dark:text-green-200">💰 Pricing Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-300">Monthly Rate</p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                          ${contractData.monthlyRate.toLocaleString()}
                        </p>
                        {contractData.pricePerSqFt && (
                          <p className="text-sm text-gray-500">${contractData.pricePerSqFt.toFixed(2)}/sq ft/month</p>
                        )}
                        {contractData.pricePerRoom && (
                          <p className="text-sm text-gray-500">${contractData.pricePerRoom.toFixed(2)}/room/month</p>
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-300">Annual Rate</p>
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                          ${contractData.annualRate.toLocaleString()}
                        </p>
                        {contractData.contractTerms.annualDiscount > 0 && (
                          <p className="text-sm text-green-600">
                            {contractData.contractTerms.annualDiscount}% contract discount applied
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Service Schedule */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700 mb-6">
                    <h3 className="text-lg font-semibold mb-4 text-blue-800 dark:text-blue-200">📅 Service Schedule</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Frequency</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {contractData.schedule.frequency.replace('_', ' ')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Service Time</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {janitorialFormData.serviceTime}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Estimated Hours</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {contractData.schedule.estimatedHours} hours per {janitorialFormData.serviceFrequency === 'daily' ? 'week' : janitorialFormData.serviceFrequency}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Service Scope Preview */}
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
                    <h3 className="text-lg font-semibold mb-4 text-orange-800 dark:text-orange-200">🧹 Service Scope Preview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Daily Tasks</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          {contractData.serviceScope.daily.slice(0, 3).map((task: string, index: number) => (
                            <li key={index}>• {task}</li>
                          ))}
                          {contractData.serviceScope.daily.length > 3 && (
                            <li className="text-gray-500">+ {contractData.serviceScope.daily.length - 3} more tasks...</li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Weekly/Monthly Tasks</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          {contractData.serviceScope.weekly.slice(0, 2).map((task: string, index: number) => (
                            <li key={index}>• {task}</li>
                          ))}
                          {contractData.serviceScope.monthly.slice(0, 1).map((task: string, index: number) => (
                            <li key={index}>• {task}</li>
                          ))}
                          <li className="text-gray-500">+ Complete scope in full contract...</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <EstimateResult estimateData={estimateData!} formData={formData!} />
              )}
            </div>
          ) : (
            <div className="card h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900">
              <div className="text-center p-8">
                {currentMode === 'contract' ? (
                  <>
                    <h2 className="text-2xl font-semibold mb-4 text-purple-600 dark:text-purple-400">Contract Generator</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Fill out the facility information and service requirements to generate a comprehensive janitorial service contract.
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-semibold mb-4 text-indigo-600 dark:text-indigo-400">No Estimate Yet</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Fill out the form to generate a detailed estimate for your commercial cleaning project.
                    </p>
                  </>
                )}
                <div className="p-4 bg-indigo-50 dark:bg-slate-700 rounded-lg">
                  <p className="text-sm text-indigo-800 dark:text-indigo-200">
                    Your {currentMode === 'contract' ? 'contracts' : 'estimates'} are automatically saved and will be available when you return.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mode Switching Buttons */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white text-center">
            Switch Calculator Mode
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.keys(MODE_CONFIGS) as AppMode[]).map((mode) => {
              const config = MODE_CONFIGS[mode];
              const isActive = currentMode === mode;
              
              return (
                <button
                  key={mode}
                  onClick={() => handleModeSwitch(mode)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    isActive
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-semibold ${
                      isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-800 dark:text-white'
                    }`}>
                      {config.title}
                    </h4>
                    {isActive && (
                      <span className="text-indigo-600 dark:text-indigo-400">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {config.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {config.features.slice(0, 3).map((feature, index) => (
                      <span
                        key={index}
                        className={`text-xs px-2 py-1 rounded ${
                          isActive
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-800 dark:text-indigo-200'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <footer className="mt-12 text-center text-sm text-gray-500 py-6 border-t border-gray-200 dark:border-gray-700">
          <p>© 2023 EstimAItor - Commercial Cleaning Estimation Tool</p>
          <p className="mt-1">Prices based on East Coast rates • Home Base: High Point, NC</p>
          <p className="mt-1">Current Mode: <span className="font-semibold">{currentConfig.title}</span></p>
        </footer>
        {/* Admin Access Logo */}
        <div className="fixed bottom-4 right-4 cursor-pointer hover:opacity-80 transition-opacity">
          <Image
            src="/favicon.ico"
            alt="Calculator Logo"
            width={96}
            height={96}
            className="rounded-full shadow-lg"
            priority
            onClick={() => {
              const passcode = prompt('Enter admin passcode:');
              if (passcode === '1234') {
                setShowAdminThemeMenu(true);
              } else if (passcode !== null) {
                alert('Incorrect passcode');
              }
            }}
          />
        </div>
      </div>

      {/* Admin Theme Menu */}
      <AdminThemeMenu 
        isOpen={showAdminThemeMenu} 
        onClose={() => setShowAdminThemeMenu(false)} 
      />
    </main>
  );
} 