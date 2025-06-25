import { FormEvent, ChangeEvent, useState } from 'react';
import { FormData } from '../lib/types';

interface EstimateFormProps {
  onSubmit: (formData: FormData) => void;
  initialTab?: string;
  mode?: 'client' | 'admin';
}

export default function EstimateForm({
  onSubmit,
  initialTab = 'commercial',
  mode = 'client'
}: EstimateFormProps) {
  const [formData, setFormData] = useState<FormData>({
    projectType: 'office',
    cleaningType: 'rough',
    squareFootage: 0,
    hasVCT: false,
    distanceFromOffice: 0,
    gasPrice: 3.50,
    applyMarkup: true,
    stayingOvernight: false,
    numberOfNights: 0,
    numberOfCleaners: 1,
    urgencyLevel: 1,
    needsPressureWashing: false,
    pressureWashingArea: 0,
    needsWindowCleaning: false,
    chargeForWindowCleaning: false,
    numberOfWindows: 0,
    numberOfLargeWindows: 0,
    numberOfHighAccessWindows: 0,
    numberOfDisplayCases: 0
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: FormData) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
          <option value="educational">School/Educational</option>
          <option value="industrial">Industrial/Warehouse</option>
          <option value="restaurant">Restaurant</option>
          <option value="hotel">Hotel/Hospitality</option>
          <option value="jewelry_store">Jewelry Store</option>
          <option value="apartment">Apartment Complex</option>
          <option value="warehouse">Warehouse</option>
          <option value="dormitory">Dormitory</option>
          <option value="grocery_store">Grocery Store</option>
          <option value="yoga_studio">Yoga Studio</option>
          <option value="kids_fitness">Kids Fitness Center</option>
          <option value="fast_food">Fast Food Restaurant</option>
          <option value="bakery">Bakery</option>
          <option value="coffee_shop">Coffee Shop</option>
          <option value="dental_office">Dental Office</option>
          <option value="pet_resort">Pet Resort</option>
          <option value="beauty_store">Beauty Store</option>
          <option value="interactive_toy_store">Interactive Toy Store</option>
          <option value="mailroom">Mailroom</option>
          <option value="church">Church/Religious Facility</option>
          <option value="residential">Residential</option>
          <option value="car_wash">Car Wash</option>
          <option value="construction_trailor">Construction Trailer</option>
          <option value="shell_building">Shell Building</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Cleaning Type</label>
        <select
          name="cleaningType"
          value={formData.cleaningType}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="rough">Rough Clean (80% of standard rate)</option>
          <option value="final">Final Clean (Standard rate)</option>
          <option value="light_touchup">Light Touch-up Clean (60% of standard rate)</option>
          <option value="touchup">Touch-up Clean (70% of standard rate)</option>
          <option value="rough_final_touchup">Complete Package (Rough + Final + Touch-up)</option>
          <option value="pressure_washing_only">Pressure Washing Only</option>
          <option value="window_cleaning_only">Window Cleaning Only</option>
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

      <div className="flex items-center">
        <input
          type="checkbox"
          name="hasVCT"
          checked={formData.hasVCT}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-900">Has VCT Flooring</label>
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
        <label className="block text-sm font-medium text-gray-700">Gas Price ($/gallon)</label>
        <input
          type="number"
          name="gasPrice"
          value={formData.gasPrice}
          onChange={handleChange}
          min="0"
          step="0.01"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="applyMarkup"
          checked={formData.applyMarkup}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-900">Apply Standard Markup</label>
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Calculate Estimate
      </button>
    </form>
  );
} 