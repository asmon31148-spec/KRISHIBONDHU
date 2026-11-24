import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/security/rateLimiter';

function validateImageSignature(buffer: Buffer): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return 'image/png';
  }
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return 'image/webp';
  }
  return null;
}

export interface SoilCardOcrResult {
  readable: boolean;
  n_status: 'low' | 'medium' | 'high';
  p_status: 'low' | 'medium' | 'high';
  k_status: 'low' | 'medium' | 'high';
  nitrogen_kg_ha?: number | null;
  phosphorus_kg_ha?: number | null;
  potassium_kg_ha?: number | null;
  ph?: number | null;
  organic_carbon?: number | null;
  summary: string;
}

export async function POST(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit(req, {
      prefix: 'soil-ocr',
      limit: 10,
      windowSeconds: 60,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before scanning another card.' },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No Soil Health Card image provided.' }, { status: 400 });
    }

    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image size exceeds 8 MB limit.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = validateImageSignature(buffer);
    if (!mimeType) {
      return NextResponse.json(
        { error: 'Unsupported image format. Use JPEG, PNG, or WebP.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.includes('your_gemini_api_key')) {
      return NextResponse.json(
        { error: 'AI Vision service is not configured on the server.' },
        { status: 503 }
      );
    }

    const model = process.env.AI_VISION_MODEL || 'gemini-2.5-flash';
    const base64Data = buffer.toString('base64');

    const promptText = `
You are an expert agricultural soil analyst reading an Indian Government Soil Health Card (মৃত্তিকা স্বাস্থ্য কার্ড / मृदा स्वास्थ्य कार्ड) or Soil Testing Lab report.
Extract the soil nutrient values from this photo.

Indian ICAR Soil Rating Rules:
- Nitrogen (N): < 280 kg/ha = "low", 280-560 kg/ha = "medium", > 560 kg/ha = "high"
- Phosphorus (P): < 10 kg/ha (or P2O5 < 23) = "low", 10-25 kg/ha = "medium", > 25 kg/ha = "high"
- Potassium (K): < 108 kg/ha (or K2O < 130) = "low", 108-280 kg/ha = "medium", > 280 kg/ha = "high"

If the image is NOT a soil report / soil health card or is completely unreadable, set "readable": false.
Otherwise set "readable": true and fill in the extracted values (use null for any numeric field not visible, and "medium" as fallback status only if that specific nutrient is illegible).

Return STRICT JSON:
{
  "readable": boolean,
  "n_status": "low" | "medium" | "high",
  "p_status": "low" | "medium" | "high",
  "k_status": "low" | "medium" | "high",
  "nitrogen_kg_ha": number | null,
  "phosphorus_kg_ha": number | null,
  "potassium_kg_ha": number | null,
  "ph": number | null,
  "organic_carbon": number | null,
  "summary": string
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: promptText },
                { inline_data: { mime_type: mimeType, data: base64Data } },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Vision OCR error: ${response.status} ${errText.slice(0, 120)}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return NextResponse.json({ error: 'Empty response from OCR model.' }, { status: 502 });
    }

    const parsed: SoilCardOcrResult = JSON.parse(rawText);
    return NextResponse.json({ success: true, result: parsed });
  } catch (err) {
    console.error('Soil Card OCR error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to scan Soil Health Card.' },
      { status: 500 }
    );
  }
}
