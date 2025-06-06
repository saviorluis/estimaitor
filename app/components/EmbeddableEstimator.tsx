"use client";

import { useState } from 'react';
import EstimateForm from '../../src/components/EstimateForm';
import EstimateResult from '../../src/components/EstimateResult';
import { FormData } from '../../src/lib/types';
import { calculateEstimate } from '../../src/lib/estimator';

interface EmbeddableEstimatorProps {
  initialTab?: 'commercial' | 'residential';
  containerClassName?: string;
  showTitle?: boolean;
  showSyncStatus?: boolean;
  mode?: 'client' | 'admin';
  markup?: number;
}

export default function EmbeddableEstimator({
  initialTab = 'commercial',
  containerClassName = '',
  showTitle = true,
  showSyncStatus = true,
  mode = 'client',
  markup = 0
}: EmbeddableEstimatorProps) {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [estimateData, setEstimateData] = useState<any>(null);

  const handleFormSubmit = (data: FormData) => {
    const estimate = calculateEstimate(data);
    setFormData(data);
    setEstimateData(estimate);
  };

  return (
    <div className={containerClassName}>
      {showTitle && (
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Get Your Instant Estimate
        </h2>
      )}
      
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <EstimateForm
          onSubmit={handleFormSubmit}
          initialTab={initialTab}
          mode={mode}
        />
        
        {estimateData && formData && (
          <div className="mt-8">
            <EstimateResult
              estimateData={estimateData}
              formData={formData}
            />
          </div>
        )}
      </div>
    </div>
  );
} 