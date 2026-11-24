'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/context';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Compass,
  MapPin,
  AlertTriangle,
  CloudRain,
  Sprout,
  ArrowRight,
  Info,
  Clock,
  ShieldCheck,
  Volume2,
  VolumeX,
  Wind,
} from 'lucide-react';
import type { WeatherData } from '@/lib/weather/open-meteo';
import { evaluateWeatherDirectives } from '@/lib/weather/advisories';

interface BengalDistrict {
  name: string;
  lat: number;
  lon: number;
}

const BENGAL_DISTRICTS: BengalDistrict[] = [
  { name: 'Kolkata (Alipore)', lat: 22.5312, lon: 88.3242 },
  { name: 'South 24 Parganas (Diamond Harbour)', lat: 22.1896, lon: 88.1925 },
  { name: 'North 24 Parganas (Barasat)', lat: 22.7231, lon: 88.4815 },
  { name: 'Howrah (Uluberia)', lat: 22.4735, lon: 88.1098 },
  { name: 'Hooghly (Chinsurah)', lat: 22.9031, lon: 88.3968 },
  { name: 'Purba Bardhaman (Burdwan)', lat: 23.2324, lon: 87.8615 },
  { name: 'Paschim Bardhaman (Asansol)', lat: 23.6889, lon: 86.9661 },
  { name: 'Nadia (Krishnanagar)', lat: 23.4013, lon: 88.4965 },
  { name: 'Murshidabad (Berhampore)', lat: 24.1037, lon: 88.2536 },
  { name: 'Birbhum (Suri)', lat: 23.9056, lon: 87.5246 },
  { name: 'Bankura', lat: 23.2313, lon: 87.0784 },
  { name: 'Purulia', lat: 23.3322, lon: 86.3652 },
  { name: 'Paschim Medinipur (Midnapore)', lat: 22.4257, lon: 87.3199 },
  { name: 'Purba Medinipur (Tamluk)', lat: 22.2985, lon: 87.9254 },
  { name: 'Jhargram', lat: 22.4533, lon: 86.9856 },
  { name: 'Malda (English Bazar)', lat: 25.0108, lon: 88.1411 },
  { name: 'Uttar Dinajpur (Raiganj)', lat: 25.6197, lon: 88.1257 },
  { name: 'Dakshin Dinajpur (Balurghat)', lat: 25.2217, lon: 88.7667 },
  { name: 'Jalpaiguri', lat: 26.5414, lon: 88.7196 },
  { name: 'Alipurduar', lat: 26.4919, lon: 89.5271 },
  { name: 'Cooch Behar', lat: 26.3452, lon: 89.4482 },
  { name: 'Darjeeling', lat: 27.0410, lon: 88.2663 },
  { name: 'Kalimpong', lat: 27.0594, lon: 88.4695 },
];

function findNearestDistrict(lat: number, lon: number): { district: BengalDistrict; distanceKm: number } {
  let minDistance = Infinity;
  let nearest = BENGAL_DISTRICTS[0];

  for (const d of BENGAL_DISTRICTS) {
    const dLat = d.lat - lat;
    const dLon = d.lon - lon;
    const dist = Math.sqrt(dLat * dLat + dLon * dLon);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = d;
    }
  }

  return { district: nearest, distanceKm: Math.round(minDistance * 111) };
}

interface CropRecord {
  id: string;
  name: string;
  variety?: string | null;
  planting_date?: string;
  health_status?: string;
}

