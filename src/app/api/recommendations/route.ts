import { NextResponse } from 'next/server';
import { AIRecommendationRequest, AIRecommendationResponse } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const data: AIRecommendationRequest = await request.json();
    
    // Generate recommendations based on the project details
    const recommendations = generateRecommendations(data);
    
    const response: AIRecommendationResponse = {
      recommendations
    };
    
    return NextResponse.json(response);
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
  
  // Basic recommendations based on project type
  switch (data.projectType) {
    case 'restaurant':
      recommendations.push('Bring specialized degreasers for kitchen areas');
      recommendations.push('Schedule extra time for hood cleaning and grease traps');
      break;
    case 'medical':
      recommendations.push('Use hospital-grade disinfectants for all surfaces');
      recommendations.push('Pay special attention to waiting areas and examination rooms');
      break;
    case 'office':
      recommendations.push('Focus on high-touch surfaces like door handles and light switches');
      recommendations.push('Consider after-hours cleaning to avoid disrupting business operations');
      break;
    case 'retail':
      recommendations.push('Prioritize entrance areas and display surfaces');
      recommendations.push('Use glass cleaners for display cases and windows');
      break;
    case 'industrial':
      recommendations.push('Bring heavy-duty cleaning equipment for concrete floors');
      recommendations.push('Consider pressure washing for heavily soiled areas');
      break;
    case 'educational':
      recommendations.push('Sanitize desks, chairs, and common areas thoroughly');
      recommendations.push('Pay special attention to restrooms and cafeteria areas');
      break;
    case 'hotel':
      recommendations.push('Bring specialized equipment for cleaning carpeted areas');
      recommendations.push('Pay special attention to bathrooms and high-touch surfaces');
      recommendations.push('Consider scheduling room-by-room to minimize disruption');
      break;
    case 'jewelry_store':
      recommendations.push('Bring specialized glass and mirror cleaners for display cases');
      recommendations.push('Use microfiber cloths to avoid scratching delicate surfaces');
      recommendations.push('Pay special attention to security fixtures and lighting');
      break;
  }
  
  // Recommendations based on cleaning type
  switch (data.cleaningType) {
    case 'rough':
      recommendations.push('Focus on debris removal and basic surface cleaning');
      recommendations.push('Bring heavy-duty garbage bags and dumpster access may be needed');
      break;
    case 'final':
      recommendations.push('Bring a variety of cleaning solutions for different surfaces');
      recommendations.push('Plan for detailed cleaning of all visible surfaces');
      break;
    case 'rough_final':
      recommendations.push('Prepare for a two-stage cleaning process with debris removal followed by detailed cleaning');
      recommendations.push('Bring equipment for both rough cleaning and detailed final touches');
      recommendations.push('Schedule proper inspection between the rough and final stages');
      break;
    case 'rough_final_touchup':
      recommendations.push('Prepare for a comprehensive three-stage cleaning process');
      recommendations.push('Bring full range of equipment from heavy-duty to detail cleaning tools');
      recommendations.push('Allow extra time for final inspection and touchup work');
      recommendations.push('Consider splitting team members for different cleaning stages');
      break;
  }
  
  // Recommendations based on pressure washing
  if (data.needsPressureWashing) {
    recommendations.push('Ensure water access is available at the pressure washing location');
    recommendations.push('Bring appropriate detergents for the surfaces being pressure washed');
    recommendations.push('Consider containment and proper disposal of wastewater');
    recommendations.push('Schedule pressure washing early in the project to allow drying time');
    recommendations.push('Ensure team members have proper PPE for pressure washing tasks');
  }
  
  // Recommendations for window cleaning
  if (data.needsWindowCleaning) {
    recommendations.push('Bring professional-grade window cleaning solutions and squeegees');
    recommendations.push('Ensure proper equipment for high-access windows (ladders, lifts, extension poles)');
    recommendations.push('Schedule window cleaning on less windy days if possible');
    recommendations.push('Bring microfiber cloths and lint-free towels for streak-free results');
    recommendations.push('Consider safety harnesses and proper training for high-access window cleaning');
    
    if (data.numberOfHighAccessWindows && data.numberOfHighAccessWindows > 10) {
      recommendations.push('Consider specialized high-access window cleaning equipment or subcontractors');
    }
    
    if (data.projectType === 'retail' || data.projectType === 'jewelry_store') {
      recommendations.push('Pay special attention to display windows and entrance glass for retail appeal');
    }
  }
  
  // Recommendations based on square footage
  if (data.squareFootage > 50000) {
    recommendations.push('Consider splitting the team to cover different sections simultaneously');
    recommendations.push('Bring multiple sets of equipment to increase efficiency');
  } else if (data.squareFootage < 2000) {
    recommendations.push('A smaller team can handle this project efficiently');
  }
  
  // Recommendations based on VCT flooring
  if (data.hasVCT) {
    recommendations.push('Bring floor strippers, wax, and buffing equipment');
    recommendations.push('Allow additional time for floor preparation and drying');
  }
  
  // Recommendations based on urgency level
  if (data.urgencyLevel >= 8) {
    recommendations.push('Consider adding additional cleaners to meet the tight deadline');
    recommendations.push('Prepare for potential overtime hours');
  }
  
  // Recommendations based on estimated hours and number of cleaners
  const hoursPerCleaner = data.estimatedHours / data.numberOfCleaners;
  if (hoursPerCleaner > 8) {
    recommendations.push(`Consider adding more cleaners - current workload is ${hoursPerCleaner.toFixed(1)} hours per person`);
  }
  
  // Add some general recommendations
  recommendations.push('Conduct a walkthrough before starting to identify any special needs');
  recommendations.push('Take before and after photos to document the quality of work');
  
  // Shuffle and limit recommendations to avoid overwhelming the user
  return shuffleArray(recommendations).slice(0, 5);
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
} 