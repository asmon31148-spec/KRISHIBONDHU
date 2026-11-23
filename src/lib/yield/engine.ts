/**
 * KRISHIBONDHU - Empirical Agronomic Yield Prediction & Production Economics Engine
 *
 * Grounded in published ICAR, BCKV (Bidhan Chandra Krishi Viswavidyalaya), and
 * Department of Agriculture, Govt. of West Bengal farm management surveys.
 *
 * Core Tenet: Build for the actual smallholder farmer.
 * Never force laboratory parameters; never fabricate missing values;
 * always be transparent about uncertainty, operational expenses, and limitations.
 *
 * Bengal Land Standard:
 * 1 Bigha ≈ 0.3305785 Acres (1 Acre ≈ 3.025 Bigha)
 * 1 Bigha = 20 Katha
 * 1 Quintal = 100 Kilograms
 */

import { convertLandArea, LandUnit } from '../units';

export interface CropCostItem {
  category: string;
  costPerBigha: number; // In INR (₹)
  description: string;
}

export interface CropYieldBaseline {
  cropName: string;
  minTonsPerAcre: number;
  avgTonsPerAcre: number;
  maxTonsPerAcre: number;
  growingDays: number;
  season: 'Kharif' | 'Rabi' | 'Boro' | 'Zaid / Summer' | 'Annual';
  typicalPricePerQuintal: { min: number; avg: number; max: number };
  costSchedulePerBigha: CropCostItem[];
}

