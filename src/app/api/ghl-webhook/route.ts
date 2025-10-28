import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/emailService';

/**
 * GoHighLevel Webhook Integration
 * Handles incoming webhooks from GHL and sends emails via Resend
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify webhook signature (optional but recommended)
    const signature = request.headers.get('x-ghl-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    // Handle different GHL webhook events
    switch (body.type) {
      case 'contact.created':
        await handleNewContact(body.data);
        break;
      case 'opportunity.created':
        await handleNewOpportunity(body.data);
        break;
      case 'appointment.scheduled':
        await handleAppointmentScheduled(body.data);
        break;
      default:
        console.log('Unhandled webhook type:', body.type);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('GHL Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleNewContact(contactData: any) {
  // Send welcome email to new contact
  const result = await emailService.sendEstimateReady({
    clientName: contactData.firstName + ' ' + contactData.lastName,
    clientEmail: contactData.email,
    projectDetails: {
      type: 'New Contact',
      squareFootage: 0,
      cleaningType: 'Welcome',
      totalPrice: 0
    },
    estimateUrl: `${process.env.NEXT_PUBLIC_APP_URL}/estimate`
  });

  console.log('Welcome email sent:', result);
}

async function handleNewOpportunity(opportunityData: any) {
  // Send quote follow-up email
  const result = await emailService.sendQuote({
    clientName: opportunityData.contact?.firstName + ' ' + opportunityData.contact?.lastName,
    clientEmail: opportunityData.contact?.email,
    projectName: opportunityData.title || 'Cleaning Project',
    totalPrice: opportunityData.value || 0,
    quoteNumber: opportunityData.id,
    pdfUrl: undefined
  });

  console.log('Quote email sent:', result);
}

async function handleAppointmentScheduled(appointmentData: any) {
  // Send appointment confirmation
  console.log('Appointment scheduled:', appointmentData);
  // Add appointment confirmation email logic here
}
