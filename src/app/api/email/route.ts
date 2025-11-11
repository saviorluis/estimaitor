/**
 * Consolidated Email API Route
 * Handles all email functionality in one place
 */

import { NextRequest, NextResponse } from 'next/server';
import { emailService, QuoteEmailData, ContactFormData, EstimateEmailData, ContractEmailData } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json();

    switch (type) {
      case 'quote':
        const quoteResult = await emailService.sendQuote(data as QuoteEmailData);
        return NextResponse.json(quoteResult);

      case 'contact':
        const contactResult = await emailService.sendContactFormNotification(data as ContactFormData);
        return NextResponse.json(contactResult);

      case 'estimate':
        const estimateResult = await emailService.sendEstimateReady(data as EstimateEmailData);
        return NextResponse.json(estimateResult);

      case 'contract':
        const contractResult = await emailService.sendContract(data as ContractEmailData);
        return NextResponse.json(contractResult);

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid email type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

