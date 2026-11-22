'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Compass,
  MapPin,
  AlertTriangle,
  CloudRain,
} from 'lucide-react';
import type { WeatherData } from '@/lib/weather/open-meteo';

const BENGAL_DISTRICTS: Array<{ name: string; lat: number; lon: number }> = [
  { name: 'Purba Bardhaman (Burdwan)', lat: 23.2324, lon: 87.8615 },
  { name: 'Hooghly (Chinsurah)', lat: 22.9031, lon: 88.3968 },
  { name: 'Nadia (Krishnanagar)', lat: 23.4013, lon: 88.4965 },
  { name: 'Murshidabad (Berhampore)', lat: 24.1037, lon: 88.2536 },
  { name: 'Birbhum (Suri)', lat: 23.9056, lon: 87.5246 },
  { name: 'Bankura', lat: 23.2313, lon: 87.0784 },
  { name: 'Paschim Medinipur', lat: 22.4257, lon: 87.3199 },
  { name: 'Purba Medinipur (Tamluk)', lat: 22.2985, lon: 87.9254 },
  { name: 'Malda (English Bazar)', lat: 25.0108, lon: 88.1411 },
  { name: 'Jalpaiguri', lat: 26.5414, lon: 88.7196 },
  { name: 'Cooch Behar', lat: 26.3452, lon: 89.4482 },
  { name: 'South 24 Parganas (Alipore)', lat: 22.5312, lon: 88.3242 },
  { name: 'North 24 Parganas (Barasat)', lat: 22.7231, lon: 88.4815 },
];

export default function WeatherPage() {
  const { profile } = useAuth();
  const toast = useToast();

  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    lat: number;
    lon: number;
  }>({
    name: profile?.district || 'Purba Bardhaman (Burdwan)',
    lat: profile?.latitude || 23.2324,
    lon: profile?.longitude || 87.8615,
  });

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  const fetchWeather = useCallback(async (lat: number, lon: number, name: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}&location=${encodeURIComponent(name)}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch weather');
      }
      setWeather(data.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Weather fetch error';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchWeather(selectedLocation.lat, selectedLocation.lon, selectedLocation.name);
  }, [fetchWeather, selectedLocation]);

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = BENGAL_DISTRICTS.find((d) => d.name === e.target.value);
    if (found) {
      setSelectedLocation(found);
    }
  };

  const handleGpsDetect = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingGps(false);
        const loc = {
          name: 'My GPS Location',
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        };
        setSelectedLocation(loc);
        toast.success('Retrieved local GPS weather.');
      },
      () => {
        setIsDetectingGps(false);
        toast.warning('Could not retrieve GPS location.');
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="space-y-6 w-full text-left">
      {/* Title & Location Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-forest">
            Farm Weather & Agro-Advisories
          </h1>
          <p className="text-xs sm:text-sm text-brand-dark/70 mt-1">
            Real live meteorological forecasts from Open-Meteo with spray window and disease risk analytics.
          </p>
        </div>

        {/* Location Dropdown & GPS Button */}
        <div className="flex items-center gap-2">
          <select
            value={selectedLocation.name}
            onChange={handleDistrictChange}
            className="block rounded-xl border border-cream-300 bg-white px-3 py-2 text-xs sm:text-sm text-brand-dark font-semibold focus:outline-none focus:ring-2 focus:ring-brand-emerald"
          >
            {BENGAL_DISTRICTS.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGpsDetect}
            isLoading={isDetectingGps}
            leftIcon={<Compass className="w-3.5 h-3.5" />}
          >
            GPS
          </Button>
        </div>
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
                    <span>{weather.locationName}</span>
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

            {/* 3. Fungal / Late Blight Risk */}
            <Card className="hover:border-brand-leaf/40 transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-dark uppercase tracking-wider">
                    Fungal Disease Weather Risk
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
              7-Day Agricultural Forecast
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {weather.daily.map((day, idx) => {
                const dateObj = new Date(day.date);
                const dayName = idx === 0 ? 'Today' : dateObj.toLocaleDateString('en-IN', { weekday: 'short' });
                const monthDay = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

                return (
                  <Card key={day.date} className="text-center hover:border-brand-leaf/40 transition-all p-3 space-y-2">
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
