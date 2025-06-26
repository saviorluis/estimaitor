import { NextResponse } from 'next/server';
import { AIRecommendationRequest } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const data: AIRecommendationRequest = await request.json();
    
    if (!data) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Generate recommendations based on the project details
    const recommendations = generateRecommendations(data);

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

function generateRecommendations(data: AIRecommendationRequest): string[] {
  const recommendations: string[] = [];

  // Project type specific recommendations
  if (data.projectType === 'office') {
    recommendations.push('Focus on desk areas and computer equipment');
    recommendations.push('Pay special attention to common areas and break rooms');
  }

  // Cleaning type specific recommendations
  if (data.cleaningType === 'final') {
    recommendations.push('Ensure all construction debris is completely removed');
    recommendations.push('Check all surfaces for dust and residue');
  }

  // Square footage based recommendations
  if (data.squareFootage > 5000) {
    recommendations.push('Consider using multiple teams to complete the job efficiently');
    recommendations.push('Plan for additional equipment and supplies');
  }

  // VCT specific recommendations
  if (data.hasVCT) {
    recommendations.push('Use appropriate VCT cleaning and finishing products');
    recommendations.push('Allow adequate drying time between coats');
  }

  // Time and resource recommendations
  if (data.estimatedHours > 8) {
    recommendations.push('Plan for breaks and shift changes');
    recommendations.push('Ensure adequate lighting for evening work');
  }

  // Urgency level recommendations
  if (data.urgencyLevel > 7) {
    recommendations.push('Consider additional staff to meet deadline');
    recommendations.push('Prioritize critical areas first');
  }

  // Window cleaning recommendations
  if (data.needsWindowCleaning) {
    recommendations.push('Check weather forecast for optimal window cleaning conditions');
    if (data.numberOfHighAccessWindows && data.numberOfHighAccessWindows > 0) {
      recommendations.push('Ensure proper safety equipment for high-access windows');
    }
  }

  // Pressure washing recommendations
  if (data.needsPressureWashing) {
    recommendations.push('Test pressure settings on inconspicuous area first');
    recommendations.push('Check for proper drainage in work areas');
  }

  return recommendations;
} 