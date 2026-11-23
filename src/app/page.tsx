'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/context';
import HeroVideoBackground from '@/components/home/HeroVideoBackground';
import FeatureOrbitDial from '@/components/home/FeatureOrbitDial';
import {
  Sparkles,
  PhoneCall,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Scan,
  Camera,
  Cpu,
  BadgeCheck,
  Clock,
  Sparkle,
} from 'lucide-react';

export default function LandingPage() {
  const { language } = useTranslation();

  const content = {
    bn: {
      platformBadge: 'এআই আধুনিক স্মার্ট কৃষি প্ল্যাটফর্ম',
      headline: 'আধুনিক কৃষি প্রযুক্তি,\nনির্ভুল এআই সহায়তা',
      subtitle:
        'গাছের পাতার রোগ নির্ণয়, সঠিক সারের পরিমাণ, আবহাওয়া ও পাইকারি বাজার দর — কৃষকের প্রতিটি সিদ্ধান্ত হোক তথ্যভিত্তিক ও লাভজনক।',
      primaryBtn: 'রোগ পরীক্ষা করুন',
      secondaryBtn: 'কৃষি সহকারীর পরামর্শ',
      freePill: '১০০% নিখরচায় · কোনো লগইন বা পাসওয়ার্ডের প্রয়োজন নেই',

      // Services Section
      servicesTitle: 'কৃষক ভাইদের প্রয়োজনীয় সব ডিজিটাল সেবা',
      servicesSubtitle:
        'নিচের যেকোনো সেবায় সরাসরি ক্লিক করে এখুনি ব্যবহার শুরু করুন — কোনো টাকা বা রেজিস্ট্রেশনের প্রয়োজন নেই',
      services: [
        {
          id: 'scan',
          title: 'রোগ নির্ণয় (Crop Leaf Doctor)',
          badge: '📸 এআই স্ক্যানার',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          desc: 'ধানের ব্লাস্ট, আলুর নাবি ধসা বা বেগুনের ডগা ছিদ্রকারী পোকার ছবি তুলুন। কয়েক সেকেন্ডেই সঠিক জৈব ও রাসায়নিক প্রতিকার পান।',
          action: 'ছবি স্ক্যান করুন',
          href: '/scan',
          tag: 'আইসিএআর অনুমোদিত',
          iconColor: 'bg-emerald-500 text-white',
          accentBorder: 'hover:border-emerald-500',
          image:
            'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'fertilizer',
          title: 'সার পরিমাপক (Fertilizer Calculator)',
          badge: '🧪 N-P-K বৈজ্ঞানিক অনুপাত',
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
          desc: 'আপনার জমির সঠিক মাপ (বিঘা, শতক, কাঠা) ও মাটির ধরন অনুযায়ী ইউরিয়া, ডিএপি ও এমওপির সঠিক ডোজ বের করুন। খরচ বাঁচান ও ফলন বাড়ান।',
          action: 'সারের হিসাব করুন',
          href: '/fertilizer',
          tag: 'অপচয়মুক্ত সার প্রয়োগ',
          iconColor: 'bg-blue-600 text-white',
          accentBorder: 'hover:border-blue-500',
          image:
            'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'mandi',
          title: 'আজকের বাজার দর (Mandi Radar)',
          badge: '📈 সরকারি পাইকারি দর',
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
          desc: 'পশ্চিমবঙ্গের সব জেলার প্রধান নিয়ন্ত্রিত পাইকারি বাজারে আলু, আমন/বোরো ধান, পাট ও শাকসবজির আজকের আসল দর জানুন।',
          action: 'বাজার দর দেখুন',
          href: '/mandi',
          tag: 'এগমार्कনেট লাইভ ডেটা',
          iconColor: 'bg-amber-500 text-white',
          accentBorder: 'hover:border-amber-500',
          image:
            'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'weather',
          title: 'আবহাওয়া ও স্প্রে পরামর্শ (Weather Alert)',
          badge: '⛅ কীটনাশক স্প্রে উইন্ডো',
          badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
          desc: 'আগামী ৭ দিনের বৃষ্টিপাত ও বাতাসের গতি দেখুন। কীটনাশক স্প্রে করার নিরাপদ সকালের সময় ও বৃষ্টির আগে ফসল তোলার সতর্কতা পান।',
          action: 'আবহাওয়া দেখুন',
          href: '/weather',
          tag: 'সঠিক স্প্রে সময়সূচী',
          iconColor: 'bg-sky-500 text-white',
          accentBorder: 'hover:border-sky-500',
          image:
            'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'farms',
          title: 'আমার খামার ও ফসল (My Farm Plots)',
          badge: '🌾 জমির খতিয়ান ও ফসল',
          badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
          desc: 'আপনার নিজস্ব প্লট, বপন করা ফসলের জাত, মাটির উর্বরতা ও সেচ ব্যবস্থার সম্পূর্ণ খতিয়ান এক জায়গায় ডিজিটালভাবে সংরক্ষণ করুন।',
          action: 'খামারে প্রবেশ করুন',
          href: '/farms',
          tag: 'প্লটভিত্তিক ব্যবস্থাপনা',
          iconColor: 'bg-teal-600 text-white',
          accentBorder: 'hover:border-teal-500',
          image:
            'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'schemes',
          title: 'সরকারি প্রকল্প ও বিমা (Govt Schemes)',
          badge: '🏛️ কৃষকবন্ধু ও পিএম কিষান',
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
          desc: 'পশ্চিমবঙ্গ কৃষকবন্ধু প্রকল্প, বাংলা শস্য বিমা (BSB), পিএম কিষান ও যন্ত্রাংশ কেনার ভরতুকির সরকারি নিয়মের সরাসরি গাইড।',
          action: 'যোজনা ও অনুদান দেখুন',
          href: '/schemes',
          tag: 'সরাসরি সরকারি সহায়তা',
          iconColor: 'bg-purple-600 text-white',
          accentBorder: 'hover:border-purple-500',
          image:
            'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
        },
      ],

      // How it Works Section
      howTitle: 'খুব সহজ ৩টি ধাপে ব্যবহার করুন',
      howSubtitle: 'যেকোনো সাধারণ স্মার্টফোন থেকে মাত্র ৩০ সেকেন্ডের মধ্যে ফলাফল পান',
      steps: [
        {
          num: '১',
          title: 'গাছ বা পাতার পরিষ্কার ছবি তুলুন',
          desc: 'আক্রান্ত পাতার স্বাভাবিক দিনের আলোয় স্পষ্ট ছবি তুলুন অথবা গ্যালারি থেকে বেছে নিন।',
          icon: Camera,
        },
        {
          num: '২',
          title: 'এআই ও বৈজ্ঞানিক বিশ্লেষণ',
          desc: 'আইসিএআর কৃষি বৈজ্ঞানিক ডাটাবেসের সাথে মিলি মুহূর্তের মধ্যে সঠিক রোগ চিহ্নিত হয়।',
          icon: Cpu,
        },
        {
          num: '৩',
          title: 'অনুমোদিত ওষুধ ও সারের মাত্রা পান',
          desc: 'কোন ওষুধ, কত মিলি প্রতি লিটার জলে গুলিয়ে স্প্রে করতে হবে তার স্পষ্ট বাংলা নির্দেশিকা পান।',
          icon: BadgeCheck,
        },
      ],

      // Helpline
      helplineTitle: 'সরকারি কিসান কল সেন্টার (টোল-ফ্রি)',
      helplineSub: 'সরাসরি কৃষি বিজ্ঞানীদের সাথে বাংলায় কথা বলতে বিনামূল্যে ডায়াল করুন',
      callBtn: '১৮০০-১৮০-১৫৫১ নম্বরে বিনামূল্যে কল করুন',

      // Disclaimer
      disclaimer:
        'সতর্কবার্তা: কৃষিবন্ধু একটি মুক্ত কৃষি নির্দেশিকা প্ল্যাটফর্ম। গুরুতর রোগবালাই ও কীটনাশক ব্যবহারের পূর্বে আপনার নিকটবর্তী ব্লক কৃষি কর্মকর্তা (ADA) অথবা কৃষি বিজ্ঞান কেন্দ্রের (KVK) বিশেষজ্ঞদের পরামর্শ নিন।',
    },
    hi: {
      platformBadge: 'एआई आधुनिक स्मार्ट कृषि प्लेटफॉर्म',
      headline: 'स्मार्ट कृषि तकनीक,\nसटीक एआई मार्गदर्शन',
      subtitle:
        'फसल रोग की तत्काल पहचान, खाद की सही मात्रा, मौसम और मंडी भाव — किसान भाई का हर फैसला बने वैज्ञानिक और मुनाफेदार।',
      primaryBtn: 'पत्ती का रोग पहचानें',
      secondaryBtn: 'कृषि विशेषज्ञ से बात करें',
      freePill: '100% निःशुल्क · किसी लॉगिन या पासवर्ड की जरूरत नहीं',

      servicesTitle: 'किसान भाइयों के लिए संपूर्ण डिजिटल सेवाएं',
      servicesSubtitle:
        'नीचे दी गई किसी भी सेवा पर सीधे क्लिक करके तुरंत उपयोग करें — बिल्कुल मुफ्त और आसान',
      services: [
        {
          id: 'scan',
          title: 'रोग पहचान (Crop Leaf Doctor)',
          badge: '📸 एआई स्कैनर',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          desc: 'धान, आलू, सरसों या सब्जियों के रोगी पत्ते की फोटो लें। तुरंत प्रमाणित जैविक व रासायनिक दवाओं की सही खुराक जानें।',
          action: 'फोटो स्कैन करें',
          href: '/scan',
          tag: 'ICAR प्रमाणित',
          iconColor: 'bg-emerald-500 text-white',
          accentBorder: 'hover:border-emerald-500',
          image:
            'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'fertilizer',
          title: 'खाद कैलकुलेटर (Fertilizer Calculator)',
          badge: '🧪 N-P-K वैज्ञानिक अनुपात',
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
          desc: 'अपनी जमीन की सही माप (बीघा, एकड़, कट्ठा) के अनुसार यूरिया, डीएपी और पोटाश की सटीक मात्रा जानें। बर्बादी रोकें।',
          action: 'खाद की मात्रा निकालें',
          href: '/fertilizer',
          tag: 'सटीक खाद प्रबंधन',
          iconColor: 'bg-blue-600 text-white',
          accentBorder: 'hover:border-blue-500',
          image:
            'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'mandi',
          title: 'आज का मंडी भाव (Mandi Radar)',
          badge: '📈 सरकारी थोक भाव',
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
          desc: 'सरकारी एगमार्कनेट से आलू, धान, सरसों व मौसमी सब्जियों के आज के ताज़ा न्यूनतम व अधिकतम थोक भाव जानें।',
          action: 'मंडी भाव देखें',
          href: '/mandi',
          tag: 'एगमार्कनेट लाइव',
          iconColor: 'bg-amber-500 text-white',
          accentBorder: 'hover:border-amber-500',
          image:
            'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'weather',
          title: 'मौसम व छिड़काव सलाह (Weather Alert)',
          badge: '⛅ सुरक्षित छिड़काव समय',
          badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
          desc: 'आगामी 7 दिनों की बारिश व हवा की गति देखकर कीटनाशक छिड़काव का सबसे सुरक्षित समय और बारिश का अलर्ट पाएं।',
          action: 'मौसम देखें',
          href: '/weather',
          tag: 'सुरक्षित स्प्रे विंडो',
          iconColor: 'bg-sky-500 text-white',
          accentBorder: 'hover:border-sky-500',
          image:
            'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'farms',
          title: 'मेरा खेत और फसलें (My Farm Plots)',
          badge: '🌾 जमीन व फसल रिकॉर्ड',
          badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
          desc: 'अपने खेतों के प्लॉट, बोई गई किस्मों, बुवाई की तारीख और मिट्टी की जांच का पूरा रिकॉर्ड सुरक्षित रखें।',
          action: 'खेत पर जाएं',
          href: '/farms',
          tag: 'डिजिटल फार्म डायरी',
          iconColor: 'bg-teal-600 text-white',
          accentBorder: 'hover:border-teal-500',
          image:
            'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'schemes',
          title: 'सरकारी योजनाएं व अनुदान (Govt Schemes)',
          badge: '🏛️ पीएम-किसान व बीमा',
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
          desc: 'पीएम-किसान सम्मान निधि, फसल बीमा और कृषि यंत्रों पर मिलने वाली सरकारी सब्सिडी की पूरी गाइड।',
          action: 'योजनाएं देखें',
          href: '/schemes',
          tag: 'सरकारी सहायता गाइड',
          iconColor: 'bg-purple-600 text-white',
          accentBorder: 'hover:border-purple-500',
          image:
            'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
        },
      ],

      howTitle: 'आसान 3 चरणों में काम करता है',
      howSubtitle: 'किसी भी साधारण फोन से सिर्फ 30 सेकंड में सटीक परिणाम प्राप्त करें',
      steps: [
        {
          num: '1',
          title: 'पत्ती की साफ फोटो लें',
          desc: 'रोगी पत्ते की दिन की रोशनी में साफ तस्वीर खींचें या गैलरी से अपलोड करें।',
          icon: Camera,
        },
        {
          num: '2',
          title: 'एआई व वैज्ञानिक जांच',
          desc: 'ICAR वैज्ञानिक डेटाबेस से मिलान करके सेकंडों में सटीक रोग की पहचान होती है।',
          icon: Cpu,
        },
        {
          num: '3',
          title: 'सटीक दवा व खाद का इलाज पाएं',
          desc: 'कौन सी दवा, कितने पानी में मिलाकर कब छिड़कनी है — पूरी प्रामाणिक जानकारी पाएं।',
          icon: BadgeCheck,
        },
      ],

      helplineTitle: 'सरकारी किसान कॉल सेंटर (टोल-फ्री)',
      helplineSub: 'कृषि वैज्ञानिकों से सीधे हिंदी में मुफ्त बात करने के लिए डायल करें',
      callBtn: '1800-180-1551 पर मुफ्त कॉल करें',

      disclaimer:
        'अस्वीकरण: कृषिबंधु एक डिजिटल कृषि परामर्श मंच है। गंभीर रोग व कीटनाशक छिड़काव से पहले अपने नजदीकी कृषि विज्ञान केंद्र (KVK) अथवा कृषि अधिकारी से सलाह अवश्य लें।',
    },
    en: {
      platformBadge: 'AI Smart Farming Platform',
      headline: 'Smarter farming,\nguided by AI.',
      subtitle:
        'Detect crop diseases instantly, calculate scientific fertilizer dosages for your land, track weather spray windows, and check live mandi prices — all in one place.',
      primaryBtn: 'Diagnose Leaf From Photo',
      secondaryBtn: 'Ask Agronomy Assistant',
      freePill: '100% Free for all farmers · No account or password required',

      servicesTitle: 'Essential Farmer Direct Services',
      servicesSubtitle:
        'Tap directly on any service below to begin immediately — zero subscription or account required',
      services: [
        {
          id: 'scan',
          title: 'Crop Leaf Doctor',
          badge: '📸 AI Vision Scanner',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          desc: 'Diagnose Rice Blast, Potato Late Blight, or Brinjal Shoot Borer in seconds. Receive verified biological and chemical spray dosages.',
          action: 'Scan Leaf Photo',
          href: '/scan',
          tag: 'ICAR Validated',
          iconColor: 'bg-emerald-500 text-white',
          accentBorder: 'hover:border-emerald-500',
          image:
            'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'fertilizer',
          title: 'Scientific Fertilizer Calculator',
          badge: '🧪 Scientific N-P-K Ratio',
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
          desc: 'Calculate exact scientific dosages of Urea, DAP, and MOP tailored to your Bigha, Katha, or Acre and soil nutrient status.',
          action: 'Calculate Dosage',
          href: '/fertilizer',
          tag: 'Zero Wastage',
          iconColor: 'bg-blue-600 text-white',
          accentBorder: 'hover:border-blue-500',
          image:
            'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'mandi',
          title: 'Live Mandi Radar',
          badge: '📈 Wholesale Mandi Rates',
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
          desc: 'Official wholesale market prices for Potato, Rice, Raw Jute, Mustard, and vegetables across Bengal & Eastern India.',
          action: 'View Market Rates',
          href: '/mandi',
          tag: 'Agmarknet Live',
          iconColor: 'bg-amber-500 text-white',
          accentBorder: 'hover:border-amber-500',
          image:
            'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'weather',
          title: 'Weather & Spray Advisory',
          badge: '⛅ Safe Spray Windows',
          badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
          desc: '7-day localized rain forecast, wind velocity, and humidity checks to schedule safe pesticide spraying without wash-off.',
          action: 'Check Weather',
          href: '/weather',
          tag: 'Spray Forecast',
          iconColor: 'bg-sky-500 text-white',
          accentBorder: 'hover:border-sky-500',
          image:
            'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'farms',
          title: 'My Farm & Plot Hub',
          badge: '🌾 Land Records & Crops',
          badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
          desc: 'Keep a clean digital record of your land parcels, active crop varieties, soil fertility tests, and irrigation setup.',
          action: 'Open Farm Hub',
          href: '/farms',
          tag: 'Plot Management',
          iconColor: 'bg-teal-600 text-white',
          accentBorder: 'hover:border-teal-500',
          image:
            'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'schemes',
          title: 'Government Schemes & Subsidies',
          badge: '🏛️ Krishak Bandhu & PM-Kisan',
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
          desc: 'Verified application guidelines and seasonal cutoff dates for Krishak Bandhu, Bangla Shasya Bima (BSB), and PM-Kisan.',
          action: 'Explore Schemes',
          href: '/schemes',
          tag: 'Official Subsidies',
          iconColor: 'bg-purple-600 text-white',
          accentBorder: 'hover:border-purple-500',
          image:
            'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
        },
      ],

      howTitle: 'How It Works in 3 Simple Steps',
      howSubtitle: 'Get certified agronomic results on any smartphone in under 30 seconds',
      steps: [
        {
          num: '1',
          title: 'Snap a Clear Leaf Photo',
          desc: 'Take a close photo of the infected leaf under natural daylight or upload from gallery.',
          icon: Camera,
        },
        {
          num: '2',
          title: 'Instant AI & Agronomy Verification',
          desc: 'Cross-referenced against ICAR crop disease pathology datasets in real-time.',
          icon: Cpu,
        },
        {
          num: '3',
          title: 'Certified Dosage & Treatment Plan',
          desc: 'Receive exact biological and chemical spray dosages tailored to your plot size.',
          icon: BadgeCheck,
        },
      ],

      helplineTitle: 'Official Kisan Call Center (Toll-Free)',
      helplineSub: 'Speak directly with certified agricultural scientists free of charge',
      callBtn: 'Call Toll-Free 1800-180-1551',

      disclaimer:
        'Disclaimer: KRISHIBONDHU is an open public agronomy guidance platform. Always verify with your local Block Agriculture Officer (ADA) or Krishi Vigyan Kendra (KVK) before applying scheduled chemical sprays.',
    },
  }[language || 'en'];

  return (
    <div className="w-full text-left space-y-12 sm:space-y-16 pb-20">
      {/* ========================================================
          1. CINEMATIC HERO SECTION
          With live looping background agriculture video (crisp, transparent, authentic)
          and the smooth animated Interactive Orbital Dial saving space & delighting farmers.
         ======================================================== */}
      <section className="relative overflow-hidden rounded-3xl border border-white/20 shadow-2xl min-h-[580px] sm:min-h-[620px] flex items-center p-5 sm:p-8 lg:p-12">
        {/* Authentic Agriculture Looping Video & Gentle Overlay */}
        <HeroVideoBackground />

        {/* Hero Content Grid: Left Column Text & CTAs, Right Column Orbital Dial */}
        <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Heading, Subtitle & Action Buttons */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-white">
            {/* Platform Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 backdrop-blur-md shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
              <span className="text-xs font-semibold tracking-wide text-emerald-100 uppercase">
                {content.platformBadge}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-black tracking-tight leading-[1.12] text-white drop-shadow-md whitespace-pre-line">
              {content.headline}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-emerald-50/90 leading-relaxed font-normal max-w-xl drop-shadow-sm">
              {content.subtitle}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link href="/scan" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-brand-dark font-extrabold text-sm sm:text-base shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95 cursor-pointer"
                >
                  <Scan className="w-5 h-5 text-brand-dark" />
                  <span>{content.primaryBtn}</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </button>
              </Link>

              <Link href="/assistant" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-black/40 hover:bg-black/60 text-white border border-white/30 backdrop-blur-md font-semibold text-sm sm:text-base transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-300" />
                  <span>{content.secondaryBtn}</span>
                </button>
              </Link>
            </div>

            {/* Trust and Freedom pill */}
            <div className="flex items-center gap-2 pt-1 text-xs text-emerald-100/80 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{content.freePill}</span>
            </div>
          </div>

          {/* Right Column: The Smooth Animated Orbital Dial */}
          <div className="lg:col-span-5 flex justify-center items-center w-full">
            <FeatureOrbitDial />
          </div>
        </div>
      </section>

      {/* ========================================================
          2. THE 6 ESSENTIAL SERVICES (RICH, VISUAL, ORGANIZED CARDS)
          Full photographic accents, vibrant badges, actionable links
         ======================================================== */}
      <section className="space-y-6">
        <div className="space-y-1.5 text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <Sparkle className="w-3.5 h-3.5 text-emerald-600" />
            <span>সরাসরি কৃষক সেবা</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-brand-dark tracking-tight">
            {content.servicesTitle}
          </h2>
          <p className="text-xs sm:text-sm text-brand-dark/70 font-medium max-w-2xl">
            {content.servicesSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {content.services.map((srv) => (
            <Link key={srv.id} href={srv.href} className="group block h-full">
              <div
                className={`h-full rounded-2xl bg-white border border-cream-200/90 ${srv.accentBorder} shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1`}
              >
                {/* Visual Header with Real Agricultural Photo Backdrop */}
                <div className="relative h-36 w-full overflow-hidden bg-cream-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={srv.image}
                    alt={srv.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Service Badge & Tag */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-xs backdrop-blur-sm ${srv.badgeColor}`}
                    >
                      {srv.badge}
                    </span>
                    <span className="text-[10px] font-semibold text-white/90 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm">
                      {srv.tag}
                    </span>
                  </div>

                  {/* Title over photo gradient */}
                  <h3 className="absolute bottom-3 left-3 right-3 text-base sm:text-lg font-bold text-white drop-shadow-sm leading-snug">
                    {srv.title}
                  </h3>
                </div>

                {/* Card Description Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs sm:text-sm text-brand-dark/80 leading-relaxed font-normal">
                    {srv.desc}
                  </p>

                  {/* Action Link Footer */}
                  <div className="pt-3 border-t border-cream-200/60 flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-emerald-800 group-hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                      <span>{srv.action}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <span className="text-[11px] font-medium text-brand-dark/50 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>তাৎক্ষণিক ফলাফল</span>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================
          3. HOW IT WORKS IN 3 SIMPLE STEPS
          Clear visual step-by-step for farmers
         ======================================================== */}
      <section className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-cream-100/80 via-white to-emerald-50/60 border border-cream-200/80 space-y-8 shadow-xs">
        <div className="text-center space-y-1.5 max-w-xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>সহজ পদ্ধতি</span>
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
            {content.howTitle}
          </h2>
          <p className="text-xs sm:text-sm text-brand-dark/70 font-medium">
            {content.howSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {content.steps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={idx}
                className="relative p-6 rounded-2xl bg-white border border-cream-200 shadow-2xs space-y-3.5 text-left flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg shadow-xs">
                    <Icon className="w-6 h-6 text-emerald-700" />
                  </div>
                  <span className="text-2xl font-black text-emerald-200">
                    0{idx + 1}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-brand-dark">
                    {st.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-dark/75 leading-relaxed font-normal">
                    {st.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          4. DIRECT KISAN HELPLINE & TOLL-FREE SUPPORT
          Prominent lifeline for farmers
         ======================================================== */}
      <section className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-brand-dark text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-700/40">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
            <PhoneCall className="w-4 h-4 animate-bounce" />
            <span>{content.helplineTitle}</span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100 font-normal max-w-lg leading-relaxed">
            {content.helplineSub}
          </p>
        </div>

        <a
          href="tel:18001801551"
          className="w-full md:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-brand-dark font-black text-sm sm:text-base shadow-md transition-all active:scale-95 shrink-0"
        >
          <PhoneCall className="w-4 h-4" />
          <span>{content.callBtn}</span>
        </a>
      </section>

      {/* ========================================================
          5. AUTHENTIC AGRICULTURAL DISCLAIMER & CITATION
         ======================================================== */}
      <footer className="pt-6 border-t border-cream-200/80 text-center space-y-2 text-xs text-brand-dark/60 font-medium max-w-4xl mx-auto">
        <p className="leading-relaxed">{content.disclaimer}</p>
        <p className="text-brand-dark/40 pt-1">
          © {new Date().getFullYear()} KRISHIBONDHU (কৃষিবন্ধু) · তথ্য সহায়তা: ICAR,
          Agmarknet, IMD & বিধানচন্দ্র কৃষি বিশ্ববিদ্যালয় (BCKV)
        </p>
      </footer>
    </div>
  );
}
