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
  ShieldCheck,
  CheckCircle2,
  Sprout,
  ArrowRight,
} from 'lucide-react';

export default function LandingPage() {
  const { language } = useTranslation();

  const content = {
    bn: {
      badge: 'পশ্চিমবঙ্গের কৃষকদের জন্য নিবেদিত কৃষি প্রযুক্তি',
      title: 'বাংলার কৃষকের বিশ্বস্ত ডিজিটাল সঙ্গী',
      subtitle:
        'গাছের পাতার ছবি তুলে রোগ ও সঠিক ওষুধ জানুন, জমির মাপে সারের হিসাব করুন এবং আজকের পাইকারি বাজার দর পান।',
      scanBtn: 'ক্যামেরা দিয়ে পাতার রোগ দেখুন',
      chatBtn: 'কৃষি সহকারীর সাথে কথা বলুন',
      freeTag: '১০০% নিখরচায় · কোনো অ্যাকাউন্টের প্রয়োজন নেই',
      previewTitle: 'ধান, আলু ও সবজির রোগ নির্ণয়',
      previewSub: 'আইসিএআর ও বিধানচন্দ্র কৃষি বিশ্ববিদ্যালয় নির্দেশিত',
      servicesTitle: 'কৃষকের প্রয়োজনীয় সেবা সমূহ',
      doctorTitle: 'রোগ নির্ণয় (Crop Doctor)',
      doctorDesc: 'আক্রান্ত পাতার ছবি তুলুন, মুহূর্তেই সঠিক প্রতিকার জানুন',
      doctorAction: 'ছবি স্ক্যান করুন',
      fertTitle: 'সার পরিমাপক (Fertilizer)',
      fertDesc: 'বিঘা বা কাঠায় ইউরিয়া, ডিএপি ও পটাশের সঠিক ডোজ বের করুন',
      fertAction: 'সারের হিসাব দেখুন',
      mandiTitle: 'আজকের বাজার দর (Mandi Bhav)',
      mandiDesc: 'পশ্চিমবঙ্গের সব জেলার আলু, ধান ও সবজির পাইকারি দর',
      mandiAction: 'বাজার দর জানুন',
      weatherTitle: 'আবহাওয়া ও স্প্রে পরামর্শ',
      weatherDesc: 'আজকের বৃষ্টি, রোদ ও কীটনাশক স্প্রে করার উপযুক্ত সময়',
      weatherAction: 'আবহাওয়া দেখুন',
      farmTitle: 'আমার খামার ও ফসল',
      farmDesc: 'আপনার জমি, বপন করা ফসল ও মাটির সহজ রেকর্ড রাখুন',
      farmAction: 'খামারে যান',
      schemesTitle: 'সরকারি যোজনা ও সাহায্য',
      schemesDesc: 'কৃষকবন্ধু ও বাংলা শস্য বীমার নিয়ম, টাকা ও সরাসরি আবেদন',
      schemesAction: 'যোজনা দেখুন',
      helplineTitle: 'সরকারি কিসান কল সেন্টার (টোল-ফ্রি)',
      helplineSub: 'সরাসরি সরকারি কৃষি কর্মকর্তার সাথে বাংলায় কথা বলতে ডায়াল করুন',
      callBtn: '১৮০০-১৮০-১৫৫১ নম্বরে বিনামূল্যে কল করুন',
    },
    hi: {
      badge: 'भारतीय किसानों के लिए समर्पित डिजिटल कृषि मित्र',
      title: 'किसान का सच्चा और विश्वसनीय डिजिटल साथी',
      subtitle:
        'पत्ती की फोटो खींचकर तुरंत बीमारी और सही दवा जानें, बीघा अनुसार खाद का हिसाब लगाएं और आज का मंडी भाव पाएं।',
      scanBtn: 'कैमरे से पत्ती का रोग पहचानें',
      chatBtn: 'कृषि विशेषज्ञ से बात करें',
      freeTag: '100% निःशुल्क · किसी लॉगिन की आवश्यकता नहीं',
      previewTitle: 'धान, आलू व सब्जियों के रोग का इलाज',
      previewSub: 'ICAR एवं कृषि विश्वविद्यालय मानकों पर आधारित',
      servicesTitle: 'किसान भाइयों के लिए प्रमुख सेवाएं',
      doctorTitle: 'फसल रोग डॉक्टर (Crop Doctor)',
      doctorDesc: 'पत्ती की फोटो से रोग पहचानें और जैविक व सही दवा जानें',
      doctorAction: 'रोग पहचानें',
      fertTitle: 'खाद कैलकुलेटर (Fertilizer)',
      fertDesc: 'बीघा या एकड़ अनुसार यूरिया, डीएपी और पोटाश की मात्रा जानें',
      fertAction: 'खाद की मात्रा जानें',
      mandiTitle: 'आज का मंडी भाव (Mandi Bhav)',
      mandiDesc: 'धान, आलू, सरसों और सब्जियों के ताज़ा थोक भाव',
      mandiAction: 'मंडी भाव देखें',
      weatherTitle: 'मौसम व छिड़काव सलाह',
      weatherDesc: 'आज की बारिश, तापमान और कीटनाशक छिड़काव का सही समय',
      weatherAction: 'मौसम देखें',
      farmTitle: 'मेरा खेत और फसलें',
      farmDesc: 'अपनी ज़मीन, बोई गई फसलों और मिट्टी का आसान रिकॉर्ड रखें',
      farmAction: 'खेत देखें',
      schemesTitle: 'सरकारी योजनाएं व बीमा',
      schemesDesc: 'पीएम-किसान, फसल बीमा व सरकारी सहायता की पूरी जानकारी',
      schemesAction: 'योजनाएं देखें',
      helplineTitle: 'सरकारी किसान कॉल सेंटर (टोल-फ्री)',
      helplineSub: 'सीधे कृषि अधिकारी से अपनी भाषा में बात करने के लिए कॉल करें',
      callBtn: '1800-180-1551 पर मुफ्त कॉल करें',
    },
    en: {
      badge: 'Dedicated Agricultural Companion for Indian Farmers',
      title: "Farmer's Most Trusted Digital Companion",
      subtitle:
        'Diagnose crop leaf diseases instantly from a photo, calculate exact fertilizer doses for your Bigha, and check live wholesale market prices.',
      scanBtn: 'Scan Leaf Photo for Diagnosis',
      chatBtn: 'Talk with Agriculture Expert',
      freeTag: '100% Free for all farmers · No account or password needed',
      previewTitle: 'Rice, Potato & Vegetable Disease Diagnosis',
      previewSub: 'Aligned with ICAR & BCKV public agronomy guides',
      servicesTitle: 'Essential Farming Services',
      doctorTitle: 'Crop Leaf Doctor',
      doctorDesc: 'Take a clear photo of an infected leaf to get certified organic and chemical cures',
      doctorAction: 'Diagnose Leaf',
      fertTitle: 'Fertilizer Calculator',
      fertDesc: 'Calculate scientific doses of Urea, DAP, and MOP tailored to your Bigha and soil type',
      fertAction: 'Calculate Doses',
      mandiTitle: 'Live Mandi Bhav',
      mandiDesc: 'Official wholesale market prices for Potato, Rice, Jute, and vegetables across Bengal',
      mandiAction: 'Check Prices',
      weatherTitle: 'Weather & Spray Guide',
      weatherDesc: 'Rain forecasts, humidity, and safe morning spraying windows for crops',
      weatherAction: 'View Weather',
      farmTitle: 'My Farm & Plots',
      farmDesc: 'Record your plots, track sown varieties, soil fertility tests, and harvest dates',
      farmAction: 'Open Farm',
      schemesTitle: 'Govt Schemes & Insurance',
      schemesDesc: 'Direct application rules and benefits for Krishak Bandhu and Bangla Shasya Bima',
      schemesAction: 'View Schemes',
      helplineTitle: 'Official Kisan Call Center (Toll-Free)',
      helplineSub: 'Speak directly with an agricultural officer free of charge in your local language',
      callBtn: 'Call Toll-Free 1800-180-1551',
    },
  }[language || 'en'];

  return (
    <div className="space-y-6 sm:space-y-10 w-full max-w-5xl mx-auto text-left pb-12">
      {/* 1. Warm, Natural, Visual Hero Section (Light, Airy, Real Photos) */}
      <section className="relative overflow-hidden rounded-3xl border border-cream-200/90 bg-gradient-to-br from-amber-50/70 via-white to-emerald-50/60 p-5 sm:p-8 lg:p-10 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column: Direct Action & Welcoming Language */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-900 text-xs font-bold border border-emerald-300/60">
              <Sprout className="w-3.5 h-3.5 text-emerald-700" />
              <span>{content.badge}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-brand-dark tracking-tight leading-tight">
              {content.title}
            </h1>

            <p className="text-xs sm:text-base text-brand-dark/80 leading-relaxed font-medium">
              {content.subtitle}
            </p>

            {/* Big, Tactile Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <Link href="/scan" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg transition-all active:scale-95"
                >
                  <Camera className="w-5 h-5 text-white" />
                  <span>{content.scanBtn}</span>
                </button>
              </Link>

              <Link href="/assistant" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-cream-100 text-brand-forest border-2 border-brand-forest/20 font-bold text-sm sm:text-base shadow-xs transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-brand-leaf" />
                  <span>{content.chatBtn}</span>
                </button>
              </Link>
            </div>

            <div className="flex items-center gap-2 pt-1 text-xs text-brand-dark/70 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{content.freeTag}</span>
            </div>
          </div>

          {/* Right Column: Real, Visible Bengal Farm Photography Card */}
          <div className="lg:col-span-5 relative w-full h-[220px] sm:h-[280px] lg:h-[320px] rounded-2xl overflow-hidden shadow-md border-2 border-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=900&q=85"
              alt="Lush green paddy fields in Bengal"
              className="absolute inset-0 w-full h-full object-cover brightness-[0.92] hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/25 to-transparent" />

            <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-black/40 backdrop-blur-xs text-white space-y-1 border border-white/20">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600/90 text-[10px] font-bold text-white">
                <CheckCircle2 className="w-3 h-3" />
                <span>প্রমাণিত কৃষি মডেল</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                {content.previewTitle}
              </h4>
              <p className="text-[10px] sm:text-[11px] text-cream-200/90 font-medium">
                {content.previewSub}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Clear, Colorful, Touch-First 6 Service Tiles */}
      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-2xl font-extrabold text-brand-dark tracking-tight px-1">
          {content.servicesTitle}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
          {/* Tile 1: Crop Doctor */}
          <Link href="/scan" className="group">
            <div className="h-full p-5 rounded-2xl bg-white border-2 border-emerald-100 group-hover:border-emerald-500 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-4">
              <div className="space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ScanLine className="w-6 h-6 text-emerald-700" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-brand-dark group-hover:text-emerald-700 transition-colors">
                  {content.doctorTitle}
                </h3>
                <p className="text-xs sm:text-sm text-brand-dark/70 leading-relaxed font-medium">
                  {content.doctorDesc}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-700 pt-2 border-t border-emerald-50">
                <span>{content.doctorAction}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Tile 2: Fertilizer Calculator */}
          <Link href="/fertilizer" className="group">
            <div className="h-full p-5 rounded-2xl bg-white border-2 border-blue-100 group-hover:border-blue-500 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-4">
              <div className="space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FlaskConical className="w-6 h-6 text-blue-700" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-brand-dark group-hover:text-blue-700 transition-colors">
                  {content.fertTitle}
                </h3>
                <p className="text-xs sm:text-sm text-brand-dark/70 leading-relaxed font-medium">
                  {content.fertDesc}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-700 pt-2 border-t border-blue-50">
                <span>{content.fertAction}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Tile 3: Mandi Bhav */}
          <Link href="/mandi" className="group">
            <div className="h-full p-5 rounded-2xl bg-white border-2 border-amber-100 group-hover:border-amber-500 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-4">
              <div className="space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-6 h-6 text-amber-700" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-brand-dark group-hover:text-amber-700 transition-colors">
                  {content.mandiTitle}
                </h3>
                <p className="text-xs sm:text-sm text-brand-dark/70 leading-relaxed font-medium">
                  {content.mandiDesc}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-700 pt-2 border-t border-amber-50">
                <span>{content.mandiAction}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Tile 4: Weather & Spray Advisory */}
          <Link href="/weather" className="group">
            <div className="h-full p-5 rounded-2xl bg-white border-2 border-sky-100 group-hover:border-sky-500 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-4">
              <div className="space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CloudSun className="w-6 h-6 text-sky-700" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-brand-dark group-hover:text-sky-700 transition-colors">
                  {content.weatherTitle}
                </h3>
                <p className="text-xs sm:text-sm text-brand-dark/70 leading-relaxed font-medium">
                  {content.weatherDesc}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-sky-700 pt-2 border-t border-sky-50">
                <span>{content.weatherAction}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Tile 5: My Farm & Plots */}
          <Link href="/farms" className="group">
            <div className="h-full p-5 rounded-2xl bg-white border-2 border-emerald-100 group-hover:border-emerald-600 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-4">
              <div className="space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-brand-forest flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Warehouse className="w-6 h-6 text-brand-forest" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-brand-dark group-hover:text-brand-forest transition-colors">
                  {content.farmTitle}
                </h3>
                <p className="text-xs sm:text-sm text-brand-dark/70 leading-relaxed font-medium">
                  {content.farmDesc}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-forest pt-2 border-t border-emerald-50">
                <span>{content.farmAction}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Tile 6: Govt Schemes */}
          <Link href="/schemes" className="group">
            <div className="h-full p-5 rounded-2xl bg-white border-2 border-purple-100 group-hover:border-purple-500 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-4">
              <div className="space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Landmark className="w-6 h-6 text-purple-700" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-brand-dark group-hover:text-purple-700 transition-colors">
                  {content.schemesTitle}
                </h3>
                <p className="text-xs sm:text-sm text-brand-dark/70 leading-relaxed font-medium">
                  {content.schemesDesc}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-purple-700 pt-2 border-t border-purple-50">
                <span>{content.schemesAction}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Official Free Toll-Free Kisan Helpline Banner */}
      <section className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <PhoneCall className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-amber-950">
              {content.helplineTitle}
            </h4>
            <p className="text-[11px] sm:text-xs text-amber-900/80 font-medium">
              {content.helplineSub}
            </p>
          </div>
        </div>

        <a
          href="tel:18001801551"
          className="shrink-0 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95"
        >
          {content.callBtn}
        </a>
      </section>
    </div>
  );
}
