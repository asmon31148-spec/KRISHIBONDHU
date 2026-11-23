import { describe, it, expect } from 'vitest';
import {
  CROP_BASELINES,
  calculateFertilizerDosage,
} from '../lib/agronomy/fertilizer';

describe('Fertilizer Dosage & Nutrition Engine Tests', () => {
  it('contains over 25 published ICAR and BCKV crops across all categories', () => {
    const crops = Object.values(CROP_BASELINES);
    expect(crops.length).toBeGreaterThanOrEqual(25);

    // Verify presence of all major smallholder crops
    expect(CROP_BASELINES.aman_paddy).toBeDefined();
    expect(CROP_BASELINES.boro_paddy).toBeDefined();
    expect(CROP_BASELINES.wheat).toBeDefined();
    expect(CROP_BASELINES.maize).toBeDefined();
    expect(CROP_BASELINES.potato).toBeDefined();
    expect(CROP_BASELINES.brinjal).toBeDefined();
    expect(CROP_BASELINES.tomato).toBeDefined();
    expect(CROP_BASELINES.pointed_gourd).toBeDefined();
    expect(CROP_BASELINES.mustard).toBeDefined();
    expect(CROP_BASELINES.lentil).toBeDefined();
    expect(CROP_BASELINES.ginger).toBeDefined();
    expect(CROP_BASELINES.turmeric).toBeDefined();
  });

  it('calculates authentic single fertilizer dosage (Urea+SSP+MOP) for 1 Bigha Aman Paddy', () => {
    // 1 Bigha = 0.1338 ha. Aman Paddy N:P:K = 80:40:40 kg/ha
    // N = 0.1338 * 80 = 10.704 kg -> Urea (46% N) = 10.704 / 0.46 = 23.3 kg
    // P = 0.1338 * 40 = 5.352 kg -> SSP (16% P2O5) = 5.352 / 0.16 = 33.5 kg
    // K = 0.1338 * 40 = 5.352 kg -> MOP (60% K2O) = 5.352 / 0.60 = 8.9 kg
    const res = calculateFertilizerDosage('aman_paddy', 1, 0, 'single');

    expect(res.total_hectares).toBe(0.134);
    expect(res.fertilizers_kg.urea).toBeCloseTo(23.3, 1);
    expect(res.fertilizers_kg.ssp_or_dap).toBeCloseTo(33.5, 1);
    expect(res.fertilizers_kg.mop).toBeCloseTo(8.9, 1);
    expect(res.schedule.length).toBe(3); // Basal, 1st top, 2nd top
  });

  it('calculates complex fertilizer dosage (DAP+Urea+MOP) reducing urea need', () => {
    // For Potato (180:120:120 kg/ha, 1 Bigha = 0.1338 ha)
    // Required P = 0.1338 * 120 = 16.056 kg P2O5
    // DAP (46% P) = 16.056 / 0.46 = 34.9 kg DAP
    // DAP supplies 18% N: 34.9 * 0.18 = 6.28 kg N
    // Required N = 0.1338 * 180 = 24.084 kg N
    // Remaining N = 24.084 - 6.28 = 17.80 kg N -> Urea = 17.80 / 0.46 = 38.7 kg Urea
    const resSingle = calculateFertilizerDosage('potato', 1, 0, 'single');
    const resComplex = calculateFertilizerDosage('potato', 1, 0, 'complex');

    expect(resComplex.fertilizers_kg.ssp_or_dap).toBeCloseTo(34.9, 1);
    expect(resComplex.fertilizers_kg.urea).toBeLessThan(resSingle.fertilizers_kg.urea);
  });

  it('adjusts dosage dynamically based on STCR soil health card ratings', () => {
    // Low soil N increases N requirement by +25%
    // High soil N decreases N requirement by -25%
    const resStandard = calculateFertilizerDosage('wheat', 1, 0, 'single', {
      soilNStatus: 'medium',
    });
    const resLowN = calculateFertilizerDosage('wheat', 1, 0, 'single', {
      soilNStatus: 'low',
    });
    const resHighN = calculateFertilizerDosage('wheat', 1, 0, 'single', {
      soilNStatus: 'high',
    });

    expect(resLowN.fertilizers_kg.urea).toBeGreaterThan(resStandard.fertilizers_kg.urea);
    expect(resHighN.fertilizers_kg.urea).toBeLessThan(resStandard.fertilizers_kg.urea);
    expect(resLowN.fertilizers_kg.urea).toBeCloseTo(resStandard.fertilizers_kg.urea * 1.25, 0);
  });

  it('deducts nutrient credit when organic FYM manure is applied', () => {
    // Applying 2 tons FYM per Bigha saves chemical nitrogen and phosphorus
    const withoutFym = calculateFertilizerDosage('cabbage', 2, 0, 'single', {
      fymAppliedTonsPerBigha: 0,
    });
    const withFym = calculateFertilizerDosage('cabbage', 2, 0, 'single', {
      fymAppliedTonsPerBigha: 2,
    });

    expect(withFym.fertilizers_kg.urea).toBeLessThan(withoutFym.fertilizers_kg.urea);
    expect(withFym.fertilizers_kg.ssp_or_dap).toBeLessThan(withoutFym.fertilizers_kg.ssp_or_dap);
    expect(withFym.savings_estimate_inr).toBeGreaterThan(withoutFym.savings_estimate_inr);
  });

  it('ensures legumes have lower nitrogen requirements and micronutrient alerts', () => {
    const lentil = CROP_BASELINES.lentil;
    expect(lentil.n_kg_ha).toBe(20); // Starter N only, fixes own nitrogen
    expect(lentil.category).toBe('pulses');

    const mustard = CROP_BASELINES.mustard;
    expect(mustard.micronutrients_advice?.en).toContain('Sulfur');
  });
});
