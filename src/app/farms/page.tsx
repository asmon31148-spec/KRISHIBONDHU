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
  Warehouse,
  Plus,
  MapPin,
  Edit2,
  Trash2,
  Compass,
  Sprout,
  FlaskConical,
  ArrowRight,
  Scale,
} from 'lucide-react';
import { formatLandArea, LandUnit } from '@/lib/units';

interface Farm {
  id: string;
  name: string;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  area: number;
  area_unit: string;
  soil_type: string | null;
  created_at: string;
}

interface Crop {
  id: string;
  name: string;
  variety: string | null;
  category: string | null;
  farm_id: string | null;
  area: number;
  area_unit: string;
  planting_date: string;
  expected_harvest_date: string | null;
  soil_type: string | null;
  irrigation_type: string | null;
  health_status: 'healthy' | 'needs_attention' | 'diseased';
  created_at: string;
}

interface SoilRecord {
  id: string;
  farm_id: string | null;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number | null;
  organic_carbon: number | null;
  moisture_percentage: number | null;
  test_date: string;
  tested_by: string | null;
}

const COMMON_CROP_NAMES_I18N: Record<'en' | 'bn' | 'hi', { value: string; label: string }[]> = {
  bn: [
    { value: 'Rice (Aman / Winter Paddy)', label: 'ধান (আমন ধান)' },
    { value: 'Rice (Boro / Summer Paddy)', label: 'ধান (বোরো ধান)' },
    { value: 'Potato (Kufri Jyoti / Pukhraj)', label: 'আলু (জ্যোতি / পুখরাজ)' },
    { value: 'Jute (Tossa / White)', label: 'পাট (তোষা / সাদা)' },
    { value: 'Brinjal (Muktakeshi / Pusa Purple)', label: 'বেগুন (মুক্তকেশী)' },
    { value: 'Mustard (Sarson)', label: 'সরিষা (রাই / তোড়িয়া)' },
    { value: 'Chilli (Bullet / Suryamukhi)', label: 'কাঁচা লঙ্কা (বুলেট / সূর্যমুখী)' },
    { value: 'Tomato', label: 'টমেটো' },
    { value: 'Cauliflower', label: 'ফুলকপি' },
    { value: 'Cabbage', label: 'বাঁধাকপি' },
    { value: 'Onion', label: 'পেঁয়াজ' },
    { value: 'Wheat', label: 'গম' },
    { value: 'Maize', label: 'ভুট্টা' },
    { value: 'Lentil / Pulses (Masoor)', label: 'মসুর ডাল' },
  ],
  hi: [
    { value: 'Rice (Aman / Winter Paddy)', label: 'धान (खरीफ)' },
    { value: 'Rice (Boro / Summer Paddy)', label: 'धान (बोरो)' },
    { value: 'Potato (Kufri Jyoti / Pukhraj)', label: 'आलू (पुखराज / ज्योति)' },
    { value: 'Jute (Tossa / White)', label: 'जूट / पटसन' },
    { value: 'Brinjal (Muktakeshi / Pusa Purple)', label: 'बैंगन' },
    { value: 'Mustard (Sarson)', label: 'सरसों' },
    { value: 'Chilli (Bullet / Suryamukhi)', label: 'हरी मिर्च' },
    { value: 'Tomato', label: 'टमाटर' },
    { value: 'Cauliflower', label: 'फूलगोभी' },
    { value: 'Cabbage', label: 'पत्तागोभी' },
    { value: 'Onion', label: 'प्याज' },
    { value: 'Wheat', label: 'गेहूं' },
    { value: 'Maize', label: 'मक्का' },
    { value: 'Lentil / Pulses (Masoor)', label: 'मसूर दाल' },
  ],
  en: [
    { value: 'Rice (Aman / Winter Paddy)', label: 'Rice (Aman / Winter Paddy)' },
    { value: 'Rice (Boro / Summer Paddy)', label: 'Rice (Boro / Summer Paddy)' },
    { value: 'Potato (Kufri Jyoti / Pukhraj)', label: 'Potato (Kufri Jyoti / Pukhraj)' },
    { value: 'Jute (Tossa / White)', label: 'Jute (Tossa / White)' },
    { value: 'Brinjal (Muktakeshi / Pusa Purple)', label: 'Brinjal (Muktakeshi / Pusa Purple)' },
    { value: 'Mustard (Sarson)', label: 'Mustard (Sarson)' },
    { value: 'Chilli (Bullet / Suryamukhi)', label: 'Chilli (Bullet / Suryamukhi)' },
    { value: 'Tomato', label: 'Tomato' },
    { value: 'Cauliflower', label: 'Cauliflower' },
    { value: 'Cabbage', label: 'Cabbage' },
    { value: 'Onion', label: 'Onion' },
    { value: 'Wheat', label: 'Wheat' },
    { value: 'Maize', label: 'Maize' },
    { value: 'Lentil / Pulses (Masoor)', label: 'Lentil / Pulses (Masoor)' },
  ],
};

