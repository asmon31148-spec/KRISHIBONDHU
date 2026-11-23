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
  symptoms: string[];
  treatment_organic: string | null;
  treatment_chemical: string | null;
  ai_explanation: string | null;
  created_at: string;
}

export default function ScanHistoryPage() {
  const { t } = useTranslation();
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
        .select('id, crop_name, severity, created_at, is_healthy, image_url, disease_name, disease_confidence, crop_confidence, symptoms, ai_explanation, treatment_organic, treatment_chemical')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(15);

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
          কোনো স্ক্যান রেকর্ড পাওয়া যায়নি
        </h2>
        <p className="text-xs sm:text-sm text-brand-dark/70 leading-relaxed">
          পাতার ছবি তুললে আপনার পূর্ববর্তী রোগ পরীক্ষার রিপোর্ট এখানে জমা থাকবে।
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link href="/scan">
            <Button variant="primary">
              প্রথম স্ক্যান করুন
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
            Crop Disease Scan History
          </h1>
          <p className="text-xs sm:text-sm text-brand-dark/70 mt-1">
            Browse and review past leaf diagnoses, symptoms, and treatment plans.
          </p>
        </div>

        <Link href="/scan">
          <Button variant="primary" size="md" leftIcon={<ScanLine className="w-4 h-4" />}>
            New Scan
          </Button>
        </Link>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-brand-dark/60 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {[
          { id: 'all', label: 'All Scans' },
          { id: 'healthy', label: 'Healthy' },
          { id: 'mild', label: 'Mild' },
          { id: 'moderate', label: 'Moderate' },
          { id: 'severe', label: 'Severe' },
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
          title="No Crop Scans Found"
          description={
            filterSeverity !== 'all'
              ? `No scans found matching filter '${filterSeverity}'.`
              : 'You have not scanned any crop leaves yet.'
          }
          actionLabel="Scan a Crop Leaf"
          onAction={() => (window.location.href = '/scan')}
        />
      ) : (
        <div className="space-y-3">
          {filteredScans.map((scan) => (
            <Card
              key={scan.id}
              className="hover:border-brand-leaf/40 transition-all hover:shadow-2xs cursor-pointer"
              onClick={() => setSelectedScan(scan)}
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
                  View Details
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
          title={`Diagnosis: ${selectedScan.crop_name}`}
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
                  {selectedScan.disease_name || 'Healthy Crop'}
                </span>
                <p className="text-xs text-brand-dark/70">
                  Severity: {selectedScan.severity.toUpperCase()} • Confidence: {selectedScan.crop_confidence}%
                </p>
                <p className="text-[11px] text-brand-dark/60">
                  Scanned: {new Date(selectedScan.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {selectedScan.ai_explanation && (
              <div className="p-3 bg-white rounded-xl border border-cream-200 space-y-1">
                <span className="text-xs font-bold text-brand-forest block">
                  Agronomy Assessment
                </span>
                <p className="text-xs text-brand-dark/80 leading-relaxed whitespace-pre-line">
                  {selectedScan.ai_explanation}
                </p>
              </div>
            )}

            {selectedScan.treatment_organic && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                <span className="text-xs font-bold text-emerald-950 block">
                  Organic Remedy
                </span>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  {selectedScan.treatment_organic}
                </p>
              </div>
            )}

            {selectedScan.treatment_chemical && (
              <div className="p-3 bg-cream-100 rounded-xl border border-cream-200 space-y-1">
                <span className="text-xs font-bold text-brand-dark block">
                  Chemical Treatment (Follow Safety Label)
                </span>
                <p className="text-xs text-brand-dark/80 leading-relaxed">
                  {selectedScan.treatment_chemical}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-cream-200">
              <Button variant="secondary" size="sm" onClick={() => setSelectedScan(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
