'use client';

import { useState, useEffect } from 'react';
import EstimatorForm from '@/components/EstimatorForm';
import EstimateResult from '@/components/EstimateResult';
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

// App modes
export type AppMode = 'pro' | 'customer' | 'contractor';

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
  customer: {
    title: 'Customer Mode',
    subtitle: 'Simple Estimate for Website Visitors',
    description: 'Streamlined interface for customers to get quick, accurate estimates on your website.',
    color: 'from-green-600 to-green-800',
    features: ['Simple inputs', 'Instant estimates', 'Lead capture', 'Professional presentation', 'Contact integration']
  },
  contractor: {
    title: 'Contractor Mode',
    subtitle: 'Quick Price Reference Tool',
    description: 'Fast ballpark estimates for general contractors to validate bids and plan budgets.',
    color: 'from-orange-600 to-orange-800',
    features: ['Minimal inputs', 'Quick estimates', 'Price validation', 'Budget planning', 'Comparison mode']
  }
};

export default function Home() {
  const [estimateData, setEstimateData] = useState<EstimateData | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [pastEntries, setPastEntries] = useState<PastEntry[]>([]);
  const [showPastEntries, setShowPastEntries] = useState(false);
  const [currentMode, setCurrentMode] = useState<AppMode>('pro');

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

      if (savedMode && ['pro', 'customer', 'contractor'].includes(savedMode)) {
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

  // Function to clear saved data
  const handleClearSavedData = () => {
    localStorage.removeItem(ESTIMATE_STORAGE_KEY);
    localStorage.removeItem(FORM_STORAGE_KEY);
    localStorage.removeItem('estimaitor_form_data');
    setEstimateData(null);
    setFormData(null);
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
    // Clear current estimate when switching modes
    setEstimateData(null);
    setFormData(null);
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
            {(estimateData || formData) && (
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
            <EstimatorForm onEstimateCalculated={handleEstimateCalculated} />
          </div>
          
          {estimateData && formData ? (
            <div className="card h-full">
              <EstimateResult estimateData={estimateData} formData={formData} />
            </div>
          ) : (
            <div className="card h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900">
              <div className="text-center p-8">
                <h2 className="text-2xl font-semibold mb-4 text-indigo-600 dark:text-indigo-400">No Estimate Yet</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Fill out the form to generate a detailed estimate for your commercial cleaning project.
                </p>
                <div className="p-4 bg-indigo-50 dark:bg-slate-700 rounded-lg">
                  <p className="text-sm text-indigo-800 dark:text-indigo-200">
                    Your estimates are automatically saved and will be available when you return.
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
          <p className="mt-1">Prices based on East Coast rates (VA, NC, SC, GA)</p>
          <p className="mt-1">Current Mode: <span className="font-semibold">{currentConfig.title}</span></p>
        </footer>
      </div>
    </main>
  );
} 