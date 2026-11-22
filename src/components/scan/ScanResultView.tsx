'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/i18n/context';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { GuestSavePrompt } from '@/components/auth/GuestSavePrompt';
import {
  AlertTriangle,
  Share2,
  RotateCcw,
  Flag,
  ShieldAlert,
  Sprout,
  Sparkles,
  Printer,
} from 'lucide-react';
import type { CropScanResult } from '@/lib/ai/types';

interface ScanResultViewProps {
  result: CropScanResult;
  scanId: string | null;
  imagePreview: string | null;
  onScanAnother: () => void;
}

export function ScanResultView({
  result,
  scanId,
  imagePreview,
  onScanAnother,
}: ScanResultViewProps) {
  const { t } = useTranslation();
  const { isGuest } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'symptoms' | 'explanation' | 'actions'>('actions');
  const [isGuestPromptOpen, setIsGuestPromptOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Crop Diagnosis: ${result.crop_name} - ${result.disease_name || 'Healthy'}`,
          text: `KRISHIBONDHU Agronomy Diagnosis: ${result.crop_name} (${result.disease_name || 'Healthy'}). Severity: ${result.severity}.`,
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Diagnosis link copied to clipboard.');
    }
  };

  const handleDownloadReport = () => {
    window.print();
  };

  const handleReportErrorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanId) {
      toast.info('Feedback logged locally. Thank you for helping improve diagnostic accuracy!');
      setIsFeedbackModalOpen(false);
      return;
    }

    setIsSubmittingFeedback(true);
    try {
      const res = await fetch('/api/scan/report-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanId, feedbackNotes: feedbackNote }),
      });
      if (res.ok) {
        toast.success('Report submitted to agricultural extension team.');
        setIsFeedbackModalOpen(false);
      } else {
        toast.error('Failed to submit feedback.');
      }
    } catch {
      toast.error('Error reporting feedback.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // 1. HONEST UNCERTAINTY STATE
  if (result.is_uncertain) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-amber-300 bg-amber-50/40">
          <CardHeader className="text-center pb-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2 border border-amber-200">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <Badge variant="amber" size="md">
              Diagnostic Uncertainty Detected
            </Badge>
            <CardTitle className="text-2xl font-black text-amber-950 mt-2">
              Unable to Confirm Crop Disease with Certainty
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-w-xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-white border border-amber-200 text-xs sm:text-sm text-amber-950 space-y-2">
              <p className="font-semibold text-brand-forest">
                Why was this flagged as uncertain?
              </p>
              <p className="text-amber-900 leading-relaxed">
                {result.uncertainty_reason ||
                  'The image quality, lighting, or focus is insufficient to distinguish the biological pathogen reliably. Low model confidence guarantees that we never guess a disease.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-cream-50 border border-cream-200 text-xs text-brand-dark/80 space-y-1.5">
              <span className="font-bold text-brand-forest block">Next Steps:</span>
              <ul className="list-disc pl-4 space-y-1">
                <li>Take a close-up photo in bright, natural daytime sunlight.</li>
                <li>Ensure only one single leaf is in sharp focus without hand shaking.</li>
                <li>If the problem persists, consult your block Agricultural Development Officer (ADO) or Krishi Vigyan Kendra (KVK).</li>
              </ul>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <Button variant="primary" size="lg" onClick={onScanAnother} leftIcon={<RotateCcw className="w-4 h-4" />}>
                Try Another Photo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 2. CONFIRMED OR HEALTHY DIAGNOSIS STATE
  return (
    <div className="space-y-6 print:m-0">
      {/* Header Diagnostic Card */}
      <Card className="overflow-hidden border-cream-200 shadow-md">
        <div className="p-6 sm:p-8 bg-gradient-to-r from-brand-forest via-brand-leaf to-brand-forest text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand-mint uppercase tracking-wider">
                  Crop Identified: {result.crop_name} ({result.crop_confidence}% Confidence)
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                {result.is_healthy ? 'Healthy Crop (No Disease Detected)' : result.disease_name}
              </h2>
              {result.disease_confidence !== null && (
                <p className="text-xs text-white/80">
                  Pathology Diagnostic Confidence: <strong>{result.disease_confidence}%</strong>
                </p>
              )}
            </div>

            <div className="flex sm:flex-col items-center sm:items-end gap-2">
              <Badge
                variant={
                  result.severity === 'healthy'
                    ? 'emerald'
                    : result.severity === 'severe'
                    ? 'red'
                    : 'amber'
                }
                size="md"
              >
                Severity: {result.severity.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Thumbnail Preview & Action Buttons Row */}
        <div className="p-4 sm:p-5 bg-cream-50 border-b border-cream-200 flex flex-wrap items-center justify-between gap-3">
          {imagePreview && (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Diagnosed leaf"
                className="w-12 h-12 rounded-xl object-cover border border-cream-200 shadow-2xs"
              />
              <span className="text-xs font-semibold text-brand-dark/70">
                Analyzed Leaf Sample
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Button variant="secondary" size="sm" onClick={handleDownloadReport} leftIcon={<Printer className="w-3.5 h-3.5" />}>
              Print Report
            </Button>
            <Button variant="secondary" size="sm" onClick={handleShare} leftIcon={<Share2 className="w-3.5 h-3.5" />}>
              Share
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFeedbackModalOpen(true)}
              leftIcon={<Flag className="w-3.5 h-3.5 text-red-600" />}
              className="text-red-700 hover:text-red-800"
            >
              Report Mistake
            </Button>
            <Button variant="outline" size="sm" onClick={onScanAnother} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
              Scan Another
            </Button>
          </div>
        </div>

        {/* 3 Switchable Tabs */}
        <div className="border-b border-cream-200 px-4 sm:px-6 flex gap-4 text-xs sm:text-sm font-bold print:hidden">
          <button
            onClick={() => setActiveTab('actions')}
            className={`py-3.5 border-b-2 transition-all ${
              activeTab === 'actions'
                ? 'border-brand-forest text-brand-forest'
                : 'border-transparent text-brand-dark/60 hover:text-brand-dark'
            }`}
          >
            Recommended Treatments
          </button>
          <button
            onClick={() => setActiveTab('symptoms')}
            className={`py-3.5 border-b-2 transition-all ${
              activeTab === 'symptoms'
                ? 'border-brand-forest text-brand-forest'
                : 'border-transparent text-brand-dark/60 hover:text-brand-dark'
            }`}
          >
            Symptoms & Visible Signs
          </button>
          <button
            onClick={() => setActiveTab('explanation')}
            className={`py-3.5 border-b-2 transition-all ${
              activeTab === 'explanation'
                ? 'border-brand-forest text-brand-forest'
                : 'border-transparent text-brand-dark/60 hover:text-brand-dark'
            }`}
          >
            AI Agronomy Explanation
          </button>
        </div>

        {/* Tab 1: Recommended Actions (Treatments & Safe Dosages) */}
        <CardContent className="p-5 sm:p-7 space-y-6">
          {(activeTab === 'actions' || typeof window === 'undefined') && (
            <div className="space-y-5">
              {/* Organic Remedies FIRST */}
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-emerald-800" />
                  <h4 className="text-sm sm:text-base font-bold text-emerald-950">
                    Organic & Cultural Remedies (Recommended First)
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed whitespace-pre-line">
                  {result.treatment_organic || 'No specific organic treatment required for this crop condition.'}
                </p>
              </div>

              {/* Chemical Treatment with Mandatory Protective Safety Disclaimer */}
              {result.treatment_chemical && (
                <div className="p-4 sm:p-5 rounded-2xl bg-cream-100 border border-cream-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-brand-forest" />
                    <h4 className="text-sm sm:text-base font-bold text-brand-dark">
                      Certified Chemical Treatment (If Severity Demands)
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-brand-dark/85 leading-relaxed whitespace-pre-line">
                    {result.treatment_chemical}
                  </p>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      <strong>Safety Protocol:</strong> Always read the manufacturer label carefully. Wear protective face mask and gloves. Observe proper pre-harvest waiting interval (PHI) before marketing crops.
                    </span>
                  </div>
                </div>
              )}

              {/* Prevention Advice & Expert Verification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-forest block">
                    Long-term Prevention & Field Sanitation
                  </span>
                  <p className="text-xs text-brand-dark/80 leading-relaxed">
                    {result.prevention_advice || 'Maintain proper plant spacing, balanced NPK fertilization, and crop rotation.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-forest block">
                    When to Consult Local Agricultural Officer
                  </span>
                  <p className="text-xs text-brand-dark/80 leading-relaxed">
                    {result.expert_advice || 'If disease symptoms spread to more than 20% of your plot within 48 hours, contact your local KVK extension agent.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Symptoms & Affected Parts */}
          {activeTab === 'symptoms' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-forest">
                  Observed Symptoms
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.symptoms.map((s, idx) => (
                    <Badge key={idx} variant="slate" size="md">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              {result.affected_parts && result.affected_parts.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-forest">
                    Affected Plant Organs
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.affected_parts.map((part, idx) => (
                      <Badge key={idx} variant="forest" size="md">
                        {part}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: AI Explanation & Regional Context */}
          {activeTab === 'explanation' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-forest">
                  Agronomic Pathology Assessment
                </h4>
                <p className="text-xs sm:text-sm text-brand-dark/80 leading-relaxed whitespace-pre-line">
                  {result.ai_explanation}
                </p>
              </div>

              {result.regional_context && (
                <div className="p-4 rounded-2xl bg-cream-100 border border-cream-200 space-y-1.5">
                  <span className="text-xs font-bold text-brand-forest block">
                    Agro-Climatic & Regional Risk Context
                  </span>
                  <p className="text-xs text-brand-dark/75 leading-relaxed">
                    {result.regional_context}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Guest Mode Save Prompt (if guest scanned) */}
      {isGuest && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-harvest" />
              Want to save this diagnosis permanently?
            </span>
            <p className="text-xs text-amber-900/80">
              Create a free farmer account to sync your scan history across devices.
            </p>
          </div>
          <Button variant="amber" size="sm" onClick={() => setIsGuestPromptOpen(true)}>
            {t('nav.saveAccount')}
          </Button>
        </div>
      )}

      {/* Report a wrong result modal */}
      <Modal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        title="Report Diagnostic Mistake"
        maxWidth="sm"
      >
        <form onSubmit={handleReportErrorSubmit} className="space-y-4 pt-2">
          <p className="text-xs text-brand-dark/70">
            Tell us what disease you believe this actually is or what looks inaccurate. Your feedback improves the platform for all farmers.
          </p>

          <Input
            placeholder="e.g. This is actually Late Blight, not Early Blight..."
            value={feedbackNote}
            onChange={(e) => setFeedbackNote(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-cream-200">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsFeedbackModalOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmittingFeedback}
            >
              Submit Flag
            </Button>
          </div>
        </form>
      </Modal>

      <GuestSavePrompt
        isOpen={isGuestPromptOpen}
        onClose={() => setIsGuestPromptOpen(false)}
        featureName="Scan History"
      />
    </div>
  );
}
