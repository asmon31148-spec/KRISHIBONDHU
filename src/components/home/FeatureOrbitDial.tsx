'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface FeatureItem {
  id: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: { bn: string; hi: string; en: string };
  copy: { bn: string; hi: string; en: string };
  href: string;
  color: string;
  anim: 'scan' | 'drop' | 'grow' | 'rain' | 'ripple' | 'ring';
}

const FEATURES: FeatureItem[] = [
  {
    id: 'scan',
    icon: Scan,
    label: { bn: 'রোগ শনাক্ত', hi: 'रोग पहचान', en: 'Crop Leaf Doctor' },
    copy: {
      bn: 'পাতার ছবি তুলুন, সরাসরি বৈজ্ঞানিক রোগ নির্ণয় ও অনুমোদিত ওষুধ পান।',
      hi: 'पत्ते की फोटो लें, तुरंत वैज्ञानिक रोग पहचान व स्वीकृत उपचार पाएं।',
      en: 'Take a clear leaf photo for instant certified biological & chemical remedies.',
    },
    href: '/scan',
    color: '#7CC98F',
    anim: 'scan',
  },
  {
    id: 'fertilizer',
    icon: FlaskConical,
    label: { bn: 'সারের হিসাব', hi: 'उर्वरक कैलकुलेटर', en: 'Fertilizer Dosage' },
    copy: {
      bn: 'বিঘা, শতক ও মাটির ধরন অনুযায়ী ইউরিয়া, ডিএপি ও এমওপির সঠিক মাত্রা।',
      hi: 'बीघा, कट्टा और मिट्टी के अनुसार यूरिया, डीएपी व एमओपी की सटीक मात्रा।',
      en: 'Exact scientific dosages of Urea, DAP, and MOP tailored to your land unit.',
    },
    href: '/fertilizer',
    color: '#56B4E9',
    anim: 'drop',
  },
  {
    id: 'mandi',
    icon: TrendingUp,
    label: { bn: 'বাজার দর', hi: 'मंडी भाव', en: 'Mandi Radar' },
    copy: {
      bn: 'সরকারি এগমार्कনেট থেকে আলু, ধান ও সবজির সরাসরি নির্ভরযোগ্য পাইকারি দর।',
      hi: 'सरकारी एगमार्कनेट से आलू, धान व सब्जियों के सीधे थोक भाव।',
      en: 'Live official wholesale mandi prices for potato, paddy, jute & vegetables.',
    },
    href: '/mandi',
    color: '#E8B94A',
    anim: 'grow',
  },
  {
    id: 'weather',
    icon: CloudRain,
    label: { bn: 'আবহাওয়া ও স্প্রে', hi: 'मौसम व छिड़काव', en: 'Weather & Spray' },
    copy: {
      bn: 'বৃষ্টিপাত ও বাতাসের গতি দেখে কীটনাশক স্প্রে ও ফসল কাটার নির্ভুল সময়।',
      hi: 'बारिश और हवा की गति देखकर कीटनाशक छिड़काव का सुरक्षित समय।',
      en: 'Rainfall & wind forecast to identify safe pesticide spraying windows.',
    },
    href: '/weather',
    color: '#7EC2DE',
    anim: 'rain',
  },
  {
    id: 'farms',
    icon: Sprout,
    label: { bn: 'আমার খামার', hi: 'मेरा खेत', en: 'My Farm Plots' },
    copy: {
      bn: 'আপনার জমির খতিয়ান, বর্তমান ফসল এবং মাটির স্বাস্থ্য এক জায়গায় রাখুন।',
      hi: 'अपनी जमीन के प्लॉट, फसल और मिट्टी का स्वास्थ्य एक जगह सुरक्षित रखें।',
      en: 'Track your plots, active crops, and soil test records in one simple hub.',
    },
    href: '/farms',
    color: '#68D391',
    anim: 'ripple',
  },
  {
    id: 'schemes',
    icon: Landmark,
    label: { bn: 'সরকারি প্রকল্প', hi: 'सरकारी योजनाएं', en: 'Govt Schemes' },
    copy: {
      bn: 'কৃষকবন্ধু ও পিএম কিষান অনুদানের যাচাইকৃত আবেদন নির্দেশিকা।',
      hi: 'कृषक बंधु व पीएम किसान अनुदान की सत्यापित आवेदन गाइड।',
      en: 'Verified application guides for Krishak Bandhu, PM-Kisan & subsidies.',
    },
    href: '/schemes',
    color: '#F6AD55',
    anim: 'ring',
  },
];

