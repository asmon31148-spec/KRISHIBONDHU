'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  Sprout,
  Plus,
  Minus,
  ShieldCheck,
  CheckCircle2,
  TrendingDown,
  Clock,
  Search,
  CloudRain,
  Sun,
  AlertTriangle,
  Sparkles,
  Leaf,
  ChevronDown,
  ChevronUp,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import {
  CROP_BASELINES,
  calculateFertilizerDosage,
  CropCategory,
  CropFertilizerBaseline,
  FertilizerStrategy,
  SoilTestOptions,
  CalculationResult,
} from '@/lib/agronomy/fertilizer';
import { WEST_BENGAL_DISTRICTS, reverseGeocodeGPS } from '@/lib/location/india';

const CATEGORIES: { id: 'all' | CropCategory | 'custom'; label_en: string; label_bn: string; count: number }[] = [
  { id: 'all', label_en: 'All Crops', label_bn: 'সকল ফসল', count: Object.keys(CROP_BASELINES).length },
  { id: 'cereals', label_en: 'Cereals & Millets', label_bn: 'দানাশস্য (ধান, গম, ভুট্টা)', count: 5 },
  { id: 'vegetables', label_en: 'Vegetables', label_bn: 'শাকসবজি (আলু, বেগুন, টমেটো...)', count: 11 },
  { id: 'oilseeds_cash', label_en: 'Oilseeds & Cash', label_bn: 'তৈলবীজ ও অর্থকরী (সরিষা, পাট, আখ)', count: 6 },
  { id: 'pulses', label_en: 'Pulses & Legumes', label_bn: 'ডালজাতীয় (মসুর, ছোলা, মুগ)', count: 5 },
  { id: 'spices', label_en: 'Spices & Plantations', label_bn: 'মশলা ও বাণিজ্যিক (আদা, হলুদ, পান)', count: 3 },
  { id: 'custom', label_en: 'Custom / Other Crop', label_bn: 'অন্যান্য / নতুন ফসল', count: 1 },
];

