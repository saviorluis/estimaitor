'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [showQuote, setShowQuote] = useState(false);

  // Memoized calculations for better performance
  const calculatedValues = useMemo(() => {
    if (!estimateData || !formData) return null;

    return {
      formatCurrency: (value: number | undefined) => {
        if (value === undefined || value === null || isNaN(value)) return '$0.00';
        return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      },
      formatHours: (value: number | undefined) => {
        if (value === undefined || value === null || isNaN(value)) return '0.0';
        return value.toFixed(1);
      },
      getProjectTypeName: (type: string) => {
        return type.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      },
      getCleaningTypeName: (type: string) => {
        const typeMap: Record<string, string> = {
          'rough': 'Rough Clean',
          'final': 'Final Clean',
          'rough_final': 'Rough & Final Clean',
          'rough_final_touchup': 'Rough, Final & Touchup'
        };
        return typeMap[type] || type;
      }
    };
  }, [estimateData, formData]);

  // Save estimate and form data when they change (optimized)
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

  // Optimized toggle functions
  const toggleQuote = useCallback(() => {
    setShowQuote(prev => !prev);
  }, []);

  // Early return if data is not available
  if (!estimateData || !formData || !calculatedValues) {
    return (
      <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Loading estimate data...
        </h2>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  const { formatCurrency, formatHours, getProjectTypeName, getCleaningTypeName } = calculatedValues;

  return (
    <div className="space-y-6">
      {/* Main Estimate Display */}
      <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Estimate Results
          </h2>
          <div className="text-right">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {formatCurrency(estimateData.totalPrice)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {formatCurrency(estimateData.pricePerSquareFoot)}/sq ft
            </div>
          </div>
        </div>

        {/* Project Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Project Type:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {getProjectTypeName(formData.projectType)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Cleaning Type:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {getCleaningTypeName(formData.cleaningType)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Square Footage:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {formData.squareFootage.toLocaleString()} sq ft
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Number of Cleaners:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {formData.numberOfCleaners}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Estimated Hours:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {formatHours(estimateData.estimatedHours)} hours
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Distance:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {formData.distanceFromOffice} miles
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Urgency Level:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {formData.urgencyLevel}/10
              </span>
            </div>
            {formData.stayingOvernight && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Overnight Stay:</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {formData.numberOfNights} night(s)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Cost Breakdown
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Base Price ({formatCurrency(PROJECT_TYPE_MULTIPLIERS[formData.projectType] * CLEANING_TYPE_MULTIPLIERS[formData.cleaningType] * 0.18)}/sq ft)
              </span>
              <span className="text-gray-800 dark:text-gray-200">
                {formatCurrency(estimateData.basePrice)}
              </span>
            </div>

            {estimateData.vctCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  VCT Flooring ({(formData.vctSquareFootage || 0).toLocaleString()} sq ft)
                </span>
                <span className="text-gray-800 dark:text-gray-200">
                  {formatCurrency(estimateData.vctCost)}
                </span>
              </div>
            )}

            {estimateData.windowCleaningCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Window Cleaning</span>
                <span className="text-gray-800 dark:text-gray-200">
                  {formatCurrency(estimateData.windowCleaningCost)}
                </span>
              </div>
            )}

            {estimateData.travelCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Travel Cost</span>
                <span className="text-gray-800 dark:text-gray-200">
                  {formatCurrency(estimateData.travelCost)}
                </span>
              </div>
            )}

            {estimateData.overnightCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Overnight Costs</span>
                <span className="text-gray-800 dark:text-gray-200">
                  {formatCurrency(estimateData.overnightCost)}
                </span>
              </div>
            )}

            {estimateData.pressureWashingCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Pressure Washing</span>
                <span className="text-gray-800 dark:text-gray-200">
                  {formatCurrency(estimateData.pressureWashingCost)}
                </span>
              </div>
            )}

            {estimateData.displayCaseCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Display Case Cleaning</span>
                <span className="text-gray-800 dark:text-gray-200">
                  {formatCurrency(estimateData.displayCaseCost)}
                </span>
              </div>
            )}

            {estimateData.urgencyMultiplier > 1 && (
              <div className="flex justify-between text-orange-600 dark:text-orange-400">
                <span>Urgency Adjustment</span>
                <span>×{estimateData.urgencyMultiplier.toFixed(2)}</span>
              </div>
            )}

            <div className="border-t pt-2">
              <div className="flex justify-between font-medium">
                <span className="text-gray-700 dark:text-gray-300">Subtotal</span>
                <span className="text-gray-800 dark:text-gray-200">
                  {formatCurrency(estimateData.totalBeforeMarkup)}
                </span>
              </div>
            </div>

            {estimateData.markup > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">50% Markup</span>
                <span className="text-gray-800 dark:text-gray-200">
                  {formatCurrency(estimateData.markup)}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Sales Tax (7%)</span>
              <span className="text-gray-800 dark:text-gray-200">
                {formatCurrency(estimateData.salesTax)}
              </span>
            </div>

            <div className="border-t pt-2">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-800 dark:text-gray-200">Total</span>
                <span className="text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(estimateData.totalPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t pt-6">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={toggleQuote}
              className="flex-1 min-w-[200px] bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
            >
              {showQuote ? 'Hide Quote' : 'Generate Quote'}
            </button>
          </div>
        </div>
      </div>

      {/* Quote Template */}
      {showQuote && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-gray-50 dark:bg-slate-700 border-b">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Professional Quote
            </h3>
          </div>
          <QuoteTemplate estimateData={estimateData} formData={formData} />
        </div>
      )}
    </div>
  );
}