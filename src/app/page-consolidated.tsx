'use client';

import { useState, useEffect } from 'react';
import UnifiedEstimator from '@/components/UnifiedEstimator';
import EstimateResult from '@/components/EstimateResult';
import ContactForm from '@/components/ContactForm';
import { EstimateData, FormData } from '@/lib/types';

// Storage keys
const ESTIMATE_STORAGE_KEY = 'estimaitor_estimate_data';
const FORM_STORAGE_KEY = 'estimaitor_saved_form_data';

export default function Home() {
  const [estimateData, setEstimateData] = useState<EstimateData | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [currentMode, setCurrentMode] = useState<'simple' | 'advanced' | 'wizard'>('simple');
  const [isLoading, setIsLoading] = useState(false);

  // Load saved data on mount
  useEffect(() => {
    try {
      const savedEstimate = localStorage.getItem(ESTIMATE_STORAGE_KEY);
      const savedForm = localStorage.getItem(FORM_STORAGE_KEY);
      
      if (savedEstimate) {
        setEstimateData(JSON.parse(savedEstimate));
      }
      if (savedForm) {
        setFormData(JSON.parse(savedForm));
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }, []);

  const handleEstimateCalculated = (estimate: EstimateData, form: FormData) => {
    setEstimateData(estimate);
    setFormData(form);
    
    // Save to localStorage
    try {
      localStorage.setItem(ESTIMATE_STORAGE_KEY, JSON.stringify(estimate));
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(form));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleNewEstimate = () => {
    setEstimateData(null);
    setFormData(null);
    localStorage.removeItem(ESTIMATE_STORAGE_KEY);
    localStorage.removeItem(FORM_STORAGE_KEY);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                EstimAItor
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Professional Cleaning Estimate Calculator
              </p>
            </div>
            
            {/* Mode Selector */}
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentMode('simple')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentMode === 'simple'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title="Client Reference - Quick estimate for clients"
              >
                👥 Client Ref
              </button>
              <button
                onClick={() => setCurrentMode('advanced')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentMode === 'advanced'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title="Professional Estimator - Full features for your use"
              >
                ⚙️ Professional
              </button>
              <button
                onClick={() => setCurrentMode('wizard')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentMode === 'wizard'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title="Step-by-Step Guide - Guided experience"
              >
                🧙‍♂️ Wizard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Estimator Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentMode === 'wizard' ? 'Step-by-Step Guide' : 
                 currentMode === 'advanced' ? 'Professional Estimator' : 
                 'Client Reference Calculator'}
              </h2>
              {estimateData && (
                <button
                  onClick={handleNewEstimate}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  New Estimate
                </button>
              )}
            </div>
            
            <UnifiedEstimator
              onEstimateCalculated={handleEstimateCalculated}
              mode={currentMode}
            />
          </div>

          {/* Results */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            {estimateData && formData ? (
              <EstimateResult
                estimateData={estimateData}
                formData={formData}
                onNewEstimate={handleNewEstimate}
              />
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🧹</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Ready to Calculate
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Fill out the form to get your professional cleaning estimate
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="mt-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Questions? Get in Touch
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Our team is ready to help with your cleaning project
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <ContactForm />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Big Bro Pros</h3>
            <p className="text-gray-300 mb-4">
              Professional Cleaning Services
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <span>Phone: (336) 123-4567</span>
              <span>Email: bids@bigbropros.com</span>
              <span>Website: bigbropros.com</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
