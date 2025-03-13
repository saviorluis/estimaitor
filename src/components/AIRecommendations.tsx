'use client';

import { useState } from 'react';
import { FormData } from '@/lib/types';
import LoadingSpinner from './LoadingSpinner';

interface AIRecommendationsProps {
  formData: FormData | null;
}

export default function AIRecommendations({ formData }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendations = async () => {
    if (!formData) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (err) {
      setError('Error fetching AI recommendations. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mt-8">
      <h2 className="text-xl font-semibold mb-4">AI Cleaning Recommendations</h2>
      
      {!formData ? (
        <p className="text-gray-500">
          Complete the form and calculate an estimate to get AI-powered recommendations.
        </p>
      ) : recommendations ? (
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-line">{recommendations}</div>
        </div>
      ) : (
        <div>
          <p className="mb-4 text-gray-600">
            Get AI-powered recommendations specific to your project type and requirements.
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <button
            onClick={getRecommendations}
            disabled={loading}
            className="btn-primary w-full flex justify-center items-center"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" color="text-white" />
                <span className="ml-2">Generating Recommendations...</span>
              </>
            ) : (
              'Get AI Recommendations'
            )}
          </button>
        </div>
      )}
    </div>
  );
} 