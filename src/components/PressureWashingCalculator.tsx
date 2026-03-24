'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { FormData, EstimateData } from '@/lib/types';
import { calculateEstimate } from '@/lib/estimator';

interface PressureWashingCalculatorProps {
  onEstimateCalculated: (data: EstimateData, formValues: FormData) => void;
}

type PressureWashingFormValues = {
  pressureWashingArea: number;
  pressureWashingType: 'soft_wash' | 'roof_wash' | 'driveway' | 'deck' | 'daily_rate';
  needsChimneyWash: boolean;
  chimneyCount: number;
  distanceFromOffice: number;
  applyMarkup: boolean;
  clientName?: string;
  projectName?: string;
};

const defaultFormData = (overrides: Partial<FormData>): FormData => ({
  projectType: 'other',
  cleaningType: 'pressure_washing',
  squareFootage: 0,
  hasVCT: false,
  vctSquareFootage: 0,
  distanceFromOffice: 20,
  gasPrice: 3.5,
  applyMarkup: true,
  numberOfCleaners: 2,
  urgencyLevel: 1,
  stayingOvernight: false,
  numberOfNights: 0,
  needsPressureWashing: true,
  pressureWashingServices: [],
  pressureWashingArea: 0,
  pressureWashingType: 'soft_wash',
  needsWindowCleaning: false,
  numberOfWindows: 0,
  numberOfLargeWindows: 0,
  numberOfHighAccessWindows: 0,
  numberOfDisplayCases: 0,
  needsPainting: false,
  paintingSquareFootage: 0,
  paintingType: 'interior',
  paintingCoats: 1,
  needsChimneyWash: false,
  chimneyCount: 0,
  ...overrides
});

export default function PressureWashingCalculator({ onEstimateCalculated }: PressureWashingCalculatorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<PressureWashingFormValues>({
    defaultValues: {
      pressureWashingArea: 2000,
      pressureWashingType: 'soft_wash',
      needsChimneyWash: false,
      chimneyCount: 1,
      distanceFromOffice: 20,
      applyMarkup: true,
      clientName: '',
      projectName: ''
    }
  });

  const formValues = watch();

  const onSubmit: SubmitHandler<PressureWashingFormValues> = (data) => {
    setIsSubmitting(true);
    const formData = defaultFormData({
      pressureWashingArea: data.pressureWashingArea,
      pressureWashingType: data.pressureWashingType,
      needsChimneyWash: data.needsChimneyWash,
      chimneyCount: data.needsChimneyWash ? (data.chimneyCount || 1) : 0,
      distanceFromOffice: data.distanceFromOffice,
      applyMarkup: data.applyMarkup,
      clientName: data.clientName,
      projectName: data.projectName
    });
    const estimate = calculateEstimate(formData);
    onEstimateCalculated(estimate, formData);
    setIsSubmitting(false);
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">💧 Pressure Washing Estimate</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Enter building exterior (washable) sq ft and service type for the actual price. Per sq ft options are the true price structure; daily rate is kept as a reference for commercial subcontract bids.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="pressureWashingArea" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Building exterior (washable surface), sq ft
          </label>
          <input
            id="pressureWashingArea"
            type="number"
            min="0"
            {...register('pressureWashingArea', { required: true, min: 1 })}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700"
            placeholder="e.g. 2000"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Not property or lot size — only the exterior walls/siding area to be washed. A typical 2,000 sq ft house exterior soft wash is roughly $360–500 before travel and markup.
          </p>
          {errors.pressureWashingArea && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">Area is required</p>
          )}
        </div>

        <div>
          <label htmlFor="pressureWashingType" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Service type</label>
          <select
            id="pressureWashingType"
            {...register('pressureWashingType')}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700"
          >
            <optgroup label="Primary pricing (actual job quote)">
              <option value="soft_wash">Soft wash — $0.18/sq ft (min $235)</option>
              <option value="roof_wash">Roof wash — $0.50/sq ft</option>
              <option value="driveway">Driveway — $0.20/sq ft</option>
              <option value="deck">Deck / Trex — $1.00/sq ft</option>
            </optgroup>
            <optgroup label="Reference (e.g. commercial subcontract)">
              <option value="daily_rate">Daily rate — $1,800 (reference only)</option>
            </optgroup>
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Use per sq ft for the true price structure. Daily rate is kept for reference or commercial subcontract bids.
          </p>
        </div>

        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center gap-3">
            <input
              id="needsChimneyWash"
              type="checkbox"
              {...register('needsChimneyWash')}
              className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
            />
            <label htmlFor="needsChimneyWash" className="text-sm font-medium text-gray-700 dark:text-gray-300">Include chimney wash</label>
          </div>
          {formValues.needsChimneyWash && (
            <div>
              <label htmlFor="chimneyCount" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Number of chimneys</label>
              <input
                id="chimneyCount"
                type="number"
                min="1"
                {...register('chimneyCount', { min: 1, valueAsNumber: true })}
                className="w-24 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">$95 per chimney (exterior wash)</p>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="distanceFromOffice" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Distance from office (miles)</label>
          <input
            id="distanceFromOffice"
            type="number"
            min="0"
            {...register('distanceFromOffice', { min: 0, valueAsNumber: true })}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            id="applyMarkup"
            type="checkbox"
            {...register('applyMarkup')}
            className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
          />
          <label htmlFor="applyMarkup" className="text-sm font-medium text-gray-700 dark:text-gray-300">Apply 20% professional markup</label>
        </div>

        <div className="border-t pt-4 space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Optional – for quote</label>
          <input
            type="text"
            {...register('clientName')}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700"
            placeholder="Client name"
          />
          <input
            type="text"
            {...register('projectName')}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700"
            placeholder="Project name"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-sky-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-sky-700 disabled:opacity-50 transition-colors"
        >
          Calculate Pressure Washing Estimate
        </button>
      </form>
    </div>
  );
}
