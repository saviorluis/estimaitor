'use client';

import { useState, useEffect } from 'react';
import EstimatorForm from '@/components/EstimatorForm';
import EstimateResult from '@/components/EstimateResult';
import AIRecommendations from '@/components/AIRecommendations';
import { EstimateData, FormData } from '@/lib/types';
import QuoteTemplate from '@/components/QuoteTemplate';

export default function Home() {
  const [estimateData, setEstimateData] = useState<EstimateData | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [showQuote, setShowQuote] = useState(false);

  // Load saved data from localStorage when the component mounts
  useEffect(() => {
    const savedEstimateData = localStorage.getItem('estimateData');
    const savedFormData = localStorage.getItem('formData');
    
    if (savedEstimateData) {
      setEstimateData(JSON.parse(savedEstimateData));
    }
    
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData));
    }
  }, []);

  const handleEstimateCalculated = (data: EstimateData, formValues: FormData) => {
    setEstimateData(data);
    setFormData(formValues);
    
    // Save to localStorage
    localStorage.setItem('estimateData', JSON.stringify(data));
    localStorage.setItem('formData', JSON.stringify(formValues));
    
    // Hide quote template when new estimate is calculated
    setShowQuote(false);
  };

  const handleShowQuote = () => {
    setShowQuote(true);
  };

  const handleBackToEstimate = () => {
    setShowQuote(false);
  };

  const handleClearSavedData = () => {
    localStorage.removeItem('estimateData');
    localStorage.removeItem('formData');
    setEstimateData(null);
    setFormData(null);
    setShowQuote(false);
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
              className="mt-2 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              Clear Saved Data
            </button>
          )}
        </header>

        {!showQuote ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <EstimatorForm 
              onEstimateCalculated={handleEstimateCalculated} 
              initialFormData={formData}
            />
            
            {estimateData && formData && (
              <div>
                <EstimateResult 
                  estimateData={estimateData} 
                  formData={formData} 
                  onShowQuote={handleShowQuote}
                />
              </div>
            )}
          </div>
        ) : (
          estimateData && formData && (
            <div>
              <button 
                onClick={handleBackToEstimate}
                className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                ← Back to Estimate
              </button>
              <QuoteTemplate estimateData={estimateData} formData={formData} />
            </div>
          )
        )}

        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>© 2023 EstimAItor - Commercial Cleaning Estimation Tool</p>
          <p className="mt-1">Prices based on East Coast rates (VA, NC, SC, GA)</p>
        </footer>
      </div>
    </main>
  );
} 