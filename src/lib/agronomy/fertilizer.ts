/**
 * KRISHIBONDHU - Scientific Fertilizer Dosage Engine
 * Based on published ICAR (Indian Council of Agricultural Research)
 * and BCKV (Bidhan Chandra Krishi Viswavidyalaya) agronomic baselines
 * for West Bengal Agro-Climatic Zones (New Alluvial, Old Alluvial, Red & Laterite).
 */

export interface CropFertilizerBaseline {
  id: string;
  name_en: string;
  name_bn: string;
  name_hi: string;
  n_kg_ha: number;
  p_kg_ha: number;
  k_kg_ha: number;
  fym_ton_ha?: number;
  splits: {
    stage_en: string;
    stage_bn: string;
    stage_hi: string;
    timing: string;
    n_pct: number;
    p_pct: number;
    k_pct: number;
  }[];
}

export const CROP_BASELINES: Record<string, CropFertilizerBaseline> = {
  aman_paddy: {
    id: 'aman_paddy',
    name_en: 'Aman Paddy (Winter Rice)',
    name_bn: 'আমন ধান (বর্ষাকালীন)',
    name_hi: 'अमन धान (खरीफ)',
    n_kg_ha: 80,
    p_kg_ha: 40,
    k_kg_ha: 40,
    splits: [
      {
        stage_en: 'Basal Application',
        stage_bn: 'মূল সার প্রয়োগ (জমি তৈরি)',
        stage_hi: 'बुवाई के समय (अंतिम जुताई)',
        timing: 'During final puddling & land preparation',
        n_pct: 50,
        p_pct: 100,
        k_pct: 100,
      },
      {
        stage_en: '1st Top Dressing (Active Tillering)',
        stage_bn: 'প্রথম চাপান সার (কুশি গজানো)',
        stage_hi: 'पहला छिड़काव (कल्ले फूटते समय)',
        timing: '21 days after transplanting (DAT)',
        n_pct: 25,
        p_pct: 0,
        k_pct: 0,
      },
      {
        stage_en: '2nd Top Dressing (Panicle Initiation)',
        stage_bn: 'দ্বিতীয় চাপান সার (থোড় আসার মুখে)',
        stage_hi: 'दूसरा छिड़काव (बाली बनते समय)',
        timing: '42–45 days after transplanting (DAT)',
        n_pct: 25,
        p_pct: 0,
        k_pct: 0,
      },
    ],
  },
  boro_paddy: {
    id: 'boro_paddy',
    name_en: 'Boro Paddy (Summer Rice)',
    name_bn: 'বোরো ধান (গ্রীষ্মকালীন উচ্চফলনশীল)',
    name_hi: 'बोरो धान (ग्रीष्मकालीन)',
    n_kg_ha: 120,
    p_kg_ha: 60,
    k_kg_ha: 60,
    splits: [
      {
        stage_en: 'Basal Application',
        stage_bn: 'মূল সার প্রয়োগ',
        stage_hi: 'बुवाई के समय',
        timing: 'At transplanting / final puddling',
        n_pct: 50,
        p_pct: 100,
        k_pct: 100,
      },
      {
        stage_en: '1st Top Dressing',
        stage_bn: 'প্রথম চাপান সার (২১ দিন)',
        stage_hi: 'पहला छिड़काव (21 दिन)',
        timing: '21–25 days after transplanting',
        n_pct: 25,
        p_pct: 0,
        k_pct: 0,
      },
      {
        stage_en: '2nd Top Dressing',
        stage_bn: 'দ্বিতীয় চাপান সার (৪৫ দিন)',
        stage_hi: 'दूसरा छिड़काव (45 दिन)',
        timing: '45 days after transplanting',
        n_pct: 25,
        p_pct: 0,
        k_pct: 0,
      },
    ],
  },
  potato: {
    id: 'potato',
    name_en: 'Potato (Kufri Jyoti / Pukhraj)',
    name_bn: 'আলু (কুফরি জ্যোতি/পোখরাজ)',
    name_hi: 'आलू (कुफरी ज्योति)',
    n_kg_ha: 180,
    p_kg_ha: 120,
    k_kg_ha: 120,
    fym_ton_ha: 20,
    splits: [
      {
        stage_en: 'Basal Application',
        stage_bn: 'মূল সার প্রয়োগ (রোপণের সময়)',
        stage_hi: 'बुवाई के समय',
        timing: 'In furrows at planting time with well-rotted FYM',
        n_pct: 50,
        p_pct: 100,
        k_pct: 100,
      },
      {
        stage_en: 'Top Dressing & Earthing Up',
        stage_bn: 'চাপান সার ও মাটি তোলা (৩০ দিন)',
        stage_hi: 'छिड़काव व मिट्टी चढ़ाना (30 दिन)',
        timing: '30 days after planting before earthing up',
        n_pct: 50,
        p_pct: 0,
        k_pct: 0,
      },
    ],
  },
  mustard: {
    id: 'mustard',
    name_en: 'Mustard (Yellow / Brown)',
    name_bn: 'সরিষা (হলুদ/রায়)',
    name_hi: 'सरसों',
    n_kg_ha: 60,
    p_kg_ha: 30,
    k_kg_ha: 30,
    splits: [
      {
        stage_en: 'Basal Application',
        stage_bn: 'মূল সার প্রয়োগ',
        stage_hi: 'बुवाई के समय',
        timing: 'At sowing during final land preparation',
        n_pct: 50,
        p_pct: 100,
        k_pct: 100,
      },
      {
        stage_en: 'Top Dressing',
        stage_bn: 'চাপান সার (প্রথম সেচের পর)',
        stage_hi: 'पहली सिंचाई के बाद',
        timing: '25–30 days after sowing after 1st irrigation',
        n_pct: 50,
        p_pct: 0,
        k_pct: 0,
      },
    ],
  },
  jute: {
    id: 'jute',
    name_en: 'Jute (Tossa / Olitorius)',
    name_bn: 'পাট (তোষা পাট)',
    name_hi: 'जूट (पटसन)',
    n_kg_ha: 60,
    p_kg_ha: 30,
    k_kg_ha: 30,
    splits: [
      {
        stage_en: 'Basal Application',
        stage_bn: 'মূল সার প্রয়োগ',
        stage_hi: 'बुवाई के समय',
        timing: 'At land preparation before broadcast or drilling',
        n_pct: 50,
        p_pct: 100,
        k_pct: 100,
      },
      {
        stage_en: 'Top Dressing',
        stage_bn: 'চাপান সার (নিড়ানির পর)',
        stage_hi: 'निराई-गुड़ाई के बाद',
        timing: '30–35 days after sowing following weeding/thinning',
        n_pct: 50,
        p_pct: 0,
        k_pct: 0,
      },
    ],
  },
};

