'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Sprout, ShieldAlert, FlaskConical, Scale } from 'lucide-react';

const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);
const BarChart = dynamic(
  () => import('recharts').then((mod) => mod.BarChart),
  { ssr: false, loading: () => <div className="h-56 bg-cream-100/60 rounded-2xl animate-pulse" /> }
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

export interface FarmIntelligenceStageProps {
  yieldData: Array<{ crop: string; predicted: number; actual: number; isPending?: boolean }>;
  totalProjectedTons: number;
  severityData: Array<{ name: string; value: number; color: string }>;
  landData: Array<{ name: string; area: number }>;
  soilSummary?: { nRate: string; pRate: string; kRate: string; phRate: string } | null;
}

type TabType = 'yield' | 'pathogens' | 'soil' | 'land';

export function FarmIntelligenceStage({
  yieldData,
  totalProjectedTons,
  severityData,
  landData,
  soilSummary,
}: FarmIntelligenceStageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('yield');

  const tabs = [
    { id: 'yield', label: 'Harvest & Yield', icon: Scale },
    { id: 'pathogens', label: 'Crop Pathogens', icon: ShieldAlert },
    { id: 'soil', label: 'Soil Fertility', icon: FlaskConical },
    { id: 'land', label: 'Land Allocation', icon: Sprout },
  ];

  return (
    <div className="w-full bg-white/95 rounded-3xl border border-cream-300 shadow-xs overflow-hidden text-left">
      {/* Category Segmented Control with Sliding Pill Indicator */}
      <div className="p-2 sm:p-3 border-b border-cream-200 bg-cream-50/70 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 p-1 bg-cream-200/70 rounded-2xl shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#143224] text-white shadow-xs scale-[1.02]'
                    : 'text-brand-dark/70 hover:text-brand-dark hover:bg-white/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D9822B]' : 'text-emerald-700'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === 'yield' && (
          <span className="hidden sm:inline-flex text-xs font-extrabold text-[#D9822B] px-3 py-1 rounded-full bg-amber-50 border border-amber-200 shrink-0">
            Total Projected: {totalProjectedTons.toFixed(1)} Tons
          </span>
        )}
      </div>

      {/* The Single Compact Animated Stage Viewport (~320px) */}
      <div className="p-4 sm:p-6 min-h-[320px] max-h-[360px] flex flex-col justify-center transition-all duration-300">
        
        {/* VIEW 1: Yield Comparison */}
        {activeTab === 'yield' && (
          <div className="w-full space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-brand-dark/70">
              <span className="font-semibold">Predicted vs Actual Harvest Production (Tons)</span>
              <span className="text-[11px] text-brand-dark/50">BCKV & ICAR Baselines</span>
            </div>
            {yieldData.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-xs text-brand-dark/60 italic">
                Calculate crop yield in Yield Projection tool to view harvest benchmarks.
              </div>
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yieldData}>
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
            )}
          </div>
        )}

        {/* VIEW 2: Pathogen & Disease Distribution */}
        {activeTab === 'pathogens' && (
          <div className="w-full space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-brand-dark/70">
              <span className="font-semibold">Disease Severity Breakdown Across Scanned Crops</span>
              <span className="text-[11px] text-brand-dark/50">Pathogen Severity Distribution</span>
            </div>
            {severityData.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-xs text-brand-dark/60 italic">
                No disease scans recorded yet. Scan a leaf to view health distribution.
              </div>
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      innerRadius={45}
                      paddingAngle={3}
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: Soil Fertility Benchmarks */}
        {activeTab === 'soil' && (
          <div className="w-full space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-brand-dark/70">
              <span className="font-semibold">Soil Health Card Macronutrient Ratings</span>
              <span className="text-[11px] text-brand-dark/50">ICAR Soil Classification</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 text-center space-y-1">
                <span className="text-xs font-bold text-brand-dark/60">Nitrogen (N)</span>
                <p className="text-base font-extrabold text-emerald-800">
                  {soilSummary?.nRate || 'Optimal'}
                </p>
                <span className="text-[10px] text-brand-dark/50">Target: 280-560 kg/ha</span>
              </div>
              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 text-center space-y-1">
                <span className="text-xs font-bold text-brand-dark/60">Phosphorus (P)</span>
                <p className="text-base font-extrabold text-emerald-800">
                  {soilSummary?.pRate || 'Balanced'}
                </p>
                <span className="text-[10px] text-brand-dark/50">Target: 10-25 kg/ha</span>
              </div>
              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 text-center space-y-1">
                <span className="text-xs font-bold text-brand-dark/60">Potassium (K)</span>
                <p className="text-base font-extrabold text-emerald-800">
                  {soilSummary?.kRate || 'Adequate'}
                </p>
                <span className="text-[10px] text-brand-dark/50">Target: 110-280 kg/ha</span>
              </div>
              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 text-center space-y-1">
                <span className="text-xs font-bold text-brand-dark/60">Soil pH</span>
                <p className="text-base font-extrabold text-[#143224]">
                  {soilSummary?.phRate || '6.5 (Neutral)'}
                </p>
                <span className="text-[10px] text-brand-dark/50">Target: 6.0 - 7.5</span>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: Land Allocation in Bigha */}
        {activeTab === 'land' && (
          <div className="w-full space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-brand-dark/70">
              <span className="font-semibold">Normalized Cultivated Land Allocation (Bigha)</span>
              <span className="text-[11px] text-brand-dark/50">Plot Acreage</span>
            </div>
            {landData.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-xs text-brand-dark/60 italic">
                No active crops registered yet. Add crops to view land distribution.
              </div>
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={landData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0efe9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value: any) => [`${value} Bigha`, 'Cultivated Area']} />
                    <Bar dataKey="area" fill="#143224" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
