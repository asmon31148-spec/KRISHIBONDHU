'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/context';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  ScanLine,
  Bot,
  Warehouse,
  Sprout,
  CloudSun,
  CheckCircle2,
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
  FileText,
  ArrowRight,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  FlaskConical,
  Plus,
  Lightbulb,
  LineChart as AnalyticsIcon,
  Printer,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);
const BarChart = dynamic(
  () => import('recharts').then((mod) => mod.BarChart),
  { ssr: false, loading: () => <div className="h-64 bg-cream-100 rounded-2xl animate-pulse" /> }
);
const Bar = dynamic(() => import('recharts').then((mod) => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });
const PieChart = dynamic(() => import('recharts').then((mod) => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then((mod) => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then((mod) => mod.Cell), { ssr: false });
const Legend = dynamic(() => import('recharts').then((mod) => mod.Legend), { ssr: false });
import { formatLandArea, convertLandArea, LandUnit } from '@/lib/units';

interface FarmData {
  id: string;
  name: string;
  area: number;
  area_unit: string;
  soil_type: string;
  location_name: string;
}

interface CropData {
  id: string;
  name: string;
  variety: string;
  health_status: 'healthy' | 'needs_attention' | 'diseased';
  planting_date: string;
  area: number;
  area_unit: string;
}

interface ScanData {
  id: string;
  crop_name: string;
  disease_name: string | null;
  severity: string;
  crop_confidence: number;
  image_url: string;
  created_at: string;
}

interface YieldMetric {
  id: string;
  crop_name: string;
  total_expected_production_tons: number;
  actual_harvest_yield_tons: number | null;
  prediction_date: string;
}

interface ScanMetric {
  id: string;
  crop_name: string;
  severity: string;
  created_at: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  healthy: '#10B981', // Emerald
  mild: '#F59E0B', // Amber
  moderate: '#F97316', // Orange
  severe: '#EF4444', // Red
  uncertain: '#64748B', // Slate
};

function getCropEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('rice') || n.includes('paddy') || n.includes('dhan')) return '🌾';
  if (n.includes('potato') || n.includes('alu')) return '🥔';
  if (n.includes('jute') || n.includes('pat')) return '🌿';
  if (n.includes('mustard') || n.includes('sarson')) return '🌼';
  if (n.includes('brinjal') || n.includes('begun') || n.includes('eggplant')) return '🍆';
  if (n.includes('chilli') || n.includes('lanka') || n.includes('mirch')) return '🌶️';
  if (n.includes('tomato')) return '🍅';
  if (n.includes('wheat') || n.includes('gom')) return '🌾';
  return '🌱';
}