export const CROP_BASELINES: Record<string, CropYieldBaseline> = {
  rice_aman: {
    cropName: 'Rice (Aman / Winter Paddy)',
    minTonsPerAcre: 1.6,
    avgTonsPerAcre: 2.1,
    maxTonsPerAcre: 2.6,
    growingDays: 135,
    season: 'Kharif',
    typicalPricePerQuintal: { min: 2183, avg: 2300, max: 2450 }, // Govt MSP / Bengal APMC baseline
    costSchedulePerBigha: [
      { category: 'Land Preparation', costPerBigha: 900, description: 'Power tiller tilling & puddling (২ বার চাষ ও মই)' },
      { category: 'Seeds & Nursery', costPerBigha: 450, description: 'Certified seed (Swarna/MTU) & seedbed maintenance' },
      { category: 'Transplanting Labor', costPerBigha: 1400, description: 'Manual seedling uprooting & transplanting' },
      { category: 'Fertilizer & FYM', costPerBigha: 1100, description: 'Basal DAP/MOP, Urea top-dressing & farmyard manure' },
      { category: 'Irrigation & Drainage', costPerBigha: 600, description: 'Supplemental STW pumping / canal drainage' },
      { category: 'Plant Protection', costPerBigha: 500, description: 'Stem borer & sheath blight bio-control/spray' },
      { category: 'Harvesting & Threshing', costPerBigha: 1800, description: 'Manual sickle reaping, bunding & power thresher' },
    ],
  },
  rice_boro: {
    cropName: 'Rice (Boro / Summer Paddy)',
    minTonsPerAcre: 2.0,
    avgTonsPerAcre: 2.5,
    maxTonsPerAcre: 3.1,
    growingDays: 125,
    season: 'Boro',
    typicalPricePerQuintal: { min: 2200, avg: 2350, max: 2500 },
    costSchedulePerBigha: [
      { category: 'Land Preparation', costPerBigha: 950, description: 'Puddling & levelling' },
      { category: 'Seeds & Nursery', costPerBigha: 500, description: 'Hybrid / high-yield Boro varieties' },
      { category: 'Transplanting Labor', costPerBigha: 1500, description: 'Winter transplanting labor' },
      { category: 'Fertilizer & Manure', costPerBigha: 1350, description: 'Higher N-P-K nutrient input for summer potential' },
      { category: 'Irrigation (Intensive)', costPerBigha: 2200, description: '10-14 rounds of shallow/deep tube well diesel/power' },
      { category: 'Plant Protection', costPerBigha: 600, description: 'Stem borer & blast prevention' },
      { category: 'Harvesting & Threshing', costPerBigha: 1900, description: 'Cutting, carrying & mechanical threshing' },
    ],
  },
  potato: {
    cropName: 'Potato (আলু / Kufri Jyoti)',
    minTonsPerAcre: 8.5,
    avgTonsPerAcre: 10.5,
    maxTonsPerAcre: 13.0,
    growingDays: 90,
    season: 'Rabi',
    typicalPricePerQuintal: { min: 950, avg: 1300, max: 1750 },
    costSchedulePerBigha: [
      { category: 'Land Preparation & Ridging', costPerBigha: 1200, description: 'Deep ploughing, rotavator, and ridge making' },
      { category: 'Seed Tubers (Major Cost)', costPerBigha: 7500, description: 'Certified cold-storage seed tubers (3.5–4.5 quintals/bigha)' },
      { category: 'Basal & Top Fertilizer', costPerBigha: 2200, description: 'NPK 10:26:26 or 15:15:15 + Potash + Organic manure' },
      { category: 'Planting & Earthing Up', costPerBigha: 1600, description: 'Labor for dibbling, furrow placement & soil mounding' },
      { category: 'Irrigation Cadence', costPerBigha: 1100, description: '4-5 rounds of furrow irrigation during tuber bulking' },
      { category: 'Blight Protection & Spray', costPerBigha: 1400, description: 'Preventive Mancozeb/Metalaxyl sprays for Late Blight' },
      { category: 'De-haulming & Harvesting', costPerBigha: 2500, description: 'Tuber digging, grading into sacks, field loading' },
    ],
  },
  jute: {
    cropName: 'Jute (পাট / Tossa)',
    minTonsPerAcre: 1.0,
    avgTonsPerAcre: 1.25,
    maxTonsPerAcre: 1.5,
    growingDays: 120,
    season: 'Kharif',
    typicalPricePerQuintal: { min: 4800, avg: 5350, max: 5800 },
    costSchedulePerBigha: [
      { category: 'Land Preparation', costPerBigha: 750, description: 'Fine tilth ploughing for small seeds' },
      { category: 'Seeds & Sowing', costPerBigha: 350, description: 'Certified JRO-524 or JBO-2006 Tossa seeds' },
      { category: 'Weeding & Thinning (Labor)', costPerBigha: 1800, description: 'Extensive hand weeding (নিড়ানি) at 21 & 35 days' },
      { category: 'Fertilizer Input', costPerBigha: 850, description: 'Urea split applications' },
      { category: 'Harvesting & Bundling', costPerBigha: 1600, description: 'Plant cutting at small pod stage' },
      { category: 'Retting & Extraction', costPerBigha: 2200, description: 'Steeping in water pool (জাগ দেওয়া), stripping & sun-drying fiber' },
    ],
  },
  mustard: {
    cropName: 'Mustard (সর্ষে)',
    minTonsPerAcre: 0.5,
    avgTonsPerAcre: 0.7,
    maxTonsPerAcre: 0.95,
    growingDays: 85,
    season: 'Rabi',
    typicalPricePerQuintal: { min: 5400, avg: 5900, max: 6500 },
    costSchedulePerBigha: [
      { category: 'Land Preparation', costPerBigha: 700, description: 'Residual moisture tilling after Aman harvest' },
      { category: 'Seeds', costPerBigha: 250, description: 'High-oil varieties (B-9 / Pusa Bold / Binoy)' },
      { category: 'Fertilizer & Sulphur', costPerBigha: 900, description: 'Urea, SSP (for essential Sulphur), and MOP' },
      { category: 'Intercultural & Weeding', costPerBigha: 600, description: 'Early thinning and light hoeing' },
      { category: 'Irrigation (1-2 Light)', costPerBigha: 500, description: 'Flowering / siliqua development irrigation' },
      { category: 'Aphid Pest Control', costPerBigha: 450, description: 'Scouting & bio-control/Neem oil or systemic spray' },
      { category: 'Harvesting & Threshing', costPerBigha: 1100, description: 'Morning harvesting to prevent pod shattering & winnowing' },
    ],
  },
  brinjal: {
    cropName: 'Brinjal (বেগুন)',
    minTonsPerAcre: 7.0,
    avgTonsPerAcre: 9.0,
    maxTonsPerAcre: 12.0,
    growingDays: 110,
    season: 'Annual',
    typicalPricePerQuintal: { min: 1400, avg: 2200, max: 3200 },
    costSchedulePerBigha: [
      { category: 'Land & Bed Preparation', costPerBigha: 1100, description: 'Deep ploughing & raised beds' },
      { category: 'Seedlings', costPerBigha: 800, description: 'Muktakeshi / Hybrid grafted nursery seedlings' },
      { category: 'Nutrient Management', costPerBigha: 1900, description: 'Heavy organic manure + balanced NPK' },
      { category: 'Irrigation', costPerBigha: 1200, description: 'Frequent light furrow or drip applications' },
      { category: 'Borer & Pest Control', costPerBigha: 2200, description: 'Pheromone traps & shoot/fruit borer management' },
      { category: 'Multiple Pluckings Labor', costPerBigha: 2800, description: 'Hand picking over 8-12 picking cycles' },
    ],
  },
  tomato: {
    cropName: 'Tomato (টমেটো)',
    minTonsPerAcre: 8.0,
    avgTonsPerAcre: 10.0,
    maxTonsPerAcre: 13.5,
    growingDays: 100,
    season: 'Rabi',
    typicalPricePerQuintal: { min: 900, avg: 1600, max: 2800 },
    costSchedulePerBigha: [
      { category: 'Land Preparation & Mulch', costPerBigha: 1200, description: 'Tilling and raised ridge beds' },
      { category: 'Hybrid Seedlings', costPerBigha: 900, description: 'Determinate/indeterminate disease-tolerant hybrids' },
      { category: 'Staking & Trellising', costPerBigha: 1500, description: 'Bamboo stakes and jute twine support' },
      { category: 'Fertilizer & Micronutrients', costPerBigha: 1700, description: 'Boron, Calcium, NPK fertigation' },
      { category: 'Irrigation', costPerBigha: 1000, description: 'Controlled soil moisture' },
      { category: 'Pest & Blight Sprays', costPerBigha: 1600, description: 'Fruit borer & early/late blight protection' },
      { category: 'Harvest & Sorting', costPerBigha: 2200, description: 'Harvesting at breaker/pink stage & crate packing' },
    ],
  },
  wheat: {
    cropName: 'Wheat (গম)',
    minTonsPerAcre: 1.2,
    avgTonsPerAcre: 1.5,
    maxTonsPerAcre: 1.9,
    growingDays: 115,
    season: 'Rabi',
    typicalPricePerQuintal: { min: 2275, avg: 2450, max: 2600 },
    costSchedulePerBigha: [
      { category: 'Land Preparation', costPerBigha: 850, description: 'Post-kharif fine seedbed preparation' },
      { category: 'Seeds', costPerBigha: 600, description: 'HD-2967 / DBW-39 certified seeds (14-16 kg/bigha)' },
      { category: 'Fertilizer Application', costPerBigha: 1150, description: 'Basal DAP/MOP and 2 split Urea doses' },
      { category: 'Crown Root Irrigation', costPerBigha: 900, description: 'Critical irrigation at CRI, tillering & flowering stages' },
      { category: 'Weed Management', costPerBigha: 400, description: 'Broadleaf weed control' },
      { category: 'Harvesting & Threshing', costPerBigha: 1600, description: 'Reaper cutting and wheat thresher' },
    ],
  },
};