export type FertilizerStrategy = 'single' | 'complex'; // single = Urea+SSP+MOP, complex = Urea+DAP+MOP

export interface SplitDoseItem {
  stage_en: string;
  stage_bn: string;
  stage_hi: string;
  timing: string;
  urea_kg: number;
  ssp_or_dap_kg: number;
  dap_label: string;
  mop_kg: number;
}

export interface CalculationResult {
  land_bigha: number;
  land_katha: number;
  total_hectares: number;
  crop_name: string;
  strategy: FertilizerStrategy;
  required_elemental: {
    n_kg: number;
    p_kg: number;
    k_kg: number;
  };
  fertilizers_kg: {
    urea: number;
    ssp_or_dap: number;
    dap_label: string;
    mop: number;
  };
  bags: {
    urea_50kg: number;
    ssp_or_dap_50kg: number;
    mop_50kg: number;
  };
  schedule: SplitDoseItem[];
  savings_estimate_inr: number; // vs unguided dealer over-application
}

/**
 * Calculates exact fertilizer requirement based on land size and BCKV package of practices
 * @param cropId - Crop identifier
 * @param bigha - Number of Bighas (1 Bigha = 0.1338 ha)
 * @param katha - Number of Kathas (1 Katha = 0.00669 ha, 20 Katha = 1 Bigha)
 * @param strategy - 'single' (Urea+SSP+MOP) or 'complex' (Urea+DAP+MOP)
 */
