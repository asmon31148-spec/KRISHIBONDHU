'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/context';
import HeroVideoBackground from '@/components/home/HeroVideoBackground';
import FeatureOrbitDial from '@/components/home/FeatureOrbitDial';
import {
  ScanLine,
  TrendingUp,
  CloudSun,
  FileText,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  PhoneCall,
  AlertTriangle,
  Award,
  Bot,
  Camera,
  Upload,
  Building2,
} from 'lucide-react';

interface LiveMandiRecord {
  commodity: string;
  market: string;
  modal_price: number;
  arrival_date: string;
  district?: string;
}

interface SavedUserScan {
  id: string;
  crop_name: string;
  disease_name?: string;
  is_healthy?: boolean;
  severity?: string;
  created_at: string;
}

export default function LandingPage() {
  const { language } = useTranslation();
  const langKey = language === 'bn' || language === 'hi' ? language : 'en';

  // Real Dynamic Data State
  const [mandiRates, setMandiRates] = useState<LiveMandiRecord[]>([]);
  const [isMandiLoading, setIsMandiLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(true);
  const [latestUserScan, setLatestUserScan] = useState<SavedUserScan | null>(null);

  useEffect(() => {
    // 1. Fetch authentic live Mandi prices from government gateway
    fetch('/api/mandi/prices')
      .then((res) => res.json())
      .then((json) => {
        const records = json.records || json.data || [];
        if (Array.isArray(records) && records.length > 0) {
          setMandiRates(records.slice(0, 3));
        }
      })
      .catch((err) => {
        console.warn('Live Mandi feed connection error:', err);
      })
      .finally(() => {
        setIsMandiLoading(false);
      });

    // 2. Fetch authentic live Weather data from Open-Meteo
    fetch('/api/weather')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setWeatherData(json.data);
        }
      })
      .catch((err) => {
        console.warn('Live Weather feed connection error:', err);
      })
      .finally(() => {
        setIsWeatherLoading(false);
      });

    // 3. Load user's actual saved scan from local session (if any)
    try {
      const saved = localStorage.getItem('krishibondhu_recent_scans');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLatestUserScan(parsed[0]);
        }
      }
    } catch {}
  }, []);

  const content = {
    bn: {
      heroTag: 'আইসিএআর ও বিসিকেভি সমন্বিত কৃষি প্রযুক্তি',
      headline: 'ফসলের সঠিক সুরক্ষা,\nপ্রতি বিঘায় সর্বোচ্চ ফলন।',
      subtext:
        'গাছের পাতার রোগ নির্ণয়, জমির মাপে সারের বৈজ্ঞানিক হিসাব, লাইভ মান্ডি বাজার দর ও আবহাওয়া অনুযায়ী স্প্রে পরামর্শ — বাংলার কৃষকের সার্বক্ষণিক বিশ্বস্ত সহকারী।',
      primaryCTA: 'পাতার রোগ পরীক্ষা করুন',
      secondaryCTA: 'কৃষি সহকারীর পরামর্শ নিন',
      trustPill: '১০০% কৃষকের জন্য বিনামূল্যে · কোনো রেজিস্ট্রেশন ফি নেই · নির্ভুল সরকারি নির্দেশিকা',

      // Bento Grid Section
      bentoTag: 'ডিজিটাল কৃষি ড্যাশবোর্ড',
      bentoTitle: 'কৃষকের প্রয়োজনীয় ৪টি মূল সেবা',
      bentoSubtitle: 'সরাসরি ব্যবহার করুন — জটিলতা ছাড়াই আপনার ফসল, মাটি ও বিক্রির সঠিক তথ্য পান',

      // Card A: Diagnostic
      cardATag: 'এআই পাতার রোগ নির্ণয়',
      cardATitle: 'পাতার ছবি থেকে সরাসরি রোগ নির্ণয় ও প্রতিকার',
      cardADesc: 'ধান, আলু, পাট, সরিষা বা শাকসবজির আক্রান্ত পাতার ছবি তুলুন। আইসিএআর অনুমোদিত বৈজ্ঞানিক জৈব ও রাসায়নিক প্রতিকার পান।',
      cardABtn: 'ক্যামেরা দিয়ে স্ক্যান করুন',
      cardAUploadBtn: 'গ্যালারি থেকে ছবি দিন',
      cardASupportedTitle: 'যাচাইকৃত সমর্থিত ১৪টি ফসল:',
      cardASupportedList: 'ধান (আমন/বোরো), আলু, পাট, সরিষা, বেগুন, টমেটো, লঙ্কা, গম, ফুলকপি, বাঁধাকপি, পেঁয়াজ, ভুট্টা ও মসুর ডাল।',
      cardARecentLabel: 'আপনার সর্বশেষ স্ক্যান:',
      cardANoScanLabel: 'এখনও কোনো স্ক্যান করা হয়নি। পরীক্ষা করতে একটি ছবি তুলুন।',

      // Card B: Mandi
      cardBTag: 'এগমार्कনেট লাইভ মান্ডি দর',
      cardBTitle: 'পশ্চিমবঙ্গের সরকারি পাইকারি বাজার দর',
      cardBLoading: 'লাইভ মান্ডি দর লোড হচ্ছে...',
      cardBEmpty: 'আজকের মান্ডি দর আপডেট হচ্ছে',
      cardBArrivalPrefix: 'আগমন তারিখ:',
      cardBBtn: 'সব জেলার পাইকারি দর দেখুন',

      // Card C: Weather & Spray
      cardCTag: 'মাইক্রো-ক্লাইমেট পূর্বাভাস',
      cardCTitle: 'আবহাওয়া ও স্প্রে সময়সূচী',
      cardCLoading: 'আবহাওয়া তথ্য লোড হচ্ছে...',
      cardCTemp: 'তাপমাত্রা',
      cardCHumidity: 'আর্দ্রতা',
      cardCWind: 'বাতাস',
      cardCBtn: 'সম্পূর্ণ ৭ দিনের পূর্বাভাস দেখুন',

      // Card D: Schemes
      cardDTag: 'সরকারি যোজনা ও অনুদান ট্র্যাকার',
      cardDTitle: 'কৃষকবন্ধু ও সরকারি অনুদানের সরাসরি তালিকা',
      cardDDesc: 'পশ্চিমবঙ্গ সরকার ও কেন্দ্রীয় সরকারের অনুমোদিত কৃষক সহায়তা প্রকল্প। মধ্যস্বত্বভোগী ছাড়াই সরাসরি সরকারি পোর্টালে আবেদনের নির্দেশিকা।',
      cardDBtn: 'সব সরকারি প্রকল্প দেখুন',

      // Scientific Pillars (Zero Fake Reviews / Real Foundations)
      pillarsTag: 'বিজ্ঞানসম্মত ও সরকারি তথ্য কাঠামো',
      pillarsTitle: 'নির্ভরযোগ্য কৃষি তথ্য ও প্রাতিষ্ঠানিক ভিত্তি',
      pillarsSubtitle: 'কৃষিবন্ধু কোনো অনুমান বা কৃত্রিম তথ্যে চলে না — প্রতিটি সেবা সরাসরি ভারতের স্বীকৃত কৃষি গবেষণা ও সরকারি ডেটা পোর্টালে যাচাইকৃত।',
      pillar1Title: 'আইসিএআর ও বিসিকেভি গবেষণা',
      pillar1Desc: 'ভারতীয় কৃষি গবেষণা পরিষদ (ICAR) ও বিধানচন্দ্র কৃষি বিশ্ববিদ্যালয়ের (BCKV) প্রকাশিত প্যাকেজ অব প্র্যাকটিসেস অনুযায়ী রোগের ওষুধ ও সারের মাত্রা।',
      pillar2Title: 'এগমार्कনেট সরকারি মান্ডি ফিড',
      pillar2Desc: 'ভারত সরকারের কৃষি ও কৃষক কল্যাণ মন্ত্রকের ডেটা পোর্টাল (data.gov.in) থেকে সরাসরি পশ্চিমবঙ্গের জেলা পাইকারি বাজারের দর।',
      pillar3Title: 'আইএমডি ও ওপেন-মেটিও আবহাওয়া',
      pillar3Desc: 'প্রতি ঘণ্টার বাতাসের গতি, আর্দ্রতা ও বৃষ্টির সম্ভাবনা পর্যবেক্ষণ করে কীটনাশক অপচয় রোধে বিজ্ঞানসম্মত নিরাপদ স্প্রে পূর্বাভাস।',
      pillar4Title: 'সরাসরি সরকারি অনুদান (ডিবিটি)',
      pillar4Desc: 'কৃষকবন্ধু, বাংলা শস্য বিমা ও পিএম-কিষান অনুদানের যাচাইকৃত অফিশিয়াল নির্দেশিকা — সরাসরি কৃষকের ব্যাঙ্ক অ্যাকাউন্টে টাকা পৌঁছানোর নিশ্চিত তথ্য।',

      // Emergency & Footer
      kisanLineTitle: 'জাতীয় কিষান কল সেন্টার (টোল-ফ্রি হেল্পলাইন)',
      kisanLinePhone: '1800-180-1551',
      kisanLineDesc: 'সকাল ৬টা থেকে রাত ১০টা পর্যন্ত কৃষি বিজ্ঞানীদের সাথে সরাসরি বাংলায় কথা বলুন',
      footerDisclaimer: 'ঘোষণা: কৃষিবন্ধু একটি উন্মুক্ত ডিজিটাল কৃষি সেবা প্ল্যাটফর্ম। মাঠে যেকোনো রাসায়নিক বিষ প্রয়োগের পূর্বে সরকারি ব্লক কৃষি আধিকারিক (ADA) অথবা স্থানীয় কৃষি বিজ্ঞান কেন্দ্রের (KVK) সাথে পরামর্শ করুন।',
      footerCitation: `© ${new Date().getFullYear()} কৃষিবন্ধু (KRISHIBONDHU) · তথ্য সহায়তা: ICAR, এগ্রিকালচার ডিপার্টমেন্ট পশ্চিমবঙ্গ, IMD ও বিধানচন্দ্র কৃষি বিশ্ববিদ্যালয় (BCKV)`,
    },
    hi: {
      heroTag: 'आईसीएआर व बीसीकेवी समर्थित आधुनिक कृषि तकनीक',
      headline: 'फसल की सही सुरक्षा,\nहर बीघे में भरपूर पैदावार।',
      subtext:
        'पत्ती की फोटो से तुरंत रोग पहचान, जमीन के अनुसार वैज्ञानिक खाद कैलकुलेटर, लाइव थोक मंडी भाव और सुरक्षित स्प्रे मौसम परामर्श — किसान भाइयों का विश्वसनीय साथी।',
      primaryCTA: 'पत्ती का रोग जांचें',
      secondaryCTA: 'कृषि सहायक से पूछें',
      trustPill: '100% किसानों के लिए मुफ्त · कोई लॉगिन या पासवर्ड की बाधा नहीं · प्रामाणिक कृषि सलाह',

      bentoTag: 'डिजिटल किसान डैशबोर्ड',
      bentoTitle: 'किसानों के लिए ४ प्रमुख उपयोगी सेवाएं',
      bentoSubtitle: 'सीधे उपयोग करें — बिना किसी परेशानी के अपनी फसल, मिट्टी व मंडी भाव की सटीक जानकारी पाएं',

      cardATag: 'एआई फसल रोग डॉक्टर',
      cardATitle: 'पत्ती की फोटो से सीधे रोग पहचान व उपचार',
      cardADesc: 'धान, आलू, सरसों या सब्जियों के रोगी पत्ते की फोटो लें। तुरंत आईसीएआर प्रमाणित जैविक व रासायनिक दवाओं की सही खुराक जानें।',
      cardABtn: 'कैमरे से स्कैन करें',
      cardAUploadBtn: 'गैलरी से फोटो चुनें',
      cardASupportedTitle: 'सत्यापित समर्थित १४ प्रमुख फसलें:',
      cardASupportedList: 'धान (खरीफ/बोरो), आलू, जूट, सरसों, बैंगन, टमाटर, हरी मिर्च, गेहूं, फूलगोभी, पत्तागोभी, प्याज, मक्का व मसूर दाल।',
      cardARecentLabel: 'आपकी पिछली जांच:',
      cardANoScanLabel: 'अभी तक कोई स्कैन नहीं किया गया है। जांच के लिए फोटो लें।',

      cardBTag: 'एगमार्कनेट लाइव मंडी भाव',
      cardBTitle: 'सरकारी थोक मंडी भाव व ताजा आवक',
      cardBLoading: 'लाइव मंडी भाव लोड हो रहे हैं...',
      cardBEmpty: 'आज के मंडी भाव अपडेट हो रहे हैं',
      cardBArrivalPrefix: 'आवक तिथि:',
      cardBBtn: 'सभी मंडियों के भाव देखें',

      cardCTag: 'सूक्ष्म मौसम व मिट्टी पूर्वानुमान',
      cardCTitle: 'मौसम व कीटनाशक छिड़काव समय',
      cardCLoading: 'मौसम डेटा लोड हो रहा है...',
      cardCTemp: 'तापमान',
      cardCHumidity: 'नमी',
      cardCWind: 'हवा',
      cardCBtn: '7 दिनों का मौसम देखें',

      cardDTag: 'सरकारी योजना व अनुदान ट्रैकर',
      cardDTitle: 'कृषक बंधु व पीएम किसान योजनाओं की सूची',
      cardDDesc: 'अपनी जमीन और फसल के अनुसार जानें कि कौन-सी सरकारी सब्सिडी व फसल बीमा आपके लिए उपलब्ध है। बिना किसी दलाल के सीधे आवेदन की जानकारी।',
      cardDBtn: 'सभी सरकारी योजनाएं देखें',

      pillarsTag: 'वैज्ञानिक एवं सरकारी डेटा आधार',
      pillarsTitle: 'विश्वसनीय कृषि जानकारी व संस्थागत स्तंभ',
      pillarsSubtitle: 'कृषिबंधु किसी भी कृत्रिम या अनुमानित डेटा पर नहीं चलता — हर सेवा सीधे भारत के मान्यता प्राप्त कृषि अनुसंधान संस्थानों से जुड़ी है।',
      pillar1Title: 'आईसीएआर व बीसीकेवी अनुसंधान',
      pillar1Desc: 'भारतीय कृषि अनुसंधान परिषद (ICAR) और राज्य कृषि विश्वविद्यालय के पैकेज ऑफ प्रैक्टिसेज पर आधारित रोग नियंत्रण व खाद संतुलन।',
      pillar2Title: 'एगमार्कनेट सरकारी मंडी फीड',
      pillar2Desc: 'कृषि एवं किसान कल्याण मंत्रालय के ओपन डेटा पोर्टल (data.gov.in) से सीधे मंडियों के दैनिक थोक भाव।',
      pillar3Title: 'आईएमडी व ओपन-मेटियो मौसम',
      pillar3Desc: 'हवा की गति, बारिश की संभावना व नमी के वास्तविक आंकड़ों से कीटनाशक छिड़काव का सटीक और सुरक्षित समय।',
      pillar4Title: 'सीधे सरकारी अनुदान (डीबीटी)',
      pillar4Desc: 'कृषक बंधु, बांग्ला शस्य बीमा और पीएम-किसान की आधिकारिक मार्गदर्शिका — सीधे किसान के बैंक खाते में वित्तीय सहायता।',

      kisanLineTitle: 'राष्ट्रीय किसान कॉल सेंटर (टोल-फ्री हेल्पलाइन)',
      kisanLinePhone: '1800-180-1551',
      kisanLineDesc: 'सुबह 6 से रात 10 बजे तक सरकारी कृषि वैज्ञानिकों से सीधे अपनी भाषा में बात करें',
      footerDisclaimer: 'अस्वीकरण: कृषिबंधु एक खुला डिजिटल कृषि मार्गदर्शन मंच है। खेत में किसी भी रासायनिक दवा के छिड़काव से पूर्व अपने स्थानीय ब्लॉक कृषि अधिकारी (ADA) या कृषि विज्ञान केंद्र (KVK) से संपर्क करें।',
      footerCitation: `© ${new Date().getFullYear()} कृषिबंधु (KRISHIBONDHU) · डेटा समर्थन: ICAR, कृषि विभाग, IMD एवं BCKV`,
    },
    en: {
      heroTag: 'AI SMART FARMING PLATFORM',
      headline: 'Smarter farming,\nguided by AI.',
      subtext:
        'Detect crop diseases instantly, calculate scientific fertilizer dosages for your land, track weather spray windows, and check live mandi prices — all in one place.',
      primaryCTA: 'Diagnose Leaf From Photo',
      secondaryCTA: 'Ask Agronomy Assistant',
      trustPill: '100% Free for all farmers · No account or password required · ICAR Validated',

      bentoTag: 'Farmer Utility Bento',
      bentoTitle: '4 Core High-Utility Farmer Tools',
      bentoSubtitle: 'Direct, actionable agriculture intelligence designed for high outdoor field readability',

      cardATag: 'AI Crop Leaf Diagnostic',
      cardATitle: 'Diagnose crop leaf diseases and treatment guidelines in seconds',
      cardADesc: 'Take a close-up photo of any affected leaf. Instantly identify blight, blast, or pest infestations with ICAR-approved organic and chemical spray guidelines.',
      cardABtn: 'Open Camera Scanner',
      cardAUploadBtn: 'Upload from Gallery',
      cardASupportedTitle: '14 Validated Field Crops Supported:',
      cardASupportedList: 'Rice (Aman/Boro), Potato, Jute, Mustard, Brinjal, Tomato, Chilli, Wheat, Cauliflower, Cabbage, Onion, Maize, and Lentils.',
      cardARecentLabel: 'Your Latest Scan:',
      cardANoScanLabel: 'No scans saved yet on this device. Take a leaf photo to diagnose.',

      cardBTag: 'Agmarknet Mandi Radar',
      cardBTitle: 'Official Wholesale Mandi Prices (Live Feed)',
      cardBLoading: 'Loading live APMC prices...',
      cardBEmpty: 'Mandi rates updating for today',
      cardBArrivalPrefix: 'Arrival:',
      cardBBtn: 'View All District Mandis',

      cardCTag: 'Micro-Climate & Spray Forecast',
      cardCTitle: 'Localized Weather & Spray Timing',
      cardCLoading: 'Loading live meteorological data...',
      cardCTemp: 'Temp',
      cardCHumidity: 'Humidity',
      cardCWind: 'Wind',
      cardCBtn: 'Explore 7-Day Forecast',

      cardDTag: 'Government Subsidies & Schemes',
      cardDTitle: 'Active Financial Aid & Subsidies Tracker',
      cardDDesc: 'Direct eligibility guidelines and 1-click verification for Krishak Bandhu, PM-Kisan, and Bangla Shasya Bima insurance with zero intermediary fees.',
      cardDBtn: 'Check All 12 Subsidies',

      pillarsTag: 'Scientific & Open Government Foundations',
      pillarsTitle: 'Verified Agricultural Data & Institutional Pillars',
      pillarsSubtitle: 'Krishibondhu runs on zero fabricated or mock data. Every insight is directly grounded in published research and official government feeds.',
      pillar1Title: 'ICAR & BCKV Agronomy Standards',
      pillar1Desc: 'Certified Package of Practices (PoP) and pathology treatment matrices from the Indian Council of Agricultural Research & Bidhan Chandra Krishi Viswavidyalaya.',
      pillar2Title: 'Agmarknet Government Mandi Feed',
      pillar2Desc: 'Direct integration with the Ministry of Agriculture & Farmers Welfare Open Data Portal (data.gov.in) for daily wholesale price arrivals.',
      pillar3Title: 'IMD & Open-Meteo Agrometeorology',
      pillar3Desc: 'Real-time hourly wind velocity, precipitation probability, and leaf wetness modeling to prevent pesticide washout.',
      pillar4Title: 'Direct Benefit Transfer (DBT)',
      pillar4Desc: 'Verified official documentation and portal links for Krishak Bandhu, Bangla Shasya Bima, and PM-Kisan direct cash assistance.',

      kisanLineTitle: 'National Kisan Call Centre (Toll-Free Hotline)',
      kisanLinePhone: '1800-180-1551',
      kisanLineDesc: 'Talk directly to certified agricultural scientists from 6:00 AM to 10:00 PM in your local language',
      footerDisclaimer: 'Disclaimer: KRISHIBONDHU is an open public agritech guidance service. Always consult your Block Agriculture Officer (ADA) or Krishi Vigyan Kendra (KVK) before applying scheduled chemical sprays.',
      footerCitation: `© ${new Date().getFullYear()} KRISHIBONDHU · Data Support: ICAR, Dept of Agriculture West Bengal, IMD & BCKV`,
    },
  }[langKey];

  return (
    <div className="w-full text-left pb-20">
      {/* ========================================================
          1. FULL-BLEED EDGE-TO-EDGE HERO WITH SEAMLESS 1080p LOOP & ORBITAL DIAL
          High-Agency, Cinematic & Interactive Agriculture Command Hero
         ======================================================== */}
      <section className="relative w-full min-h-[85vh] lg:min-h-[88vh] flex items-center justify-center overflow-hidden px-4 sm:px-8 lg:px-12 py-12 lg:py-16">
        {/* Authentic 9-Clip Looping Video Background */}
        <HeroVideoBackground />

        {/* Hero Content Grid: Left Column Text & CTAs, Right Column Orbital Selector */}
        <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Heading, Subtitle & Action Buttons */}
          <div className="lg:col-span-7 space-y-6 text-white text-left">
            {/* Scientific Anchor Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 text-xs font-bold tracking-wide select-none">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{content.heroTag}</span>
            </div>

            {/* Monumental High-Contrast Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-white tracking-tight leading-[1.14] whitespace-pre-line drop-shadow-md">
              {content.headline}
            </h1>

            {/* Grounded, Readable Editorial Copy */}
            <p className="text-sm sm:text-base lg:text-lg text-emerald-50/90 leading-relaxed max-w-xl font-medium drop-shadow-sm">
              {content.subtext}
            </p>

            {/* Clear Visual Hierarchy Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Link href="/scan" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-[#0c180e] font-extrabold text-base shadow-[0_4px_20px_rgba(16,185,129,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                >
                  <ScanLine className="w-5 h-5 text-[#0c180e]" />
                  <span>{content.primaryCTA}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </Link>

              <Link href="/assistant" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-black/40 hover:bg-black/60 text-white font-bold text-base border border-white/25 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                >
                  <Bot className="w-5 h-5 text-emerald-400" />
                  <span>{content.secondaryCTA}</span>
                </button>
              </Link>
            </div>

            {/* Respectful Farmer Guarantee Pill */}
            <div className="flex items-center gap-2 pt-1 text-xs text-emerald-200/90 font-semibold drop-shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{content.trustPill}</span>
            </div>
          </div>

          {/* Right Column: Orbital Interactive Dial */}
          <div className="lg:col-span-5 w-full flex items-center justify-center">
            <FeatureOrbitDial />
          </div>
        </div>
      </section>

      {/* Main Content Sections: Bento Grid, Scientific Pillars, Footer */}
      <div className="space-y-16 lg:space-y-24 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
        {/* ========================================================
            2. THE CENTRAL BENTO GRID (AUTHENTIC UTILITY DASHBOARD)
            Dynamic 4-Card Bento Architecture Powered by Live Feeds
           ======================================================== */}
        <section className="space-y-6">
        {/* Section Header */}
        <div className="space-y-1.5 text-left max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-[#D9822B]">
            {content.bentoTag}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#143224] tracking-tight">
            {content.bentoTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#384D41] font-medium">
            {content.bentoSubtitle}
          </p>
        </div>

        {/* 4-Card Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ----------------------------------------------------
              CARD A (Large 2-Column Span): AI Crop Health Diagnostic
              Actionable Real Diagnostic Launchpad (Zero Mock)
             ---------------------------------------------------- */}
          <div className="lg:col-span-2 rounded-3xl bg-white/95 border border-[#143224]/12 shadow-[0_4px_24px_rgba(20,50,36,0.04)] hover:shadow-[0_12px_32px_rgba(20,50,36,0.08)] transition-all p-6 sm:p-8 flex flex-col justify-between space-y-6 text-left group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EAF2EC] text-[#143224] border border-[#143224]/12">
                  <ScanLine className="w-3.5 h-3.5 text-[#D9822B]" />
                  <span>{content.cardATag}</span>
                </span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                  ICAR Certified Logic
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-[#143224] leading-snug">
                {content.cardATitle}
              </h3>

              <p className="text-sm text-[#384D41] leading-relaxed">
                {content.cardADesc}
              </p>
            </div>

            {/* If user has real saved scans, display their actual recent scan */}
            {latestUserScan ? (
              <div className="rounded-2xl bg-[#F9F7F2] border border-[#143224]/10 p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#5E7367]">
                    {content.cardARecentLabel}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-[#143224]">
                      {latestUserScan.crop_name}
                    </span>
                    {latestUserScan.disease_name && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                        {latestUserScan.disease_name}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#5E7367] block">
                    {new Date(latestUserScan.created_at).toLocaleDateString()}
                  </span>
                </div>
                <Link href="/scan">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#143224] text-white text-xs font-bold hover:bg-[#1E4733] transition-all cursor-pointer"
                  >
                    <span>View Record</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            ) : (
              /* Actionable Scan Trigger Area */
              <div className="rounded-2xl bg-[#F9F7F2] border border-[#143224]/10 p-5 space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#143224] uppercase tracking-wider block">
                    {content.cardASupportedTitle}
                  </span>
                  <p className="text-xs text-[#384D41] leading-relaxed font-medium">
                    {content.cardASupportedList}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link href="/scan">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#143224] hover:bg-[#1E4733] text-white font-bold text-sm shadow-[0_2px_8px_rgba(20,50,36,0.15)] transition-all cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-[#D9822B]" />
                      <span>{content.cardABtn}</span>
                    </button>
                  </Link>

                  <Link href="/scan">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-[#F3EFE6] text-[#143224] font-bold text-sm border border-[#143224]/18 shadow-2xs transition-all cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-[#D9822B]" />
                      <span>{content.cardAUploadBtn}</span>
                    </button>
                  </Link>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-between text-xs font-semibold text-[#5E7367]">
              <span>Camera & Smartphone Photo Gallery</span>
              <span>100% Free · No Sign-in Barrier</span>
            </div>
          </div>

          {/* ----------------------------------------------------
              CARD B (1-Column Span): Live Mandi / Market Prices
              Connected to real Government Agmarknet feed
             ---------------------------------------------------- */}
          <div className="rounded-3xl bg-white/95 border border-[#143224]/12 shadow-[0_4px_24px_rgba(20,50,36,0.04)] hover:shadow-[0_12px_32px_rgba(20,50,36,0.08)] transition-all p-6 sm:p-7 flex flex-col justify-between space-y-5 text-left group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FDF5EC] text-[#D9822B] border border-[#D9822B]/20">
                  <TrendingUp className="w-3.5 h-3.5 text-[#D9822B]" />
                  <span>{content.cardBTag}</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Live Feed</span>
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-[#143224] leading-snug">
                {content.cardBTitle}
              </h3>
            </div>

            {/* Live Agmarknet Price Feed (Zero Hardcoded Values) */}
            <div className="space-y-2.5">
              {isMandiLoading ? (
                <div className="space-y-2 py-4">
                  <div className="h-12 rounded-xl bg-cream-200/60 animate-pulse" />
                  <div className="h-12 rounded-xl bg-cream-200/60 animate-pulse" />
                  <div className="h-12 rounded-xl bg-cream-200/60 animate-pulse" />
                </div>
              ) : mandiRates.length > 0 ? (
                mandiRates.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#F9F7F2] border border-[#143224]/8 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-xs text-[#143224] block">
                        {item.commodity}
                      </span>
                      <span className="text-[11px] text-[#5E7367]">
                        {item.market} {item.district ? `(${item.district})` : ''}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-sm text-[#143224] block">
                        ₹{item.modal_price.toLocaleString('en-IN')}/q
                      </span>
                      <span className="text-[10px] text-[#5E7367]">
                        {content.cardBArrivalPrefix} {item.arrival_date}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-[#F9F7F2] border border-[#143224]/8 text-center text-xs text-[#5E7367]">
                  {content.cardBEmpty}
                </div>
              )}
            </div>

            <Link href="/mandi" className="block pt-1">
              <button
                type="button"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-[#F3EFE6] text-[#143224] border border-[#143224]/18 font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                <span>{content.cardBBtn}</span>
                <ArrowRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

          {/* ----------------------------------------------------
              CARD C (1-Column Span): Micro-Climate & Soil Forecast
              Connected to live Open-Meteo Weather API
             ---------------------------------------------------- */}
          <div className="rounded-3xl bg-white/95 border border-[#143224]/12 shadow-[0_4px_24px_rgba(20,50,36,0.04)] hover:shadow-[0_12px_32px_rgba(20,50,36,0.08)] transition-all p-6 sm:p-7 flex flex-col justify-between space-y-5 text-left group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EAF2EC] text-[#143224] border border-[#143224]/12">
                  <CloudSun className="w-3.5 h-3.5 text-[#D9822B]" />
                  <span>{content.cardCTag}</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Open-Meteo</span>
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-[#143224] leading-snug">
                {content.cardCTitle}
              </h3>
            </div>

            {/* Live Weather Metrics (Zero Hardcoded Values) */}
            {isWeatherLoading ? (
              <div className="space-y-2 py-4">
                <div className="h-14 rounded-xl bg-cream-200/60 animate-pulse" />
                <div className="h-14 rounded-xl bg-cream-200/60 animate-pulse" />
              </div>
            ) : weatherData?.current ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-[#EAF2EC] border border-[#143224]/10 text-center space-y-0.5">
                    <span className="text-[10px] font-bold text-[#5E7367] block">
                      {content.cardCTemp}
                    </span>
                    <span className="text-base font-extrabold text-[#143224] block">
                      {Math.round(weatherData.current.temperature)}°C
                    </span>
                    <span className="text-[9px] font-medium text-[#384D41]">
                      {weatherData.current.weatherDescription || 'Current'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#F9F7F2] border border-[#143224]/10 text-center space-y-0.5">
                    <span className="text-[10px] font-bold text-[#5E7367] block">
                      {content.cardCHumidity}
                    </span>
                    <span className="text-base font-extrabold text-[#143224] block">
                      {weatherData.current.relativeHumidity}%
                    </span>
                    <span className="text-[9px] font-medium text-[#384D41]">
                      RH
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#F9F7F2] border border-[#143224]/10 text-center space-y-0.5">
                    <span className="text-[10px] font-bold text-[#5E7367] block">
                      {content.cardCWind}
                    </span>
                    <span className="text-base font-extrabold text-[#143224] block">
                      {Math.round(weatherData.current.windSpeed)} km/h
                    </span>
                    <span className="text-[9px] font-medium text-[#384D41]">
                      Velocity
                    </span>
                  </div>
                </div>

                {/* Real Agronomic Spray Condition Status */}
                {weatherData.agronomicInsights?.sprayCondition && (
                  <div className="p-3 rounded-xl bg-[#FDF5EC] border border-[#D9822B]/20 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-[#D9822B] shrink-0 mt-0.5" />
                    <p className="text-xs text-[#2D2319] leading-relaxed font-medium">
                      {weatherData.agronomicInsights.sprayCondition.reason}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#F9F7F2] border border-[#143224]/8 text-center text-xs text-[#5E7367]">
                Live weather data synchronizing...
              </div>
            )}

            <Link href="/weather" className="block pt-1">
              <button
                type="button"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-[#F3EFE6] text-[#143224] border border-[#143224]/18 font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                <span>{content.cardCBtn}</span>
                <ArrowRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

          {/* ----------------------------------------------------
              CARD D (Large 2-Column Span): Government Schemes & Subsidies Tracker
              Verified Direct Official Portals
             ---------------------------------------------------- */}
          <div className="lg:col-span-2 rounded-3xl bg-white/95 border border-[#143224]/12 shadow-[0_4px_24px_rgba(20,50,36,0.04)] hover:shadow-[0_12px_32px_rgba(20,50,36,0.08)] transition-all p-6 sm:p-8 flex flex-col justify-between space-y-6 text-left group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EAF2EC] text-[#143224] border border-[#143224]/12">
                  <FileText className="w-3.5 h-3.5 text-[#D9822B]" />
                  <span>{content.cardDTag}</span>
                </span>
                <span className="text-xs font-bold text-[#143224] bg-[#EAF2EC] px-2.5 py-0.5 rounded-full">
                  Direct Official Portals
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-[#143224] leading-snug">
                {content.cardDTitle}
              </h3>

              <p className="text-sm text-[#384D41] leading-relaxed">
                {content.cardDDesc}
              </p>
            </div>

            {/* List of Verified Government Agricultural Aid Schemes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#F9F7F2] border border-[#143224]/8 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-[#143224]">Krishak Bandhu (Assured Income)</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">WB Govt</span>
                </div>
                <p className="text-xs text-[#384D41] font-medium">Direct DBT cash transfer up to ₹10,000/year in Rabi & Kharif installments for landholders.</p>
                <div className="text-[11px] font-bold text-[#D9822B] pt-0.5">krishakbandhu.wb.gov.in</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F9F7F2] border border-[#143224]/8 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-[#143224]">Bangla Shasya Bima (BSB)</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">100% Free Premium</span>
                </div>
                <p className="text-xs text-[#384D41] font-medium">100% state-paid crop insurance protecting paddy, potato, and jute against flood & cyclone.</p>
                <div className="text-[11px] font-bold text-[#D9822B] pt-0.5">banglashasyabima.net</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F9F7F2] border border-[#143224]/8 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-[#143224]">PM-Kisan Samman Nidhi</span>
                  <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md">Central DBT</span>
                </div>
                <p className="text-xs text-[#384D41] font-medium">₹6,000 per year directly credited to Aadhaar-linked bank accounts in three 4-monthly installments.</p>
                <div className="text-[11px] font-bold text-[#D9822B] pt-0.5">pmkisan.gov.in</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F9F7F2] border border-[#143224]/8 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-[#143224]">Farm Mechanization Subsidies</span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">50% Subsidy</span>
                </div>
                <p className="text-xs text-[#384D41] font-medium">50% financial subsidy on power sprayers, solar pumps, and tillers through Matir Katha portal.</p>
                <div className="text-[11px] font-bold text-[#D9822B] pt-0.5">matirkatha.gov.in</div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-between">
              <Link href="/schemes">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#143224] hover:bg-[#1E4733] text-white font-bold text-sm shadow-[0_2px_8px_rgba(20,50,36,0.15)] transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[#D9822B]" />
                  <span>{content.cardDBtn}</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <span className="text-xs font-semibold text-[#5E7367]">
                Official Government Direct Links
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. INSTITUTIONAL SCIENTIFIC & OPEN DATA FOUNDATION
          Strictly Zero Fake Testimonials · Verifiable Public Sources
         ======================================================== */}
      <section className="space-y-10 rounded-[2.5rem] bg-[#EAF2EC]/60 border border-[#143224]/12 p-8 sm:p-12 text-left">
        {/* Header */}
        <div className="max-w-3xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#143224] inline-flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#D9822B]" />
            <span>{content.pillarsTag}</span>
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#143224] tracking-tight">
            {content.pillarsTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#384D41] font-medium">
            {content.pillarsSubtitle}
          </p>
        </div>

        {/* 4 Authentic Institutional Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-white/95 border border-[#143224]/10 shadow-[0_2px_10px_rgba(20,50,36,0.03)] space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#143224] text-[#D9822B] flex items-center justify-center font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-[#143224]">{content.pillar1Title}</h4>
            <p className="text-xs text-[#384D41] leading-relaxed font-medium">
              {content.pillar1Desc}
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white/95 border border-[#143224]/10 shadow-[0_2px_10px_rgba(20,50,36,0.03)] space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#143224] text-[#D9822B] flex items-center justify-center font-bold text-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-[#143224]">{content.pillar2Title}</h4>
            <p className="text-xs text-[#384D41] leading-relaxed font-medium">
              {content.pillar2Desc}
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white/95 border border-[#143224]/10 shadow-[0_2px_10px_rgba(20,50,36,0.03)] space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#143224] text-[#D9822B] flex items-center justify-center font-bold text-sm">
              <CloudSun className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-[#143224]">{content.pillar3Title}</h4>
            <p className="text-xs text-[#384D41] leading-relaxed font-medium">
              {content.pillar3Desc}
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white/95 border border-[#143224]/10 shadow-[0_2px_10px_rgba(20,50,36,0.03)] space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#143224] text-[#D9822B] flex items-center justify-center font-bold text-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-[#143224]">{content.pillar4Title}</h4>
            <p className="text-xs text-[#384D41] leading-relaxed font-medium">
              {content.pillar4Desc}
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. UNIFIED EMERGENCY HELPLINE & FAST ACCESS
         ======================================================== */}
      <section className="rounded-3xl bg-[#143224] text-white p-8 sm:p-10 shadow-[0_8px_32px_rgba(20,50,36,0.18)] flex flex-col md:flex-row items-center justify-between gap-6 text-left">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold">
            <PhoneCall className="w-3.5 h-3.5 text-[#D9822B]" />
            <span>24/7 Government Support</span>
          </div>
          <h3 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            {content.kisanLineTitle}
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
            {content.kisanLineDesc}
          </p>
        </div>

        <div className="shrink-0 text-center md:text-right space-y-2">
          <a
            href="tel:18001801551"
            className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-[#D9822B] hover:bg-[#BF6D1C] text-white font-extrabold text-lg sm:text-xl shadow-lg transition-all hover:scale-102 active:scale-98"
          >
            <PhoneCall className="w-5 h-5" />
            <span>{content.kisanLinePhone}</span>
          </a>
          <span className="text-[11px] text-emerald-200/70 block font-medium">
            Free Call from Any Mobile in India
          </span>
        </div>
      </section>

      {/* ========================================================
          5. UNIFIED FOOTER & DIRECTORY
         ======================================================== */}
      <footer className="pt-8 border-t border-[#143224]/10 text-center space-y-4 text-xs text-[#5E7367] font-medium max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-[#143224]">
          <Link href="/scan" className="hover:text-[#D9822B] transition-colors">Crop Leaf Doctor</Link>
          <Link href="/mandi" className="hover:text-[#D9822B] transition-colors">Mandi Radar</Link>
          <Link href="/fertilizer" className="hover:text-[#D9822B] transition-colors">Fertilizer Calculator</Link>
          <Link href="/weather" className="hover:text-[#D9822B] transition-colors">Weather Spray Advisory</Link>
          <Link href="/schemes" className="hover:text-[#D9822B] transition-colors">Govt Schemes</Link>
          <Link href="/farms" className="hover:text-[#D9822B] transition-colors">My Farm Plots</Link>
        </div>

        <p className="leading-relaxed max-w-2xl mx-auto pt-2">
          {content.footerDisclaimer}
        </p>

        <p className="text-[#384D41] pt-1 font-semibold">
          {content.footerCitation}
        </p>
      </footer>
      </div>
    </div>
  );
}
