import { NextRequest, NextResponse } from 'next/server';
import { ghlDirectIntegration } from '@/lib/ghlDirectIntegration';

/**
 * Direct GHL Integration Endpoint
 * Sends estimate data directly to GoHighLevel
 * POST /api/send-to-ghl
 */

export async function POST(request: NextRequest) {
  try {
    const { formData, estimateData } = await request.json();

    if (!formData || !estimateData) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing formData or estimateData' 
      }, { status: 400 });
    }

    // Send to GHL
    const result = await ghlDirectIntegration.sendEstimateToGHL(formData, estimateData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Estimate sent to GoHighLevel successfully',
        contactId: result.contactId,
        opportunityId: result.opportunityId
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

  } catch (error) {
    console.error('GHL integration error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Integration failed: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'GHL Direct Integration Endpoint',
    usage: 'POST with { formData: {...}, estimateData: {...} }',
    features: [
      'Creates contact in GHL',
      'Creates opportunity with estimate details',
      'Sets up follow-up task',
      'Tags contact with project type',
      'Stores custom fields for tracking'
    ]
  });
}
