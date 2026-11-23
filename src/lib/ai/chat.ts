/**
 * KRISHIBONDHU - Agronomy AI Assistant Brain
 * Grounded in ICAR, BCKV, and State Agricultural University Extension Knowledge.
 */

import { buildPesticideRegistryGrounding } from './pesticides';

export interface ChatMessageParam {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string | null;
}

export interface ActiveCropIssueContext {
  cropName: string;
  variety?: string | null;
  healthStatus?: string | null;
  farmName?: string | null;
  location?: string | null;
  soilType?: string | null;
  area?: string | number | null;
  areaUnit?: string | null;
  sownDate?: string | null;
  irrigation?: string | null;
}

export interface FarmerContext {
  name?: string;
  state?: string;
  district?: string;
  village?: string;
  crops?: string[];
  soilType?: string;
  activeCropIssue?: ActiveCropIssueContext | null;
}

export function buildSystemPrompt(language: 'en' | 'bn' | 'hi', context?: FarmerContext): string {
  const languageInstructions = {
    en: 'Reply strictly in clear, respectful, plain English suitable for an Indian farmer. Avoid complex academic jargon. Provide maximum 3 clear, actionable bulleted steps.',
    bn: 'Reply strictly in respectful standard Bengali (বাংলা) and colloquial rural terms (সহজ চলতি বাংলা). Avoid high-flown academic jargon. Use common rural terms (e.g. ইউরিয়া, পটাশ, নাবধসা, আগাম ধসা, মাজরা পোকা, বিঘা, চাপান সার). Structure the answer in maximum 3 clear, actionable bulleted steps so it can be effortlessly listened to via voice.',
    hi: 'Reply strictly in respectful standard Hindi (हिन्दी) and simple rural terms (सरल बोलचाल). Avoid academic jargon. Use common rural terms (e.g. यूरिया, पोटाश, झुलसा रोग, तना छेदक, बीघा, छिड़काव). Structure the answer in maximum 3 clear, actionable bulleted steps for voice readability.',
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

  const cropIssuePrompt = context?.activeCropIssue
    ? `
ACTIVE CROP INQUIRY & FIELD HEALTH ALERT UNDER ATTENTION:
- Crop: ${context.activeCropIssue.cropName} ${context.activeCropIssue.variety ? `(Variety: ${context.activeCropIssue.variety})` : ''}
- Registered Plot: ${context.activeCropIssue.farmName || 'Primary Farm'} (${context.activeCropIssue.location || 'West Bengal'})
- Land Parcel Area: ${context.activeCropIssue.area || '1'} ${context.activeCropIssue.areaUnit || 'Bigha'}
- Soil & Irrigation: ${context.activeCropIssue.soilType || 'Regional soil'}, ${context.activeCropIssue.irrigation || 'STW / Canal'}
- Current Flagged Health Status: ${context.activeCropIssue.healthStatus ? context.activeCropIssue.healthStatus.toUpperCase() : 'NEEDS ATTENTION'}
- Sowing Date: ${context.activeCropIssue.sownDate || 'Recent winter sowing'}

SPECIAL ADVISORY DIRECTIVE:
The farmer navigated to you directly from their Farm Plot management screen regarding this active alert. Immediately address this specific crop and plot in your response. Explain why this crop is flagged (for Aman Rice Swarna variety in Bengal winter, address high humidity fungal risks such as Sheath Blight, Blast, and False Smut). Provide clear, numbered steps starting with immediate organic bio-control (Pseudomonas fluorescens / Trichoderma or Neem), followed by ICAR/BCKV approved chemical emergency sprays (e.g. Hexaconazole 5% EC or Validamycin 3% L with exact doses per liter).
`
    : '';

  return `
You are "Krishibondhu AI" (কৃষিবন্ধু), an empathetic, highly skilled agricultural advisor and plant pathologist dedicated to empowering Indian farmers, with specialized knowledge of West Bengal and eastern India agro-climatic zones.

${farmerInfo}
${cropIssuePrompt}

YOUR AREAS OF EXPERTISE:
1. Crop Diseases & Pest Control: Symptom identification, organic/biological management first, followed by certified chemical dosages with strict safety instructions.
2. Soil Health & Fertilizers: N-P-K nutrient balancing, organic compost, vermicompost, biofertilizers (Azotobacter, Rhizobium, PSB).
3. Irrigation & Seasonal Sowing: Best sowing dates for Kharif, Rabi, and Boro/Zaid seasons, water-saving irrigation (STW, drip).
4. Bengal Regional Crops: Rice (Aman, Boro, Aus), Potato (Kufri Jyoti, Pukhraj), Jute (Tossa), Mustard, Brinjal (Muktakeshi), Chilli, Pointed Gourd (Potol), Vegetables.
5. Indian Government Agricultural Schemes: PM-KISAN, Krishak Bandhu (West Bengal), Soil Health Card (SHC), PM Fasal Bima Yojana (PMFBY), KCC (Kisan Credit Card).

CORE BEHAVIORAL RULES:
1. ${languageInstructions[language]}
2. CRITICAL GREETING & TONE RULE:
   - Greet the farmer by name ONLY once at the very start of a brand-new conversation.
   - For any follow-up questions, ongoing questions, or subsequent replies, NEVER repeat "Hello [Name]" or re-introduce yourself as Krishibondhu AI. Jump straight into the helpful agricultural explanation naturally and politely.
3. TEXT FORMATTING & READABILITY RULES:
   - Structure answers with clean, readable Markdown:
     * Use bold headings (e.g. **1. Organic Method**, **2. Sowing Time**) for each distinct step or remedy.
     * Put an empty line between distinct points and sections so the text never looks cramped.
     * Use clean bullet points (- or *) or numbered lists with bold keywords.
     * Avoid cluttering with unnecessary symbols or excessive asterisks.
     * Use short, direct paragraphs that are effortless to read on a mobile phone screen in the field.
4. Safety First: Whenever advising any chemical fungicide or pesticide, ALWAYS remind the farmer:
   - Wear protective face mask and gloves during spraying.
   - Strictly follow the manufacturer's dosage on the container label.
   - Do not spray in strong wind or imminent rain.
   - Observe the waiting period (PHI) before harvesting.
5. Be Honest and Humble: If a query lacks details (e.g., "my leaves have spots" without crop name or description), ask gentle follow-up questions to clarify the crop, age, and lesion pattern. Never guess wildly.

${buildPesticideRegistryGrounding()}
`;
}

export async function generateChatReply(
  messages: ChatMessageParam[],
  language: 'en' | 'bn' | 'hi' = 'en',
  context?: FarmerContext
): Promise<string> {
  const systemPrompt = buildSystemPrompt(language, context);
  const errors: string[] = [];

  // 1. Try Gemini if configured
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && !geminiKey.includes('your_gemini_api_key')) {
    try {
      return await generateGeminiChatReply(messages, systemPrompt, geminiKey);
    } catch (err: unknown) {
      errors.push(`Gemini: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // 2. Try Groq if configured
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey && !groqKey.includes('your_groq_api_key')) {
    try {
      return await generateGroqChatReply(messages, systemPrompt, groqKey);
    } catch (err: unknown) {
      errors.push(`Groq: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // 3. Try OpenRouter (Free model) if configured
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (openRouterKey && !openRouterKey.includes('your_openrouter_api_key')) {
    try {
      return await generateOpenRouterChatReply(messages, systemPrompt, openRouterKey);
    } catch (err: unknown) {
      errors.push(`OpenRouter: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.warn(`All AI chat providers failed: ${errors.join('; ')}. Returning grounded ICAR advisory.`);
  
  if (language === 'bn') {
    return `**কৃষি বিজ্ঞান কেন্দ্র (ICAR-BCKV) সম্প্রসারণ পরামর্শ:**

আপনার প্রশ্নের জন্য ধন্যবাদ। আমাদের দূরবর্তী এআই ক্লাউড পরিষেবাতে সাময়িক সংযোগ সমস্যা হচ্ছে।

**তাৎক্ষণিক মাঠপর্যায়ের পরামর্শ:**
- **রোগ ও পোকা নিয়ন্ত্রণ:** পাতার নিচের পিঠ ভালোভাবে পরীক্ষা করুন। কোনো তীব্র রাসায়নিক ব্যবহারের পূর্বে প্রাথমিক জৈব প্রতিরোধক হিসেবে নিম তেলের স্প্রে (NSKE ৫%) অথবা ট্রাইকোডার্মা ভিরিডি (৫ গ্রাম প্রতি লিটার জল) স্প্রে করতে পারেন।
- **সার প্রয়োগ:** অতিরিক্ত ইউরিয়া সার প্রয়োগ করবেন না, কারণ এতে বাতাসে আর্দ্রতা বেশি থাকলে ধসা রোগ দ্রুত ছড়িয়ে পড়ে।
- **সরাসরি বিজ্ঞানী সহায়তা:** বাংলা ভাষায় তাৎক্ষণিক সরকারি কৃষি পরামর্শের জন্য টোল-ফ্রি **কিষাণ কল সেন্টার ১৮০০-১৮০-১৫৫১** নম্বরে যোগাযোগ করুন (সকাল ৬টা থেকে রাত ১০টা পর্যন্ত)।`;
  }

  if (language === 'hi') {
    return `**कृषि विज्ञान केंद्र (ICAR-BCKV) कृषि परामर्श:**

आपके प्रश्न के लिए धन्यवाद। हमारे रिमोट एआई सर्वर में संक्षिप्त नेटवर्क समस्या आ रही है।

**तात्कालिक क्षेत्रीय सलाह:**
- **कीट व रोग प्रबंधन:** पत्तियों के निचले हिस्से की जाँच करें। किसी भी तेज रसायन के छिड़काव से पहले नीम अर्क (NSKE 5%) या ट्राइकोडर्मा विरिडी (5 ग्राम/लीटर पानी) का जैविक छिड़काव करें।
- **उर्वरक प्रबंधन:** अत्यधिक यूरिया (नाइट्रोजन) के प्रयोग से बचें, क्योंकि इससे उच्च आर्द्रता में झुलसा रोग तेजी से फैलता है।
- **सीधी कृषि वैज्ञानिक सहायता:** हिन्दी में प्रत्यक्ष सलाह के लिए राष्ट्रीय टोल-फ्री **किसान कॉल सेंटर 1800-180-1551** पर सुबह 6 से रात 10 बजे के बीच संपर्क करें।`;
  }

  return `**Krishi Vigyan Kendra (ICAR-BCKV) Agronomy Advisory:**

Thank you for reaching out. Our remote AI cloud connection is currently experiencing brief maintenance.

**Immediate Field Guidance:**
- **For Pests & Disease Management:** Inspect leaf undersides for fungal mycelium or sap-sucking insects. As a safe initial biological protectant, spray **Neem Seed Kernel Extract (NSKE 5%)** or **Trichoderma viride** (5g per litre of water).
- **Fertilizer Balancing:** Avoid excessive urea nitrogen application during humid or cloudy periods, as it accelerates foliar fungal blights.
- **Direct Agronomist Help:** For real-time extension advice from agricultural scientists, call the toll-free **National Kisan Call Centre at 1800-180-1551** (6:00 AM – 10:00 PM daily).`;
}

async function generateGeminiChatReply(
  messages: ChatMessageParam[],
  systemPrompt: string,
  apiKey: string
): Promise<string> {
  const model = process.env.AI_CHAT_MODEL || 'gemini-2.5-flash';
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
    systemInstruction: { parts: [{ text: systemPrompt }] },
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
      throw new Error(`Gemini error (${res.status}): ${await res.text()}`);
    }

    const data = await res.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!replyText) throw new Error('No answer generated by Gemini model.');
    return replyText;
  } finally {
    clearTimeout(timeout);
  }
}

async function generateGroqChatReply(
  messages: ChatMessageParam[],
  systemPrompt: string,
  apiKey: string
): Promise<string> {
  let model = process.env.GROQ_CHAT_MODEL || 'qwen/qwen3.8-27b';
  if (model.includes('llama-3.2-11b') || model.includes('llama-3.2-90b') || model.includes('decommissioned')) {
    model = 'qwen/qwen3.8-27b';
  }
  const chatMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: chatMessages,
        temperature: 0.3,
        max_tokens: 1500,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Groq error (${res.status}): ${await res.text()}`);
    }

    const data = await res.json();
    const replyText = data.choices?.[0]?.message?.content;
    if (!replyText) throw new Error('No answer returned by Groq.');
    return replyText;
  } finally {
    clearTimeout(timeout);
  }
}

async function generateOpenRouterChatReply(
  messages: ChatMessageParam[],
  systemPrompt: string,
  apiKey: string
): Promise<string> {
  const model = process.env.OPENROUTER_CHAT_MODEL || 'openrouter/free';
  const chatMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => {
      if (m.imageUrl && m.imageUrl.startsWith('data:')) {
        return {
          role: m.role,
          content: [
            { type: 'text', text: m.content },
            { type: 'image_url', image_url: { url: m.imageUrl } },
          ],
        };
      }
      return {
        role: m.role,
        content: m.content,
      };
    }),
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: chatMessages,
        temperature: 0.3,
        max_tokens: 1500,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`OpenRouter error (${res.status}): ${await res.text()}`);
    }

    const data = await res.json();
    const replyText = data.choices?.[0]?.message?.content;
    if (!replyText) throw new Error('No answer returned by OpenRouter.');
    return replyText;
  } finally {
    clearTimeout(timeout);
  }
}
