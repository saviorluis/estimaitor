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
  ...overrides
});

export default function PressureWashingCalculator({ onEstimateCalculated }: PressureWashingCalculatorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<PressureWashingFormValues>({
    defaultValues: {
      pressureWashingArea: 2000,
      pressureWashingType: 'soft_wash',
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
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Enter job details to get a standalone pressure washing quote.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="pressureWashingArea" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Area (sq ft)</label>
          <input
            id="pressureWashingArea"
            type="number"
            min="0"
            {...register('pressureWashingArea', { required: true, min: 1 })}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700"
            placeholder="e.g. 2000"
          />
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
            <option value="soft_wash">Soft wash ($0.18/sq ft, min $235)</option>
            <option value="roof_wash">Roof wash ($0.50/sq ft)</option>
            <option value="driveway">Driveway ($0.20/sq ft)</option>
            <option value="deck">Deck/Trex ($1.00/sq ft)</option>
            <option value="daily_rate">Daily rate ($1,800)</option>
          </select>
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
          <label htmlFor="applyMarkup" className="text-sm font-medium text-gray-700 dark:text-gray-300">Apply 30% professional markup</label>
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
