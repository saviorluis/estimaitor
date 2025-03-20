'use client';

import { useState, useEffect } from 'react';
import { EstimateData, FormData } from '@/lib/types';
import { PROJECT_TYPE_MULTIPLIERS, CLEANING_TYPE_MULTIPLIERS } from '@/lib/constants';
import QuoteTemplate from './QuoteTemplate';

interface EstimateResultProps {
  estimateData: EstimateData;
  formData: FormData;
}

// Storage keys for saving estimate data
const ESTIMATE_STORAGE_KEY = 'estimaitor_estimate_data';
const FORM_STORAGE_KEY = 'estimaitor_saved_form_data';

export default function EstimateResult({ estimateData, formData }: EstimateResultProps) {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuote, setShowQuote] = useState(false);

  // Save estimate and form data when they change
  useEffect(() => {
    if (estimateData && Object.keys(estimateData).length > 0) {
      try {
        localStorage.setItem(ESTIMATE_STORAGE_KEY, JSON.stringify(estimateData));
        localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
      } catch (error) {
        console.error('Error saving estimate data:', error);
      }
    }
  }, [estimateData, formData]);

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
          'Ensure all team members are briefed on the project scope.',
          'Bring appropriate cleaning supplies for the project type.',
          'Schedule a final walkthrough with the client.',
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [estimateData, formData]);

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const toggleQuote = () => {
    setShowQuote(!showQuote);
  };

  if (showQuote) {
    return (
      <div>
        <button 
          onClick={toggleQuote}
          className="mb-4 flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Estimate
        </button>
        <QuoteTemplate estimateData={estimateData} formData={formData} />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white border-b pb-2">Estimate Results</h2>
      
      <div className="mb-8">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-xl font-semibold mb-2">Total Estimate</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-4xl font-bold">{formatCurrency(estimateData.totalPrice)}</p>
              <p className="text-sm opacity-80">
                {formatCurrency(estimateData.pricePerSquareFoot)} per sq ft
              </p>
            </div>
            <button 
              onClick={toggleQuote} 
              className="bg-white text-indigo-700 hover:bg-indigo-100 px-4 py-2 rounded-md font-medium transition-colors shadow-sm"
            >
              Generate Quote
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-white">Cost Breakdown</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Base Price:</span>
              <span className="font-medium">{formatCurrency(estimateData.basePrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Project Type Multiplier:</span>
              <span className="font-medium">{(estimateData.projectTypeMultiplier || 1).toFixed(2)}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Cleaning Type Multiplier:</span>
              <span className="font-medium">{(estimateData.cleaningTypeMultiplier || 1).toFixed(2)}x</span>
            </div>
            {estimateData.vctCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">VCT Flooring Cost:</span>
                <span className="font-medium">{formatCurrency(estimateData.vctCost)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Travel Cost:</span>
              <span className="font-medium">{formatCurrency(estimateData.travelCost)}</span>
            </div>
            {estimateData.overnightCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Overnight Cost:</span>
                <span className="font-medium">{formatCurrency(estimateData.overnightCost)}</span>
              </div>
            )}
            {estimateData.pressureWashingCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Pressure Washing Cost:</span>
                <span className="font-medium">{formatCurrency(estimateData.pressureWashingCost)}</span>
              </div>
            )}
            {estimateData.windowCleaningCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Window Cleaning Cost:</span>
                <span className="font-medium">{formatCurrency(estimateData.windowCleaningCost)}</span>
              </div>
            )}
            {estimateData.displayCaseCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Display Case Cleaning Cost:</span>
                <span className="font-medium">{formatCurrency(estimateData.displayCaseCost)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Urgency Multiplier:</span>
              <span className="font-medium">{(estimateData.urgencyMultiplier || 1).toFixed(2)}x</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-medium">
                <span className="text-gray-700 dark:text-gray-200">Subtotal:</span>
                <span>{formatCurrency(estimateData.totalBeforeMarkup)}</span>
              </div>
            </div>
            
            {formData.applyMarkup && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Professional Cleaning Markup:</span>
                <span>{formatCurrency(estimateData.markup)}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Sales Tax (7%):</span>
              <span>{formatCurrency(estimateData.salesTax)}</span>
            </div>
            
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-800 dark:text-white">Total:</span>
                <span>{formatCurrency(estimateData.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-white">Project Details</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-sm"><span className="font-semibold text-gray-700 dark:text-gray-300">Project Type:</span> {formData.projectType.charAt(0).toUpperCase() + formData.projectType.slice(1).replace('_', ' ')}</p>
              <p className="text-sm"><span className="font-semibold text-gray-700 dark:text-gray-300">Cleaning Type:</span> {formData.cleaningType.charAt(0).toUpperCase() + formData.cleaningType.slice(1).replace('_', ' ')}</p>
              <p className="text-sm"><span className="font-semibold text-gray-700 dark:text-gray-300">Square Footage:</span> {(formData.squareFootage || 0).toLocaleString()} sq ft</p>
              <p className="text-sm"><span className="font-semibold text-gray-700 dark:text-gray-300">VCT Flooring:</span> {formData.hasVCT ? 'Yes' : 'No'}</p>
              <p className="text-sm"><span className="font-semibold text-gray-700 dark:text-gray-300">Distance from Office:</span> {formData.distanceFromOffice || 0} miles</p>
              <p className="text-sm"><span className="font-semibold text-gray-700 dark:text-gray-300">Gas Price:</span> ${typeof formData.gasPrice === 'number' ? (formData.gasPrice || 0).toFixed(2) : Number(formData.gasPrice || 0).toFixed(2)}/gallon</p>
            </div>
            <div>
              <p className="text-sm"><span className="font-semibold text-gray-700 dark:text-gray-300">Overnight Stay:</span> {formData.stayingOvernight ? `Yes (${formData.numberOfNights} night(s))` : 'No'}</p>
              <p className="text-sm"><span className="font-semibold text-gray-700 dark:text-gray-300">Number of Cleaners:</span> {formData.numberOfCleaners}</p>
              <p className="text-sm"><span className="font-semibold text-gray-700 dark:text-gray-300">Urgency Level:</span> {formData.urgencyLevel}/10</p>
              <p className="text-sm">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Additional Cleaning Costs:</span> 
                {formData.applyMarkup ? 'Included' : 'Not Included'}
              </p>
              <p className="text-sm"><span className="font-semibold text-gray-700 dark:text-gray-300">Pressure Washing:</span> {formData.needsPressureWashing ? `Yes (${(formData.pressureWashingArea || 0).toLocaleString()} sq ft)` : 'No'}</p>
              <p className="text-sm"><span className="font-semibold text-gray-700 dark:text-gray-300">Window Cleaning:</span> {formData.needsWindowCleaning ? 
                `Yes (${formData.numberOfWindows || 0} standard, ${formData.numberOfLargeWindows || 0} large, ${formData.numberOfHighAccessWindows || 0} high-access)${formData.chargeForWindowCleaning ? '' : ' - Quoted Separately'}` : 'No'}</p>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Estimated Hours: {(estimateData.estimatedHours || 0).toFixed(2)} hours</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              With {formData.numberOfCleaners || 1} cleaners, this project will take approximately {((estimateData.estimatedHours || 0) / (formData.numberOfCleaners || 1)).toFixed(1)} hours to complete.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 italic">
              Note: All prices include professional-grade cleaning supplies, equipment, and labor costs.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 mb-4">
        <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-white">AI Recommendations</h3>
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <ul className="list-disc pl-5 space-y-1">
            {recommendations.map((recommendation, index) => (
              <li key={index} className="text-gray-700 dark:text-gray-300 text-sm">{recommendation}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}