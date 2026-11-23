/**
 * KRISHIBONDHU - Structured Agronomic Pesticide & Bio-remedy Registry
 * Sourced directly from Central Insecticides Board & Registration Committee (CIBRC)
 * and Bidhan Chandra Krishi Viswavidyalaya (BCKV) Plant Protection Bulletins.
 *
 * RULE (Section 5 & 8): AI must never guess dosages. Chemical doses must strictly
 * match this verified registry or state "Refer to official product label".
 * Organic / cultural measures are always listed first.
 */

export interface RegisteredPesticide {
  id: string;
  activeIngredient: string;
  formulation: string;
  approvedCrops: string[];
  targetPestOrDisease: string[];
  labelDosePerLiter: string;
  labelDosePerAcre: string;
  waitingPeriodPhiDays: number;
  toxicityClassification: 'Slightly Toxic (Blue)' | 'Caution (Green)' | 'Moderately Toxic (Blue)' | 'Highly Toxic (Yellow)';
  organicAlternative: string;
  sourceDoc: string;
}

export const REGISTERED_PESTICIDES: RegisteredPesticide[] = [
  // Potato Blights
  {
    id: 'mancozeb-75-wp',
    activeIngredient: 'Mancozeb',
    formulation: '75% WP',
    approvedCrops: ['Potato', 'Tomato', 'Chilli', 'Groundnut', 'Grapes'],
    targetPestOrDisease: ['Late Blight (Phytophthora infestans)', 'Early Blight (Alternaria solani)', 'Leaf Spot'],
    labelDosePerLiter: '2.0 - 2.5 g / Liter of water',
    labelDosePerAcre: '400 - 500 g in 200 Liters of water / acre',
    waitingPeriodPhiDays: 7,
    toxicityClassification: 'Caution (Green)',
    organicAlternative: 'Prophylactic spray of Trichoderma viride @ 5g/L + balanced potash application to avoid excessive foliage lushness.',
    sourceDoc: 'CIBRC Major Uses & BCKV Potato Package of Practices',
  },
  {
    id: 'cymoxanil-mancozeb',
    activeIngredient: 'Cymoxanil 8% + Mancozeb 64%',
    formulation: '72% WP',
    approvedCrops: ['Potato', 'Tomato', 'Grapes'],
    targetPestOrDisease: ['Late Blight (curative / systemic intervention)'],
    labelDosePerLiter: '2.0 - 2.5 g / Liter of water',
    labelDosePerAcre: '500 g in 200 Liters of water / acre',
    waitingPeriodPhiDays: 10,
    toxicityClassification: 'Moderately Toxic (Blue)',
    organicAlternative: 'Immediate rogueing of infected plants, burning blight foliage, stop furrow flooding.',
    sourceDoc: 'CIBRC Registered Fungicides & ICAR-CPRI Shimla',
  },
  {
    id: 'copper-oxychloride',
    activeIngredient: 'Copper Oxychloride',
    formulation: '50% WP',
    approvedCrops: ['Potato', 'Tomato', 'Chilli', 'Paddy', 'Citrus'],
    targetPestOrDisease: ['Late Blight', 'Bacterial Leaf Spot', 'Bacterial Wilt suppression'],
    labelDosePerLiter: '2.5 - 3.0 g / Liter of water',
    labelDosePerAcre: '500 - 600 g in 200 Liters of water / acre',
    waitingPeriodPhiDays: 14,
    toxicityClassification: 'Caution (Green)',
    organicAlternative: 'Bordeaux mixture (1%) or Copper soap spray.',
    sourceDoc: 'CIBRC Major Uses & BCKV Horticultural Advisory',
  },

  // Rice / Paddy Diseases
  {
    id: 'tricyclazole-75-wp',
    activeIngredient: 'Tricyclazole',
    formulation: '75% WP',
    approvedCrops: ['Rice (Paddy)'],
    targetPestOrDisease: ['Rice Blast (Leaf Blast, Neck Blast, Node Blast)'],
    labelDosePerLiter: '0.6 g / Liter of water',
    labelDosePerAcre: '120 - 150 g in 200 Liters of water / acre',
    waitingPeriodPhiDays: 30,
    toxicityClassification: 'Moderately Toxic (Blue)',
    organicAlternative: 'Seed treatment with Pseudomonas fluorescens @ 10g/kg seed; avoid excessive top-dressing with Urea.',
    sourceDoc: 'CIBRC Major Uses & ICAR-NRRI Cuttack Blast Guidelines',
  },
  {
    id: 'hexaconazole-5-sc',
    activeIngredient: 'Hexaconazole',
    formulation: '5% SC',
    approvedCrops: ['Rice (Paddy)', 'Mango', 'Chilli'],
    targetPestOrDisease: ['Sheath Blight (Rhizoctonia solani)', 'Powdery Mildew'],
    labelDosePerLiter: '2.0 ml / Liter of water',
    labelDosePerAcre: '400 ml in 200 Liters of water / acre',
    waitingPeriodPhiDays: 30,
    toxicityClassification: 'Moderately Toxic (Blue)',
    organicAlternative: 'Drain excess standing water from paddy fields; apply neem cake @ 100 kg/acre.',
    sourceDoc: 'CIBRC Major Uses & BCKV Plant Pathology Bulletins',
  },
  {
    id: 'validamycin-3-l',
    activeIngredient: 'Validamycin',
    formulation: '3% L',
    approvedCrops: ['Rice (Paddy)'],
    targetPestOrDisease: ['Sheath Blight'],
    labelDosePerLiter: '2.0 - 2.5 ml / Liter of water',
    labelDosePerAcre: '400 - 500 ml in 200 Liters of water / acre',
    waitingPeriodPhiDays: 15,
    toxicityClassification: 'Caution (Green)',
    organicAlternative: 'Spray biological formulation of Trichoderma harzianum @ 5g/L at tillering.',
    sourceDoc: 'CIBRC Registered Bio-antibiotics & ICAR-NRRI',
  },

  // Paddy Pests
  {
    id: 'chlorantraniliprole-18-5-sc',
    activeIngredient: 'Chlorantraniliprole',
    formulation: '18.5% SC',
    approvedCrops: ['Rice (Paddy)', 'Tomato', 'Cabbage', 'Brinjal', 'Sugarcane'],
    targetPestOrDisease: ['Yellow Stem Borer (Scirpophaga incertulas)', 'Leaf Folder (Cnaphalocrocis medinalis)', 'Fruit Borer'],
    labelDosePerLiter: '0.3 - 0.4 ml / Liter of water',
    labelDosePerAcre: '60 ml in 150-200 Liters of water / acre',
    waitingPeriodPhiDays: 14,
    toxicityClassification: 'Caution (Green)',
    organicAlternative: 'Install Pheromone Traps @ 8 traps/acre; release Trichogramma japonicum egg parasitoids @ 40,000/acre.',
    sourceDoc: 'CIBRC Registered Insecticides & BCKV Entomology Guide',
  },
  {
    id: 'cartap-hydrochloride-50-sp',
    activeIngredient: 'Cartap Hydrochloride',
    formulation: '50% SP',
    approvedCrops: ['Rice (Paddy)'],
    targetPestOrDisease: ['Stem Borer', 'Leaf Folder'],
    labelDosePerLiter: '1.5 - 2.0 g / Liter of water',
    labelDosePerAcre: '300 - 400 g in 200 Liters of water / acre',
    waitingPeriodPhiDays: 21,
    toxicityClassification: 'Moderately Toxic (Blue)',
    organicAlternative: 'Light traps @ 1 trap/acre to monitor adult moth population; clipping of seedling tips before transplanting.',
    sourceDoc: 'CIBRC Major Uses of Insecticides',
  },

  // Vegetable Pests (Brinjal, Tomato, Chilli, Jute)
  {
    id: 'emamectin-benzoate-5-sg',
    activeIngredient: 'Emamectin Benzoate',
    formulation: '5% SG',
    approvedCrops: ['Brinjal', 'Tomato', 'Chilli', 'Okra', 'Cabbage', 'Cauliflower', 'Chickpea'],
    targetPestOrDisease: ['Fruit and Shoot Borer (Leucinodes orbonalis)', 'Diamondback Moth (DBM)', 'Helicoverpa Pod Borer'],
    labelDosePerLiter: '0.4 - 0.5 g / Liter of water',
    labelDosePerAcre: '80 - 100 g in 200 Liters of water / acre',
    waitingPeriodPhiDays: 3,
    toxicityClassification: 'Caution (Green)',
    organicAlternative: 'Clip and destroy drooping infested shoots weekly; spray Bacillus thuringiensis (Bt) @ 2g/L or Neem Oil (1500 ppm) @ 3 ml/L.',
    sourceDoc: 'CIBRC Major Uses & ICAR-IIVR Varanasi',
  },
  {
    id: 'imidacloprid-17-8-sl',
    activeIngredient: 'Imidacloprid',
    formulation: '17.8% SL',
    approvedCrops: ['Rice', 'Chilli', 'Tomato', 'Cotton', 'Okra'],
    targetPestOrDisease: ['Brown Plant Hopper (BPH)', 'Aphids', 'Jassids', 'Whitefly', 'Thrips (Chilli Murda)'],
    labelDosePerLiter: '0.3 - 0.5 ml / Liter of water',
    labelDosePerAcre: '50 - 60 ml in 150-200 Liters of water / acre',
    waitingPeriodPhiDays: 21,
    toxicityClassification: 'Moderately Toxic (Blue)',
    organicAlternative: 'Yellow sticky traps @ 10/acre for whiteflies; spray Verticillium lecanii @ 5g/L in humid conditions.',
    sourceDoc: 'CIBRC Insecticide Registry',
  },

  // Jute & Oilseed
  {
    id: 'spiromesifen-22-9-sc',
    activeIngredient: 'Spiromesifen',
    formulation: '22.9% SC',
    approvedCrops: ['Jute', 'Brinjal', 'Tomato', 'Chilli', 'Tea'],
    targetPestOrDisease: ['Yellow Mite (Polyphagotarsonemus latus)', 'Red Spider Mite'],
    labelDosePerLiter: '1.0 ml / Liter of water',
    labelDosePerAcre: '200 ml in 200 Liters of water / acre',
    waitingPeriodPhiDays: 7,
    toxicityClassification: 'Moderately Toxic (Blue)',
    organicAlternative: 'Spray Wettable Sulphur 80% WP @ 2.5g/L or Neem Seed Kernel Extract (NSKE 5%).',
    sourceDoc: 'ICAR-CRIJAF Barrackpore Jute Protection Guidelines',
  },
];

