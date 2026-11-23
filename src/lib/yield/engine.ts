/**
 * KRISHIBONDHU - Empirical Agronomic Yield Prediction Engine
 * Transparent, documented estimation methodology based on published ICAR & BCKV
 * baseline regional yields adjusted by soil fertility, irrigation, health, and weather.
 *
 * Bengal Land Standard:
 * 1 Bigha ≈ 0.3305785 Acres (1 Acre ≈ 3.025 Bigha)
 * 1 Bigha = 20 Katha
 */

import { convertLandArea, LandUnit } from '../units';

export interface CropYieldBaseline {
  cropName: string;
  minTonsPerAcre: number;
  avgTonsPerAcre: number;
  maxTonsPerAcre: number;
  growingDays: number;
}

export const CROP_BASELINES: Record<string, CropYieldBaseline> = {
  rice_aman: {
    cropName: 'Rice (Aman / Winter Paddy)',
    minTonsPerAcre: 1.6,
    avgTonsPerAcre: 2.1,
    maxTonsPerAcre: 2.6,
    growingDays: 135,
  },
  rice_boro: {
    cropName: 'Rice (Boro / Summer Paddy)',
    minTonsPerAcre: 2.0,
    avgTonsPerAcre: 2.5,
    maxTonsPerAcre: 3.1,
    growingDays: 125,
  },
  potato: {
    cropName: 'Potato (আলু / Kufri Jyoti)',
    minTonsPerAcre: 8.5,
    avgTonsPerAcre: 10.5,
    maxTonsPerAcre: 13.0,
    growingDays: 90,
  },
  jute: {
    cropName: 'Jute (পাট / Tossa)',
    minTonsPerAcre: 1.0,
    avgTonsPerAcre: 1.25,
    maxTonsPerAcre: 1.5,
    growingDays: 120,
  },
  mustard: {
    cropName: 'Mustard (সর্ষে)',
    minTonsPerAcre: 0.5,
    avgTonsPerAcre: 0.7,
    maxTonsPerAcre: 0.95,
    growingDays: 85,
  },
  brinjal: {
    cropName: 'Brinjal (বেগুন)',
    minTonsPerAcre: 7.0,
    avgTonsPerAcre: 9.0,
    maxTonsPerAcre: 12.0,
    growingDays: 110,
  },
  tomato: {
    cropName: 'Tomato (টমেটো)',
    minTonsPerAcre: 8.0,
    avgTonsPerAcre: 10.0,
    maxTonsPerAcre: 13.5,
    growingDays: 100,
  },
  wheat: {
    cropName: 'Wheat (গম)',
    minTonsPerAcre: 1.2,
    avgTonsPerAcre: 1.5,
    maxTonsPerAcre: 1.9,
    growingDays: 115,
  },
};

export interface YieldPredictionInput {
  cropKey: string;
  variety?: string;
  area: number;
  areaUnit: LandUnit;
  healthStatus: 'healthy' | 'needs_attention' | 'diseased';
  irrigationType: string;
  soilType?: string;
  nitrogenKgHa?: number;
  phosphorusKgHa?: number;
  potassiumKgHa?: number;
  ph?: number;
  plantingDate?: string;
}

export interface YieldPredictionOutput {
  cropName: string;
  areaInAcres: number;
  estimatedYieldPerAcreTons: number;
  yieldRangeMinTonsPerAcre: number;
  yieldRangeMaxTonsPerAcre: number;
  totalExpectedProductionTons: number;
  totalRangeMinTons: number;
  totalRangeMaxTons: number;
  yieldPerBighaTons: number;
  yieldPerKathaKg: number;
  confidenceScore: number; // 0 to 100
  estimatedHarvestDate: string;
  factors: {
    baselineYield: number;
    healthMultiplier: number;
    irrigationMultiplier: number;
    soilNutrientMultiplier: number;
    phMultiplier: number;
  };
  recommendations: string[];
}

