'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/context';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ScanLine,
  Bot,
  CloudSun,
  Warehouse,
  ShieldCheck,
  Sparkles,
  PhoneCall,
  FlaskConical,
  Landmark,
  ChevronRight,
  TrendingUp,
  HeartHandshake,
} from 'lucide-react';

export default function LandingPage() {
  const { language } = useTranslation();

  // Pure localized labels for local farmers
  const content = {
    bn: {
      heroTag: 'পশ্চিমবঙ্গের কৃষকদের জন্য বিশেষ কৃষি প্রযুক্তি',
      heroTitle: 'বাংলার কৃষকের বিশ্বস্ত ডিজিটাল সঙ্গী',
      heroSubtitle:
        'গাছের পাতার ছবি তুলে রোগ ও ওষুধ জানুন, বিঘা প্রতি সঠিক সার হিসাব করুন, আজকের পাইকারি বাজার দর এবং লাইভ আবহাওয়ার নির্ভরযোগ্য তথ্য পান।',
      scanAction: 'পাতার ছবি তুলে রোগ দেখুন',
      chatAction: 'কৃষি সহকারীর সাথে কথা বলুন',
      guestBadge: 'কোনো লগইন বা পাসওয়ার্ডের ঝামেলা নেই · ১০০% বিনামূল্যে',
      featuresTitle: 'কৃষকের প্রয়োজনীয় ৬টি ডিজিটাল সেবা',
      featuresSubtitle: 'নিচের যে সেবায় যেতে চান, সেখানে সরাসরি আঙুল দিয়ে চাপুন',
      doctorTitle: 'রোগ নির্ণয় (Crop Doctor)',
      doctorDesc: 'আক্রান্ত পাতার ছবি তুলুন, মুহূর্তেই রোগ ও অনুমোদিত সঠিক ওষুধ জানুন',
      doctorAction: 'ছবি স্ক্যান করুন',
      fertTitle: 'সার পরিমাপক (Fertilizer)',
      fertDesc: 'বিঘা বা কাঠায় ইউরিয়া, ডিএপি ও পটাশের সঠিক বৈজ্ঞানিক মাত্রা হিসাব করুন',
      fertAction: 'সারের হিসাব দেখুন',
      mandiTitle: 'আজকের বাজার দর (Mandi Bhav)',
      mandiDesc: 'পশ্চিমবঙ্গের সব জেলার আলু, ধান, পাট ও সবজির আজকের পাইকারি দর',
      mandiAction: 'বাজার দর জানুন',
      weatherTitle: 'আবহাওয়া ও স্প্রে পরামর্শ',
      weatherDesc: 'আজকের বৃষ্টি, রোদ ও সার-কীটনাশক ছিটানোর সঠিক উপযুক্ত সময়',
      weatherAction: 'আবহাওয়া দেখুন',
      farmTitle: 'আমার খামার ও ফসল',
      farmDesc: 'আপনার জমি, বপন করা ফসল, মাটির পরীক্ষা ও ফলনের সহজ হিসাব রাখুন',
      farmAction: 'খামারে যান',
      schemeTitle: 'সরকারি যোজনা ও বীমা',
      schemeDesc: 'কৃষকবন্ধু ও বাংলা শস্য বীমার আবেদনের নিয়ম, তারিখ ও সরাসরি পোর্টাল',
      schemeAction: 'যোজনা দেখুন',
      helplineTitle: 'সরাসরি বিশেষজ্ঞের সাথে কথা বলতে চান?',
      helplineSubtitle: 'ভারতের সরকারি কিসান কল সেন্টারে সম্পূর্ণ ফ্রিতে বাংলা ভাষায় কথা বলুন',
      callNow: 'টোল-ফ্রি ১৮০০-১৮০-১৫৫১ নম্বরে কল করুন',
      trustBadge: 'বিধানচন্দ্র কৃষি বিশ্ববিদ্যালয় (BCKV) ও আইসিএআর (ICAR) অনুমোদিত নির্দেশিকা অনুযায়ী পরিচালিত',
    },
    hi: {
      heroTag: 'भारतीय किसानों के लिए समर्पित डिजिटल कृषि मित्र',
      heroTitle: 'किसान का सच्चा और भरोसेमंद डिजिटल साथी',
      heroSubtitle:
        'पत्ती की फोटो खींचकर रोग और दवा जानें, बीघा अनुसार खाद की सही मात्रा निकालें, आज का मंडी भाव और सटीक मौसम जानकारी पाएं।',
      scanAction: 'पत्ती की फोटो से रोग पहचानें',
      chatAction: 'कृषि विशेषज्ञ से बात करें',
      guestBadge: 'बिना किसी लॉगिन या पासवर्ड के तुरंत प्रयोग करें · 100% निःशुल्क',
      featuresTitle: 'किसान भाइयों के लिए 6 प्रमुख सुविधाएं',
      featuresSubtitle: 'जिस भी सुविधा का उपयोग करना है, उस पर सीधा क्लिक करें',
      doctorTitle: 'फसल रोग डॉक्टर (Crop Doctor)',
      doctorDesc: 'पत्ती की फोटो से रोग पहचानें और जैविक व प्रमाणित रासायनिक इलाज पाएं',
      doctorAction: 'स्कैन करें',
      fertTitle: 'खाद कैलकुलेटर (Fertilizer)',
      fertDesc: 'बीघा या एकड़ अनुसार यूरिया, डीएपी और पोटाश की सटीक मात्रा जानें',
      fertAction: 'खाद की मात्रा जानें',
      mandiTitle: 'आज का मंडी भाव (Mandi Bhav)',
      mandiDesc: 'सभी प्रमुख मंडियों में धान, आलू, सरसों और सब्जियों के ताज़ा थोक भाव',
      mandiAction: 'मंडी भाव देखें',
      weatherTitle: 'मौसम व छिड़काव सलाह',
      weatherDesc: 'आज की बारिश, तापमान और कीटनाशक छिड़काव का सही समय',
      weatherAction: 'मौसम देखें',
      farmTitle: 'मेरा खेत और फसल',
      farmDesc: 'अपनी ज़मीन, बोई गई फसलों और मिट्टी की जांच का आसान रिकॉर्ड रखें',
      farmAction: 'खेत देखें',
      schemeTitle: 'सरकारी योजना व बीमा',
      schemeDesc: 'पीएम-किसान, फसल बीमा व सरकारी अनुदान की ताज़ा जानकारी',
      schemeAction: 'योजनाएं देखें',
      helplineTitle: 'सीधे कृषि अधिकारी से बात करना चाहते हैं?',
      helplineSubtitle: 'सरकारी किसान कॉल सेंटर पर निःशुल्क अपनी भाषा में सलाह लें',
      callNow: 'टोल-फ्री 1800-180-1551 पर कॉल करें',
      trustBadge: 'ICAR एवं कृषि विश्वविद्यालयों के मानकों पर आधारित विश्वसनीय जानकारी',
    },
    en: {
      heroTag: 'Dedicated Digital Agritech for Bengal & Indian Farmers',
      heroTitle: "Farmer's Most Trusted Digital Companion",
      heroSubtitle:
        'Diagnose crop leaf diseases instantly from a photo, calculate scientific fertilizer dosages for your Bigha, check live Mandi prices, and get localized weather advisories.',
      scanAction: 'Diagnose Leaf From Photo',
      chatAction: 'Talk to Agronomy Assistant',
      guestBadge: 'No login or password needed · 100% Free for all farmers',
      featuresTitle: '6 Essential Farmer Direct Services',
      featuresSubtitle: 'Tap directly on the service you want to use today',
      doctorTitle: 'Crop Leaf Doctor',
      doctorDesc: 'Take a clear leaf photo to identify diseases and get certified biological & chemical treatments',
      doctorAction: 'Scan Leaf Photo',
      fertTitle: 'Fertilizer Calculator',
      fertDesc: 'Get exact scientific dosages of Urea, DAP, and MOP tailored to your Bigha and soil type',
      fertAction: 'Calculate Dosage',
      mandiTitle: 'Live Mandi Bhav',
      mandiDesc: 'Official wholesale mandi market prices for Potato, Rice, Jute, and vegetables across West Bengal',
      mandiAction: 'View Market Rates',
      weatherTitle: 'Weather & Spray Guide',
      weatherDesc: 'Rain forecasts, humidity, wind, and optimal spraying windows for pesticides and nutrients',
      weatherAction: 'Check Weather',
      farmTitle: 'My Farm & Crops',
      farmDesc: 'Record your land plots, track sown crops, soil test results, and seasonal harvest timelines',
      farmAction: 'Open Farm Plots',
      schemeTitle: 'Govt Schemes & Insurance',
      schemeDesc: 'Direct application guidance and cut-off dates for Krishak Bandhu and Bangla Shasya Bima',
      schemeAction: 'Explore Schemes',
      helplineTitle: 'Need to talk to an agricultural officer?',
      helplineSubtitle: 'Call the official Kisan Call Center free of charge in your local language',
      callNow: 'Call Toll-Free 1800-180-1551',
      trustBadge: 'Calibrated against BCKV and ICAR scientific crop management standards',
    },
  }[language || 'en'];

  return (
    <div className="space-y-6 sm:space-y-10 w-full text-left">
      {/* 1. Welcoming Hero Banner with Authentic Rural Bengal Agriculture Imagery */}
      <section className="relative overflow-hidden rounded-3xl border border-cream-300 shadow-md bg-brand-forest">
        {/* Background Visual Layer */}
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1600&q=85"
            alt="Lush green paddy fields in Bengal"
            className="w-full h-full object-cover opacity-25 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-forest via-brand-forest/90 to-brand-forest/70" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 p-5 sm:p-10 lg:p-12 text-white max-w-4xl space-y-4 sm:space-y-6">
          <Badge variant="amber" size="sm" className="font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            <span>{content.heroTag}</span>
          </Badge>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
            {content.heroTitle}
          </h1>

          <p className="text-sm sm:text-lg text-cream-100/90 leading-relaxed max-w-2xl font-medium">
            {content.heroSubtitle}
          </p>

          {/* Primary Call to Action Buttons: Big & Touch Friendly */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Link href="/scan" className="w-full sm:w-auto">
              <Button
                variant="amber"
                size="lg"
                leftIcon={<ScanLine className="w-6 h-6" />}
                className="w-full justify-center text-base sm:text-lg font-bold py-3.5 sm:py-4 shadow-lg hover:shadow-xl transition-all"
              >
                {content.scanAction}
              </Button>
            </Link>

            <Link href="/assistant" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                leftIcon={<Bot className="w-6 h-6 text-brand-mint" />}
                className="w-full justify-center text-base sm:text-lg font-bold py-3.5 sm:py-4 bg-white/10 hover:bg-white/20 text-white border-white/40 shadow-sm"
              >
                {content.chatAction}
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2 pt-1 text-xs sm:text-sm text-cream-200">
            <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{content.guestBadge}</span>
          </div>
        </div>
      </section>

      {/* 2. Farmer Direct Service Hub (6 Clear, Visual Cards) */}
      <section className="space-y-4 sm:space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-3xl font-extrabold text-brand-forest tracking-tight">
            {content.featuresTitle}
          </h2>
          <p className="text-xs sm:text-sm text-brand-dark/70 font-medium">
            {content.featuresSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Card 1: Crop Leaf Doctor */}
          <Link href="/scan" className="group">
            <div className="h-full p-5 sm:p-6 rounded-2xl bg-white border-2 border-emerald-100 group-hover:border-emerald-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ScanLine className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-brand-dark group-hover:text-emerald-700 transition-colors">
                  {content.doctorTitle}
                </h3>
                <p className="text-xs sm:text-sm text-brand-dark/70 leading-relaxed">
                  {content.doctorDesc}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-700 pt-2 border-t border-emerald-50">
                <span>{content.doctorAction}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Card 2: Fertilizer Calculator */}
          <Link href="/fertilizer" className="group">
            <div className="h-full p-5 sm:p-6 rounded-2xl bg-white border-2 border-blue-100 group-hover:border-blue-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FlaskConical className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-brand-dark group-hover:text-blue-700 transition-colors">
                  {content.fertTitle}
                </h3>
                <p className="text-xs sm:text-sm text-brand-dark/70 leading-relaxed">
                  {content.fertDesc}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-700 pt-2 border-t border-blue-50">
                <span>{content.fertAction}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Card 3: Mandi Bhav */}
          <Link href="/mandi" className="group">
            <div className="h-full p-5 sm:p-6 rounded-2xl bg-white border-2 border-amber-100 group-hover:border-amber-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-brand-dark group-hover:text-amber-700 transition-colors">
                  {content.mandiTitle}
                </h3>
                <p className="text-xs sm:text-sm text-brand-dark/70 leading-relaxed">
                  {content.mandiDesc}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-700 pt-2 border-t border-amber-50">
                <span>{content.mandiAction}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Card 4: Weather & Spray Advisory */}
          <Link href="/weather" className="group">
            <div className="h-full p-5 sm:p-6 rounded-2xl bg-white border-2 border-sky-100 group-hover:border-sky-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CloudSun className="w-6 h-6 text-sky-600" />
                </div>
                <h3 className="text-lg font-bold text-brand-dark group-hover:text-sky-700 transition-colors">
                  {content.weatherTitle}
                </h3>
                <p className="text-xs sm:text-sm text-brand-dark/70 leading-relaxed">
                  {content.weatherDesc}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-sky-700 pt-2 border-t border-sky-50">
                <span>{content.weatherAction}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Card 5: My Farm & Sown Crops */}
          <Link href="/farms" className="group">
            <div className="h-full p-5 sm:p-6 rounded-2xl bg-white border-2 border-brand-forest/20 group-hover:border-brand-forest shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-brand-forest/10 text-brand-forest flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Warehouse className="w-6 h-6 text-brand-forest" />
                </div>
                <h3 className="text-lg font-bold text-brand-dark group-hover:text-brand-forest transition-colors">
                  {content.farmTitle}
                </h3>
                <p className="text-xs sm:text-sm text-brand-dark/70 leading-relaxed">
                  {content.farmDesc}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-forest pt-2 border-t border-brand-forest/10">
                <span>{content.farmAction}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Card 6: Govt Schemes & Insurance */}
          <Link href="/schemes" className="group">
            <div className="h-full p-5 sm:p-6 rounded-2xl bg-white border-2 border-purple-100 group-hover:border-purple-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Landmark className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-brand-dark group-hover:text-purple-700 transition-colors">
                  {content.schemeTitle}
                </h3>
                <p className="text-xs sm:text-sm text-brand-dark/70 leading-relaxed">
                  {content.schemeDesc}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-purple-700 pt-2 border-t border-purple-50">
                <span>{content.schemeAction}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Official Free Toll-Free Kisan Helpline Banner */}
      <section className="bg-gradient-to-r from-emerald-800 to-brand-forest text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-700/60 text-emerald-100 border border-emerald-500/30">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Kisan Call Center (সরকারি কৃষি সহায়তা)</span>
          </div>
          <h3 className="text-lg sm:text-2xl font-bold text-white">
            {content.helplineTitle}
          </h3>
          <p className="text-xs sm:text-sm text-cream-100/90">
            {content.helplineSubtitle}
          </p>
        </div>

        <a
          href="tel:18001801551"
          className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-brand-dark font-extrabold text-sm sm:text-base shadow-md transition-all active:scale-95"
        >
          <PhoneCall className="w-5 h-5 text-brand-dark" />
          <span>{content.callNow}</span>
        </a>
      </section>

      {/* 4. Authenticity & Scientific Assurance Footer */}
      <footer className="pt-4 pb-8 border-t border-cream-200 text-center space-y-2 text-xs text-brand-dark/70">
        <p className="max-w-2xl mx-auto font-medium">
          {content.trustBadge}
        </p>
        <p className="text-[11px] text-brand-dark/50">
          © {new Date().getFullYear()} KRISHIBONDHU (কৃষিবন্ধু) · Digital Smallholder Agriculture Platform.
        </p>
      </footer>
    </div>
  );
}
