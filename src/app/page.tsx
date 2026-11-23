'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/context';
import {
  ScanLine,
  CloudSun,
  Warehouse,
  PhoneCall,
  FlaskConical,
  Landmark,
  TrendingUp,
  Camera,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export default function LandingPage() {
  const { language } = useTranslation();

  const content = {
    bn: {
      greeting: 'নমস্কার কৃষক বন্ধু! আজ কী প্রয়োজন?',
      subGreeting: 'বাংলার কৃষকের সহজ ও নির্ভরযোগ্য ডিজিটাল কৃষি সহায়ক',
      mainScanTitle: 'গাছের পাতার রোগ নির্ণয় করুন',
      mainScanDesc: 'আক্রান্ত পাতার ছবি তুলে মুহূর্তেই রোগ ও সঠিক ওষুধ জানুন',
      mainScanBtn: 'ক্যামেরা দিয়ে ছবি তুলুন',
      mainChatBtn: 'কৃষি এআই-এর সাথে কথা বলুন',
      servicesTitle: 'সব কৃষি সেবা এক নজরে',
      doctor: 'রোগ নির্ণয়',
      doctorHint: 'পাতার ছবি স্ক্যান',
      fert: 'সার পরিমাপক',
      fertHint: 'ইউরিয়া ও ডিএপি ডোজ',
      mandi: 'আজকের বাজার দর',
      mandiHint: 'পাইকারি আলুর ও ধানের দর',
      weather: 'আবহাওয়া বার্তা',
      weatherHint: 'বৃষ্টি ও স্প্রে করার সময়',
      farm: 'আমার খামার',
      farmHint: 'জমির প্লট ও ফসল',
      schemes: 'সরকারি যোজনা',
      schemesHint: 'কৃষকবন্ধু ও শস্য বীমা',
      helpline: 'সরকারি কিসান কল সেন্টার (টোল-ফ্রি): ১৮০০-১৮০-১৫৫১',
      call: 'বিনামূল্যে কল করুন',
    },
    hi: {
      greeting: 'नमस्ते किसान भाई! आज क्या सहायता चाहिए?',
      subGreeting: 'किसान का सरल और भरोसेमंद डिजिटल कृषि मित्र',
      mainScanTitle: 'फसल के रोग की पहचान करें',
      mainScanDesc: 'पत्ती की फोटो खींचकर तुरंत बीमारी और सही दवा जानें',
      mainScanBtn: 'कैमरे से फोटो लें',
      mainChatBtn: 'कृषि विशेषज्ञ से पूछें',
      servicesTitle: 'प्रमुख कृषि सेवाएं',
      doctor: 'फसल रोग डॉक्टर',
      doctorHint: 'पत्ती स्कैन करें',
      fert: 'खाद कैलकुलेटर',
      fertHint: 'यूरिया व डीएपी की मात्रा',
      mandi: 'आज का मंडी भाव',
      mandiHint: 'ताज़ा थोक भाव',
      weather: 'मौसम पूर्वानुमान',
      weatherHint: 'बारिश व छिड़काव समय',
      farm: 'मेरा खेत',
      farmHint: 'खेत और फसलों का रिकॉर्ड',
      schemes: 'सरकारी योजनाएं',
      schemesHint: 'पीएम-किसान व बीमा',
      helpline: 'सरकारी किसान कॉल सेंटर (टोल-फ्री): 1800-180-1551',
      call: 'निःशुल्क कॉल करें',
    },
    en: {
      greeting: 'Welcome, Farmer! What do you need today?',
      subGreeting: 'Simple, direct, and reliable digital farming assistant',
      mainScanTitle: 'Diagnose Crop Leaf Disease',
      mainScanDesc: 'Take a clear leaf photo to identify diseases and get certified treatments',
      mainScanBtn: 'Open Camera & Scan',
      mainChatBtn: 'Ask Agronomy AI',
      servicesTitle: 'Essential Farming Services',
      doctor: 'Crop Doctor',
      doctorHint: 'Leaf Disease Scan',
      fert: 'Fertilizer Calc',
      fertHint: 'Urea, DAP & MOP Doses',
      mandi: 'Mandi Bhav',
      mandiHint: 'Live Wholesale Prices',
      weather: 'Weather Forecast',
      weatherHint: 'Rain & Spray Windows',
      farm: 'My Farm & Plots',
      farmHint: 'Land & Crop Records',
      schemes: 'Govt Schemes',
      schemesHint: 'Krishak Bandhu & Insurance',
      helpline: 'Official Kisan Call Center (Toll-Free): 1800-180-1551',
      call: 'Call Free',
    },
  }[language || 'en'];

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-5xl mx-auto text-left pb-10">
      {/* 1. Clean, Friendly Welcome Greeting */}
      <div className="space-y-1 pt-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-forest tracking-tight">
          {content.greeting}
        </h1>
        <p className="text-xs sm:text-sm text-brand-dark/70 font-medium">
          {content.subGreeting}
        </p>
      </div>

      {/* 2. Primary Focused Hero Action Card (Clean & High Contrast) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-brand-forest to-emerald-950 text-white p-5 sm:p-8 shadow-md">
        {/* Subtle background glow */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/80 text-amber-300 text-xs font-bold border border-emerald-600/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>১০০% ফ্রি · কোনো লগইন লাগবে না</span>
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-snug">
              {content.mainScanTitle}
            </h2>
            <p className="text-xs sm:text-sm text-cream-100/90 leading-relaxed font-medium">
              {content.mainScanDesc}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-2.5 shrink-0">
            <Link href="/scan" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-brand-dark font-extrabold text-sm sm:text-base shadow-lg transition-transform active:scale-95"
              >
                <Camera className="w-5 h-5 text-brand-dark" />
                <span>{content.mainScanBtn}</span>
              </button>
            </Link>

            <Link href="/assistant" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold text-sm sm:text-base transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-emerald-300" />
                <span>{content.mainChatBtn}</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Simplified 6-App Grid (Clean, Big Touch Targets, Zero Bloat) */}
      <div className="space-y-3">
        <h3 className="text-sm sm:text-base font-bold text-brand-dark/80 px-1">
          {content.servicesTitle}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Card 1: Crop Leaf Doctor */}
          <Link href="/scan" className="group">
            <div className="h-full p-4 sm:p-5 rounded-2xl bg-white border border-cream-200/90 hover:border-emerald-500 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ScanLine className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-brand-dark group-hover:text-emerald-700 transition-colors leading-tight">
                  {content.doctor}
                </h4>
                <p className="text-xs text-brand-dark/60 font-medium mt-0.5">
                  {content.doctorHint}
                </p>
              </div>
            </div>
          </Link>

          {/* Card 2: Fertilizer Calculator */}
          <Link href="/fertilizer" className="group">
            <div className="h-full p-4 sm:p-5 rounded-2xl bg-white border border-cream-200/90 hover:border-blue-500 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FlaskConical className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-brand-dark group-hover:text-blue-700 transition-colors leading-tight">
                  {content.fert}
                </h4>
                <p className="text-xs text-brand-dark/60 font-medium mt-0.5">
                  {content.fertHint}
                </p>
              </div>
            </div>
          </Link>

          {/* Card 3: Mandi Bhav */}
          <Link href="/mandi" className="group">
            <div className="h-full p-4 sm:p-5 rounded-2xl bg-white border border-cream-200/90 hover:border-amber-500 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-brand-dark group-hover:text-amber-700 transition-colors leading-tight">
                  {content.mandi}
                </h4>
                <p className="text-xs text-brand-dark/60 font-medium mt-0.5">
                  {content.mandiHint}
                </p>
              </div>
            </div>
          </Link>

          {/* Card 4: Weather & Spray Advisory */}
          <Link href="/weather" className="group">
            <div className="h-full p-4 sm:p-5 rounded-2xl bg-white border border-cream-200/90 hover:border-sky-500 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CloudSun className="w-6 h-6 text-sky-600" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-brand-dark group-hover:text-sky-700 transition-colors leading-tight">
                  {content.weather}
                </h4>
                <p className="text-xs text-brand-dark/60 font-medium mt-0.5">
                  {content.weatherHint}
                </p>
              </div>
            </div>
          </Link>

          {/* Card 5: My Farm & Plots */}
          <Link href="/farms" className="group">
            <div className="h-full p-4 sm:p-5 rounded-2xl bg-white border border-cream-200/90 hover:border-brand-forest shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-forest/10 text-brand-forest flex items-center justify-center group-hover:scale-105 transition-transform">
                <Warehouse className="w-6 h-6 text-brand-forest" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-brand-dark group-hover:text-brand-forest transition-colors leading-tight">
                  {content.farm}
                </h4>
                <p className="text-xs text-brand-dark/60 font-medium mt-0.5">
                  {content.farmHint}
                </p>
              </div>
            </div>
          </Link>

          {/* Card 6: Govt Schemes */}
          <Link href="/schemes" className="group">
            <div className="h-full p-4 sm:p-5 rounded-2xl bg-white border border-cream-200/90 hover:border-purple-500 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Landmark className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-brand-dark group-hover:text-purple-700 transition-colors leading-tight">
                  {content.schemes}
                </h4>
                <p className="text-xs text-brand-dark/60 font-medium mt-0.5">
                  {content.schemesHint}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* 4. Compact 1-Tap Helpline Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-cream-100 border border-cream-300 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-center sm:text-left">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <PhoneCall className="w-4 h-4" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-brand-dark">
            {content.helpline}
          </span>
        </div>

        <a
          href="tel:18001801551"
          className="shrink-0 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors"
        >
          {content.call}
        </a>
      </div>
    </div>
  );
}
