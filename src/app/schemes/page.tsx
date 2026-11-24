'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/context';
import { useToast } from '@/components/ui/Toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  ExternalLink,
  Calendar,
  Search,
  Phone,
  CheckSquare,
  Square,
  RefreshCw,
  Globe,
} from 'lucide-react';
import {
  VERIFIED_SCHEMES,
  PICTORIAL_CHECKLIST,
  OFFICIAL_HELPLINES,
} from '@/data/schemes';
import { SchemeLiveVerification } from '@/app/api/schemes/verify-live/route';

export default function SchemesPage() {
  const { language } = useTranslation();
  const toast = useToast();

  const handlePhoneClick = (e: React.MouseEvent, phone: string) => {
    const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
    if (!isTouchDevice) {
      e.preventDefault();
      navigator.clipboard?.writeText(phone);
      toast.success(
        language === 'bn'
          ? `হেল্পলাইন নম্বর ${phone} কপি করা হয়েছে!`
          : language === 'hi'
          ? `हेल्पलाइन नंबर ${phone} क्लिपबोर्ड पर कॉपी किया गया!`
          : `Helpline ${phone} copied to clipboard!`
      );
    }
  };

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSponsor, setSelectedSponsor] = useState<string>('All');
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});
  const [liveVerifications, setLiveVerifications] = useState<Record<string, SchemeLiveVerification>>({});
  const [isVerifying, setIsVerifying] = useState<boolean>(true);

  const fetchLiveStatus = useCallback((forceRefresh: boolean = false) => {
    setIsVerifying(true);
    fetch(`/api/schemes/verify-live${forceRefresh ? '?refresh=true' : ''}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.verifications) {
          setLiveVerifications(data.verifications);
          if (forceRefresh) {
            toast.success(
              language === 'bn'
                ? 'সরকারি পোর্টাল ও মৌসুমী যাচাই সম্পন্ন হয়েছে!'
                : language === 'hi'
                ? 'सरकारी पोर्टल और मौसमी सत्यापन पूर्ण हुआ!'
                : 'Government portal statuses and seasonal cutoffs verified live!'
            );
          }
        }
      })
      .catch((err) => {
        console.warn('Live scheme verification check:', err);
        if (forceRefresh) {
          toast.error('Could not verify scheme portals.');
        }
      })
      .finally(() => setIsVerifying(false));
  }, [language, toast]);

  useEffect(() => {
    fetchLiveStatus();
  }, [fetchLiveStatus]);

  const toggleDoc = (id: string) => {
    setCheckedDocs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const categories = [
    'All',
    'Direct Income',
    'Crop Insurance',
    'Irrigation & Subsidies',
    'Credit & Loan',
  ];

  const sponsors = [
    'All',
    'West Bengal State Government',
    'Central Government (Govt of India)',
  ];

  const filtered = VERIFIED_SCHEMES.filter((scheme) => {
    const matchesSearch =
      scheme.name.toLowerCase().includes(search.toLowerCase()) ||
      scheme.bengaliName.toLowerCase().includes(search.toLowerCase()) ||
      scheme.benefitAmount.toLowerCase().includes(search.toLowerCase()) ||
      scheme.eligibility.some((e) => e.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || scheme.category === selectedCategory;
    const matchesSponsor = selectedSponsor === 'All' || scheme.sponsor === selectedSponsor;

    return matchesSearch && matchesCategory && matchesSponsor;
  });

  return (
    <div className="space-y-6 sm:space-y-8 w-full text-left max-w-full overflow-x-clip pb-12">
      {/* Page Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cream-50 via-white to-emerald-50/50 dark:from-[#13261D] dark:via-[#0F2018] dark:to-[#0B1711] border border-cream-300 dark:border-white/10 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="emerald" size="sm">
                FY 2025–2026 Verified
              </Badge>
              <span className="text-xs text-brand-dark/60 dark:text-white/60">• Zero Middleman Guarantee</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark dark:text-white tracking-tight">
              {language === 'bn'
                ? 'সরকারি কৃষি প্রকল্প ও বীমা ন্যাভিগেটর'
                : language === 'hi'
                ? 'सरकारी कृषि योजनाएं व बीमा नेविगेटर'
                : 'Government Agricultural Schemes & Insurance Navigator'}
            </h1>
            <p className="text-xs sm:text-sm text-brand-dark/75 dark:text-white/60 max-w-xl">
              {language === 'bn'
                ? 'দালালমুক্ত সরাসরি সরকারি সুবিধা। কৃষকবন্ধু, বাংলা শস্য বীমা, ও পিএম-কিষাণের সরাসরি স্ট্যাটাস ট্র্যাকার ও নথি চেকলিস্ট।'
                : language === 'hi'
                ? 'बिचौलियों के बिना सीधे सरकारी लाभ। कृषक बंधु, फसल बीमा व पीएम-किसान की आधिकारिक स्थिति व दस्तावेज चेकलिस्ट।'
                : 'Direct verified welfare benefits, zero-premium state crop insurance, and official beneficiary lookup portals without brokers.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />}
              onClick={() => fetchLiveStatus(true)}
              disabled={isVerifying}
            >
              {language === 'bn' ? 'লাইভ পোর্টাল যাচাই' : language === 'hi' ? 'लाइव पोर्टल सत्यापन' : 'Verify Live Portal Status'}
            </Button>
            <a href="tel:18001801551" onClick={(e) => handlePhoneClick(e, '1800-180-1551')}>
              <Button variant="primary" size="sm" leftIcon={<Phone className="w-3.5 h-3.5" />}>
                {language === 'bn' ? 'কিষাণ কল সেন্টার' : 'Kisan Helpline 1800-180-1551'}
              </Button>
            </a>
            <Link href="/mandi">
              <Button variant="secondary" size="sm">
                {language === 'bn' ? 'মান্ডি দর' : 'Mandi Rates'}
              </Button>
            </Link>
          </div>
        </div>

        {/* Verification Checkline Banner */}
        <div className="mt-4 pt-3 border-t border-cream-200/80 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-brand-dark/70 dark:text-white/70">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
            <Globe className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>
              {isVerifying
                ? 'Browsing live official government circulars and active DBT welfare cycles...'
                : 'Live Web Grounded: Connected to real-time government dispatches & active season verifications'}
            </span>
          </div>
          <span className="text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            Live Search Grounded
          </span>
        </div>
      </div>

      {/* Interactive Pictorial Document Checklist */}
      <Card className="border-t-4 border-t-brand-forest shadow-xs">
        <CardHeader className="pb-3 border-b border-cream-200 dark:border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-forest text-white flex items-center justify-center text-xs font-bold">
                ✓
              </span>
              <CardTitle className="text-sm sm:text-base font-bold text-brand-dark">
                {language === 'bn'
                  ? 'প্রকল্পে আবেদনের সচিত্র নথি চেকলিস্ট (Interactive Document Checklist)'
                  : 'Interactive Pictorial Document Checklist (Click to tick off)'}
              </CardTitle>
            </div>
            <span className="text-xs text-brand-leaf font-bold">
              {Object.values(checkedDocs).filter(Boolean).length} / {PICTORIAL_CHECKLIST.length} Ready
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <p className="text-xs text-brand-dark/70 mb-4">
            {language === 'bn'
              ? 'কৃষি অফিসে বা বাংলা সহায়তা কেন্দ্রে (BSK) যাওয়ার আগে প্রয়োজনীয় কাগজপত্র সঙ্গে রাখুন:'
              : 'Keep these 4 verified essential documents ready before visiting the Agriculture Office or BSK counter:'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PICTORIAL_CHECKLIST.map((doc) => {
              const isChecked = Boolean(checkedDocs[doc.id]);
              return (
                <div
                  key={doc.id}
                  onClick={() => toggleDoc(doc.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isChecked
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40 ring-1 ring-emerald-400 shadow-2xs'
                      : 'border-cream-200 dark:border-white/10 bg-white dark:bg-[#111418] hover:border-brand-leaf/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{doc.icon}</span>
                      <button type="button" className="text-brand-forest dark:text-emerald-400">
                        {isChecked ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Square className="w-5 h-5 text-cream-400 dark:text-white/30" />
                        )}
                      </button>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-brand-dark dark:text-white mt-2">
                      {language === 'bn' ? doc.title_bn : language === 'hi' ? doc.title_hi : doc.title_en}
                    </h4>
                    <p className="text-[11px] text-brand-dark/70 dark:text-white/60 mt-1 leading-snug">
                      {language === 'bn' ? doc.description_bn : language === 'hi' ? doc.description_hi : doc.description_en}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-cream-200/80 dark:border-white/10 text-[10px] font-bold text-brand-leaf dark:text-emerald-400">
                    {isChecked ? 'Ready in Folder ✓' : 'Click to Mark Ready'}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* One-Touch Helpline Dialing Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-800 to-brand-forest text-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs uppercase tracking-wider text-emerald-200 font-bold block">
              Direct Farmer Helplines (One-Touch Dialing)
            </span>
            <p className="text-xs text-white/90">
              Speak directly with official agricultural extension scientists without brokers or middlemen:
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {OFFICIAL_HELPLINES.map((h, i) => (
              <a
                key={i}
                href={`tel:${h.dial}`}
                onClick={(e) => handlePhoneClick(e, h.number)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25  text-white text-xs font-bold border border-white/20 transition-colors shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-300" />
                <span>{h.number}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-brand-dark/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search scheme name, benefit amount, or eligibility..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-200 bg-white text-xs sm:text-sm text-brand-dark focus:outline-hidden focus:border-brand-leaf"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-cream-200 bg-white text-xs font-semibold text-brand-dark focus:outline-hidden focus:border-brand-leaf"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          <select
            value={selectedSponsor}
            onChange={(e) => setSelectedSponsor(e.target.value)}
            className="px-3 py-2 rounded-xl border border-cream-200 bg-white text-xs font-semibold text-brand-dark focus:outline-hidden focus:border-brand-leaf"
          >
            {sponsors.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Sponsors' : s.replace(' (Govt of India)', '')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {filtered.map((scheme) => (
          <Card
            key={scheme.id}
            className="flex flex-col justify-between border-t-4 border-t-brand-leaf hover:shadow-md transition-shadow group"
          >
            <CardHeader className="pb-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <Badge variant={scheme.sponsor.includes('West Bengal') ? 'emerald' : 'forest'} size="sm">
                  {scheme.sponsor}
                </Badge>
                <Badge variant="slate" size="sm">
                  {scheme.category}
                </Badge>
              </div>

              <div>
                <CardTitle className="text-base sm:text-lg font-bold text-brand-dark group-hover:text-brand-forest transition-colors">
                  {scheme.name}
                </CardTitle>
                <span className="text-xs font-bold text-brand-leaf block mt-0.5">
                  {scheme.bengaliName}
                </span>
              </div>

              {/* Benefit Highlight Box */}
              <div className="p-3 rounded-xl bg-cream-50 dark:bg-[#1B2537] border border-cream-200 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-xs font-bold text-brand-forest dark:text-emerald-400">
                  ₹ {scheme.benefitAmount}
                </span>
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                  {scheme.availabilityStatus}
                </span>
              </div>

              {/* Live Web Grounded Checkline */}
              {liveVerifications[scheme.id] ? (
                <div className="p-3 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/60 text-xs text-emerald-950 dark:text-emerald-200 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 font-extrabold text-emerald-900 dark:text-emerald-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                      <span>Live Verified: {liveVerifications[scheme.id].statusBadge}</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200">
                      {liveVerifications[scheme.id].verifiedDate}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-900/85 dark:text-emerald-200/90 leading-snug font-medium">
                    {liveVerifications[scheme.id].summary}
                  </p>
                  <div className="text-[10px] text-emerald-800/80 dark:text-emerald-300/80 font-semibold pt-1 border-t border-emerald-200/70 dark:border-emerald-800/50 flex items-center justify-between">
                    <span>Active Cycle: {liveVerifications[scheme.id].activeSeason}</span>
                    <span className="text-emerald-700 dark:text-emerald-400">Live Search Grounded ✓</span>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-cream-50 dark:bg-[#1B2537] border border-cream-200 dark:border-slate-700/60 text-[11px] text-brand-dark/70 dark:text-slate-300 flex items-center justify-between animate-pulse">
                  <span>Checking live official web circulars...</span>
                  <span className="w-2 h-2 rounded-full bg-brand-leaf dark:bg-emerald-400 animate-ping" />
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-4 pt-0">
              {/* Key Eligibility */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-dark/70 dark:text-slate-400 block">
                  Eligibility & Key Provisions:
                </span>
                <ul className="space-y-1 text-xs text-brand-dark/80 dark:text-slate-300">
                  {scheme.eligibility.map((el, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold shrink-0">•</span>
                      <span>{el}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Claims & Cutoff Dates if any */}
              {scheme.cutoffDates && (
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#1B2537] border border-cream-200 dark:border-slate-700/60 text-xs text-brand-dark/75 dark:text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-brand-dark dark:text-white">
                    <Calendar className="w-3.5 h-3.5 text-brand-leaf dark:text-emerald-400" />
                    <span>Cutoff & Enrollment Timeline:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed dark:text-slate-300">{scheme.cutoffDates}</p>
                </div>
              )}

              {/* Documents Required */}
              <div className="pt-2 border-t border-cream-200/80 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-dark/70 dark:text-slate-400 block mb-1.5">
                  Required Documents Checklist:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {scheme.documents.map((doc, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-cream-100 dark:bg-slate-800 text-brand-dark dark:text-slate-200 font-medium border border-cream-200 dark:border-slate-700"
                    >
                      <span>{doc.icon}</span>
                      <span>{doc.name_en}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Direct Government Action Buttons */}
              <div className="pt-3 border-t border-cream-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                {scheme.statusCheckUrl && (
                  <a
                    href={scheme.statusCheckUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-brand-forest hover:bg-brand-forest/90 text-white text-xs font-bold shadow-xs transition-colors min-h-[44px] cursor-pointer"
                  >
                    <span>{scheme.statusCheckLabel}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <a
                  href={`tel:${scheme.phoneDial}`}
                  onClick={(e) => handlePhoneClick(e, scheme.helpline)}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1B2537] border border-cream-300 dark:border-slate-700 hover:border-brand-leaf dark:hover:border-emerald-500 text-brand-dark dark:text-white text-xs font-semibold transition-colors min-h-[44px] cursor-pointer"
                  title="Direct Phone Call"
                >
                  <Phone className="w-3.5 h-3.5 text-brand-leaf dark:text-emerald-400" />
                  <span>Call {scheme.helpline.split(' ')[0]}</span>
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
