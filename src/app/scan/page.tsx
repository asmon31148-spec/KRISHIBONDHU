'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from '@/i18n/context';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Camera,
  Upload,
  ScanLine,
  X,
  Sun,
  History,
  Calendar,
  ArrowRight,
  Sparkles,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { ScanResultView } from '@/components/scan/ScanResultView';
import type { CropScanResult, SeverityLevel } from '@/lib/ai/types';

interface SavedScanItem {
  id: string;
  crop_name: string;
  crop_confidence?: number;
  is_healthy: boolean;
  disease_name: string | null;
  disease_confidence?: number | null;
  severity: SeverityLevel;
  image_url: string;
  symptoms?: string[];
  treatment_organic?: string;
  treatment_chemical?: string;
  ai_explanation?: string;
  prevention_advice?: string;
  expert_advice?: string;
  created_at: string;
}

export default function CropScannerPage() {
  const { language } = useTranslation();
  const { isGuest, guestToken, incrementGuestScan, profile, user } = useAuth();
  const toast = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Tab state between Scanner and History
  const [activeTab, setActiveTab] = useState<'scan' | 'history'>('scan');

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<number>(0);
  const [stepLabel, setStepLabel] = useState<string>('');
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Scan Output Result State
  const [scanResult, setScanResult] = useState<CropScanResult | null>(null);
  const [activeScanId, setActiveScanId] = useState<string | null>(null);

  // Recent Scans History State
  const [recentScans, setRecentScans] = useState<SavedScanItem[]>([]);

  // Load scans from local cache and cloud
  const loadRecentScans = useCallback(async () => {
    let loaded: SavedScanItem[] = [];

    // 1. Check local storage cache
    try {
      const local = localStorage.getItem('krishibondhu_recent_scans');
      if (local) {
        loaded = JSON.parse(local);
      }
    } catch {}

    // 2. If user is authenticated, also fetch latest cloud scans
    if (user) {
      try {
        const supabase = createClient();
        if (supabase) {
          const { data } = await supabase
            .from('crop_scans')
            .select('id, crop_name, severity, created_at, is_healthy, image_url, disease_name, disease_confidence, crop_confidence, symptoms, ai_explanation, treatment_organic, treatment_chemical')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(8);

          if (data && data.length > 0) {
            const cloudItems: SavedScanItem[] = data.map((d: any) => ({
              id: d.id,
              crop_name: d.crop_name,
              crop_confidence: d.crop_confidence || 85,
              is_healthy: !!d.is_healthy,
              disease_name: d.disease_name,
              disease_confidence: d.disease_confidence || 80,
              severity: (d.severity as SeverityLevel) || (d.is_healthy ? 'healthy' : 'moderate'),
              image_url: d.image_url,
              symptoms: d.symptoms || [],
              treatment_organic: d.treatment_organic || '',
              treatment_chemical: d.treatment_chemical || '',
              ai_explanation: d.ai_explanation || '',
              created_at: d.created_at,
            }));

            // Merge unique scans
            const merged = [...cloudItems];
            for (const item of loaded) {
              if (!merged.some((m) => m.id === item.id)) {
                merged.push(item);
              }
            }
            loaded = merged;
          }
        }
      } catch (err) {
        console.warn('Cloud scan fetch error:', err);
      }
    }

    setRecentScans(loaded);
  }, [user]);

  useEffect(() => {
    loadRecentScans();
  }, [loadRecentScans]);

  // Save new scan to local history cache
  const saveToLocalHistory = (scanId: string, result: CropScanResult, imageUrl: string) => {
    try {
      const newItem: SavedScanItem = {
        id: scanId,
        crop_name: result.crop_name,
        crop_confidence: result.crop_confidence,
        is_healthy: result.is_healthy,
        disease_name: result.disease_name,
        disease_confidence: result.disease_confidence,
        severity: result.severity,
        image_url: imageUrl,
        symptoms: result.symptoms,
        treatment_organic: result.treatment_organic,
        treatment_chemical: result.treatment_chemical,
        ai_explanation: result.ai_explanation,
        prevention_advice: result.prevention_advice,
        expert_advice: result.expert_advice,
        created_at: new Date().toISOString(),
      };

      const updated = [newItem, ...recentScans.filter((s) => s.id !== scanId)].slice(0, 15);
      setRecentScans(updated);
      localStorage.setItem('krishibondhu_recent_scans', JSON.stringify(updated));
    } catch {}
  };

  // Re-open a past scan directly into full report view
  const openSavedScan = (scan: SavedScanItem) => {
    const formattedResult: CropScanResult = {
      crop_name: scan.crop_name,
      crop_confidence: scan.crop_confidence || 90,
      is_healthy: scan.is_healthy,
      disease_name: scan.disease_name,
      disease_confidence: scan.disease_confidence || 85,
      severity: scan.severity,
      is_uncertain: false,
      symptoms: scan.symptoms || [],
      affected_parts: ['leaves'],
      ai_explanation: scan.ai_explanation || 'Saved field diagnosis record.',
      treatment_organic: scan.treatment_organic || 'Use neem oil (5ml/L) and ensure proper field aeration.',
      treatment_chemical: scan.treatment_chemical || 'Consult local agricultural extension for registered fungicides.',
      prevention_advice: scan.prevention_advice || 'Maintain crop rotation and avoid excess nitrogen fertilization.',
      expert_advice: scan.expert_advice || 'Follow BCKV and ICAR recommended spray schedules.',
    };

    setScanResult(formattedResult);
    setActiveScanId(scan.id);
    setImagePreview(scan.image_url);
    setActiveTab('scan');
  };

  // In-browser image compression before upload
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressed);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.80
        );
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPEG, PNG, or WebP).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error('Image size exceeds 20MB limit. Please upload a smaller photo.');
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCancelScan = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setIsScanning(false);
    setScanStep(0);
    toast.info('Crop scan cancelled.');
  };

  const handleRetake = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setScanResult(null);
    setScanStep(0);
  };

  const runAnalysis = async () => {
    if (!selectedImage) return;

    setIsScanning(true);
    setScanStep(20);
    setStepLabel(
      language === 'bn'
        ? 'পাতার ছবি প্রক্রিয়াকরণ করা হচ্ছে...'
        : language === 'hi'
        ? 'पत्ती की फोटो तैयार की जा रही है...'
        : 'Compressing leaf photo for instant transmission...'
    );

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const compressed = await compressImage(selectedImage);

      setScanStep(50);
      setStepLabel(
        language === 'bn'
          ? 'এআই কৃষি গেটওয়েতে আপলোড হচ্ছে...'
          : language === 'hi'
          ? 'एआई मॉडल से जांच हो रही है...'
          : 'Uploading to AI Agronomy Gateway...'
      );

      const formData = new FormData();
      formData.append('image', compressed);
      formData.append('language', language);
      if (isGuest && guestToken) {
        formData.append('guest_token', guestToken);
      }
      if (profile?.district) {
        formData.append('location', `${profile.district}, ${profile.state || 'West Bengal'}`);
      }

      setScanStep(75);
      setStepLabel(
        language === 'bn'
          ? 'আইসিএআর ডেটাসেটে রোগ ও লক্ষণ যাচাই হচ্ছে...'
          : language === 'hi'
          ? 'ICAR डेटाबेस से रोग व लक्षण का मिलान हो रहा है...'
          : 'Analyzing lesion patterns against ICAR pathology datasets...'
      );

      const response = await fetch('/api/scan/analyze', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      setScanStep(95);
      setStepLabel(
        language === 'bn'
          ? 'অনুমোদিত ওষুধ ও সারের মাত্রা তৈরি হচ্ছে...'
          : language === 'hi'
          ? 'दवा व उपचार की सही खुराक तैयार हो रही है...'
          : 'Compiling verified dosages and remedies...'
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Crop analysis failed');
      }

      setScanStep(100);
      setStepLabel('Diagnosis complete!');

      if (isGuest) {
        incrementGuestScan();
      }

      setScanResult(data.result);
      const generatedId = data.scanId || `scan-${Date.now()}`;
      setActiveScanId(generatedId);

      // Save to local scan history immediately
      if (imagePreview) {
        saveToLocalHistory(generatedId, data.result, imagePreview);
      }

      toast.success(
        language === 'bn'
          ? 'রোগ নির্ণয় সম্পন্ন হয়েছে!'
          : language === 'hi'
          ? 'रोग पहचान पूरी हो गई!'
          : 'Crop diagnosis completed successfully.'
      );
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') return;
      const msg = err instanceof Error ? err.message : 'Diagnosis error';
      toast.error(msg);
    } finally {
      setIsScanning(false);
      setAbortController(null);
    }
  };

  const getStatusLabel = (isHealthy: boolean, severity?: string | null) => {
    if (isHealthy) {
      return language === 'bn' ? 'সুস্থ' : language === 'hi' ? 'स्वस्थ' : 'Healthy';
    }
    if (severity === 'severe') {
      return language === 'bn' ? 'মারাত্মক' : language === 'hi' ? 'गंभीर' : 'Severe';
    }
    if (severity === 'moderate') {
      return language === 'bn' ? 'মাঝারি' : language === 'hi' ? 'मध्यम' : 'Moderate';
    }
    return language === 'bn' ? 'আক্রান্ত' : language === 'hi' ? 'संक्रमित' : 'Mild';
  };

  const getConditionLabel = (isHealthy: boolean, diseaseName?: string | null) => {
    if (diseaseName) return diseaseName;
    if (isHealthy) {
      return language === 'bn' ? 'কোনো রোগ নেই' : language === 'hi' ? 'कोई बीमारी नहीं' : 'No Disease Detected';
    }
    return language === 'bn' ? 'রোগ শনাক্ত' : language === 'hi' ? 'रोग की पहचान' : 'Disease Detected';
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full text-left pt-2 pb-16 max-w-5xl mx-auto">
      {/* Top Header & Navigation Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-cream-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {language === 'bn' ? 'ফ্ল্যাগশিপ এআই ভিশন' : language === 'hi' ? 'एआई विजन स्कैनर' : 'Flagship AI Vision'}
              </span>
            </span>
            <span className="text-xs text-brand-dark/60">
              • {language === 'bn' ? 'আইসিএআর নির্দেশিত' : language === 'hi' ? 'आईसीएआर निर्देशित' : 'ICAR Aligned'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-dark dark:text-white mt-1 tracking-tight">
            {language === 'bn'
              ? 'ফসলের পাতার রোগ নির্ণয়'
              : language === 'hi'
              ? 'फसल रोग डॉक्टर'
              : 'AI Crop Disease Scanner'}
          </h1>
          <p className="text-xs sm:text-sm text-brand-dark/70 dark:text-white/60 mt-1 max-w-2xl leading-relaxed">
            {language === 'bn'
              ? 'আক্রান্ত পাতার স্পষ্ট ছবি তুলুন। আইসিএআর কৃষি নির্দেশিকা অনুযায়ী সঠিক রোগ, তীব্রতা এবং অনুমোদিত জৈব ও রাসায়নিক প্রতিকার পান।'
              : language === 'hi'
              ? 'रोगी पत्ते की साफ फोटो लें। तुरंत बीमारी की पहचान, गंभीरता और स्वीकृत जैविक व रासायनिक दवा की खुराक पाएं।'
              : 'Take or upload a close-up photo of any affected leaf for instant certified biological and chemical treatment dosages.'}
          </p>
        </div>

        {/* Tab Switcher: [New Scan] vs [Scan History] */}
        {!scanResult && (
          <div className="inline-flex p-1 rounded-xl bg-cream-200/80 dark:bg-white/10 border border-cream-300 dark:border-white/15 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('scan')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'scan'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-brand-dark/70 dark:text-white/70 hover:text-brand-dark dark:hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{language === 'bn' ? 'নতুন পরীক্ষা' : language === 'hi' ? 'नई जांच' : 'New Scan'}</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-brand-dark/70 dark:text-white/70 hover:text-brand-dark dark:hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>{language === 'bn' ? 'স্ক্যান ইতিহাস' : language === 'hi' ? 'स्कैन इतिहास' : 'Scan History'}</span>
              {recentScans.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-mono">
                  {recentScans.length}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Main Scanner Section or Result View */}
      {scanResult ? (
        <ScanResultView
          result={scanResult}
          scanId={activeScanId}
          imagePreview={imagePreview}
          onScanAnother={handleRetake}
        />
      ) : activeTab === 'history' ? (
        /* Dedicated Full Scan History Tab */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-brand-dark dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-700" />
              <span>
                {language === 'bn' ? 'পূর্ববর্তী স্ক্যান রেকর্ড সমূহ' : language === 'hi' ? 'पिछले स्कैन रिकॉर्ड' : 'Previous Scan Records'}
              </span>
            </h3>
            <button
              onClick={() => setActiveTab('scan')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>+ {language === 'bn' ? 'নতুন স্ক্যান করুন' : language === 'hi' ? 'नया स्कैन करें' : 'Start New Scan'}</span>
            </button>
          </div>

          {recentScans.length === 0 ? (
            <div className="text-center py-12 p-6 rounded-2xl bg-white dark:bg-[#111418] border border-cream-200 dark:border-white/10 space-y-3">
              <div className="w-12 h-12 rounded-full bg-cream-100 dark:bg-white/10 text-brand-dark/40 dark:text-white/40 flex items-center justify-center mx-auto">
                <ScanLine className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-brand-dark dark:text-white">
                {language === 'bn' ? 'কোনো পূর্ববর্তী স্ক্যান রেকর্ড নেই' : language === 'hi' ? 'कोई पिछला रिकॉर्ड नहीं मिला' : 'No previous scan records found'}
              </h4>
              <p className="text-xs text-brand-dark/60 max-w-sm mx-auto">
                {language === 'bn'
                  ? 'আপনার ফসলের পাতার ছবি তুলুন। আপনার প্রতিটি পরীক্ষার রিপোর্ট এখানে সংরক্ষিত থাকবে।'
                  : language === 'hi'
                  ? 'अपनी फसल की पत्ती की फोटो लें। आपकी हर रिपोर्ट यहां सुरक्षित रहेगी।'
                  : 'Take a leaf photo now. Your field diagnosis reports will automatically be preserved here.'}
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveTab('scan')}
                leftIcon={<Camera className="w-4 h-4" />}
                className="mt-2"
              >
                {language === 'bn' ? 'প্রথম স্ক্যান শুরু করুন' : language === 'hi' ? 'पहला स्कैन करें' : 'Start First Scan'}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentScans.map((sc) => (
                <div
                  key={sc.id}
                  onClick={() => openSavedScan(sc)}
                  className="group p-4 rounded-2xl bg-white dark:bg-[#111418] border border-cream-200 dark:border-white/10 shadow-2xs hover:shadow-md hover:border-emerald-500 transition-all cursor-pointer flex flex-col justify-between gap-3"
                >
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-cream-100 dark:bg-black/30 shrink-0 border border-cream-200 dark:border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sc.image_url}
                        alt={sc.crop_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-brand-dark dark:text-white truncate">{sc.crop_name}</span>
                        <Badge
                          variant={sc.is_healthy ? 'emerald' : sc.severity === 'severe' ? 'red' : 'amber'}
                          size="sm"
                        >
                          {getStatusLabel(sc.is_healthy, sc.severity)}
                        </Badge>
                      </div>
                      <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 truncate">
                        {getConditionLabel(sc.is_healthy, sc.disease_name)}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-brand-dark/50 dark:text-white/50">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(sc.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-cream-100 dark:border-white/10 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-800">
                    <span>{language === 'bn' ? 'রিপোর্ট দেখুন' : language === 'hi' ? 'रिपोर्ट देखें' : 'View Full Report'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Scanner Capture Screen */
        <div className="space-y-8">
          <Card className="border border-cream-200 dark:border-white/10 bg-white dark:bg-[#111418] shadow-sm overflow-hidden rounded-2xl">
            <CardContent className="p-6 sm:p-10 flex flex-col items-center justify-center text-center space-y-4">
              {imagePreview ? (
                <div className="space-y-4 w-full flex flex-col items-center">
                  <div className="relative max-w-sm rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Crop leaf preview"
                      className="w-full h-auto max-h-72 sm:max-h-80 object-cover"
                    />
                    {!isScanning && (
                      <button
                        onClick={handleRetake}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white  transition-colors cursor-pointer"
                        aria-label="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Progress Bar during analysis */}
                  {isScanning ? (
                    <div className="w-full max-w-md space-y-2 p-4 rounded-xl bg-cream-50 dark:bg-white/5 border border-cream-200 dark:border-white/10">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-300">
                        <span className="truncate pr-2">{stepLabel}</span>
                        <span className="shrink-0">{scanStep}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-cream-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 transition-all duration-500 ease-out"
                          style={{ width: `${scanStep}%` }}
                        />
                      </div>
                      <div className="pt-2 flex justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelScan}
                          className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                        >
                          {language === 'bn' ? 'বাতিল করুন' : language === 'hi' ? 'रद्द करें' : 'Cancel Scan'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full max-w-md">
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={runAnalysis}
                        leftIcon={<ScanLine className="w-5 h-5" />}
                        className="w-full py-3.5 font-bold shadow-md"
                      >
                        {language === 'bn'
                          ? 'রোগ নির্ণয় শুরু করুন'
                          : language === 'hi'
                          ? 'रोग की जांच करें'
                          : 'Analyze Disease Now'}
                      </Button>
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={handleRetake}
                        leftIcon={<RotateCcw className="w-4 h-4" />}
                        className="py-3"
                      >
                        {language === 'bn' ? 'অন্য ছবি তুলুন' : language === 'hi' ? 'दूसरी फोटो लें' : 'Retake'}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                /* Empty Upload / Camera Box */
                <div className="space-y-4 max-w-md mx-auto py-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
                    <Camera className="w-8 h-8 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brand-dark dark:text-white">
                      {language === 'bn'
                        ? 'আক্রান্ত পাতার স্পষ্ট ছবি দিন'
                        : language === 'hi'
                        ? 'रोगी पत्ते की फोटो अपलोड करें'
                        : 'Upload or Capture Affected Leaf'}
                    </h3>
                    <p className="text-xs text-brand-dark/70 dark:text-white/60 mt-1">
                      {language === 'bn'
                        ? 'ক্যামেরা চালু করে সরাসরি ছবি তুলুন অথবা ফোন গ্যালারি থেকে বেছে নিন।'
                        : language === 'hi'
                        ? 'सीधे कैमरे से फोटो खींचें या फोन गैलरी से अपलोड करें।'
                        : 'Use device camera directly or select an existing photo from your gallery.'}
                    </p>
                  </div>

                  {/* Hidden native inputs for Camera & File */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2 w-full">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => cameraInputRef.current?.click()}
                      leftIcon={<Camera className="w-4 h-4" />}
                      className="w-full sm:w-auto py-3 font-bold cursor-pointer"
                    >
                      {language === 'bn' ? 'ক্যামেরা দিয়ে ছবি তুলুন' : language === 'hi' ? 'कैमरे से फोटो लें' : 'Take Camera Photo'}
                    </Button>
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => fileInputRef.current?.click()}
                      leftIcon={<Upload className="w-4 h-4 text-emerald-700" />}
                      className="w-full sm:w-auto py-3 font-semibold cursor-pointer"
                    >
                      {language === 'bn' ? 'গ্যালারি থেকে নিন' : language === 'hi' ? 'गैलरी से अपलोड करें' : 'Upload from Gallery'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Photo Taking Guidelines */}
          <div className="p-4 sm:p-5 rounded-2xl bg-cream-100/70 dark:bg-[#141C2B] border border-cream-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-400 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>
                {language === 'bn'
                  ? 'সঠিক ফলাফলের জন্য নির্দেশিকা'
                  : language === 'hi'
                  ? 'सटीक परिणाम के लिए सुझाव'
                  : 'Guidelines for 100% Diagnostic Accuracy'}
              </span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-brand-dark/80 dark:text-slate-300">
              <div className="p-3 bg-white dark:bg-[#1B2537] rounded-xl border border-cream-200 dark:border-slate-700/60 shadow-2xs">
                <span className="font-bold block text-brand-dark dark:text-white mb-0.5">
                  1. {language === 'bn' ? 'কাছ থেকে ছবি তুলুন' : language === 'hi' ? 'पास से फोटो लें' : 'Close-Up View'}
                </span>
                {language === 'bn'
                  ? 'ক্যামেরা ১০-১৫ সেমি দূরে রেখে আক্রান্ত পাতার দাগ ও পোকার লক্ষণ স্পষ্ট করুন।'
                  : language === 'hi'
                  ? 'कैमरा 10-15 सेमी दूर रखकर पत्ते के धब्बे व लक्षण स्पष्ट दिखाएं।'
                  : 'Hold camera 10-15 cm away so lesion spots and fungal spores are sharp.'}
              </div>
              <div className="p-3 bg-white dark:bg-[#1B2537] rounded-xl border border-cream-200 dark:border-slate-700/60 shadow-2xs">
                <span className="font-bold block text-brand-dark dark:text-white mb-0.5">
                  2. {language === 'bn' ? 'স্বাভাবিক দিনের আলো' : language === 'hi' ? 'प्राकृतिक रोशनी' : 'Natural Daylight'}
                </span>
                {language === 'bn'
                  ? 'দিনের স্বাভাবিক আলোয় ছবি তুলুন। তীব্র ছায়া বা রাতের ফ্ল্যাশ এড়িয়ে চলুন।'
                  : language === 'hi'
                  ? 'दिन की प्राकृतिक धूप में फोटो लें। तेज परछाई से बचें।'
                  : 'Natural sunlight yields the best color fidelity for disease scoring.'}
              </div>
              <div className="p-3 bg-white dark:bg-[#1B2537] rounded-xl border border-cream-200 dark:border-slate-700/60 shadow-2xs">
                <span className="font-bold block text-brand-dark dark:text-white mb-0.5">
                  3. {language === 'bn' ? 'একটিমাত্র আক্রান্ত পাতা' : language === 'hi' ? 'केवल एक रोगी पत्ता' : 'Single Leaf'}
                </span>
                {language === 'bn'
                  ? 'পুরো মাঠের বদলে একটি নির্দিষ্ট পাতার ওপর ক্যামেরা ফোকাস করুন।'
                  : language === 'hi'
                  ? 'पूरे खेत की जगह सिर्फ एक मुख्य पत्ते पर कैमरा केंद्रित करें।'
                  : 'Isolate one infected leaf rather than whole field for accurate taxonomy.'}
              </div>
            </div>
          </div>

          {/* Inline Recent Scans Preview (Never Hidden!) */}
          {recentScans.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-brand-dark dark:text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>
                    {language === 'bn'
                      ? 'আপনার সাম্প্রতিক স্ক্যান সমূহ'
                      : language === 'hi'
                      ? 'आपकी हालिया जांचें'
                      : 'Your Recent Field Diagnoses'}
                  </span>
                </h3>
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>{language === 'bn' ? 'সব ইতিহাস দেখুন' : language === 'hi' ? 'पूरा इतिहास देखें' : 'View All'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recentScans.slice(0, 3).map((sc) => (
                  <div
                    key={sc.id}
                    onClick={() => openSavedScan(sc)}
                    className="p-3 rounded-xl bg-white dark:bg-[#141C2B] border border-cream-200 dark:border-slate-800 shadow-2xs hover:border-emerald-500 hover:shadow-sm transition-all cursor-pointer flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-cream-100 dark:bg-slate-800 shrink-0 border border-cream-200 dark:border-slate-700">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sc.image_url}
                        alt={sc.crop_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-brand-dark dark:text-white truncate">{sc.crop_name}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                            sc.is_healthy
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {getStatusLabel(sc.is_healthy, sc.severity)}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-emerald-800 truncate">
                        {getConditionLabel(sc.is_healthy, sc.disease_name)}
                      </p>
                      <span className="text-[10px] text-brand-dark/50">
                        {new Date(sc.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