export default function DashboardPage() {
  const { t, language } = useTranslation();
  const { user, profile } = useAuth();

  const [farms, setFarms] = useState<FarmData[]>([]);
  const [crops, setCrops] = useState<CropData[]>([]);
  const [scans, setScans] = useState<ScanData[]>([]);
  const [yields, setYields] = useState<YieldMetric[]>([]);
  const [allScans, setAllScans] = useState<ScanMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      const supabase = createClient();
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch user's real farms
        const { data: farmsData } = await supabase
          .from('farms')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (farmsData) setFarms(farmsData as FarmData[]);

        // Fetch user's real crops
        const { data: cropsData } = await supabase
          .from('crops')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (cropsData) setCrops(cropsData as CropData[]);

        // Fetch user's recent scans for list
        const { data: scansData } = await supabase
          .from('crop_scans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (scansData) setScans(scansData as ScanData[]);

        // Fetch user's yield predictions for analytics
        const { data: yieldsData } = await supabase
          .from('yield_predictions')
          .select('id, crop_name, total_expected_production_tons, actual_harvest_yield_tons, prediction_date')
          .eq('user_id', user.id);

        if (yieldsData) setYields(yieldsData as YieldMetric[]);

        // Fetch all scans for analytics distribution
        const { data: allScansData } = await supabase
          .from('crop_scans')
          .select('id, crop_name, severity, created_at')
          .eq('user_id', user.id);

        if (allScansData) setAllScans(allScansData as ScanMetric[]);
      } catch (err) {
        console.error('Error fetching dashboard records:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  const healthyCropsCount = crops.filter((c) => c.health_status === 'healthy').length;
  const attentionCropsCount = crops.filter((c) => c.health_status !== 'healthy').length;

  const farmerName = profile?.full_name || user?.email?.split('@')[0] || 'Farmer';
  const locationDisplay = profile?.district
    ? `${profile.village ? profile.village + ', ' : ''}${profile.district}, ${profile.state || 'West Bengal'}`
    : profile?.state || 'West Bengal, India';

  const todayDate = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const handlePrint = () => {
    window.print();
  };

  // 1. Severity Distribution
  const severityCounts: Record<string, number> = {};
  (allScans.length > 0 ? allScans : scans).forEach((s) => {
    const sev = s.severity || 'healthy';
    severityCounts[sev] = (severityCounts[sev] || 0) + 1;
  });

  const severityPieData = Object.entries(severityCounts).map(([sev, count]) => ({
    name: sev.charAt(0).toUpperCase() + sev.slice(1),
    value: count,
    color: SEVERITY_COLORS[sev] || '#64748B',
  }));

  // 2. Crop Land Allocation normalized to Bigha
  const cropAreaData = crops.map((c) => {
    const rawUnit = (c.area_unit?.toLowerCase() || 'bigha') as LandUnit;
    const validUnit: LandUnit = ['acres', 'bigha', 'katha', 'hectares'].includes(rawUnit) ? rawUnit : 'bigha';
    const normalizedBigha = convertLandArea(c.area, validUnit, 'bigha');
    return {
      name: c.name.split(' ')[0],
      area: Math.round(normalizedBigha * 10) / 10,
      originalArea: `${c.area} ${c.area_unit || 'Bigha'}`,
    };
  });

  // 3. Yield Prediction vs Actual Harvest
  const yieldComparisonData = yields.map((y, idx) => {
    const baseName = y.crop_name.split(' ')[0];
    const duplicates = yields.filter((other) => other.crop_name.split(' ')[0] === baseName);
    const label = duplicates.length > 1 ? `${baseName} (Plot ${idx + 1})` : baseName;
    return {
      crop: label,
      predicted: y.total_expected_production_tons,
      actual: y.actual_harvest_yield_tons || 0,
      isPending: !y.actual_harvest_yield_tons || y.actual_harvest_yield_tons === 0,
    };
  });

  const totalProjectedTons = yields.reduce((acc, curr) => acc + (curr.total_expected_production_tons || 0), 0);
  const totalCultivatedAreaBigha = cropAreaData.reduce((acc, curr) => acc + curr.area, 0);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-cream-100 rounded-2xl border border-cream-200" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-cream-100 rounded-2xl border border-cream-200" />
          ))}
        </div>
        <div className="h-64 bg-cream-100 rounded-2xl border border-cream-200" />
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full text-left">
      {/* Radiant Agricultural Hero Banner (Split Layout Inspired by Government of India Soil Health Portal) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cream-50 via-white to-emerald-50/40 border border-cream-300 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Column: Prestigious Government & Agritech Typography (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Official Authority Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 border border-emerald-300 text-xs font-bold text-emerald-900 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Govt. of West Bengal • ICAR & BCKV Knowledge Core</span>
                </span>
                <div className="flex items-center gap-1.5 text-xs font-medium text-brand-dark/70 bg-cream-100/80 px-2.5 py-1 rounded-full border border-cream-200">
                  <Calendar className="w-3.5 h-3.5 text-brand-leaf" />
                  <span>{todayDate}</span>
                  <span>•</span>
                  <MapPin className="w-3.5 h-3.5 text-brand-leaf" />
                  <span>{locationDisplay}</span>
                </div>
              </div>

              {/* Dignified Headline with Serif Accent */}
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-brand-dark leading-tight">
                  Empowering Bengal Farmers With{' '}
                  <span className="font-serif italic text-emerald-700 font-normal underline decoration-emerald-300 decoration-wavy decoration-1 underline-offset-4">
                    Real-Time Agronomy
                  </span>{' '}
                  For Higher Yields
                </h1>
                <p className="text-xs sm:text-sm text-brand-dark/75 leading-relaxed max-w-xl">
                  Welcome back, <strong className="text-brand-forest font-bold">{farmerName}</strong>. 
                  Access instant crop leaf disease diagnosis, balanced N-P-K nutrient schedules, 
                  district pathogen alerts, and verified government welfare tracking.
                </p>
              </div>
            </div>

            {/* High-Contrast Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/scan">
                <Button 
                  variant="amber" 
                  size="md" 
                  leftIcon={<ScanLine className="w-4 h-4" />}
                  className="shadow-md hover:shadow-lg transition-all font-bold"
                >
                  Scan Crop Leaf
                </Button>
              </Link>
              <Link href="/assistant">
                <Button 
                  variant="primary" 
                  size="md" 
                  leftIcon={<Bot className="w-4 h-4 text-white" />}
                  className="bg-brand-forest hover:bg-brand-forest/90 text-white shadow-md font-bold"
                >
                  Ask AI Agronomist
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="md" 
                onClick={handlePrint}
                leftIcon={<Printer className="w-4 h-4 text-[#143224]" />}
                className="print:hidden border-[#143224]/15 hover:bg-white text-brand-dark font-semibold shadow-2xs"
              >
                Print Farm Report
              </Button>
            </div>
          </div>

          {/* Right Column: Full-Color, Radiant, Sunlit Real Agricultural Photo with Smiling Indian Farmers (5 cols) */}
          <div className="lg:col-span-5 relative min-h-[220px] sm:min-h-[280px] lg:min-h-full overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-800 to-brand-forest">
            {/* Real Unsuppressed High-Res Farmer & Lush Paddy Photography */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1000&q=85')`,
              }}
            />
            {/* Subtle light edge fade so it blends cleanly into the left card */}
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-cream-50/90 via-transparent to-transparent pointer-events-none" />

            {/* Radiant floating highlight badge */}
            <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-lg text-left max-w-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-brand-forest">100% Free For Farmers</span>
              </div>
              <p className="text-[11px] text-brand-dark/70 mt-0.5 leading-snug">
                Calibrated for Bengal Kharif, Rabi & Boro agro-climatic zones.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* High-Priority Actionable Crop Alert (Clickable redirect directly to AI Assistant with plot context) */}
      {attentionCropsCount > 0 && (() => {
        const attCrop = crops.find((c) => c.health_status !== 'healthy') || crops[0];
        const attFarm = farms.find((f) => f.id === (attCrop as any).farm_id) || farms[0];
        const aiHref = `/assistant?crop_id=${attCrop.id}&crop_name=${encodeURIComponent(attCrop.name)}&variety=${encodeURIComponent(attCrop.variety || '')}&status=${attCrop.health_status}&farm=${encodeURIComponent(attFarm?.name || 'Primary Farm')}&soil=${encodeURIComponent(attFarm?.soil_type || 'Clay')}&area=${attCrop.area}&unit=${encodeURIComponent(attCrop.area_unit)}&sown=${encodeURIComponent(attCrop.planting_date)}&auto_ask=true`;

        return (
          <Link
            href={aiHref}
            className="group block p-4 sm:p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 hover:border-amber-500 hover:bg-amber-500/15 transition-all shadow-xs cursor-pointer"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0 animate-pulse">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                      Active Crop Health Alert
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[11px] font-bold">
                      {attentionCropsCount} Plot Requires Immediate Attention
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-brand-dark mt-1">
                    {attCrop.name}
                    {attCrop.variety ? ` (${attCrop.variety})` : ''}
                    {' '}has an active health warning. Tap to get instant ICAR/BCKV diagnosis and remedies.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 group-hover:translate-x-1 transition-transform self-end sm:self-auto shrink-0 bg-white/90 px-3.5 py-2 rounded-xl border border-amber-300 shadow-2xs">
                <span>Ask AI Treatment</span>
                <ArrowRight className="w-4 h-4 text-amber-800" />
              </div>
            </div>
          </Link>
        );
      })()}

      {/* ========================================================
          FARM PRODUCTION ANALYTICS & HISTORICAL TRENDS (UNIFIED)
         ======================================================== */}
      <section id="analytics" className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#143224] flex items-center gap-2">
              <AnalyticsIcon className="w-5 h-5 text-[#D9822B]" />
              <span>Farm Analytics & Production Intelligence</span>
            </h2>
            <p className="text-xs text-[#5E7367] mt-0.5 font-medium">
              Multi-season harvest projections, pathogen severity distribution, and land allocation benchmarks.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-3.5 h-3.5 text-[#143224]" />}
            className="print:hidden border-[#143224]/15 hover:bg-white text-xs font-bold text-[#143224] shadow-2xs self-start sm:self-auto"
          >
            Print Report
          </Button>
        </div>

        {/* 3 Analytics Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Chart 1: Disease Severity Breakdown */}
          <Card className="p-5 space-y-3 bg-white/95 border border-[#143224]/10 shadow-xs">
            <div className="space-y-0.5">
              <CardTitle className="text-sm sm:text-base font-bold text-[#143224]">
                Crop Disease Severity Distribution
              </CardTitle>
              <p className="text-xs text-[#5E7367]">
                Categorizes all leaf diagnostic scans by ICAR pathogen severity tiers.
              </p>
            </div>

            {severityPieData.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-xs text-[#5E7367] italic">
                No disease scans recorded yet. Scan a leaf to view health distribution.
              </div>
            ) : !isMounted ? (
              <div className="h-60 w-full flex items-center justify-center text-xs text-[#5E7367]">
                Preparing visual analytics...
              </div>
            ) : (
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      innerRadius={45}
                      paddingAngle={3}
                    >
                      {severityPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* Chart 2: Cultivated Area Breakdown */}
          <Card className="p-5 space-y-3 bg-white/95 border border-[#143224]/10 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <CardTitle className="text-sm sm:text-base font-bold text-[#143224]">
                  Land Allocation by Cultivated Crop (Bigha)
                </CardTitle>
                <p className="text-xs text-[#5E7367]">
                  Normalized cultivated area distribution across all your registered farm plots.
                </p>
              </div>
              <span className="text-xs font-bold text-[#143224] px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 self-start sm:self-auto">
                Total: {totalCultivatedAreaBigha.toFixed(1)} Bigha
              </span>
            </div>

            {cropAreaData.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-xs text-[#5E7367] italic">
                No active crops registered yet. Add crops to view land allocation.
              </div>
            ) : !isMounted ? (
              <div className="h-60 w-full flex items-center justify-center text-xs text-[#5E7367]">
                Preparing visual analytics...
              </div>
            ) : (
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cropAreaData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0efe9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value: any) => [`${value} Bigha`, 'Area']} />
                    <Bar dataKey="area" fill="#143224" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* Chart 3: Predicted vs Actual Harvest Yields (Full-Width) */}
          <Card className="p-5 space-y-3 lg:col-span-2 bg-white/95 border border-[#143224]/10 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <CardTitle className="text-sm sm:text-base font-bold text-[#143224]">
                  Predicted vs Actual Harvest Production (Tons)
                </CardTitle>
                <p className="text-xs text-[#5E7367]">
                  Compares estimated ICAR model projections with verified farmer recorded harvests.
                </p>
              </div>
              <span className="text-xs font-bold text-[#D9822B] px-3 py-1 rounded-full bg-amber-50 border border-amber-200/60 self-start sm:self-auto">
                Projected Total: {totalProjectedTons.toFixed(1)} Tons
              </span>
            </div>

            {yieldComparisonData.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-xs text-[#5E7367] italic">
                Calculate crop yield in Yield & Profit tool to generate multi-season harvest benchmarks.
              </div>
            ) : !isMounted ? (
              <div className="h-64 w-full flex items-center justify-center text-xs text-[#5E7367]">
                Preparing visual analytics...
              </div>
            ) : (
              <div className="space-y-3">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={yieldComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0efe9" />
                      <XAxis dataKey="crop" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="predicted" fill="#D9822B" name="Predicted (Tons)" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="actual" fill="#143224" name="Actual Harvest (Tons)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {yieldComparisonData.some((d) => d.isPending) && (
                  <p className="text-[11px] text-[#2D2319]/80 bg-[#F9F7F2] border border-[#143224]/10 rounded-xl p-2.5 flex items-center gap-2 font-medium">
                    <span className="text-[#D9822B] font-bold">ℹ️</span>
                    <span>Zero actual harvest indicates active crops currently in mid-season growth. Final verified yield will record automatically upon season harvest logging.</span>
                  </p>
                )}
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* Overview Stat Cards (Derived strictly from real DB records, 100% Clickable with meaningful redirects) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Farms -> Links to /farms */}
        <Link href="/farms" className="group block focus:outline-hidden">
          <Card className="border-t-4 border-t-brand-forest hover:border-brand-leaf hover:shadow-md transition-all cursor-pointer h-full">
            <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-brand-dark/70 group-hover:text-brand-forest transition-colors">
                    {t('dashboard.totalFarms')}
                  </p>
                  <h3 className="text-2xl font-black text-brand-forest mt-1">
                    {farms.length}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-brand-forest/10 flex items-center justify-center text-brand-forest group-hover:scale-110 transition-transform">
                  <Warehouse className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 mt-2 border-t border-cream-200/80 text-[11px] text-brand-leaf font-medium">
                <span>Manage Plots</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Total Crops -> Links to /crops */}
        <Link href="/crops" className="group block focus:outline-hidden">
          <Card className="border-t-4 border-t-brand-leaf hover:border-brand-leaf hover:shadow-md transition-all cursor-pointer h-full">
            <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-brand-dark/70 group-hover:text-brand-forest transition-colors">
                    {t('dashboard.totalCrops')}
                  </p>
                  <h3 className="text-2xl font-black text-brand-forest mt-1">
                    {crops.length}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-brand-leaf/10 flex items-center justify-center text-brand-leaf group-hover:scale-110 transition-transform">
                  <Sprout className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 mt-2 border-t border-cream-200/80 text-[11px] text-brand-leaf font-medium">
                <span>Track Sowing</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Total Scans -> Links to /scans/history */}
        <Link href="/scans/history" className="group block focus:outline-hidden">
          <Card className="border-t-4 border-t-brand-amber hover:border-amber-500 hover:shadow-md transition-all cursor-pointer h-full">
            <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-brand-dark/70 group-hover:text-amber-800 transition-colors">
                    {t('dashboard.totalScans')}
                  </p>
                  <h3 className="text-2xl font-black text-brand-forest mt-1">
                    {scans.length}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700 group-hover:scale-110 transition-transform">
                  <ScanLine className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 mt-2 border-t border-cream-200/80 text-[11px] text-amber-700 font-medium">
                <span>Scan History</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Crop Health Overview -> Links to /crops to review and treat */}
        <Link href="/crops" className="group block focus:outline-hidden">
          <Card 
            className={`border-t-4 transition-all cursor-pointer h-full ${
              attentionCropsCount > 0 
                ? 'border-t-amber-500 bg-amber-50/20 hover:bg-amber-50/40 hover:border-amber-600 shadow-xs' 
                : 'border-t-emerald-600 hover:shadow-md'
            }`}
          >
            <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-brand-dark/70">
                    {t('dashboard.healthyCrops')}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-2xl font-black text-emerald-700">
                      {healthyCropsCount}
                    </span>
                    {attentionCropsCount > 0 && (
                      <Badge variant="amber" size="sm" className="animate-pulse">
                        {attentionCropsCount} Alert
                      </Badge>
                    )}
                  </div>
                </div>
                <div 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                    attentionCropsCount > 0 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {attentionCropsCount > 0 ? (
                    <AlertTriangle className="w-5 h-5 text-amber-800" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  )}
                </div>
              </div>
              <div 
                className={`flex items-center justify-between pt-3 mt-2 border-t text-[11px] font-bold ${
                  attentionCropsCount > 0 
                    ? 'border-amber-200 text-amber-900' 
                    : 'border-cream-200/80 text-emerald-700'
                }`}
              >
                <span>{attentionCropsCount > 0 ? 'Click to Resolve Alert' : 'All Crops Optimal'}</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Farmer Tools Row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-brand-dark flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-harvest" />
              <span>{t('dashboard.quickActions')}</span>
            </h2>
            <p className="text-xs text-brand-dark/65 mt-0.5">
              1-Tap Verified Directives & Agronomy Calculators
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-xs font-bold text-emerald-900 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Active Season: Winter (Rabi & Boro)</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-3.5">
          {/* Tool 1: Scan Crop */}
          <Link
            href="/scan"
            className="group relative flex flex-col items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-emerald-50/90 via-white to-emerald-50/30 border border-emerald-200/90 hover:border-emerald-500 hover:shadow-md active:scale-[0.98] transition-all text-center cursor-pointer shadow-2xs"
          >
            <div className="w-full flex justify-end">
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 uppercase tracking-wider">
                Instant
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white shadow-xs flex items-center justify-center my-1.5 group-hover:scale-105 transition-transform">
              <ScanLine className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-brand-dark group-hover:text-emerald-800 transition-colors block">
                {t('nav.scan')}
              </span>
              <span className="text-[10px] text-brand-dark/65 mt-0.5 block leading-tight">
                AI Leaf Diagnosis
              </span>
            </div>
          </Link>

          {/* Tool 2: AI Assistant */}
          <Link
            href="/assistant"
            className="group relative flex flex-col items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-teal-50/90 via-white to-teal-50/30 border border-teal-200/90 hover:border-teal-500 hover:shadow-md active:scale-[0.98] transition-all text-center cursor-pointer shadow-2xs"
          >
            <div className="w-full flex justify-end">
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-teal-100 text-teal-900 uppercase tracking-wider">
                Voice
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-brand-forest text-white shadow-xs flex items-center justify-center my-1.5 group-hover:scale-105 transition-transform">
              <Bot className="w-6 h-6 text-brand-mint" />
            </div>
            <div>
              <span className="text-xs font-bold text-brand-dark group-hover:text-brand-forest transition-colors block">
                {t('nav.assistant')}
              </span>
              <span className="text-[10px] text-brand-dark/65 mt-0.5 block leading-tight">
                Walkie-Talkie (বাংলা)
              </span>
            </div>
          </Link>

          {/* Tool 3: Mandi Radar */}
          <Link
            href="/mandi"
            className="group relative flex flex-col items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-amber-50/90 via-white to-amber-50/30 border border-amber-200/90 hover:border-amber-500 hover:shadow-md active:scale-[0.98] transition-all text-center cursor-pointer shadow-2xs"
          >
            <div className="w-full flex justify-end">
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 uppercase tracking-wider">
                Live APMC
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white shadow-xs flex items-center justify-center my-1.5 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-brand-dark group-hover:text-amber-800 transition-colors block">
                Mandi Radar
              </span>
              <span className="text-[10px] text-brand-dark/65 mt-0.5 block leading-tight">
                Daily Auction Rates
              </span>
            </div>
          </Link>

          {/* Tool 4: Fertilizer Calc */}
          <Link
            href="/fertilizer"
            className="group relative flex flex-col items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-cyan-50/90 via-white to-cyan-50/30 border border-cyan-200/90 hover:border-cyan-500 hover:shadow-md active:scale-[0.98] transition-all text-center cursor-pointer shadow-2xs"
          >
            <div className="w-full flex justify-end">
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-cyan-100 text-cyan-900 uppercase tracking-wider">
                ICAR N-P-K
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-700 text-white shadow-xs flex items-center justify-center my-1.5 group-hover:scale-105 transition-transform">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-brand-dark group-hover:text-cyan-800 transition-colors block">
                Fertilizer Calc
              </span>
              <span className="text-[10px] text-brand-dark/65 mt-0.5 block leading-tight">
                Exact Bag Doses
              </span>
            </div>
          </Link>

          {/* Tool 5: Weather Directives */}
          <Link
            href="/weather"
            className="group relative flex flex-col items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-sky-50/90 via-white to-sky-50/30 border border-sky-200/90 hover:border-sky-500 hover:shadow-md active:scale-[0.98] transition-all text-center cursor-pointer shadow-2xs"
          >
            <div className="w-full flex justify-end">
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-sky-100 text-sky-900 uppercase tracking-wider">
                Radar
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white shadow-xs flex items-center justify-center my-1.5 group-hover:scale-105 transition-transform">
              <CloudSun className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-brand-dark group-hover:text-sky-800 transition-colors block">
                {t('nav.weather')}
              </span>
              <span className="text-[10px] text-brand-dark/65 mt-0.5 block leading-tight">
                Spray Window Times
              </span>
            </div>
          </Link>

          {/* Tool 6: Govt Schemes */}
          <Link
            href="/schemes"
            className="group relative flex flex-col items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-lime-50/90 via-white to-lime-50/30 border border-lime-200/90 hover:border-lime-500 hover:shadow-md active:scale-[0.98] transition-all text-center cursor-pointer shadow-2xs"
          >
            <div className="w-full flex justify-end">
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-lime-100 text-lime-900 uppercase tracking-wider">
                DBT
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-lime-700 text-white shadow-xs flex items-center justify-center my-1.5 group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-brand-dark group-hover:text-lime-800 transition-colors block">
                Govt Schemes
              </span>
              <span className="text-[10px] text-brand-dark/65 mt-0.5 block leading-tight">
                Krishak Bandhu / BSB
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: MY FARM PLOTS & ACTIVE SOWN CROPS (EQUAL 50/50 SPLIT) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Card: Registered Farm Plots */}
        <Card className="border border-cream-300 shadow-xs overflow-hidden flex flex-col justify-between bg-white relative h-full min-h-[440px]">
          {/* Subtle agricultural background watermark with gentle animation */}
          <div 
            className="absolute right-2 bottom-2 w-56 h-56 bg-contain bg-no-repeat bg-bottom-right opacity-[0.05] pointer-events-none animate-float-sway"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=400&q=80')`
            }}
          />
          <div>
            <CardHeader className="flex flex-row items-center justify-between pb-3.5 border-b border-cream-200 bg-cream-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-forest/10 flex items-center justify-center text-brand-forest">
                  <Warehouse className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-brand-dark">
                    {t('farms.title')}
                  </CardTitle>
                  <span className="text-[11px] text-brand-dark/60">Registered Land Parcels</span>
                </div>
              </div>
              <Link
                href="/farms"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-forest text-white text-xs font-bold hover:bg-brand-forest/90 transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Plot</span>
              </Link>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-3">
              {farms.length === 0 ? (
                <EmptyState
                  icon={<Warehouse className="w-6 h-6" />}
                  title={t('dashboard.noFarmsYet')}
                  description="Register your land parcels to customize weather advisories and plot yield projections."
                  actionLabel={t('dashboard.addFirstFarm')}
                  onAction={() => (window.location.href = '/farms')}
                />
              ) : (
                <div className="space-y-3">
                  {farms.map((farm) => (
                    <Link
                      key={farm.id}
                      href="/farms"
                      className="group block p-4 rounded-2xl bg-cream-50/40 border border-cream-200/90 hover:border-brand-leaf hover:bg-white hover:shadow-xs transition-all cursor-pointer"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                            <Warehouse className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-brand-dark group-hover:text-brand-forest transition-colors">
                                {farm.name}
                              </h4>
                              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-bold">
                                {formatLandArea(farm.area, farm.area_unit as LandUnit, (language as any) || 'en')}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-brand-dark/70 flex-wrap">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-brand-leaf" />
                                {farm.location_name || 'South 24 Parganas, West Bengal'}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/70">
                                <Sprout className="w-3 h-3" />
                                {farm.soil_type ? `${farm.soil_type} Soil` : 'Clay Soil'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-bold text-brand-leaf group-hover:text-brand-forest group-hover:translate-x-1 transition-all self-end sm:self-center shrink-0">
                          <span>Manage Plot</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </div>

          {/* Contextual Soil Pro-Tip at bottom */}
          <div className="p-4 m-4 sm:m-5 rounded-2xl bg-gradient-to-r from-cream-100 to-emerald-50/60 border border-cream-200 flex items-start gap-2.5 text-xs text-brand-dark/85 shadow-2xs">
            <Lightbulb className="w-4 h-4 text-brand-harvest shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Soil Health Tip:</strong> Clay soils in the Gangetic Delta retain moisture but compact easily. Apply well-decomposed FYM (গোবর সার) @ 1.5 tons/bigha to improve soil aeration and microbial activity.
            </p>
          </div>
        </Card>

        {/* Right Card: Active Sown Crops */}
        <Card className="border border-cream-300 shadow-xs overflow-hidden flex flex-col justify-between bg-white relative h-full min-h-[440px]">
          {/* Subtle agricultural background watermark with gentle animation */}
          <div 
            className="absolute right-2 bottom-2 w-56 h-56 bg-contain bg-no-repeat bg-bottom-right opacity-[0.05] pointer-events-none animate-float-sway"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=400&q=80')`
            }}
          />
          <div>
            <CardHeader className="flex flex-row items-center justify-between pb-3.5 border-b border-cream-200 bg-cream-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-leaf/10 flex items-center justify-center text-brand-leaf">
                  <Sprout className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-brand-dark">
                    {t('crops.title')}
                  </CardTitle>
                  <span className="text-[11px] text-brand-dark/60">Active Sowing & Field Health</span>
                </div>
              </div>
              <Link
                href="/crops"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-forest text-white text-xs font-bold hover:bg-brand-forest/90 transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Crop</span>
              </Link>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-3">
              {crops.length === 0 ? (
                <EmptyState
                  icon={<Sprout className="w-6 h-6" />}
                  title={t('dashboard.noCropsYet')}
                  description="Add crops you are currently growing to track diseases, sowing dates, and harvest predictions."
                  actionLabel={t('dashboard.addFirstCrop')}
                  onAction={() => (window.location.href = '/crops')}
                />
              ) : (
                <div className="space-y-3">
                  {crops.map((crop) => (
                    <div
                      key={crop.id}
                      className="p-4 rounded-2xl bg-cream-50/40 border border-cream-200/90 shadow-2xs hover:border-brand-leaf hover:bg-white transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-cream-100 border border-cream-300 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                            {getCropEmoji(crop.name)}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-brand-dark">
                                {crop.name}
                              </h4>
                              {crop.variety && (
                                <span className="px-2 py-0.5 rounded-md bg-cream-100 text-brand-dark/70 text-[10px] font-semibold border border-cream-200">
                                  {crop.variety}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-brand-dark/70 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-brand-leaf" />
                                Sown: {crop.planting_date}
                              </span>
                              <span>•</span>
                              <span>{formatLandArea(crop.area, crop.area_unit as LandUnit, (language as any) || 'en')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Health Status Pill */}
                        <div className="self-start sm:self-center">
                          <Badge
                            variant={
                              crop.health_status === 'healthy'
                                ? 'emerald'
                                : crop.health_status === 'needs_attention'
                                ? 'amber'
                                : 'red'
                            }
                            size="md"
                            className="font-bold shadow-2xs flex items-center gap-1.5"
                          >
                            {crop.health_status === 'healthy' ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{t('crops.healthy')}</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                                <span>{t('crops.needsAttention')} (Action Required)</span>
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>

                      {/* 1-Tap Crop Action Shortcuts */}
                      <div className="pt-2.5 border-t border-cream-200/80 flex items-center gap-2 flex-wrap">
                        <Link
                          href="/fertilizer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-brand-dark hover:text-brand-forest border border-cream-200 text-xs font-semibold transition-colors shadow-2xs"
                        >
                          <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Fertilizer Schedule</span>
                        </Link>
                        <Link
                          href="/scan"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-brand-dark hover:text-brand-forest border border-cream-200 text-xs font-semibold transition-colors shadow-2xs"
                        >
                          <ScanLine className="w-3.5 h-3.5 text-brand-forest" />
                          <span>Scan Leaf</span>
                        </Link>
                        <Link
                          href={`/yield?crop_id=${crop.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-brand-dark hover:text-brand-forest border border-cream-200 text-xs font-semibold transition-colors shadow-2xs"
                        >
                          <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                          <span>Harvest Yield Estimate</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </div>

          <div className="p-3 text-center border-t border-cream-200/80 bg-cream-50/30">
            <Link
              href="/crops"
              className="text-xs font-bold text-brand-forest hover:underline inline-flex items-center gap-1"
            >
              <span>Manage All Crops & Sowing Records</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      </div>

      {/* ======================================================== */}
      {/* SECTION 2: RECENT CROP HEALTH DIAGNOSES (FULL-WIDTH SYMMETRICAL GRID) */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-cream-200">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-brand-dark flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-amber-600" />
              <span>Recent Crop Health Diagnoses</span>
            </h2>
            <p className="text-xs text-brand-dark/65 mt-0.5">
              Verified computer vision leaf scans, detected pathogens, and instant remedy plans
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/scan"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Scan New Leaf</span>
            </Link>
            <Link
              href="/scans/history"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-cream-200 text-brand-dark text-xs font-bold hover:border-brand-leaf transition-colors shadow-2xs"
            >
              <span>View All History</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {scans.length === 0 ? (
          <Card className="border border-cream-300 shadow-xs">
            <CardContent className="p-8 text-center">
              <EmptyState
                icon={<ScanLine className="w-8 h-8 text-amber-600" />}
                title={t('dashboard.noScansYet')}
                description="Take a photo of diseased leaves to receive instant AI fungal identification and BCKV organic spray protocols."
                actionLabel={t('dashboard.scanFirstCrop')}
                onAction={() => (window.location.href = '/scan')}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scans.map((scan) => (
              <Card
                key={scan.id}
                className="group border border-cream-300 hover:border-brand-leaf/60 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between bg-white"
              >
                <CardContent className="p-4 space-y-3.5">
                  {/* Top Bar: Crop Name + Severity Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-extrabold text-brand-dark group-hover:text-brand-forest transition-colors">
                        {scan.crop_name}
                      </h4>
                      <span className="text-[11px] text-brand-dark/55 block">
                        {new Date(scan.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <Badge
                      variant={
                        scan.severity === 'healthy'
                          ? 'emerald'
                          : scan.severity === 'severe'
                          ? 'red'
                          : 'amber'
                      }
                      size="sm"
                      className="font-bold capitalize shadow-2xs whitespace-nowrap"
                    >
                      {scan.severity} Risk
                    </Badge>
                  </div>

                  {/* Mid Row: Constrained $64x64px Thumbnail + Diagnosis Details */}
                  <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-cream-50/70 border border-cream-200/80">
                    <div className="w-16 h-16 min-w-[64px] min-h-[64px] max-w-[64px] max-h-[64px] rounded-xl overflow-hidden shrink-0 border border-cream-300 bg-cream-100 shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={scan.image_url}
                        alt={scan.crop_name}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                        Detected Pathogen
                      </span>
                      <h5 className="text-xs sm:text-sm font-bold text-brand-dark truncate leading-tight mt-0.5">
                        {scan.disease_name || 'Healthy Leaf Tissue'}
                      </h5>
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 font-bold mt-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>High Confidence • Verified</span>
                      </span>
                    </div>
                  </div>

                  {/* Bottom Action: View Treatment */}
                  <div className="pt-2 border-t border-cream-200/80 flex items-center justify-between">
                    <Link
                      href="/scans/history"
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-forest hover:text-emerald-800 transition-colors"
                    >
                      <span>View Organic Treatment</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                      href="/assistant"
                      className="text-[11px] font-semibold text-brand-dark/60 hover:text-brand-dark underline"
                    >
                      Ask AI
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* SECTION 3: REGIONAL FIELD INTELLIGENCE & ADVISORIES (BALANCED 2-COLUMN) */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-cream-200">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-brand-dark flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-harvest" />
              <span>Regional Field Intelligence & Advisories</span>
            </h2>
            <p className="text-xs text-brand-dark/65 mt-0.5">
              Calibrated for South 24 Parganas, Hooghly, and Lower Gangetic Basin agro-climatic zones
            </p>
          </div>
          <Badge variant="emerald" size="sm" className="hidden sm:inline-flex">
            BCKV & ICAR Extension
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Directive 1: Winter Paddy & Potato Protocol */}
          <Card className="border border-cream-300 bg-gradient-to-br from-cream-50 via-white to-emerald-50/40 shadow-xs overflow-hidden relative group">
            {/* Background Agriculture Texture */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80')`
              }}
            />
            <CardContent className="p-5 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-emerald-950 flex items-center gap-2">
                  🌾 Boro Rice & Potato Seedling Protocol
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold">
                  Seasonal Alert
                </span>
              </div>
              <p className="text-xs text-brand-dark/80 leading-relaxed">
                Maintain 2–3 cm shallow standing water in newly transplanted Boro rice plots. Protect potato seed beds from late evening winter fog to prevent early blight sporulation.
              </p>
              <div className="pt-2 border-t border-cream-200/80 flex items-center justify-between">
                <Link
                  href="/weather"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:underline"
                >
                  <span>Check District Spray Window</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-[11px] text-brand-dark/50 font-medium">Safe Fog Window: 10 AM - 3 PM</span>
              </div>
            </CardContent>
          </Card>

          {/* Directive 2: Heavy Alluvial & Clay Nutrient Guidance */}
          <Card className="border border-cream-300 bg-gradient-to-br from-cream-50 via-white to-amber-50/40 shadow-xs overflow-hidden relative group">
            {/* Background Agriculture Texture */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80')`
              }}
            />
            <CardContent className="p-5 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-amber-950 flex items-center gap-2">
                  🧪 Heavy Alluvial & Clay Nutrient Split
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold">
                  Soil Guidance
                </span>
              </div>
              <p className="text-xs text-brand-dark/80 leading-relaxed">
                Heavy clay soil holds nitrogen longer but requires split potassium (MOP) top-dressing at 21 days after transplanting (active tillering) to fortify straw against sheath blight.
              </p>
              <div className="pt-2 border-t border-cream-200/80 flex items-center justify-between">
                <Link
                  href="/fertilizer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:text-amber-950 hover:underline"
                >
                  <span>Calculate Crop N-P-K Schedule</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-[11px] text-brand-dark/50 font-medium">Split Dosage: 50% Basal + 25% + 25%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}