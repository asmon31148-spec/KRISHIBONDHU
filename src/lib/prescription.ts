import type { CropScanResult } from '@/lib/ai/types';

export interface FertilizerPrescriptionInput {
  cropName: string;
  bigha: number;
  katha: number;
  ureaKg: number;
  ureaBags: number;
  phosphateLabel: string;
  phosphateKg: number;
  phosphateBags: number;
  mopKg: number;
  mopBags: number;
  savingsInr: number;
  district?: string;
  language?: 'en' | 'bn' | 'hi';
}

export function formatFertilizerPrescriptionText(input: FertilizerPrescriptionInput): string {
  const areaStr =
    input.katha > 0 ? `${input.bigha} Bigha ${input.katha} Katha` : `${input.bigha} Bigha`;
  const loc = input.district ? ` (${input.district})` : '';

  if (input.language === 'bn') {
    return [
      `🌾 *KRISHIBONDHU® অনুমোদিত সার প্রেসক্রিপশন (ICAR/BCKV)*`,
      `📍 জমি: ${areaStr}${loc}`,
      `🌱 ফসল: ${input.cropName}`,
      `────────────────────`,
      `✅ *দোকানদারের জন্য সঠিক মাত্রা:*`,
      `1. ইউরিয়া (46% N): *${input.ureaKg} কেজি* (≈ ${input.ureaBags} বস্তা/50kg)`,
      `2. ${input.phosphateLabel}: *${input.phosphateKg} কেজি* (≈ ${input.phosphateBags} বস্তা/50kg)`,
      `3. পটাশ MOP (60% K₂O): *${input.mopKg} কেজি* (≈ ${input.mopBags} বস্তা/50kg)`,
      `────────────────────`,
      `💰 আনুমানিক সাশ্রয়: ₹${input.savingsInr.toLocaleString('en-IN')}`,
      `⚠️ *নির্দেশ:* শুধুমাত্র উপরে উল্লিখিত সার ও পরিমাণ দিন। অতিরিক্ত বা অপ্রয়োজনীয় ওষুধ দেবেন না।`,
      `🔗 https://krishibondhu-tan.vercel.app/fertilizer`,
    ].join('\n');
  }

  if (input.language === 'hi') {
    return [
      `🌾 *KRISHIBONDHU® प्रमाणित उर्वरक पर्ची (ICAR/BCKV)*`,
      `📍 खेत: ${areaStr}${loc}`,
      `🌱 फसल: ${input.cropName}`,
      `────────────────────`,
      `✅ *खाद विक्रेता के लिए सटीक मात्रा:*`,
      `1. यूरिया (46% N): *${input.ureaKg} किग्रा* (≈ ${input.ureaBags} बोरी/50kg)`,
      `2. ${input.phosphateLabel}: *${input.phosphateKg} किग्रा* (≈ ${input.phosphateBags} बोरी/50kg)`,
      `3. पोटाश MOP (60% K₂O): *${input.mopKg} किग्रा* (≈ ${input.mopBags} बोरी/50kg)`,
      `────────────────────`,
      `💰 अनुमानित बचत: ₹${input.savingsInr.toLocaleString('en-IN')}`,
      `⚠️ *नोट:* केवल ऊपर बताई गई सटीक खाद ही दें। अतिरिक्त अनावश्यक रसायन न जोड़ें।`,
      `🔗 https://krishibondhu-tan.vercel.app/fertilizer`,
    ].join('\n');
  }

  return [
    `🌾 *KRISHIBONDHU® CERTIFIED AGRONOMY PRESCRIPTION (ICAR/BCKV)*`,
    `📍 Plot Area: ${areaStr}${loc}`,
    `🌱 Crop: ${input.cropName}`,
    `────────────────────`,
    `✅ *Exact Quantities for Agro-Dealer:*`,
    `1. Urea (46% N): *${input.ureaKg} kg* (≈ ${input.ureaBags} bags of 50kg)`,
    `2. ${input.phosphateLabel}: *${input.phosphateKg} kg* (≈ ${input.phosphateBags} bags of 50kg)`,
    `3. MOP (60% K₂O): *${input.mopKg} kg* (≈ ${input.mopBags} bags of 50kg)`,
    `────────────────────`,
    `💰 Est. Savings vs Over-Prescription: ₹${input.savingsInr.toLocaleString('en-IN')}`,
    `⚠️ *Dealer Note:* Supply strictly the exact quantities above. Do not substitute or bundle unprescribed chemicals.`,
    `🔗 https://krishibondhu-tan.vercel.app/fertilizer`,
  ].join('\n');
}

