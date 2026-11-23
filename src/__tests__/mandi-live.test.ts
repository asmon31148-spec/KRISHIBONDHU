import { describe, it, expect } from 'vitest';
import { GET } from '../app/api/mandi/prices/route';
import { NextRequest } from 'next/server';

describe('Live Agmarknet Data.gov.in Integration Test', () => {
  it('fetches real live West Bengal market rates for Mustard', async () => {
    const req = new NextRequest('http://localhost:3000/api/mandi/prices?commodity=Mustard&district=All%20Districts');
    const res = await GET(req);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.source).toBe('live_agmarknet');
    expect(data.records.length).toBeGreaterThan(0);
    expect(data.records[0].commodity.toLowerCase()).toContain('mustard');
    expect(data.records[0].modal_price).toBeGreaterThan(0);
  }, 35000);

  it('fetches real live West Bengal market rates for Raw Jute', async () => {
    const req = new NextRequest('http://localhost:3000/api/mandi/prices?commodity=Jute&district=All%20Districts');
    const res = await GET(req);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.source).toBe('live_agmarknet');
    expect(data.records.length).toBeGreaterThan(0);
    expect(data.records[0].commodity.toLowerCase()).toContain('jute');
  }, 35000);

  it('correctly calculates price_per_kg and price_per_50kg bag from live modal price', async () => {
    const req = new NextRequest('http://localhost:3000/api/mandi/prices?commodity=all&district=All%20Districts');
    const res = await GET(req);
    const data = await res.json();

    expect(data.records.length).toBeGreaterThan(10);
    const r = data.records[0];
    expect(r.price_per_kg).toBe(Math.round((r.modal_price / 100) * 10) / 10);
    expect(r.price_per_50kg).toBe(Math.round(r.modal_price / 2));
  }, 15000);
});
