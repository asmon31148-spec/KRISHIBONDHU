/**
 * KRISHIBONDHU - Agricultural Land & Yield Unit Conversion Utilities
 * Calibrated for West Bengal and Indian regional land measurements.
 *
 * Official Bengal Standard:
 * 1 Bigha = 20 Katha = 14,400 sq. ft ≈ 0.3305785 Acres
 * 1 Acre = 3.025 Bigha = 60.5 Katha = 43,560 sq. ft ≈ 0.404686 Hectares
 * 1 Hectare = 10,000 sq. meters ≈ 2.47105 Acres ≈ 7.475 Bigha
 * 1 Katha = 720 sq. ft ≈ 0.0165289 Acres
 */

export type LandUnit = 'acres' | 'bigha' | 'katha' | 'hectares';

export const CONVERSION_TO_ACRES: Record<LandUnit, number> = {
  acres: 1.0,
  bigha: 0.3305785,
  katha: 0.016528925,
  hectares: 2.47105,
};

export function convertLandArea(
  value: number,
  fromUnit: LandUnit,
  toUnit: LandUnit
): number {
  if (value <= 0) return 0;
  if (fromUnit === toUnit) return value;

  // Convert to acres as normalized base
  const acres = value * CONVERSION_TO_ACRES[fromUnit];
  // Convert from acres to target unit
  const targetValue = acres / CONVERSION_TO_ACRES[toUnit];

  return Math.round(targetValue * 1000) / 1000;
}

export function formatLandArea(value: number, unit: LandUnit): string {
  const rounded = Math.round(value * 100) / 100;
  const unitNames: Record<LandUnit, string> = {
    acres: 'Acres',
    bigha: 'Bigha (বিঘা)',
    katha: 'Katha (কাঠা)',
    hectares: 'Hectares',
  };
  return `${rounded} ${unitNames[unit] || unit}`;
}
