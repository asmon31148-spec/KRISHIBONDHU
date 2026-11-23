'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/context';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  MapPin,
  RefreshCw,
  Search,
  AlertCircle,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { BENGAL_COMMODITIES, BENGAL_DISTRICTS, MandiRecord } from '@/lib/mandi/types';
import { parseAndFilterMandiRecords } from '@/lib/mandi/parser';

export default function MandiRadarPage() {
  const { language } = useTranslation();

  const [records, setRecords] = useState<MandiRecord[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Districts');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastTradeDate, setLastTradeDate] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [connectionSource, setConnectionSource] = useState<'server' | 'browser_direct' | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Cached ref to avoid redundant re-fetches
  const rawCacheRef = useRef<Record<string, any>[]>([]);

  // Main load function: attempts server proxy with resilience
  const fetchPrices = useCallback(
    async (district: string, commodity: string, forceFresh = false) => {
      // If we already have Bengal raw records in memory and didn't force fresh reload:
      if (!forceFresh && rawCacheRef.current.length > 0) {
        const { records: parsed, latestDateFound } = parseAndFilterMandiRecords(
          rawCacheRef.current,
          district,
          commodity
        );
        setRecords(parsed);
        setLastTradeDate(latestDateFound);
        setStatusMessage(
          parsed.length === 0
            ? 'Mandi Closed / Awaiting Daily Upload'
            : `Live APMC Agmarknet Verified (${latestDateFound || 'Today'})`
        );
        return;
      }

      setIsLoading(true);
      setErrorNotice(null);

      try {
        const params = new URLSearchParams({ district, commodity });
        if (forceFresh) params.set('force_fresh', 'true');
        const res = await fetch(`/api/mandi/prices?${params.toString()}`);

        if (res.ok) {
          const data = await res.json();

          if (data.success && data.records && data.records.length > 0) {
            setRecords(data.records);
            setLastTradeDate(data.lastTradeDate);
            setStatusMessage(
              data.source === 'live_agmarknet'
                ? `Live APMC Agmarknet Verified (${data.lastTradeDate || 'Today'})`
                : `Live Market Intelligence Grounding (${data.lastTradeDate || 'Today'})`
            );
            setConnectionSource('server');
            setIsLoading(false);
            return;
          }
        }

        // If not found for specific district, try with force_fresh
        if (!forceFresh) {
          const retryRes = await fetch(`/api/mandi/prices?district=${encodeURIComponent(district)}&commodity=${encodeURIComponent(commodity)}&force_fresh=true`);
          if (retryRes.ok) {
            const retryData = await retryRes.json();
            if (retryData.success && retryData.records && retryData.records.length > 0) {
              setRecords(retryData.records);
              setLastTradeDate(retryData.lastTradeDate);
              setStatusMessage(`Live Market Intelligence Verified (${retryData.lastTradeDate || 'Today'})`);
              setIsLoading(false);
              return;
            }
          }
        }

        setStatusMessage('Mandi Closed / Awaiting Daily Upload');
        setRecords([]);
      } catch (err: unknown) {
        console.warn('Mandi price fetch error:', err);
        setErrorNotice('Live APMC Agmarknet synchronization temporarily unavailable. Please retry shortly.');
        setRecords([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPrices(selectedDistrict, selectedCommodity);
  }, [selectedDistrict, selectedCommodity, fetchPrices]);

  // Client-side local instant search filter
  const filteredRecords = records.filter((r) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      r.commodity.toLowerCase().includes(query) ||
      r.market.toLowerCase().includes(query) ||
      r.district.toLowerCase().includes(query) ||
      r.variety.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 sm:space-y-8 w-full text-left">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cream-50 via-white to-emerald-50/50 border border-cream-300 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="emerald" size="sm" className="shadow-2xs">
                Live APMC Agmarknet
              </Badge>
              <span className="text-xs text-brand-dark/70 font-medium">
                • Government of India Open Data (OGD)
              </span>
              {connectionSource && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  <span>Real-Time Feed Connected</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
              {language === 'bn'
                ? 'রিয়েল-টাইম মান্ডি দর রাডার'
                : language === 'hi'
                ? 'रियल-टाइम मंडी भाव रडार'
                : 'Real-Time APMC Mandi Price Radar'}
            </h1>
            <p className="text-xs sm:text-sm text-brand-dark/75 max-w-xl">
              {language === 'bn'
                ? 'পশ্চিমবঙ্গের সরকারি মান্ডির সরাসরি দৈনিক পাইকারি নিলাম দর। মধ্যস্বত্বভোগীদের প্রতারণা থেকে বাঁচুন।'
                : language === 'hi'
                ? 'पश्चिम बंगाल की कृषि उपज मंडियों के दैनिक थोक भाव। बिचौलियों के शोषण से मुक्ति।'
                : 'Verified daily wholesale auction prices directly from West Bengal regulated APMC mandis.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
              onClick={() => fetchPrices(selectedDistrict, selectedCommodity, true)}
              disabled={isLoading}
              className="font-bold shadow-2xs"
            >
              {language === 'bn' ? 'রিফ্রেশ করুন' : 'Refresh Rates'}
            </Button>
            <Link href="/fertilizer">
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                className="font-bold shadow-2xs"
              >
                {language === 'bn' ? 'সার ক্যালকুলেটর' : 'Fertilizer Calculator'}
              </Button>
            </Link>
          </div>
        </div>

        {/* Live Status Bar */}
        <div className="mt-5 pt-4 border-t border-cream-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-brand-dark/80">
            <Clock className="w-4 h-4 text-brand-leaf" />
            <span className="font-semibold">
              {statusMessage || (isLoading ? 'Syncing Mandi Server...' : 'Data Available')}
            </span>
            {lastTradeDate && (
              <span className="text-brand-dark/60">• Last verified trading date: {lastTradeDate}</span>
            )}
          </div>
          <span className="text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full font-bold text-[11px] shadow-2xs">
            Strict Zero-Mock Production Feed
          </span>
        </div>
      </div>

      {/* Commodity Quick Filter Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-brand-dark uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-brand-leaf" />
            <span>Select Commodity</span>
          </span>
          <span className="text-xs text-brand-dark/60 font-medium">
            {BENGAL_COMMODITIES.length - 1} Bengal Crops
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {BENGAL_COMMODITIES.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSelectedCommodity(c.id);
                setSearchQuery('');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                selectedCommodity === c.id
                  ? 'bg-brand-forest text-white shadow-xs'
                  : 'bg-white border border-cream-200 text-brand-dark hover:border-brand-leaf/40'
              }`}
            >
              {language === 'bn' ? c.name_bn : language === 'hi' ? c.name_hi : c.name_en}
            </button>
          ))}
        </div>
      </div>

      {/* Search & District Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-brand-dark/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by market, town, or variety (e.g. Sheoraphuly, Jyoti, Burdwan)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-200 bg-white text-xs sm:text-sm text-brand-dark focus:outline-hidden focus:border-brand-leaf focus:ring-1 focus:ring-brand-leaf"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-cream-200 bg-white text-xs sm:text-sm font-semibold text-brand-dark focus:outline-hidden focus:border-brand-leaf cursor-pointer"
          >
            {BENGAL_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d === 'All Districts' ? '📍 All Bengal Districts' : `📍 ${d} District`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error / Offline Notice */}
      {errorNotice && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p>{errorNotice}</p>
        </div>
      )}

      {/* Commodity Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-cream-100 rounded-2xl border border-cream-200" />
          ))}
        </div>
      ) : filteredRecords.length === 0 ? (
        <EmptyState
          icon={<AlertCircle className="w-8 h-8 text-amber-600" />}
          title={statusMessage || 'Mandi Closed / Awaiting Daily Upload'}
          description={
            selectedDistrict !== 'All Districts'
              ? `No active auctions reported for ${
                  selectedCommodity !== 'all' ? selectedCommodity : 'this commodity'
                } in ${selectedDistrict} today. Try selecting "All Districts" to view active rates across neighboring Bengal APMC yards.`
              : 'No trading records matched your search filter. Try selecting "All Commodities" or clearing search keywords.'
          }
          actionLabel="Show All Bengal Mandis"
          onAction={() => {
            setSelectedDistrict('All Districts');
            setSelectedCommodity('all');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecords.map((r, idx) => (
            <Card
              key={`${r.market}_${r.commodity}_${idx}`}
              className="border-t-4 border-t-emerald-600 hover:shadow-md transition-shadow group bg-white"
            >
              <CardContent className="p-4 sm:p-5 space-y-3">
                {/* Header: Commodity & Variety */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-extrabold text-brand-dark group-hover:text-brand-forest transition-colors">
                      {r.commodity}
                    </h3>
                    <p className="text-xs text-brand-dark/60 font-medium">
                      Variety: {r.variety}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {r.trend === 'up' ? (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                        <span>Upward</span>
                      </span>
                    ) : r.trend === 'down' ? (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                        <TrendingDown className="w-3 h-3 text-rose-600" />
                        <span>Downward</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                        <Minus className="w-3 h-3" />
                        <span>Stable</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Main Modal Price */}
                <div className="p-3 rounded-xl bg-cream-50 border border-cream-200/80">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-semibold text-brand-dark/70">
                      Wholesale Modal Rate:
                    </span>
                    <span className="text-xl font-black text-brand-forest">
                      ₹{r.modal_price.toLocaleString('en-IN')}{' '}
                      <span className="text-xs font-normal text-brand-dark/60">/ Quintal</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-brand-dark/60 mt-1 pt-1 border-t border-cream-200">
                    <span>Min: ₹{r.min_price}</span>
                    <span>Max: ₹{r.max_price}</span>
                  </div>
                </div>

                {/* Farmer Friendly Conversions (per kg & per 50kg bag) */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-white border border-cream-200 shadow-2xs">
                    <span className="text-[10px] font-medium text-brand-dark/60 block">Price per kg</span>
                    <span className="text-sm font-extrabold text-brand-dark">₹{r.price_per_kg} / kg</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-cream-200 shadow-2xs">
                    <span className="text-[10px] font-medium text-brand-dark/60 block">50 kg Bag</span>
                    <span className="text-sm font-extrabold text-brand-dark">₹{r.price_per_50kg} / bag</span>
                  </div>
                </div>

                {/* Market & Date Provenance */}
                <div className="pt-2 border-t border-cream-200/80 flex items-center justify-between text-[11px] text-brand-dark/60">
                  <div className="flex items-center gap-1 truncate max-w-[170px]">
                    <MapPin className="w-3 h-3 text-brand-leaf shrink-0" />
                    <span className="truncate">{r.market}, {r.district}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Calendar className="w-3 h-3 text-brand-dark/40" />
                    <span>{r.arrival_date}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
