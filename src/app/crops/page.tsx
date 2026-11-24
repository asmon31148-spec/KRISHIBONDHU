'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/context';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { GuestSavePrompt } from '@/components/auth/GuestSavePrompt';
import {
  Sprout,
  Plus,
  Warehouse,
  Edit2,
  Trash2,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { formatLandArea, LandUnit } from '@/lib/units';

interface FarmOption {
  id: string;
  name: string;
}

interface Crop {
  id: string;
  name: string;
  variety: string | null;
  category: string | null;
  farm_id: string | null;
  farms?: { name: string } | null;
  area: number;
  area_unit: string;
  planting_date: string;
  expected_harvest_date: string | null;
  soil_type: string | null;
  irrigation_type: string | null;
  health_status: 'healthy' | 'needs_attention' | 'diseased';
  created_at: string;
}

const COMMON_CROP_NAMES = [
  'Rice (Aman / Winter Paddy)',
  'Rice (Boro / Summer Paddy)',
  'Potato (Kufri Jyoti / Pukhraj)',
  'Jute (Tossa / White)',
  'Brinjal (Muktakeshi / Pusa Purple)',
  'Mustard (Sarson)',
  'Chilli (Bullet / Suryamukhi)',
  'Tomato',
  'Cauliflower',
  'Cabbage',
  'Onion',
  'Wheat',
  'Maize',
  'Lentil / Pulses (Masoor)',
];

const IRRIGATION_TYPES = [
  'Canal / River lift',
  'Shallow Tube Well (STW)',
  'Deep Tube Well (DTW)',
  'Drip Irrigation',
  'Sprinkler',
  'Rainfed / Seasonal',
];

export default function CropsPage() {
  const { t, language } = useTranslation();
  const { user, isGuest } = useAuth();
  const toast = useToast();

  const [crops, setCrops] = useState<Crop[]>([]);
  const [farms, setFarms] = useState<FarmOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
  const [isGuestPromptOpen, setIsGuestPromptOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [activeCropForCondition, setActiveCropForCondition] = useState<Crop | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [variety, setVariety] = useState('');
  const [category, setCategory] = useState('Cereal');
  const [farmId, setFarmId] = useState<string>('');
  const [area, setArea] = useState('');
  const [areaUnit, setAreaUnit] = useState<string>('bigha');
  const [plantingDate, setPlantingDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('');
  const [soilType, setSoilType] = useState('alluvial');
  const [irrigationType, setIrrigationType] = useState('Shallow Tube Well (STW)');
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'needs_attention' | 'diseased'>('healthy');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
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
      // Load farms for dropdown
      const { data: farmsData } = await supabase
        .from('farms')
        .select('id, name')
        .eq('user_id', user.id);

      if (farmsData) setFarms(farmsData as FarmOption[]);

      // Load crops
      const { data: cropsData, error } = await supabase
        .from('crops')
        .select('*, farms(name)')
        .eq('user_id', user.id)
        .order('planting_date', { ascending: false });

      if (!error && cropsData) {
        setCrops(cropsData as Crop[]);
      }
    } catch (err) {
      console.error('Error loading crops:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    if (isGuest) {
      setIsGuestPromptOpen(true);
      return;
    }
    setEditingCrop(null);
    setName('');
    setVariety('');
    setCategory('Cereal');
    setFarmId(farms[0]?.id || '');
    setArea('');
    setAreaUnit('bigha');
    setPlantingDate(new Date().toISOString().split('T')[0]);
    setExpectedHarvestDate('');
    setSoilType('alluvial');
    setIrrigationType('Shallow Tube Well (STW)');
    setHealthStatus('healthy');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (crop: Crop) => {
    setEditingCrop(crop);
    setName(crop.name);
    setVariety(crop.variety || '');
    setCategory(crop.category || 'Cereal');
    setFarmId(crop.farm_id || '');
    setArea(String(crop.area));
    setAreaUnit(crop.area_unit);
    setPlantingDate(crop.planting_date);
    setExpectedHarvestDate(crop.expected_harvest_date || '');
    setSoilType(crop.soil_type || 'alluvial');
    setIrrigationType(crop.irrigation_type || 'Shallow Tube Well (STW)');
    setHealthStatus(crop.health_status);
    setIsModalOpen(true);
  };

  const handleOpenCondition = (crop: Crop) => {
    setActiveCropForCondition(crop);
    setHealthStatus(crop.health_status);
    setIsConditionModalOpen(true);
  };

  const handleUpdateConditionSubmit = async () => {
    if (!user || !activeCropForCondition) return;
    try {
      const supabase = createClient();
      if (!supabase) return;

      const { error } = await supabase
        .from('crops')
        .update({
          health_status: healthStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', activeCropForCondition.id)
        .eq('user_id', user.id);

      if (error) {
        toast.error('Could not update condition: ' + error.message);
      } else {
        toast.success('Crop condition updated.');
        setIsConditionModalOpen(false);
        loadData();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      toast.error(msg);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name.trim()) {
      toast.error('Please enter or select a crop name.');
      return;
    }
    if (!area || parseFloat(area) <= 0) {
      toast.error('Please enter a valid crop cultivated area.');
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      if (!supabase) return;

      const payload = {
        name: name.trim(),
        variety: variety.trim() || null,
        category: category.trim(),
        farm_id: farmId || null,
        area: parseFloat(area),
        area_unit: areaUnit,
        planting_date: plantingDate,
        expected_harvest_date: expectedHarvestDate || null,
        soil_type: soilType,
        irrigation_type: irrigationType,
        health_status: healthStatus,
        updated_at: new Date().toISOString(),
      };

      if (editingCrop) {
        const { error } = await supabase
          .from('crops')
          .update(payload)
          .eq('id', editingCrop.id)
          .eq('user_id', user.id);

        if (error) {
          toast.error('Update failed: ' + error.message);
        } else {
          toast.success('Crop record updated!');
          setIsModalOpen(false);
          loadData();
        }
      } else {
        const { error } = await supabase.from('crops').insert({
          ...payload,
          user_id: user.id,
        });

        if (error) {
          toast.error('Failed to add crop: ' + error.message);
        } else {
          toast.success('Crop registered successfully!');
          setIsModalOpen(false);
          loadData();
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Operation failed';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cropId: string) => {
    if (!user) return;
    if (!window.confirm('Are you sure you want to delete this crop record?')) return;

    try {
      const supabase = createClient();
      if (!supabase) return;

      const { error } = await supabase
        .from('crops')
        .delete()
        .eq('id', cropId)
        .eq('user_id', user.id);

      if (error) {
        toast.error('Failed to delete crop: ' + error.message);
      } else {
        toast.success('Crop record deleted.');
        loadData();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Deletion failed';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6 w-full text-left">
      {/* Notice: Unified into My Farm */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950">
        <div className="flex items-start gap-2.5">
          <Warehouse className="w-5 h-5 text-brand-forest shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <span className="font-bold block text-brand-forest">Crops are now managed inside your Farm Plots!</span>
            <span className="text-brand-dark/80">
              For better micro-climate alerts and soil health tracking, all crops are organized by land plot under My Farm.
            </span>
          </div>
        </div>
        <Link
          href="/farms"
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-forest text-white text-xs font-bold hover:bg-brand-leaf transition-colors whitespace-nowrap shadow-xs"
        >
          <span>Go to My Farm</span>
          <TrendingUp className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-forest">
            {t('crops.title')}
          </h1>
          <p className="text-xs sm:text-sm text-brand-dark/70 mt-1">
            {t('crops.subtitle')}
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenAdd}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          {t('crops.addCrop')}
        </Button>
      </div>

      {/* Crops List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-52 bg-cream-100 rounded-2xl border border-cream-200" />
          ))}
        </div>
      ) : crops.length === 0 ? (
        <EmptyState
          icon={<Sprout className="w-8 h-8" />}
          title={t('crops.empty')}
          description="Keep track of what you plant, monitor disease outbreaks, and forecast yield harvest tonnages."
          actionLabel={t('crops.addCrop')}
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {crops.map((crop) => (
            <Card key={crop.id} className="hover:border-brand-leaf/40 transition-all">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-bold text-brand-dark">
                      {crop.name}
                    </CardTitle>
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
                  {crop.variety && (
                    <p className="text-xs text-brand-dark/70">
                      Variety: <span className="font-semibold">{crop.variety}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(crop)}
                    className="p-1.5 rounded-lg text-brand-dark/60 hover:text-brand-dark hover:bg-cream-100 transition-colors"
                    aria-label="Edit crop"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(crop.id)}
                    className="p-1.5 rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
                    aria-label="Delete crop"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs p-3 rounded-xl bg-cream-50 border border-cream-200/90">
                  <div>
                    <span className="text-brand-dark/60 block text-[10px] uppercase font-semibold">
                      {t('farms.area')}
                    </span>
                    <span className="font-bold text-brand-forest">
                      {formatLandArea(crop.area, crop.area_unit as LandUnit, (language as any) || 'en')}
                    </span>
                  </div>

                  <div>
                    <span className="text-brand-dark/60 block text-[10px] uppercase font-semibold">
                      Sowing Date
                    </span>
                    <span className="font-medium text-brand-dark">
                      {crop.planting_date}
                    </span>
                  </div>

                  <div>
                    <span className="text-brand-dark/60 block text-[10px] uppercase font-semibold">
                      Irrigation
                    </span>
                    <span className="font-medium text-brand-dark truncate block">
                      {crop.irrigation_type || 'Unspecified'}
                    </span>
                  </div>
                </div>

                {crop.farms?.name && (
                  <p className="text-[11px] text-brand-dark/70 flex items-center gap-1.5">
                    <Warehouse className="w-3.5 h-3.5 text-brand-leaf" />
                    Plot: <strong>{crop.farms.name}</strong>
                  </p>
                )}

                {/* Crop Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-cream-200 gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenCondition(crop)}
                    >
                      {t('crops.updateCondition')}
                    </Button>
                    <Link
                      href={`/assistant?crop_id=${crop.id}&crop_name=${encodeURIComponent(crop.name)}&variety=${encodeURIComponent(crop.variety || '')}&status=${crop.health_status}&farm=${encodeURIComponent(crop.farms?.name || 'Primary Plot')}&area=${crop.area}&unit=${encodeURIComponent(crop.area_unit)}&sown=${encodeURIComponent(crop.planting_date)}&irrigation=${encodeURIComponent(crop.irrigation_type || '')}&auto_ask=true`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-brand-forest font-bold text-xs border border-emerald-200 shadow-2xs transition-colors"
                    >
                      <span>Ask AI</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <Link href={`/yield?crop_id=${crop.id}`}>
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<TrendingUp className="w-3.5 h-3.5 text-brand-harvest" />}
                    >
                      {t('crops.predictYield')}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Crop Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCrop ? 'Edit Crop' : t('crops.addCrop')}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-semibold text-brand-dark/90">
              {t('crops.cropName')}
            </label>
            <input
              list="crop-suggestions"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rice (Aman) or Potato"
              className="block w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
            />
            <datalist id="crop-suggestions">
              {COMMON_CROP_NAMES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={t('crops.variety')}
              value={variety}
              onChange={(e) => setVariety(e.target.value)}
              placeholder="e.g. Kufri Jyoti / Swarna Sub-1"
            />

            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-semibold text-brand-dark/90">
                Assigned Farm Plot
              </label>
              <select
                value={farmId}
                onChange={(e) => setFarmId(e.target.value)}
                className="block w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
              >
                <option value="">-- No Specific Plot --</option>
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={t('farms.area')}
              type="number"
              step="0.1"
              min="0.1"
              required
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Cultivated area"
            />

            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-semibold text-brand-dark/90">
                {t('onboarding.unit')}
              </label>
              <select
                value={areaUnit}
                onChange={(e) => setAreaUnit(e.target.value)}
                className="block w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
              >
                <option value="bigha">{t('onboarding.units.bigha')}</option>
                <option value="katha">{t('onboarding.units.katha')}</option>
                <option value="acres">{t('onboarding.units.acres')}</option>
                <option value="hectares">{t('onboarding.units.hectares')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={t('crops.plantingDate')}
              type="date"
              required
              value={plantingDate}
              onChange={(e) => setPlantingDate(e.target.value)}
            />

            <Input
              label={t('crops.expectedHarvest')}
              type="date"
              value={expectedHarvestDate}
              onChange={(e) => setExpectedHarvestDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-semibold text-brand-dark/90">
                {t('crops.irrigationType')}
              </label>
              <select
                value={irrigationType}
                onChange={(e) => setIrrigationType(e.target.value)}
                className="block w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
              >
                {IRRIGATION_TYPES.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-semibold text-brand-dark/90">
                {t('crops.healthStatus')}
              </label>
              <select
                value={healthStatus}
                onChange={(e) => setHealthStatus(e.target.value as 'healthy' | 'needs_attention' | 'diseased')}
                className="block w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
              >
                <option value="healthy">{t('crops.healthy')}</option>
                <option value="needs_attention">{t('crops.needsAttention')}</option>
                <option value="diseased">{t('crops.diseased')}</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-cream-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              {editingCrop ? t('common.save') : t('crops.addCrop')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Quick Condition Update Modal */}
      <Modal
        isOpen={isConditionModalOpen}
        onClose={() => setIsConditionModalOpen(false)}
        title="Update Crop Condition"
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-brand-dark/70">
            Update health status for <strong>{activeCropForCondition?.name}</strong>.
          </p>

          <div className="space-y-2">
            {[
              { id: 'healthy', label: t('crops.healthy'), color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
              { id: 'needs_attention', label: t('crops.needsAttention'), color: 'text-amber-800 bg-amber-50 border-amber-200' },
              { id: 'diseased', label: t('crops.diseased'), color: 'text-red-800 bg-red-50 border-red-200' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setHealthStatus(st.id as 'healthy' | 'needs_attention' | 'diseased')}
                className={`w-full p-3 rounded-xl border text-left font-bold text-xs flex items-center justify-between transition-all ${
                  healthStatus === st.id ? st.color + ' ring-2 ring-brand-forest' : 'bg-white border-cream-300'
                }`}
              >
                <span>{st.label}</span>
                {healthStatus === st.id && <CheckCircle2 className="w-4 h-4" />}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-cream-200">
            <Button variant="secondary" size="sm" onClick={() => setIsConditionModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" size="sm" onClick={handleUpdateConditionSubmit}>
              {t('common.save')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Guest Mode Protection Prompt */}
      <GuestSavePrompt
        isOpen={isGuestPromptOpen}
        onClose={() => setIsGuestPromptOpen(false)}
        featureName="Crop Management"
      />
    </div>
  );
}
