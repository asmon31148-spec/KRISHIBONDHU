import { CropScanResult, VisionAnalysisRequest, AiProviderAdapter } from '../types';

export class GroqVisionAdapter implements AiProviderAdapter {
  name = 'groq';

  async analyzeCrop(request: VisionAnalysisRequest): Promise<CropScanResult> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.includes('your_groq_api_key')) {
      throw new Error('Groq API key is not configured.');
    }

    const model = process.env.GROQ_VISION_MODEL || 'llama-3.2-11b-vision-preview';
    const lang = request.language || 'en';

    const systemPrompt = `You are an expert plant pathologist. Analyze the crop leaf photo and return strictly valid JSON matching this schema:
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
}
Strict honesty: If unclear, blurry, or not a plant, mark is_uncertain: true. Language requested: ${lang}`;

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

      return JSON.parse(content) as CropScanResult;
    } finally {
      clearTimeout(timeout);
    }
  }
}
