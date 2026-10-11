/**
 * Email service (Resend). Server-only: imported by /api/email.
 * Only the janitorial contract email is supported; content comes from a fixed template.
 */

import { Resend } from 'resend';

export interface ContractEmailData {
  clientName: string;
  clientEmail: string;
  facilityName: string;
  monthlyRate: number;
  contractTerm: number;
  pdfAttachment: {
    filename: string;
    content: string; // base64-encoded PDF
  };
}

export type SendResult = { success: boolean; messageId?: string; error?: string };

const FROM_EMAIL = 'Big Bro Pros <noreply@bigbropros.com>';

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendContractEmail(data: ContractEmailData): Promise<SendResult> {
  if (!isEmailConfigured()) {
    return { success: false, error: 'Email is not configured' };
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [data.clientEmail],
      subject: `Janitorial Service Contract - ${data.facilityName}`,
      html: generateContractEmailHTML(data),
      attachments: [{ filename: data.pdfAttachment.filename, content: data.pdfAttachment.content }],
    });

    if (error) {
      console.error('Resend error:', error.name);
      return { success: false, error: 'Failed to send email' };
    }
    return { success: true, messageId: result?.id };
  } catch (error) {
    console.error('Email send error:', error instanceof Error ? error.name : 'unknown');
    return { success: false, error: 'Failed to send email' };
  }
}

function generateContractEmailHTML(data: ContractEmailData): string {
  const facilityName = escapeHtml(data.facilityName);
  const clientName = escapeHtml(data.clientName);
  const monthlyRate = escapeHtml(data.monthlyRate.toLocaleString('en-US'));
  const contractTerm = escapeHtml(String(data.contractTerm));
  return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Janitorial Service Contract</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #7c3aed; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .contract-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { margin: 10px 0; }
          .detail-label { font-weight: bold; color: #374151; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Janitorial Service Contract</h1>
            <p>${facilityName}</p>
          </div>
          
          <div class="content">
            <p>Dear ${clientName},</p>
            
            <p>Thank you for choosing our janitorial services. Please find attached your service contract for <strong>${facilityName}</strong>.</p>
            
            <div class="contract-details">
              <h3>Contract Summary</h3>
              <div class="detail-row">
                <span class="detail-label">Facility:</span> ${facilityName}
              </div>
              <div class="detail-row">
                <span class="detail-label">Monthly Rate:</span> $${monthlyRate}
              </div>
              <div class="detail-row">
                <span class="detail-label">Contract Term:</span> ${contractTerm} months
              </div>
            </div>
            
            <p>The attached contract includes all service details, terms and conditions, and pricing information. Please review it carefully and let us know if you have any questions or need any modifications.</p>
            
            <p>To proceed with this contract, please sign and return it to us at your earliest convenience.</p>
            
            <p>If you have any questions or need to make changes, please contact us at (336) 123-4567 or bids@bigbropros.com.</p>
            
            <p>We look forward to providing you with excellent janitorial services!</p>
            
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
