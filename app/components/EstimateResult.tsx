"use client";

import { FormData, EstimateData } from '@/src/lib/types';

interface EstimateResultProps {
  estimateData: EstimateData;
  formData: FormData;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export default function EstimateResult({ estimateData, formData }: EstimateResultProps) {
  return (
    <div className="p-6 bg-white">
      <h2 className="text-2xl font-bold mb-4">Estimate Results</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Project Details</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-gray-600">Square Footage:</div>
              <div>{formData.squareFootage.toLocaleString()} sq ft</div>
              <div className="text-gray-600">Project Type:</div>
              <div>{formData.projectType.replace('_', ' ').toUpperCase()}</div>
              <div className="text-gray-600">Distance:</div>
              <div>{formData.distanceFromOffice} miles</div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Cost Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Base Price:</span>
                <span>{formatCurrency(estimateData.basePrice)}</span>
              </div>
              {formData.hasVCT && (
                <div className="flex justify-between">
                  <span>VCT Flooring:</span>
                  <span>{formatCurrency(estimateData.vctCost)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Travel Cost:</span>
                <span>{formatCurrency(estimateData.travelCost)}</span>
              </div>
              {estimateData.markup > 0 && (
                <div className="flex justify-between">
                  <span>Markup:</span>
                  <span>{formatCurrency(estimateData.markup)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold">
                <span>Subtotal:</span>
                <span>{formatCurrency(estimateData.totalBeforeMarkup)}</span>
              </div>
              <div className="flex justify-between">
                <span>Sales Tax (7%):</span>
                <span>{formatCurrency(estimateData.salesTax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span>{formatCurrency(estimateData.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Additional Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-gray-600">Estimated Hours:</div>
              <div>{estimateData.estimatedHours} hours</div>
              <div className="text-gray-600">Price per Sq Ft:</div>
              <div>{formatCurrency(estimateData.pricePerSquareFoot)}/sq ft</div>
              <div className="text-gray-600">Number of Cleaners:</div>
              <div>{formData.numberOfCleaners}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 