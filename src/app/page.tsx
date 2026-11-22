'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/context';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import {
  ScanLine,
  Bot,
  CloudSun,
  Warehouse,
  ShieldCheck,
  Sparkles,
  Camera,
  Cpu,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function LandingPage() {
  const { t } = useTranslation();
  const { isGuest } = useAuth();

  return (
    <div className="space-y-12 sm:space-y-16 w-full">
      {/* Pilot Warning / Academic Notice */}
      <div className="flex items-center gap-2 p-3.5 bg-cream-100 border border-cream-200 rounded-2xl text-xs sm:text-sm text-brand-dark/80">
        <AlertCircle className="w-4 h-4 text-brand-harvest shrink-0" />
        <span className="flex-1">{t('landing.pilotNotice')}</span>
        <div className="hidden sm:block">
          <LanguageSelector variant="inline" />
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-brand-forest/5 via-cream-100/60 to-white border border-cream-200/90 p-6 sm:p-10 lg:p-12 xl:p-14 w-full shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-center">
          <div className="lg:col-span-7 xl:col-span-7 space-y-6 text-left">
            <Badge variant="forest" size="md">
              <Sparkles className="w-3.5 h-3.5 text-brand-harvest" />
              <span>{t('landing.heroBadge')}</span>
            </Badge>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-forest tracking-tight leading-[1.15]">
              {t('landing.heroTitle')}
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-brand-dark/80 leading-relaxed max-w-2xl">
              {t('landing.heroDescription')}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/scan">
                <Button variant="primary" size="lg" leftIcon={<ScanLine className="w-5 h-5" />}>
                  {t('landing.scanNow')}
                </Button>
              </Link>
              <Link href="/assistant">
                <Button variant="secondary" size="lg" leftIcon={<Bot className="w-5 h-5 text-brand-leaf" />}>
                  {t('landing.askAssistant')}
                </Button>
              </Link>
            </div>

            <p className="text-xs text-brand-dark/60 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{t('landing.guestNote')}</span>
            </p>
          </div>

          {/* Hero Visual Card */}
          <div className="lg:col-span-5 xl:col-span-5 relative w-full h-full min-h-[300px] sm:min-h-[360px] lg:min-h-[400px] flex">
            <div className="relative w-full rounded-2xl overflow-hidden shadow-md border-2 border-white bg-cream-100 flex flex-col justify-end p-6 text-white">
              {/* Real Agriculture Landscape Photography (Attributed Unsplash open agritech photograph) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=900&q=80"
                alt="Green lush paddy fields in West Bengal"
                className="absolute inset-0 w-full h-full object-cover brightness-[0.82] transition-transform duration-700 hover:scale-105"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/95 via-brand-dark/40 to-transparent" />
              
              <div className="relative z-10 space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/85 backdrop-blur-xs text-[11px] font-semibold text-emerald-200 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified ICAR & BCKV Knowledge Core</span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
                  Rice, Potato, Jute & Vegetable Disease Identification
                </h4>
                <p className="text-xs text-gray-200">
                  Bengal agro-climatic zone calibration
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Features */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-forest">
            {t('landing.featuresTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-brand-dark/70">
            {t('landing.featuresSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:border-brand-leaf/40 transition-all hover:shadow-md">
            <CardContent className="p-5 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-brand-forest/10 flex items-center justify-center text-brand-forest">
                <ScanLine className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-brand-dark">
                {t('landing.feature1Title')}
              </h3>
              <p className="text-xs text-brand-dark/70 leading-relaxed">
                {t('landing.feature1Desc')}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-brand-leaf/40 transition-all hover:shadow-md">
            <CardContent className="p-5 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-brand-forest/10 flex items-center justify-center text-brand-forest">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-brand-dark">
                {t('landing.feature2Title')}
              </h3>
              <p className="text-xs text-brand-dark/70 leading-relaxed">
                {t('landing.feature2Desc')}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-brand-leaf/40 transition-all hover:shadow-md">
            <CardContent className="p-5 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-brand-forest/10 flex items-center justify-center text-brand-forest">
                <CloudSun className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-brand-dark">
                {t('landing.feature3Title')}
              </h3>
              <p className="text-xs text-brand-dark/70 leading-relaxed">
                {t('landing.feature3Desc')}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-brand-leaf/40 transition-all hover:shadow-md">
            <CardContent className="p-5 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-brand-forest/10 flex items-center justify-center text-brand-forest">
                <Warehouse className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-brand-dark">
                {t('landing.feature4Title')}
              </h3>
              <p className="text-xs text-brand-dark/70 leading-relaxed">
                {t('landing.feature4Desc')}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it works in 3 steps */}
      <section className="bg-cream-100/70 border border-cream-200 rounded-3xl p-6 sm:p-10 space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="slate" size="md">
            Step-by-Step Guidance
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-forest">
            {t('landing.howItWorksTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-cream-200/80 shadow-2xs space-y-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              <Camera className="w-5 h-5 text-brand-leaf" />
            </div>
            <h3 className="text-base font-bold text-brand-dark">
              {t('landing.step1Title')}
            </h3>
            <p className="text-xs sm:text-sm text-brand-dark/70 leading-relaxed">
              {t('landing.step1Desc')}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-cream-200/80 shadow-2xs space-y-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              <Cpu className="w-5 h-5 text-brand-leaf" />
            </div>
            <h3 className="text-base font-bold text-brand-dark">
              {t('landing.step2Title')}
            </h3>
            <p className="text-xs sm:text-sm text-brand-dark/70 leading-relaxed">
              {t('landing.step2Desc')}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-cream-200/80 shadow-2xs space-y-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-brand-leaf" />
            </div>
            <h3 className="text-base font-bold text-brand-dark">
              {t('landing.step3Title')}
            </h3>
            <p className="text-xs sm:text-sm text-brand-dark/70 leading-relaxed">
              {t('landing.step3Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Guest Mode Call to Action */}
      <section className="bg-brand-forest text-white rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-lg relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-3 relative z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to test a leaf scan on your farm?
          </h2>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            Get instant crop health analysis without installing heavy apps or creating an account.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link href="/scan">
              <Button variant="amber" size="lg" leftIcon={<ScanLine className="w-5 h-5" />}>
                {t('landing.scanNow')}
              </Button>
            </Link>
            {isGuest && (
              <Link href="/auth/signup">
                <Button variant="outline" size="lg" className="text-white border-white/50 hover:bg-white/10">
                  {t('nav.saveAccount')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Agricultural Disclaimer Footer */}
      <footer className="pt-6 border-t border-cream-200 text-center space-y-2 text-xs text-brand-dark/60">
        <p className="max-w-3xl mx-auto leading-relaxed">
          {t('common.disclaimer')}
        </p>
        <p className="font-medium">
          © {new Date().getFullYear()} KRISHIBONDHU (কৃষিবন্ধু) · Built for Public Good & Academic Agricultural Extension.
        </p>
      </footer>
    </div>
  );
}
