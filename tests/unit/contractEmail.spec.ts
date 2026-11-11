import { test, expect } from '@playwright/test';
import { contractEmailDelivery, generateContractEmailHTML } from '../../src/lib/emailService';

test('janitorial email uses the company supplied from settings', () => {
  const html = generateContractEmailHTML({
    clientName: 'Pat <Sample>',
    clientEmail: 'pat.sample@example.com',
    facilityName: 'Sample Office Park',
    monthlyRate: 4340,
    contractTerm: 12,
    companyName: 'North Glass & Clean',
    companyPhone: '(336) 555-0199',
    companyEmail: 'office@northglass.example',
    pdfAttachment: { filename: 'contract.pdf', content: 'AAAA' },
  });

  expect(html).toContain('North Glass &amp; Clean');
  expect(html).toContain('(336) 555-0199');
  expect(html).toContain('office@northglass.example');
  expect(html).toContain('Pat &lt;Sample&gt;');
  expect(html).not.toContain('Big Bro Pros');
  expect(html).not.toContain('(336) 123-4567');
  expect(html).not.toContain('bids@bigbropros.com');
});

test('contract email keeps the verified mailbox and replies to the company', () => {
  const delivery = contractEmailDelivery({
    companyName: 'North Glass & Clean',
    companyEmail: 'office@northglass.example',
  });

  expect(delivery.from).toBe('North Glass & Clean <noreply@bigbropros.com>');
  expect(delivery.replyTo).toBe('office@northglass.example');
  expect(delivery.from).not.toContain('northglass.example');
});

test('a company name with a comma stays a display name on the same mailbox', () => {
  const delivery = contractEmailDelivery({
    companyName: 'North, Glass',
    companyEmail: 'not-an-email',
  });

  expect(delivery.from).toBe('"North, Glass" <noreply@bigbropros.com>');
  expect(delivery.replyTo).toBeUndefined();
});