const IRRIGATION_TYPES_I18N: Record<'en' | 'bn' | 'hi', { value: string; label: string }[]> = {
  bn: [
    { value: 'Shallow Tube Well (STW)', label: 'অগভীর নলকূপ (STW)' },
    { value: 'Deep Tube Well (DTW)', label: 'গভীর নলকূপ (DTW)' },
    { value: 'Canal / River lift', label: 'খাল বা নদীর জল' },
    { value: 'Drip Irrigation', label: 'ড্রিপ সেচ' },
    { value: 'Sprinkler', label: 'স্প্রিংকলার সেচ' },
    { value: 'Rainfed / Seasonal', label: 'বৃষ্টির জলের উপর নির্ভরশীল' },
  ],
  hi: [
    { value: 'Shallow Tube Well (STW)', label: 'उथला नलकूप (STW)' },
    { value: 'Deep Tube Well (DTW)', label: 'गहरा नलकूप (DTW)' },
    { value: 'Canal / River lift', label: 'नहर या नदी का पानी' },
    { value: 'Drip Irrigation', label: 'ड्रिप सिंचाई' },
    { value: 'Sprinkler', label: 'फव्वारा सिंचाई' },
    { value: 'Rainfed / Seasonal', label: 'वर्षा आधारित' },
  ],
  en: [
    { value: 'Shallow Tube Well (STW)', label: 'Shallow Tube Well (STW)' },
    { value: 'Deep Tube Well (DTW)', label: 'Deep Tube Well (DTW)' },
    { value: 'Canal / River lift', label: 'Canal / River lift' },
    { value: 'Drip Irrigation', label: 'Drip Irrigation' },
    { value: 'Sprinkler', label: 'Sprinkler' },
    { value: 'Rainfed / Seasonal', label: 'Rainfed / Seasonal' },
  ],
};

