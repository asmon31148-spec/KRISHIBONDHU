import { describe, it, expect } from 'vitest';
import { calculateYieldPrediction } from '../lib/yield/engine';

describe('Responsible Yield Prediction & Economics Engine (Scenarios & Data Levels)', () => {
  it('Scenario A: Pre-cultivation planning works cleanly without soil test report', () => {
    const result = calculateYieldPrediction({
      scenario: 'pre_cultivation',
      cropKey: 'potato',
      area: 2,
      areaUnit: 'bigha',
      irrigationType: 'tube well',
      hasSoilReport: false,
      // Notice: NO pH, NO nitrogen, NO phosphorus provided
    });

    expect(result.scenario).toBe('pre_cultivation');
    expect(result.cropName).toContain('Potato');
    expect(result.areaInBighas).toBeCloseTo(2, 1);
    expect(result.fidelity.level).toBe('indicative_regional');
    expect(result.fidelity.dataPointsMissing).toContain(
      'Soil Health Card / Chemical Laboratory Test (pH & NPK)'
    );

    // Verifies cost of cultivation schedule for Potato
    expect(result.economics.totalPlotCostExpected).toBeGreaterThan(0);
    expect(result.economics.costPerBighaExpected).toBeGreaterThan(12000); // Potato has higher seed tuber cost
    expect(result.economics.breakdown.length).toBeGreaterThan(4);
    expect(
      result.economics.breakdown.some((b) => b.category.includes('Seed Tubers'))
    ).toBe(true);

    // Verifies revenue & profit range
    expect(result.economics.projectedRevenueExpected).toBeGreaterThan(0);
    expect(result.economics.projectedNetProfitExpected).toBeDefined();

    // Verifies honest uncertainty disclaimers
    expect(result.scientificDisclaimers.length).toBeGreaterThan(0);
    expect(result.fidelity.uncertaintyNotice).toContain('widened by ±16%');
  });

  it('Scenario B: In-season prediction calculates days to harvest and health impact', () => {
    const todayStr = new Intl.DateTimeFormat('en-CA').format(new Date());
    const result = calculateYieldPrediction({
      scenario: 'in_season',
      cropKey: 'rice_aman',
      area: 3,
      areaUnit: 'bigha',
      healthStatus: 'needs_attention',
      irrigationType: 'Shallow Tube Well (STW)',
      plantingDate: todayStr,
      variety: 'Swarna (MTU-7029)',
      hasSoilReport: true,
      ph: 6.4,
      nitrogenKgHa: 320,
      phosphorusKgHa: 22,
    });

    expect(result.scenario).toBe('in_season');
    expect(result.factors.healthMultiplier).toBe(0.85); // Needs attention penalty
    expect(result.fidelity.level).toBe('high_precision');
    expect(result.fidelity.dataPointsMissing.length).toBe(0);
    expect(result.daysRemainingToHarvest).toBeGreaterThan(100);
    expect(result.recommendations.some((r) => r.includes('leaf lesions'))).toBe(true);
  });

  it('Never crashes or invents numbers when inputs are minimal', () => {
    const minimal = calculateYieldPrediction({
      cropKey: 'mustard',
      area: 1,
      areaUnit: 'bigha',
      irrigationType: 'rainfed',
    });

    expect(minimal.cropName).toContain('Mustard');
    expect(minimal.totalExpectedProductionTons).toBeGreaterThan(0);
    expect(minimal.yieldPerKathaKg).toBeGreaterThan(0);
    expect(minimal.economics.costPerBighaExpected).toBeGreaterThan(3000);
  });
});
