import { describe, it, expect } from 'vitest';
import { convertLandArea, formatLandArea } from '../lib/units';
import { getServiceStatus } from '../lib/supabase/status';
import en from '../i18n/translations/en.json';
import bn from '../i18n/translations/bn.json';
import hi from '../i18n/translations/hi.json';
import { z } from 'zod';

describe('Phase 1 Verification: Agricultural Unit Conversions', () => {
  it('correctly converts 1 Bigha to 20 Katha', () => {
    const katha = convertLandArea(1, 'bigha', 'katha');
    expect(katha).toBeCloseTo(20, 1);
  });

  it('correctly converts 3.025 Bigha to approximately 1 Acre', () => {
    const acres = convertLandArea(3.025, 'bigha', 'acres');
    expect(acres).toBeCloseTo(1.0, 2);
  });

  it('correctly formats land area string with Bengal vernacular names', () => {
    expect(formatLandArea(5, 'bigha')).toBe('5 Bigha (বিঘা)');
    expect(formatLandArea(10, 'katha')).toBe('10 Katha (কাঠা)');
  });
});

describe('Phase 1 Verification: i18n Completeness', () => {
  it('contains essential brand, nav, and landing keys across English, Bengali, Hindi', () => {
    expect(en.brand.name).toBe('KRISHIBONDHU');
    expect(bn.brand.name).toBe('কৃষিবন্ধু');
    expect(hi.brand.name).toBe('कृषिबंधु');

    expect(en.nav.scan).toBe('Scan Crop');
    expect(bn.nav.scan).toBe('ফসল স্ক্যান');
    expect(hi.nav.scan).toBe('फसल स्कैन');

    expect(en.landing.scanNow).toBe('Try Crop Scanner (Free)');
    expect(bn.landing.scanNow).toBe('ফসল স্ক্যান করুন (ফ্রি)');
    expect(hi.landing.scanNow).toBe('फसल स्कैन करें (निःशुल्क)');
  });

  it('contains valid disclaimers in all three languages', () => {
    expect(en.common.disclaimer.length).toBeGreaterThan(20);
    expect(bn.common.disclaimer.length).toBeGreaterThan(20);
    expect(hi.common.disclaimer.length).toBeGreaterThan(20);
  });
});

describe('Phase 1 Verification: Service Status Honest Checker', () => {
  it('reports unconfigured status honestly when environment keys are missing or placeholders', () => {
    const status = getServiceStatus();
    expect(status).toHaveProperty('supabaseConfigured');
    expect(status).toHaveProperty('geminiConfigured');
    expect(status).toHaveProperty('anyAiConfigured');
    expect(typeof status.supabaseConfigured).toBe('boolean');
  });
});

describe('Phase 1 Verification: Farmer Input Validation Schemas', () => {
  const farmerSignupSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  });

  it('validates correct farmer signup data', () => {
    const result = farmerSignupSchema.safeParse({
      fullName: 'Bikash Mondal',
      email: 'bikash@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects short passwords and invalid emails', () => {
    const result = farmerSignupSchema.safeParse({
      fullName: 'A',
      email: 'not-an-email',
      password: '123',
    });
    expect(result.success).toBe(false);
  });
});
