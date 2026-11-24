'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sprout,
  Compass,
  Plus,
  Scale,
  ScanLine,
  Bot,
  Edit2,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  FlaskConical,
} from 'lucide-react';

import type { Farm, Crop, SoilRecord } from '@/app/farms/page';

export type { Farm, Crop, SoilRecord };

export interface LivingFarmCanvasProps {
  farms: Farm[];
  crops: Crop[];
  soils: SoilRecord[];
  activeLang?: string;
  onAddFarm: () => void;
  onEditFarm: (farm: Farm) => void;
  onDeleteFarm: (id: string) => void;
  onAddCrop: (farmId: string) => void;
  onEditCrop: (crop: Crop) => void;
  onDeleteCrop: (id: string) => void;
  onAddSoil: (farmId: string) => void;
}

export function LivingFarmCanvas({
  farms,
  crops,
  soils,
  activeLang: _activeLang = 'en',
  onAddFarm,
  onEditFarm,
  onDeleteFarm,
  onAddCrop,
  onEditCrop,
  onDeleteCrop,
  onAddSoil,
}: LivingFarmCanvasProps) {
  const [selectedFarmIndex, setSelectedFarmIndex] = useState(0);
  const activeFarm = farms[selectedFarmIndex] || farms[0] || null;
  const activeCrops = activeFarm ? crops.filter((c) => c.farm_id === activeFarm.id) : [];
  const activeSoil = activeFarm ? soils.find((s) => s.farm_id === activeFarm.id) : null;

  // Calculate Farm Aura
  const hasAlert = activeCrops.some((c) => c.health_status !== 'healthy');

  if (farms.length === 0) {
    return null;
  }

  return (
    <div
      className={`relative w-full transition-colors duration-700 p-4 sm:p-6 lg:p-8 rounded-3xl ${
        hasAlert
          ? 'bg-gradient-to-b from-amber-500/8 via-[#F9F7F2] to-white/90'
          : 'bg-gradient-to-b from-emerald-500/8 via-[#F9F7F2] to-white/90'
      }`}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. TOP HORIZON: Interactive Land Parcel Arc (Zero Hard Boxes)
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#143224]/10 pb-4">
        {/* Plot Selector Chips with Sliding Organic Indicator */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          {farms.map((farm, idx) => {
            const isSelected = idx === selectedFarmIndex;
            return (
              <button
                key={farm.id}
                onClick={() => setSelectedFarmIndex(idx)}
                className={`relative px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#143224] text-white shadow-md scale-102 ring-2 ring-[#D9822B]/40'
                    : 'bg-white/80 hover:bg-white text-[#10241A]/70 hover:text-[#143224] border border-[#143224]/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSelected ? 'bg-[#D9822B] animate-pulse' : 'bg-gray-300'
                    }`}
                  />
                  <span>{farm.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-black/5 text-gray-600'
                    }`}
                  >
                    {farm.area} {farm.area_unit}
                  </span>
                </div>
              </button>
            );
          })}

          <button
            onClick={onAddFarm}
            className="px-3 py-2 rounded-2xl text-xs font-bold text-[#143224] bg-white/70 hover:bg-white border border-dashed border-[#143224]/20 hover:border-[#143224]/50 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#D9822B]" />
            <span>New Plot</span>
          </button>
        </div>

        {/* Live GPS & Soil Type Pill with Plot Quick Actions */}
        {activeFarm && (
          <div className="flex items-center gap-2 text-xs font-semibold text-[#10241A]/70 flex-wrap self-end sm:self-center">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/80 border border-[#143224]/10 shadow-2xs">
              <Compass className="w-3.5 h-3.5 text-[#1E4733]" />
              <span className="truncate max-w-[150px]">{activeFarm.location_name || 'Location Tracked'}</span>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-white/80 border border-[#143224]/10 capitalize shadow-2xs">
              {activeFarm.soil_type || 'Alluvial'} Soil
            </span>

            <div className="flex items-center gap-1 ml-1">
              <button
                onClick={() => onEditFarm(activeFarm)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-[#143224] hover:bg-white transition-all cursor-pointer"
                title="Edit Land Parcel"
                aria-label="Edit plot"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDeleteFarm(activeFarm.id)}
                className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-all cursor-pointer"
                title="Remove Land Parcel"
                aria-label="Delete plot"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. THE MAIN STAGE: Living Plot Horizon & Growth River
          ───────────────────────────────────────────────────────────── */}
      {activeFarm && (
        <div className="py-6 space-y-8 animate-in fade-in duration-300">
          {/* Active Crop Lifecycle River */}
          {activeCrops.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-white/60 backdrop-blur-md rounded-3xl border border-[#143224]/10 p-6">
              <div className="w-14 h-14 rounded-2xl bg-[#143224]/5 flex items-center justify-center text-[#143224]/40 mx-auto">
                <Sprout className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#143224]">No Crops Currently Planted on this Plot</h3>
              <p className="text-xs text-[#10241A]/60 max-w-sm mx-auto">
                Begin tracking growth stages, disease vulnerabilities, and harvest timelines by adding a crop.
              </p>
              <button
                onClick={() => onAddCrop(activeFarm.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#143224] text-white text-xs font-bold hover:bg-[#1E4733] transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#D9822B]" />
                <span>Plant Seasonal Crop</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#143224] flex items-center gap-1.5">
                  <Sprout className="w-4 h-4 text-[#D9822B]" />
                  <span>The Living Crop Growth River ({activeCrops.length} Active {activeCrops.length === 1 ? 'Crop' : 'Crops'})</span>
                </span>
                <button
                  onClick={() => onAddCrop(activeFarm.id)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-white hover:bg-[#EAF2EC] text-[#143224] text-xs font-bold border border-[#143224]/15 shadow-2xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#1E4733]" />
                  <span>Add Another Crop</span>
                </button>
              </div>

              {activeCrops.map((crop) => {
                const plantedDate = new Date(crop.planting_date);
                const daysInField = Math.max(
                  1,
                  Math.floor((Date.now() - plantedDate.getTime()) / (1000 * 60 * 60 * 24))
                );
                const isAlert = crop.health_status !== 'healthy';

                // Standard Bengal paddy/potato life cycle is ~90-110 days
                const totalCycleDays = 95;
                const progressPercent = Math.min(Math.round((daysInField / totalCycleDays) * 100), 100);
                const daysRemaining = Math.max(0, totalCycleDays - daysInField);

                return (
                  <div
                    key={crop.id}
                    className="space-y-4 p-4 sm:p-6 rounded-3xl bg-white/80 backdrop-blur-md border border-[#143224]/10 shadow-xs hover:border-[#143224]/25 transition-all"
                  >
                    {/* Crop Header Aura */}
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                            isAlert ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          <Sprout className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-base sm:text-lg font-extrabold text-[#143224]">{crop.name}</h2>
                            {crop.variety && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-white border border-[#143224]/10 text-[#143224] shadow-2xs">
                                {crop.variety}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-[#10241A]/60">
                            {crop.area} {crop.area_unit} • Sown {plantedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {crop.irrigation_type && ` • 💧 ${crop.irrigation_type}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                            isAlert
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                          }`}
                        >
                          {isAlert ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          ) : (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                          <span>{isAlert ? 'Needs Attention' : 'Healthy Growth'}</span>
                        </span>

                        <button
                          onClick={() => onEditCrop(crop)}
                          className="p-1.5 rounded-xl text-gray-500 hover:text-[#143224] hover:bg-black/5 transition-all cursor-pointer"
                          title="Edit Crop"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteCrop(crop.id)}
                          className="p-1.5 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-all cursor-pointer"
                          title="Delete Crop"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* THE GROWTH RIVER (Organic Continuous Flow) */}
                    <div className="relative py-6 px-3 sm:px-8 bg-gradient-to-r from-cream-50 via-white to-emerald-50/40 rounded-2xl border border-cream-200 shadow-2xs overflow-hidden">
                      {/* Connecting Fluid Vine */}
                      <div className="absolute top-1/2 left-6 right-6 h-2 bg-[#EAF2EC] -translate-y-1/2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-[#D9822B] transition-all duration-1000 rounded-full"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>

                      {/* Stage Nodes */}
                      <div className="relative flex items-center justify-between text-center gap-1">
                        {/* Node 1: Sowing */}
                        <div className="flex flex-col items-center">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                            🌱
                          </div>
                          <span className="text-[11px] sm:text-xs font-bold text-[#143224] mt-2">Sown</span>
                          <span className="text-[9px] sm:text-[10px] text-[#10241A]/50">Day 1</span>
                        </div>

                        {/* Node 2: Vegetative / Tillering (Active) */}
                        <div className="flex flex-col items-center">
                          <div className="relative">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold shadow-md ring-4 ring-emerald-100">
                              🌿
                            </div>
                            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                          </div>
                          <span className="text-[11px] sm:text-xs font-extrabold text-emerald-800 mt-2">
                            Tillering (Active)
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.2 rounded-full mt-0.5 whitespace-nowrap">
                            Day {daysInField} in Ground
                          </span>
                        </div>

                        {/* Node 3: Flowering */}
                        <div className="flex flex-col items-center">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border-2 border-emerald-300 text-gray-400 flex items-center justify-center text-xs font-bold shadow-2xs">
                            🌾
                          </div>
                          <span className="text-[11px] sm:text-xs font-medium text-gray-500 mt-2">Flowering</span>
                          <span className="text-[9px] sm:text-[10px] text-gray-400">~Day 75</span>
                        </div>

                        {/* Node 4: Harvest */}
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center text-xs font-bold shadow-2xs">
                            ✨
                          </div>
                          <span className="text-[11px] sm:text-xs font-bold text-amber-900 mt-2">Harvest</span>
                          <span className="text-[9px] sm:text-[10px] font-extrabold text-amber-800 bg-amber-50 px-2 py-0.2 rounded-full border border-amber-200 mt-0.5 whitespace-nowrap">
                            In ~{daysRemaining} Days
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              3. THE SOIL STRATA: Layered Earth Nutrient Meters (No Boxes)
              ───────────────────────────────────────────────────────────── */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white/85 backdrop-blur-md border border-[#143224]/10 space-y-4 shadow-xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#143224]">
                  Living Soil Strata & Fertility Balance
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#10241A]/60">
                  {activeSoil ? 'Soil Health Card Verified' : 'Standard Regional Baseline'}
                </span>
                <button
                  onClick={() => onAddSoil(activeFarm.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cream-100 hover:bg-cream-200 text-[#143224] text-xs font-bold transition-all cursor-pointer"
                >
                  <FlaskConical className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{activeSoil ? 'Update Test' : '+ Record Test'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-3.5 pt-1">
              {/* Nitrogen Gauge */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#143224]">Nitrogen (N)</span>
                  <span className="text-emerald-700 font-extrabold">{activeSoil?.nitrogen || 240} kg/ha • Balanced</span>
                </div>
                <div className="h-2.5 w-full bg-[#EAF2EC] rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, ((activeSoil?.nitrogen || 240) / 350) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Phosphorus Gauge */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#143224]">Phosphorus (P)</span>
                  <span className="text-blue-700 font-extrabold">{activeSoil?.phosphorus || 18} kg/ha • Optimal</span>
                </div>
                <div className="h-2.5 w-full bg-[#EAF2EC] rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-teal-600 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, ((activeSoil?.phosphorus || 18) / 35) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Potassium Gauge */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#143224]">Potassium (K)</span>
                  <span className="text-amber-700 font-extrabold">{activeSoil?.potassium || 190} kg/ha • Adequate</span>
                </div>
                <div className="h-2.5 w-full bg-[#EAF2EC] rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-[#D9822B] rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, ((activeSoil?.potassium || 190) / 280) * 100)}%` }}
                  />
                </div>
              </div>

              {/* pH Meter */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#143224]">Soil Acidity (pH)</span>
                  <span className="text-[#143224] font-extrabold">{activeSoil?.ph || 6.5} • Ideal Range (6.0 - 7.2)</span>
                </div>
                <div className="h-2.5 w-full bg-gradient-to-r from-red-400 via-emerald-400 to-blue-400 rounded-full relative">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-[#143224] rounded-full shadow-md"
                    style={{
                      left: `${Math.min(95, Math.max(5, (((activeSoil?.ph || 6.5) - 4) / (10 - 4)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. FLOATING ACTION DOCK (Glassmorphic Bottom Command Bar)
          ───────────────────────────────────────────────────────────── */}
      {activeFarm && activeCrops[0] && (
        <div className="sticky bottom-4 mt-6 z-20 flex justify-center">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-[#143224]/90 backdrop-blur-xl border border-white/20 shadow-xl text-white">
            <Link
              href={`/assistant?crop_id=${activeCrops[0].id}&crop_name=${encodeURIComponent(
                activeCrops[0].name
              )}&auto_ask=true`}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4 text-[#D9822B]" />
              <span>Ask AI Prescription</span>
            </Link>

            <Link
              href="/scan"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all cursor-pointer"
            >
              <ScanLine className="w-4 h-4 text-emerald-400" />
              <span>Scan Leaf</span>
            </Link>

            <Link
              href={`/yield?crop_id=${activeCrops[0].id}`}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all cursor-pointer"
            >
              <Scale className="w-4 h-4 text-amber-400" />
              <span>Yield & Revenue</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
