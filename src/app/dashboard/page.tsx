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
  Newspaper,
  CheckCircle2,
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
  FileText,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { formatLandArea, LandUnit } from '@/lib/units';

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

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();

  const [farms, setFarms] = useState<FarmData[]>([]);
  const [crops, setCrops] = useState<CropData[]>([]);
  const [scans, setScans] = useState<ScanData[]>([]);
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

        // Fetch user's recent scans
        const { data: scansData } = await supabase
          .from('crop_scans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (scansData) setScans(scansData as ScanData[]);
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
      {/* Prestigious Panoramic Agricultural Hero Banner (Inspired by Government of India Soil Health Card Portal) */}
      <div className="relative overflow-hidden rounded-3xl bg-brand-forest shadow-lg border border-brand-leaf/20 text-white">
        {/* Background Panoramic Crop Photography with Forest Gradient Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1600&q=80')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-forest via-brand-forest/90 to-brand-leaf/80" />

        {/* Hero Content */}
        <div className="relative p-6 sm:p-8 lg:p-10 space-y-5">
          {/* Official Authority Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Government of West Bengal • ICAR & BCKV Knowledge Core</span>
            </span>
            <div className="flex items-center gap-1.5 text-xs text-white/70">
              <Calendar className="w-3.5 h-3.5" />
              <span>{todayDate}</span>
              <span>•</span>
              <MapPin className="w-3.5 h-3.5" />
              <span>{locationDisplay}</span>
            </div>
          </div>

          {/* Prestige Headline with Serif Accent */}
          <div className="space-y-2 max-w-3xl">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Empowering Bengal Farmers With{' '}
              <span className="font-serif italic text-emerald-300 font-normal">Real-Time Agronomy</span>{' '}
              For Sustainable Yields
            </h1>
            <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
              Welcome back, <strong className="text-white font-semibold">{farmerName}</strong>. 
              Access localized disease diagnosis, balanced N-P-K nutrient guidance, 
              weather pathogen warnings, and official government welfare dispatches.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link href="/scan">
              <Button 
                variant="amber" 
                size="md" 
                leftIcon={<ScanLine className="w-4 h-4" />}
                className="shadow-md hover:shadow-lg transition-shadow"
              >
                Scan Crop Leaf Now
              </Button>
            </Link>
            <Link href="/assistant">
              <Button 
                variant="secondary" 
                size="md" 
                leftIcon={<Bot className="w-4 h-4 text-brand-leaf" />}
                className="bg-white/90 hover:bg-white text-brand-forest border-none shadow-md"
              >
                Ask AI Agronomist
              </Button>
            </Link>
            <Link href="/schemes">
              <Button 
                variant="ghost" 
                size="md" 
                leftIcon={<FileText className="w-4 h-4 text-emerald-200" />}
                className="text-white hover:bg-white/10 border border-white/20"
              >
                Government Schemes
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Highlight Cards (Directly matching Soil Health Card Government Portal layout) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Highlight 1: Soil Insights & NPK */}
        <Link 
          href="/soil" 
          className="group block p-5 rounded-2xl bg-white border border-cream-200 hover:border-brand-leaf/40 hover:shadow-md transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-brand-dark group-hover:text-brand-forest flex items-center gap-1.5 transition-colors">
                <span>Soil Insights & N-P-K Guide</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand-leaf" />
              </h3>
              <p className="text-xs text-brand-dark/70 leading-relaxed">
                Balanced nutrient schedules & organic amendments tailored to Bengal alluvial, red, and clay soils.
              </p>
            </div>
          </div>
        </Link>

        {/* Highlight 2: Pathogen & Weather Surveillance */}
        <Link 
          href="/weather" 
          className="group block p-5 rounded-2xl bg-white border border-cream-200 hover:border-brand-leaf/40 hover:shadow-md transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shrink-0 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-brand-dark group-hover:text-brand-forest flex items-center gap-1.5 transition-colors">
                <span>Pathogen & Weather Radar</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand-leaf" />
              </h3>
              <p className="text-xs text-brand-dark/70 leading-relaxed">
                Active alerts for Potato Late Blight, Rice Sheath Blight & high-humidity fungal risk across your district.
              </p>
            </div>
          </div>
        </Link>

        {/* Highlight 3: Schemes & Welfare Tracker */}
        <Link 
          href="/schemes" 
          className="group block p-5 rounded-2xl bg-white border border-cream-200 hover:border-brand-leaf/40 hover:shadow-md transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-brand-dark group-hover:text-brand-forest flex items-center gap-1.5 transition-colors">
                <span>Welfare & Subsidies (FY 2025–26)</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand-leaf" />
              </h3>
              <p className="text-xs text-brand-dark/70 leading-relaxed">
                Check active status for Krishak Bandhu, PM-KISAN, and direct beneficiary status lookup portals.
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Overview Stat Cards (Derived strictly from real DB records with color top accents) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Farms */}
        <Card className="border-t-4 border-t-brand-forest hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-brand-dark/70">
                {t('dashboard.totalFarms')}
              </p>
              <h3 className="text-2xl font-black text-brand-forest mt-1">
                {farms.length}
              </h3>
              <p className="text-[11px] text-brand-dark/50 mt-0.5">Registered plots</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-forest/10 flex items-center justify-center text-brand-forest">
              <Warehouse className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Total Crops */}
        <Card className="border-t-4 border-t-brand-leaf hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-brand-dark/70">
                {t('dashboard.totalCrops')}
              </p>
              <h3 className="text-2xl font-black text-brand-forest mt-1">
                {crops.length}
              </h3>
              <p className="text-[11px] text-brand-dark/50 mt-0.5">Sown varieties</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-leaf/10 flex items-center justify-center text-brand-leaf">
              <Sprout className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Total Scans */}
        <Card className="border-t-4 border-t-brand-amber hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-brand-dark/70">
                {t('dashboard.totalScans')}
              </p>
              <h3 className="text-2xl font-black text-brand-forest mt-1">
                {scans.length}
              </h3>
              <p className="text-[11px] text-brand-dark/50 mt-0.5">Leaves analyzed</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700">
              <ScanLine className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Crop Health Overview */}
        <Card className="border-t-4 border-t-emerald-600 hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-brand-dark/70">
                {t('dashboard.healthyCrops')}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-2xl font-black text-emerald-700">
                  {healthyCropsCount}
                </span>
                {attentionCropsCount > 0 && (
                  <Badge variant="amber" size="sm">
                    {attentionCropsCount} Alert
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-brand-dark/50 mt-0.5">
                {attentionCropsCount === 0 ? 'All crops optimal' : 'Requires attention'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-brand-dark">
            {t('dashboard.quickActions')}
          </h2>
          <span className="text-xs text-brand-dark/50 font-medium">1-Tap Farmer Tools</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <Link
            href="/scan"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-cream-200/90 hover:border-brand-leaf/40 hover:shadow-xs transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <ScanLine className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-brand-dark">
              {t('nav.scan')}
            </span>
            <span className="text-[10px] text-brand-dark/50 mt-0.5">AI Leaf Diagnosis</span>
          </Link>

          <Link
            href="/assistant"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-cream-200/90 hover:border-brand-leaf/40 hover:shadow-xs transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-forest/10 text-brand-forest flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Bot className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-brand-dark">
              {t('nav.assistant')}
            </span>
            <span className="text-[10px] text-brand-dark/50 mt-0.5">Ask Agronomist</span>
          </Link>

          <Link
            href="/crops"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-cream-200/90 hover:border-brand-leaf/40 hover:shadow-xs transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-lime-50 text-lime-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-brand-dark">
              {t('crops.addCrop')}
            </span>
            <span className="text-[10px] text-brand-dark/50 mt-0.5">Track Sowing</span>
          </Link>

          <Link
            href="/weather"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-cream-200/90 hover:border-brand-leaf/40 hover:shadow-xs transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <CloudSun className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-brand-dark">
              {t('nav.weather')}
            </span>
            <span className="text-[10px] text-brand-dark/50 mt-0.5">Pathogen Index</span>
          </Link>

          <Link
            href="/news"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-cream-200/90 hover:border-brand-leaf/40 hover:shadow-xs transition-all text-center group col-span-2 sm:col-span-1"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Newspaper className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-brand-dark">
              {t('nav.news')}
            </span>
            <span className="text-[10px] text-brand-dark/50 mt-0.5">Live Dispatches</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: My Farm & Active Crops vs Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: My Farm & Active Crops (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Farm Plots Overview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-brand-leaf" />
                <span>{t('farms.title')}</span>
              </CardTitle>
              <Link href="/farms" className="text-xs font-semibold text-brand-leaf hover:underline">
                {t('dashboard.viewAll')} →
              </Link>
            </CardHeader>
            <CardContent>
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
                  {farms.slice(0, 3).map((farm) => (
                    <div
                      key={farm.id}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-cream-50 border border-cream-200/90"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-brand-dark">
                          {farm.name}
                        </h4>
                        <p className="text-xs text-brand-dark/70">
                          {farm.location_name || 'Location recorded'} • {formatLandArea(farm.area, farm.area_unit as LandUnit)}
                        </p>
                      </div>
                      <Badge variant="slate" size="sm">
                        {farm.soil_type || 'Soil logged'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Crops */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sprout className="w-4 h-4 text-brand-leaf" />
                <span>{t('crops.title')}</span>
              </CardTitle>
              <Link href="/crops" className="text-xs font-semibold text-brand-leaf hover:underline">
                {t('dashboard.viewAll')} →
              </Link>
            </CardHeader>
            <CardContent>
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
                  {crops.slice(0, 4).map((crop) => (
                    <div
                      key={crop.id}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-cream-50 border border-cream-200/90"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-brand-dark">
                            {crop.name}
                          </h4>
                          {crop.variety && (
                            <span className="text-[11px] text-brand-dark/60">
                              ({crop.variety})
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-brand-dark/70 mt-0.5">
                          Sown: {crop.planting_date} • {formatLandArea(crop.area, crop.area_unit as LandUnit)}
                        </p>
                      </div>

                      <Badge
                        variant={
                          crop.health_status === 'healthy'
                            ? 'emerald'
                            : crop.health_status === 'needs_attention'
                            ? 'amber'
                            : 'red'
                        }
                        size="sm"
                      >
                        {crop.health_status === 'healthy'
                          ? t('crops.healthy')
                          : crop.health_status === 'needs_attention'
                          ? t('crops.needsAttention')
                          : t('crops.diseased')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Recent Scans & Agronomic Insights (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recent Disease Scans */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ScanLine className="w-4 h-4 text-brand-leaf" />
                <span>{t('dashboard.recentScans')}</span>
              </CardTitle>
              <Link href="/scan" className="text-xs font-semibold text-brand-leaf hover:underline">
                New Scan →
              </Link>
            </CardHeader>
            <CardContent>
              {scans.length === 0 ? (
                <EmptyState
                  icon={<ScanLine className="w-6 h-6" />}
                  title={t('dashboard.noScansYet')}
                  description="Diagnose diseased leaves with multimodal AI vision to safeguard your harvest."
                  actionLabel={t('dashboard.scanFirstCrop')}
                  onAction={() => (window.location.href = '/scan')}
                />
              ) : (
                <div className="space-y-3">
                  {scans.map((scan) => (
                    <div
                      key={scan.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-cream-50 border border-cream-200/90"
                    >
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={scan.image_url}
                          alt={scan.crop_name}
                          className="w-10 h-10 rounded-lg object-cover border border-cream-200"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-brand-dark">
                            {scan.crop_name}
                          </h4>
                          <p className="text-[11px] text-brand-dark/70">
                            {scan.disease_name || 'Healthy Crop'}
                          </p>
                        </div>
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
                      >
                        {scan.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Regional Agronomy Insights Card */}
          <Card className="bg-gradient-to-br from-cream-100/90 to-white border-cream-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-harvest" />
                <CardTitle className="text-base font-bold text-brand-dark">
                  {t('dashboard.insightsTitle')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs leading-relaxed text-brand-dark/80">
              <div className="p-3 rounded-xl bg-white border border-cream-200 shadow-2xs">
                <span className="font-bold text-brand-forest block mb-1">
                  🌾 Bengal Winter Season Advisory
                </span>
                Maintain 2-3 cm shallow water in newly transplanted Boro rice plots. Protect potato seed beds from late evening fog to prevent early blight sporulation.
              </div>
              <div className="p-3 rounded-xl bg-white border border-cream-200 shadow-2xs">
                <span className="font-bold text-brand-forest block mb-1">
                  🧪 Soil Nutrient Management
                </span>
                Soil testing prevents costly fertilizer overuse. Log your official Soil Health Card parameters to generate customized dosage schedules.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
