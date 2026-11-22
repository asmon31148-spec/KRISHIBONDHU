/**
 * KRISHIBONDHU - AI Gateway Types & Agronomy Diagnostic Contracts
 */

export type SeverityLevel = 'healthy' | 'mild' | 'moderate' | 'severe' | 'uncertain';

export interface CropScanResult {
  crop_name: string;
  crop_confidence: number; // 0 to 100
  is_healthy: boolean;
  disease_name: string | null;
  disease_confidence: number | null; // 0 to 100
  severity: SeverityLevel;
  is_uncertain: boolean;
  uncertainty_reason?: string;
  symptoms: string[];
  affected_parts: string[];
  ai_explanation: string;
  treatment_organic: string;
  treatment_chemical: string;
  prevention_advice: string;
  expert_advice: string;
  regional_context?: string;
}

export interface VisionAnalysisRequest {
  imageBase64: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  language?: 'en' | 'bn' | 'hi';
  farmerLocation?: string;
  weatherContext?: {
    temperature?: number;
    humidity?: number;
    rainfall?: number;
    season?: string;
  };
}

export interface AiProviderAdapter {
  name: string;
  analyzeCrop(request: VisionAnalysisRequest): Promise<CropScanResult>;
}
