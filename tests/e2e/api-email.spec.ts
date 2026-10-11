import { test, expect, type APIRequestContext } from '@playwright/test';

// Tests run with RESEND_API_KEY='' (see playwright.config.ts): a payload that passes every
// check gets 503 "not configured", so nothing is ever sent.

const PDF_B64 = Buffer.from('%PDF-1.4\n% sample contract\n%%EOF\n').toString('base64');

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    type: 'contract',
    data: {
      clientName: 'Pat Sample',
      clientEmail: 'pat.sample@example.com',
      facilityName: 'Sample Office Park',
      monthlyRate: 4340,
      contractTerm: 12,
      pdfAttachment: { filename: 'Sample_Office_Park_Contract.pdf', content: PDF_B64 },
      ...overrides,
    },
  };
}

let ipCounter = 0;
function post(request: APIRequestContext, baseURL: string, body: unknown, headers: Record<string, string> = {}) {
  ipCounter += 1;
  return request.post('/api/email', {
    data: body,
    headers: { origin: baseURL, 'x-forwarded-for': `203.0.113.${ipCounter}`, ...headers },
  });
}

test.describe('/api/email hardening', () => {
  test('valid contract payload passes validation and reports unconfigured email', async ({ request, baseURL }) => {
    const res = await post(request, baseURL!, validPayload());
    expect(res.status()).toBe(503);
    expect(await res.json()).toEqual({ success: false, error: 'Email is not configured' });
  });

  test('contract term sent as a select string ("24") is accepted', async ({ request, baseURL }) => {
    const res = await post(request, baseURL!, validPayload({ contractTerm: '24' }));
    expect(res.status()).toBe(503);
  });

  test('rejects requests without a same-origin Origin header', async ({ request, baseURL }) => {
    const noOrigin = await request.post('/api/email', { data: validPayload(), headers: { 'x-forwarded-for': '203.0.113.200' } });
    expect(noOrigin.status()).toBe(403);
    const foreign = await post(request, baseURL!, validPayload(), { origin: 'https://evil.example' });
    expect(foreign.status()).toBe(403);
  });

  test('only the contract email type is allowed', async ({ request, baseURL }) => {
    for (const type of ['quote', 'contact', 'estimate', 'anything']) {
      const res = await post(request, baseURL!, { ...validPayload(), type });
      expect(res.status(), type).toBe(400);
      expect((await res.json()).error).toBe('Invalid email type');
    }
  });

  const invalid: Array<[string, Record<string, unknown>, string]> = [
    ['bad email', { clientEmail: 'not-an-email' }, 'Invalid client email'],
    ['multiple recipients', { clientEmail: 'a@example.com,b@example.com' }, 'Invalid client email'],
    ['header injection in email', { clientEmail: 'a@example.com\r\nBcc: x@example.com' }, 'Invalid client email'],
    ['missing name', { clientName: '' }, 'Invalid client name'],
    ['overlong facility', { facilityName: 'x'.repeat(151) }, 'Invalid facility name'],
    ['non-numeric rate', { monthlyRate: '4340' }, 'Invalid monthly rate'],
    ['negative rate', { monthlyRate: -1 }, 'Invalid monthly rate'],
    ['unsupported term', { contractTerm: 18 }, 'Invalid contract term'],
    ['no attachment', { pdfAttachment: undefined }, 'Missing contract PDF'],
    ['path in filename', { pdfAttachment: { filename: '../x.pdf', content: PDF_B64 } }, 'Invalid attachment filename'],
    ['non-pdf filename', { pdfAttachment: { filename: 'contract.exe', content: PDF_B64 } }, 'Invalid attachment filename'],
    ['non-pdf content', { pdfAttachment: { filename: 'c.pdf', content: Buffer.from('MZ fake exe').toString('base64') } }, 'Attachment must be a PDF'],
    ['not base64', { pdfAttachment: { filename: 'c.pdf', content: '%%%%' } }, 'Invalid attachment content'],
  ];
  for (const [label, overrides, error] of invalid) {
    test(`rejects ${label}`, async ({ request, baseURL }) => {
      const res = await post(request, baseURL!, validPayload(overrides));
      expect(res.status()).toBe(400);
      expect((await res.json()).error).toBe(error);
    });
  }

  test('caller-supplied subject/html are ignored, not rejected', async ({ request, baseURL }) => {
    const res = await post(request, baseURL!, validPayload({ subject: 'Phish', html: '<a href="https://evil.example">x</a>' }));
    expect(res.status()).toBe(503);
  });

  test('rate limits a single client after 5 requests in the window', async ({ request, baseURL }) => {
    const headers = { origin: baseURL!, 'x-forwarded-for': '198.51.100.7' };
    const statuses: number[] = [];
    for (let i = 0; i < 7; i++) {
      statuses.push((await request.post('/api/email', { data: validPayload(), headers })).status());
    }
    expect(statuses).toEqual([503, 503, 503, 503, 503, 429, 429]);
  });
});