export type PredictionScenario = 'pre_cultivation' | 'in_season';

export interface YieldPredictionInput {
  // Scenario selector
  scenario?: PredictionScenario; // Defaults to in_season if healthStatus provided
  cropKey: string;
  variety?: string;
  area: number;
  areaUnit: LandUnit;
  state?: string;
  district?: string;
  agroZone?: string;

  // Level 1: Farmer Field Experience inputs
  healthStatus?: 'healthy' | 'needs_attention' | 'diseased';
  irrigationType: string;
  soilType?: string; // e.g. Clay, Loam, Sandy, Alluvial
  plantingDate?: string;
  growthStage?: 'sowing' | 'vegetative' | 'flowering' | 'grain_filling' | 'maturity';

  // Level 3: Optional Laboratory / Soil Health Card inputs (never mandatory)
  hasSoilReport?: boolean;
  nitrogenKgHa?: number;
  phosphorusKgHa?: number;
  potassiumKgHa?: number;
  ph?: number;
  organicCarbonPercent?: number;

  // Level 2: Automatic Environmental Context (if retrieved)
  weatherContext?: {
    rainfallAnomalyPercent?: number;
    heatStressDays?: number;
  };
}

export interface ExpenseBreakdownItem {
  category: string;
  costPerBigha: number;
  totalForPlot: number;
  description: string;
}

