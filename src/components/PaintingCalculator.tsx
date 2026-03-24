'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { FormData, EstimateData } from '@/lib/types';
import { calculateEstimate } from '@/lib/estimator';

interface PaintingCalculatorProps {
  onEstimateCalculated: (data: EstimateData, formValues: FormData) => void;
}

type PaintingFormValues = {
  paintingSquareFootage: number;
  paintingType: 'interior' | 'exterior' | 'both';
  paintingCoats: 1 | 2;
  distanceFromOffice: number;
  applyMarkup: boolean;
  clientName?: string;
  projectName?: string;
};

const defaultFormData = (overrides: Partial<FormData>): FormData => ({
  projectType: 'other',
  cleaningType: 'final',
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
  needsPressureWashing: false,
  pressureWashingServices: [],
  pressureWashingArea: 0,
  pressureWashingType: 'soft_wash',
  needsWindowCleaning: false,
  numberOfWindows: 0,
  numberOfLargeWindows: 0,
  numberOfHighAccessWindows: 0,
  numberOfDisplayCases: 0,
  needsPainting: true,
  paintingSquareFootage: 0,
  paintingType: 'interior',
  paintingCoats: 1,
  ...overrides
});

export default function PaintingCalculator({ onEstimateCalculated }: PaintingCalculatorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<PaintingFormValues>({
    defaultValues: {
      paintingSquareFootage: 1500,
      paintingType: 'interior',
      paintingCoats: 1,
      distanceFromOffice: 20,
      applyMarkup: true,
      clientName: '',
      projectName: ''
    }
  });

  const formValues = watch();

  const onSubmit: SubmitHandler<PaintingFormValues> = (data) => {
    setIsSubmitting(true);
    const formData = defaultFormData({
      paintingSquareFootage: data.paintingSquareFootage,
      paintingType: data.paintingType,
      paintingCoats: data.paintingCoats,
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
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">🎨 Painting Estimate</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Enter job details to get a standalone painting quote.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="paintingSquareFootage" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Square footage to paint</label>
          <input
            id="paintingSquareFootage"
            type="number"
            min="0"
            {...register('paintingSquareFootage', { required: true, min: 1 })}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700"
            placeholder="e.g. 1500"
          />
          {errors.paintingSquareFootage && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">Square footage is required</p>
          )}
        </div>

        <div>
          <label htmlFor="paintingType" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Type</label>
          <select
            id="paintingType"
            {...register('paintingType')}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700"
          >
            <option value="interior">Interior</option>
            <option value="exterior">Exterior</option>
            <option value="both">Interior + Exterior</option>
          </select>
        </div>

        <div>
          <label htmlFor="paintingCoats" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Coats</label>
          <select
            id="paintingCoats"
            {...register('paintingCoats', { valueAsNumber: true })}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700"
          >
            <option value={1}>1 coat</option>
            <option value={2}>2 coats</option>
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
            className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
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
          className="w-full bg-amber-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors"
        >
          Calculate Painting Estimate
        </button>
      </form>
    </div>
  );
}
