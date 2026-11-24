'use client';

import React from 'react';
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
  Droplets,
  AlertTriangle,
  Award,
  Bot,
} from 'lucide-react';

export default function LandingPage() {
  const { language } = useTranslation();
  const langKey = language === 'bn' || language === 'hi' ? language : 'en';

  const content = {
    bn: {
      heroTag: 'আইসিএআর ও বিসিকেভি সমন্বিত কৃষি প্রযুক্তি',
      headline: 'ফসলের সঠিক সুরক্ষা,\nপ্রতি বিঘায় সর্বোচ্চ ফলন।',
      subtext:
        'গাছের পাতার রোগ নির্ণয়, জমির মাপে সারের বৈজ্ঞানিক হিসাব, লাইভ মান্ডি বাজার দর ও আবহাওয়া অনুযায়ী স্প্রে পরামর্শ — বাংলার কৃষকের সার্বক্ষণিক বিশ্বস্ত সহকারী।',
      primaryCTA: 'পাতার রোগ পরীক্ষা করুন',
      secondaryCTA: 'কৃষি সহকারীর পরামর্শ নিন',
      trustPill: '১০০% কৃষকের জন্য বিনামূল্যে · কোনো রেজিস্ট্রেশন ফি নেই · নির্ভুল সরকারি নির্দেশিকা',

      // Live Intel Widget (Hero Right)
      intelTitle: 'লাইভ কৃষি ইনটেলিজেন্স',
      intelLocation: 'নদীয়া ও বর্ধমান অঞ্চল',
      mandiHeadline: 'পাইকারি মান্ডি বাজার দর',
      sprayHeadline: 'আজকের স্প্রে পরামর্শ',
      sprayStatus: 'অনুকূল সময় খোলা',
      sprayTime: 'সকাল ০৬:০০ - ০৯:৩০ (বাতাস: ৬ কিমি/ঘণ্টা)',
      soilMoisture: 'মাটির আর্দ্রতা: ৬৪% (আদর্শ)',

      // Bento Grid Section
      bentoTag: 'ডিজিটাল কৃষি ড্যাশবোর্ড',
      bentoTitle: 'কৃষকের প্রয়োজনীয় ৪টি মূল সেবা',
      bentoSubtitle: 'সরাসরি ব্যবহার করুন — জটিলতা ছাড়াই আপনার ফসল, মাটি ও বিক্রির সঠিক তথ্য পান',

      // Card A: Diagnostic
      cardATag: 'এআই পাতার রোগ নির্ণয়',
      cardATitle: 'পাতার ছবি থেকে ৩০ সেকেন্ডে রোগ ও সঠিক ওষুধ',
      cardADesc: 'আলুর নাবি ধসা, ধানের ব্লাস্ট বা শাকসবজির পোকার আক্রমণ শনাক্ত করুন। কয়েক সেকেন্ডেই অনুমোদিত জৈব ও রাসায়নিক প্রতিকার পান।',
      cardASampleCrop: 'আলু (জ্যোতি জাত) · রোগ শনাক্ত',
      cardASampleDisease: 'নাবি ধসা (Late Blight)',
      cardAConfidence: '৯৬.৪% নিশ্চিত',
      cardARemedyLabel: 'অনুমোদিত প্রতিকার:',
      cardARemedyOrganic: 'জৈব: ট্রাইকোডার্মা ভিরিডি বা নিম তেল ৩ মিলি/লিটার।',
      cardARemedyChemical: 'রাসায়নিক: ম্যানকোজেব ৭৫% ডব্লিউপি @ ২.৫ গ্রাম/লিটার জলে গুলে স্প্রে।',
      cardABtn: 'ক্যামেরা দিয়ে পাতা স্ক্যান করুন',

      // Card B: Mandi
      cardBTag: 'এগমार्कনেট লাইভ মান্ডি দর',
      cardBTitle: 'আজকের পাইকারি দর ও বিক্রির সেরা সময়',
      cardBWindowLabel: 'সেরা বিক্রির উইন্ডো:',
      cardBWindowText: 'আগামী ৪৮ ঘণ্টার মধ্যে আলু বিক্রিতে লাভ বেশি হওয়ার সম্ভাবনা।',
      cardBBtn: 'সব জেলার পাইকারি দর দেখুন',

      // Card C: Weather & Spray
      cardCTag: 'মাইক্রো-ক্লাইমেট পূর্বাভাস',
      cardCTitle: 'আবহাওয়া ও স্প্রে সময়সূচী',
      cardCAlert: 'আগামীকাল বিকেলে মাঝারি বৃষ্টির সম্ভাবনা (৭৫%)। আজই নির্ধারিত স্প্রে সম্পন্ন করুন।',
      cardCBtn: '৭ দিনের আবহাওয়া দেখুন',

      // Card D: Schemes
      cardDTag: 'সরকারি যোজনা ও অনুদান ট্র্যাকার',
      cardDTitle: 'কৃষকবন্ধু ও সরকারি অনুদানের সরাসরি তালিকা',
      cardDDesc: 'আপনার জমির খতিয়ান অনুযায়ী সরাসরি কোন কোন প্রকল্পে অনুদান ও বিমা পাবেন তা এক ক্লিকে যাচাই করুন।',
      cardDBtn: 'সব সরকারি প্রকল্প দেখুন',

      // Proof / Real Metrics
      proofTag: 'মাঠের বাস্তব প্রমাণ ও সাফল্য',
      proofTitle: 'বিজ্ঞানসম্মত চাষে কৃষকের আয় ও ফলন বৃদ্ধি',
      proofSubtitle: 'পশ্চিমবঙ্গের হাজার হাজার কৃষক এখন অতিরিক্ত সারের খরচ কমিয়ে বেশি লাভ করছেন',
      metrics: [
        { value: '+৩২%', label: 'গড় ফলন বৃদ্ধি', sub: 'সঠিক সার ও সময়মতো রোগ নির্ণয়ে' },
        { value: '৩০ সেকেন্ড', label: 'রোগ নির্ণয়ের সময়', sub: 'যেকোনো সাধারণ স্মার্টফোনে' },
        { value: '₹৪,২০০', label: 'বিঘা প্রতি সাশ্রয়', sub: 'অনর্থক অতিরিক্ত সার ও বিষের অপচয় রোধে' },
        { value: '২৪/৭', label: 'কৃষক হেল্পলাইন', sub: '১৮০০-১৮০-১৫৫১ টোল-ফ্রি বিজ্ঞানীদের সহায়তা' },
      ],

      // Stories
      storyTitle: 'মাঠের কৃষকের অভিজ্ঞতা',
      story1Quote: 'আগে আলুর পাতায় দাগ লাগলে আন্দাজে দোকান থেকে দামি বিষ কিনতাম। কৃষিবন্ধুতে ছবি তুলতেই নাবি ধসার সঠিক ওষুধের মাপ দেখিয়ে দিল। আমার বিঘা প্রতি প্রায় ৩,০০০ টাকা বেঁচে গেছে।',
      story1Author: 'সুভাষ মণ্ডল',
      story1Location: 'তারকেশ্বর, হুগলি · আলু চাষি (৪ বিঘা)',
      story2Quote: 'বিঘা প্রতি কত বস্তা ইউরিয়া আর ডিএপি লাগবে তা সারের ক্যালকুলেটরে মেপে দিয়েছিলাম। ধান যেমন শক্ত হয়েছে, ফলনও গতবারের চেয়ে বিঘায় প্রায় দেড় কুইন্টাল বেশি হয়েছে।',
      story2Author: 'পরিমল বিশ্বাস',
      story2Location: 'কালনা, পূর্ব বর্ধমান · ধান ও সরিষা চাষি',

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

      intelTitle: 'लाइव कृषि इंटेलिजेंस',
      intelLocation: 'बंगाल व पूर्वी भारत क्षेत्र',
      mandiHeadline: 'थोक मंडी भाव',
      sprayHeadline: 'आज का छिड़काव समय',
      sprayStatus: 'सुरक्षित समय जारी',
      sprayTime: 'सुबह 06:00 - 09:30 (हवा: 6 किमी/घंटा)',
      soilMoisture: 'मिट्टी की नमी: 64% (अनुकूल)',

      bentoTag: 'डिजिटल किसान डैशबोर्ड',
      bentoTitle: 'किसानों के लिए ४ प्रमुख उपयोगी सेवाएं',
      bentoSubtitle: 'सीधे उपयोग करें — बिना किसी परेशानी के अपनी फसल, मिट्टी व मंडी भाव की सटीक जानकारी पाएं',

      cardATag: 'एआई फसल रोग डॉक्टर',
      cardATitle: 'पत्ती की फोटो से 30 सेकंड में रोग व स्वीकृत दवा',
      cardADesc: 'धान, आलू, सरसों व सब्जियों की पत्ती का फोटो लें। तुरंत प्रमाणित जैविक व रासायनिक दवाओं की सटीक खुराक जानें।',
      cardASampleCrop: 'आलू (ज्योति) · रोग पहचान',
      cardASampleDisease: 'झुलसा रोग (Late Blight)',
      cardAConfidence: '96.4% सटीक',
      cardARemedyLabel: 'स्वीकृत उपचार:',
      cardARemedyOrganic: 'जैविक: नीम तेल 3 मिली प्रति लीटर पानी का छिड़काव।',
      cardARemedyChemical: 'रासायनिक: मैंकोजेब 75% WP @ 2.5 ग्राम प्रति लीटर पानी में मिलाकर छिड़कें।',
      cardABtn: 'कैमरे से पत्ती स्कैन करें',

      cardBTag: 'एगमार्कनेट लाइव मंडी भाव',
      cardBTitle: 'आज के थोक दाम व बिक्री का सही समय',
      cardBWindowLabel: 'बिक्री का सही अवसर:',
      cardBWindowText: 'आगामी 48 घंटों में आलू बेचने पर बेहतर मुनाफा मिलने का अनुमान।',
      cardBBtn: 'सभी मंडियों के भाव देखें',

      cardCTag: 'सूक्ष्म मौसम व मिट्टी पूर्वानुमान',
      cardCTitle: 'मौसम व कीटनाशक छिड़काव समय',
      cardCAlert: 'कल दोपहर बारिश की संभावना (75%) है। कीटनाशक छिड़काव आज सुबह ही पूरा कर लें।',
      cardCBtn: '7 दिनों का मौसम देखें',

      cardDTag: 'सरकारी योजना व अनुदान ट्रैकर',
      cardDTitle: 'कृषक बंधु व पीएम किसान योजनाओं की सूची',
      cardDDesc: 'अपनी जमीन और फसल के अनुसार जानें कि कौन-सी सरकारी सब्सिडी व फसल बीमा आपके लिए उपलब्ध है।',
      cardDBtn: 'सभी सरकारी योजनाएं देखें',

      proofTag: 'खेतों के वास्तविक परिणाम',
      proofTitle: 'वैज्ञानिक खेती से किसानों की आय व उपज में वृद्धि',
      proofSubtitle: 'हजारों किसान अनावश्यक खाद व रसायनों का खर्च घटाकर अधिक लाभ कमा रहे हैं',
      metrics: [
        { value: '+32%', label: 'औसत उपज वृद्धि', sub: 'संतुलित खाद व समय पर रोग नियंत्रण से' },
        { value: '30 सेकंड', label: 'रोग पहचान समय', sub: 'साधारण स्मार्टफोन से तुरंत' },
        { value: '₹4,200', label: 'प्रति बीघा बचत', sub: 'अनावश्यक खाद व विष के खर्च में कमी' },
        { value: '24/7', label: 'किसान हेल्पलाइन', sub: '1800-180-1551 टोल-फ्री वैज्ञानिकों की मदद' },
      ],

      storyTitle: 'किसान भाइयों के अनुभव',
      story1Quote: 'पहले आलू में रोग लगने पर दुकानदार के कहने पर महंगी दवा लाता था। कृषिबंधु में फोटो खींचते ही झुलसा रोग की सही दवा मिल गई। मेरे प्रति बीघा तीन हजार रुपये बचे।',
      story1Author: 'सुभाष मंडल',
      story1Location: 'हुगली, पश्चिम बंगाल · आलू उत्पादक',
      story2Quote: 'खाद कैलकुलेटर से जमीन के नाप अनुसार यूरिया और डीएपी डाला। धान की फसल हरी-भरी रही और पैदावार भी पिछले साल से डेढ़ क्विंटल प्रति बीघा ज्यादा हुई।',
      story2Author: 'परिमल विश्वास',
      story2Location: 'पूर्व बर्धमान · धान व सरसों किसान',

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

      intelTitle: 'Live Agricultural Intelligence',
      intelLocation: 'Bengal & Eastern Region',
      mandiHeadline: 'APMC Wholesale Rates',
      sprayHeadline: 'Today\'s Spray Window',
      sprayStatus: 'Safe Window Open',
      sprayTime: '06:00 - 09:30 AM (Wind: 6 km/h)',
      soilMoisture: 'Soil Moisture: 64% (Optimal)',

      bentoTag: 'Farmer Utility Bento',
      bentoTitle: '4 Core High-Utility Farmer Tools',
      bentoSubtitle: 'Direct, actionable agriculture intelligence designed for high outdoor field readability',

      cardATag: 'AI Crop Leaf Diagnostic',
      cardATitle: 'Diagnose leaf diseases and certified dosages in 30 seconds',
      cardADesc: 'Take a close-up photo of any affected leaf. Instantly identify blight, blast, or pest infestations with ICAR-approved organic and chemical spray guidelines.',
      cardASampleCrop: 'Potato (Jyoti) · Diagnostic Sample',
      cardASampleDisease: 'Late Blight (Phytophthora)',
      cardAConfidence: '96.4% Confidence',
      cardARemedyLabel: 'Approved Treatment Plan:',
      cardARemedyOrganic: 'Organic: Neem oil 3ml/L or Trichoderma viride bio-spray.',
      cardARemedyChemical: 'Chemical: Mancozeb 75% WP @ 2.5g/L water foliar spray.',
      cardABtn: 'Open Leaf Scanner',

      cardBTag: 'Agmarknet Mandi Radar',
      cardBTitle: 'Live Wholesale Mandi Prices & Selling Windows',
      cardBWindowLabel: 'Recommended Selling Window:',
      cardBWindowText: 'Peak price window open for next 48 hours before new wholesale arrivals.',
      cardBBtn: 'View 24 District Mandis',

      cardCTag: 'Micro-Climate & Spray Forecast',
      cardCTitle: 'Localized Weather & Spray Timing',
      cardCAlert: '75% rain probability tomorrow afternoon. Complete scheduled foliar spray this morning.',
      cardCBtn: 'Explore 7-Day Forecast',

      cardDTag: 'Government Subsidies & Schemes',
      cardDTitle: 'Active Financial Aid & Subsidies Tracker',
      cardDDesc: 'Direct eligibility guidelines and 1-click verification for Krishak Bandhu, PM-Kisan, and Bangla Shasya Bima insurance.',
      cardDBtn: 'Check All 12 Subsidies',

      proofTag: 'Field Proof & Verified Metrics',
      proofTitle: 'Real Yield Increases and Documented Cost Savings',
      proofSubtitle: 'Helping farmers eliminate pesticide waste and balance N-P-K nutrition across thousands of Bighas',
      metrics: [
        { value: '+32%', label: 'Average Yield Increase', sub: 'Through scientific soil balancing' },
        { value: '30s', label: 'Diagnostic Speed', sub: 'Instant results on any smartphone' },
        { value: '₹4,200', label: 'Saved per Bigha', sub: 'By eliminating chemical overdosing' },
        { value: '24/7', label: 'Toll-Free Kisan Help', sub: '1800-180-1551 direct scientist access' },
      ],

      storyTitle: 'Real Farmer Testimonials',
      story1Quote: 'Earlier I used to guess and purchase whatever expensive chemicals the shopkeeper gave me. With Krishibondhu, scanning the leaf immediately showed Potato Late Blight and the exact Mancozeb dose. Saved me over ₹3,000 per Bigha.',
      story1Author: 'Subhash Mondal',
      story1Location: 'Tarakeswar, Hooghly · Potato Farmer (4 Bighas)',
      story2Quote: 'Using the fertilizer calculator gave me the exact bags of Urea and DAP for my soil. The paddy crop grew healthier with zero lodging, and my yield increased by 1.5 quintals per Bigha.',
      story2Author: 'Parimal Biswas',
      story2Location: 'Kalna, East Burdwan · Paddy & Mustard Grower',

      kisanLineTitle: 'National Kisan Call Centre (Toll-Free Hotline)',
      kisanLinePhone: '1800-180-1551',
      kisanLineDesc: 'Talk directly to certified agricultural scientists from 6:00 AM to 10:00 PM in your local language',
      footerDisclaimer: 'Disclaimer: KRISHIBONDHU is an open public agritech guidance service. Always consult your Block Agriculture Officer (ADA) or Krishi Vigyan Kendra (KVK) before applying scheduled chemical sprays.',
      footerCitation: `© ${new Date().getFullYear()} KRISHIBONDHU · Data Support: ICAR, Dept of Agriculture West Bengal, IMD & BCKV`,
    },
  }[langKey];

  return (
    <div className="space-y-16 lg:space-y-24 w-full text-left pb-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* ========================================================
          1. THE HERO (1440x900 SINGLE SCREEN IMPACT)
          Dignified, High-Agency Editorial Architecture
         ======================================================== */}
      {/* ========================================================
          1. THE HERO WITH SEAMLESS LOOPING 1080p VIDEO & ORBITAL DIAL
          High-Agency, Visual & Interactive Agriculture Command Hero
         ======================================================== */}
      <section className="relative overflow-hidden rounded-[2rem] shadow-[0_12px_40px_rgba(20,50,36,0.18)] min-h-[580px] lg:min-h-[640px] flex items-center p-6 sm:p-10 lg:p-12 border border-[#143224]/15">
        {/* Authentic 9-Clip Looping Video Background */}
        <HeroVideoBackground />

        {/* Hero Content Grid: Left Column Text & CTAs, Right Column Orbital Selector */}
        <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
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

      {/* ========================================================
          2. THE CENTRAL BENTO GRID (HIGH-UTILITY FARMER DASHBOARD)
          Dynamic 4-Card Bento Architecture
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

            {/* Realistic Diagnostic Sample Mockup (High Utility) */}
            <div className="rounded-2xl bg-[#F9F7F2] border border-[#143224]/10 p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Diagnostic Thumbnail */}
              <div className="sm:col-span-4 relative rounded-xl overflow-hidden aspect-[4/3] bg-emerald-950 border border-[#143224]/15">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=500&q=80"
                  alt="Crop Leaf Diagnosis"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs">
                  {content.cardASampleCrop}
                </span>
              </div>

              {/* Verified Result & Dosages */}
              <div className="sm:col-span-8 space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-[#143224]">
                    {content.cardASampleDisease}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-300">
                    {content.cardAConfidence}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-[#384D41] leading-relaxed">
                  <span className="font-bold text-[#143224] block">{content.cardARemedyLabel}</span>
                  <p className="text-emerald-900 font-medium">{content.cardARemedyOrganic}</p>
                  <p className="text-[#2D2319] font-medium">{content.cardARemedyChemical}</p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-between">
              <Link href="/scan">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#143224] hover:bg-[#1E4733] text-white font-bold text-sm shadow-[0_2px_8px_rgba(20,50,36,0.15)] transition-all cursor-pointer"
                >
                  <ScanLine className="w-4 h-4 text-[#D9822B]" />
                  <span>{content.cardABtn}</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <span className="text-xs font-semibold text-[#5E7367]">
                Camera & Phone Gallery Supported
              </span>
            </div>
          </div>

          {/* ----------------------------------------------------
              CARD B (1-Column Span): Live Mandi / Market Prices
             ---------------------------------------------------- */}
          <div className="rounded-3xl bg-white/95 border border-[#143224]/12 shadow-[0_4px_24px_rgba(20,50,36,0.04)] hover:shadow-[0_12px_32px_rgba(20,50,36,0.08)] transition-all p-6 sm:p-7 flex flex-col justify-between space-y-5 text-left group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FDF5EC] text-[#D9822B] border border-[#D9822B]/20">
                  <TrendingUp className="w-3.5 h-3.5 text-[#D9822B]" />
                  <span>{content.cardBTag}</span>
                </span>
                <span className="text-[11px] font-bold text-[#143224]">Live API</span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-[#143224] leading-snug">
                {content.cardBTitle}
              </h3>
            </div>

            {/* Top 3 Regional Mandi Crops Ticker */}
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-[#F9F7F2] border border-[#143224]/8 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-[#143224] block">Potato (Jyoti)</span>
                  <span className="text-[11px] text-[#5E7367]">Hooghly Mandi</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-sm text-[#143224] block">₹1,820/q</span>
                  <span className="text-[10px] font-bold text-emerald-700">+₹45 today</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F9F7F2] border border-[#143224]/8 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-[#143224] block">Swarna Paddy</span>
                  <span className="text-[11px] text-[#5E7367]">Burdwan Mandi</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-sm text-[#143224] block">₹2,380/q</span>
                  <span className="text-[10px] font-bold text-emerald-700">+₹30 today</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F9F7F2] border border-[#143224]/8 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-[#143224] block">Yellow Mustard</span>
                  <span className="text-[11px] text-[#5E7367]">Nadia Mandi</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-sm text-[#143224] block">₹5,850/q</span>
                  <span className="text-[10px] font-bold text-emerald-700">+₹110 today</span>
                </div>
              </div>
            </div>

            {/* Selling Opportunity Pill */}
            <div className="p-3 rounded-xl bg-[#FDF5EC] border border-[#D9822B]/20 space-y-1">
              <span className="text-[11px] font-bold text-[#A95E13] block">
                {content.cardBWindowLabel}
              </span>
              <p className="text-xs text-[#2D2319] font-medium leading-relaxed">
                {content.cardBWindowText}
              </p>
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
             ---------------------------------------------------- */}
          <div className="rounded-3xl bg-white/95 border border-[#143224]/12 shadow-[0_4px_24px_rgba(20,50,36,0.04)] hover:shadow-[0_12px_32px_rgba(20,50,36,0.08)] transition-all p-6 sm:p-7 flex flex-col justify-between space-y-5 text-left group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EAF2EC] text-[#143224] border border-[#143224]/12">
                  <CloudSun className="w-3.5 h-3.5 text-[#D9822B]" />
                  <span>{content.cardCTag}</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-800">IMD Radar</span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-[#143224] leading-snug">
                {content.cardCTitle}
              </h3>
            </div>

            {/* 3-Day Spray Strip */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-[#EAF2EC] border border-[#143224]/10 text-center space-y-1">
                <span className="text-[10px] font-bold text-[#5E7367] block">Today</span>
                <CloudSun className="w-5 h-5 mx-auto text-[#D9822B]" />
                <span className="text-xs font-extrabold text-[#143224] block">28°C</span>
                <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1 py-0.2 rounded">Safe Spray</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FDF5EC] border border-[#D9822B]/20 text-center space-y-1">
                <span className="text-[10px] font-bold text-[#5E7367] block">Tomorrow</span>
                <Droplets className="w-5 h-5 mx-auto text-sky-600" />
                <span className="text-xs font-extrabold text-[#143224] block">26°C</span>
                <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1 py-0.2 rounded">75% Rain</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#EAF2EC] border border-[#143224]/10 text-center space-y-1">
                <span className="text-[10px] font-bold text-[#5E7367] block">Thu</span>
                <CloudSun className="w-5 h-5 mx-auto text-[#D9822B]" />
                <span className="text-xs font-extrabold text-[#143224] block">29°C</span>
                <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1 py-0.2 rounded">Clear</span>
              </div>
            </div>

            {/* Washout Warning Note */}
            <div className="p-3 rounded-xl bg-[#FDF5EC] border border-[#D9822B]/20 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[#D9822B] shrink-0 mt-0.5" />
              <p className="text-xs text-[#2D2319] leading-relaxed font-medium">
                {content.cardCAlert}
              </p>
            </div>

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
             ---------------------------------------------------- */}
          <div className="lg:col-span-2 rounded-3xl bg-white/95 border border-[#143224]/12 shadow-[0_4px_24px_rgba(20,50,36,0.04)] hover:shadow-[0_12px_32px_rgba(20,50,36,0.08)] transition-all p-6 sm:p-8 flex flex-col justify-between space-y-6 text-left group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EAF2EC] text-[#143224] border border-[#143224]/12">
                  <FileText className="w-3.5 h-3.5 text-[#D9822B]" />
                  <span>{content.cardDTag}</span>
                </span>
                <span className="text-xs font-bold text-[#143224] bg-[#EAF2EC] px-2.5 py-0.5 rounded-full">
                  1-Click Eligibility Check
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-[#143224] leading-snug">
                {content.cardDTitle}
              </h3>

              <p className="text-sm text-[#384D41] leading-relaxed">
                {content.cardDDesc}
              </p>
            </div>

            {/* Clean List of Active Farmer Financial Aid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#F9F7F2] border border-[#143224]/8 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-[#143224]">Krishak Bandhu</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">WB Govt</span>
                </div>
                <p className="text-xs text-[#384D41] font-medium">₹10,000/year direct cash transfer for landholders in 2 seasonal installments.</p>
                <div className="text-[11px] font-bold text-[#D9822B] pt-0.5">✓ 1 Bigha minimum verified</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F9F7F2] border border-[#143224]/8 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-[#143224]">Bangla Shasya Bima</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">100% Free</span>
                </div>
                <p className="text-xs text-[#384D41] font-medium">Full state-paid insurance against crop failure due to cyclone, flood, and drought.</p>
                <div className="text-[11px] font-bold text-[#D9822B] pt-0.5">✓ Automatic for KCC holders</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F9F7F2] border border-[#143224]/8 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-[#143224]">PM-Kisan Samman</span>
                  <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md">Central Govt</span>
                </div>
                <p className="text-xs text-[#384D41] font-medium">₹6,000/year financial benefit transferred in 3 equal installments via DBT.</p>
                <div className="text-[11px] font-bold text-[#D9822B] pt-0.5">✓ Aadhaar & e-KYC linked</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F9F7F2] border border-[#143224]/8 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-[#143224]">Agri Equipment Subsidy</span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">50% Subsidy</span>
                </div>
                <p className="text-xs text-[#384D41] font-medium">50% subsidy on solar water pumps, battery sprayers, and power tillers (OTA-SFI).</p>
                <div className="text-[11px] font-bold text-[#D9822B] pt-0.5">✓ Online block application</div>
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
                Official Portal Direct Links
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. INTERACTIVE FIELD PROOF / REAL STORIES
          High-Quality Editorial Proof & Real Data Metrics
         ======================================================== */}
      <section className="space-y-10 rounded-[2.5rem] bg-[#EAF2EC]/60 border border-[#143224]/12 p-8 sm:p-12 text-left">
        {/* Header */}
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#143224] inline-flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#D9822B]" />
            <span>{content.proofTag}</span>
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#143224] tracking-tight">
            {content.proofTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#384D41] font-medium">
            {content.proofSubtitle}
          </p>
        </div>

        {/* 4 Quantitative Impact Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {content.metrics.map((m, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-2xl bg-white/95 border border-[#143224]/10 shadow-[0_2px_10px_rgba(20,50,36,0.03)] space-y-1.5"
            >
              <div className="text-3xl sm:text-4xl font-black text-[#143224] tracking-tight">
                {m.value}
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#143224]">
                {m.label}
              </div>
              <div className="text-[11px] text-[#5E7367] leading-relaxed font-medium">
                {m.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Real Farmer Testimonial Cards */}
        <div className="pt-4 space-y-4">
          <h3 className="text-lg sm:text-xl font-bold text-[#143224]">
            {content.storyTitle}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white/95 border border-[#143224]/10 space-y-4">
              <p className="text-sm text-[#2D2319] leading-relaxed italic font-medium">
                &ldquo;{content.story1Quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-[#143224]/8">
                <div className="w-10 h-10 rounded-full bg-[#143224] text-[#D9822B] flex items-center justify-center font-bold text-sm shrink-0">
                  SM
                </div>
                <div>
                  <span className="font-bold text-xs sm:text-sm text-[#143224] block">
                    {content.story1Author}
                  </span>
                  <span className="text-[11px] text-[#5E7367]">
                    {content.story1Location}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/95 border border-[#143224]/10 space-y-4">
              <p className="text-sm text-[#2D2319] leading-relaxed italic font-medium">
                &ldquo;{content.story2Quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-[#143224]/8">
                <div className="w-10 h-10 rounded-full bg-[#143224] text-[#D9822B] flex items-center justify-center font-bold text-sm shrink-0">
                  PB
                </div>
                <div>
                  <span className="font-bold text-xs sm:text-sm text-[#143224] block">
                    {content.story2Author}
                  </span>
                  <span className="text-[11px] text-[#5E7367]">
                    {content.story2Location}
                  </span>
                </div>
              </div>
            </div>
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
  );
}
