import { CropScanResult, VisionAnalysisRequest, AiProviderAdapter } from '../types';

export class GroqVisionAdapter implements AiProviderAdapter {
  name = 'groq';

  async analyzeCrop(request: VisionAnalysisRequest): Promise<CropScanResult> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.includes('your_groq_api_key')) {
      throw new Error('Groq API key is not configured.');
    }

    let model = process.env.GROQ_VISION_MODEL || 'qwen/qwen3.8-27b';
    if (model.includes('llama-3.2-11b') || model.includes('llama-3.2-90b') || model.includes('decommissioned')) {
      model = 'qwen/qwen3.8-27b';
    }
    const lang = request.language || 'en';
    const langRule =
      lang === 'bn'
        ? 'STRICT LANGUAGE REQUIREMENT: Output ALL textual JSON fields (crop_name, disease_name, uncertainty_reason, symptoms, affected_parts, ai_explanation, treatment_organic, treatment_chemical, prevention_advice, expert_advice, regional_context) strictly in fluent, natural, respectful Bengali (বাংলা). Do NOT mix English sentences or English words. Write Bengali names and terms (e.g. ধান, আলু, বেগুন, ব্লাস্ট রোগ, ট্রাইকোডার্মা).'
        : lang === 'hi'
        ? 'STRICT LANGUAGE REQUIREMENT: Output ALL textual JSON fields strictly in fluent, natural Hindi (हिन्दी). Do NOT mix English sentences.'
        : 'Output ALL textual JSON fields in plain, clear English.';

    const systemPrompt = `You are an expert plant pathologist. Analyze the crop leaf photo and return strictly valid JSON matching this schema:
{
  "crop_name": string,
  "crop_confidence": number between 0 and 100,
  "is_healthy": boolean,
  "disease_name": string or null,
  "disease_confidence": number between 0 and 100 or null,
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
}
Strict honesty: If unclear, blurry, or not a plant, mark is_uncertain: true.
${langRule}`;

    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const body = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this plant leaf photo for disease.' },
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
      temperature: 0.2,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

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
        throw new Error(`Groq API error (${res.status}): ${await res.text()}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('Empty response from Groq');

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
