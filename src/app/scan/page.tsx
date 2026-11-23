'use client';

import React, { useState, useRef } from 'react';
import { useTranslation } from '@/i18n/context';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Camera,
  Upload,
  ScanLine,
  X,
  Sun,
  StopCircle,
} from 'lucide-react';
import { ScanResultView } from '@/components/scan/ScanResultView';
import type { CropScanResult } from '@/lib/ai/types';

export default function CropScannerPage() {
  const { language } = useTranslation();
  const { isGuest, guestToken, incrementGuestScan, profile } = useAuth();
  const toast = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<number>(0);
  const [stepLabel, setStepLabel] = useState<string>('');
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Scan Output Result State
  const [scanResult, setScanResult] = useState<CropScanResult | null>(null);
  const [activeScanId, setActiveScanId] = useState<string | null>(null);

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
        const MAX_WIDTH = 1280;
        const MAX_HEIGHT = 1280;
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
          0.85
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

    setSelectedImage(file);
    setScanResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
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
    setStepLabel('Compressing leaf image for fast network transmission...');

    const controller = new AbortController();
    setAbortController(controller);

    try {
      // 1. Client-side image compression
      const compressed = await compressImage(selectedImage);

      setScanStep(45);
      setStepLabel('Uploading photo to AI Agronomy Gateway...');

      const formData = new FormData();
      formData.append('image', compressed);
      formData.append('language', language);
      if (isGuest && guestToken) {
        formData.append('guest_token', guestToken);
      }
      if (profile?.district) {
        formData.append('location', `${profile.district}, ${profile.state || 'West Bengal'}`);
      }

      setScanStep(70);
      setStepLabel('Multimodal model analyzing lesion patterns & symptoms...');

      const response = await fetch('/api/scan/analyze', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      setScanStep(90);
      setStepLabel('Evaluating disease severity and ICAR remedies...');

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
      setActiveScanId(data.scanId || null);
      toast.success('Crop diagnosis completed.');
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') return;
      const msg = err instanceof Error ? err.message : 'Diagnosis error';
      toast.error(msg);
    } finally {
      setIsScanning(false);
      setAbortController(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-8 w-full text-left pt-1 sm:pt-2">
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="forest" size="sm">
            Flagship Diagnosis
          </Badge>
          <span className="text-[11px] sm:text-xs text-brand-dark/60">• Real Multimodal AI Vision</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-extrabold text-brand-forest mt-1 leading-tight">
          AI Crop Disease Scanner
        </h1>
        <p className="text-xs sm:text-sm text-brand-dark/70 mt-1 leading-relaxed">
          Take or upload a close-up photo of any affected leaf. Our agronomist vision model detects the pathogen, severity, and verified organic and chemical treatments.
        </p>
      </div>

      {/* Main Scanner Section */}
      {!scanResult ? (
        <div className="space-y-4 sm:space-y-6">
          <Card className="border-2 border-dashed border-cream-300 bg-white shadow-xs overflow-hidden">
            <CardContent className="p-4 sm:p-8 flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4">
              {imagePreview ? (
                <div className="space-y-3 sm:space-y-4 w-full flex flex-col items-center">
                  <div className="relative max-w-sm rounded-2xl overflow-hidden border-2 border-brand-leaf/30 shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Crop leaf preview"
                      className="w-full h-auto max-h-72 sm:max-h-80 object-cover"
                    />
                    {!isScanning && (
                      <button
                        onClick={handleRetake}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-brand-dark/70 hover:bg-brand-dark text-white backdrop-blur-xs transition-colors"
                        aria-label="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Progress Bar during analysis */}
                  {isScanning ? (
                    <div className="w-full max-w-md space-y-2 p-3 sm:p-4 rounded-2xl bg-cream-50 border border-cream-200">
                      <div className="flex items-center justify-between text-xs font-bold text-brand-forest">
                        <span className="truncate pr-2">{stepLabel}</span>
                        <span className="shrink-0">{scanStep}%</span>
                      </div>
                      <div className="h-2.5 sm:h-3 w-full bg-cream-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-forest transition-all duration-500 ease-out"
                          style={{ width: `${scanStep}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between pt-1 gap-2">
                        <p className="text-[10px] sm:text-[11px] text-brand-dark/60 italic">
                          Analyzing leaf symptoms...
                        </p>
                        <button
                          type="button"
                          onClick={handleCancelScan}
                          className="text-xs text-red-600 hover:underline font-semibold flex items-center gap-1 shrink-0"
                        >
                          <StopCircle className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 pt-2 w-full max-w-sm">
                      <Button
                        variant="primary"
                        size="md"
                        onClick={runAnalysis}
                        leftIcon={<ScanLine className="w-4 h-4 text-brand-mint" />}
                        className="w-full sm:w-auto py-2.5 font-bold"
                      >
                        Analyze Leaf Now
                      </Button>
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={handleRetake}
                        className="w-full sm:w-auto py-2.5"
                      >
                        Retake Photo
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4 max-w-md mx-auto w-full">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-brand-forest/10 border border-brand-forest/20 flex items-center justify-center text-brand-forest mx-auto">
                    <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-brand-leaf" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-brand-dark">
                      Capture or Select a Leaf Photo
                    </h3>
                    <p className="text-xs text-brand-dark/70">
                      Supports Potato, Rice, Wheat, Brinjal, Jute, Tomato, Chilli, and other Bengal crops.
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

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3 pt-2 w-full">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => cameraInputRef.current?.click()}
                      leftIcon={<Camera className="w-4 h-4" />}
                      className="w-full sm:w-auto py-3 font-bold"
                    >
                      Take Camera Photo
                    </Button>
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => fileInputRef.current?.click()}
                      leftIcon={<Upload className="w-4 h-4 text-brand-leaf" />}
                      className="w-full sm:w-auto py-3 font-semibold"
                    >
                      Upload from Gallery
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Photo Taking Tips for Reliable Diagnosis */}
          <div className="p-3.5 sm:p-5 rounded-2xl bg-cream-100 border border-cream-200 space-y-2.5 sm:space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-forest flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-brand-harvest" />
              Guidelines for 100% Reliable Detection
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-xs text-brand-dark/80">
              <div className="p-2.5 sm:p-3 bg-white rounded-xl border border-cream-200 shadow-2xs">
                <span className="font-bold block text-brand-dark mb-0.5">1. Close-Up Leaf View</span>
                Hold camera 10-15 cm away so lesion spots and fungus spores are sharply focused.
              </div>
              <div className="p-2.5 sm:p-3 bg-white rounded-xl border border-cream-200 shadow-2xs">
                <span className="font-bold block text-brand-dark mb-0.5">2. Natural Daytime Light</span>
                Avoid harsh shadows, excessive flash, or dark night captures. Natural sunlight works best.
              </div>
              <div className="p-2.5 sm:p-3 bg-white rounded-xl border border-cream-200 shadow-2xs">
                <span className="font-bold block text-brand-dark mb-0.5">3. Single Affected Leaf</span>
                Isolate one leaf rather than the whole field for exact symptom categorization.
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Result Screen with 3 Switchable Tabs */
        <ScanResultView
          result={scanResult}
          scanId={activeScanId}
          imagePreview={imagePreview}
          onScanAnother={handleRetake}
        />
      )}
    </div>
  );
}
