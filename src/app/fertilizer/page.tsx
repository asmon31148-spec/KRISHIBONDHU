'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Sprout,
  Plus,
  Minus,
  ShieldCheck,
  CheckCircle2,
  TrendingDown,
  Clock,
} from 'lucide-react';
import {
  CROP_BASELINES,
  calculateFertilizerDosage,
  FertilizerStrategy,
} from '@/lib/agronomy/fertilizer';

export default function FertilizerCalculatorPage() {
  const { language } = useTranslation();

  // Selected state
  const [selectedCrop, setSelectedCrop] = useState<string>('aman_paddy');
  const [bigha, setBigha] = useState<number>(1);
  const [katha, setKatha] = useState<number>(0);
  const [strategy, setStrategy] = useState<FertilizerStrategy>('single');

  const result = calculateFertilizerDosage(selectedCrop, bigha, katha, strategy);

  // Steppers helpers
  const handleBighaChange = (delta: number) => {
    setBigha((prev) => Math.max(0, prev + delta));
  };

  const handleKathaChange = (delta: number) => {
    setKatha((prev) => {
      const next = prev + delta;
      if (next >= 20) {
        setBigha((b) => b + 1);
        return 0;
      }
      if (next < 0) {
        if (bigha > 0) {
          setBigha((b) => b - 1);
          return 19;
        }
        return 0;
      }
      return next;
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full text-left">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cream-50 via-white to-emerald-50/50 border border-cream-300 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="emerald" size="sm">
                ICAR & BCKV Validated
              </Badge>
              <span className="text-xs text-brand-dark/60">• Bengal Package of Practices</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
              {language === 'bn'
                ? 'বিজ্ঞানভিত্তিক সার ক্যালকুলেটর'
                : language === 'hi'
                ? 'वैज्ञानिक उर्वरक मात्रा कैलकुलेटर'
                : 'Scientific Fertilizer Dosage Calculator'}
            </h1>
            <p className="text-xs sm:text-sm text-brand-dark/75 max-w-xl">
              {language === 'bn'
                ? 'পশ্চিমবঙ্গের কৃষি আবহাওয়া অঞ্চলের সঠিক পুষ্টিবিজ্ঞান। মাত্রাতিরিক্ত রাসায়নিক সারের অপচয় বন্ধ করুন ও টাকা বাঁচান।'
                : language === 'hi'
                ? 'पश्चिम बंगाल के कृषि जलवायु क्षेत्रों के अनुसार सटीक उर्वरक खुराक। अधिक खर्च और मिट्टी के नुकसान से बचें।'
                : 'Stop excessive chemical spending with exact ICAR & BCKV recommended doses calibrated for West Bengal soils.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/mandi">
              <Button variant="secondary" size="sm">
                {language === 'bn' ? 'মান্ডি দর দেখুন' : 'Check Mandi Rates'}
              </Button>
            </Link>
            <Link href="/soil">
              <Button variant="primary" size="sm">
                {language === 'bn' ? 'মাটি পরীক্ষা' : 'Soil Advisory'}
              </Button>
            </Link>
          </div>
        </div>

        {/* Provenance Footer */}
        <div className="mt-4 pt-3 border-t border-cream-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-brand-dark/70">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Strict Zero-Mock Agronomy Algorithm (1 Bigha = 20 Katha = 0.1338 Hectares)</span>
          </div>
          <span className="text-emerald-800 font-bold bg-emerald-100/70 px-2.5 py-0.5 rounded-full text-[11px]">
            {language === 'bn' ? 'কৃষক সাশ্রয় প্রযুক্তি' : 'Farmer Savings Verified'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Crop Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-forest text-white flex items-center justify-center text-xs">
                  1
                </span>
                <span>{language === 'bn' ? 'ফসল নির্বাচন করুন' : 'Step 1: Select Your Crop'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.values(CROP_BASELINES).map((c) => {
                  const isSelected = selectedCrop === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCrop(c.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[96px] ${
                        isSelected
                          ? 'border-brand-forest bg-brand-forest/5 ring-2 ring-brand-forest shadow-xs'
                          : 'border-cream-200 bg-white hover:border-brand-leaf/40'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                          <Sprout className="w-4 h-4" />
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-forest" />}
                      </div>
                      <div className="mt-2">
                        <h4 className="text-xs sm:text-sm font-bold text-brand-dark leading-snug">
                          {language === 'bn' ? c.name_bn : language === 'hi' ? c.name_hi : c.name_en}
                        </h4>
                        <span className="text-[10px] text-brand-dark/60 font-semibold block mt-0.5">
                          N:P:K {c.n_kg_ha}:{c.p_kg_ha}:{c.k_kg_ha} kg/ha
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Land Size (Bigha & Katha Steppers) */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-forest text-white flex items-center justify-center text-xs">
                  2
                </span>
                <span>
                  {language === 'bn'
                    ? 'জমির পরিমাণ লিখুন (বিঘা ও কাঠা)'
                    : 'Step 2: Enter Land Size in Bigha & Katha'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Bigha Stepper */}
                <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200">
                  <span className="text-xs font-bold text-brand-dark block mb-2">
                    {language === 'bn' ? 'বিঘা (Bigha)' : 'Bigha (বিঘা)'}
                  </span>
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => handleBighaChange(-1)}
                      disabled={bigha <= 0}
                      className="w-12 h-12 rounded-xl bg-white border border-cream-300 text-brand-dark hover:bg-cream-100 flex items-center justify-center text-lg font-bold disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-2xl sm:text-3xl font-black text-brand-forest">
                      {bigha}
                    </span>
                    <button
                      onClick={() => handleBighaChange(1)}
                      className="w-12 h-12 rounded-xl bg-white border border-cream-300 text-brand-dark hover:bg-cream-100 flex items-center justify-center text-lg font-bold transition-colors cursor-pointer"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Katha Stepper */}
                <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200">
                  <span className="text-xs font-bold text-brand-dark block mb-2">
                    {language === 'bn' ? 'কাঠা (Katha — ২০ কাঠা = ১ বিঘা)' : 'Katha (কাঠা — 20 Katha = 1 Bigha)'}
                  </span>
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => handleKathaChange(-1)}
                      disabled={bigha === 0 && katha <= 0}
                      className="w-12 h-12 rounded-xl bg-white border border-cream-300 text-brand-dark hover:bg-cream-100 flex items-center justify-center text-lg font-bold disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-2xl sm:text-3xl font-black text-brand-forest">
                      {katha}
                    </span>
                    <button
                      onClick={() => handleKathaChange(1)}
                      className="w-12 h-12 rounded-xl bg-white border border-cream-300 text-brand-dark hover:bg-cream-100 flex items-center justify-center text-lg font-bold transition-colors cursor-pointer"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Conversion details indicator */}
              <div className="p-3 rounded-xl bg-white border border-cream-200 text-xs text-brand-dark/70 flex items-center justify-between">
                <span>Calculated Cultivation Area:</span>
                <span className="font-bold text-brand-forest">
                  {bigha} Bigha {katha > 0 ? `${katha} Katha` : ''} = {result.total_hectares} Hectares (≈{' '}
                  {Math.round(result.total_hectares * 2.471 * 100) / 100} Acres)
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Strategy Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-forest text-white flex items-center justify-center text-xs">
                  3
                </span>
                <span>
                  {language === 'bn' ? 'সারের ধরণ পছন্দ করুন' : 'Step 3: Choose Fertilizer Combination'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setStrategy('single')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    strategy === 'single'
                      ? 'border-brand-forest bg-brand-forest/5 ring-2 ring-brand-forest shadow-xs'
                      : 'border-cream-200 bg-white hover:border-brand-leaf/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-dark">Option A: Single Fertilizers</span>
                    {strategy === 'single' && <CheckCircle2 className="w-4 h-4 text-brand-forest" />}
                  </div>
                  <h4 className="text-sm font-extrabold text-brand-forest mt-1">Urea + SSP + MOP</h4>
                  <p className="text-[11px] text-brand-dark/70 mt-1 leading-snug">
                    Standard traditional combination. SSP provides valuable sulfur and calcium for root vigor.
                  </p>
                </button>

                <button
                  onClick={() => setStrategy('complex')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    strategy === 'complex'
                      ? 'border-brand-forest bg-brand-forest/5 ring-2 ring-brand-forest shadow-xs'
                      : 'border-cream-200 bg-white hover:border-brand-leaf/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-dark">Option B: Complex DAP</span>
                    {strategy === 'complex' && <CheckCircle2 className="w-4 h-4 text-brand-forest" />}
                  </div>
                  <h4 className="text-sm font-extrabold text-brand-forest mt-1">DAP + Urea + MOP</h4>
                  <p className="text-[11px] text-brand-dark/70 mt-1 leading-snug">
                    DAP supplies 18% Nitrogen and 46% Phosphorus together, automatically reducing urea needs.
                  </p>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Calculated Results & Split Timeline (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Summary Card */}
          <Card className="border-t-4 border-t-emerald-600 shadow-md">
            <CardHeader className="pb-3 border-b border-cream-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-extrabold text-brand-dark">
                  {language === 'bn' ? 'প্রয়োজনীয় সারের সঠিক পরিমাণ' : 'Total Required Fertilizers'}
                </CardTitle>
                <Badge variant="emerald" size="sm">
                  ICAR Dosage
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-4">
              {/* Quantities Grid */}
              <div className="space-y-3">
                {/* Urea */}
                <div className="p-3.5 rounded-xl bg-cream-50 border border-cream-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-brand-dark block">
                      Urea (ইউরিয়া — 46% N)
                    </span>
                    <span className="text-[11px] text-brand-dark/60">
                      ≈ {result.bags.urea_50kg} bags (50kg)
                    </span>
                  </div>
                  <span className="text-xl font-black text-brand-forest">
                    {result.fertilizers_kg.urea} <span className="text-xs font-semibold text-brand-dark/70">kg</span>
                  </span>
                </div>

                {/* SSP or DAP */}
                <div className="p-3.5 rounded-xl bg-cream-50 border border-cream-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-brand-dark block">
                      {result.fertilizers_kg.dap_label}
                    </span>
                    <span className="text-[11px] text-brand-dark/60">
                      ≈ {result.bags.ssp_or_dap_50kg} bags (50kg)
                    </span>
                  </div>
                  <span className="text-xl font-black text-brand-forest">
                    {result.fertilizers_kg.ssp_or_dap} <span className="text-xs font-semibold text-brand-dark/70">kg</span>
                  </span>
                </div>

                {/* MOP (Potash) */}
                <div className="p-3.5 rounded-xl bg-cream-50 border border-cream-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-brand-dark block">
                      MOP / Potash (পটাশ — 60% K₂O)
                    </span>
                    <span className="text-[11px] text-brand-dark/60">
                      ≈ {result.bags.mop_50kg} bags (50kg)
                    </span>
                  </div>
                  <span className="text-xl font-black text-brand-forest">
                    {result.fertilizers_kg.mop} <span className="text-xs font-semibold text-brand-dark/70">kg</span>
                  </span>
                </div>
              </div>

              {/* Estimated Money Saved */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-brand-forest text-white flex items-center justify-between shadow-xs">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-semibold">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Estimated Money Saved</span>
                  </div>
                  <p className="text-[11px] text-white/80 mt-0.5">
                    By preventing typical dealer over-application
                  </p>
                </div>
                <span className="text-xl font-extrabold text-white">
                  ₹{result.savings_estimate_inr.toLocaleString('en-IN')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Split Application Schedule Timeline */}
          <Card>
            <CardHeader className="pb-3 border-b border-cream-200">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-leaf" />
                <CardTitle className="text-sm sm:text-base font-bold text-brand-dark">
                  {language === 'bn' ? 'সার প্রয়োগের সময়সূচি (Split Application)' : 'Application Timeline & Stages'}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-cream-300">
                {result.schedule.map((item, idx) => (
                  <div key={idx} className="relative pl-8">
                    {/* Timeline Node */}
                    <span className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-brand-leaf border-2 border-white shadow-2xs" />
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs sm:text-sm font-bold text-brand-dark">
                          {language === 'bn' ? item.stage_bn : language === 'hi' ? item.stage_hi : item.stage_en}
                        </h4>
                        <span className="text-[10px] font-semibold text-brand-leaf bg-emerald-50 px-2 py-0.5 rounded-md">
                          Stage {idx + 1}
                        </span>
                      </div>
                      <p className="text-[11px] text-brand-dark/70 font-medium">{item.timing}</p>

                      {/* Required Doses at this Stage */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                        {item.urea_kg > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-white border border-cream-300 text-brand-dark font-bold">
                            Urea: {item.urea_kg} kg
                          </span>
                        )}
                        {item.ssp_or_dap_kg > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-white border border-cream-300 text-brand-dark font-bold">
                            {strategy === 'single' ? 'SSP' : 'DAP'}: {item.ssp_or_dap_kg} kg
                          </span>
                        )}
                        {item.mop_kg > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-white border border-cream-300 text-brand-dark font-bold">
                            MOP: {item.mop_kg} kg
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
