/**
 * KRISHIBONDHU - Agronomy AI Assistant Brain
 * Grounded in ICAR, BCKV, and State Agricultural University Extension Knowledge.
 */

export interface ChatMessageParam {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string | null;
}

export interface FarmerContext {
  name?: string;
  state?: string;
  district?: string;
  village?: string;
  crops?: string[];
  soilType?: string;
}

export function buildSystemPrompt(language: 'en' | 'bn' | 'hi', context?: FarmerContext): string {
  const languageInstructions = {
    en: 'Reply strictly in clear, respectful, plain English suitable for an Indian farmer.',
    bn: 'Reply strictly in natural, respectful, and standard Bengali (বাংলা). Use authentic agricultural terminology commonly understood by West Bengal farmers (e.g. বিঘা, আমন, বোরো, ধসা রোগ, পাতা পোড়া, জৈব সার, ইউরিয়া, ডিএপি, ইত্যাদ).',
    hi: 'Reply strictly in natural, respectful, and standard Hindi (हिन्दी). Use authentic agricultural terminology (e.g. बीघा, कट्ठा, रबी, खरीफ, झुलसा रोग, जैविक खाद, यूरिया, इत्यादि).',
  };

  const farmerInfo = context
    ? `
FARMER PROFILE CONTEXT:
- Name: ${context.name || 'Respected Farmer'}
- Location: ${context.district ? `${context.village ? context.village + ', ' : ''}${context.district}, ` : ''}${context.state || 'West Bengal, India'}
- Primary Crops Cultivated: ${context.crops && context.crops.length > 0 ? context.crops.join(', ') : 'Not yet specified'}
- Soil Classification: ${context.soilType || 'Not specified'}
`
    : 'User is exploring as a Guest Farmer.';

  return `
You are "Krishibondhu AI" (কৃষিবন্ধু), an empathetic, highly skilled agricultural advisor and plant pathologist dedicated to empowering Indian farmers, with specialized knowledge of West Bengal and eastern India agro-climatic zones.

${farmerInfo}

YOUR AREAS OF EXPERTISE:
1. Crop Diseases & Pest Control: Symptom identification, organic/biological management first, followed by certified chemical dosages with strict safety instructions.
2. Soil Health & Fertilizers: N-P-K nutrient balancing, organic compost, vermicompost, biofertilizers (Azotobacter, Rhizobium, PSB).
3. Irrigation & Seasonal Sowing: Best sowing dates for Kharif, Rabi, and Boro/Zaid seasons, water-saving irrigation (STW, drip).
4. Bengal Regional Crops: Rice (Aman, Boro, Aus), Potato (Kufri Jyoti, Pukhraj), Jute (Tossa), Mustard, Brinjal (Muktakeshi), Chilli, Pointed Gourd (Potol), Vegetables.
5. Indian Government Agricultural Schemes: PM-KISAN, Krishak Bandhu (West Bengal), Soil Health Card (SHC), PM Fasal Bima Yojana (PMFBY), KCC (Kisan Credit Card).

CORE BEHAVIORAL RULES:
1. ${languageInstructions[language]}
2. Safety First: Whenever advising any chemical fungicide or pesticide, ALWAYS remind the farmer:
   - Wear protective face mask and gloves during spraying.
   - Strictly follow the manufacturer's dosage on the container label.
   - Do not spray in strong wind or imminent rain.
   - Observe the waiting period (PHI) before harvesting.
3. Be Honest and Humble: If a query lacks details (e.g., "my leaves have spots" without crop name or description), ask gentle follow-up questions to clarify the crop, age, and lesion pattern. Never guess wildly.
4. Keep answers practical, structured, and easy to read on mobile screens (use short paragraphs and bullet points).
`;
}

export async function generateChatReply(
  messages: ChatMessageParam[],
  language: 'en' | 'bn' | 'hi' = 'en',
  context?: FarmerContext
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('your_gemini_api_key')) {
    throw new Error('Gemini API key is not configured for the AI assistant.');
  }

  const model = process.env.AI_CHAT_MODEL || 'gemini-2.5-flash';
  const systemPrompt = buildSystemPrompt(language, context);

  // Format messages for Gemini API
  const formattedContents = messages.map((m) => {
    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
      { text: m.content },
    ];

    if (m.imageUrl && m.imageUrl.startsWith('data:')) {
      const match = m.imageUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      }
    }

    return {
      role: m.role === 'assistant' ? 'model' : 'user',
      parts,
    };
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body = {
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: formattedContents,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1500,
    },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Chat API error (${res.status}): ${await res.text()}`);
    }

    const data = await res.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!replyText) {
      throw new Error('No answer generated by assistant model.');
    }

    return replyText;
  } finally {
    clearTimeout(timeout);
  }
}
