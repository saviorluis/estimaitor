/**
 * Consolidated Email Service using Resend
 * Handles all email functionality in one place
 */

import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY || 'dummy-key-for-build');

// Email templates
export const EMAIL_TEMPLATES = {
  QUOTE_SENT: 'quote-sent',
  CONTACT_FORM: 'contact-form',
  ESTIMATE_READY: 'estimate-ready',
  FOLLOW_UP: 'follow-up'
} as const;

// Email types
export interface QuoteEmailData {
  clientName: string;
  clientEmail: string;
  projectName: string;
  totalPrice: number;
  quoteNumber: string;
  pdfUrl?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  projectType: string;
  message: string;
}

export interface EstimateEmailData {
  clientName: string;
  clientEmail: string;
  projectDetails: {
    type: string;
    squareFootage: number;
    cleaningType: string;
    totalPrice: number;
  };
  estimateUrl: string;
}

// Main email service class
export class EmailService {
  private static instance: EmailService;
  private fromEmail = 'EstimAItor <noreply@bigbropros.com>';

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  // Send quote to client
  async sendQuote(data: QuoteEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const { data: result, error } = await resend.emails.send({
        from: this.fromEmail,
        to: [data.clientEmail],
        subject: `Your Cleaning Quote - ${data.quoteNumber}`,
        html: this.generateQuoteEmailHTML(data),
        attachments: data.pdfUrl ? [
          {
            filename: `quote-${data.quoteNumber}.pdf`,
            path: data.pdfUrl
          }
        ] : undefined
      });

      if (error) {
        console.error('Resend error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, messageId: result?.id };
    } catch (error) {
      console.error('Email send error:', error);
      return { success: false, error: 'Failed to send email' };
    }
  }

  // Send contact form notification to admin
  async sendContactFormNotification(data: ContactFormData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const { data: result, error } = await resend.emails.send({
        from: this.fromEmail,
        to: ['bids@bigbropros.com'],
        subject: `New Contact Form Submission - ${data.projectType}`,
        html: this.generateContactFormHTML(data)
      });

      if (error) {
        console.error('Resend error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, messageId: result?.id };
    } catch (error) {
      console.error('Email send error:', error);
      return { success: false, error: 'Failed to send email' };
    }
  }

  // Send estimate ready notification
  async sendEstimateReady(data: EstimateEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const { data: result, error } = await resend.emails.send({
        from: this.fromEmail,
        to: [data.clientEmail],
        subject: `Your Cleaning Estimate is Ready - ${data.projectDetails.type}`,
        html: this.generateEstimateReadyHTML(data)
      });

      if (error) {
        console.error('Resend error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, messageId: result?.id };
    } catch (error) {
      console.error('Email send error:', error);
      return { success: false, error: 'Failed to send email' };
    }
  }

  // Generate quote email HTML
  private generateQuoteEmailHTML(data: QuoteEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Cleaning Quote</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .quote-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .price { font-size: 24px; font-weight: bold; color: #059669; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Cleaning Quote is Ready!</h1>
            <p>Quote #${data.quoteNumber}</p>
          </div>
          
          <div class="content">
            <p>Dear ${data.clientName},</p>
            
            <p>Thank you for your interest in our cleaning services. We've prepared a detailed quote for your project: <strong>${data.projectName}</strong></p>
            
            <div class="quote-details">
              <h3>Quote Summary</h3>
              <p><strong>Project:</strong> ${data.projectName}</p>
              <p><strong>Total Investment:</strong> <span class="price">$${data.totalPrice.toLocaleString()}</span></p>
              <p><strong>Quote Number:</strong> ${data.quoteNumber}</p>
            </div>
            
            <p>This quote includes all labor, materials, and equipment needed for your project. We're committed to delivering exceptional results that exceed your expectations.</p>
            
            <p>To proceed with this project, please reply to this email or call us at (336) 123-4567.</p>
            
            <div style="text-align: center;">
              <a href="tel:+13361234567" class="button">Call Us Now</a>
              <a href="mailto:bids@bigbropros.com" class="button">Reply to Quote</a>
            </div>
            
            <p>We look forward to working with you!</p>
            
            <p>Best regards,<br>
            The Big Bro Pros Team</p>
          </div>
          
          <div class="footer">
            <p>Big Bro Pros | Professional Cleaning Services<br>
            Phone: (336) 123-4567 | Email: bids@bigbropros.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate contact form HTML
  private generateContactFormHTML(data: ContactFormData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Contact Form Submission</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .field { margin: 15px 0; }
          .label { font-weight: bold; color: #374151; }
          .value { background: white; padding: 10px; border-radius: 4px; margin-top: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Contact Form Submission</h1>
            <p>Project Type: ${data.projectType}</p>
          </div>
          
          <div class="content">
            <div class="field">
              <div class="label">Name:</div>
              <div class="value">${data.name}</div>
            </div>
            
            <div class="field">
              <div class="label">Email:</div>
              <div class="value">${data.email}</div>
            </div>
            
            <div class="field">
              <div class="label">Phone:</div>
              <div class="value">${data.phone}</div>
            </div>
            
            <div class="field">
              <div class="label">Project Type:</div>
              <div class="value">${data.projectType}</div>
            </div>
            
            <div class="field">
              <div class="label">Message:</div>
              <div class="value">${data.message}</div>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: #dbeafe; border-radius: 8px;">
              <p><strong>Action Required:</strong> Please respond to this inquiry within 24 hours.</p>
              <p><strong>Reply to:</strong> ${data.email}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate estimate ready HTML
  private generateEstimateReadyHTML(data: EstimateEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Your Estimate is Ready</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .estimate-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Estimate is Ready!</h1>
            <p>${data.projectDetails.type} Cleaning Project</p>
          </div>
          
          <div class="content">
            <p>Dear ${data.clientName},</p>
            
            <p>Your personalized cleaning estimate has been prepared and is ready for review.</p>
            
            <div class="estimate-details">
              <h3>Project Details</h3>
              <p><strong>Project Type:</strong> ${data.projectDetails.type}</p>
              <p><strong>Square Footage:</strong> ${data.projectDetails.squareFootage.toLocaleString()} sq ft</p>
              <p><strong>Cleaning Type:</strong> ${data.projectDetails.cleaningType}</p>
              <p><strong>Estimated Total:</strong> $${data.projectDetails.totalPrice.toLocaleString()}</p>
            </div>
            
            <p>Click the button below to view your detailed estimate and get started with your project.</p>
            
            <div style="text-align: center;">
              <a href="${data.estimateUrl}" class="button">View My Estimate</a>
            </div>
            
            <p>Questions? Reply to this email or call us at (336) 123-4567.</p>
            
            <p>Best regards,<br>
            The Big Bro Pros Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance();

