'use client';

import { useState, useEffect } from 'react';
import EstimatorForm from '@/components/EstimatorForm';
import EstimateResult from '@/components/EstimateResult';
import AIRecommendations from '@/components/AIRecommendations';
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

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">EstimAItor</h1>
          <p className="text-gray-600">
            Commercial Post-Construction Cleanup Estimator
          </p>
          {(estimateData || formData) && (
            <button
              onClick={handleClearSavedData}
              className="mt-4 text-sm text-red-600 hover:text-red-800 underline"
            >
              Clear Saved Data
            </button>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <EstimatorForm onEstimateCalculated={handleEstimateCalculated} />
          
          {estimateData && formData && (
            <EstimateResult estimateData={estimateData} formData={formData} />
          )}
        </div>

        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>© 2023 EstimAItor - Commercial Cleaning Estimation Tool</p>
          <p className="mt-1">Prices based on East Coast rates (VA, NC, SC, GA)</p>
        </footer>
      </div>
    </main>
  );
} 