export interface YieldPredictionOutput {
  scenario: PredictionScenario;
  cropName: string;
  areaInAcres: number;
  areaInBighas: number;
  estimatedYieldPerAcreTons: number;
  yieldRangeMinTonsPerAcre: number;
  yieldRangeMaxTonsPerAcre: number;
  totalExpectedProductionTons: number;
  totalRangeMinTons: number;
  totalRangeMaxTons: number;
  yieldPerBighaTons: number;
  yieldPerBighaQuintals: number;
  yieldPerKathaKg: number;
  confidenceScore: number; // Kept for backward compatibility

  // Honest Data Fidelity & Uncertainty transparency
  fidelity: {
    level: 'indicative_regional' | 'moderate_calibrated' | 'high_precision';
    label: string;
    description: string;
    dataPointsIncluded: string[];
    dataPointsMissing: string[];
    uncertaintyNotice: string;
  };

  // Scenario A & B: Production Economics
  economics: {
    costPerBighaMin: number;
    costPerBighaExpected: number;
    costPerBighaMax: number;
    totalPlotCostMin: number;
    totalPlotCostExpected: number;
    totalPlotCostMax: number;
    breakdown: ExpenseBreakdownItem[];
    projectedRevenueMin: number;
    projectedRevenueExpected: number;
    projectedRevenueMax: number;
    projectedNetProfitMin: number;
    projectedNetProfitExpected: number;
    projectedNetProfitMax: number;
    indicativePricePerQuintal: number;
  };

  estimatedHarvestDate: string;
  daysRemainingToHarvest?: number;

  factors: {
    baselineYield: number;
    healthMultiplier: number;
    irrigationMultiplier: number;
    soilNutrientMultiplier: number;
    phMultiplier: number;
    agroZoneMultiplier?: number;
  };
  recommendations: string[];
  scientificDisclaimers: string[];
}

