'use client';

import { useState } from 'react';
import EstimatorForm from '@/components/EstimatorForm';
import EstimateResult from '@/components/EstimateResult';
import AIRecommendations from '@/components/AIRecommendations';
import { EstimateData, FormData } from '@/lib/types';

export default function Home() {
  const [estimateData, setEstimateData] = useState<EstimateData | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);

  const handleEstimateCalculated = (data: EstimateData, formValues: FormData) => {
    setEstimateData(data);
    setFormData(formValues);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">EstimAItor</h1>
          <p className="text-gray-600">
            Commercial Post-Construction Cleanup Estimator
          </p>
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