export default function FarmsPage() {
  const { t, language } = useTranslation();
  const activeLang = (language as 'en' | 'bn' | 'hi') || 'en';
  const cropList = COMMON_CROP_NAMES_I18N[activeLang] || COMMON_CROP_NAMES_I18N.en;
  const irrigationList = IRRIGATION_TYPES_I18N[activeLang] || IRRIGATION_TYPES_I18N.en;

  const { user, isGuest } = useAuth();
  const toast = useToast();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [soilRecords, setSoilRecords] = useState<SoilRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Farm Modal
  const [isFarmModalOpen, setIsFarmModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [farmArea, setFarmArea] = useState('');
  const [farmAreaUnit, setFarmAreaUnit] = useState<string>('bigha');
  const [farmSoilType, setFarmSoilType] = useState('alluvial');
  const [coords, setCoords] = useState<{ lat: number | null; lon: number | null }>({ lat: null, lon: null });
  const [geoLocating, setGeoLocating] = useState(false);
  const [isSubmittingFarm, setIsSubmittingFarm] = useState(false);

  // Crop Modal
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [targetFarmIdForCrop, setTargetFarmIdForCrop] = useState<string>('');
  const [cropName, setCropName] = useState(cropList[0]?.value || 'Rice (Aman / Winter Paddy)');
  const [cropVariety, setCropVariety] = useState('');
  const [cropCategory, setCropCategory] = useState('Cereal');
  const [cropArea, setCropArea] = useState('');
  const [cropAreaUnit, setCropAreaUnit] = useState('bigha');
  const [plantingDate, setPlantingDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('');
  const [irrigationType, setIrrigationType] = useState('Shallow Tube Well (STW)');
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'needs_attention' | 'diseased'>('healthy');
  const [isSubmittingCrop, setIsSubmittingCrop] = useState(false);

  // Soil Modal
  const [isSoilModalOpen, setIsSoilModalOpen] = useState(false);
  const [targetFarmIdForSoil, setTargetFarmIdForSoil] = useState<string>('');
  const [soilN, setSoilN] = useState('240');
  const [soilP, setSoilP] = useState('18');
  const [soilK, setSoilK] = useState('190');
  const [soilPh, setSoilPh] = useState('6.5');
  const [soilTestDate, setSoilTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmittingSoil, setIsSubmittingSoil] = useState(false);

  // Guest prompt
  const [isGuestPromptOpen, setIsGuestPromptOpen] = useState(false);

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
      const [farmsRes, cropsRes, soilRes] = await Promise.all([
        supabase.from('farms').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('crops').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('soil_records').select('*').eq('user_id', user.id).order('test_date', { ascending: false }),
      ]);

      if (farmsRes.data) setFarms(farmsRes.data as Farm[]);
      if (cropsRes.data) setCrops(cropsRes.data as Crop[]);
      if (soilRes.data) setSoilRecords(soilRes.data as SoilRecord[]);
    } catch (err) {
      console.error('Error loading farm data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Farm Actions
  const handleOpenAddFarm = () => {
    if (isGuest) {
      setIsGuestPromptOpen(true);
      return;
    }
    setEditingFarm(null);
    setFarmName('');
    setFarmLocation('');
    setFarmArea('');
    setFarmAreaUnit('bigha');
    setFarmSoilType('alluvial');
    setCoords({ lat: null, lon: null });
    setIsFarmModalOpen(true);
  };

  const handleOpenEditFarm = (farm: Farm) => {
    setEditingFarm(farm);
    setFarmName(farm.name);
    setFarmLocation(farm.location_name || '');
    setFarmArea(String(farm.area));
    setFarmAreaUnit(farm.area_unit);
    setFarmSoilType(farm.soil_type || 'alluvial');
    setCoords({ lat: farm.latitude, lon: farm.longitude });
    setIsFarmModalOpen(true);
  };

  const handleSaveFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!farmName.trim()) {
      toast.error('Please enter a farm plot name.');
      return;
    }
    if (!farmArea || parseFloat(farmArea) <= 0) {
      toast.error('Please enter a valid area.');
      return;
    }

    setIsSubmittingFarm(true);
    try {
      const supabase = createClient();
      if (!supabase) return;

      if (editingFarm) {
        const { error } = await supabase
          .from('farms')
          .update({
            name: farmName.trim(),
            location_name: farmLocation.trim() || null,
            area: parseFloat(farmArea),
            area_unit: farmAreaUnit,
            soil_type: farmSoilType,
            latitude: coords.lat,
            longitude: coords.lon,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingFarm.id)
          .eq('user_id', user.id);

        if (error) throw error;
        toast.success('Farm plot updated successfully!');
      } else {
        const { error } = await supabase.from('farms').insert({
          user_id: user.id,
          name: farmName.trim(),
          location_name: farmLocation.trim() || null,
          area: parseFloat(farmArea),
          area_unit: farmAreaUnit,
          soil_type: farmSoilType,
          latitude: coords.lat,
          longitude: coords.lon,
        });

        if (error) throw error;
        toast.success('New farm plot registered!');
      }
      setIsFarmModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Operation failed';
      toast.error(msg);
    } finally {
      setIsSubmittingFarm(false);
    }
  };

  const handleDeleteFarm = async (farmId: string) => {
    if (!user) return;
    if (!window.confirm('Delete this plot? Crops and soil records linked to this plot will remain unassigned.')) return;

    try {
      const supabase = createClient();
      if (!supabase) return;

      const { error } = await supabase.from('farms').delete().eq('id', farmId).eq('user_id', user.id);
      if (error) throw error;

      toast.success('Plot removed.');
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Deletion failed';
      toast.error(msg);
    }
  };

  // Crop Actions
  const handleOpenAddCrop = (farmId: string) => {
    if (isGuest) {
      setIsGuestPromptOpen(true);
      return;
    }
    setEditingCrop(null);
    setTargetFarmIdForCrop(farmId);
    setCropName(cropList[0]?.value || 'Rice (Aman / Winter Paddy)');
    setCropVariety('');
    setCropCategory('Cereal');
    setCropArea('1.0');
    setCropAreaUnit('bigha');
    setPlantingDate(new Date().toISOString().split('T')[0]);
    setExpectedHarvestDate('');
    setIrrigationType(irrigationList[0]?.value || 'Shallow Tube Well (STW)');
    setHealthStatus('healthy');
    setIsCropModalOpen(true);
  };

  const handleOpenEditCrop = (crop: Crop) => {
    setEditingCrop(crop);
    setTargetFarmIdForCrop(crop.farm_id || '');
    setCropName(crop.name);
    setCropVariety(crop.variety || '');
    setCropCategory(crop.category || 'Cereal');
    setCropArea(String(crop.area));
    setCropAreaUnit(crop.area_unit);
    setPlantingDate(crop.planting_date);
    setExpectedHarvestDate(crop.expected_harvest_date || '');
    setIrrigationType(crop.irrigation_type || 'Shallow Tube Well (STW)');
    setHealthStatus(crop.health_status);
    setIsCropModalOpen(true);
  };

  const handleSaveCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!cropName.trim()) {
      toast.error('Crop name is required.');
      return;
    }

    setIsSubmittingCrop(true);
    try {
      const supabase = createClient();
      if (!supabase) return;

      const cropPayload = {
        user_id: user.id,
        farm_id: targetFarmIdForCrop || null,
        name: cropName.trim(),
        variety: cropVariety.trim() || null,
        category: cropCategory,
        area: parseFloat(cropArea) || 1.0,
        area_unit: cropAreaUnit,
        planting_date: plantingDate,
        expected_harvest_date: expectedHarvestDate || null,
        irrigation_type: irrigationType,
        health_status: healthStatus,
        updated_at: new Date().toISOString(),
      };

      if (editingCrop) {
        const { error } = await supabase.from('crops').update(cropPayload).eq('id', editingCrop.id).eq('user_id', user.id);
        if (error) throw error;
        toast.success('Crop updated!');
      } else {
        const { error } = await supabase.from('crops').insert(cropPayload);
        if (error) throw error;
        toast.success('Crop planted in plot!');
      }
      setIsCropModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save crop';
      toast.error(msg);
    } finally {
      setIsSubmittingCrop(false);
    }
  };

  const handleDeleteCrop = async (cropId: string) => {
    if (!user) return;
    if (!window.confirm('Remove this crop record?')) return;

    try {
      const supabase = createClient();
      if (!supabase) return;
      const { error } = await supabase.from('crops').delete().eq('id', cropId).eq('user_id', user.id);
      if (error) throw error;
      toast.success('Crop removed.');
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete crop';
      toast.error(msg);
    }
  };

  // Soil Actions
  const handleOpenAddSoil = (farmId: string) => {
    if (isGuest) {
      setIsGuestPromptOpen(true);
      return;
    }
    setTargetFarmIdForSoil(farmId);
    setSoilN('240');
    setSoilP('18');
    setSoilK('190');
    setSoilPh('6.5');
    setSoilTestDate(new Date().toISOString().split('T')[0]);
    setIsSoilModalOpen(true);
  };

  const handleSaveSoil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmittingSoil(true);
    try {
      const supabase = createClient();
      if (!supabase) return;

      const { error } = await supabase.from('soil_records').insert({
        user_id: user.id,
        farm_id: targetFarmIdForSoil || null,
        nitrogen: parseFloat(soilN) || 0,
        phosphorus: parseFloat(soilP) || 0,
        potassium: parseFloat(soilK) || 0,
        ph: parseFloat(soilPh) || 6.5,
        test_date: soilTestDate,
        tested_by: 'Farmer / Soil Health Card',
      });

      if (error) throw error;
      toast.success('Soil test record saved to plot!');
      setIsSoilModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save soil test';
      toast.error(msg);
    } finally {
      setIsSubmittingSoil(false);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported.');
      return;
    }
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setGeoLocating(false);
        toast.success('Farm GPS captured.');
      },
      () => {
        setGeoLocating(false);
        toast.warning('Could not retrieve GPS coordinates.');
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="space-y-6 w-full text-left max-w-full overflow-x-clip pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-forest/10 text-brand-forest text-xs font-semibold mb-1">
            <Warehouse className="w-3.5 h-3.5" />
            <span>Unified Farm & Crop Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-forest">
            {t('farms.title')}
          </h1>
          <p className="text-xs sm:text-sm text-brand-dark/70 mt-0.5">
            Manage your land plots, soil fertility tests, and active seasonal crops in one place.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenAddFarm}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-sm font-bold"
        >
          {activeLang === 'bn' ? '+ নতুন জমি যোগ করুন' : activeLang === 'hi' ? '+ नया खेत जोड़ें' : t('farms.addFarm')}
        </Button>
      </div>

      {/* Visual Farmer Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-cream-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-brand-forest/10 flex items-center justify-center text-brand-forest shrink-0">
            <Warehouse className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-brand-dark/60 block">
              {activeLang === 'bn' ? 'মোট জমি (প্লট)' : activeLang === 'hi' ? 'कुल खेत (प्लॉट)' : 'Total Farm Plots'}
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-brand-dark">
              {farms.length} {activeLang === 'bn' ? 'টি প্লট' : activeLang === 'hi' ? 'खेत' : 'Plots'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-cream-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-brand-dark/60 block">
              {activeLang === 'bn' ? 'বপন করা চলতি ফসল' : activeLang === 'hi' ? 'सक्रिय फसलें' : 'Active Sown Crops'}
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-700">
              {crops.length} {activeLang === 'bn' ? 'টি ফসল' : activeLang === 'hi' ? 'फसलें' : 'Crops'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-cream-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-brand-dark/60 block">
              {activeLang === 'bn' ? 'মাটির পরীক্ষা রেকর্ড' : activeLang === 'hi' ? 'मृदा परीक्षण रिपोर्ट' : 'Soil Test Records'}
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-blue-700">
              {soilRecords.length} {activeLang === 'bn' ? 'টি রিপোর্ট' : activeLang === 'hi' ? 'रिपोर्ट' : 'Reports'}
            </span>
          </div>
        </div>
      </div>

      {/* Farms List */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-cream-100 rounded-2xl border border-cream-200" />
          ))}
        </div>
      ) : farms.length === 0 ? (
        <EmptyState
          icon={<Warehouse className="w-8 h-8" />}
          title={t('farms.empty')}
          description="Register your agricultural land plots to track crops, soil fertility, and micro-climate advisories."
          actionLabel={t('farms.addFarm')}
          onAction={handleOpenAddFarm}
        />
      ) : (
        <div className="space-y-6">
          {farms.map((farm) => {
            const plotCrops = crops.filter((c) => c.farm_id === farm.id);
            const plotSoil = soilRecords.find((s) => s.farm_id === farm.id);

            return (
              <Card key={farm.id} className="border border-cream-200/90 shadow-xs hover:border-brand-leaf/40 transition-all overflow-hidden bg-white/95">
                {/* Plot Header */}
                <CardHeader className="bg-cream-50/80 border-b border-cream-200/70 p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-lg sm:text-xl font-bold text-brand-dark">
                          {farm.name}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs font-semibold bg-white border-brand-forest/20 text-brand-forest">
                          {formatLandArea(farm.area, farm.area_unit as LandUnit)}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize bg-white text-brand-dark/80">
                          {farm.soil_type || 'Alluvial'} Soil
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-brand-dark/70 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-brand-leaf shrink-0" />
                          {farm.location_name || 'Location recorded'}
                        </span>
                        {farm.latitude && farm.longitude && (
                          <span className="flex items-center gap-1 text-emerald-700">
                            <Compass className="w-3.5 h-3.5 shrink-0" />
                            GPS: {farm.latitude.toFixed(3)}, {farm.longitude.toFixed(3)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenAddCrop(farm.id)}
                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                        className="text-xs bg-white text-brand-forest border-brand-forest/20 hover:bg-cream-100 font-bold"
                      >
                        {activeLang === 'bn' ? '+ ফসল যোগ' : activeLang === 'hi' ? '+ फसल जोड़ें' : '+ Crop'}
                      </Button>
                      <button
                        onClick={() => handleOpenEditFarm(farm)}
                        className="p-2 rounded-xl text-brand-dark/60 hover:text-brand-dark hover:bg-cream-100 transition-colors"
                        aria-label="Edit plot"
                        title="Edit plot"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFarm(farm.id)}
                        className="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                        aria-label="Delete plot"
                        title="Delete plot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-5 space-y-5">
                  {/* Soil Health Section for this Plot */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-cream-50/70 border border-cream-200/80">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <FlaskConical className="w-4 h-4 text-brand-leaf" />
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-dark/80">
                          {activeLang === 'bn' ? 'মাটির পুষ্টি পরীক্ষা' : activeLang === 'hi' ? 'मिट्टी की जांच' : 'Soil Health Test'}
                        </span>
                        {plotSoil && (
                          <span className="text-[11px] text-brand-dark/60">
                            ({activeLang === 'bn' ? 'তারিখ:' : activeLang === 'hi' ? 'दिनांक:' : 'Tested:'} {new Date(plotSoil.test_date).toLocaleDateString()})
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleOpenAddSoil(farm.id)}
                        className="text-xs font-bold text-brand-forest hover:text-brand-leaf flex items-center gap-1 transition-colors"
                      >
                        {plotSoil
                          ? (activeLang === 'bn' ? 'আপডেট' : activeLang === 'hi' ? 'अपडेट' : 'Update Test')
                          : (activeLang === 'bn' ? '+ রিপোর্ট লিখুন' : activeLang === 'hi' ? '+ रिपोर्ट जोड़ें' : '+ Record Test')}
                      </button>
                    </div>

                    {plotSoil ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="p-2 bg-white rounded-lg border border-cream-200">
                          <span className="text-[10px] text-brand-dark/60 block font-semibold">
                            {activeLang === 'bn' ? 'নাইট্রোজেন (N)' : activeLang === 'hi' ? 'नाइट्रोजन (N)' : 'Nitrogen (N)'}
                          </span>
                          <span className="font-bold text-brand-dark text-sm">{plotSoil.nitrogen} kg/ha</span>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-cream-200">
                          <span className="text-[10px] text-brand-dark/60 block font-semibold">
                            {activeLang === 'bn' ? 'ফসফরাস (P)' : activeLang === 'hi' ? 'फास्फोरस (P)' : 'Phosphorus (P)'}
                          </span>
                          <span className="font-bold text-brand-dark text-sm">{plotSoil.phosphorus} kg/ha</span>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-cream-200">
                          <span className="text-[10px] text-brand-dark/60 block font-semibold">
                            {activeLang === 'bn' ? 'পটাশিয়াম (K)' : activeLang === 'hi' ? 'पोटेशियम (K)' : 'Potassium (K)'}
                          </span>
                          <span className="font-bold text-brand-dark text-sm">{plotSoil.potassium} kg/ha</span>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-cream-200">
                          <span className="text-[10px] text-brand-dark/60 block font-semibold">
                            {activeLang === 'bn' ? 'মাটির পিএইচ (pH)' : activeLang === 'hi' ? 'मिट्टी pH' : 'Soil pH'}
                          </span>
                          <span className="font-bold text-brand-dark text-sm">{plotSoil.ph || '6.5'}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-brand-dark/70">
                        {activeLang === 'bn'
                          ? 'এই জমির কোনো মাটির পরীক্ষা এখনো রেকর্ড করা হয়নি। সঠিক সারের মাত্রার জন্য সয়েল হেলথ কার্ডের তথ্য যোগ করুন।'
                          : activeLang === 'hi'
                          ? 'इस खेत के लिए अभी मिट्टी की जांच दर्ज नहीं है। सटीक खाद की मात्रा के लिए सॉइल हेल्थ कार्ड का डेटा जोड़ें।'
                          : 'No soil test recorded yet for this plot. Record your Soil Health Card N-P-K data to get tailored fertilizer dosages.'}
                      </p>
                    )}
                  </div>

                  {/* Crops Growing on this Plot */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Sprout className="w-4 h-4 text-emerald-600" />
                        <h3 className="text-sm font-bold text-brand-dark">
                          {activeLang === 'bn' ? 'এই জমির চলতি ফসল' : activeLang === 'hi' ? 'इस खेत की फसलें' : 'Crops on this Plot'} ({plotCrops.length})
                        </h3>
                      </div>
                      <button
                        onClick={() => handleOpenAddCrop(farm.id)}
                        className="text-xs font-semibold text-brand-forest hover:text-brand-leaf flex items-center gap-1"
                      >
                        {activeLang === 'bn' ? '+ ফসল' : activeLang === 'hi' ? '+ फसल' : '+ Add Crop'}
                      </button>
                    </div>

                    {plotCrops.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-cream-300 text-center text-xs text-brand-dark/60 bg-cream-50/40">
                        {activeLang === 'bn'
                          ? 'এই জমিতে এখনও কোনো ফসল যোগ করা হয়নি। ফসল যোগ করতে চাপুন।'
                          : activeLang === 'hi'
                          ? 'इस खेत में अभी कोई फसल नहीं जोड़ी गई है। फसल जोड़ने के लिए क्लिक करें।'
                          : 'No active crops planted on this plot. Click Add Crop to begin tracking.'}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {plotCrops.map((crop) => (
                          <div
                            key={crop.id}
                            className="p-3 sm:p-3.5 rounded-xl border border-cream-200 bg-cream-50/50 hover:bg-cream-50 hover:border-brand-leaf/40 transition-colors flex flex-col justify-between gap-2.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="text-sm font-bold text-brand-dark">
                                  {crop.name}
                                </h4>
                                {crop.variety && (
                                  <span className="text-xs text-brand-dark/70 font-medium block">
                                    {activeLang === 'bn' ? 'জাত:' : activeLang === 'hi' ? 'किस्म:' : 'Variety:'} {crop.variety}
                                  </span>
                                )}
                              </div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0 ${
                                  crop.health_status === 'healthy'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : crop.health_status === 'needs_attention'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {crop.health_status === 'healthy'
                                  ? (activeLang === 'bn' ? 'সুস্থ ফসল' : activeLang === 'hi' ? 'स्वस्थ' : 'Healthy')
                                  : crop.health_status === 'needs_attention'
                                  ? (activeLang === 'bn' ? 'নজর প্রয়োজন' : activeLang === 'hi' ? 'सावधानी' : 'Attention')
                                  : (activeLang === 'bn' ? 'রোগাক্রান্ত' : activeLang === 'hi' ? 'रोगग्रस्त' : 'Diseased')}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-1 text-[11px] text-brand-dark/70 pt-1 border-t border-cream-200/80">
                              <div>
                                <span className="text-brand-dark/50">{activeLang === 'bn' ? 'বপন:' : activeLang === 'hi' ? 'बुवाई:' : 'Planted:'}</span> {new Date(crop.planting_date).toLocaleDateString()}
                              </div>
                              <div>
                                <span className="text-brand-dark/50">{activeLang === 'bn' ? 'পরিমাপ:' : activeLang === 'hi' ? 'क्षेत्रफल:' : 'Area:'}</span> {crop.area} {crop.area_unit}
                              </div>
                              {crop.irrigation_type && (
                                <div className="col-span-2 text-[10px] truncate text-brand-dark/60">
                                  💧 {crop.irrigation_type}
                                </div>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                              <div className="flex flex-wrap items-center gap-2">
                                <Link
                                  href={`/assistant?crop_id=${crop.id}&crop_name=${encodeURIComponent(crop.name)}&variety=${encodeURIComponent(crop.variety || '')}&status=${crop.health_status}&farm=${encodeURIComponent(farm.name)}&location=${encodeURIComponent(farm.location_name || 'West Bengal')}&soil=${encodeURIComponent(farm.soil_type || 'Clay')}&area=${crop.area}&unit=${encodeURIComponent(crop.area_unit)}&sown=${encodeURIComponent(crop.planting_date)}&irrigation=${encodeURIComponent(crop.irrigation_type || 'STW')}&auto_ask=true`}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-brand-forest font-bold transition-all text-[11px] shadow-2xs border border-emerald-200/80 active:scale-95"
                                >
                                  <span>{language === 'bn' ? 'এআই পরামর্শ' : language === 'hi' ? 'एआई सलाह' : 'Ask AI Advice'}</span>
                                  <ArrowRight className="w-3 h-3 text-emerald-700" />
                                </Link>

                                <Link
                                  href={`/yield?crop_id=${crop.id}`}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold transition-all text-[11px] shadow-2xs border border-amber-200/80 active:scale-95"
                                  title="Calculate harvest yield and production economics"
                                >
                                  <Scale className="w-3 h-3 text-amber-700" />
                                  <span>{language === 'bn' ? 'ফলন ও লাভ' : language === 'hi' ? 'उपज व लाभ' : 'Yield & Profit'}</span>
                                </Link>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenEditCrop(crop)}
                                  className="p-1 rounded-md text-brand-dark/60 hover:text-brand-dark hover:bg-cream-200"
                                  title="Edit Crop"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCrop(crop.id)}
                                  className="p-1 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50"
                                  title="Delete Crop"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Farm Modal */}
      <Modal
        isOpen={isFarmModalOpen}
        onClose={() => setIsFarmModalOpen(false)}
        title={editingFarm ? t('farms.editFarm') : t('farms.addFarm')}
      >
        <form onSubmit={handleSaveFarm} className="space-y-4 pt-2">
          <Input
            label={t('farms.farmName')}
            required
            value={farmName}
            onChange={(e) => setFarmName(e.target.value)}
            placeholder="e.g. Uttar Para Plot #2"
          />

          <Input
            label={t('farms.location')}
            value={farmLocation}
            onChange={(e) => setFarmLocation(e.target.value)}
            placeholder="Village, Mouza or District (e.g. South 24 Parganas)"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={t('farms.area')}
              type="number"
              step="0.1"
              min="0.1"
              required
              value={farmArea}
              onChange={(e) => setFarmArea(e.target.value)}
              placeholder="e.g. 3.5"
            />

            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-semibold text-brand-dark/90">
                {t('onboarding.unit')}
              </label>
              <select
                value={farmAreaUnit}
                onChange={(e) => setFarmAreaUnit(e.target.value)}
                className="block w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
              >
                <option value="bigha">{t('onboarding.units.bigha')}</option>
                <option value="katha">{t('onboarding.units.katha')}</option>
                <option value="acres">{t('onboarding.units.acres')}</option>
                <option value="hectares">{t('onboarding.units.hectares')}</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-semibold text-brand-dark/90">
              {t('farms.soil')}
            </label>
            <select
              value={farmSoilType}
              onChange={(e) => setFarmSoilType(e.target.value)}
              className="block w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
            >
              <option value="alluvial">{t('onboarding.soilTypes.alluvial')}</option>
              <option value="clay">{t('onboarding.soilTypes.clay')}</option>
              <option value="sandy_loam">{t('onboarding.soilTypes.sandy_loam')}</option>
              <option value="laterite">{t('onboarding.soilTypes.laterite')}</option>
              <option value="black">{t('onboarding.soilTypes.black')}</option>
            </select>
          </div>

          {/* GPS Location Button */}
          <div className="p-3 bg-cream-100 rounded-xl border border-cream-200 flex items-center justify-between gap-2">
            <div className="text-xs">
              <span className="font-bold text-brand-dark block">Plot GPS Coordinates</span>
              <span className="text-[11px] text-brand-dark/70">
                {coords.lat && coords.lon
                  ? `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`
                  : 'Optional for hyper-local weather'}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={detectLocation}
              isLoading={geoLocating}
              leftIcon={<Compass className="w-3.5 h-3.5" />}
            >
              Capture GPS
            </Button>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-cream-200">
            <Button type="button" variant="secondary" onClick={() => setIsFarmModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingFarm}>
              {editingFarm ? t('common.save') : t('farms.addFarm')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add / Edit Crop Modal */}
      <Modal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        title={editingCrop ? 'Edit Crop Details' : 'Add Crop to Plot'}
      >
        <form onSubmit={handleSaveCrop} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-semibold text-brand-dark/90">
              Crop Name *
            </label>
            <select
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              className="block w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
            >
              {cropList.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Variety / Hybrid (Optional)"
            value={cropVariety}
            onChange={(e) => setCropVariety(e.target.value)}
            placeholder="e.g. Swarna, Minikit, Kufri Jyoti"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Crop Area"
              type="number"
              step="0.1"
              min="0.1"
              required
              value={cropArea}
              onChange={(e) => setCropArea(e.target.value)}
            />
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-semibold text-brand-dark/90">
                Unit
              </label>
              <select
                value={cropAreaUnit}
                onChange={(e) => setCropAreaUnit(e.target.value)}
                className="block w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
              >
                <option value="bigha">Bigha</option>
                <option value="katha">Katha</option>
                <option value="acres">Acres</option>
                <option value="hectares">Hectares</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Sowing / Planting Date *"
              type="date"
              required
              value={plantingDate}
              onChange={(e) => setPlantingDate(e.target.value)}
            />
            <Input
              label="Expected Harvest Date"
              type="date"
              value={expectedHarvestDate}
              onChange={(e) => setExpectedHarvestDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-semibold text-brand-dark/90">
              Irrigation Source
            </label>
            <select
              value={irrigationType}
              onChange={(e) => setIrrigationType(e.target.value)}
              className="block w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
            >
              {irrigationList.map((irr) => (
                <option key={irr.value} value={irr.value}>
                  {irr.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-semibold text-brand-dark/90">
              Crop Health Status
            </label>
            <select
              value={healthStatus}
              onChange={(e) => setHealthStatus(e.target.value as 'healthy' | 'needs_attention' | 'diseased')}
              className="block w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
            >
              <option value="healthy">Healthy (No visible pests/disease)</option>
              <option value="needs_attention">Needs Attention (Mild leaf yellowing/stress)</option>
              <option value="diseased">Diseased (Visible blight/pests)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-cream-200">
            <Button type="button" variant="secondary" onClick={() => setIsCropModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingCrop}>
              {editingCrop ? 'Save Changes' : 'Plant Crop'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Record Soil Test Modal */}
      <Modal
        isOpen={isSoilModalOpen}
        onClose={() => setIsSoilModalOpen(false)}
        title="Record Plot Soil Test (N-P-K & pH)"
      >
        <form onSubmit={handleSaveSoil} className="space-y-4 pt-2">
          <p className="text-xs text-brand-dark/70">
            Enter values from your official Soil Health Card (SHC) or block agricultural lab report.
          </p>

          <div className="grid grid-cols-3 gap-2">
            <Input
              label="Nitrogen (N)"
              type="number"
              step="1"
              required
              value={soilN}
              onChange={(e) => setSoilN(e.target.value)}
              placeholder="kg/ha"
            />
            <Input
              label="Phosphorus (P)"
              type="number"
              step="1"
              required
              value={soilP}
              onChange={(e) => setSoilP(e.target.value)}
              placeholder="kg/ha"
            />
            <Input
              label="Potassium (K)"
              type="number"
              step="1"
              required
              value={soilK}
              onChange={(e) => setSoilK(e.target.value)}
              placeholder="kg/ha"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Soil pH"
              type="number"
              step="0.1"
              min="3"
              max="10"
              required
              value={soilPh}
              onChange={(e) => setSoilPh(e.target.value)}
              placeholder="6.5"
            />
            <Input
              label="Test Date"
              type="date"
              required
              value={soilTestDate}
              onChange={(e) => setSoilTestDate(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-cream-200">
            <Button type="button" variant="secondary" onClick={() => setIsSoilModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingSoil}>
              Save Soil Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Guest Mode Protection Prompt */}
      <GuestSavePrompt
        isOpen={isGuestPromptOpen}
        onClose={() => setIsGuestPromptOpen(false)}
        featureName="Farm & Crop Management"
      />
    </div>
  );
}
