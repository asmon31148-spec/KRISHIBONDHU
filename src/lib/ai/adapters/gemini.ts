import { CropScanResult, VisionAnalysisRequest, AiProviderAdapter } from '../types';

export class GeminiVisionAdapter implements AiProviderAdapter {
  name = 'gemini';

  async analyzeCrop(request: VisionAnalysisRequest): Promise<CropScanResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.includes('your_gemini_api_key')) {
      throw new Error('Gemini API key is not configured.');
    }

    const model = process.env.AI_VISION_MODEL || 'gemini-2.5-flash';
    const lang = request.language || 'en';

    const langRule =
      lang === 'bn'
        ? 'STRICT LANGUAGE REQUIREMENT: Output ALL textual JSON fields (crop_name, disease_name, uncertainty_reason, symptoms, affected_parts, ai_explanation, treatment_organic, treatment_chemical, prevention_advice, expert_advice, regional_context) strictly in fluent, natural, respectful Bengali (বাংলা). Do NOT mix English sentences or English words. Write Bengali names and terms (e.g. ধান, আলু, বেগুন, ব্লাস্ট রোগ, ট্রাইকোডার্মা).'
        : lang === 'hi'
        ? 'STRICT LANGUAGE REQUIREMENT: Output ALL textual JSON fields strictly in fluent, natural Hindi (हिन्दी). Do NOT mix English sentences.'
        : 'Output ALL textual JSON fields in plain, clear English.';

    const promptText = `
You are an expert plant pathologist and agronomist specializing in Indian agriculture, specifically West Bengal and eastern India agro-climatic zones.
Analyze the provided crop leaf photo.

STRICT HONESTY RULES:
1. If the photo is blurry, out of focus, too dark, unreadable, or NOT a plant/crop, you MUST set "is_uncertain": true, "severity": "uncertain", "crop_name": "Uncertain / Unclear", "crop_confidence": 0, "disease_name": null, "disease_confidence": null, and explain clearly in "uncertainty_reason" why a clearer photo of a single leaf is needed.
2. Never guess or present a low-confidence assumption as a confirmed diagnosis. If crop confidence is below 60%, mark "is_uncertain": true.
3. If the crop is healthy with no disease symptoms, set "is_healthy": true, "disease_name": null, "disease_confidence": 0, "severity": "healthy".
4. When disease is present, provide actionable remedies: Organic/biological controls FIRST, then certified chemical treatments with exact safety disclaimers (wear mask/gloves, follow product label).
5. ${langRule}

Farmer Location Context: ${request.farmerLocation || 'West Bengal, India'}
Current Weather Context: ${JSON.stringify(request.weatherContext || {})}

Return STRICT JSON matching this schema:
{
  "crop_name": string,
  "crop_confidence": number (0-100),
  "is_healthy": boolean,
  "disease_name": string or null,
  "disease_confidence": number or null (0-100),
  "severity": "healthy" | "mild" | "moderate" | "severe" | "uncertain",
  "is_uncertain": boolean,
  "uncertainty_reason": string (if uncertain),
  "symptoms": string[],
  "affected_parts": string[],
  "ai_explanation": string,
  "treatment_organic": string,
  "treatment_chemical": string,
  "prevention_advice": string,
  "expert_advice": string,
  "regional_context": string
}
`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const body = {
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inlineData: {
                mimeType: request.mimeType,
                data: request.imageBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`Gemini API error (${res.status}): ${errorBody}`);
      }

      const json = await res.json();
      const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error('Empty response from Gemini vision model.');
      }

      const parsed: CropScanResult = JSON.parse(rawText);
      return parsed;
    } finally {
      clearTimeout(timeout);
    }
  }
}
