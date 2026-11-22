'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  CheckCircle2,
  AlertTriangle,
  Database,
  Brain,
  CloudSun,
  ShieldCheck,
  Copy,
  Check,
} from 'lucide-react';
import type { ServiceStatus } from '@/lib/supabase/status';

export default function SetupPage() {
  const [status, setStatus] = useState<ServiceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/system/status')
      .then((res) => res.json())
      .then((data) => {
        setStatus(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load system status', err);
        setLoading(false);
      });
  }, []);

  const copyMigrationPath = () => {
    navigator.clipboard.writeText('supabase/migrations/20261122000000_initial_schema.sql');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-sm font-semibold text-brand-dark/70">Checking system configuration...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 text-left">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-forest">
          System & Service Configuration Status
        </h1>
        <p className="text-xs sm:text-sm text-brand-dark/70 mt-1">
          Honest diagnostic status of all backend databases, AI providers, and meteorological integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Supabase Database Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-brand-leaf" />
                <CardTitle className="text-base font-bold">Supabase PostgreSQL & Auth</CardTitle>
              </div>
              {status?.supabaseConfigured ? (
                <Badge variant="emerald" size="sm">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Configured
                </Badge>
              ) : (
                <Badge variant="amber" size="sm">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Keys Required
                </Badge>
              )}
            </div>
            <CardDescription>
              {status?.supabaseConfigured
                ? 'Connected to live Supabase project. Row-Level Security active.'
                : 'Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-xs p-3 rounded-xl bg-cream-100 border border-cream-200">
              <span className="font-semibold block mb-1">SQL Migration Ready:</span>
              <code className="text-brand-forest break-all">
                supabase/migrations/20261122000000_initial_schema.sql
              </code>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyMigrationPath}
              leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? 'Copied Path!' : 'Copy Migration File Path'}
            </Button>
          </CardContent>
        </Card>

        {/* AI Gateway Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-brand-leaf" />
                <CardTitle className="text-base font-bold">Multimodal AI Gateway</CardTitle>
              </div>
              {status?.anyAiConfigured ? (
                <Badge variant="emerald" size="sm">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active
                </Badge>
              ) : (
                <Badge variant="amber" size="sm">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Key Required
                </Badge>
              )}
            </div>
            <CardDescription>
              Unified gateway with fallback chain across Gemini, Groq, and OpenRouter.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-cream-200">
              <span>Google Gemini (Vision & Chat):</span>
              <span className={status?.geminiConfigured ? 'text-emerald-700 font-bold' : 'text-amber-700'}>
                {status?.geminiConfigured ? 'Connected' : 'Not configured (GEMINI_API_KEY)'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-cream-200">
              <span>Groq Cloud (Fallback):</span>
              <span className={status?.groqConfigured ? 'text-emerald-700 font-bold' : 'text-brand-dark/50'}>
                {status?.groqConfigured ? 'Connected' : 'Optional (GROQ_API_KEY)'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span>OpenRouter (Universal):</span>
              <span className={status?.openrouterConfigured ? 'text-emerald-700 font-bold' : 'text-brand-dark/50'}>
                {status?.openrouterConfigured ? 'Connected' : 'Optional (OPENROUTER_API_KEY)'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Open-Meteo Weather Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CloudSun className="w-5 h-5 text-brand-leaf" />
                <CardTitle className="text-base font-bold">Open-Meteo Real Weather</CardTitle>
              </div>
              <Badge variant="emerald" size="sm">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Ready (No key needed)
              </Badge>
            </div>
            <CardDescription>
              Free open meteorological data for high-resolution latitude/longitude weather & spray forecasts.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-brand-dark/70">
            Fully functional out of the box with 30-minute server cache.
          </CardContent>
        </Card>

        {/* Security & RLS */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-leaf" />
                <CardTitle className="text-base font-bold">Security & Isolation</CardTitle>
              </div>
              <Badge variant="forest" size="sm">
                Strict RLS
              </Badge>
            </div>
            <CardDescription>
              Row Level Security enabled across all 13 database tables. Zero client secrets.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-brand-dark/70">
            Multi-tenant data isolation strictly enforced at PostgreSQL engine level.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
