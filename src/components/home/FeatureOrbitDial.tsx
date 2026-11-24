'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/context';
import {
  Scan,
  FlaskConical,
  TrendingUp,
  CloudRain,
  Sprout,
  Landmark,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface FeatureItem {
  id: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: { bn: string; hi: string; en: string };
  badge: { bn: string; hi: string; en: string };
  copy: { bn: string; hi: string; en: string };
  href: string;
  color: string;
  bgGlow: string;
}

const FEATURES: FeatureItem[] = [
  {
    id: 'scan',
    icon: Scan,
    label: { bn: 'রোগ শনাক্ত', hi: 'रोग पहचान', en: 'Crop Leaf Doctor' },
    badge: { bn: 'তাৎক্ষণিক এআই', hi: 'तुरंत एआई जांच', en: 'Instant AI Vision' },
    copy: {
      bn: 'পাতার ছবি তুলুন, সরাসরি বৈজ্ঞানিক রোগ নির্ণয় ও আইসিএআর অনুমোদিত ওষুধ পান।',
      hi: 'पत्ते की फोटो लें, तुरंत वैज्ञानिक रोग पहचान व स्वीकृत उपचार पाएं।',
      en: 'Scan affected leaves for instant disease diagnosis and ICAR-approved treatments.',
    },
    href: '/scan',
    color: '#10B981',
    bgGlow: 'rgba(16, 185, 129, 0.15)',
  },
  {
    id: 'fertilizer',
    icon: FlaskConical,
    label: { bn: 'সারের হিসাব', hi: 'उर्वरक कैलकुलेटर', en: 'Fertilizer Dosage' },
    badge: { bn: 'বৈজ্ঞানিক মাত্রা', hi: 'सटीक मात्रा', en: 'Scientific N-P-K' },
    copy: {
      bn: 'বিঘা ও শতক অনুযায়ী ইউরিয়া, ডিএপি ও পটাশের অপচয়হীন সঠিক প্রয়োগ মাত্রা।',
      hi: 'बीघा व एकड़ अनुसार यूरिया, डीएपी व पोटाश की वैज्ञानिक समय सारिणी।',
      en: 'Precise balanced dosages of Urea, DAP, and MOP tailored to your soil test.',
    },
    href: '/fertilizer',
    color: '#38BDF8',
    bgGlow: 'rgba(56, 189, 248, 0.15)',
  },
  {
    id: 'mandi',
    icon: TrendingUp,
    label: { bn: 'বাজার দর', hi: 'मंडी भाव', en: 'Mandi Radar' },
    badge: { bn: 'লাইভ সরকারি রেট', hi: 'लाइव सरकारी रेट', en: 'Govt APMC Feed' },
    copy: {
      bn: 'সরকারি এগমार्कনেট থেকে ধান, আলু, পাট ও সবজির লাইভ পাইকারি দর।',
      hi: 'सरकारी एगमार्कनेट से आलू, धान व सब्जियों के लाइव दैनिक थोक भाव।',
      en: 'Daily wholesale market arrivals and modal prices across Bengal APMC mandis.',
    },
    href: '/mandi',
    color: '#F59E0B',
    bgGlow: 'rgba(245, 158, 11, 0.15)',
  },
  {
    id: 'weather',
    icon: CloudRain,
    label: { bn: 'আবহাওয়া ও স্প্রে', hi: 'मौसम व छिड़काव', en: 'Weather & Spray' },
    badge: { bn: 'স্প্রে উইন্ডো', hi: 'छिड़काव अलर्ट', en: 'Safe Spray Window' },
    copy: {
      bn: 'বৃষ্টি ও বাতাসের গতি দেখে কীটনাশক স্প্রে ও ফসল কাটার উপযুক্ত সময় জানুন।',
      hi: 'बारिश व हवा की गति देखकर कीटनाशक छिड़काव का सुरक्षित समय चुनें।',
      en: 'Hyper-local rain and wind alerts to prevent pesticide washout and save money.',
    },
    href: '/weather',
    color: '#60A5FA',
    bgGlow: 'rgba(96, 165, 250, 0.15)',
  },
  {
    id: 'farms',
    icon: Sprout,
    label: { bn: 'আমার খামার', hi: 'मेरा खेत', en: 'My Farm Plots' },
    badge: { bn: 'ডিজিটাল খতিয়ান', hi: 'खेत रिकॉर्ड', en: 'Plot Records' },
    copy: {
      bn: 'জমির খতিয়ান, ফসলের বৃদ্ধির পর্যায় এবং মাটির স্বাস্থ্য এক জায়গায় রাখুন।',
      hi: 'जमीन का रकबा, फसल की वृद्धि अवस्था व मिट्टी का स्वास्थ्य सुरक्षित रखें।',
      en: 'Manage your parcels, crop growth calendar, and soil fertility in one place.',
    },
    href: '/farms',
    color: '#34D399',
    bgGlow: 'rgba(52, 211, 153, 0.15)',
  },
  {
    id: 'schemes',
    icon: Landmark,
    label: { bn: 'সরকারি প্রকল্প', hi: 'सरकारी योजनाएं', en: 'Govt Schemes' },
    badge: { bn: 'ডিবিটি অনুদান', hi: 'अनुदान सहायता', en: 'Direct DBT Aid' },
    copy: {
      bn: 'কৃষকবন্ধু ও পিএম কিষান অনুদানের যাচাইকৃত আবেদন নির্দেশিকা ও পোর্টাল লিংক।',
      hi: 'कृषक बंधु व पीएम किसान सहायता की सत्यापित आवेदन प्रक्रिया।',
      en: 'Verified portal links and seasonal cutoffs for Krishak Bandhu and PM-Kisan.',
    },
    href: '/schemes',
    color: '#FB923C',
    bgGlow: 'rgba(251, 146, 60, 0.15)',
  },
];

export default function FeatureOrbitDial() {
  const { language } = useTranslation();
  const langKey = language === 'bn' || language === 'hi' ? language : 'en';

  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  // Auto-scroll through cards every 4.5 seconds if user is not actively swiping/touching
  useEffect(() => {
    if (isUserInteracting) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % FEATURES.length;
        if (scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          const cardWidth = container.offsetWidth * 0.85;
          container.scrollTo({
            left: next * cardWidth,
            behavior: 'smooth',
          });
        }
        return next;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isUserInteracting]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardWidth = container.offsetWidth * 0.85;
    const current = Math.round(container.scrollLeft / cardWidth);
    if (current >= 0 && current < FEATURES.length && current !== activeIndex) {
      setActiveIndex(current);
    }
  };

  const scrollToIndex = (idx: number) => {
    setIsUserInteracting(true);
    setActiveIndex(idx);
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.offsetWidth * 0.85;
      container.scrollTo({
        left: idx * cardWidth,
        behavior: 'smooth',
      });
    }
    // Resume auto-scroll after 8 seconds of inactivity
    setTimeout(() => setIsUserInteracting(false), 8000);
  };

  return (
    <div
      className="relative w-full max-w-xl mx-auto select-none"
      onMouseEnter={() => setIsUserInteracting(true)}
      onMouseLeave={() => setIsUserInteracting(false)}
      onTouchStart={() => setIsUserInteracting(true)}
    >
      {/* ─────────────────────────────────────────────────────────────
          SWIPEABLE SNAP CAROUSEL (Full Mobile & Tablet Fluid Experience)
          Zero right-clipping, natural peeking cards, zero bloated height
          ───────────────────────────────────────────────────────────── */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex items-stretch gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar px-1 py-2"
        style={{ scrollPaddingLeft: '0.25rem', scrollPaddingRight: '2rem' }}
      >
        {FEATURES.map((item, idx) => {
          const Icon = item.icon;
          const isActive = idx === activeIndex;

          return (
            <div
              key={item.id}
              className={`w-[85%] sm:w-[82%] lg:w-[88%] shrink-0 snap-center transition-all duration-300 ${
                isActive ? 'scale-[1.01] opacity-100' : 'opacity-70 scale-[0.98]'
              }`}
            >
              <div
                className="h-full p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-black/60 dark:bg-[#0c1810]/80 backdrop-blur-md border transition-all flex flex-col justify-between shadow-xl"
                style={{
                  borderColor: isActive ? item.color : 'rgba(255, 255, 255, 0.12)',
                  boxShadow: isActive ? `0 8px 32px ${item.bgGlow}` : undefined,
                }}
              >
                <div>
                  {/* Card Header: Icon + Live Feature Badge */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md"
                        style={{
                          backgroundColor: `${item.color}25`,
                          border: `1.5px solid ${item.color}`,
                        }}
                      >
                        <Icon className="w-5 h-5" style={{ color: item.color }} />
                      </div>
                      <div className="min-w-0 text-left">
                        <h3 className="text-sm sm:text-base font-extrabold text-white truncate">
                          {item.label[langKey]}
                        </h3>
                      </div>
                    </div>

                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0"
                      style={{
                        backgroundColor: `${item.color}25`,
                        color: item.color,
                        border: `1px solid ${item.color}40`,
                      }}
                    >
                      {item.badge[langKey]}
                    </span>
                  </div>

                  {/* Editorial Body Text: Focused & Compact */}
                  <p className="text-xs sm:text-sm text-emerald-50/90 dark:text-emerald-100/90 leading-relaxed font-medium text-left pt-3">
                    {item.copy[langKey]}
                  </p>
                </div>

                {/* Direct Action Tap Button (>=44px touch target) */}
                <div className="pt-4">
                  <Link
                    href={item.href}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm text-[#0c180e] shadow-md transition-all active:scale-[0.98] min-h-[44px]"
                    style={{ backgroundColor: item.color }}
                  >
                    <span>{item.label[langKey]}</span>
                    <ArrowRight className="w-4 h-4 text-[#0c180e]" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PAGINATION PILL DOTS WITH TACTILE TAP FEEDBACK
          ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-1.5 pt-2">
        {FEATURES.map((item, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToIndex(idx)}
              aria-label={`Jump to ${item.label[langKey]}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                isActive ? 'w-6 bg-emerald-400' : 'w-2 bg-white/30 hover:bg-white/50'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