export default function WeatherPage() {
  const { user, profile } = useAuth();
  const { language } = useTranslation();
  const toast = useToast();
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const speakDirective = (id: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast.info('Audio readout not supported on this browser.');
      return;
    }

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const langCode = language === 'bn' ? 'bn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const matched = voices.find((v) => v.lang.replace('_', '-').includes(langCode));
    if (matched) utterance.voice = matched;

    utterance.onstart = () => setSpeakingId(id);
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    window.speechSynthesis.speak(utterance);
  };

  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    lat: number;
    lon: number;
    source: 'gps' | 'manual' | 'profile';
    gpsDetails?: string;
  }>({
    name: profile?.district || 'Hooghly (Chinsurah)',
    lat: profile?.latitude || 22.9031,
    lon: profile?.longitude || 88.3968,
    source: profile?.district ? 'profile' : 'manual',
  });

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [userCrops, setUserCrops] = useState<CropRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  const lastFetchedRef = useRef<string>('');

  // Load user's active crops to enable crop-aware weather risk
  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    if (!supabase) return;

    const loadCrops = async () => {
      try {
        const { data } = await supabase
          .from('crops')
          .select('id, name, variety, planting_date, health_status')
          .eq('user_id', user.id);
        if (data) setUserCrops(data as CropRecord[]);
      } catch (err) {
        console.warn('Could not load crops for weather risk:', err);
      }
    };

    loadCrops();
  }, [user]);

  const fetchWeather = useCallback(async (lat: number, lon: number, name: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}&location=${encodeURIComponent(name)}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch weather');
      }
      setWeather(data.data);
      setLastFetchedAt(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Weather fetch error';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const locKey = `${selectedLocation.lat}_${selectedLocation.lon}_${selectedLocation.name}`;
    if (lastFetchedRef.current !== locKey) {
      lastFetchedRef.current = locKey;
      fetchWeather(selectedLocation.lat, selectedLocation.lon, selectedLocation.name);
    }
  }, [fetchWeather, selectedLocation.lat, selectedLocation.lon, selectedLocation.name]);

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'gps') {
      // User reselected the active GPS option
      return;
    }
    const found = BENGAL_DISTRICTS.find((d) => d.name === val);
    if (found) {
      setSelectedLocation({
        name: found.name,
        lat: found.lat,
        lon: found.lon,
        source: 'manual',
      });
      toast.info(`Weather loaded for ${found.name}.`);
    }
  };

  const handleGpsDetect = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingGps(false);
        const { latitude, longitude } = pos.coords;
        const { district, distanceKm } = findNearestDistrict(latitude, longitude);

        const label = `GPS: Near ${district.name.split(' (')[0]} (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E)`;

        setSelectedLocation({
          name: label,
          lat: latitude,
          lon: longitude,
          source: 'gps',
          gpsDetails: `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)} (~${distanceKm}km from ${district.name.split(' (')[0]})`,
        });

        toast.success(`GPS acquired: Live weather fetched for your coordinates.`);
      },
      (error) => {
        setIsDetectingGps(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Location permission was denied. Please allow location access in your browser or choose your district from the dropdown.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          toast.error('GPS satellite signal unavailable. Please select your district manually.');
        } else if (error.code === error.TIMEOUT) {
          toast.warning('GPS acquisition timed out. Please try again or select your district.');
        } else {
          toast.error(`GPS Error: ${error.message}`);
        }
      },
      { timeout: 12000, enableHighAccuracy: true }
    );
  };

  // Crop-aware weather risk evaluation
  const evaluatedCropRisks: Array<{
    cropName: string;
    riskTitle: string;
    level: 'low' | 'moderate' | 'high';
    details: string;
    action: string;
  }> = [];

  if (weather && userCrops.length > 0) {
    userCrops.forEach((c) => {
      const lower = c.name.toLowerCase();
      // Potato Late Blight Evaluation
      if (lower.includes('potato') || lower.includes('আলু')) {
        const isBlightConducive = weather.current.relativeHumidity >= 80 && weather.current.temperature >= 10 && weather.current.temperature <= 22;
        if (isBlightConducive) {
          evaluatedCropRisks.push({
            cropName: c.name,
            riskTitle: 'Late Blight Weather Alert (Phytophthora)',
            level: weather.current.relativeHumidity >= 88 ? 'high' : 'moderate',
            details: `Relative humidity at ${weather.current.relativeHumidity}% with cool temperature (${Math.round(weather.current.temperature)}°C) creates high spore germination risk.`,
            action: 'Apply prophylactic Trichoderma viride or Mancozeb 75% WP @ 2.0-2.5g/L before rain. Avoid over-irrigation.',
          });
        }
      }

      // Rice / Paddy Blast & Sheath Blight Evaluation
      if (lower.includes('rice') || lower.includes('paddy') || lower.includes('ধান')) {
        const hasRainRisk = weather.daily.slice(0, 3).some((d) => d.precipitationSum >= 5);
        if (weather.current.relativeHumidity >= 85 || hasRainRisk) {
          evaluatedCropRisks.push({
            cropName: c.name,
            riskTitle: 'Sheath Blight & Blast Conducive Weather',
            level: 'moderate',
            details: `Sustained high atmospheric humidity (${weather.current.relativeHumidity}%) and cloud cover (${weather.current.cloudCover}%) favor fungal pathogen proliferation.`,
            action: 'Ensure field drainage channels are clear to prevent standing water stagnation. Avoid excessive top-dressing with nitrogen/urea.',
          });
        }
      }

      // Vegetable Root Suffocation / Waterlogging Evaluation
      if (lower.includes('brinjal') || lower.includes('tomato') || lower.includes('chilli') || lower.includes('vegetable')) {
        const heavyRain = weather.daily.slice(0, 3).some((d) => d.precipitationSum >= 15);
        if (heavyRain) {
          evaluatedCropRisks.push({
            cropName: c.name,
            riskTitle: 'Root Zone Waterlogging & Wilting Hazard',
            level: 'high',
            details: `Heavy precipitation forecasted in the upcoming 3 days. Solanaceous vegetables are highly susceptible to bacterial wilt under waterlogged roots.`,
            action: 'Raise soil bunds immediately and create runoff furrows between rows.',
          });
        }
      }
    });
  }

  const directives = weather ? evaluateWeatherDirectives(weather) : [];

  return (
    <div className="space-y-6 w-full text-left pb-12">
      {/* Title & Location Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-forest/10 text-brand-forest text-xs font-semibold mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>Open-Meteo High-Resolution Agronomic Weather</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-forest">
            Farm Weather & Agro-Advisories
          </h1>
          <p className="text-xs sm:text-sm text-brand-dark/70 mt-0.5">
            Real live meteorological data from Open-Meteo with spray window, crop risk, and 7-day agricultural forecasts.
          </p>
        </div>

        {/* Location Dropdown & GPS Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedLocation.source === 'gps' ? 'gps' : selectedLocation.name}
            onChange={handleDistrictChange}
            aria-label="Select Farm District or Coordinates"
            className="block rounded-xl border border-cream-300 bg-white px-3 py-2 text-xs sm:text-sm text-brand-dark font-semibold focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
          >
            {selectedLocation.source === 'gps' && (
              <option value="gps">
                📍 {selectedLocation.name}
              </option>
            )}
            {BENGAL_DISTRICTS.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>

          <Button
            variant={selectedLocation.source === 'gps' ? 'primary' : 'outline'}
            size="sm"
            onClick={handleGpsDetect}
            isLoading={isDetectingGps}
            leftIcon={<Compass className="w-3.5 h-3.5" />}
            title="Detect location using device GPS"
            className="min-h-[44px]"
          >
            {selectedLocation.source === 'gps' ? 'GPS Active' : 'Use GPS'}
          </Button>
        </div>
      </div>

      {/* Provenance & Location Source Indicator */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-cream-50 dark:bg-[#13261D] border border-cream-200 dark:border-white/10 text-xs flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {selectedLocation.source === 'gps' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-300">
              <Compass className="w-3.5 h-3.5 text-emerald-700" />
              <span>GPS Coordinates Active: {selectedLocation.gpsDetails || `${selectedLocation.lat.toFixed(3)}, ${selectedLocation.lon.toFixed(3)}`}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cream-200/80 text-brand-dark font-semibold text-xs border border-cream-300">
              <MapPin className="w-3.5 h-3.5 text-brand-leaf" />
              <span>Manually Selected District: {selectedLocation.name}</span>
            </span>
          )}
        </div>

        {lastFetchedAt && (
          <span className="text-[11px] text-brand-dark/60 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-brand-leaf" />
            Last Synced: {lastFetchedAt}
          </span>
        )}
      </div>

      {isLoading || !weather ? (
        <div className="space-y-6 animate-pulse">
          <div className="h-56 bg-cream-100 rounded-3xl border border-cream-200" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-cream-100 rounded-2xl border border-cream-200" />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Hero Weather Card */}
          <Card className="overflow-hidden border-cream-200 shadow-md">
            <div className="p-6 sm:p-8 bg-gradient-to-r from-brand-forest via-brand-leaf to-brand-forest text-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-brand-mint font-semibold">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{weather.locationName || selectedLocation.name}</span>
                    <span>•</span>
                    <span>{new Date(weather.current.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl sm:text-6xl font-black tracking-tight">
                      {Math.round(weather.current.temperature)}°C
                    </span>
                    <span className="text-sm sm:text-base font-semibold text-white/90">
                      {weather.current.weatherDescription}
                    </span>
                  </div>
                  <p className="text-xs text-white/75">
                    Feels like {Math.round(weather.current.apparentTemperature)}°C • Cloud Cover: {weather.current.cloudCover}%
                  </p>
                </div>

                {/* Key Metric Pills */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
                    <span className="text-white/70 block text-[10px] uppercase font-bold">Relative Humidity</span>
                    <span className="text-base font-black text-white">{weather.current.relativeHumidity}%</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
                    <span className="text-white/70 block text-[10px] uppercase font-bold">Wind Speed</span>
                    <span className="text-base font-black text-white">{weather.current.windSpeed} km/h</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
                    <span className="text-white/70 block text-[10px] uppercase font-bold">Rainfall (1h)</span>
                    <span className="text-base font-black text-white">{weather.current.precipitation} mm</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
                    <span className="text-white/70 block text-[10px] uppercase font-bold">Day Temperature</span>
                    <span className="text-base font-black text-white">
                      {Math.round(weather.daily[0]?.temperatureMax)}° / {Math.round(weather.daily[0]?.temperatureMin)}°
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weather Warning Banner if any */}
            {weather.agronomicInsights.heatRainWarning && (
              <div className="p-3.5 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-center gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{weather.agronomicInsights.heatRainWarning}</span>
              </div>
            )}
          </Card>

          {/* Actionable Weather Directives with Voice Alerts */}
          {directives.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-brand-leaf" />
                  <h3 className="text-sm font-bold text-brand-dark dark:text-[#EAF2EC] uppercase tracking-wider">
                    {language === 'bn'
                      ? 'জরুরি কৃষি নির্দেশিকা ও অডিও বার্তা'
                      : language === 'hi'
                      ? 'तत्काल कृषि निर्देश व ऑडियो संदेश'
                      : 'Actionable Weather Directives & Voice Alerts'}
                  </h3>
                </div>
                <span className="text-xs text-brand-dark/50 dark:text-white/50 font-medium">Deterministic Rule Engine</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {directives.map((d) => {
                  const title = language === 'bn' ? d.title_bn : language === 'hi' ? d.title_hi : d.title_en;
                  const message = language === 'bn' ? d.message_bn : language === 'hi' ? d.message_hi : d.message_en;
                  const action = language === 'bn' ? d.action_bn : language === 'hi' ? d.action_hi : d.action_en;
                  const isSpeaking = speakingId === d.id;

                  return (
                    <Card
                      key={d.id}
                      className={`border-t-4 transition-all ${
                        d.status === 'optimal'
                          ? 'border-t-emerald-600 bg-white'
                          : d.status === 'warning'
                          ? 'border-t-amber-500 bg-amber-50/20'
                          : 'border-t-rose-600 bg-rose-50/20'
                      }`}
                    >
                      <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full space-y-3">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                d.status === 'optimal'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : d.status === 'warning'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-rose-100 text-rose-900'
                              }`}
                            >
                              {d.type.replace('_', ' ')}
                            </span>

                            {/* Speaker Voice Alert Icon */}
                            <button
                              type="button"
                              onClick={() => speakDirective(d.id, `${title}. ${message}. ${action}`)}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                isSpeaking
                                  ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                                  : 'bg-white text-brand-dark/70 hover:text-brand-forest hover:bg-cream-100 border-cream-200'
                              }`}
                              title={isSpeaking ? 'Stop Audio Readout' : 'Listen in Bengali/Hindi'}
                            >
                              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>
                          </div>

                          <h4 className="text-sm font-bold text-brand-dark dark:text-[#EAF2EC] leading-snug">
                            {title}
                          </h4>
                          <p className="text-xs text-brand-dark/75 dark:text-white/70 leading-relaxed">
                            {message}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-cream-200/80 dark:border-white/10">
                          <span className="text-[11px] font-bold text-brand-forest dark:text-emerald-400 block">
                            Direct Farm Action:
                          </span>
                          <span className="text-[11px] text-brand-dark/80 dark:text-white/80 font-medium">
                            {action}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Personalized Crop-Aware Risk Warnings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sprout className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-brand-dark dark:text-[#EAF2EC] uppercase tracking-wider">
                  Crop-Specific Pathogen & Climate Risk ({userCrops.length} Crops Tracked)
                </h3>
              </div>
              <Link
                href="/farms"
                className="text-xs font-semibold text-brand-forest dark:text-emerald-400 hover:text-brand-leaf flex items-center gap-1"
              >
                <span>Manage Crops</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {userCrops.length === 0 ? (
              <div className="p-4 rounded-2xl bg-cream-50 dark:bg-[#13261D] border border-cream-200 dark:border-white/10 text-xs text-brand-dark/75 dark:text-white/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-brand-leaf shrink-0" />
                  <span>
                    No active crops recorded in your farm. Add your sown crops (Potato, Rice, Brinjal) to unlock personalized disease outbreak warnings.
                  </span>
                </div>
                <Link
                  href="/farms"
                  className="px-3 py-1.5 rounded-lg bg-brand-forest text-white text-xs font-bold hover:bg-brand-leaf shrink-0"
                >
                  Add Crops
                </Link>
              </div>
            ) : evaluatedCropRisks.length === 0 ? (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold block">Favorable Weather for Sown Crops:</span>
                  <span className="text-emerald-900/80">
                    Current humidity and temperature ranges show low fungal blight and waterlogging pressure for your active crops ({userCrops.map((c) => c.name).join(', ')}).
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {evaluatedCropRisks.map((risk, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border text-xs space-y-2 ${
                      risk.level === 'high'
                        ? 'bg-red-50/80 border-red-200 text-red-950'
                        : 'bg-amber-50/80 border-amber-200 text-amber-950'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-brand-dark flex items-center gap-1.5">
                        <AlertTriangle className={`w-4 h-4 ${risk.level === 'high' ? 'text-red-600' : 'text-amber-600'}`} />
                        {risk.cropName}: {risk.riskTitle}
                      </span>
                      <Badge variant={risk.level === 'high' ? 'red' : 'amber'} size="sm">
                        {risk.level.toUpperCase()} RISK
                      </Badge>
                    </div>
                    <p className="text-brand-dark/80 leading-relaxed">
                      {risk.details}
                    </p>
                    <div className="p-2.5 rounded-xl bg-white/90 dark:bg-[#0B1711] border border-cream-200 dark:border-white/10 font-medium text-brand-forest dark:text-emerald-400">
                      <span className="font-bold block text-[10px] uppercase text-brand-dark/60 dark:text-white/60">Actionable Agronomy Advice:</span>
                      {risk.action}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3 Agronomic Weather Insights Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Spraying Conditions */}
            <Card className="hover:border-brand-leaf/40 transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-dark uppercase tracking-wider">
                    Pesticide Spray Window
                  </span>
                  <Badge
                    variant={
                      weather.agronomicInsights.sprayCondition.status === 'optimal'
                        ? 'emerald'
                        : weather.agronomicInsights.sprayCondition.status === 'marginal'
                        ? 'amber'
                        : 'red'
                    }
                    size="sm"
                  >
                    {weather.agronomicInsights.sprayCondition.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-brand-dark/80 leading-relaxed">
                  {weather.agronomicInsights.sprayCondition.reason}
                </p>
              </CardContent>
            </Card>

            {/* 2. Irrigation Timing */}
            <Card className="hover:border-brand-leaf/40 transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-dark uppercase tracking-wider">
                    Irrigation Guidance
                  </span>
                  <Badge
                    variant={
                      weather.agronomicInsights.irrigationAdvice.status === 'needed'
                        ? 'forest'
                        : weather.agronomicInsights.irrigationAdvice.status === 'delay'
                        ? 'amber'
                        : 'slate'
                    }
                    size="sm"
                  >
                    {weather.agronomicInsights.irrigationAdvice.status === 'needed'
                      ? 'SCHEDULED'
                      : weather.agronomicInsights.irrigationAdvice.status === 'delay'
                      ? 'DELAY (RAIN)'
                      : 'HOLD'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-brand-dark/80 leading-relaxed">
                  {weather.agronomicInsights.irrigationAdvice.reason}
                </p>
              </CardContent>
            </Card>

            {/* 3. General Fungal Risk */}
            <Card className="hover:border-brand-leaf/40 transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-dark uppercase tracking-wider">
                    Regional Fungal Index
                  </span>
                  <Badge
                    variant={
                      weather.agronomicInsights.diseaseRisk.level === 'low'
                        ? 'emerald'
                        : weather.agronomicInsights.diseaseRisk.level === 'moderate'
                        ? 'amber'
                        : 'red'
                    }
                    size="sm"
                  >
                    {weather.agronomicInsights.diseaseRisk.level.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-brand-dark/80 leading-relaxed">
                  {weather.agronomicInsights.diseaseRisk.reason}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 7-Day Weather Forecast */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-brand-forest">
              7-Day Agricultural Meteorological Forecast
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {weather.daily.map((day, idx) => {
                const dateObj = new Date(day.date);
                const dayName = idx === 0 ? 'Today' : dateObj.toLocaleDateString('en-IN', { weekday: 'short' });
                const monthDay = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

                return (
                  <Card key={day.date} className="text-center hover:border-brand-leaf/40 transition-all p-3 space-y-2 bg-white">
                    <div>
                      <span className="text-xs font-bold text-brand-dark block">{dayName}</span>
                      <span className="text-[10px] text-brand-dark/60 block">{monthDay}</span>
                    </div>

                    <div className="py-1">
                      <span className="text-xs font-bold text-brand-forest block">
                        {Math.round(day.temperatureMax)}° / {Math.round(day.temperatureMin)}°
                      </span>
                      <span className="text-[11px] text-brand-dark/70 block mt-0.5 leading-tight">
                        {day.weatherDescription}
                      </span>
                    </div>

                    <div className="pt-1 border-t border-cream-200 text-[10px] text-brand-dark/70 flex items-center justify-center gap-1">
                      <CloudRain className="w-3 h-3 text-blue-600" />
                      <span>{day.precipitationSum} mm</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
