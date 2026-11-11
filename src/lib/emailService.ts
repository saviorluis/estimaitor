/**
 * Email service (Resend). Server-only: imported by /api/email.
 * Only the janitorial contract email is supported. The message uses the
 * company identity supplied from Settings with the contract.
 */

import { Resend } from 'resend';

export interface ContractEmailData {
  clientName: string;
  clientEmail: string;
  facilityName: string;
  monthlyRate: number;
  contractTerm: number;
  companyName: string;
  companyPhone: string;
  companyEmail: string;
  pdfAttachment: {
    filename: string;
    content: string; // base64-encoded PDF
  };
}

export type SendResult = { success: boolean; messageId?: string; error?: string };

/**
 * The only sending mailbox this app is set up to use. Resend accepts a From
 * address only after that domain is verified on the API key's account.
 * Company Settings can name any business, so the customer domain is not a
 * safe From address. It is used as the display name and Reply-To instead.
 */
const FROM_MAILBOX = 'noreply@bigbropros.com';
const REPLY_EMAIL_RE = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

function fromHeader(companyName: string): string {
  const display = companyName.replace(/[\r\n<>"]/g, '').trim() || 'EstimAItor';
  const quoted = /[",]/.test(display) ? `"${display}"` : display;
  return `${quoted} <${FROM_MAILBOX}>`;
}

function replyAddress(email: string): string | undefined {
  const value = email.replace(/[\r\n]/g, '').trim();
  if (!value || value.length > 254 || /[\s<>"]/.test(value) || !REPLY_EMAIL_RE.test(value)) return undefined;
  return value;
}

/** From stays on the verified mailbox. Reply-To is the company email from Settings. */
export function contractEmailDelivery(data: Pick<ContractEmailData, 'companyName' | 'companyEmail'>): {
  from: string;
  replyTo?: string;
} {
  const replyTo = replyAddress(data.companyEmail);
  return replyTo ? { from: fromHeader(data.companyName), replyTo } : { from: fromHeader(data.companyName) };
}

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
    const delivery = contractEmailDelivery(data);
    const { data: result, error } = await resend.emails.send({
      from: delivery.from,
      ...(delivery.replyTo ? { replyTo: delivery.replyTo } : {}),
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

export function generateContractEmailHTML(data: ContractEmailData): string {
  const facilityName = escapeHtml(data.facilityName);
  const clientName = escapeHtml(data.clientName);
  const monthlyRate = escapeHtml(data.monthlyRate.toLocaleString('en-US'));
  const contractTerm = escapeHtml(String(data.contractTerm));
  const companyName = escapeHtml(data.companyName);
  const companyPhone = escapeHtml(data.companyPhone);
  const companyEmail = escapeHtml(data.companyEmail);
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
            
            <p>If you have any questions or need to make changes, please contact us at ${companyPhone} or ${companyEmail}.</p>
            
            <p>We look forward to providing you with excellent janitorial services!</p>
            
            <p>Best regards,<br>
            ${companyName}</p>
          </div>
          
          <div class="footer">
            <p>${companyName}<br>
            Phone: ${companyPhone} | Email: ${companyEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `;
}
