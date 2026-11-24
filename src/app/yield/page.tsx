'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  TrendingUp,
  CheckCircle2,
  Scale,
  Calendar,
  FileSpreadsheet,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Sparkles,
  MapPin,
  LocateFixed,
  Loader2,
  CloudSun,
} from 'lucide-react';
import {
  CROP_BASELINES,
  YieldPredictionOutput,
  PredictionScenario,
} from '@/lib/yield/engine';
import { LandUnit } from '@/lib/units';
import {
  INDIAN_STATES,
  STATE_DISTRICTS_MAP,
  WEST_BENGAL_DISTRICTS,
  reverseGeocodeGPS,
  AGRO_ZONE_CHARACTERISTICS,
} from '@/lib/location/india';

function YieldPredictionContent() {
  const toast = useToast();
  const searchParams = useSearchParams();
  const queryCropId = searchParams.get('crop_id');

  // Scenario state (Pre-cultivation planning vs In-season tracking)
  const [scenario, setScenario] = useState<PredictionScenario>('pre_cultivation');

  // Dynamic Location State (Strictly Zero Hardcoded Regions)
  const [selectedState, setSelectedState] = useState<string>('West Bengal');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Hooghly');
  const [detectedAgroZone, setDetectedAgroZone] = useState<string>('alluvial_gangetic');
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [locationSource, setLocationSource] = useState<'manual' | 'gps' | 'farm'>('manual');
  const [liveWeatherSummary, setLiveWeatherSummary] = useState<string | null>(null);
  const [liveMandiRate, setLiveMandiRate] = useState<number | null>(null);

  // Level 1: Essential Farmer Inputs (No scientific jargon required)
  const [cropKey, setCropKey] = useState('potato');
  const [variety, setVariety] = useState('');
  const [area, setArea] = useState('2.0');
  const [areaUnit, setAreaUnit] = useState<LandUnit>('bigha');
  const [irrigationType, setIrrigationType] = useState('Shallow Tube Well (STW)');
  const [soilType, setSoilType] = useState('Clay Loam (দোআঁশ মাটি)');
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'needs_attention' | 'diseased'>('healthy');
  const [plantingDate, setPlantingDate] = useState(new Date().toISOString().split('T')[0]);

  // Level 3: Optional Soil Health Card / Lab Test (Strictly zero fabricated defaults!)
  const [hasSoilReport, setHasSoilReport] = useState<boolean>(false);
  const [nitrogen, setNitrogen] = useState<string>(''); // Kept empty unless farmer provides it
  const [phosphorus, setPhosphorus] = useState<string>(''); // Kept empty
  const [ph, setPh] = useState<string>(''); // Kept empty

  // UI state
  const [showCostBreakdown, setShowCostBreakdown] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<YieldPredictionOutput | null>(null);
  const loadedCropRef = useRef<string | null>(null);

  // Available districts for the currently selected state
  const availableDistricts =
    STATE_DISTRICTS_MAP[selectedState] ||
    (selectedState === 'West Bengal' ? WEST_BENGAL_DISTRICTS.map((d) => d.name) : ['Central District']);

  // Update agroZone when district changes
  useEffect(() => {
    if (selectedState === 'West Bengal') {
      const match = WEST_BENGAL_DISTRICTS.find(
        (d) => d.name.toLowerCase() === selectedDistrict.toLowerCase()
      );
      if (match?.agroZone) {
        setDetectedAgroZone(match.agroZone);
      }
    }
  }, [selectedState, selectedDistrict]);

  // 1-Tap Browser GPS Location Detection
  const handleDetectGPS = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const geo = await reverseGeocodeGPS(lat, lon);

          if (geo.state) setSelectedState(geo.state);
          if (geo.district) setSelectedDistrict(geo.district);
          if (geo.agroZone) setDetectedAgroZone(geo.agroZone);
          setLocationSource('gps');

          toast.success(`GPS Location Verified: ${geo.district}, ${geo.state}`);

          // Auto-fetch hyper-local weather for these GPS coordinates
          try {
            const wRes = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
            if (wRes.ok) {
              const wData = await wRes.json();
              if (wData.data?.current) {
                setLiveWeatherSummary(
                  `${wData.data.current.temperature}°C, ${wData.data.current.weather_description || 'Clear Sky'}`
                );
              }
            }
          } catch {
            // Optional enhancement
          }

          // Auto-fetch live APMC Mandi rates for this district
          try {
            const mRes = await fetch(
              `/api/mandi/prices?district=${encodeURIComponent(geo.district)}&commodity=${encodeURIComponent(cropKey)}`
            );
            if (mRes.ok) {
              const mData = await mRes.json();
              if (mData.records && mData.records.length > 0) {
                setLiveMandiRate(mData.records[0].modal_price);
              }
            }
          } catch {
            // Optional enhancement
          }
        } catch {
          toast.error('Could not resolve GPS location. Please select your district from the dropdown.');
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        setIsDetectingLocation(false);
        toast.error(`GPS access unavailable (${err.message}). Select your state and district from the lists.`);
      },
      { timeout: 7000, enableHighAccuracy: false }
    );
  }, [cropKey, toast]);

  // Auto-populate if navigated from My Farms / Crops
  const loadExistingCrop = useCallback(
    async (cropId: string) => {
      const supabase = createClient();
      if (!supabase) return;

      try {
        const { data } = await supabase
          .from('crops')
          .select('*, farms(name, location_name, soil_type)')
          .eq('id', cropId)
          .single();

        if (data) {
          setScenario('in_season'); // Navigated from an active crop, switch to in-season
          const cName = data.name.toLowerCase();
          if (cName.includes('potato') || cName.includes('আলু')) setCropKey('potato');
          else if (cName.includes('aman') || cName.includes('আমন')) setCropKey('rice_aman');
          else if (cName.includes('boro') || cName.includes('বোরো')) setCropKey('rice_boro');
          else if (cName.includes('jute') || cName.includes('পাট')) setCropKey('jute');
          else if (cName.includes('mustard') || cName.includes('সরিষা') || cName.includes('সর্ষে')) setCropKey('mustard');
          else if (cName.includes('brinjal') || cName.includes('বেগুন')) setCropKey('brinjal');
          else if (cName.includes('tomato') || cName.includes('টমেটো')) setCropKey('tomato');
          else if (cName.includes('wheat') || cName.includes('গম')) setCropKey('wheat');

          if (data.variety) setVariety(data.variety);
          if (data.area) setArea(String(data.area));
          if (data.area_unit) setAreaUnit(data.area_unit as LandUnit);
          if (data.health_status) setHealthStatus(data.health_status);
          if (data.irrigation_type) setIrrigationType(data.irrigation_type);
          if (data.planting_date) setPlantingDate(data.planting_date);

          // Extract farm location if linked
          if (data.farms?.location_name) {
            const locName = data.farms.location_name;
            const matched = WEST_BENGAL_DISTRICTS.find((d) =>
              locName.toLowerCase().includes(d.name.toLowerCase())
            );
            if (matched) {
              setSelectedDistrict(matched.name);
              setSelectedState('West Bengal');
              setLocationSource('farm');
            }
          }

          toast.info(`Loaded field profile for ${data.name}.`);
        }
      } catch (err) {
        console.warn('Error loading crop from query param:', err);
      }
    },
    [toast]
  );

  useEffect(() => {
    if (queryCropId && loadedCropRef.current !== queryCropId) {
      loadedCropRef.current = queryCropId;
      loadExistingCrop(queryCropId);
    }
  }, [loadExistingCrop, queryCropId]);

  // Auto-calculate initial benchmark projection on mount so the user never sees an empty void
  useEffect(() => {
    let isMounted = true;
    async function loadInitialEstimate() {
      try {
        const payload = {
          scenario: 'pre_cultivation',
          cropKey: 'potato',
          state: 'West Bengal',
          district: 'Hooghly',
          agroZone: 'alluvial_gangetic',
          area: 2.0,
          areaUnit: 'bigha' as LandUnit,
          irrigationType: 'Shallow Tube Well (STW)',
          soilType: 'Clay Loam (দোআঁশ মাটি)',
        };
        const res = await fetch('/api/yield/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (isMounted && data.success && data.prediction) {
          setResult(data.prediction);
        }
      } catch {
        // Soft fallback
      }
    }
    loadInitialEstimate();
    return () => {
      isMounted = false;
    };
  }, []);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!area || parseFloat(area) <= 0) {
      toast.error('Please enter a valid land area.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        scenario,
        cropKey,
        state: selectedState,
        district: selectedDistrict,
        agroZone: detectedAgroZone,
        variety: variety.trim() || undefined,
        area: parseFloat(area),
        areaUnit,
        irrigationType,
        soilType,
        healthStatus: scenario === 'in_season' ? healthStatus : undefined,
        plantingDate: scenario === 'in_season' ? plantingDate : undefined,
        hasSoilReport,
        // Only include numerical lab parameters if farmer explicitly provided them
        nitrogenKgHa: hasSoilReport && nitrogen.trim() ? parseFloat(nitrogen) : undefined,
        phosphorusKgHa: hasSoilReport && phosphorus.trim() ? parseFloat(phosphorus) : undefined,
        ph: hasSoilReport && ph.trim() ? parseFloat(ph) : undefined,
      };

      const res = await fetch('/api/yield/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Prediction calculation failed');
      }

      setResult(data.prediction);
      toast.success(
        scenario === 'pre_cultivation'
          ? `Pre-sowing budget & production estimate calculated for ${selectedDistrict}.`
          : `In-season harvest projection updated for ${selectedDistrict}.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error generating estimate';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const currentZoneData = AGRO_ZONE_CHARACTERISTICS[detectedAgroZone];

  return (
    <div className="space-y-6 w-full text-left">
      {/* Page Title & Methodology Banner */}
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="forest" size="sm" className="font-bold shadow-2xs">
            Empirical Agronomy
          </Badge>
          <span className="text-xs text-brand-dark/65 font-medium">
            • GPS Calibrated
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#143224] dark:text-white mt-1 tracking-tight">
          Crop Yield Prediction & Economics
        </h1>
        <p className="text-xs sm:text-sm text-brand-dark/75 dark:text-white/60 mt-1 max-w-3xl leading-relaxed">
          Estimate expected harvest tonnage, cultivation expenses, and market revenue ranges calibrated to your district.
        </p>
      </div>

      {/* Sleek Scenario Selector Tabs (Scenario A vs Scenario B) */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-cream-100 dark:bg-white/10 border border-cream-300 dark:border-white/15 max-w-xl">
        <button
          type="button"
          onClick={() => setScenario('pre_cultivation')}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            scenario === 'pre_cultivation'
              ? 'bg-[#143224] text-white shadow-xs'
              : 'text-brand-dark/70 dark:text-white/70 hover:text-brand-dark dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#D9822B]" />
          <span>Pre-Sowing Planning</span>
        </button>

        <button
          type="button"
          onClick={() => setScenario('in_season')}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            scenario === 'in_season'
              ? 'bg-[#143224] text-white shadow-xs'
              : 'text-brand-dark/70 dark:text-white/70 hover:text-brand-dark dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-[#D9822B]" />
          <span>In-Season Tracking</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* LEFT COLUMN: 3-LEVEL INPUT FORM (5 COLS) */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-cream-300 shadow-xs">
            <CardHeader className="pb-3 border-b border-cream-200 bg-cream-50/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-base font-bold text-brand-dark flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-brand-forest" />
                  <span>
                    {scenario === 'pre_cultivation'
                      ? 'Pre-Cultivation Parameters'
                      : 'In-Season Field Parameters'}
                  </span>
                </CardTitle>
                <Badge variant="outline" size="sm" className="font-semibold text-[10px]">
                  {scenario === 'pre_cultivation' ? 'Scenario A' : 'Scenario B'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5">
              <form onSubmit={handlePredict} className="space-y-4">
                {/* ---------------- SECTION: FARM LOCATION & GPS ---------------- */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cream-100/90 to-emerald-50/40 border border-cream-300/90 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-extrabold text-brand-forest uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-leaf" />
                      <span>Farm Location & Geography</span>
                    </span>

                    <button
                      type="button"
                      onClick={handleDetectGPS}
                      disabled={isDetectingLocation}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-cream-300 text-brand-forest text-[11px] font-bold hover:border-brand-leaf hover:bg-emerald-50 active:scale-95 transition-all shadow-2xs cursor-pointer disabled:opacity-60"
                      title="Auto-detect current GPS location"
                    >
                      {isDetectingLocation ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin text-brand-forest" />
                          <span>Locating...</span>
                        </>
                      ) : (
                        <>
                          <LocateFixed className="w-3 h-3 text-brand-leaf" />
                          <span>Auto-Detect GPS</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {/* State Selector */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-brand-dark/80">
                        State (রাজ্য)
                      </label>
                      <select
                        value={selectedState}
                        onChange={(e) => {
                          const newState = e.target.value;
                          setSelectedState(newState);
                          const districts = STATE_DISTRICTS_MAP[newState] || [];
                          if (districts.length > 0) {
                            setSelectedDistrict(districts[0]);
                          }
                          setLocationSource('manual');
                        }}
                        className="block w-full rounded-xl border border-cream-300 bg-white px-2.5 py-2 text-xs text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[40px]"
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* District Selector */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-brand-dark/80">
                        District (জেলা)
                      </label>
                      <select
                        value={selectedDistrict}
                        onChange={(e) => {
                          setSelectedDistrict(e.target.value);
                          setLocationSource('manual');
                        }}
                        className="block w-full rounded-xl border border-cream-300 bg-white px-2.5 py-2 text-xs text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[40px]"
                      >
                        {availableDistricts.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Active Agro-Zone & Live Indicators Pill */}
                  <div className="space-y-1 pt-1 text-[11px] text-brand-dark/80">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-950 font-bold">
                        📍 {selectedDistrict}, {selectedState}
                      </span>
                      {locationSource === 'gps' && (
                        <span className="px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-900 font-bold text-[10px]">
                          GPS Verified
                        </span>
                      )}
                      {currentZoneData && (
                        <span className="text-brand-dark/70 font-medium">
                          • {currentZoneData.name}
                        </span>
                      )}
                    </div>

                    {liveWeatherSummary && (
                      <div className="flex items-center gap-1 text-[10px] text-brand-forest font-semibold pt-0.5">
                        <CloudSun className="w-3.5 h-3.5 text-amber-500" />
                        <span>Live Weather: {liveWeatherSummary}</span>
                      </div>
                    )}
                    {liveMandiRate && (
                      <div className="flex items-center gap-1 text-[10px] text-emerald-800 font-semibold">
                        <IndianRupee className="w-3 h-3 text-emerald-600" />
                        <span>Today&apos;s Local Mandi Rate: ₹{liveMandiRate.toLocaleString('en-IN')}/quintal</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ---------------- LEVEL 1: ESSENTIAL FARMER INPUTS ---------------- */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between pb-1 border-b border-cream-200/80">
                    <span className="text-xs font-extrabold text-brand-forest uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-brand-forest" />
                      Level 1: Crop & Field Fundamentals
                    </span>
                    <span className="text-[10px] text-brand-dark/50 font-medium">Simple & Required</span>
                  </div>

                  {/* Target Crop Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-xs sm:text-sm font-semibold text-brand-dark/90">
                      Target Crop (ফসল নির্বাচন)
                    </label>
                    <select
                      value={cropKey}
                      onChange={(e) => setCropKey(e.target.value)}
                      className="block w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
                    >
                      {Object.entries(CROP_BASELINES).map(([key, val]) => (
                        <option key={key} value={key}>
                          {val.cropName} • [{val.season}] (~{val.avgTonsPerAcre} T/ac)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Seed Variety / Hybrid (Optional) */}
                  <Input
                    label="Seed Variety / Cultivar (Optional)"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    placeholder="e.g. Swarna (MTU-7029) / Kufri Jyoti / B-9"
                  />

                  {/* Cultivated Area & Regional Land Unit */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <Input
                      label="Field Area"
                      type="number"
                      step="0.1"
                      min="0.1"
                      required
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                    />

                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-sm font-semibold text-brand-dark/90">
                        Unit (পরিমাপ একক)
                      </label>
                      <select
                        value={areaUnit}
                        onChange={(e) => setAreaUnit(e.target.value as LandUnit)}
                        className="block w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
                      >
                        <option value="bigha">Bigha (বিঘা ≈ ২০ কাঠা)</option>
                        <option value="katha">Katha (কাঠা)</option>
                        <option value="acres">Acres (একর)</option>
                        <option value="hectares">Hectares (হেক্টর)</option>
                      </select>
                    </div>
                  </div>

                  {/* Irrigation Availability */}
                  <div className="space-y-1.5">
                    <label className="block text-xs sm:text-sm font-semibold text-brand-dark/90">
                      Irrigation Facility (সেচ ব্যবস্থা)
                    </label>
                    <select
                      value={irrigationType}
                      onChange={(e) => setIrrigationType(e.target.value)}
                      className="block w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
                    >
                      <option value="Shallow Tube Well (STW)">Shallow Tube Well (STW / অগভীর নলকূপ)</option>
                      <option value="Deep Tube Well (DTW)">Deep Tube Well (DTW / গভীর নলকূপ)</option>
                      <option value="Drip Irrigation">Drip Irrigation (ড্রিপ সেচ - High Efficiency)</option>
                      <option value="Sprinkler">Sprinkler Irrigation (স্প্রিংকলার সেচ)</option>
                      <option value="Rainfed / Seasonal">Rainfed / Seasonal (বৃষ্টির জলনির্ভর)</option>
                    </select>
                  </div>

                  {/* Soil Texture (Plain visual question, no lab jargon) */}
                  <div className="space-y-1.5">
                    <label className="block text-xs sm:text-sm font-semibold text-brand-dark/90">
                      General Soil Texture (মাটির ধরন)
                    </label>
                    <select
                      value={soilType}
                      onChange={(e) => setSoilType(e.target.value)}
                      className="block w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
                    >
                      <option value="Clay Loam (দোআঁশ মাটি)">Clay Loam (দোআঁশ মাটি - Balanced)</option>
                      <option value="Heavy Clay (এঁটেল মাটি)">Heavy Clay (এঁটেল মাটি - High Moisture)</option>
                      <option value="Sandy Loam (বেলে দোআঁশ)">Sandy Loam (বেলে দোআঁশ - Fast Draining)</option>
                      <option value="Alluvial (পলি মাটি)">Gangetic Alluvial (পলি মাটি - Delta)</option>
                    </select>
                  </div>

                  {/* Scenario B Specific Inputs: Sowing Date & Observed Crop Vigour */}
                  {scenario === 'in_season' && (
                    <div className="p-3.5 rounded-2xl bg-cream-100/70 border border-cream-200/90 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-brand-dark">
                        <Calendar className="w-4 h-4 text-brand-leaf" />
                        <span>In-Field Growth & Sowing Status</span>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-brand-dark/85">
                          Date Sown / Transplanted
                        </label>
                        <input
                          type="date"
                          value={plantingDate}
                          onChange={(e) => setPlantingDate(e.target.value)}
                          className="block w-full rounded-xl border border-cream-300 bg-white px-3 py-2 text-xs sm:text-sm text-brand-dark min-h-[42px]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-brand-dark/85">
                          Observed Crop Health (ফসলের অবস্থা)
                        </label>
                        <select
                          value={healthStatus}
                          onChange={(e) =>
                            setHealthStatus(
                              e.target.value as 'healthy' | 'needs_attention' | 'diseased'
                            )
                          }
                          className="block w-full rounded-xl border border-cream-300 bg-white px-3 py-2 text-xs sm:text-sm text-brand-dark min-h-[42px]"
                        >
                          <option value="healthy">Healthy & Vigorous (সম্পূর্ণ সুস্থ)</option>
                          <option value="needs_attention">
                            Mild Stress / Leaf Spot (~15% loss risk)
                          </option>
                          <option value="diseased">
                            Active Disease / Pest Infestation (~32% loss risk)
                          </option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* ---------------- LEVEL 2: AUTOMATIC DATA NOTICE ---------------- */}
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-2.5 text-xs text-brand-dark/85">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Level 2 Auto-Integration:</strong> Calibrated with ICAR & BCKV agronomic research trials for {selectedDistrict} and live APMC mandi wholesale rates.
                  </p>
                </div>

                {/* ---------------- LEVEL 3: OPTIONAL SOIL LAB TEST ---------------- */}
                <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200/90 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-extrabold text-brand-forest uppercase tracking-wider block">
                        Level 3: Soil Test Laboratory Report
                      </span>
                      <span className="text-[11px] text-brand-dark/60 block mt-0.5">
                        Do you have a Soil Health Card (মৃত্তিকা স্বাস্থ্য কার্ড)?
                      </span>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={hasSoilReport}
                        onChange={(e) => setHasSoilReport(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-cream-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-cream-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-forest"></div>
                    </label>
                  </div>

                  {!hasSoilReport ? (
                    <p className="text-[11px] text-brand-dark/65 leading-relaxed bg-white/70 p-2.5 rounded-xl border border-cream-200/70">
                      ℹ️ <strong>No soil report?</strong> That is completely fine! We will generate your forecast using regional soil averages without penalizing you or inventing fake values.
                    </p>
                  ) : (
                    <div className="pt-2 space-y-2.5 animate-in fade-in duration-200">
                      <p className="text-[11px] text-emerald-800 font-medium">
                        Enter any available parameters from your test report. Leave blank if unsure:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Input
                          label="Soil pH"
                          type="number"
                          step="0.1"
                          placeholder="e.g. 6.5"
                          value={ph}
                          onChange={(e) => setPh(e.target.value)}
                        />
                        <Input
                          label="Nitrogen (N kg/ha)"
                          type="number"
                          placeholder="e.g. 310"
                          value={nitrogen}
                          onChange={(e) => setNitrogen(e.target.value)}
                        />
                        <Input
                          label="Phosphorus (P kg/ha)"
                          type="number"
                          placeholder="e.g. 18"
                          value={phosphorus}
                          onChange={(e) => setPhosphorus(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full font-bold shadow-md hover:shadow-lg transition-all"
                  isLoading={isLoading}
                  leftIcon={<TrendingUp className="w-5 h-5 text-brand-mint" />}
                >
                  {scenario === 'pre_cultivation'
                    ? `Calculate Production & Budget for ${selectedDistrict}`
                    : `Calculate Harvest Projection for ${selectedDistrict}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: TRANSPARENT RESULTS & ECONOMICS (7 COLS) */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 space-y-4">
          {!result ? (
            <div className="h-full min-h-[420px] rounded-3xl bg-white/80 border border-cream-200 p-8 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#143224]" />
              <p className="text-xs font-bold text-brand-dark/80">
                Calibrating empirical agronomic projections for {selectedDistrict}...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Card 1: Production Forecast Hero */}
              <Card className="overflow-hidden border-cream-300 shadow-md">
                <div className="p-6 bg-gradient-to-r from-emerald-800 via-emerald-700 to-brand-forest text-white space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                      <span>{result.cropName}</span>
                      <span>•</span>
                      <span>{result.areaInBighas} Bigha ({result.areaInAcres} Acres)</span>
                      <span>•</span>
                      <span>📍 {selectedDistrict}</span>
                    </span>

                    <Badge
                      variant={
                        result.fidelity.level === 'high_precision'
                          ? 'emerald'
                          : result.fidelity.level === 'moderate_calibrated'
                          ? 'amber'
                          : 'outline'
                      }
                      size="sm"
                      className="font-bold shadow-2xs bg-white text-emerald-900 border-none"
                    >
                      {result.fidelity.label}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-white/80">
                      {result.scenario === 'pre_cultivation'
                        ? 'Projected Production Range (প্রত্যাশিত উৎপাদন)'
                        : 'Estimated Harvest Tonnage'}
                    </span>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                        {result.totalExpectedProductionTons} Tons
                      </h2>
                      <span className="text-sm font-semibold text-emerald-100">
                        ({Math.round(result.totalExpectedProductionTons * 10)} Quintals)
                      </span>
                    </div>
                    <p className="text-xs text-emerald-100/90 font-medium">
                      Realistic Forecast Range: <strong>{result.totalRangeMinTons}</strong> –{' '}
                      <strong>{result.totalRangeMaxTons} Tons</strong>
                    </p>

                    {/* Visual Yield Range Progress Meter */}
                    <div className="pt-1.5 space-y-1">
                      <div className="h-2.5 rounded-full bg-black/20 overflow-hidden relative p-0.5">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 via-emerald-300 to-emerald-200 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                30,
                                ((result.totalExpectedProductionTons - result.totalRangeMinTons) /
                                  Math.max(0.1, result.totalRangeMaxTons - result.totalRangeMinTons)) *
                                  100
                              )
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-emerald-100/75 font-semibold">
                        <span>Min: {result.totalRangeMinTons} T</span>
                        <span className="text-white font-extrabold underline underline-offset-2">Target: {result.totalExpectedProductionTons} T</span>
                        <span>Max Potential: {result.totalRangeMaxTons} T</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs text-emerald-100 flex-wrap gap-2">
                    <span>
                      Target Harvest Timeline:{' '}
                      <strong>
                        {new Date(result.estimatedHarvestDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </strong>
                    </span>
                    {result.daysRemainingToHarvest !== undefined && (
                      <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold">
                        ~{result.daysRemainingToHarvest} days remaining
                      </span>
                    )}
                  </div>
                </div>

                {/* Regional Land Unit Breakdown (Bigha & Katha) */}
                <CardContent className="p-4 sm:p-5 space-y-4">
                  <h4 className="text-xs font-bold text-brand-forest dark:text-emerald-400 uppercase tracking-wider">
                    Regional Yield Breakdown ({selectedDistrict})
                  </h4>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                    <div className="p-3 rounded-2xl bg-cream-50 dark:bg-[#1B2537] border border-cream-200 dark:border-slate-700/60">
                      <span className="text-[10px] sm:text-xs font-semibold text-brand-dark/60 dark:text-slate-400 block">
                        Per Bigha (বিঘা)
                      </span>
                      <span className="text-base sm:text-lg font-black text-brand-forest dark:text-emerald-400">
                        {result.yieldPerBighaQuintals} Q/bigha
                      </span>
                      <span className="text-[10px] text-brand-dark/50 dark:text-slate-500 block">
                        ({result.yieldPerBighaTons} Tons)
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-cream-50 dark:bg-[#1B2537] border border-cream-200 dark:border-slate-700/60">
                      <span className="text-[10px] sm:text-xs font-semibold text-brand-dark/60 dark:text-slate-400 block">
                        Per Katha (কাঠা)
                      </span>
                      <span className="text-base sm:text-lg font-black text-brand-forest dark:text-emerald-400">
                        {result.yieldPerKathaKg} kg
                      </span>
                      <span className="text-[10px] text-brand-dark/50 dark:text-slate-500 block">Per Katha</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-cream-50 dark:bg-[#1B2537] border border-cream-200 dark:border-slate-700/60">
                      <span className="text-[10px] sm:text-xs font-semibold text-brand-dark/60 dark:text-slate-400 block">
                        Per Acre (একর)
                      </span>
                      <span className="text-base sm:text-lg font-black text-brand-forest dark:text-emerald-400">
                        {result.estimatedYieldPerAcreTons} T/ac
                      </span>
                      <span className="text-[10px] text-brand-dark/50 dark:text-slate-500 block">Normalized</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Cultivation Expenses & Production Economics */}
              <Card className="border-cream-300 dark:border-slate-800 shadow-xs overflow-hidden">
                <CardHeader className="pb-3 border-b border-cream-200 dark:border-slate-800 bg-cream-50/60 dark:bg-[#141C2B]">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm sm:text-base font-bold text-brand-dark dark:text-white flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                      <span>Cultivation Expense & Net Return Projection</span>
                    </CardTitle>
                    <button
                      type="button"
                      onClick={() => setShowCostBreakdown(!showCostBreakdown)}
                      className="text-xs font-bold text-brand-forest dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{showCostBreakdown ? 'Hide Breakdown' : 'View Breakdown'}</span>
                      {showCostBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Expense Estimate */}
                    <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-900/50 space-y-1">
                      <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 block">
                        Estimated Budget / Expense
                      </span>
                      <span className="text-lg font-extrabold text-amber-950 dark:text-amber-100 block">
                        ₹{result.economics.totalPlotCostExpected.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-amber-800/80 dark:text-amber-400/80 block">
                        ₹{result.economics.costPerBighaExpected.toLocaleString('en-IN')} / bigha
                      </span>
                    </div>

                    {/* Revenue Estimate */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/90 dark:border-emerald-900/50 space-y-1">
                      <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 block">
                        Gross APMC Realization
                      </span>
                      <span className="text-lg font-extrabold text-emerald-950 dark:text-emerald-100 block">
                        ₹{result.economics.projectedRevenueExpected.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-emerald-800/80 dark:text-emerald-400/80 block">
                        @ ₹{(liveMandiRate || result.economics.indicativePricePerQuintal).toLocaleString('en-IN')}/Q ({liveMandiRate ? 'Live APMC' : 'Benchmark'})
                      </span>
                    </div>

                    {/* Net Profit Estimate */}
                    <div className="p-3.5 rounded-2xl bg-brand-forest/10 dark:bg-emerald-950/40 border border-brand-forest/20 dark:border-emerald-800/50 space-y-1">
                      <span className="text-[11px] font-bold text-brand-forest dark:text-emerald-300 block">
                        Projected Net Margin
                      </span>
                      <span className="text-lg font-extrabold text-brand-forest dark:text-emerald-200 block">
                        ₹{result.economics.projectedNetProfitExpected.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-brand-forest/80 dark:text-emerald-300/80 block">
                        Range: ₹{result.economics.projectedNetProfitMin.toLocaleString('en-IN')} – ₹{result.economics.projectedNetProfitMax.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Itemized Cost Breakdown Table */}
                  {showCostBreakdown && (
                    <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                      <span className="text-xs font-extrabold text-brand-dark block">
                        Itemized BCKV Indicative Expense Schedule ({result.areaInBighas} Bighas in {selectedDistrict}):
                      </span>
                      <div className="rounded-xl border border-cream-200 overflow-hidden divide-y divide-cream-200 text-xs">
                        {result.economics.breakdown.map((item, idx) => (
                          <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-cream-50/60">
                            <div>
                              <strong className="text-brand-dark">{item.category}</strong>
                              <span className="text-brand-dark/60 block text-[11px]">{item.description}</span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-extrabold text-brand-dark">₹{item.totalForPlot.toLocaleString('en-IN')}</span>
                              <span className="text-brand-dark/50 block text-[10px]">₹{item.costPerBigha}/bigha</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Card 3: Data Fidelity & Scientific Transparency */}
              <Card className="border-cream-300 shadow-xs">
                <CardHeader className="pb-2.5 border-b border-cream-200 bg-cream-50/40">
                  <CardTitle className="text-xs sm:text-sm font-bold text-brand-dark flex items-center gap-2">
                    <Scale className="w-4 h-4 text-brand-harvest" />
                    <span>Data Transparency & Location Traceability</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3 text-xs">
                  <p className="text-brand-dark/80 leading-relaxed">
                    {result.fidelity.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70">
                      <strong className="text-emerald-900 block mb-1">✓ Location & Data Utilized:</strong>
                      <ul className="list-disc list-inside space-y-0.5 text-emerald-950">
                        {result.fidelity.dataPointsIncluded.map((dp, i) => (
                          <li key={i}>{dp}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/70">
                      <strong className="text-amber-900 block mb-1">⚠ Unmeasured Variables:</strong>
                      {result.fidelity.dataPointsMissing.length === 0 ? (
                        <span className="text-emerald-800">All primary parameters verified.</span>
                      ) : (
                        <ul className="list-disc list-inside space-y-0.5 text-amber-950">
                          {result.fidelity.dataPointsMissing.map((dp, i) => (
                            <li key={i}>{dp}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-brand-dark/70 italic bg-cream-100 p-2.5 rounded-xl border border-cream-200">
                    {result.fidelity.uncertaintyNotice}
                  </p>
                </CardContent>
              </Card>

              {/* Card 4: Agronomic Advice & Disclaimers */}
              <Card className="border-cream-300 shadow-xs">
                <CardContent className="p-4 sm:p-5 space-y-3">
                  <span className="text-xs font-bold text-brand-forest uppercase tracking-wider block">
                    Actionable Agronomy Recommendations ({selectedDistrict})
                  </span>
                  <ul className="space-y-1.5 text-xs text-brand-dark/85">
                    {result.recommendations.map((rec, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200/60"
                      >
                        <CheckCircle2 className="w-4 h-4 text-brand-leaf shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2 border-t border-cream-200 text-[10px] text-brand-dark/60 space-y-1">
                    {result.scientificDisclaimers.map((disc, idx) => (
                      <p key={idx}>• {disc}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function YieldPredictionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-brand-emerald border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <YieldPredictionContent />
    </Suspense>
  );
}