/**
 * Find registered pesticides matching a crop name and optional pest/disease
 */
export function findRegisteredPesticides(cropName: string, pestOrDisease?: string): RegisteredPesticide[] {
  const normCrop = cropName.toLowerCase();
  const normTarget = (pestOrDisease || '').toLowerCase();

  return REGISTERED_PESTICIDES.filter((p) => {
    const cropMatch = p.approvedCrops.some((c) => normCrop.includes(c.toLowerCase()) || c.toLowerCase().includes(normCrop));
    if (!pestOrDisease) return cropMatch;
    const targetMatch = p.targetPestOrDisease.some((t) => normTarget.includes(t.toLowerCase()) || t.toLowerCase().includes(normTarget));
    return cropMatch && targetMatch;
  });
}

/**
 * Returns structured prompt grounding for AI reasoning pipeline
 */
export function buildPesticideRegistryGrounding(): string {
  const tableSummary = REGISTERED_PESTICIDES.map(
    (p) => `- ${p.approvedCrops.join('/')} -> ${p.targetPestOrDisease.join(', ')}:
    * Chemical: ${p.activeIngredient} ${p.formulation} @ ${p.labelDosePerLiter} (PHI: ${p.waitingPeriodPhiDays} days, Class: ${p.toxicityClassification})
    * Cultural/Organic: ${p.organicAlternative}`
  ).join('\n');

  return `
OFFICIAL CIBRC & BCKV REGISTERED PESTICIDE & TREATMENT REGISTRY:
${tableSummary}

MANDATORY RULES FOR TREATMENT & PESTICIDE RECOMMENDATIONS:
1. Always list CULTURAL and ORGANIC controls FIRST before recommending any synthetic chemical.
2. If recommending any chemical listed above, quote its EXACT registered dosage as printed.
3. NEVER invent or extrapolate a dosage for unregistered chemicals. If a disease/pest is not in the registry above, state plainly: "Refer strictly to the manufacturer container label registered by CIBRC, or consult your local Block Agriculture Officer (BAO) or Krishi Vigyan Kendra (KVK)."
4. Always state the Pre-Harvest Interval (PHI waiting period before picking/harvesting) and mandate protective face mask, gloves, and spraying during calm morning/evening hours.
5. If the outbreak covers large acreage or threatens severe crop loss, mandate escalation to the local KVK or nearest agricultural university extension desk.
`;
}
