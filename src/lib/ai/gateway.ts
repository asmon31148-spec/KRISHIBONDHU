import { CropScanResult, VisionAnalysisRequest, AiProviderAdapter } from './types';
import { GeminiVisionAdapter } from './adapters/gemini';
import { GroqVisionAdapter } from './adapters/groq';
import { OpenRouterVisionAdapter } from './adapters/openrouter';
import { z } from 'zod';

const cropScanResultSchema = z.object({
  crop_name: z.string().default('Uncertain / Unclear'),
  crop_confidence: z.number().min(0).max(100).default(0),
  is_healthy: z.boolean().default(false),
  disease_name: z.string().nullable().default(null),
  disease_confidence: z.number().min(0).max(100).nullable().default(null),
  severity: z.enum(['healthy', 'mild', 'moderate', 'severe', 'uncertain']).default('uncertain'),
  is_uncertain: z.boolean().default(false),
  uncertainty_reason: z.string().optional(),
  symptoms: z.array(z.string()).default([]),
  affected_parts: z.array(z.string()).default([]),
  ai_explanation: z.string().default(''),
  treatment_organic: z.string().default(''),
  treatment_chemical: z.string().default(''),
  prevention_advice: z.string().default(''),
  expert_advice: z.string().default(''),
  regional_context: z.string().optional(),
});

export class AiGateway {
  private adapters: AiProviderAdapter[] = [];

  constructor() {
    // Register configured adapters in priority order
    this.adapters = [
      new GeminiVisionAdapter(),
      new GroqVisionAdapter(),
      new OpenRouterVisionAdapter(),
    ];
  }

  async analyzeCropImage(request: VisionAnalysisRequest): Promise<{
    result: CropScanResult;
    providerUsed: string;
  }> {
    // 1. Check emergency kill switch
    if (process.env.AI_KILL_SWITCH === 'true') {
      throw new Error(
        'AI services are currently suspended by the platform administrator for cost maintenance.'
      );
    }

    const errors: string[] = [];

    // 2. Iterate through adapter fallback chain
    for (const adapter of this.adapters) {
      try {
        const rawResult = await adapter.analyzeCrop(request);
        // 3. Strict schema validation
        const validated = cropScanResultSchema.parse(rawResult);

        // Enforce honest uncertainty rule: low confidence automatically triggers uncertain state
        if (validated.crop_confidence < 50 || (validated.disease_confidence !== null && validated.disease_confidence < 50)) {
          validated.is_uncertain = true;
          validated.severity = 'uncertain';
          if (!validated.uncertainty_reason) {
            validated.uncertainty_reason =
              'Low diagnostic confidence. A clearer close-up photograph of a single affected leaf is recommended.';
          }
        }

        return {
          result: validated as CropScanResult,
          providerUsed: adapter.name,
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${adapter.name}: ${msg}`);
        console.warn(`AI Provider [${adapter.name}] failed: ${msg}. Proceeding to fallback...`);
      }
    }

    // 4. If all real providers failed or unconfigured, throw clear honest error
    throw new Error(
      `All AI vision providers are currently unavailable or unconfigured. (${errors.join('; ')})`
    );
  }
}

export const aiGateway = new AiGateway();