// Coordinate geometry for desktop/tablet orbital layout
const SLOTS = [
  { left: 50, top: 37.5, width: 43.48, height: 50 },
  { left: 15.22, top: 61.25, width: 15.65, height: 18 },
  { left: 30.43, top: 75.0, width: 15.65, height: 18 },
  { left: 48.91, top: 82.5, width: 15.65, height: 18 },
  { left: 67.39, top: 76.25, width: 15.65, height: 18 },
  { left: 82.61, top: 62.5, width: 15.65, height: 18 },
];

export default function FeatureOrbitDial() {
  const { language } = useTranslation();
  const langKey = language === 'bn' || language === 'hi' ? language : 'en';

  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-cycle through items when user isn't actively interacting
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % FEATURES.length);
    }, 4200);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  // Slot mapping for desktop orbital dial
  const slotMapping: { [itemIdx: number]: number } = {};
  slotMapping[activeIdx] = 0;
  const others = FEATURES.map((_, i) => i).filter((i) => i !== activeIdx);
  others.forEach((itemIdx, slotIdx) => {
    slotMapping[itemIdx] = slotIdx + 1;
  });

  const activeItem = FEATURES[activeIdx];
  const ActiveIcon = activeItem.icon;

  const handlePrev = () => {
    setIsPaused(true);
    setActiveIdx((prev) => (prev - 1 + FEATURES.length) % FEATURES.length);
  };

  const handleNext = () => {
    setIsPaused(true);
    setActiveIdx((prev) => (prev + 1) % FEATURES.length);
  };

  return (
    <div
      className="relative w-full max-w-[480px] mx-auto select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
    >
      {/* ─────────────────────────────────────────────────────────────
          MOBILE ADAPTIVE STAGE (<640px)
          Thumb-friendly horizontal pill selector & high-clarity card
          ───────────────────────────────────────────────────────────── */}
      <div className="block sm:hidden w-full space-y-3.5">
        {/* Horizontal Scrollable Feature Tabs (min 44px touch targets) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-0.5">
          {FEATURES.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = idx === activeIdx;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setIsPaused(true);
                  setActiveIdx(idx);
                }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer min-h-[44px] ${
                  isSelected
                    ? 'bg-white text-[#0c180e] shadow-md scale-[1.02]'
                    : 'bg-black/35 text-white/80 hover:bg-black/50 border border-white/10'
                }`}
                style={isSelected ? { borderLeft: `3px solid ${item.color}` } : undefined}
                aria-label={`Select ${item.label[langKey]}`}
              >
                <Icon
                  className="w-4 h-4 shrink-0"
                  style={{ color: isSelected ? item.color : '#FFFFFF' }}
                />
                <span className="whitespace-nowrap">{item.label[langKey]}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Active Feature Card */}
        <div
          className="relative overflow-hidden p-5 rounded-2xl bg-[#141E17] border border-white/20 text-center shadow-xl space-y-3 transition-all"
          style={{ borderColor: `${activeItem.color}55` }}
        >
          {/* Top Row with Prev/Next Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Previous feature"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shadow-md"
                style={{ backgroundColor: `${activeItem.color}25`, border: `2px solid ${activeItem.color}` }}
              >
                <ActiveIcon className="w-5 h-5" style={{ color: activeItem.color }} />
              </div>
              <span className="text-base font-extrabold text-white">
                {activeItem.label[langKey]}
              </span>
            </div>

            <button
              onClick={handleNext}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Next feature"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Description */}
          <p className="text-sm text-emerald-50/90 leading-relaxed font-medium px-1">
            {activeItem.copy[langKey]}
          </p>

          {/* Action CTA */}
          <div className="pt-1">
            <Link
              href={activeItem.href}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-extrabold transition-all shadow-md active:scale-[0.98] min-h-[44px]"
              style={{
                backgroundColor: activeItem.color,
                color: '#0A150D',
              }}
            >
              <span>
                {language === 'bn'
                  ? `${activeItem.label.bn} ব্যবহার করুন`
                  : language === 'hi'
                  ? `${activeItem.label.hi} देखें`
                  : `Open ${activeItem.label.en}`}
              </span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </Link>
          </div>

          {/* Dot Indicator */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {FEATURES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setIsPaused(true);
                  setActiveIdx(idx);
                }}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === activeIdx ? 'w-5 bg-white' : 'w-1.5 bg-white/30'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TABLET & DESKTOP ORBITAL STAGE (>=640px)
          Seamless animated multi-bubble orbital system
          ───────────────────────────────────────────────────────────── */}
      <div className="hidden sm:block">
        {/* Orbit Background Circular Guide Line */}
        <div
          className="absolute pointer-events-none rounded-full border border-dashed border-emerald-400/20"
          style={{
            left: '50%',
            top: '55%',
            width: '74%',
            height: '74%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Bubble Stage Area */}
        <div className="relative w-full aspect-[460/370]">
          {FEATURES.map((item, idx) => {
            const slot = SLOTS[slotMapping[idx]];
            const isSlotZero = slotMapping[idx] === 0;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setActiveIdx(idx)}
                aria-label={`Select ${item.label[langKey]}`}
                className="bubble absolute rounded-full flex flex-col items-center justify-center cursor-pointer focus:outline-none"
                style={{
                  left: `${slot.left}%`,
                  top: `${slot.top}%`,
                  width: `${slot.width}%`,
                  height: `${slot.height}%`,
                  transform: 'translate(-50%, -50%)',
                  borderColor: isSlotZero ? item.color : 'rgba(255, 255, 255, 0.22)',
                  borderWidth: isSlotZero ? '2.5px' : '1.5px',
                  boxShadow: isSlotZero
                    ? `0 14px 36px -8px ${item.color}66, 0 0 20px ${item.color}33`
                    : '0 4px 12px rgba(0,0,0,0.25)',
                  backgroundColor: isSlotZero
                    ? 'rgba(12, 24, 14, 0.75)'
                    : 'rgba(255, 255, 255, 0.12)',
                  zIndex: isSlotZero ? 20 : 10,
                }}
              >
                {/* Animated Icon Container */}
                <div
                  className={`relative flex items-center justify-center overflow-hidden rounded-full ${
                    isSlotZero ? `anim-${item.anim}` : ''
                  }`}
                  style={{
                    width: isSlotZero ? '42%' : '52%',
                    aspectRatio: '1 / 1',
                  }}
                >
                  <Icon
                    className="icon-el relative z-10 transition-transform duration-300"
                    style={{
                      color: isSlotZero ? item.color : '#FFFFFF',
                      width: isSlotZero ? '72%' : '60%',
                      height: isSlotZero ? '72%' : '60%',
                    }}
                  />

                  {/* Micro-animations in active slot */}
                  {isSlotZero && item.anim === 'scan' && (
                    <span
                      className="line absolute inset-x-0 h-[22%]"
                      style={{ backgroundColor: `${item.color}66` }}
                    />
                  )}
                  {isSlotZero && item.anim === 'drop' && (
                    <span
                      className="d1 absolute w-1.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  )}
                  {isSlotZero && item.anim === 'rain' && (
                    <>
                      <span className="r1 absolute left-2 w-1 h-2 rounded-full bg-sky-300" />
                      <span className="r2 absolute right-2 w-1 h-2 rounded-full bg-sky-300" />
                    </>
                  )}
                  {isSlotZero && item.anim === 'ripple' && (
                    <span
                      className="ring1 absolute inset-0 rounded-full border-2"
                      style={{ borderColor: item.color }}
                    />
                  )}
                  {isSlotZero && item.anim === 'ring' && (
                    <span
                      className="ring1 absolute inset-0 rounded-full border-2"
                      style={{ borderColor: item.color }}
                    />
                  )}
                </div>

                {/* Title inside bubble */}
                {isSlotZero ? (
                  <span
                    className="font-bold text-center leading-tight mt-1.5 px-1 tracking-tight"
                    style={{
                      color: '#FFFFFF',
                      fontSize: 'clamp(13px, 2.8vw, 16px)',
                      textShadow: '0 2px 4px rgba(0,0,0,0.6)',
                    }}
                  >
                    {item.label[langKey]}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Active Feature Description & Direct Launch Card (Tablet/Desktop) */}
        <div
          key={`caption-${activeItem.id}`}
          className="caption-in mt-2 p-4 sm:p-5 rounded-2xl bg-[#141E17] border border-white/20 text-center shadow-lg space-y-3"
        >
          <p className="text-white text-sm sm:text-base font-medium leading-relaxed drop-shadow-sm">
            {activeItem.copy[langKey]}
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link
              href={activeItem.href}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-extrabold transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] min-h-[44px]"
              style={{
                backgroundColor: activeItem.color,
                color: '#0A150D',
              }}
            >
              <span>
                {language === 'bn'
                  ? `${activeItem.label.bn} ব্যবহার করুন`
                  : language === 'hi'
                  ? `${activeItem.label.hi} देखें`
                  : `Open ${activeItem.label.en}`}
              </span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </Link>
          </div>

          {/* Farmer Trust Reassurance Line */}
          <p className="text-xs text-emerald-200/80 pt-0.5 font-normal tracking-wide">
            {language === 'bn'
              ? '✓ সরকারি সাহায্য ও বৈজ্ঞানিক তথ্য আপনার সাথে সবসময়'
              : language === 'hi'
              ? '✓ सरकारी सहायता और वैज्ञानिक जानकारी हमेशा आपके साथ'
              : '✓ Verified scientific guidance & government data always by your side'}
          </p>
        </div>
      </div>
    </div>
  );
}
