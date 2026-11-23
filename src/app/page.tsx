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
      pillars: [
        {
          title: 'বৈজ্ঞানিক রোগ নির্ণয়',
          desc: 'আইসিএআর ও রাজ্য কৃষি বিশ্ববিদ্যালয় অনুমোদিত সমন্বিত বালাইনাশক ও জৈব চিকিৎসা।',
        },
        {
          title: 'সরাসরি সরকারি তথ্য',
          desc: 'এগমार्कনেট পাইকারি বাজার দর এবং বাংলা শস্য বীমা ও কৃষকবন্ধু প্রকল্পের সঠিক নির্দেশিকা।',
        },
        {
          title: 'কৃষকের আপন ভাষায়',
          desc: 'সহজ বাংলা ও আঞ্চলিক পরিমাপ (বিঘা, শতক, কাঠা) অনুযায়ী নিখুঁত কৃষি ব্যবস্থাপনা।',
        },
      ],
      helplineTitle: 'সরকারি কিসান কল সেন্টার (টোল-ফ্রি)',
      helplineSub: 'সরাসরি কৃষি বিজ্ঞানীদের সাথে কথা বলতে বিনামূল্যে কল করুন',
      callBtn: '১৮০০-১৮০-১৫৫১ নম্বরে কল করুন',
    },
    hi: {
      platformBadge: 'एआई आधुनिक स्मार्ट कृषि प्लेटफॉर्म',
      headline: 'स्मार्ट कृषि तकनीक,\nसटीक एआई मार्गदर्शन',
      subtitle:
        'फसल रोग की तत्काल पहचान, खाद की सही मात्रा, मौसम और मंडी भाव — किसान भाई का हर फैसला बने वैज्ञानिक और मुनाफेदार।',
      primaryBtn: 'पत्ती का रोग पहचानें',
      secondaryBtn: 'कृषि विशेषज्ञ से बात करें',
      freePill: '100% निःशुल्क · किसी लॉगिन या पासवर्ड की जरूरत नहीं',
      pillars: [
        {
          title: 'सटीक वैज्ञानिक निदान',
          desc: 'ICAR एवं कृषि विश्वविद्यालय द्वारा प्रमाणित जैविक व रासायनिक उपचार।',
        },
        {
          title: 'सीधे सरकारी डेटा',
          desc: 'एगमार्कनेट मंडी भाव और पीएम-किसान व फसल बीमा की प्रामाणिक जानकारी।',
        },
        {
          title: 'अपनी स्थानीय भाषा में',
          desc: 'सरल हिंदी और क्षेत्रीय भूमि इकाइयों (बीघा, एकड़) के अनुसार खाद की सही मात्रा।',
        },
      ],
      helplineTitle: 'सरकारी किसान कॉल सेंटर (टोल-फ्री)',
      helplineSub: 'कृषि वैज्ञानिकों से सीधे मुफ्त बात करने के लिए डायल करें',
      callBtn: '1800-180-1551 पर कॉल करें',
    },
    en: {
      platformBadge: 'AI Smart Farming Platform',
      headline: 'Smarter farming,\nguided by AI.',
      subtitle:
        'Detect crop diseases instantly, calculate scientific fertilizer dosages for your land, track weather spray windows, and check live mandi prices — all in one place.',
      primaryBtn: 'Diagnose Leaf From Photo',
      secondaryBtn: 'Ask Agronomy Assistant',
      freePill: '100% Free for all farmers · No account or password required',
      pillars: [
        {
          title: 'ICAR-Validated Diagnostics',
          desc: 'Certified biological and chemical treatment recommendations vetted by university agronomists.',
        },
        {
          title: 'Authentic Live Data',
          desc: 'Official Agmarknet wholesale rates, real-time weather spray windows, and verified government schemes.',
        },
        {
          title: 'Tailored for Indian Farmers',
          desc: 'Native Bengali & Hindi support with authentic regional land units (Bigha, Katha, Acre).',
        },
      ],
      helplineTitle: 'Official Kisan Call Center (Toll-Free)',
      helplineSub: 'Speak directly with certified agricultural scientists free of charge',
      callBtn: 'Call Toll-Free 1800-180-1551',
    },
  }[language || 'en'];

  return (
    <div className="w-full text-left space-y-10 sm:space-y-14 pb-16">
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
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-brand-dark font-extrabold text-sm sm:text-base shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95"
                >
                  <Scan className="w-5 h-5 text-brand-dark" />
                  <span>{content.primaryBtn}</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </button>
              </Link>

              <Link href="/assistant" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-black/40 hover:bg-black/60 text-white border border-white/30 backdrop-blur-md font-semibold text-sm sm:text-base transition-colors"
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
          2. MINIMALIST 3-PILLAR TRUST BAR
          Clean, spacious, uncrowded (no overwhelming walls of text)
         ======================================================== */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {content.pillars.map((pillar, idx) => (
          <div
            key={idx}
            className="p-5 sm:p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-xs hover:shadow-md transition-shadow space-y-2.5"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <h3 className="text-base sm:text-lg font-bold text-brand-dark">
                {pillar.title}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-brand-dark/75 leading-relaxed font-normal">
              {pillar.desc}
            </p>
          </div>
        ))}
      </section>

      {/* ========================================================
          3. DIRECT KISAN HELPLINE
          A prominent lifeline for illiterate or struggling farmers
         ======================================================== */}
      <section className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-brand-dark text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-700/50">
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wider">
            <PhoneCall className="w-4 h-4 animate-bounce" />
            <span>{content.helplineTitle}</span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100 font-normal">
            {content.helplineSub}
          </p>
        </div>

        <a
          href="tel:18001801551"
          className="w-full md:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-brand-dark font-black text-sm sm:text-base shadow-md transition-all active:scale-95 shrink-0"
        >
          <PhoneCall className="w-4 h-4" />
          <span>{content.callBtn}</span>
        </a>
      </section>
    </div>
  );
}
