'use client';

import { useState, useEffect } from 'react';
import EstimatorForm from '@/components/EstimatorForm';
import EstimateResult from '@/components/EstimateResult';
import { EstimateData, FormData } from '@/lib/types';

// Storage keys for saved data
const ESTIMATE_STORAGE_KEY = 'estimaitor_estimate_data';
const FORM_STORAGE_KEY = 'estimaitor_saved_form_data';

export default function Home() {
  const [estimateData, setEstimateData] = useState<EstimateData | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved data on initial render
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    try {
      const savedEstimate = localStorage.getItem(ESTIMATE_STORAGE_KEY);
      const savedForm = localStorage.getItem(FORM_STORAGE_KEY);
      
      if (savedEstimate && savedForm) {
        setEstimateData(JSON.parse(savedEstimate));
        setFormData(JSON.parse(savedForm));
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
    
    setIsLoaded(true);
  }, []);

  const handleEstimateCalculated = (data: EstimateData, formValues: FormData) => {
    setEstimateData(data);
    setFormData(formValues);
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
      <header className="py-8 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-xl shadow-lg mb-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">EstimAItor</h1>
          <p className="text-xl text-indigo-100">
            AI Commercial Cleaning Estimator for Construction Projects
          </p>
          {(estimateData || formData) && (
            <button
              onClick={handleClearSavedData}
              className="mt-4 text-sm text-indigo-200 hover:text-white underline"
            >
              Clear Saved Data
            </button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 mb-12">
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

        <footer className="mt-12 text-center text-sm text-gray-500 py-6 border-t border-gray-200 dark:border-gray-700">
          <p>© 2023 EstimAItor - Commercial Cleaning Estimation Tool</p>
          <p className="mt-1">Prices based on East Coast rates (VA, NC, SC, GA)</p>
        </footer>
      </div>
    </main>
  );
} 