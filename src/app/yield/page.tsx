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
} from 'lucide-react';
import { CROP_BASELINES, YieldPredictionOutput } from '@/lib/yield/engine';
import { LandUnit } from '@/lib/units';

function YieldPredictionContent() {
  const toast = useToast();
  const searchParams = useSearchParams();
  const queryCropId = searchParams.get('crop_id');

  // Input States
  const [cropKey, setCropKey] = useState('rice_boro');
  const [variety, setVariety] = useState('');
  const [area, setArea] = useState('3.0');
  const [areaUnit, setAreaUnit] = useState<LandUnit>('bigha');
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'needs_attention' | 'diseased'>('healthy');
  const [irrigationType, setIrrigationType] = useState('Shallow Tube Well (STW)');
  const [nitrogen, setNitrogen] = useState('310');
  const [phosphorus, setPhosphorus] = useState('18');
  const [ph, setPh] = useState('6.5');
  const [plantingDate, setPlantingDate] = useState(new Date().toISOString().split('T')[0]);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<YieldPredictionOutput | null>(null);
  const loadedCropRef = useRef<string | null>(null);

  // If crop_id is passed in query, auto-populate from crop database record
  const loadExistingCrop = useCallback(async (cropId: string) => {
    const supabase = createClient();
    if (!supabase) return;

    try {
      const { data } = await supabase
        .from('crops')
        .select('*')
        .eq('id', cropId)
        .single();

      if (data) {
        if (data.name.toLowerCase().includes('potato')) setCropKey('potato');
        else if (data.name.toLowerCase().includes('aman')) setCropKey('rice_aman');
        else if (data.name.toLowerCase().includes('jute')) setCropKey('jute');
        else if (data.name.toLowerCase().includes('mustard')) setCropKey('mustard');
        else if (data.name.toLowerCase().includes('brinjal')) setCropKey('brinjal');
        else setCropKey('rice_boro');

        if (data.variety) setVariety(data.variety);
        if (data.area) setArea(String(data.area));
        if (data.area_unit) setAreaUnit(data.area_unit as LandUnit);
        if (data.health_status) setHealthStatus(data.health_status);
        if (data.irrigation_type) setIrrigationType(data.irrigation_type);
        if (data.planting_date) setPlantingDate(data.planting_date);

        toast.info(`Loaded crop profile for ${data.name}.`);
      }
    } catch (err) {
      console.warn('Error loading crop from query param:', err);
    }
  }, [toast]);

  useEffect(() => {
    if (queryCropId && loadedCropRef.current !== queryCropId) {
      loadedCropRef.current = queryCropId;
      loadExistingCrop(queryCropId);
    }
  }, [loadExistingCrop, queryCropId]);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!area || parseFloat(area) <= 0) {
      toast.error('Please enter a valid land area.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/yield/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropKey,
          variety,
          area: parseFloat(area),
          areaUnit,
          healthStatus,
          irrigationType,
          nitrogenKgHa: nitrogen ? parseFloat(nitrogen) : undefined,
          phosphorusKgHa: phosphorus ? parseFloat(phosphorus) : undefined,
          ph: ph ? parseFloat(ph) : undefined,
          plantingDate,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Prediction failed');
      }

      setResult(data.prediction);
      toast.success('Yield projection calculated.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error generating yield estimate';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full text-left">
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="forest" size="md">
            Scientific Agronomy
          </Badge>
          <span className="text-xs text-brand-dark/60">• Transparent Baseline Calibration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-forest mt-1.5">
          Crop Yield Prediction & Harvest Projection
        </h1>
        <p className="text-xs sm:text-sm text-brand-dark/70 mt-1">
          Estimated production range based on published ICAR crop regional baselines, soil test macronutrients, irrigation efficiency, and plant health.
        </p>
      </div>

      {/* Transparent Methodology Disclaimer */}
      <div className="p-3.5 bg-cream-100 border border-cream-200 rounded-2xl text-xs text-brand-dark/80 flex items-start gap-2.5">
        <Scale className="w-4 h-4 text-brand-harvest shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-brand-forest">
            Transparent Estimation Methodology (Zero Artificial Randomness)
          </span>
          <p className="leading-relaxed">
            Estimates start from verified multi-year ICAR extension crop yields in West Bengal. Multipliers are applied for soil N-P-K nutrient adequacy, soil pH acidity, irrigation infrastructure, and disease lesion severity. A realistic range with confidence scoring is presented rather than an unverified single number.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-cream-200">
              <CardTitle className="text-base font-bold text-brand-dark">
                Cultivation Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handlePredict} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-semibold text-brand-dark/90">
                    Target Crop
                  </label>
                  <select
                    value={cropKey}
                    onChange={(e) => setCropKey(e.target.value)}
                    className="block w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
                  >
                    {Object.entries(CROP_BASELINES).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.cropName} (Baseline ~{val.avgTonsPerAcre} T/ac)
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Seed Variety / Hybrid (Optional)"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="e.g. Swarna / Kufri Jyoti"
                />

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Cultivated Area"
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs sm:text-sm font-semibold text-brand-dark/90">
                      Unit
                    </label>
                    <select
                      value={areaUnit}
                      onChange={(e) => setAreaUnit(e.target.value as LandUnit)}
                      className="block w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
                    >
                      <option value="bigha">Bigha (বিঘা)</option>
                      <option value="katha">Katha (কাঠা)</option>
                      <option value="acres">Acres</option>
                      <option value="hectares">Hectares</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-semibold text-brand-dark/90">
                    Current Crop Health
                  </label>
                  <select
                    value={healthStatus}
                    onChange={(e) => setHealthStatus(e.target.value as 'healthy' | 'needs_attention' | 'diseased')}
                    className="block w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
                  >
                    <option value="healthy">Healthy (Full Potential)</option>
                    <option value="needs_attention">Needs Attention (~15% loss risk)</option>
                    <option value="diseased">Diseased (~30%+ loss risk)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-semibold text-brand-dark/90">
                    Irrigation System
                  </label>
                  <select
                    value={irrigationType}
                    onChange={(e) => setIrrigationType(e.target.value)}
                    className="block w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
                  >
                    <option value="Shallow Tube Well (STW)">Shallow Tube Well (STW)</option>
                    <option value="Deep Tube Well (DTW)">Deep Tube Well (DTW)</option>
                    <option value="Drip Irrigation">Drip Irrigation (High efficiency)</option>
                    <option value="Sprinkler">Sprinkler Irrigation</option>
                    <option value="Rainfed / Seasonal">Rainfed / Seasonal (Water stress risk)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input
                    label="Soil Nitrogen (N kg/ha)"
                    type="number"
                    value={nitrogen}
                    onChange={(e) => setNitrogen(e.target.value)}
                  />
                  <Input
                    label="Soil Phosphorus (P kg/ha)"
                    type="number"
                    value={phosphorus}
                    onChange={(e) => setPhosphorus(e.target.value)}
                  />
                  <Input
                    label="Soil pH"
                    type="number"
                    step="0.1"
                    value={ph}
                    onChange={(e) => setPh(e.target.value)}
                  />
                </div>

                <Input
                  label="Sowing Date"
                  type="date"
                  value={plantingDate}
                  onChange={(e) => setPlantingDate(e.target.value)}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-2"
                  isLoading={isLoading}
                  leftIcon={<TrendingUp className="w-5 h-5 text-brand-mint" />}
                >
                  Calculate Harvest Projection
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {!result ? (
            <Card className="h-full flex items-center justify-center p-8 text-center bg-cream-50/50 border-dashed">
              <div className="space-y-3 max-w-sm">
                <div className="w-12 h-12 rounded-2xl bg-cream-100 flex items-center justify-center text-brand-leaf mx-auto border border-cream-200">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-brand-dark">
                  Ready to Predict Crop Production
                </h3>
                <p className="text-xs text-brand-dark/70 leading-relaxed">
                  Enter your plot size and soil parameters on the left to calculate your harvest tonnage and unit breakdowns in Bigha and Katha.
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Primary Output Hero Card */}
              <Card className="overflow-hidden border-cream-200 shadow-md">
                <div className="p-6 bg-gradient-to-r from-brand-forest via-brand-leaf to-brand-forest text-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-mint uppercase tracking-wider">
                      {result.cropName} • {result.areaInAcres} Acres Normalized
                    </span>
                    <Badge variant="emerald" size="sm">
                      {result.confidenceScore}% Model Confidence
                    </Badge>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-xs text-white/80">Total Expected Harvest</span>
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                      {result.totalExpectedProductionTons} Tons
                    </h2>
                    <p className="text-xs text-white/70">
                      Estimated Range: {result.totalRangeMinTons} - {result.totalRangeMaxTons} Tons
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs text-brand-mint">
                    <span>Expected Harvest: <strong>{result.estimatedHarvestDate}</strong></span>
                  </div>
                </div>

                {/* Regional Bengal Land Unit Breakdown */}
                <CardContent className="p-4 sm:p-5 space-y-4">
                  <h4 className="text-xs font-bold text-brand-forest uppercase tracking-wider">
                    Bengal Agricultural Unit Conversions
                  </h4>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                    <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
                      <span className="text-[10px] sm:text-xs font-semibold text-brand-dark/60 block">Per Acre</span>
                      <span className="text-base sm:text-lg font-bold text-brand-forest">
                        {result.estimatedYieldPerAcreTons} T/ac
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
                      <span className="text-[10px] sm:text-xs font-semibold text-brand-dark/60 block">Per Bigha (বিঘা)</span>
                      <span className="text-base sm:text-lg font-bold text-brand-forest">
                        {result.yieldPerBighaTons} T/bigha
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
                      <span className="text-[10px] sm:text-xs font-semibold text-brand-dark/60 block">Per Katha (কাঠা)</span>
                      <span className="text-base sm:text-lg font-bold text-brand-forest">
                        {result.yieldPerKathaKg} kg/katha
                      </span>
                    </div>
                  </div>

                  {/* Factor Contribution Breakdown */}
                  <div className="p-3.5 rounded-xl bg-cream-100 border border-cream-200 space-y-2 text-xs">
                    <span className="font-bold text-brand-dark block">
                      Factor Adjustments Applied to ICAR Baseline ({result.factors.baselineYield} T/ac):
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 text-brand-dark/80">
                      <div>Crop Health Multiplier: <strong>×{result.factors.healthMultiplier}</strong></div>
                      <div>Irrigation Multiplier: <strong>×{result.factors.irrigationMultiplier}</strong></div>
                      <div>Soil NPK Multiplier: <strong>×{result.factors.soilNutrientMultiplier}</strong></div>
                      <div>Soil pH Multiplier: <strong>×{result.factors.phMultiplier}</strong></div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-brand-forest uppercase tracking-wider block">
                      Agronomist Yield Optimization Advice
                    </span>
                    <ul className="space-y-1.5 text-xs text-brand-dark/85">
                      {result.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200/60">
                          <CheckCircle2 className="w-4 h-4 text-brand-leaf shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
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
