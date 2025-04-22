import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { FormData } from '@/lib/types';

// Initialize OpenAI client
// Note: You'll need to set OPENAI_API_KEY in your environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const formData: FormData = await request.json();
    
    // Get cleaning type name
    const getCleaningTypeName = (type: string): string => {
      if (type === 'rough') return 'Rough Clean (80% of standard rate)';
      if (type === 'final') return 'Final Clean (Standard rate)';
      if (type === 'rough_final') return 'Rough & Final Clean (120% of standard rate)';
      if (type === 'rough_final_touchup') return 'Rough, Final & Touchup (145% of standard rate)';
      return 'Final Clean (Standard)';
    };

    // Get urgency description
    const getUrgencyDescription = (level: number): string => {
      if (level <= 2) return 'Low (No Rush)';
      if (level <= 5) return 'Medium';
      if (level <= 8) return 'High';
      return 'Urgent (ASAP)';
    };
    
    // Create a prompt for the AI
    const prompt = `
      I need recommendations for a post-construction cleanup project with the following details:
      - Project Type: ${formData.projectType}
      - Cleaning Type: ${getCleaningTypeName(formData.cleaningType)}
      - Square Footage: ${formData.squareFootage} sq ft
      - Has VCT Flooring: ${formData.hasVCT ? 'Yes' : 'No'}
      - Distance from Office: ${formData.distanceFromOffice} miles
      - Number of Cleaners: ${formData.numberOfCleaners}
      - Urgency Level: ${formData.urgencyLevel}/10 (${getUrgencyDescription(formData.urgencyLevel)})
      - Staying Overnight: ${formData.stayingOvernight ? 'Yes' : 'No'}
      ${formData.stayingOvernight ? `- Number of Nights: ${formData.numberOfNights}` : ''}
      
      Please provide:
      1. Any special cleaning considerations for this type of project and cleaning level
      2. Recommended equipment and supplies specific to the cleaning type
      3. Potential challenges and how to address them
      4. Tips to improve efficiency, especially considering the urgency level
      5. Any safety considerations
      ${formData.stayingOvernight ? '6. Recommendations for overnight stays and team management' : ''}
      ${formData.urgencyLevel > 7 ? '7. Strategies for meeting urgent deadlines without compromising quality' : ''}
      
      Keep the response concise and focused on practical advice.
    `;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
      max_tokens: 500,
    });

    // Extract the AI's response
    const aiRecommendations = completion.choices[0].message.content;

    return NextResponse.json({ recommendations: aiRecommendations });
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
} 