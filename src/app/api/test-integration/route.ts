import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/emailService';
import { ghlIntegration } from '@/lib/ghlIntegration';

/**
 * Test endpoint for Resend + GHL integration
 * POST /api/test-integration
 */

export async function POST(request: NextRequest) {
  try {
    const { testType, email, name } = await request.json();

    if (testType === 'email') {
      // Test Resend email
      const result = await emailService.sendEstimateReady({
        clientName: name || 'Test Client',
        clientEmail: email || 'test@example.com',
        projectDetails: {
          type: 'Test Project',
          squareFootage: 2500,
          cleaningType: 'Final Clean',
          totalPrice: 1250
        },
        estimateUrl: `${process.env.NEXT_PUBLIC_APP_URL}/estimate`
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Test email sent successfully',
        result 
      });
    }

    if (testType === 'ghl') {
      // Test GHL integration
      const result = await ghlIntegration.createContact({
        firstName: name?.split(' ')[0] || 'Test',
        lastName: name?.split(' ').slice(1).join(' ') || 'Client',
        email: email || 'test@example.com',
        phone: '555-123-4567',
        source: 'EstimAItor Test',
        tags: ['Test Contact', 'Integration Test'],
        customFields: {
          'Test Field': 'Test Value',
          'Integration': 'Resend + GHL'
        }
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Test contact created in GHL',
        result 
      });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Invalid test type. Use "email" or "ghl"' 
    });

  } catch (error) {
    console.error('Integration test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Test failed: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Integration test endpoint',
    usage: 'POST with { testType: "email"|"ghl", email: "test@example.com", name: "Test Name" }'
  });
}