export default function FertilizerCalculatorPage() {
  const { language } = useTranslation();

  // Search & Category Filters
  const [activeCategory, setActiveCategory] = useState<'all' | CropCategory | 'custom'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Crop state
  const [selectedCropId, setSelectedCropId] = useState<string>('potato');
  const [customCropName, setCustomCropName] = useState<string>('');
  const [customBaseline, setCustomBaseline] = useState<CropFertilizerBaseline | null>(null);
  const [isAnalyzingCustom, setIsAnalyzingCustom] = useState<boolean>(false);

  // Land Dimensions
  const [bigha, setBigha] = useState<number>(2);
  const [katha, setKatha] = useState<number>(0);
  const [strategy, setStrategy] = useState<FertilizerStrategy>('single');

  // Soil Health Card & Field Adjustments (STCR)
  const [showSoilOptions, setShowSoilOptions] = useState<boolean>(false);
  const [soilNStatus, setSoilNStatus] = useState<'low' | 'medium' | 'high'>('medium');
  const [soilPStatus, setSoilPStatus] = useState<'low' | 'medium' | 'high'>('medium');
  const [soilKStatus, setSoilKStatus] = useState<'low' | 'medium' | 'high'>('medium');
  const [soilTexture, setSoilTexture] = useState<'alluvial_clay' | 'loam' | 'sandy_laterite' | 'coastal_saline'>('loam');
  const [fymAppliedTonsPerBigha, setFymAppliedTonsPerBigha] = useState<number>(0);

  // Location & Weather Advisory
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Hooghly');
  const [weatherAlert, setWeatherAlert] = useState<{
    temperature: number;
    rainExpectedNext48h: boolean;
    rainProbability: number;
    leachingRiskWarning: string | null;
  } | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);

  const handleDetectGPS = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const geo = await reverseGeocodeGPS(lat, lon);
          if (geo.district) {
            setSelectedDistrict(geo.district);
            if (geo.agroZone === 'red_laterite') {
              setSoilTexture('sandy_laterite');
            } else if (geo.agroZone === 'coastal_saline') {
              setSoilTexture('coastal_saline');
            }
          }
        } catch (err) {
          console.warn('GPS geocode notice:', err);
        } finally {
          setIsDetectingLocation(false);
        }
      },
      () => {
        setIsDetectingLocation(false);
      },
      { timeout: 7000 }
    );
  }, []);

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

  // Filtered crops list
  const filteredCrops = useMemo(() => {
    return Object.values(CROP_BASELINES).filter((crop) => {
      // Category match
      if (activeCategory !== 'all' && crop.category !== activeCategory) {
        return false;
      }
      // Search query match (searches English, Bengali, Hindi names, and IDs)
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        return (
          crop.name_en.toLowerCase().includes(q) ||
          crop.name_bn.toLowerCase().includes(q) ||
          crop.name_hi.toLowerCase().includes(q) ||
          crop.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeCategory, searchQuery]);

  // Dynamic Live Calculation
  const calculationResult: CalculationResult = useMemo(() => {
    const soilOptions: SoilTestOptions = {
      soilNStatus,
      soilPStatus,
      soilKStatus,
      soilTexture,
      fymAppliedTonsPerBigha,
      customBaseline: customBaseline || undefined,
    };

    return calculateFertilizerDosage(
      customBaseline ? customBaseline.id : selectedCropId,
      bigha,
      katha,
      strategy,
      soilOptions
    );
  }, [selectedCropId, customBaseline, bigha, katha, strategy, soilNStatus, soilPStatus, soilKStatus, soilTexture, fymAppliedTonsPerBigha]);

  // Fetch hyper-local weather advisory for this district
  const checkDistrictWeather = useCallback(async (districtName: string) => {
    setIsLoadingWeather(true);
    try {
      const dist = WEST_BENGAL_DISTRICTS.find((d) => d.name.toLowerCase() === districtName.toLowerCase()) || WEST_BENGAL_DISTRICTS[2];
      const res = await fetch(`/api/weather?lat=${dist.lat}&lon=${dist.lon}&location=${encodeURIComponent(dist.name)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.current) {
          const daily = json.data.daily || [];
          const rainNext48h = daily.slice(0, 2).reduce((sum: number, d: any) => sum + (d.precipitationSum || 0), 0);
          const maxProb = Math.max(...daily.slice(0, 2).map((d: any) => d.precipitationProbability || 0));

          let warning: string | null = null;
          if (rainNext48h > 5 || maxProb > 55) {
            warning =
              language === 'bn'
                ? 'আবহাওয়া সতর্কতা: আগামী ২৪-৪৮ ঘণ্টায় বৃষ্টির সম্ভাবনা রয়েছে। জমিতে ইউরিয়ার চাপান প্রয়োগ কয়েকদিন পিছিয়ে দিন যাতে সার ধুয়ে নষ্ট না হয়।'
                : 'Weather Precaution: Rainfall is forecast within 48h. Postpone top-dressing Urea to avoid leaching and runoff losses.';
          } else if (json.data.current.temperature > 35) {
            warning =
              language === 'bn'
                ? 'তীব্র রোদ সতর্কতা: প্রখর রোদে ইউরিয়া ছড়াবেন না। সকাল ৮টার আগে বা বিকেল ৪টার পর সার প্রয়োগ করুন।'
                : 'High Heat Alert: Do not broadcast urea under strong midday sun to prevent ammonia volatilization. Apply early morning.';
          }

          setWeatherAlert({
            temperature: json.data.current.temperature,
            rainExpectedNext48h: rainNext48h > 3,
            rainProbability: maxProb,
            leachingRiskWarning: warning,
          });
        }
      }
    } catch {
      // Non-blocking
    } finally {
      setIsLoadingWeather(false);
    }
  }, [language]);

  useEffect(() => {
    checkDistrictWeather(selectedDistrict);
  }, [selectedDistrict, checkDistrictWeather]);

  // Analyze Custom Crop via AI Agronomist API
  const handleAnalyzeCustomCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCropName.trim()) return;

    setIsAnalyzingCustom(true);
    try {
      const res = await fetch('/api/fertilizer/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customCropName: customCropName.trim(),
          bigha,
          katha,
          strategy,
          soilNStatus,
          soilPStatus,
          soilKStatus,
          soilTexture,
          fymAppliedTonsPerBigha,
          district: selectedDistrict,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.baseline) {
          setCustomBaseline(data.baseline);
        }
      }
    } catch (err) {
      console.warn('Custom crop analyze failed:', err);
    } finally {
      setIsAnalyzingCustom(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full text-left">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cream-50 via-white to-emerald-50/50 border border-cream-300 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="emerald" size="sm" className="shadow-2xs">
                ICAR & BCKV Validated
              </Badge>
              <span className="text-xs text-brand-dark/70 font-semibold">• Bengal Package of Practices</span>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-md">
                30+ Crops & Real Field Physics
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
              {language === 'bn'
                ? 'বিজ্ঞানভিত্তিক সার ক্যালকুলেটর ও পুষ্টিবিজ্ঞান'
                : language === 'hi'
                ? 'वैज्ञानिक उर्वरक मात्रा व पोषण कैलकुलेटर'
                : 'Scientific Fertilizer Dosage & Crop Nutrition Calculator'}
            </h1>
            <p className="text-xs sm:text-sm text-brand-dark/75 max-w-2xl">
              {language === 'bn'
                ? 'বিধানচন্দ্র কৃষি বিশ্ববিদ্যালয় (BCKV) ও আইসিএআর অনুমোদিত সারের মাত্রা। মাটির গুণাগুণ (STCR), জৈব সারের সুবিধা এবং বৃষ্টিপাতের পূর্বাভাস মিলিয়ে সঠিক সারের হিসাব করুন যাতে এক পয়সাও অপচয় না হয়।'
                : 'Exact ICAR & BCKV nutrient recommendations tailored with Soil Test Crop Response (STCR), Organic FYM deductions, and live weather leaching alerts so you never over-spend on dealer chemicals.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/yield">
              <Button variant="secondary" size="sm" className="font-bold">
                {language === 'bn' ? 'ফলন ও লাভ হিসাব' : 'Yield & Profit Calc'}
              </Button>
            </Link>
            <Link href="/mandi">
              <Button variant="secondary" size="sm" className="font-bold">
                {language === 'bn' ? 'মান্ডি দর দেখুন' : 'Check Mandi Rates'}
              </Button>
            </Link>
          </div>
        </div>

        {/* Live Weather & Grounding Strip */}
        <div className="mt-5 pt-3 border-t border-cream-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-brand-dark/75">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 font-bold text-brand-forest">
              <MapPin className="w-3.5 h-3.5 text-brand-forest" />
              <span>District:</span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-white border border-cream-300 rounded-lg px-2 py-0.5 text-xs font-bold text-brand-dark cursor-pointer focus:ring-1 focus:ring-brand-forest"
              >
                {WEST_BENGAL_DISTRICTS.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={isDetectingLocation}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-brand-forest font-bold text-[11px] transition-colors cursor-pointer"
                title="Detect your district via browser GPS"
              >
                {isDetectingLocation ? (
                  <RefreshCw className="w-3 h-3 animate-spin text-brand-forest" />
                ) : (
                  <MapPin className="w-3 h-3 text-brand-forest" />
                )}
                <span>{isDetectingLocation ? 'Locating...' : 'Auto-Detect GPS'}</span>
              </button>
              {isLoadingWeather && <RefreshCw className="w-3 h-3 text-brand-forest animate-spin" />}
            </div>

            {weatherAlert && (
              <div className="flex items-center gap-1.5 text-brand-dark/80 bg-white/80 px-2.5 py-0.5 rounded-lg border border-cream-200">
                {weatherAlert.rainExpectedNext48h ? (
                  <CloudRain className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span>
                  {weatherAlert.temperature}°C • {weatherAlert.rainProbability}% Rain Prob
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span className="font-semibold text-emerald-900">
              {language === 'bn' ? '১ বিঘা = ২০ কাঠা = ০.১৩৩৮ হেক্টর' : '1 Bigha = 20 Katha = 0.1338 Hectares'}
            </span>
          </div>
        </div>

        {/* Weather Precaution Banner if rain or extreme heat */}
        {weatherAlert?.leachingRiskWarning && (
          <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-2.5 text-xs text-amber-950 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{weatherAlert.leachingRiskWarning}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Crop Selection with Categories & Search */}
          <Card>
            <CardHeader className="pb-3 border-b border-cream-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-brand-forest text-white flex items-center justify-center text-xs">
                    1
                  </span>
                  <span>{language === 'bn' ? 'ফসল নির্বাচন করুন (৩০+ অনুমোদিত ফসল)' : 'Step 1: Choose Your Crop (30+ Verified Crops)'}</span>
                </CardTitle>

                {/* Instant Crop Search */}
                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-dark/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={language === 'bn' ? 'ফসলের নাম খুঁজুন (যেমন আলু, সরিষা)...' : 'Search crop (e.g. Potato, Rice, Mustard)...'}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-cream-50 border border-cream-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-forest text-brand-dark placeholder:text-brand-dark/40"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-brand-dark/50 hover:text-brand-dark"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-2 scrollbar-none pb-1">
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        if (cat.id === 'custom') setCustomBaseline(null);
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-brand-forest text-white shadow-2xs'
                          : 'bg-cream-100/80 hover:bg-cream-200 text-brand-dark/75'
                      }`}
                    >
                      {language === 'bn' ? cat.label_bn : cat.label_en}
                    </button>
                  );
                })}
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              {activeCategory === 'custom' ? (
                /* Custom Crop Input with AI Agronomist */
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-extrabold text-brand-dark">
                        {language === 'bn' ? 'যেকোনো নতুন বা আঞ্চলিক ফসল বিশ্লেষণ' : 'Live Agronomic Analysis for Any Crop / Variety'}
                      </h4>
                      <p className="text-xs text-brand-dark/70 mt-0.5 leading-relaxed">
                        {language === 'bn'
                          ? 'যদি আপনার ফসল তালিকায় না থাকে (যেমন ড্রাগন ফ্রুট, ক্যাপসিকাম, স্ট্রবেরি, গাঁদা ফুল বা অন্য কোনো জাত), নাম লিখুন। আমাদের এআই কৃষি বিজ্ঞানী BCKV নিয়মাবলী অনুসারে পুষ্টিমাত্রা হিসাব করবে।'
                          : 'Type any unlisted variety, commercial fruit, or plantation crop. Our AI agronomist retrieves verified ICAR nutritional schedules dynamically.'}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleAnalyzeCustomCrop} className="flex flex-col sm:flex-row gap-2">
                    <Input
                      value={customCropName}
                      onChange={(e) => setCustomCropName(e.target.value)}
                      placeholder={language === 'bn' ? 'যেমন: ক্যাপসিকাম, ড্রাগন ফল, পেঁপে, গ্ল্যাডিওলাস...' : 'e.g. Capsicum, Dragon Fruit, Papaya, Stevia, Marigold...'}
                      className="text-xs bg-white"
                      disabled={isAnalyzingCustom}
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={isAnalyzingCustom || !customCropName.trim()}
                      leftIcon={isAnalyzingCustom ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      className="shrink-0 font-bold"
                    >
                      {isAnalyzingCustom ? (language === 'bn' ? 'বিশ্লেষণ হচ্ছে...' : 'Analyzing...') : (language === 'bn' ? 'পুষ্টিমাত্রা হিসাব করুন' : 'Analyze Crop')}
                    </Button>
                  </form>

                  {customBaseline && (
                    <div className="p-3 rounded-xl bg-white border border-emerald-200 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-brand-dark block">{customBaseline.name_en}</span>
                        <span className="text-[11px] text-brand-dark/70">
                          Recommended N:P:K = {customBaseline.n_kg_ha}:{customBaseline.p_kg_ha}:{customBaseline.k_kg_ha} kg/ha
                        </span>
                      </div>
                      <Badge variant="emerald" size="sm">
                        Analyzed & Loaded
                      </Badge>
                    </div>
                  )}
                </div>
              ) : (
                /* Standard 30+ Crops Grid */
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {filteredCrops.map((c) => {
                    const isSelected = !customBaseline && selectedCropId === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedCropId(c.id);
                          setCustomBaseline(null);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[92px] ${
                          isSelected
                            ? 'border-brand-forest bg-brand-forest/5 ring-2 ring-brand-forest shadow-xs'
                            : 'border-cream-200 bg-white hover:border-brand-leaf/40'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                            <Sprout className="w-3.5 h-3.5" />
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-forest" />}
                        </div>
                        <div className="mt-2">
                          <h4 className="text-xs font-bold text-brand-dark leading-snug line-clamp-1">
                            {language === 'bn' ? c.name_bn : language === 'hi' ? c.name_hi : c.name_en}
                          </h4>
                          <span className="text-[10px] text-brand-dark/60 font-semibold block mt-0.5">
                            N:P:K {c.n_kg_ha}:{c.p_kg_ha}:{c.k_kg_ha} kg/ha
                          </span>
                        </div>
                      </button>
                    );
                  })}
                  {filteredCrops.length === 0 && (
                    <div className="col-span-full py-8 text-center text-xs text-brand-dark/60">
                      No matching crops found. Try switching categories or type in &quot;Custom / Other Crop&quot;.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Land Size (Bigha & Katha Steppers) */}
          <Card>
            <CardHeader className="pb-3 border-b border-cream-200">
              <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-forest text-white flex items-center justify-center text-xs">
                  2
                </span>
                <span>
                  {language === 'bn'
                    ? 'জমির পরিমাণ লিখুন (বিঘা ও কাঠা)'
                    : 'Step 2: Enter Cultivation Land Area'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
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
                      className="w-11 h-11 rounded-xl bg-white border border-cream-300 text-brand-dark hover:bg-cream-100 flex items-center justify-center text-lg font-bold disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-2xl sm:text-3xl font-black text-brand-forest">
                      {bigha}
                    </span>
                    <button
                      onClick={() => handleBighaChange(1)}
                      className="w-11 h-11 rounded-xl bg-white border border-cream-300 text-brand-dark hover:bg-cream-100 flex items-center justify-center text-lg font-bold transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
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
                      className="w-11 h-11 rounded-xl bg-white border border-cream-300 text-brand-dark hover:bg-cream-100 flex items-center justify-center text-lg font-bold disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-2xl sm:text-3xl font-black text-brand-forest">
                      {katha}
                    </span>
                    <button
                      onClick={() => handleKathaChange(1)}
                      className="w-11 h-11 rounded-xl bg-white border border-cream-300 text-brand-dark hover:bg-cream-100 flex items-center justify-center text-lg font-bold transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Conversion details indicator */}
              <div className="p-3 rounded-xl bg-cream-50/70 border border-cream-200 text-xs text-brand-dark/75 flex items-center justify-between">
                <span>Total Cultivation Area:</span>
                <span className="font-bold text-brand-forest">
                  {bigha} Bigha {katha > 0 ? `${katha} Katha` : ''} = {calculationResult.total_hectares} Hectares (≈{' '}
                  {Math.round(calculationResult.total_hectares * 2.471 * 100) / 100} Acres)
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Soil Health Card & Field Adjustments (STCR Accordion) */}
          <Card className="border border-cream-200">
            <button
              onClick={() => setShowSoilOptions(!showSoilOptions)}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-cream-50/50 transition-colors rounded-3xl"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <div>
                  <h3 className="text-sm font-bold text-brand-dark">
                    {language === 'bn' ? 'মাটি পরীক্ষা ও জৈব সারের সমন্বয় (STCR)' : 'Step 3: Soil Health Card & Organic Manure Adjustments'}
                  </h3>
                  <p className="text-[11px] text-brand-dark/60">
                    {language === 'bn'
                      ? 'মাটিতে উপস্থিত খাদ্যোপাদান ও গোবর সারের হিসাব দিলে রাসায়নিক সার আরও কমানো যায়'
                      : 'Adjust doses according to soil fertility (N-P-K) and deduct applied organic manure credits'}
                  </p>
                </div>
              </div>
              {showSoilOptions ? <ChevronUp className="w-4 h-4 text-brand-dark/60" /> : <ChevronDown className="w-4 h-4 text-brand-dark/60" />}
            </button>

            {showSoilOptions && (
              <CardContent className="pt-0 pb-5 px-4 sm:px-5 space-y-4 border-t border-cream-100">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                  {/* Soil Available N */}
                  <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
                    <label className="text-[11px] font-bold text-brand-dark block mb-1">
                      Soil Nitrogen (N / জৈব কার্বন)
                    </label>
                    <select
                      value={soilNStatus}
                      onChange={(e) => setSoilNStatus(e.target.value as any)}
                      className="w-full bg-white border border-cream-300 rounded-lg p-1.5 text-xs font-bold text-brand-dark cursor-pointer"
                    >
                      <option value="low">Low (+25% N required)</option>
                      <option value="medium">Medium (Standard 100%)</option>
                      <option value="high">High (-25% N to prevent disease)</option>
                    </select>
                  </div>

                  {/* Soil Available P */}
                  <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
                    <label className="text-[11px] font-bold text-brand-dark block mb-1">
                      Soil Phosphorus (P / ফসফরাস)
                    </label>
                    <select
                      value={soilPStatus}
                      onChange={(e) => setSoilPStatus(e.target.value as any)}
                      className="w-full bg-white border border-cream-300 rounded-lg p-1.5 text-xs font-bold text-brand-dark cursor-pointer"
                    >
                      <option value="low">Low (+25% P required)</option>
                      <option value="medium">Medium (Standard 100%)</option>
                      <option value="high">High (-25% P)</option>
                    </select>
                  </div>

                  {/* Soil Available K */}
                  <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
                    <label className="text-[11px] font-bold text-brand-dark block mb-1">
                      Soil Potassium (K / পটাশ)
                    </label>
                    <select
                      value={soilKStatus}
                      onChange={(e) => setSoilKStatus(e.target.value as any)}
                      className="w-full bg-white border border-cream-300 rounded-lg p-1.5 text-xs font-bold text-brand-dark cursor-pointer"
                    >
                      <option value="low">Low (+25% K required)</option>
                      <option value="medium">Medium (Standard 100%)</option>
                      <option value="high">High (-25% K)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Soil Texture */}
                  <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
                    <label className="text-[11px] font-bold text-brand-dark block mb-1">
                      Soil Texture (মাটির গঠন)
                    </label>
                    <select
                      value={soilTexture}
                      onChange={(e) => setSoilTexture(e.target.value as any)}
                      className="w-full bg-white border border-cream-300 rounded-lg p-1.5 text-xs font-bold text-brand-dark cursor-pointer"
                    >
                      <option value="loam">Loam / দোআঁশ (Balanced)</option>
                      <option value="alluvial_clay">Heavy Alluvial Clay / এঁটেল (High retention)</option>
                      <option value="sandy_laterite">Sandy / Laterite / লাল মাটি (Purulia/Bankura - High leaching)</option>
                      <option value="coastal_saline">Coastal Saline / নোনা মাটি (Sundarbans)</option>
                    </select>
                  </div>

                  {/* FYM Manure Input */}
                  <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
                    <label className="text-[11px] font-bold text-brand-dark block mb-1">
                      Farmyard Manure Applied (গোবর সার - টন/বিঘা)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={fymAppliedTonsPerBigha}
                        onChange={(e) => setFymAppliedTonsPerBigha(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-white border border-cream-300 rounded-lg p-1.5 text-xs font-bold text-brand-dark"
                      />
                      <span className="text-xs text-brand-dark/70 font-bold shrink-0">Tons / Bigha</span>
                    </div>
                  </div>
                </div>

                {fymAppliedTonsPerBigha > 0 && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center justify-between">
                    <span>Organic Nutrient Credit:</span>
                    <span>
                      Deducted {(fymAppliedTonsPerBigha * bigha * 2.5).toFixed(1)} kg N & P equivalent from chemical bags!
                    </span>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Step 4: Fertilizer Formulation Strategy */}
          <Card>
            <CardHeader className="pb-3 border-b border-cream-200">
              <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-forest text-white flex items-center justify-center text-xs">
                  4
                </span>
                <span>
                  {language === 'bn' ? 'সারের ধরণ পছন্দ করুন' : 'Step 4: Choose Commercial Fertilizer Combination'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
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
                    Traditional recommended formulation. SSP provides 12% valuable sulfur and 19% calcium for oil crops, potato, and root vigor.
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
                    DAP supplies 18% Nitrogen and 46% Phosphorus together, automatically reducing urea needs and saving handling labor.
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
                <div>
                  <CardTitle className="text-base font-extrabold text-brand-dark">
                    {language === 'bn' ? 'প্রয়োজনীয় সারের সঠিক পরিমাণ' : 'Total Required Commercial Fertilizers'}
                  </CardTitle>
                  <span className="text-xs text-brand-dark/70 font-semibold block mt-0.5">
                    For {calculationResult.crop_name} ({bigha} Bigha {katha > 0 ? `${katha} Katha` : ''})
                  </span>
                </div>
                <Badge variant="emerald" size="sm">
                  Exact Doses
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
                    <span className="text-[11px] text-brand-dark/60 font-semibold">
                      ≈ {calculationResult.bags.urea_50kg} bags (50kg)
                    </span>
                  </div>
                  <span className="text-xl font-black text-brand-forest">
                    {calculationResult.fertilizers_kg.urea} <span className="text-xs font-semibold text-brand-dark/70">kg</span>
                  </span>
                </div>

                {/* SSP or DAP */}
                <div className="p-3.5 rounded-xl bg-cream-50 border border-cream-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-brand-dark block">
                      {calculationResult.fertilizers_kg.dap_label}
                    </span>
                    <span className="text-[11px] text-brand-dark/60 font-semibold">
                      ≈ {calculationResult.bags.ssp_or_dap_50kg} bags (50kg)
                    </span>
                  </div>
                  <span className="text-xl font-black text-brand-forest">
                    {calculationResult.fertilizers_kg.ssp_or_dap} <span className="text-xs font-semibold text-brand-dark/70">kg</span>
                  </span>
                </div>

                {/* MOP */}
                <div className="p-3.5 rounded-xl bg-cream-50 border border-cream-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-brand-dark block">
                      MOP (পটাশ সার — 60% K₂O)
                    </span>
                    <span className="text-[11px] text-brand-dark/60 font-semibold">
                      ≈ {calculationResult.bags.mop_50kg} bags (50kg)
                    </span>
                  </div>
                  <span className="text-xl font-black text-brand-forest">
                    {calculationResult.fertilizers_kg.mop} <span className="text-xs font-semibold text-brand-dark/70">kg</span>
                  </span>
                </div>
              </div>

              {/* Elemental Balance Pill */}
              <div className="p-3 rounded-xl bg-white border border-cream-200 text-xs flex flex-wrap items-center justify-between gap-2 text-brand-dark/80">
                <span className="font-medium">Net Elemental Demand:</span>
                <span className="font-bold text-brand-forest break-words">
                  N: {calculationResult.required_elemental.n_kg}kg | P: {calculationResult.required_elemental.p_kg}kg | K: {calculationResult.required_elemental.k_kg}kg
                </span>
              </div>

              {/* Farmer Savings Highlight */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-emerald-700" />
                  <div>
                    <span className="text-xs font-bold text-emerald-950 block">
                      {language === 'bn' ? 'আনুমানিক অর্থ সাশ্রয়' : 'Estimated Farmer Savings'}
                    </span>
                    <span className="text-[10px] text-emerald-800">
                      {language === 'bn' ? 'ডিলারের মাত্রাতিরিক্ত সারের অপচয় রোধ' : 'vs unguided dealer over-prescription'}
                    </span>
                  </div>
                </div>
                <span className="text-lg font-black text-emerald-800">
                  ₹{calculationResult.savings_estimate_inr.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Micronutrient & Agronomic Advice Card */}
          {calculationResult.micronutrients_advice && (
            <Card className="border-l-4 border-l-amber-500">
              <CardContent className="p-4 sm:p-5 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <Leaf className="w-4 h-4 text-amber-600" />
                  <span>{language === 'bn' ? 'অণুখাদ্য ও ফসল নিরাপত্তা নির্দেশিকা' : 'Micronutrient & Soil Health Alert'}</span>
                </div>
                <p className="text-xs text-brand-dark/80 leading-relaxed">
                  {language === 'bn'
                    ? calculationResult.micronutrients_advice.bn || calculationResult.micronutrients_advice.en
                    : calculationResult.micronutrients_advice.en}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Split Application Schedule Timeline */}
          <Card>
            <CardHeader className="pb-3 border-b border-cream-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-forest" />
                  <span>{language === 'bn' ? 'কখন কোন সার কতটা প্রয়োগ করবেন?' : 'Split Dose Application Schedule'}</span>
                </CardTitle>
                <span className="text-[11px] text-brand-dark/60 font-semibold">
                  {calculationResult.schedule.length} Splits
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-cream-300">
                {calculationResult.schedule.map((split, idx) => (
                  <div key={idx} className="relative">
                    {/* Circle marker */}
                    <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-brand-forest border-2 border-white flex items-center justify-center shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-brand-dark">
                          {language === 'bn' ? split.stage_bn : split.stage_en}
                        </h4>
                        <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {split.timing}
                        </span>
                      </div>

                      {/* Doses */}
                      <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                        <div className="p-2 rounded-lg bg-cream-50 border border-cream-200 text-center">
                          <span className="text-[10px] text-brand-dark/60 block">Urea</span>
                          <span className="font-extrabold text-brand-forest">{split.urea_kg} kg</span>
                        </div>
                        <div className="p-2 rounded-lg bg-cream-50 border border-cream-200 text-center">
                          <span className="text-[10px] text-brand-dark/60 block line-clamp-1">
                            {strategy === 'single' ? 'SSP' : 'DAP'}
                          </span>
                          <span className="font-extrabold text-brand-forest">{split.ssp_or_dap_kg} kg</span>
                        </div>
                        <div className="p-2 rounded-lg bg-cream-50 border border-cream-200 text-center">
                          <span className="text-[10px] text-brand-dark/60 block">MOP</span>
                          <span className="font-extrabold text-brand-forest">{split.mop_kg} kg</span>
                        </div>
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
