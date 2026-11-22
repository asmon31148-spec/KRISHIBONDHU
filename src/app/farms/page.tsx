'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/i18n/context';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { GuestSavePrompt } from '@/components/auth/GuestSavePrompt';
import {
  Warehouse,
  Plus,
  MapPin,
  Edit2,
  Trash2,
  Compass,
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

export default function FarmsPage() {
  const { t } = useTranslation();
  const { user, isGuest } = useAuth();
  const toast = useToast();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGuestPromptOpen, setIsGuestPromptOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [area, setArea] = useState('');
  const [areaUnit, setAreaUnit] = useState<string>('bigha');
  const [soilType, setSoilType] = useState('alluvial');
  const [coords, setCoords] = useState<{ lat: number | null; lon: number | null }>({
    lat: null,
    lon: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [geoLocating, setGeoLocating] = useState(false);

  const loadFarms = useCallback(async () => {
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
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setFarms(data as Farm[]);
      }
    } catch (err) {
      console.error('Error loading farms:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFarms();
  }, [loadFarms]);

  const handleOpenAdd = () => {
    if (isGuest) {
      setIsGuestPromptOpen(true);
      return;
    }
    setEditingFarm(null);
    setName('');
    setLocationName('');
    setArea('');
    setAreaUnit('bigha');
    setSoilType('alluvial');
    setCoords({ lat: null, lon: null });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (farm: Farm) => {
    setEditingFarm(farm);
    setName(farm.name);
    setLocationName(farm.location_name || '');
    setArea(String(farm.area));
    setAreaUnit(farm.area_unit);
    setSoilType(farm.soil_type || 'alluvial');
    setCoords({ lat: farm.latitude, lon: farm.longitude });
    setIsModalOpen(true);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name.trim()) {
      toast.error('Please enter a farm name.');
      return;
    }
    if (!area || parseFloat(area) <= 0) {
      toast.error('Please enter a valid land area greater than 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      if (!supabase) return;

      if (editingFarm) {
        // Update existing farm
        const { error } = await supabase
          .from('farms')
          .update({
            name: name.trim(),
            location_name: locationName.trim() || null,
            area: parseFloat(area),
            area_unit: areaUnit,
            soil_type: soilType,
            latitude: coords.lat,
            longitude: coords.lon,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingFarm.id)
          .eq('user_id', user.id);

        if (error) {
          toast.error('Update failed: ' + error.message);
        } else {
          toast.success('Farm updated successfully!');
          setIsModalOpen(false);
          loadFarms();
        }
      } else {
        // Insert new farm
        const { error } = await supabase.from('farms').insert({
          user_id: user.id,
          name: name.trim(),
          location_name: locationName.trim() || null,
          area: parseFloat(area),
          area_unit: areaUnit,
          soil_type: soilType,
          latitude: coords.lat,
          longitude: coords.lon,
        });

        if (error) {
          toast.error('Failed to create farm: ' + error.message);
        } else {
          toast.success('Farm registered successfully!');
          setIsModalOpen(false);
          loadFarms();
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Operation failed';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (farmId: string) => {
    if (!user) return;
    if (!window.confirm(t('farms.deleteConfirm'))) return;

    try {
      const supabase = createClient();
      if (!supabase) return;

      const { error } = await supabase
        .from('farms')
        .delete()
        .eq('id', farmId)
        .eq('user_id', user.id);

      if (error) {
        toast.error('Failed to delete farm: ' + error.message);
      } else {
        toast.success('Farm removed successfully.');
        loadFarms();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Deletion failed';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-left">
      {/* Header with Title and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-forest">
            {t('farms.title')}
          </h1>
          <p className="text-xs sm:text-sm text-brand-dark/70 mt-1">
            {t('farms.subtitle')}
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenAdd}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          {t('farms.addFarm')}
        </Button>
      </div>

      {/* Farms List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-cream-100 rounded-2xl border border-cream-200" />
          ))}
        </div>
      ) : farms.length === 0 ? (
        <EmptyState
          icon={<Warehouse className="w-8 h-8" />}
          title={t('farms.empty')}
          description="Register your agricultural land plots to track crops, soil fertility, and irrigation."
          actionLabel={t('farms.addFarm')}
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {farms.map((farm) => (
            <Card key={farm.id} className="hover:border-brand-leaf/40 transition-all">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold text-brand-dark">
                    {farm.name}
                  </CardTitle>
                  <div className="flex items-center gap-1.5 text-xs text-brand-dark/70">
                    <MapPin className="w-3.5 h-3.5 text-brand-leaf shrink-0" />
                    <span>{farm.location_name || 'Location recorded'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(farm)}
                    className="p-1.5 rounded-lg text-brand-dark/60 hover:text-brand-dark hover:bg-cream-100 transition-colors"
                    aria-label="Edit farm"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(farm.id)}
                    className="p-1.5 rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
                    aria-label="Delete farm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-cream-50 border border-cream-200/90">
                  <div>
                    <span className="text-brand-dark/60 block text-[10px] uppercase font-semibold">
                      {t('farms.area')}
                    </span>
                    <span className="font-bold text-brand-forest text-sm">
                      {formatLandArea(farm.area, farm.area_unit as LandUnit)}
                    </span>
                  </div>
                  <div>
                    <span className="text-brand-dark/60 block text-[10px] uppercase font-semibold">
                      {t('farms.soil')}
                    </span>
                    <span className="font-medium text-brand-dark">
                      {farm.soil_type || 'Unspecified'}
                    </span>
                  </div>
                </div>

                {farm.latitude && farm.longitude && (
                  <p className="text-[11px] text-brand-dark/60 flex items-center gap-1">
                    <Compass className="w-3 h-3 text-emerald-600" />
                    GPS: {farm.latitude.toFixed(4)}, {farm.longitude.toFixed(4)}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Farm Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFarm ? t('farms.editFarm') : t('farms.addFarm')}
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Input
            label={t('farms.farmName')}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Uttar Para Plot #2"
          />

          <Input
            label={t('farms.location')}
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="Village, Mouza or District"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={t('farms.area')}
              type="number"
              step="0.1"
              min="0.1"
              required
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. 3.5"
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

          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-semibold text-brand-dark/90">
              {t('farms.soil')}
            </label>
            <select
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
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
              {editingFarm ? t('common.save') : t('farms.addFarm')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Guest Mode Protection Prompt */}
      <GuestSavePrompt
        isOpen={isGuestPromptOpen}
        onClose={() => setIsGuestPromptOpen(false)}
        featureName="Farm & Land Plot Management"
      />
    </div>
  );
}
