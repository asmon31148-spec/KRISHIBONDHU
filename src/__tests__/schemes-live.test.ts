import { describe, it, expect } from 'vitest';
import { GET } from '../app/api/schemes/verify-live/route';
import { NextRequest } from 'next/server';

describe('Live Scheme Internet Verification Test', () => {
  it('returns live internet verification for Bangla Shasya Bima', async () => {
    const req = new NextRequest('http://localhost:3000/api/schemes/verify-live?schemeId=bangla-shasya-bima');
    const res = await GET(req);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.verification.schemeId).toBe('bangla-shasya-bima');
    expect(['active', 'review', 'closed']).toContain(data.verification.status);
    expect(data.verification.officialPortalUrl).toContain('banglashasyabima.net');
    expect(data.verification.verifiedDate).toBeDefined();
  }, 15000);

  it('returns batch live internet verifications for all major schemes', async () => {
    const req = new NextRequest('http://localhost:3000/api/schemes/verify-live');
    const res = await GET(req);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.verifications).toBeDefined();
    expect(data.verifications['bangla-shasya-bima']).toBeDefined();
    expect(data.verifications['krishak-bandhu']).toBeDefined();
    expect(data.verifications['pm-kisan']).toBeDefined();
  }, 20000);
});
