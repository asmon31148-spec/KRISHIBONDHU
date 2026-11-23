import { NextRequest, NextResponse } from 'next/server';
import {
  CROP_BASELINES,
  calculateFertilizerDosage,
  CropFertilizerBaseline,
  FertilizerStrategy,
  SoilTestOptions,
} from '@/lib/agronomy/fertilizer';
import { fetchLiveWeather } from '@/lib/weather/open-meteo';

interface AnalyzeRequestBody {
  cropId?: string;
  customCropName?: string;
  bigha: number;
  katha?: number;
  strategy?: FertilizerStrategy;
  soilNStatus?: 'low' | 'medium' | 'high';
  soilPStatus?: 'low' | 'medium' | 'high';
  soilKStatus?: 'low' | 'medium' | 'high';
  soilTexture?: 'alluvial_clay' | 'loam' | 'sandy_laterite' | 'coastal_saline';
  fymAppliedTonsPerBigha?: number;
  latitude?: number;
  longitude?: number;
  district?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: AnalyzeRequestBody = await req.json();
    const {
      cropId,
      customCropName,
      bigha = 1,
      katha = 0,
      strategy = 'single',
      soilNStatus = 'medium',
      soilPStatus = 'medium',
      soilKStatus = 'medium',
      soilTexture = 'loam',
      fymAppliedTonsPerBigha = 0,
      latitude,
      longitude,
      district = 'Hooghly',
    } = body;

    let baseline: CropFertilizerBaseline | undefined = cropId ? CROP_BASELINES[cropId] : undefined;
    let isAiAnalyzed = false;

    // 1. If custom crop or unlisted variety provided, dynamically analyze with AI agronomist
    if (!baseline && customCropName && customCropName.trim().length > 0) {
      try {
        const groqKey = process.env.GROQ_API_KEY;
        if (groqKey) {
          const prompt = `You are a Senior Agronomist at Bidhan Chandra Krishi Viswavidyalaya (BCKV) / ICAR.
Provide the standard scientific fertilizer package of practices (N:P:K in kg/ha, splits, and micronutrients) for the following crop grown in West Bengal / Eastern India: "${customCropName.trim()}".
Return strictly valid JSON with this exact schema (no markdown, no code fences):
{
  "name_en": "${customCropName.trim()}",
  "name_bn": "বাংলা নাম",
  "name_hi": "हिंदी नाम",
  "category": "vegetables" or "cereals" or "oilseeds_cash" or "pulses" or "spices",
  "n_kg_ha": number,
  "p_kg_ha": number,
  "k_kg_ha": number,
  "fym_ton_ha": number,
  "micronutrient_advice_en": string,
  "micronutrient_advice_bn": string,
  "splits": [
    {
      "stage_en": "Basal Application",
      "stage_bn": "মূল সার প্রয়োগ",
      "stage_hi": "बुवाई के समय",
      "timing": "At sowing / planting",
      "n_pct": 50,
      "p_pct": 100,
      "k_pct": 50
    },
    {
      "stage_en": "Top Dressing",
      "stage_bn": "চাপান সার",
      "stage_hi": "छिड़काव",
      "timing": "30 days after sowing",
      "n_pct": 50,
      "p_pct": 0,
      "k_pct": 50
    }
  ]
}`;

          const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${groqKey}`,
            },
            body: JSON.stringify({
              model: 'qwen/qwen3.8-27b',
              messages: [
                {
                  role: 'system',
                  content:
                    'You are an expert ICAR agricultural research scientist. Respond only in strict JSON format without any markdown or code blocks.',
                },
                { role: 'user', content: prompt },
              ],
              temperature: 0.1,
            }),
          });

          if (groqRes.ok) {
            const data = await groqRes.json();
            const text = data.choices?.[0]?.message?.content || '';
            const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned);

            if (parsed.n_kg_ha && parsed.splits && Array.isArray(parsed.splits)) {
              baseline = {
                id: 'custom_' + Date.now(),
                name_en: parsed.name_en || customCropName,
                name_bn: parsed.name_bn || customCropName,
                name_hi: parsed.name_hi || customCropName,
                category: parsed.category || 'vegetables',
                n_kg_ha: Number(parsed.n_kg_ha) || 80,
                p_kg_ha: Number(parsed.p_kg_ha) || 40,
                k_kg_ha: Number(parsed.k_kg_ha) || 40,
                fym_ton_ha: Number(parsed.fym_ton_ha) || 10,
                micronutrients_advice: {
                  en: parsed.micronutrient_advice_en || '',
                  bn: parsed.micronutrient_advice_bn || '',
                  hi: '',
                },
                splits: parsed.splits,
              };
              isAiAnalyzed = true;
            }
          }
        }
      } catch (aiErr) {
        console.warn('AI agronomy dynamic lookup failed, using general vegetable baseline:', aiErr);
      }
    }

    // Default to aman_paddy if still not found
    if (!baseline) {
      baseline = CROP_BASELINES.aman_paddy;
    }

    const soilOptions: SoilTestOptions = {
      soilNStatus,
      soilPStatus,
      soilKStatus,
      soilTexture,
      fymAppliedTonsPerBigha,
      customBaseline: baseline,
    };

    const result = calculateFertilizerDosage(baseline.id, bigha, katha, strategy, soilOptions);

    // 2. Fetch Live Weather for Field Leaching & Rain Advisory
    let liveWeatherAdvisory: {
      temperature: number;
      rainExpectedNext48h: boolean;
      rainProbability: number;
      leachingRiskWarning: string | null;
    } | null = null;

    try {
      const lat = latitude || 22.9031; // Default Hooghly / Burdwan coordinates
      const lon = longitude || 88.3968;
      const weather = await fetchLiveWeather(lat, lon, `${district}, West Bengal`);

      if (weather && weather.current) {
        const nextTwoDaysRain = (weather.daily || []).slice(0, 2).reduce((sum, d) => sum + (d.precipitationSum || 0), 0);
        const rainProb = Math.max(...(weather.daily || []).slice(0, 2).map((d) => d.precipitationProbability || 0));

        let warning: string | null = null;
        if (nextTwoDaysRain > 5 || rainProb > 60) {
          warning =
            'Rain alert: Precipitation forecast in the next 24-48 hours. Delay urea top-dressing to prevent leaching losses.';
        } else if (weather.current.temperature > 36) {
          warning =
            'High temperature alert: Broadcast urea during early morning or late afternoon to prevent ammonia volatilization.';
        }

        liveWeatherAdvisory = {
          temperature: weather.current.temperature,
          rainExpectedNext48h: nextTwoDaysRain > 3,
          rainProbability: rainProb,
          leachingRiskWarning: warning,
        };
      }
    } catch {
      // Non-blocking weather enhancement
    }

    return NextResponse.json({
      success: true,
      result,
      isAiAnalyzed,
      baseline,
      liveWeatherAdvisory,
      district,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Fertilizer calculation error';
    console.error('Fertilizer analyze error:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
