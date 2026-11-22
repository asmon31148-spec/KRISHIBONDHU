'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation, Language } from '@/i18n/context';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  MapPin,
  Warehouse,
  Sprout,
  Compass,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

const COMMON_CROPS = [
  'Rice (Aman / Winter)',
  'Rice (Boro / Summer)',
  'Potato (আলু)',
  'Jute (পাট)',
  'Brinjal (বেগুন)',
  'Mustard (সর্ষে)',
  'Chilli (লঙ্কা)',
  'Tomato (টমেটো)',
  'Cauliflower (ফুলকপি)',
  'Cabbage (বাঁধাকপি)',
  'Onion (পেঁয়াজ)',
  'Wheat (গম)',
  'Pulses / Lentils (ডাল)',
];

export default function OnboardingPage() {
  const { t, language, setLanguage } = useTranslation();
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [state, setState] = useState(profile?.state || 'West Bengal');
  const [district, setDistrict] = useState(profile?.district || '');
  const [village, setVillage] = useState(profile?.village || '');
  const [farmArea, setFarmArea] = useState<string>(profile?.farm_area ? String(profile.farm_area) : '');
  const [farmAreaUnit, setFarmAreaUnit] = useState<string>(profile?.farm_area_unit || 'bigha');
  const [soilType, setSoilType] = useState<string>(profile?.soil_type || 'alluvial');
  const [selectedCrops, setSelectedCrops] = useState<string[]>(profile?.primary_crops || []);
  const [coords, setCoords] = useState<{ lat: number | null; lon: number | null }>({
    lat: profile?.latitude || null,
    lon: profile?.longitude || null,
  });
  const [geoLocating, setGeoLocating] = useState(false);

  useEffect(() => {
    if (profile?.full_name && !fullName) {
      setFullName(profile.full_name);
    }
  }, [profile, fullName]);

  const toggleCrop = (crop: string) => {
    setSelectedCrops((prev) =>
      prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop]
    );
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
        setGeoLocating(false);
        toast.success('Farm location captured via GPS.');
      },
      () => {
        setGeoLocating(false);
        toast.warning('Could not retrieve GPS location. You can enter district manually.');
      },
      { timeout: 10000 }
    );
  };

  const handleComplete = async () => {
    if (!user) {
      router.push('/dashboard');
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      if (!supabase) {
        router.push('/dashboard');
        return;
      }

      const updates = {
        full_name: fullName.trim() || user.email?.split('@')[0],
        phone: phone.trim() || null,
        state: state.trim(),
        district: district.trim() || null,
        village: village.trim() || null,
        latitude: coords.lat,
        longitude: coords.lon,
        farm_area: farmArea ? parseFloat(farmArea) : 0,
        farm_area_unit: farmAreaUnit,
        soil_type: soilType,
        primary_crops: selectedCrops,
        preferred_language: language,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        toast.error('Failed to save profile. ' + error.message);
      } else {
        // Also create their initial farm record if area is provided
        if (farmArea && parseFloat(farmArea) > 0) {
          await supabase.from('farms').insert({
            user_id: user.id,
            name: `${fullName || 'My'} Primary Farm`,
            location_name: district ? `${village ? village + ', ' : ''}${district}` : state,
            latitude: coords.lat,
            longitude: coords.lon,
            area: parseFloat(farmArea),
            area_unit: farmAreaUnit,
            soil_type: soilType,
          });
        }

        await refreshProfile();
        toast.success('Farm profile registered successfully!');
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error completing setup';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10 text-left">
      <Card className="shadow-lg border-cream-200">
        <CardHeader className="border-b border-cream-200 pb-5">
          <div className="flex items-center justify-between">
            <Badge variant="forest" size="md">
              Step {step} of 3
            </Badge>
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-semibold text-brand-dark/60 hover:text-brand-dark hover:underline"
            >
              {t('onboarding.skip')} →
            </button>
          </div>
          <CardTitle className="text-2xl font-extrabold text-brand-forest mt-2">
            {t('onboarding.title')}
          </CardTitle>
          <CardDescription>
            {t('onboarding.subtitle')}
          </CardDescription>

          {/* Stepper Progress bar */}
          <div className="flex items-center gap-2 pt-3">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  s <= step ? 'bg-brand-forest' : 'bg-cream-200'
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* STEP 1: Farmer & Language Details */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-brand-dark flex items-center gap-2">
                <span>1. {t('onboarding.step1')}</span>
              </h3>

              <Input
                label={t('auth.fullName')}
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Farmer name"
              />

              <Input
                label={t('onboarding.phone')}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number for SMS/advisories"
              />

              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-semibold text-brand-dark/90">
                  {t('onboarding.preferredLanguage')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['en', 'bn', 'hi'] as Language[]).map((lang) => {
                    const labels = { en: 'English', bn: 'বাংলা', hi: 'हिन्दी' };
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setLanguage(lang)}
                        className={`p-3 rounded-xl border text-center font-bold text-sm transition-all ${
                          language === lang
                            ? 'bg-brand-forest text-white border-brand-forest shadow-xs'
                            : 'bg-white text-brand-dark border-cream-300 hover:bg-cream-100'
                        }`}
                      >
                        {labels[lang]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Farm Location & Land Area */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-brand-dark flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-brand-leaf" />
                <span>2. {t('onboarding.step2')}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t('onboarding.state')}
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. West Bengal"
                />

                <Input
                  label={t('onboarding.district')}
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Burdwan / Hooghly / Nadia"
                />
              </div>

              <Input
                label={t('onboarding.village')}
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="Village, Gram Panchayat or Post Office"
              />

              {/* GPS Location Button */}
              <div className="p-3.5 rounded-xl bg-cream-100 border border-cream-200 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-leaf" />
                    Farm Geolocation (Optional)
                  </span>
                  <p className="text-[11px] text-brand-dark/70">
                    {coords.lat && coords.lon
                      ? `Lat: ${coords.lat.toFixed(4)}, Lon: ${coords.lon.toFixed(4)}`
                      : 'Capture precise GPS for high-accuracy local weather and disease alerts.'}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={detectLocation}
                  isLoading={geoLocating}
                  leftIcon={<Compass className="w-3.5 h-3.5" />}
                >
                  {coords.lat ? 'Update GPS' : 'Get Farm GPS'}
                </Button>
              </div>

              {/* Area & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t('onboarding.farmArea')}
                  type="number"
                  step="0.1"
                  min="0"
                  value={farmArea}
                  onChange={(e) => setFarmArea(e.target.value)}
                  placeholder="e.g. 5"
                />

                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-semibold text-brand-dark/90">
                    {t('onboarding.unit')}
                  </label>
                  <select
                    value={farmAreaUnit}
                    onChange={(e) => setFarmAreaUnit(e.target.value)}
                    className="block w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-sm sm:text-base text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
                  >
                    <option value="bigha">{t('onboarding.units.bigha')}</option>
                    <option value="katha">{t('onboarding.units.katha')}</option>
                    <option value="acres">{t('onboarding.units.acres')}</option>
                    <option value="hectares">{t('onboarding.units.hectares')}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Crops & Soil Type */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-brand-dark flex items-center gap-2">
                <Sprout className="w-5 h-5 text-brand-leaf" />
                <span>3. {t('onboarding.step3')}</span>
              </h3>

              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-semibold text-brand-dark/90">
                  {t('onboarding.soilType')}
                </label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="block w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-sm sm:text-base text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
                >
                  <option value="alluvial">{t('onboarding.soilTypes.alluvial')}</option>
                  <option value="clay">{t('onboarding.soilTypes.clay')}</option>
                  <option value="sandy_loam">{t('onboarding.soilTypes.sandy_loam')}</option>
                  <option value="laterite">{t('onboarding.soilTypes.laterite')}</option>
                  <option value="black">{t('onboarding.soilTypes.black')}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-semibold text-brand-dark/90">
                  {t('onboarding.primaryCrops')} (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_CROPS.map((crop) => {
                    const isSelected = selectedCrops.includes(crop);
                    return (
                      <button
                        key={crop}
                        type="button"
                        onClick={() => toggleCrop(crop)}
                        className={`text-xs px-3 py-2 rounded-xl font-medium border transition-all ${
                          isSelected
                            ? 'bg-brand-forest text-white border-brand-forest shadow-2xs'
                            : 'bg-white text-brand-dark/80 border-cream-300 hover:border-brand-leaf/40'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />}
                        {crop}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-cream-200">
            {step > 1 ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                {t('common.back')}
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button
                type="button"
                variant="primary"
                onClick={() => setStep((s) => (s === 1 ? 2 : 3))}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                variant="amber"
                onClick={handleComplete}
                isLoading={isLoading}
                rightIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                {t('onboarding.submit')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
