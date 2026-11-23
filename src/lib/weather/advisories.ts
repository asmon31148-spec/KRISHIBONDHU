/**
 * KRISHIBONDHU - Deterministic Agronomic Weather Rule Engine
 * Converts raw meteorological metrics from Open-Meteo into immediate farm actions.
 */

import { WeatherData } from './open-meteo';

export interface WeatherDirective {
  id: string;
  type: 'spray' | 'irrigation' | 'late_blight' | 'heat_stress';
  status: 'optimal' | 'warning' | 'danger';
  title_en: string;
  title_bn: string;
  title_hi: string;
  message_en: string;
  message_bn: string;
  message_hi: string;
  action_en: string;
  action_bn: string;
  action_hi: string;
  is_active: boolean;
}

export function evaluateWeatherDirectives(weather: WeatherData): WeatherDirective[] {
  const directives: WeatherDirective[] = [];

  const windSpeed = weather.current.windSpeed; // km/h
  const humidity = weather.current.relativeHumidity; // %
  const temp = weather.current.temperature; // Celsius
  const rainNext6hProb = weather.daily[0]?.precipitationProbability || 0;

  // 1. Calculate 72-hour rainfall sum (next 3 days)
  const rainNext72hSum = weather.daily.slice(0, 3).reduce((acc, d) => acc + (d.precipitationSum || 0), 0);

  // --------------------------------------------------------------------------
  // Rule 1: Spray Window
  // IF Wind Velocity < 15 km/h AND Rain in next 6 hours < 10% => Safe to Spray.
  // ELSE => Do not spray.
  // --------------------------------------------------------------------------
  const isSpraySafe = windSpeed < 15 && rainNext6hProb < 10;
  if (isSpraySafe) {
    directives.push({
      id: 'spray_window',
      type: 'spray',
      status: 'optimal',
      title_en: 'Safe Spray Window Active',
      title_bn: 'স্প্রে করার উপযুক্ত সময় (অনুকূল আবহাওয়া)',
      title_hi: 'स्प्रे करने का अनुकूल समय',
      message_en: `Wind speed is calm at ${windSpeed} km/h with low rain probability (${rainNext6hProb}%). Chemical/organic pesticide spray will adhere properly without drift.`,
      message_bn: `বাতাসের গতি শান্ত (${windSpeed} কিমি/ঘণ্টা) এবং বৃষ্টির সম্ভাবনা কম (${rainNext6hProb}%)। কীটনাশক বা ছত্রাকনাশক স্প্রে করলে ওষুধের অপচয় হবে না।`,
      message_hi: `हवा की गति शांत (${windSpeed} किमी/घंटा) और बारिश की संभावना कम (${rainNext6hProb}%) है। कीटनाशक स्प्रे करने के लिए यह सबसे सही समय है।`,
      action_en: 'Spray between 7 AM – 10 AM or 3 PM – 5 PM.',
      action_bn: 'সকাল ৭-১০টা অথবা বিকেল ৩-৫টার মধ্যে স্প্রে সম্পন্ন করুন।',
      action_hi: 'सुबह 7-10 बजे या शाम 3-5 बजे के बीच छिड़काव करें।',
      is_active: true,
    });
  } else {
    directives.push({
      id: 'spray_window',
      type: 'spray',
      status: 'danger',
      title_en: 'Do Not Spray Pesticides Today',
      title_bn: 'স্প্রে করবেন না — বৃষ্টি/বাতাসে ওষুধ অপচয় হবে',
      title_hi: 'आज स्प्रे न करें — बारिश/हवा में दवा बर्बाद होगी',
      message_en: `Current wind velocity (${windSpeed} km/h) or precipitation probability (${rainNext6hProb}%) will wash away chemicals and cause drift.`,
      message_bn: `বাতাসের গতি (${windSpeed} কিমি/ঘণ্টা) বেশি অথবা বৃষ্টির সম্ভাবনা (${rainNext6hProb}%) রয়েছে। স্প্রে করলে ওষুধ ধুয়ে যাবে এবং অপচয় হবে।`,
      message_hi: `हवा की तेज गति (${windSpeed} किमी/घंटा) या बारिश की संभावना (${rainNext6hProb}%) के कारण दवा बह जाएगी और नुकसान होगा।`,
      action_en: 'Postpone chemical application until wind drops below 15 km/h.',
      action_bn: 'বাতাসের গতি কমে শান্ত না হওয়া পর্যন্ত স্প্রে স্থগিত রাখুন।',
      action_hi: 'हवा शांत होने तक छिड़काव टाल दें।',
      is_active: true,
    });
  }

  // --------------------------------------------------------------------------
  // Rule 2: Irrigation Advisory
  // IF 72-hour precipitation forecast >= 25 mm => Hold irrigation.
  // --------------------------------------------------------------------------
  if (rainNext72hSum >= 25) {
    directives.push({
      id: 'irrigation_directive',
      type: 'irrigation',
      status: 'warning',
      title_en: 'Hold Irrigation — Rain Expected',
      title_bn: 'সেচ বন্ধ রাখুন — বৃষ্টির চরম সম্ভাবনা রয়েছে',
      title_hi: 'सिंचाई रोकें — अच्छी बारिश की संभावना है',
      message_en: `72-hour precipitation forecast indicates ${Math.round(rainNext72hSum)} mm rainfall. Irrigating now will cause costly diesel wastage and root waterlogging.`,
      message_bn: `আগামী ৩ দিনে প্রায় ${Math.round(rainNext72hSum)} মিমি বৃষ্টির পূর্বাভাস। এখনই সেচ দিলে পাম্পের ডিজেল/বিদ্যুৎ অপচয় এবং জমিতে জল জমে ক্ষতি হতে পারে।`,
      message_hi: `अगले 72 घंटों में लगभग ${Math.round(rainNext72hSum)} मिमी बारिश का अनुमान है। अभी सिंचाई करने से डीजल बर्बाद होगा और जलभराव हो सकता है।`,
      action_en: 'Suspend motor pumps and clear field drainage bunds.',
      action_bn: 'সেচ পাম্প চালানো বন্ধ রাখুন এবং নিকাশি নালা পরিষ্কার রাখুন।',
      action_hi: 'सिंचाई पंप बंद रखें और खेतों से जल निकासी की व्यवस्था करें।',
      is_active: true,
    });
  } else {
    directives.push({
      id: 'irrigation_directive',
      type: 'irrigation',
      status: 'optimal',
      title_en: 'Normal Irrigation Required',
      title_bn: 'স্বাভাবিক সেচ বজায় রাখুন',
      title_hi: 'सामान्य सिंचाई जारी रखें',
      message_en: `Expected rainfall over the next 72 hours is only ${Math.round(rainNext72hSum)} mm. Maintain standard soil moisture for standing crops.`,
      message_bn: `আগামী ৩ দিনে ভারী বৃষ্টির সম্ভাবনা নেই (মাত্র ${Math.round(rainNext72hSum)} মিমি)। ফসলভেদে জমিতে পরিমিত রস বজায় রাখুন।`,
      message_hi: `अगले 3 दिनों में भारी बारिश नहीं है। फसलों के लिए आवश्यक नमी बनाए रखें।`,
      action_en: 'Apply light irrigation during morning hours.',
      action_bn: 'সকালের দিকে হালকা সেচ প্রয়োগ করুন।',
      action_hi: 'सुबह के समय हल्की सिंचाई करें।',
      is_active: true,
    });
  }

  // --------------------------------------------------------------------------
  // Rule 3: Potato Late Blight / Rice Sheath Blight Fungal Threat
  // IF Humidity >= 85% AND Temperature between 14°C and 23°C => High Late Blight risk.
  // --------------------------------------------------------------------------
  const isLateBlightCond = humidity >= 80 && temp >= 13 && temp <= 25;
  if (isLateBlightCond) {
    directives.push({
      id: 'late_blight_alert',
      type: 'late_blight',
      status: 'danger',
      title_en: 'Late Blight & Fungal Spore Alert',
      title_bn: 'আলুর নাবধসা রোগের চরম ঝুঁকি! আগাম ম্যানকোজেব স্প্রে করুন',
      title_hi: 'आलू में पिछेती झुलसा का भारी खतरा! तुरंत मैनकोजेब स्प्रे करें',
      message_en: `Micro-climate conditions (Humidity ${humidity}%, Temp ${Math.round(temp)}°C) trigger rapid Phytophthora infestans (Late Blight) sporulation.`,
      message_bn: `বাতাসে উচ্চ আর্দ্রতা (${humidity}%) ও অনুকুল তাপমাত্রা (${Math.round(temp)}°সে) থাকায় আলুর নাবী ধসা ও ধানের খোল পোড়া রোগের জীবাণু অতি দ্রুত ছড়ায়।`,
      message_hi: `हवा में अत्यधिक नमी (${humidity}%) और तापमान (${Math.round(temp)}°C) झुलसा रोग के कवक को तेजी से फैलाते हैं।`,
      action_en: 'Apply prophylactic Mancozeb 75% WP (2.5g/L) or Copper Oxychloride immediately.',
      action_bn: 'রোগের লক্ষণ দেখার পূর্বেই ম্যানকোজেব ৭৫% ডব্লুপি (২.৫ গ্রাম প্রতি লিটার জল) স্প্রে করুন।',
      action_hi: 'लक्षण दिखने से पहले ही मैनकोजेब (2.5 ग्राम प्रति लीटर) का सुरक्षात्मक छिड़काव करें।',
      is_active: true,
    });
  }

  return directives;
}
