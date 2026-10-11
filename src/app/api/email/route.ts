/**
 * Email API: sends the janitorial contract PDF to the client.
 *
 * There is no user authentication in this app, so protection is limited to:
 * same-origin requests only, per-IP rate limiting (best effort; in-memory state is
 * per serverless instance), strict payload validation, and a fixed email template.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isEmailConfigured, sendContractEmail, type ContractEmailData } from '@/lib/emailService';

export const runtime = 'nodejs';

const MAX_BODY_CHARS = 4_000_000; // Vercel rejects request bodies over 4.5 MB
const MAX_PDF_BYTES = 2_500_000;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const CONTRACT_TERMS = new Set([6, 12, 24, 36]);
const EMAIL_RE = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
const FILENAME_RE = /^[A-Za-z0-9_-]{1,200}\.pdf$/;
const BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/;

const hits = new Map<string, number[]>();

function fail(status: number, error: string) {
  return NextResponse.json({ success: false, error }, { status });
}

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function isRateLimited(request: NextRequest): boolean {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.ip || 'unknown';
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    hits.forEach((times, key) => {
      if (times.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) hits.delete(key);
    });
  }
  return recent.length > RATE_LIMIT_MAX;
}

function text(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max || /[\r\n\u0000-\u001f\u007f]/.test(trimmed)) return null;
  return trimmed;
}

function validateContract(data: unknown): { value: ContractEmailData } | { error: string } {
  if (!data || typeof data !== 'object') return { error: 'Missing contract data' };
  const d = data as Record<string, unknown>;

  const clientName = text(d.clientName, 100);
  if (!clientName) return { error: 'Invalid client name' };

  const clientEmail = text(d.clientEmail, 254);
  if (!clientEmail || !EMAIL_RE.test(clientEmail)) return { error: 'Invalid client email' };

  const facilityName = text(d.facilityName, 150);
  if (!facilityName) return { error: 'Invalid facility name' };

  const monthlyRate = typeof d.monthlyRate === 'number' ? d.monthlyRate : NaN;
  if (!Number.isFinite(monthlyRate) || monthlyRate <= 0 || monthlyRate > 10_000_000) {
    return { error: 'Invalid monthly rate' };
  }

  const contractTerm = Number(d.contractTerm);
  if (!CONTRACT_TERMS.has(contractTerm)) return { error: 'Invalid contract term' };

  const attachment = d.pdfAttachment as Record<string, unknown> | undefined;
  if (!attachment || typeof attachment !== 'object') return { error: 'Missing contract PDF' };
  const filename = typeof attachment.filename === 'string' ? attachment.filename : '';
  if (!FILENAME_RE.test(filename)) return { error: 'Invalid attachment filename' };
  const content = typeof attachment.content === 'string' ? attachment.content : '';
  if (!content || content.length % 4 !== 0 || !BASE64_RE.test(content)) {
    return { error: 'Invalid attachment content' };
  }
  const pdf = Buffer.from(content, 'base64');
  if (pdf.length > MAX_PDF_BYTES) return { error: 'Attachment too large' };
  if (pdf.subarray(0, 5).toString('latin1') !== '%PDF-') return { error: 'Attachment must be a PDF' };

  return {
    value: { clientName, clientEmail, facilityName, monthlyRate, contractTerm, pdfAttachment: { filename, content } },
  };
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return fail(403, 'Forbidden');
  if (isRateLimited(request)) return fail(429, 'Too many requests. Please try again later.');

  const raw = await request.text();
  if (raw.length > MAX_BODY_CHARS) return fail(413, 'Request too large');

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail(400, 'Invalid JSON');
  }

  const { type, data } = (body || {}) as { type?: unknown; data?: unknown };
  if (type !== 'contract') return fail(400, 'Invalid email type');

  const result = validateContract(data);
  if ('error' in result) return fail(400, result.error);

  if (!isEmailConfigured()) return fail(503, 'Email is not configured');

  const sent = await sendContractEmail(result.value);
  return NextResponse.json(sent, { status: sent.success ? 200 : 502 });
}
