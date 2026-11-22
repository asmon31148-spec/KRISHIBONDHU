'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  LineChart as AnalyticsIcon,
  Printer,
} from 'lucide-react';

interface ScanMetric {
  id: string;
  crop_name: string;
  severity: string;
  created_at: string;
}

interface CropMetric {
  id: string;
  name: string;
  area: number;
  health_status: string;
}

interface YieldMetric {
  id: string;
  crop_name: string;
  total_expected_production_tons: number;
  actual_harvest_yield_tons: number | null;
  prediction_date: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  healthy: '#10B981', // Emerald
  mild: '#F59E0B', // Amber
  moderate: '#F97316', // Orange
  severe: '#EF4444', // Red
  uncertain: '#64748B', // Slate
};

export default function AnalyticsPage() {
  const { user, isGuest } = useAuth();

  const [scans, setScans] = useState<ScanMetric[]>([]);
  const [crops, setCrops] = useState<CropMetric[]>([]);
  const [yields, setYields] = useState<YieldMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalyticsData = useCallback(async () => {
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
      // 1. Fetch user's scans
      const { data: scansData } = await supabase
        .from('crop_scans')
        .select('id, crop_name, severity, created_at')
        .eq('user_id', user.id);
      if (scansData) setScans(scansData as ScanMetric[]);

      // 2. Fetch user's crops
      const { data: cropsData } = await supabase
        .from('crops')
        .select('id, name, area, health_status')
        .eq('user_id', user.id);
      if (cropsData) setCrops(cropsData as CropMetric[]);

      // 3. Fetch user's yield predictions
      const { data: yieldsData } = await supabase
        .from('yield_predictions')
        .select('id, crop_name, total_expected_production_tons, actual_harvest_yield_tons, prediction_date')
        .eq('user_id', user.id);
      if (yieldsData) setYields(yieldsData as YieldMetric[]);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  if (isGuest) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-brand-harvest flex items-center justify-center mx-auto">
          <AnalyticsIcon className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-brand-forest">
          Agronomy Analytics (Account Required)
        </h2>
        <p className="text-xs sm:text-sm text-brand-dark/70 leading-relaxed">
          Historical yield trends, disease frequencies, and farm production charts are generated from saved farmer records. Create a free account to track your multi-season performance.
        </p>
        <div className="pt-2">
          <Link href="/auth/signup">
            <Button variant="primary">
              Create Free Account
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 1. Compute Disease Severity Distribution for Pie Chart
  const severityCounts: Record<string, number> = {};
  scans.forEach((s) => {
    severityCounts[s.severity] = (severityCounts[s.severity] || 0) + 1;
  });

  const severityPieData = Object.entries(severityCounts).map(([sev, count]) => ({
    name: sev.charAt(0).toUpperCase() + sev.slice(1),
    value: count,
    color: SEVERITY_COLORS[sev] || '#64748B',
  }));

  // 2. Compute Crop Cultivated Area Comparison
  const cropAreaData = crops.map((c) => ({
    name: c.name.split(' ')[0], // short name
    area: c.area,
  }));

  // 3. Compute Yield Prediction vs Actual Harvest
  const yieldComparisonData = yields.map((y) => ({
    crop: y.crop_name.split(' ')[0],
    predicted: y.total_expected_production_tons,
    actual: y.actual_harvest_yield_tons || 0,
  }));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-left print:m-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-forest">
            Farm History & Agronomy Analytics
          </h1>
          <p className="text-xs sm:text-sm text-brand-dark/70 mt-1">
            Data-backed performance trends, disease incidence distribution, and production analytics.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          leftIcon={<Printer className="w-3.5 h-3.5 text-brand-forest" />}
          className="print:hidden"
        >
          Print Full Report
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-cream-100 rounded-3xl border border-cream-200" />
          ))}
        </div>
      ) : scans.length === 0 && crops.length === 0 && yields.length === 0 ? (
        <EmptyState
          icon={<AnalyticsIcon className="w-8 h-8" />}
          title="No Analytics Data Yet"
          description="Scan crops and add your plots to view historical disease trends and harvest comparisons."
          actionLabel="Scan Your First Crop"
          onAction={() => (window.location.href = '/scan')}
        />
      ) : (
        <div className="space-y-6">
          {/* Top Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card className="p-4">
              <span className="text-xs text-brand-dark/60 font-semibold block">Total Crop Scans</span>
              <h3 className="text-2xl font-black text-brand-forest mt-1">{scans.length}</h3>
            </Card>
            <Card className="p-4">
              <span className="text-xs text-brand-dark/60 font-semibold block">Active Crops</span>
              <h3 className="text-2xl font-black text-brand-forest mt-1">{crops.length}</h3>
            </Card>
            <Card className="p-4">
              <span className="text-xs text-brand-dark/60 font-semibold block">Yield Models Run</span>
              <h3 className="text-2xl font-black text-brand-forest mt-1">{yields.length}</h3>
            </Card>
            <Card className="p-4">
              <span className="text-xs text-brand-dark/60 font-semibold block">Healthy Scan Ratio</span>
              <h3 className="text-2xl font-black text-emerald-700 mt-1">
                {scans.length > 0
                  ? `${Math.round(
                      (scans.filter((s) => s.severity === 'healthy').length / scans.length) * 100
                    )}%`
                  : 'N/A'}
              </h3>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Disease Severity Distribution */}
            <Card className="p-5 space-y-3">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-bold text-brand-dark">
                  Disease Severity Incidence Breakdown
                </CardTitle>
                <p className="text-xs text-brand-dark/60">
                  Distribution of diagnosed leaf pathology across all scans.
                </p>
              </div>

              {severityPieData.length === 0 ? (
                <div className="h-60 flex items-center justify-center text-xs text-brand-dark/50 italic">
                  No scan records available to chart.
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={severityPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {severityPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* Chart 2: Cultivated Land Allocation */}
            <Card className="p-5 space-y-3">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-bold text-brand-dark">
                  Crop Acreage Allocation
                </CardTitle>
                <p className="text-xs text-brand-dark/60">
                  Area cultivated per crop record.
                </p>
              </div>

              {cropAreaData.length === 0 ? (
                <div className="h-60 flex items-center justify-center text-xs text-brand-dark/50 italic">
                  No active crops recorded.
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cropAreaData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0efe9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="area" fill="#2D6A4F" radius={[6, 6, 0, 0]} name="Area" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* Chart 3: Predicted vs Actual Harvest Yields */}
            <Card className="p-5 space-y-3 lg:col-span-2">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-bold text-brand-dark">
                  Predicted vs Actual Harvest Production (Tons)
                </CardTitle>
                <p className="text-xs text-brand-dark/60">
                  Compares estimated ICAR model projections with verified farmer recorded harvests.
                </p>
              </div>

              {yieldComparisonData.length === 0 ? (
                <div className="h-60 flex items-center justify-center text-xs text-brand-dark/50 italic">
                  Run yield calculations to view production benchmarks.
                </div>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={yieldComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0efe9" />
                      <XAxis dataKey="crop" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="predicted" fill="#D97706" name="Predicted (Tons)" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="actual" fill="#1B4332" name="Actual Harvest (Tons)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
