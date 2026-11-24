'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/context';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import {
  ScanLine,
  Calendar,
  Filter,
  Eye,
} from 'lucide-react';

interface ScanItem {
  id: string;
  crop_name: string;
  crop_confidence: number;
  is_healthy: boolean;
  disease_name: string | null;
  disease_confidence: number | null;
  severity: string;
  is_uncertain: boolean;
  image_url: string;
  symptoms?: string[] | null;
  treatment_organic?: string | null;
  treatment_chemical?: string | null;
  ai_explanation?: string | null;
  created_at: string;
}

export default function ScanHistoryPage() {
  const { t, language } = useTranslation();
  const { user, isGuest } = useAuth();

  const [scans, setScans] = useState<ScanItem[]>([]);
  const [filteredScans, setFilteredScans] = useState<ScanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState<ScanItem | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const loadScans = useCallback(async () => {
    let localItems: ScanItem[] = [];
    try {
      const stored = localStorage.getItem('krishibondhu_recent_scans');
      if (stored) {
        localItems = JSON.parse(stored);
      }
    } catch {}

    if (isGuest || !user) {
      setScans(localItems);
      setFilteredScans(localItems);
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setScans(localItems);
      setFilteredScans(localItems);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('crop_scans')
        .select('id, crop_name, disease_name, severity, crop_confidence, disease_confidence, is_healthy, is_uncertain, created_at, image_url')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(0, 9); // Load 10 items at a time

      if (!error && data) {
        // Merge with local items if any
        const merged = [...(data as ScanItem[])];
        for (const it of localItems) {
          if (!merged.some((m) => m.id === it.id)) {
            merged.push(it);
          }
        }
        setScans(merged);
        setFilteredScans(merged);
      } else {
        setScans(localItems);
        setFilteredScans(localItems);
      }
    } catch (err) {
      console.error('Error loading scans:', err);
      setScans(localItems);
      setFilteredScans(localItems);
    } finally {
      setIsLoading(false);
    }
  }, [user, isGuest]);

  const handleViewDetails = async (scan: ScanItem) => {
    setSelectedScan(scan);
    if (!scan.treatment_organic && !scan.ai_explanation) {
      const supabase = createClient();
      if (supabase) {
        const { data } = await supabase
          .from('crop_scans')
          .select('symptoms, treatment_organic, treatment_chemical, ai_explanation')
          .eq('id', scan.id)
          .single();
        if (data) {
          setSelectedScan((prev) => (prev && prev.id === scan.id ? { ...prev, ...data } : prev));
        }
      }
    }
  };

  useEffect(() => {
    loadScans();
  }, [loadScans]);

  const handleFilterChange = (severity: string) => {
    setFilterSeverity(severity);
    if (severity === 'all') {
      setFilteredScans(scans);
    } else {
      setFilteredScans(scans.filter((s) => s.severity === severity));
    }
  };

  if (isGuest && scans.length === 0 && !isLoading) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
          <ScanLine className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-brand-dark">
          {language === 'bn'
            ? 'কোনো স্ক্যান রেকর্ড পাওয়া যায়নি'
            : language === 'hi'
            ? 'कोई स्कैन रिकॉर्ड नहीं मिला'
            : 'No Scan Records Found'}
        </h2>
        <p className="text-xs sm:text-sm text-brand-dark/70 leading-relaxed">
          {language === 'bn'
            ? 'পাতার ছবি তুললে আপনার পূর্ববর্তী রোগ পরীক্ষার রিপোর্ট এখানে জমা থাকবে।'
            : language === 'hi'
            ? 'पत्ती की फोटो लेने पर आपकी पिछली जांच रिपोर्ट यहां सुरक्षित रहेगी।'
            : 'When you take leaf photos, your past diagnosis reports will appear here.'}
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link href="/scan">
            <Button variant="primary">
              {language === 'bn' ? 'প্রথম স্ক্যান করুন' : language === 'hi' ? 'पहला स्कैन करें' : 'Start First Scan'}
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button variant="secondary">
              {t('nav.saveAccount')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-forest">
            {language === 'bn'
              ? 'ফসলের রোগ স্ক্যান ইতিহাস'
              : language === 'hi'
              ? 'फसल रोग स्कैन इतिहास'
              : 'Crop Disease Scan History'}
          </h1>
          <p className="text-xs sm:text-sm text-brand-dark/70 mt-1">
            {language === 'bn'
              ? 'আপনার পূর্ববর্তী পাতার রোগ নির্ণয়, লক্ষণ ও অনুমোদিত ওষুধের তালিকা পর্যালোচনা করুন।'
              : language === 'hi'
              ? 'अपनी पिछली जांच, लक्षण और स्वीकृत दवाओं की सूची देखें।'
              : 'Browse and review past leaf diagnoses, symptoms, and treatment plans.'}
          </p>
        </div>

        <Link href="/scan">
          <Button variant="primary" size="md" leftIcon={<ScanLine className="w-4 h-4" />}>
            {language === 'bn' ? 'নতুন স্ক্যান' : language === 'hi' ? 'नया स्कैन' : 'New Scan'}
          </Button>
        </Link>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-brand-dark/60 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          {language === 'bn' ? 'ফিল্টার:' : language === 'hi' ? 'फ़िल्टर:' : 'Filter:'}
        </span>
        {[
          { id: 'all', label: language === 'bn' ? 'সব স্ক্যান' : language === 'hi' ? 'सभी स्कैन' : 'All Scans' },
          { id: 'healthy', label: language === 'bn' ? 'সুস্থ' : language === 'hi' ? 'स्वस्थ' : 'Healthy' },
          { id: 'mild', label: language === 'bn' ? 'হালকা' : language === 'hi' ? 'हल्का' : 'Mild' },
          { id: 'moderate', label: language === 'bn' ? 'মাঝারি' : language === 'hi' ? 'मध्यम' : 'Moderate' },
          { id: 'severe', label: language === 'bn' ? 'মারাত্মক' : language === 'hi' ? 'गंभीर' : 'Severe' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => handleFilterChange(f.id)}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold border transition-all ${
              filterSeverity === f.id
                ? 'bg-brand-forest text-white border-brand-forest'
                : 'bg-white text-brand-dark/70 border-cream-300 hover:border-brand-leaf/40'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Scans List */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-cream-100 rounded-2xl border border-cream-200" />
          ))}
        </div>
      ) : filteredScans.length === 0 ? (
        <EmptyState
          icon={<ScanLine className="w-8 h-8" />}
          title={
            language === 'bn'
              ? 'কোনো স্ক্যান রেকর্ড পাওয়া যায়নি'
              : language === 'hi'
              ? 'कोई स्कैन नहीं मिला'
              : 'No Crop Scans Found'
          }
          description={
            filterSeverity !== 'all'
              ? language === 'bn'
                ? `এই ফিল্টারে কোনো স্ক্যান পাওয়া যায়নি: '${filterSeverity}'`
                : language === 'hi'
                ? `इस श्रेणी में कोई रिकॉर्ड नहीं मिला: '${filterSeverity}'`
                : `No scans found matching filter '${filterSeverity}'.`
              : language === 'bn'
              ? 'আপনি এখনো কোনো ফসলের পাতা স্ক্যান করেননি।'
              : language === 'hi'
              ? 'आपने अभी तक कोई पत्ता स्कैन नहीं किया है।'
              : 'You have not scanned any crop leaves yet.'
          }
          actionLabel={language === 'bn' ? 'ফসল পাতা স্ক্যান করুন' : language === 'hi' ? 'पत्ती स्कैन करें' : 'Scan a Crop Leaf'}
          onAction={() => (window.location.href = '/scan')}
        />
      ) : (
        <div className="space-y-3">
          {filteredScans.map((scan) => (
            <Card
              key={scan.id}
              className="hover:border-brand-leaf/40 transition-all hover:shadow-2xs cursor-pointer"
              onClick={() => handleViewDetails(scan)}
            >
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={scan.image_url}
                    alt={scan.crop_name}
                    className="w-14 h-14 rounded-xl object-cover border border-cream-200 shadow-2xs shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-brand-dark">
                        {scan.crop_name}
                      </h4>
                      <Badge
                        variant={
                          scan.severity === 'healthy'
                            ? 'emerald'
                            : scan.severity === 'severe'
                            ? 'red'
                            : 'amber'
                        }
                        size="sm"
                      >
                        {scan.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-brand-dark/75 mt-0.5">
                      {scan.disease_name || 'Healthy Crop'}
                      {scan.disease_confidence && ` • ${scan.disease_confidence}% confidence`}
                    </p>
                    <p className="text-[11px] text-brand-dark/50 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(scan.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <Button variant="ghost" size="sm" leftIcon={<Eye className="w-4 h-4" />}>
                  {language === 'bn' ? 'বিস্তারিত দেখুন' : language === 'hi' ? 'विवरण देखें' : 'View Details'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal for previous scan */}
      {selectedScan && (
        <Modal
          isOpen={Boolean(selectedScan)}
          onClose={() => setSelectedScan(null)}
          title={
            language === 'bn'
              ? `রোগ নির্ণয়: ${selectedScan.crop_name}`
              : language === 'hi'
              ? `जांच रिपोर्ट: ${selectedScan.crop_name}`
              : `Diagnosis: ${selectedScan.crop_name}`
          }
          maxWidth="lg"
        >
          <div className="space-y-4 pt-2 text-left">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-cream-50 border border-cream-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedScan.image_url}
                alt={selectedScan.crop_name}
                className="w-16 h-16 rounded-lg object-cover border border-cream-200"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-brand-dark">
                  {selectedScan.disease_name || (language === 'bn' ? 'সুস্থ ফসল' : language === 'hi' ? 'स्वस्थ फसल' : 'Healthy Crop')}
                </span>
                <p className="text-xs text-brand-dark/70">
                  {language === 'bn' ? 'তীব্রতা' : language === 'hi' ? 'गंभीरता' : 'Severity'}: {selectedScan.severity.toUpperCase()} • {language === 'bn' ? 'নির্ভুলতা' : language === 'hi' ? 'सटीकता' : 'Confidence'}: {selectedScan.crop_confidence}%
                </p>
                <p className="text-[11px] text-brand-dark/60">
                  {language === 'bn' ? 'পরীক্ষার তারিখ' : language === 'hi' ? 'जांच की तारीख' : 'Scanned'}: {new Date(selectedScan.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {selectedScan.ai_explanation && (
              <div className="p-3 bg-white rounded-xl border border-cream-200 space-y-1">
                <span className="text-xs font-bold text-brand-forest block">
                  {language === 'bn' ? 'কৃষি বিশেষজ্ঞের মূল্যায়ন' : language === 'hi' ? 'कृषि विशेषज्ञ समीक्षा' : 'Agronomy Assessment'}
                </span>
                <p className="text-xs text-brand-dark/80 leading-relaxed whitespace-pre-line">
                  {selectedScan.ai_explanation}
                </p>
              </div>
            )}

            {selectedScan.treatment_organic && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                <span className="text-xs font-bold text-emerald-950 block">
                  {language === 'bn' ? 'জৈব প্রতিকার' : language === 'hi' ? 'जैविक उपचार' : 'Organic Remedy'}
                </span>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  {selectedScan.treatment_organic}
                </p>
              </div>
            )}

            {selectedScan.treatment_chemical && (
              <div className="p-3 bg-cream-100 rounded-xl border border-cream-200 space-y-1">
                <span className="text-xs font-bold text-brand-dark block">
                  {language === 'bn'
                    ? 'রাসায়নিক চিকিৎসা (সুরক্ষা নির্দেশিকা মেনে চলুন)'
                    : language === 'hi'
                    ? 'रासायनिक उपचार (सुरक्षा नियमों का पालन करें)'
                    : 'Chemical Treatment (Follow Safety Label)'}
                </span>
                <p className="text-xs text-brand-dark/80 leading-relaxed">
                  {selectedScan.treatment_chemical}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-cream-200">
              <Button variant="secondary" size="sm" onClick={() => setSelectedScan(null)}>
                {language === 'bn' ? 'বন্ধ করুন' : language === 'hi' ? 'बंद करें' : 'Close'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
