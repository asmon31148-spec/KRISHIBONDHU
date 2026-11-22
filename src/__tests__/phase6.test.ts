import { describe, it, expect } from 'vitest';
import { calculateYieldPrediction, CROP_BASELINES } from '../lib/yield/engine';

describe('Phase 6: Yield Prediction Engine & Analytics', () => {
  it('loads published ICAR baseline crops properly', () => {
    expect(CROP_BASELINES['rice_aman']).toBeDefined();
    expect(CROP_BASELINES['rice_aman'].avgTonsPerAcre).toBe(2.1);
    expect(CROP_BASELINES['potato']).toBeDefined();
    expect(CROP_BASELINES['potato'].avgTonsPerAcre).toBe(10.5);
    expect(CROP_BASELINES['jute']).toBeDefined();
    expect(CROP_BASELINES['mustard']).toBeDefined();
  });

  it('calculates baseline yield for optimal conditions', () => {
    const prediction = calculateYieldPrediction({
      cropKey: 'rice_aman',
      area: 1,
      areaUnit: 'acres',
      healthStatus: 'healthy',
      irrigationType: 'standard',
    });

    expect(prediction.cropName).toContain('Rice');
    expect(prediction.areaInAcres).toBe(1);
    expect(prediction.estimatedYieldPerAcreTons).toBe(2.1);
    expect(prediction.totalExpectedProductionTons).toBe(2.1);
    expect(prediction.factors.healthMultiplier).toBe(1.0);
    expect(prediction.confidenceScore).toBeGreaterThanOrEqual(80);
    expect(prediction.recommendations.length).toBeGreaterThan(0);
  });

  it('adjusts yield penalties for diseased crop and rainfed irrigation', () => {
    const diseasedRainfed = calculateYieldPrediction({
      cropKey: 'rice_aman',
      area: 2,
      areaUnit: 'acres',
      healthStatus: 'diseased',
      irrigationType: 'rainfed',
    });

    // Healthy baseline is 2.1 tons/acre
    // Diseased: 0.68, Rainfed: 0.88 -> combined ~ 0.5984
    // 2.1 * 0.5984 ~ 1.26 tons/acre
    expect(diseasedRainfed.estimatedYieldPerAcreTons).toBeLessThan(2.0);
    expect(diseasedRainfed.factors.healthMultiplier).toBe(0.68);
    expect(diseasedRainfed.factors.irrigationMultiplier).toBe(0.88);
    expect(diseasedRainfed.recommendations.some(r => r.includes('leaf lesions'))).toBe(true);
    expect(diseasedRainfed.recommendations.some(r => r.includes('Rainfed'))).toBe(true);
  });

  it('correctly calculates West Bengal regional units (Bigha and Katha)', () => {
    // 1 Bigha = 0.3305785 Acres = 20 Katha
    const prediction = calculateYieldPrediction({
      cropKey: 'potato',
      area: 3,
      areaUnit: 'bigha',
      healthStatus: 'healthy',
      irrigationType: 'drip',
      ph: 6.5,
      nitrogenKgHa: 300,
    });

    expect(prediction.areaInAcres).toBeCloseTo(3 * 0.3305785, 2);
    expect(prediction.yieldPerBighaTons).toBeGreaterThan(0);
    expect(prediction.yieldPerKathaKg).toBeGreaterThan(0);
    // Yield per katha should equal (yield per bigha * 1000 kg) / 20 katha
    const expectedKg = Math.round((prediction.yieldPerBighaTons * 1000) / 20);
    expect(prediction.yieldPerKathaKg).toBe(expectedKg);
  });

  it('incorporates soil nutrient and acidity penalties accurately', () => {
    const acidicLowNutrient = calculateYieldPrediction({
      cropKey: 'wheat',
      area: 1,
      areaUnit: 'acres',
      healthStatus: 'healthy',
      irrigationType: 'sprinkler',
      nitrogenKgHa: 180, // low
      ph: 5.2, // acidic
    });

    expect(acidicLowNutrient.factors.phMultiplier).toBe(0.92);
    expect(acidicLowNutrient.factors.soilNutrientMultiplier).toBeLessThan(1.0);
    expect(acidicLowNutrient.recommendations.some(r => r.includes('acidic') || r.includes('lime'))).toBe(true);
  });

  it('projects harvest date accurately using crop growing days', () => {
    const sowingDate = '2026-11-01';
    const prediction = calculateYieldPrediction({
      cropKey: 'potato', // 90 days duration
      area: 1,
      areaUnit: 'acres',
      healthStatus: 'healthy',
      irrigationType: 'tube well',
      plantingDate: sowingDate,
    });

    const expectedHarvest = new Date(new Date(sowingDate).getTime() + 90 * 86400000)
      .toISOString()
      .split('T')[0];
    expect(prediction.estimatedHarvestDate).toBe(expectedHarvest);
  });
});
