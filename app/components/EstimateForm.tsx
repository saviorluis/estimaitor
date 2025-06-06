"use client";

import { useState, useEffect } from 'react';
import { FormData } from '../lib/types';

interface EstimateFormProps {
  onSubmit: (data: FormData) => void;
  initialTab?: 'commercial' | 'residential';
  mode?: 'client' | 'admin';
}

export default function EstimateForm({
  onSubmit,
  initialTab = 'commercial',
  mode = 'client'
}: EstimateFormProps) {
  const [formData, setFormData] = useState<FormData>({
    projectType: 'office',
    cleaningType: 'post_construction',
    squareFootage: 0,
    hasVCT: false,
    distanceFromOffice: 0,
    gasPrice: 3.50,
    applyMarkup: true,
    stayingOvernight: false,
    numberOfNights: 1,
    numberOfCleaners: 2,
    urgencyLevel: 1,
    needsPressureWashing: false,
    pressureWashingArea: 0,
    pressureWashingServices: [],
    pressureWashingServiceAreas: {},
    needsWindowCleaning: false,
    chargeForWindowCleaning: true,
    numberOfWindows: 0,
    numberOfLargeWindows: 0,
    numberOfHighAccessWindows: 0,
    numberOfDisplayCases: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Project Type</label>
        <select
          name="projectType"
          value={formData.projectType}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="office">Office Building</option>
          <option value="retail">Retail Store</option>
          <option value="medical">Medical Facility</option>
          <option value="school">School/Educational</option>
          <option value="industrial">Industrial/Warehouse</option>
          <option value="restaurant">Restaurant</option>
          <option value="gym">Gym/Fitness Center</option>
          <option value="church">Church/Religious Facility</option>
          <option value="theater">Theater/Entertainment</option>
          <option value="hotel">Hotel/Hospitality</option>
          <option value="apartment">Apartment Complex</option>
          <option value="jewelry_store">Jewelry Store</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Square Footage</label>
        <input
          type="number"
          name="squareFootage"
          value={formData.squareFootage}
          onChange={handleChange}
          min="0"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Distance from Office (miles)</label>
        <input
          type="number"
          name="distanceFromOffice"
          value={formData.distanceFromOffice}
          onChange={handleChange}
          min="0"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Number of Cleaners</label>
        <input
          type="number"
          name="numberOfCleaners"
          value={formData.numberOfCleaners}
          onChange={handleChange}
          min="1"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            name="hasVCT"
            checked={formData.hasVCT}
            onChange={handleChange}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Has VCT Flooring</span>
        </label>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Calculate Estimate
      </button>
    </form>
  );
} 