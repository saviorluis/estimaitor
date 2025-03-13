'use client';

import { useState, useEffect } from 'react';
import { EstimateData, FormData } from '@/lib/types';
import { PROJECT_TYPE_MULTIPLIERS, CLEANING_TYPE_MULTIPLIERS } from '@/lib/constants';
import QuoteTemplate from './QuoteTemplate';

interface EstimateResultProps {
  estimateData: EstimateData;
  formData: FormData;
  onShowQuote?: () => void;
}

export default function EstimateResult({ estimateData, formData, onShowQuote }: EstimateResultProps) {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuote, setShowQuote] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectType: formData.projectType,
            cleaningType: formData.cleaningType,
            squareFootage: formData.squareFootage,
            hasVCT: formData.hasVCT,
            estimatedHours: estimateData.estimatedHours,
            numberOfCleaners: formData.numberOfCleaners,
            urgencyLevel: formData.urgencyLevel,
            needsPressureWashing: formData.needsPressureWashing,
            needsWindowCleaning: formData.needsWindowCleaning,
            numberOfWindows: formData.numberOfWindows,
            numberOfLargeWindows: formData.numberOfLargeWindows,
            numberOfHighAccessWindows: formData.numberOfHighAccessWindows
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }

        const data = await response.json();
        setRecommendations(data.recommendations);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setRecommendations([
          'Ensure you have enough cleaning supplies for the entire project',
          'Consider the specific needs of this project type',
          'Plan for adequate staffing based on the square footage'
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [estimateData, formData]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(0)}%`;
  };

  const handleShowQuote = () => {
    if (onShowQuote) {
      onShowQuote();
    } else {
      setShowQuote(true);
    }
  };

  return (
    <>
      {showQuote ? (
        <div>
          <button 
            onClick={() => setShowQuote(false)}
            className="mb-4 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded transition"
          >
            ← Back to Estimate
          </button>
          <QuoteTemplate estimateData={estimateData} formData={formData} />
        </div>
      ) : (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Estimate Results</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Price</p>
                <p className="text-2xl font-bold text-blue-700">{formatCurrency(estimateData.totalPrice)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Price Per Square Foot</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(estimateData.pricePerSquareFoot)}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Estimated Hours</p>
                <p className="text-2xl font-bold text-purple-700">{estimateData.estimatedHours} hours</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Hours Per Cleaner</p>
                <p className="text-2xl font-bold text-amber-700">
                  {(estimateData.estimatedHours / formData.numberOfCleaners).toFixed(1)} hours
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Cost Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Base Price ({formData.squareFootage.toLocaleString()} sq ft)</span>
                <span>{formatCurrency(estimateData.basePrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Project Type Multiplier ({formatPercentage(estimateData.projectTypeMultiplier - 1)} increase)</span>
                <span>x{estimateData.projectTypeMultiplier.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cleaning Type Multiplier ({formatPercentage(estimateData.cleaningTypeMultiplier - 1)} {estimateData.cleaningTypeMultiplier < 1 ? 'decrease' : 'increase'})</span>
                <span>x{estimateData.cleaningTypeMultiplier.toFixed(2)}</span>
              </div>
              
              {formData.hasVCT && (
                <div className="flex justify-between">
                  <span>VCT Flooring Cost</span>
                  <span>{formatCurrency(estimateData.vctCost)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>Travel Cost ({formData.distanceFromOffice} miles)</span>
                <span>{formatCurrency(estimateData.travelCost)}</span>
              </div>
              
              {formData.stayingOvernight && (
                <div className="flex justify-between">
                  <span>Overnight Accommodations ({formData.numberOfNights} night(s))</span>
                  <span>{formatCurrency(estimateData.overnightCost)}</span>
                </div>
              )}
              
              {formData.needsPressureWashing && estimateData.pressureWashingCost > 0 && (
                <div className="flex justify-between">
                  <span>Pressure Washing ({formData.pressureWashingArea.toLocaleString()} sq ft)</span>
                  <span>{formatCurrency(estimateData.pressureWashingCost)}</span>
                </div>
              )}
              
              {formData.needsWindowCleaning && estimateData.windowCleaningCost > 0 && (
                <div className="flex justify-between">
                  <span>Window Cleaning ({formData.numberOfWindows + formData.numberOfLargeWindows + formData.numberOfHighAccessWindows} windows)</span>
                  <span>{formatCurrency(estimateData.windowCleaningCost)}</span>
                </div>
              )}
              
              {estimateData.urgencyMultiplier > 1 && (
                <div className="flex justify-between">
                  <span>Urgency Adjustment (Level {formData.urgencyLevel}/10)</span>
                  <span>+{formatPercentage(estimateData.urgencyMultiplier - 1)}</span>
                </div>
              )}
              
              <div className="border-t border-gray-300 pt-2 flex justify-between font-semibold">
                <span>Subtotal</span>
                <span>{formatCurrency(estimateData.totalBeforeMarkup)}</span>
              </div>
              
              {formData.applyMarkup && (
                <div className="flex justify-between">
                  <span>Service Fee (50%)</span>
                  <span>{formatCurrency(estimateData.markup)}</span>
                </div>
              )}
              
              <div className="border-t border-gray-300 pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatCurrency(estimateData.totalPrice)}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">AI Recommendations</h3>
            {isLoading ? (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
              </div>
            ) : (
              <ul className="list-disc pl-5 space-y-2">
                {recommendations.map((recommendation, index) => (
                  <li key={index} className="text-gray-700">{recommendation}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Project Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><span className="font-semibold">Project Type:</span> {formData.projectType.charAt(0).toUpperCase() + formData.projectType.slice(1).replace('_', ' ')}</p>
                <p><span className="font-semibold">Cleaning Type:</span> {formData.cleaningType.charAt(0).toUpperCase() + formData.cleaningType.slice(1).replace('_', ' ')}</p>
                <p><span className="font-semibold">Square Footage:</span> {formData.squareFootage.toLocaleString()} sq ft</p>
                <p><span className="font-semibold">VCT Flooring:</span> {formData.hasVCT ? 'Yes' : 'No'}</p>
                <p><span className="font-semibold">Distance from Office:</span> {formData.distanceFromOffice} miles</p>
                <p><span className="font-semibold">Gas Price:</span> ${formData.gasPrice.toFixed(2)}/gallon</p>
              </div>
              <div>
                <p><span className="font-semibold">Overnight Stay:</span> {formData.stayingOvernight ? `Yes (${formData.numberOfNights} night(s))` : 'No'}</p>
                <p><span className="font-semibold">Number of Cleaners:</span> {formData.numberOfCleaners}</p>
                <p><span className="font-semibold">Urgency Level:</span> {formData.urgencyLevel}/10</p>
                <p><span className="font-semibold">Apply Markup:</span> {formData.applyMarkup ? 'Yes (50%)' : 'No'}</p>
                <p><span className="font-semibold">Pressure Washing:</span> {formData.needsPressureWashing ? `Yes (${formData.pressureWashingArea.toLocaleString()} sq ft)` : 'No'}</p>
                <p><span className="font-semibold">Window Cleaning:</span> {formData.needsWindowCleaning ? 
                  `Yes (${formData.numberOfWindows} standard, ${formData.numberOfLargeWindows} large, ${formData.numberOfHighAccessWindows} high-access)` : 'No'}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button 
              onClick={handleShowQuote}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium text-lg transition shadow-md hover:shadow-lg"
            >
              Generate Professional Quote
            </button>
          </div>
        </div>
      )}
    </>
  );
}