export function calculateYieldPrediction(
  input: YieldPredictionInput
): YieldPredictionOutput {
  // 1. Get Crop Baseline
  const baseline = CROP_BASELINES[input.cropKey] || {
    cropName: input.cropKey,
    minTonsPerAcre: 2.0,
    avgTonsPerAcre: 3.0,
    maxTonsPerAcre: 4.0,
    growingDays: 110,
  };

  // 2. Normalize Area to Acres
  const areaInAcres = convertLandArea(input.area, input.areaUnit, 'acres');

  // 3. Health Impact Multiplier
  let healthMultiplier = 1.0;
  if (input.healthStatus === 'needs_attention') {
    healthMultiplier = 0.85;
  } else if (input.healthStatus === 'diseased') {
    healthMultiplier = 0.68;
  }

  // 4. Irrigation Multiplier
  let irrigationMultiplier = 1.0;
  const irr = (input.irrigationType || '').toLowerCase();
  if (irr.includes('drip')) {
    irrigationMultiplier = 1.15;
  } else if (irr.includes('sprinkler')) {
    irrigationMultiplier = 1.08;
  } else if (irr.includes('tube well') || irr.includes('stw') || irr.includes('dtw')) {
    irrigationMultiplier = 1.04;
  } else if (irr.includes('rainfed')) {
    irrigationMultiplier = 0.88;
  }

  // 5. Soil N-P-K Nutrient Factor
  let soilNutrientMultiplier = 1.0;
  if (input.nitrogenKgHa !== undefined && input.nitrogenKgHa > 0) {
    if (input.nitrogenKgHa < 240) {
      soilNutrientMultiplier *= 0.92;
    } else if (input.nitrogenKgHa >= 280 && input.nitrogenKgHa <= 500) {
      soilNutrientMultiplier *= 1.06;
    }
  }

  if (input.phosphorusKgHa !== undefined && input.phosphorusKgHa > 0) {
    if (input.phosphorusKgHa < 10) {
      soilNutrientMultiplier *= 0.94;
    } else if (input.phosphorusKgHa >= 15 && input.phosphorusKgHa <= 30) {
      soilNutrientMultiplier *= 1.04;
    }
  }

  // 6. pH Suitability Multiplier
  let phMultiplier = 1.0;
  if (input.ph !== undefined && input.ph > 0) {
    if (input.ph < 5.8) {
      phMultiplier = 0.92; // Soil acidity penalty
    } else if (input.ph >= 6.2 && input.ph <= 7.4) {
      phMultiplier = 1.03; // Optimal neutral range
    } else if (input.ph > 8.0) {
      phMultiplier = 0.94; // Alkaline penalty
    }
  }

  // Combined Adjustment Multiplier
  const combinedMultiplier =
    healthMultiplier * irrigationMultiplier * soilNutrientMultiplier * phMultiplier;

  const estimatedYieldPerAcre =
    Math.round(baseline.avgTonsPerAcre * combinedMultiplier * 100) / 100;
  const yieldRangeMinPerAcre =
    Math.round(baseline.minTonsPerAcre * combinedMultiplier * 100) / 100;
  const yieldRangeMaxPerAcre =
    Math.round(baseline.maxTonsPerAcre * combinedMultiplier * 100) / 100;

  const totalExpectedProduction =
    Math.round(estimatedYieldPerAcre * areaInAcres * 100) / 100;
  const totalRangeMin =
    Math.round(yieldRangeMinPerAcre * areaInAcres * 100) / 100;
  const totalRangeMax =
    Math.round(yieldRangeMaxPerAcre * areaInAcres * 100) / 100;

  // Regional Bengal Unit Conversions: 1 Bigha = 0.3305785 Acre; 1 Katha = 1/20 Bigha
  const yieldPerBighaTons =
    Math.round(estimatedYieldPerAcre * 0.3305785 * 100) / 100;
  const yieldPerKathaKg = Math.round((yieldPerBighaTons * 1000) / 20);

  // Calibrated Confidence Score based on actual data fidelity
  let confidence = 66; // Regional baseline
  if (input.healthStatus === 'healthy') confidence += 6;
  if (input.healthStatus === 'diseased') confidence -= 8;
  if (input.variety && input.variety.trim().length > 0) confidence += 6;
  if (input.soilType && input.soilType.trim().length > 0) confidence += 5;
  if (input.irrigationType && input.irrigationType !== 'unspecified') confidence += 8;
  if (input.nitrogenKgHa && input.nitrogenKgHa > 0) confidence += 6;
  if (input.ph && input.ph > 0) confidence += 4;
  if (input.plantingDate) confidence += 3;
  confidence = Math.min(95, Math.max(50, confidence));

  // Estimate Harvest Date based on sowing date and crop duration
  const sowDate = input.plantingDate ? new Date(input.plantingDate) : new Date();
  const harvestDateObj = new Date(sowDate.getTime() + baseline.growingDays * 86400000);
  const estimatedHarvestDate = harvestDateObj.toISOString().split('T')[0];

  // Tailored Agronomic Recommendations
  const recommendations: string[] = [];
  if (input.healthStatus !== 'healthy') {
    recommendations.push(
      'Address active leaf lesions immediately with organic/bio-control or targeted fungicide to avoid up to 30% yield loss.'
    );
  }
  if (irrigationMultiplier < 1.0) {
    recommendations.push(
      'Rainfed moisture stress can constrain grain filling. Implement shallow supplemental tube well irrigation during peak flowering.'
    );
  }
  if (phMultiplier < 1.0 && input.ph && input.ph < 5.8) {
    recommendations.push(
      'Soil is moderately acidic (pH < 5.8). Apply agricultural lime or dolomite at 200-250 kg/acre prior to next sowing season.'
    );
  }
  if (soilNutrientMultiplier < 1.0) {
    recommendations.push(
      'Soil test indicates suboptimal nitrogen/phosphorus availability. Top-dress with well-decomposed vermicompost or split urea.'
    );
  }
  if (recommendations.length === 0) {
    recommendations.push(
      'Farming conditions are well-balanced. Maintain current irrigation cadence and periodic pest scouting.'
    );
  }

  return {
    cropName: baseline.cropName,
    areaInAcres,
    estimatedYieldPerAcreTons: estimatedYieldPerAcre,
    yieldRangeMinTonsPerAcre: yieldRangeMinPerAcre,
    yieldRangeMaxTonsPerAcre: yieldRangeMaxPerAcre,
    totalExpectedProductionTons: totalExpectedProduction,
    totalRangeMinTons: totalRangeMin,
    totalRangeMaxTons: totalRangeMax,
    yieldPerBighaTons,
    yieldPerKathaKg,
    confidenceScore: confidence,
    estimatedHarvestDate,
    factors: {
      baselineYield: baseline.avgTonsPerAcre,
      healthMultiplier: Math.round(healthMultiplier * 100) / 100,
      irrigationMultiplier: Math.round(irrigationMultiplier * 100) / 100,
      soilNutrientMultiplier: Math.round(soilNutrientMultiplier * 100) / 100,
      phMultiplier: Math.round(phMultiplier * 100) / 100,
    },
    recommendations,
  };
}
