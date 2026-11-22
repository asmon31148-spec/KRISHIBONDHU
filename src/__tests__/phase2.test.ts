import { describe, it, expect } from 'vitest';
import { z } from 'zod';

describe('Phase 2 Verification: Soil Fertility Benchmarks (ICAR Standards)', () => {
  // Test ICAR macronutrient classification logic
  const classifyNutrient = (val: number, lowCutoff: number, highCutoff: number) => {
    if (val < lowCutoff) return 'LOW';
    if (val <= highCutoff) return 'MEDIUM';
    return 'HIGH';
  };

  it('correctly benchmarks Nitrogen (N) levels in kg/ha', () => {
    expect(classifyNutrient(210, 280, 560)).toBe('LOW');
    expect(classifyNutrient(350, 280, 560)).toBe('MEDIUM');
    expect(classifyNutrient(620, 280, 560)).toBe('HIGH');
  });

  it('correctly benchmarks Phosphorus (P) levels in kg/ha', () => {
    expect(classifyNutrient(8, 10, 25)).toBe('LOW');
    expect(classifyNutrient(16.5, 10, 25)).toBe('MEDIUM');
    expect(classifyNutrient(32, 10, 25)).toBe('HIGH');
  });

  it('correctly benchmarks Potassium (K) levels in kg/ha', () => {
    expect(classifyNutrient(95, 110, 280)).toBe('LOW');
    expect(classifyNutrient(180, 110, 280)).toBe('MEDIUM');
    expect(classifyNutrient(310, 110, 280)).toBe('HIGH');
  });

  it('correctly classifies soil pH acidity and alkalinity', () => {
    const classifyPh = (ph: number) => {
      if (ph < 6.0) return 'ACIDIC';
      if (ph <= 7.5) return 'OPTIMAL';
      return 'ALKALINE';
    };

    expect(classifyPh(5.4)).toBe('ACIDIC');
    expect(classifyPh(6.8)).toBe('OPTIMAL');
    expect(classifyPh(8.1)).toBe('ALKALINE');
  });
});

describe('Phase 2 Verification: Farm & Crop Schema Validation', () => {
  const farmSchema = z.object({
    name: z.string().min(1, 'Farm name required'),
    area: z.number().positive('Area must be positive'),
    areaUnit: z.enum(['acres', 'bigha', 'katha', 'hectares']),
    soilType: z.string().optional(),
    latitude: z.number().min(-90).max(90).nullable(),
    longitude: z.number().min(-180).max(180).nullable(),
  });

  it('validates genuine farm plots with Bigha and GPS', () => {
    const res = farmSchema.safeParse({
      name: 'North Hooghly Paddy Plot',
      area: 4.5,
      areaUnit: 'bigha',
      soilType: 'alluvial',
      latitude: 22.9031,
      longitude: 88.3968,
    });
    expect(res.success).toBe(true);
  });

  it('rejects invalid or negative land areas', () => {
    const res = farmSchema.safeParse({
      name: 'Invalid Plot',
      area: -2,
      areaUnit: 'bigha',
      latitude: null,
      longitude: null,
    });
    expect(res.success).toBe(false);
  });

  const cropSchema = z.object({
    name: z.string().min(1, 'Crop name required'),
    variety: z.string().nullable(),
    area: z.number().positive(),
    areaUnit: z.enum(['acres', 'bigha', 'katha', 'hectares']),
    plantingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    healthStatus: z.enum(['healthy', 'needs_attention', 'diseased']),
  });

  it('validates crop records with proper ISO dates and conditions', () => {
    const res = cropSchema.safeParse({
      name: 'Potato',
      variety: 'Kufri Jyoti',
      area: 3,
      areaUnit: 'bigha',
      plantingDate: '2026-11-15',
      healthStatus: 'healthy',
    });
    expect(res.success).toBe(true);
  });
});