export function calculateFertilizerDosage(
  cropId: string,
  bigha: number,
  katha: number = 0,
  strategy: FertilizerStrategy = 'single'
): CalculationResult {
  const crop = CROP_BASELINES[cropId] || CROP_BASELINES.aman_paddy;

  // Bengal land conversion standard
  // 1 Bigha = 0.1338 ha, 1 Katha = 0.00669 ha
  const validBigha = Math.max(0, bigha);
  const validKatha = Math.max(0, katha);
  const totalHectares = validBigha * 0.1338 + validKatha * 0.00669;

  // 1. Calculate Required Elemental N, P2O5, K2O in kg
  const nRequired = totalHectares * crop.n_kg_ha;
  const pRequired = totalHectares * crop.p_kg_ha;
  const kRequired = totalHectares * crop.k_kg_ha;

  let totalUreaKg = 0;
  let totalPhosphaticKg = 0;
  let dapLabel = 'SSP (16% P₂O₅)';
  const totalMopKg = Math.round((kRequired / 0.60) * 10) / 10; // MOP contains 60% K2O

  if (strategy === 'single') {
    // Option A: Single Nutrient Sources
    // Urea (46% N) = Required N / 0.46
    // SSP (16% P) = Required P2O5 / 0.16
    totalUreaKg = Math.round((nRequired / 0.46) * 10) / 10;
    totalPhosphaticKg = Math.round((pRequired / 0.16) * 10) / 10;
    dapLabel = 'SSP (Single Super Phosphate 16%)';
  } else {
    // Option B: Complex Fertilizers (DAP + Urea + MOP)
    // DAP (18:46:0) supplies 18% N and 46% P2O5
    totalPhosphaticKg = Math.round((pRequired / 0.46) * 10) / 10;
    dapLabel = 'DAP (Di-Ammonium Phosphate 18:46:0)';
    const nFromDap = totalPhosphaticKg * 0.18;
    const remainingN = Math.max(0, nRequired - nFromDap);
    totalUreaKg = Math.round((remainingN / 0.46) * 10) / 10;
  }

  // 2. Compute Split Application Schedule
  const schedule: SplitDoseItem[] = crop.splits.map((s) => {
    const ureaDose = Math.round((totalUreaKg * (s.n_pct / 100)) * 10) / 10;
    const phosphaticDose = Math.round((totalPhosphaticKg * (s.p_pct / 100)) * 10) / 10;
    const mopDose = Math.round((totalMopKg * (s.k_pct / 100)) * 10) / 10;

    return {
      stage_en: s.stage_en,
      stage_bn: s.stage_bn,
      stage_hi: s.stage_hi,
      timing: s.timing,
      urea_kg: ureaDose,
      ssp_or_dap_kg: phosphaticDose,
      dap_label: dapLabel,
      mop_kg: mopDose,
    };
  });

  // 3. Approximate Bags (50kg bags)
  const ureaBags = Math.round((totalUreaKg / 50) * 10) / 10;
  const phosphaticBags = Math.round((totalPhosphaticKg / 50) * 10) / 10;
  const mopBags = Math.round((totalMopKg / 50) * 10) / 10;

  // 4. Financial savings estimate vs typical dealer over-application (~30% excess nitrogen/DAP)
  // Urea ~ ₹266/bag, DAP ~ ₹1,350/bag, MOP ~ ₹1,700/bag, SSP ~ ₹450/bag
  const baselineCost =
    strategy === 'single'
      ? (totalUreaKg / 50) * 266 + (totalPhosphaticKg / 50) * 450 + (totalMopKg / 50) * 1700
      : (totalUreaKg / 50) * 266 + (totalPhosphaticKg / 50) * 1350 + (totalMopKg / 50) * 1700;
  
  const estimatedSavings = Math.round(baselineCost * 0.28); // 28% reduction in unneeded chemical spend

  return {
    land_bigha: validBigha,
    land_katha: validKatha,
    total_hectares: Math.round(totalHectares * 1000) / 1000,
    crop_name: crop.name_en,
    strategy,
    required_elemental: {
      n_kg: Math.round(nRequired * 10) / 10,
      p_kg: Math.round(pRequired * 10) / 10,
      k_kg: Math.round(kRequired * 10) / 10,
    },
    fertilizers_kg: {
      urea: totalUreaKg,
      ssp_or_dap: totalPhosphaticKg,
      dap_label: dapLabel,
      mop: totalMopKg,
    },
    bags: {
      urea_50kg: ureaBags,
      ssp_or_dap_50kg: phosphaticBags,
      mop_50kg: mopBags,
    },
    schedule,
    savings_estimate_inr: Math.max(150, estimatedSavings),
  };
}
