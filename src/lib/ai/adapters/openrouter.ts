import { CropScanResult, VisionAnalysisRequest, AiProviderAdapter } from '../types';

export class OpenRouterVisionAdapter implements AiProviderAdapter {
  name = 'openrouter';

  async analyzeCrop(request: VisionAnalysisRequest): Promise<CropScanResult> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey.includes('your_openrouter_api_key')) {
      throw new Error('OpenRouter API key is not configured.');
    }

    let model = process.env.OPENROUTER_VISION_MODEL || 'nvidia/nemotron-3.5-super-vl:free';
    if (!model || model === 'openrouter/free') {
      model = 'nvidia/nemotron-3.5-super-vl:free';
    }
    const lang = request.language || 'en';

    const systemPrompt = `You are a plant pathologist. Return strictly JSON crop diagnosis. Language: ${lang}.
If not a plant or blurry, set is_uncertain: true.
Schema:
{
  "crop_name": string,
  "crop_confidence": number,
  "is_healthy": boolean,
  "disease_name": string or null,
  "disease_confidence": number or null,
  "severity": "healthy" | "mild" | "moderate" | "severe" | "uncertain",
  "is_uncertain": boolean,
  "uncertainty_reason": string,
  "symptoms": string[],
  "affected_parts": string[],
  "ai_explanation": string,
  "treatment_organic": string,
  "treatment_chemical": string,
  "prevention_advice": string,
  "expert_advice": string,
  "regional_context": string
}`;

    const url = 'https://openrouter.ai/api/v1/chat/completions';
    const body = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this crop leaf for plant pathology diagnosis.' },
            {
              type: 'image_url',
              image_url: {
                url: `data:${request.mimeType};base64,${request.imageBase64}`,
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35000);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`OpenRouter error (${res.status}): ${await res.text()}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('Empty response from OpenRouter');

      const parsed = JSON.parse(content) as CropScanResult;
      if (typeof parsed.crop_confidence === 'number' && parsed.crop_confidence <= 1 && parsed.crop_confidence > 0) {
        parsed.crop_confidence = Math.round(parsed.crop_confidence * 100);
      }
      if (typeof parsed.disease_confidence === 'number' && parsed.disease_confidence <= 1 && parsed.disease_confidence > 0) {
        parsed.disease_confidence = Math.round(parsed.disease_confidence * 100);
      }

      return parsed;
    } finally {
      clearTimeout(timeout);
    }
  }
}
