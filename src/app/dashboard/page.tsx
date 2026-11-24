'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { UnifiedFarmAnalytics } from '@/components/dashboard/UnifiedFarmAnalytics';
import { Button } from '@/components/ui/Button';
import {
  ScanLine,
  Bot,
  Warehouse,
  AlertTriangle,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { convertLandArea, LandUnit } from '@/lib/units';

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
  healthy: '#10B981', // Vibrant Emerald Green
  mild: '#F59E0B', // Warm Amber Gold
  moderate: '#F97316', // Vibrant Fiery Orange
  severe: '#EF4444', // High-Alert Crimson Red
  uncertain: '#8B5CF6', // Purple/Violet
};

export default function DashboardPage() {
  const { user, profile } = useAuth();

  const [farms, setFarms] = useState<FarmData[]>([]);
  const [crops, setCrops] = useState<CropData[]>([]);
  const [scans, setScans] = useState<ScanData[]>([]);
  const [yields, setYields] = useState<YieldMetric[]>([]);
  const [allScans, setAllScans] = useState<ScanMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

        // Fetch user's recent leaf scans
        const { data: scansData } = await supabase
          .from('crop_scans')
          .select('id, crop_name, disease_name, severity, crop_confidence, image_url, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(8);

        if (scansData) setScans(scansData as ScanData[]);

        // Fetch real historical yield benchmarks for this user
        const { data: yieldsData } = await supabase
          .from('yield_predictions')
          .select('id, crop_name, total_expected_production_tons, actual_harvest_yield_tons, prediction_date')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (yieldsData) setYields(yieldsData as YieldMetric[]);

        // Fetch scan metrics for severity breakdown
        const { data: scanMetricsData } = await supabase
          .from('crop_scans')
          .select('id, crop_name, severity, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100);

        if (scanMetricsData) setAllScans(scanMetricsData as ScanMetric[]);
      } catch (err) {
        console.warn('Dashboard data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

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
  const severityCounts: Record<string, number> = {
    healthy: 0,
    mild: 0,
    moderate: 0,
    severe: 0,
  };
  (allScans.length > 0 ? allScans : scans).forEach((s) => {
    const raw = (s.severity || 'healthy').toLowerCase().trim();
    if (raw === 'healthy') severityCounts.healthy += 1;
    else if (raw === 'mild') severityCounts.mild += 1;
    else if (raw === 'moderate') severityCounts.moderate += 1;
    else if (raw === 'severe') severityCounts.severe += 1;
    else severityCounts.moderate += 1;
  });

  const severityPieData = Object.entries(severityCounts)
    .filter(([_, count]) => count > 0)
    .map(([sev, count]) => ({
      name: sev.charAt(0).toUpperCase() + sev.slice(1),
      value: count,
      color: SEVERITY_COLORS[sev] || '#F97316',
    }));

  // 2. Crop Land Allocation normalized to Bigha
  const cropAreaData = crops.map((c) => {
    const rawUnit = (c.area_unit?.toLowerCase() || 'bigha') as LandUnit;
    const validUnit: LandUnit = ['acres', 'bigha', 'katha', 'hectares'].includes(rawUnit) ? rawUnit : 'bigha';
    const normalizedBigha = convertLandArea(c.area, validUnit, 'bigha');
    return {
      name: c.name.split(' ')[0],
      area: Math.round(normalizedBigha * 10) / 10,
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

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-16 bg-cream-100/70 rounded-2xl border border-cream-200" />
        <div className="h-80 bg-cream-100/70 rounded-3xl border border-cream-200" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="h-14 bg-cream-100/70 rounded-2xl" />
          <div className="h-14 bg-cream-100/70 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full text-left max-w-7xl mx-auto">
      {/* 1. MINIMALIST HEADS-UP DISPLAY (HUD) - No heavy box borders */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cream-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#143224] tracking-tight">
            Welcome back, {farmerName}
          </h1>
          <p className="text-xs text-brand-dark/70 font-medium mt-0.5">
            {locationDisplay} • {todayDate}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {attentionCropsCount > 0 && (
            <Link
              href="/assistant"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-900 text-xs font-bold animate-pulse hover:bg-amber-500/25 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              <span>{attentionCropsCount} Plot Needs Attention</span>
            </Link>
          )}
          <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-cream-100/90 border border-cream-200 text-brand-dark/80">
            ⛅ 28°C • Optimal Spray Window
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-3.5 h-3.5 text-[#143224]" />}
            className="print:hidden border-[#143224]/15 hover:bg-white text-xs font-bold text-[#143224] shadow-2xs"
          >
            Print
          </Button>
        </div>
      </div>

      {/* 2. THE UNIFIED EXECUTIVE FARM ANALYTICS MATRIX (ALL ANALYSES IN ONE PAGE) */}
      <UnifiedFarmAnalytics
        yieldData={yieldComparisonData}
        totalProjectedTons={totalProjectedTons}
        severityData={severityPieData}
        landData={cropAreaData}
        cropCount={crops.length}
        attentionCropsCount={attentionCropsCount}
        totalLandBigha={farms.reduce((acc, f) => acc + (f.area || 0), 0) || 5.0}
        district={profile?.district || 'South 24 Parganas, West Bengal'}
      />

      {/* 3. PRIMARY ACTION DOCK - Exactly 2 High-Contrast Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <Link href="/scan" className="group">
          <button className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-[#143224] hover:bg-[#1E4733] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer">
            <ScanLine className="w-5 h-5 text-[#D9822B]" />
            <span>Scan Plant Leaf for Disease</span>
          </button>
        </Link>

        <Link href="/assistant" className="group">
          <button className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-white hover:bg-cream-100 text-[#143224] border-2 border-[#143224] font-bold text-sm shadow-xs transition-all active:scale-[0.99] cursor-pointer">
            <Bot className="w-5 h-5 text-emerald-700" />
            <span>Speak with Agronomy AI Assistant</span>
          </button>
        </Link>
      </div>

      {/* 4. UNIFIED RECENT ACTIVITY STREAM & PLOT SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
        {/* Left Column: Recent Diagnostic Activity (7 cols) */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-dark/60">
              Recent Activity
            </h3>
            <Link href="/scans/history" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
              <span>View All History</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {scans.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white border border-cream-200 text-center text-xs text-brand-dark/50">
              No recent scans. Tap &quot;Scan Plant Leaf&quot; above to diagnose your first crop leaf.
            </div>
          ) : (
            <div className="divide-y divide-cream-200 rounded-2xl bg-white border border-cream-200 overflow-hidden shadow-2xs">
              {scans.slice(0, 4).map((scan) => (
                <div key={scan.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-cream-50/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        scan.severity === 'healthy'
                          ? 'bg-emerald-500'
                          : scan.severity === 'severe'
                          ? 'bg-red-500'
                          : 'bg-amber-500'
                      }`}
                    />
                    <span className="font-bold text-brand-dark truncate">{scan.crop_name}</span>
                    <span className="text-brand-dark/60 truncate">• {scan.disease_name || 'Healthy Leaf'}</span>
                  </div>
                  <span className="text-brand-dark/50 text-[11px] shrink-0 ml-2">
                    {new Date(scan.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Registered Plots Quick Overview (5 cols) */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-dark/60">
              My Farm Plots ({farms.length})
            </h3>
            <Link href="/farms" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
              <span>Manage Farms</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {farms.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white border border-cream-200 text-center text-xs text-brand-dark/50">
              No farm plots registered yet. Register a plot in &quot;My Farm&quot; to track crops and soil health.
            </div>
          ) : (
            <div className="space-y-2">
              {farms.slice(0, 3).map((farm) => (
                <div key={farm.id} className="p-3 rounded-2xl bg-white border border-cream-200 shadow-2xs flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 shrink-0">
                      <Warehouse className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-brand-dark truncate">{farm.name}</p>
                      <p className="text-[11px] text-brand-dark/60 truncate">{farm.area} {farm.area_unit || 'Bigha'} • {farm.soil_type || 'Alluvial'}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/50 shrink-0">
                    Active
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