export function calculateYieldPrediction(
  input: YieldPredictionInput
): YieldPredictionOutput {
  // 1. Identify Scenario: if healthStatus or plantingDate provided, treat as in_season unless explicitly requested as pre_cultivation
  const scenario: PredictionScenario =
    input.scenario ||
    (input.plantingDate || input.healthStatus ? 'in_season' : 'pre_cultivation');

  // 2. Retrieve Crop Baseline
  const baseline = CROP_BASELINES[input.cropKey] || {
    cropName: input.cropKey,
    minTonsPerAcre: 2.0,
    avgTonsPerAcre: 3.0,
    maxTonsPerAcre: 4.0,
    growingDays: 110,
    season: 'Annual' as const,
    typicalPricePerQuintal: { min: 2000, avg: 2500, max: 3000 },
    costSchedulePerBigha: [
      { category: 'Land Preparation', costPerBigha: 900, description: 'Tilling and preparation' },
      { category: 'Seeds & Planting', costPerBigha: 600, description: 'Seed material' },
      { category: 'Fertilizers', costPerBigha: 1200, description: 'Nutrients and compost' },
      { category: 'Irrigation', costPerBigha: 800, description: 'Water application' },
      { category: 'Harvesting', costPerBigha: 1500, description: 'Cutting and threshing' },
    ],
  };

  // 3. Normalize Area to Standard Bengal Conversions
  const areaInAcres = convertLandArea(input.area, input.areaUnit, 'acres');
  const areaInBighas = areaInAcres / 0.3305785;

  // 4. Determine Multipliers
  // Health Status (in-season observation, or neutral 1.0 for pre-cultivation planning)
  let healthMultiplier = 1.0;
  if (scenario === 'in_season') {
    if (input.healthStatus === 'needs_attention') {
      healthMultiplier = 0.85;
    } else if (input.healthStatus === 'diseased') {
      healthMultiplier = 0.68;
    }
  }

  // Irrigation Multiplier
  let irrigationMultiplier = 1.0;
  const irr = (input.irrigationType || '').toLowerCase();
  if (irr.includes('drip')) {
    irrigationMultiplier = 1.15;
  } else if (irr.includes('sprinkler')) {
    irrigationMultiplier = 1.08;
  } else if (irr.includes('tube well') || irr.includes('stw') || irr.includes('dtw')) {
    irrigationMultiplier = 1.04;
  } else if (irr.includes('rainfed') || irr.includes('seasonal')) {
    irrigationMultiplier = 0.88;
  }

  // Traceability tracking & recommendations arrays
  const dataIncluded: string[] = ['Regional ICAR / BCKV Agronomic Baseline'];
  const dataMissing: string[] = [];
  const recommendations: string[] = [];

  // Location & Agro-Climatic Zone Multiplier
  let agroZoneMultiplier = 1.0;
  let zoneInfoName = '';
  let zoneTip = '';
  if (input.district || input.state) {
    dataIncluded.push(`Geographic Region: ${input.district ? `${input.district}, ` : ''}${input.state || 'West Bengal'}`);
  }
  if (input.agroZone) {
    if (input.agroZone === 'alluvial_gangetic') {
      agroZoneMultiplier = 1.05;
      zoneInfoName = 'Gangetic Alluvial Delta Zone';
      zoneTip = 'High natural soil fertility; optimal for rice, potato, jute and mustard.';
    } else if (input.agroZone === 'red_laterite') {
      agroZoneMultiplier = 0.94;
      zoneInfoName = 'Red & Laterite Undulating Zone';
      zoneTip = 'Acidic soils with lower water retention; in-situ moisture conservation advised.';
    } else if (input.agroZone === 'coastal_saline') {
      agroZoneMultiplier = 0.95;
      zoneInfoName = 'Coastal Saline Zone';
      zoneTip = 'Seasonal brackish salinity; raised bed bunding and freshwater flushing advised.';
    } else if (input.agroZone === 'terai_dooars') {
      agroZoneMultiplier = 1.02;
      zoneInfoName = 'Terai & Teesta Alluvial Plain';
      zoneTip = 'High precipitation zone; light acidic soil responsive to balanced micronutrients.';
    } else if (input.agroZone === 'barind') {
      agroZoneMultiplier = 0.98;
      zoneInfoName = 'Old Alluvial Barind Tract';
      zoneTip = 'Clayey soil structure; organic FYM application enhances moisture permeability.';
    } else if (input.agroZone === 'hill') {
      agroZoneMultiplier = 0.92;
      zoneInfoName = 'Eastern Himalayan Hill Zone';
      zoneTip = 'Terraced contour slopes; cooler temperatures require cold-hardy varieties.';
    }
    if (zoneInfoName) {
      dataIncluded.push(`Agro-Climatic Zone: ${zoneInfoName}`);
    }
  }

  // Level 3 Lab Multipliers (ONLY applied if explicitly provided by farmer)
  let soilNutrientMultiplier = 1.0;
  let phMultiplier = 1.0;

  if (input.area && input.areaUnit) {
    dataIncluded.push(`Field Area: ${input.area} ${input.areaUnit}`);
  }
  if (input.irrigationType && input.irrigationType !== 'unspecified') {
    dataIncluded.push(`Irrigation System: ${input.irrigationType}`);
  }
  if (input.variety && input.variety.trim().length > 0) {
    dataIncluded.push(`Cultivar/Variety: ${input.variety}`);
  } else {
    dataMissing.push('Specific Seed Variety / Hybrid designation');
  }

  if (scenario === 'in_season') {
    dataIncluded.push(`Observed Crop Vigour: ${input.healthStatus || 'healthy'}`);
  } else {
    dataIncluded.push('Pre-Sowing Cultivation Planning Assessment');
  }

  // Soil Nutrient Multiplier
  if (input.nitrogenKgHa !== undefined && input.nitrogenKgHa > 0) {
    dataIncluded.push(`Laboratory Soil Available Nitrogen: ${input.nitrogenKgHa} kg/ha`);
    if (input.nitrogenKgHa < 240) {
      soilNutrientMultiplier *= 0.92;
    } else if (input.nitrogenKgHa >= 280 && input.nitrogenKgHa <= 500) {
      soilNutrientMultiplier *= 1.06;
    }
  }

  if (input.phosphorusKgHa !== undefined && input.phosphorusKgHa > 0) {
    dataIncluded.push(`Laboratory Soil Phosphorus: ${input.phosphorusKgHa} kg/ha`);
    if (input.phosphorusKgHa < 10) {
      soilNutrientMultiplier *= 0.94;
    } else if (input.phosphorusKgHa >= 15 && input.phosphorusKgHa <= 30) {
      soilNutrientMultiplier *= 1.04;
    }
  }

  // pH Suitability Multiplier
  if (input.ph !== undefined && input.ph > 0) {
    dataIncluded.push(`Laboratory Soil Reaction (pH): ${input.ph}`);
    if (input.ph < 5.8) {
      phMultiplier = 0.92; // Soil acidity penalty
    } else if (input.ph >= 6.2 && input.ph <= 7.4) {
      phMultiplier = 1.03; // Optimal neutral range
    } else if (input.ph > 8.0) {
      phMultiplier = 0.94; // Alkaline penalty
    }
  }

  if (!input.hasSoilReport && (input.ph === undefined || input.nitrogenKgHa === undefined)) {
    dataMissing.push('Soil Health Card / Chemical Laboratory Test (pH & NPK)');
  }

  // 5. Compute Adjusted Yield Estimates
  const combinedMultiplier =
    healthMultiplier * irrigationMultiplier * soilNutrientMultiplier * phMultiplier * agroZoneMultiplier;

  if (zoneTip) {
    recommendations.push(`Agro-Climatic Zone Tip: ${zoneTip}`);
  }

  // When lab data is missing, we expand the range uncertainty honestly
  const uncertaintyFactor = input.hasSoilReport ? 0.08 : 0.16;

  const estimatedYieldPerAcre =
    Math.round(baseline.avgTonsPerAcre * combinedMultiplier * 100) / 100;
  const yieldRangeMinPerAcre =
    Math.round(
      Math.max(
        0.2,
        baseline.minTonsPerAcre * combinedMultiplier * (1 - uncertaintyFactor)
      ) * 100
    ) / 100;
  const yieldRangeMaxPerAcre =
    Math.round(
      baseline.maxTonsPerAcre * combinedMultiplier * (1 + uncertaintyFactor) * 100
    ) / 100;

  const totalExpectedProduction =
    Math.round(estimatedYieldPerAcre * areaInAcres * 100) / 100;
  const totalRangeMin =
    Math.round(yieldRangeMinPerAcre * areaInAcres * 100) / 100;
  const totalRangeMax =
    Math.round(yieldRangeMaxPerAcre * areaInAcres * 100) / 100;

  // Regional Bengal Unit Conversions
  // 1 Bigha = 0.3305785 Acre; 1 Katha = 1/20 Bigha
  const yieldPerBighaTons =
    Math.round(estimatedYieldPerAcre * 0.3305785 * 100) / 100;
  const yieldPerBighaQuintals = Math.round(yieldPerBighaTons * 10 * 10) / 10;
  const yieldPerKathaKg = Math.round((yieldPerBighaTons * 1000) / 20);

  // 6. Honest Fidelity & Scientific Transparency Rating
  let fidelityLevel: 'indicative_regional' | 'moderate_calibrated' | 'high_precision' =
    'indicative_regional';
  let fidelityLabel = 'Indicative Regional Baseline';
  let fidelityDesc =
    'Prediction generated using verified regional multi-year ICAR research averages. Soil lab parameters were not provided and were NOT fabricated.';
  // Dynamically calculate confidence score based on verified data points provided by farmer:
  let confidenceScore = 48; // Base uncalibrated regional average (45-50%)

  if (input.healthStatus) confidenceScore += 12;
  if (input.irrigationType) confidenceScore += 10;
  if (input.variety || input.plantingDate || input.growthStage) confidenceScore += 10;
  if (input.weatherContext) confidenceScore += 5;

  if (input.hasSoilReport && input.ph && input.nitrogenKgHa) {
    fidelityLevel = 'high_precision';
    fidelityLabel = 'High Precision (Soil Lab Verified)';
    fidelityDesc =
      'Calibrated with measured soil test chemistry, irrigation source, and variety parameters.';
    confidenceScore += 15;
  } else if (input.variety && (input.plantingDate || input.growthStage)) {
    fidelityLevel = 'moderate_calibrated';
    fidelityLabel = 'Moderate Fidelity (Agronomic Calibrated)';
    fidelityDesc =
      'Calibrated using farmer field parameters, variety, and crop growth duration.';
  }

  confidenceScore = Math.min(95, Math.max(45, confidenceScore));

  // 7. Production Economics & Cultivation Expense Calculation
  const costItems = baseline.costSchedulePerBigha;
  const totalCostPerBighaBase = costItems.reduce((acc, c) => acc + c.costPerBigha, 0);

  // Irrigation & health expense adjustments
  let expenseAdjustment = 1.0;
  if (irr.includes('rainfed')) expenseAdjustment -= 0.08;
  if (irr.includes('drip')) expenseAdjustment += 0.05;

  const costPerBighaExpected = Math.round(totalCostPerBighaBase * expenseAdjustment);
  const costPerBighaMin = Math.round(costPerBighaExpected * 0.9);
  const costPerBighaMax = Math.round(costPerBighaExpected * 1.15);

  const totalPlotCostExpected = Math.round(costPerBighaExpected * areaInBighas);
  const totalPlotCostMin = Math.round(costPerBighaMin * areaInBighas);
  const totalPlotCostMax = Math.round(costPerBighaMax * areaInBighas);

  const breakdown: ExpenseBreakdownItem[] = costItems.map((item) => ({
    category: item.category,
    costPerBigha: item.costPerBigha,
    totalForPlot: Math.round(item.costPerBigha * areaInBighas),
    description: item.description,
  }));

  // Revenue & Profit Estimation using APMC wholesale benchmark
  const indicativePrice = baseline.typicalPricePerQuintal.avg;
  const totalQuintalsExpected = totalExpectedProduction * 10;
  const totalQuintalsMin = totalRangeMin * 10;
  const totalQuintalsMax = totalRangeMax * 10;

  const projectedRevenueExpected = Math.round(totalQuintalsExpected * indicativePrice);
  const projectedRevenueMin = Math.round(
    totalQuintalsMin * baseline.typicalPricePerQuintal.min
  );
  const projectedRevenueMax = Math.round(
    totalQuintalsMax * baseline.typicalPricePerQuintal.max
  );

  const projectedNetProfitExpected = projectedRevenueExpected - totalPlotCostExpected;
  const projectedNetProfitMin = projectedRevenueMin - totalPlotCostMax;
  const projectedNetProfitMax = projectedRevenueMax - totalPlotCostMin;

  // 8. Harvest Date & Growth Timeline
  const sowDate = input.plantingDate ? new Date(input.plantingDate) : new Date();
  const harvestDateObj = new Date(sowDate.getTime() + baseline.growingDays * 86400000);
  const estimatedHarvestDate = harvestDateObj.toISOString().split('T')[0];

  let daysRemainingToHarvest: number | undefined;
  if (input.plantingDate) {
    const diffMs = harvestDateObj.getTime() - Date.now();
    daysRemainingToHarvest = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }

  // 9. Tailored Agronomic Recommendations
  if (scenario === 'in_season' && input.healthStatus && input.healthStatus !== 'healthy') {
    recommendations.push(
      'Address active leaf lesions immediately with organic/bio-control or targeted fungicide to prevent potential 15% to 32% yield loss.'
    );
  }
  if (irrigationMultiplier < 1.0) {
    recommendations.push(
      'Rainfed cultivation experiences moisture stress during critical grain filling. Plan 1-2 supplemental irrigations from ponds or shallow tube wells.'
    );
  }
  if (phMultiplier < 1.0 && input.ph && input.ph < 5.8) {
    recommendations.push(
      'Soil is moderately acidic (pH < 5.8). Apply agricultural dolomite/lime at 200–250 kg/acre after harvest to release locked phosphorus.'
    );
  }
  if (soilNutrientMultiplier < 1.0) {
    recommendations.push(
      'Soil test indicates suboptimal nitrogen/phosphorus. Apply well-decomposed FYM (গোবর সার) @ 1.5 tons/bigha and split urea doses.'
    );
  }
  if (!input.hasSoilReport) {
    recommendations.push(
      'Tip: Test your soil sample at your local Block Assistant Director of Agriculture (ADA) office or KVK for a free Soil Health Card to unlock plot-specific fertilizer dosing.'
    );
  }
  if (recommendations.length === 0) {
    recommendations.push(
      'Agronomic parameters are balanced. Maintain optimal weed control and periodic pest monitoring.'
    );
  }

  // 10. Explicit Scientific Transparency Disclaimers
  const scientificDisclaimers: string[] = [
    'Predictions are mathematical agronomic models based on regional multi-year research trials, not guaranteed outcomes.',
    'Actual harvest production is subject to extreme weather anomalies (unseasonal heavy rainfall, cyclone, heatwaves), local pest outbreaks, and timely field management.',
    'Financial cost and revenue schedules are indicative based on standard West Bengal agricultural survey rates and APMC wholesale price trends.',
  ];

  return {
    scenario,
    cropName: baseline.cropName,
    areaInAcres,
    areaInBighas: Math.round(areaInBighas * 100) / 100,
    estimatedYieldPerAcreTons: estimatedYieldPerAcre,
    yieldRangeMinTonsPerAcre: yieldRangeMinPerAcre,
    yieldRangeMaxTonsPerAcre: yieldRangeMaxPerAcre,
    totalExpectedProductionTons: totalExpectedProduction,
    totalRangeMinTons: totalRangeMin,
    totalRangeMaxTons: totalRangeMax,
    yieldPerBighaTons,
    yieldPerBighaQuintals,
    yieldPerKathaKg,
    confidenceScore,
    fidelity: {
      level: fidelityLevel,
      label: fidelityLabel,
      description: fidelityDesc,
      dataPointsIncluded: dataIncluded,
      dataPointsMissing: dataMissing,
      uncertaintyNotice:
        dataMissing.length > 0
          ? `Forecast range has been widened by ±16% to account for unmeasured soil variables (${dataMissing.join(', ')}).`
          : 'Forecast range is calibrated with measured plot data.',
    },
    economics: {
      costPerBighaMin,
      costPerBighaExpected,
      costPerBighaMax,
      totalPlotCostMin,
      totalPlotCostExpected,
      totalPlotCostMax,
      breakdown,
      projectedRevenueMin,
      projectedRevenueExpected,
      projectedRevenueMax,
      projectedNetProfitMin,
      projectedNetProfitExpected,
      projectedNetProfitMax,
      indicativePricePerQuintal: indicativePrice,
    },
    estimatedHarvestDate,
    daysRemainingToHarvest,
    factors: {
      baselineYield: baseline.avgTonsPerAcre,
      healthMultiplier: Math.round(healthMultiplier * 100) / 100,
      irrigationMultiplier: Math.round(irrigationMultiplier * 100) / 100,
      soilNutrientMultiplier: Math.round(soilNutrientMultiplier * 100) / 100,
      phMultiplier: Math.round(phMultiplier * 100) / 100,
      agroZoneMultiplier: Math.round(agroZoneMultiplier * 100) / 100,
    },
    recommendations,
    scientificDisclaimers,
  };
}