export function formatScanPrescriptionText(
  result: CropScanResult,
  language: 'en' | 'bn' | 'hi' = 'en'
): string {
  const condition = result.is_healthy
    ? language === 'bn'
      ? 'সুস্থ ফসল (কোনো রোগ নেই)'
      : language === 'hi'
      ? 'स्वस्थ फसल (कोई रोग नहीं)'
      : 'Healthy Crop'
    : result.disease_name || 'Disease Detected';

  const rawChem: unknown = result.treatment_chemical;
  const chemArr: string[] = Array.isArray(rawChem) ? rawChem : typeof rawChem === 'string' && rawChem ? [rawChem] : [];
  const rawOrg: unknown = result.treatment_organic;
  const orgArr: string[] = Array.isArray(rawOrg) ? rawOrg : typeof rawOrg === 'string' && rawOrg ? [rawOrg] : [];

  const chemLines = chemArr.slice(0, 3).map((t, i) => `${i + 1}. ${t}`);
  const orgLines = orgArr.slice(0, 2).map((t, i) => `${i + 1}. ${t}`);

  if (language === 'bn') {
    return [
      `🩺 *KRISHIBONDHU® ফসল রোগ নির্ণয় ও প্রেসক্রিপশন*`,
      `🌱 ফসল: *${result.crop_name}*`,
      `🔍 রোগ/অবস্থা: *${condition}* (তীব্রতা: ${result.severity.toUpperCase()})`,
      `────────────────────`,
      ...(chemLines.length ? [`🧪 *অনুমোদিত রাসায়নিক চিকিৎসা:*`, ...chemLines] : []),
      ...(orgLines.length ? [`🌿 *জৈবিক প্রতিকার:*`, ...orgLines] : []),
      `────────────────────`,
      `⚠️ *সতর্কতা:* ডিলারের কাছ থেকে শুধুমাত্র সঠিক মলিকিউল ও ডোজ মিলিয়ে কিনুন।`,
      `🔗 https://krishibondhu-tan.vercel.app/scan`,
    ].join('\n');
  }

  if (language === 'hi') {
    return [
      `🩺 *KRISHIBONDHU® फसल रोग निदान पर्ची*`,
      `🌱 फसल: *${result.crop_name}*`,
      `🔍 रोग/स्थिति: *${condition}* (गंभीरता: ${result.severity.toUpperCase()})`,
      `────────────────────`,
      ...(chemLines.length ? [`🧪 *प्रमाणित रासायनिक उपचार:*`, ...chemLines] : []),
      ...(orgLines.length ? [`🌿 *जैविक उपचार:*`, ...orgLines] : []),
      `────────────────────`,
      `⚠️ *नोट:* दुकानदार से केवल ऊपर बताई गई सटीक दवा ही खरीदें।`,
      `🔗 https://krishibondhu-tan.vercel.app/scan`,
    ].join('\n');
  }

  return [
    `🩺 *KRISHIBONDHU® CERTIFIED CROP DIAGNOSIS & Rx*`,
    `🌱 Crop: *${result.crop_name}*`,
    `🔍 Diagnosis: *${condition}* (Severity: ${result.severity.toUpperCase()})`,
    `────────────────────`,
    ...(chemLines.length ? [`🧪 *Prescribed Chemical Treatment:*`, ...chemLines] : []),
    ...(orgLines.length ? [`🌿 *Organic / Bio-Control:*`, ...orgLines] : []),
    `────────────────────`,
    `⚠️ *Dealer Note:* Show this slip at the agro-shop to buy only exact verified active ingredients.`,
    `🔗 https://krishibondhu-tan.vercel.app/scan`,
  ].join('\n');
}

export function getWhatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
