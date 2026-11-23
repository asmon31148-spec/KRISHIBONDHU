'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  BookOpen,
  ExternalLink,
  Search,
  Calendar,
  Info,
} from 'lucide-react';

interface SourceItem {
  id: string;
  title: string;
  organization: string;
  tier: 1 | 2 | 3;
  category: 'Diseases & Pests' | 'Pesticides & Chemicals' | 'Weather & Climate' | 'Government Schemes' | 'Market & Mandi';
  url: string;
  description: string;
  lastUpdated: string;
}

const SOURCES: SourceItem[] = [
  {
    id: 'icar-nrcpb',
    title: 'ICAR - Central Rice Research Institute (NRRI) & ICAR Crop Bulletins',
    organization: 'Indian Council of Agricultural Research (ICAR)',
    tier: 1,
    category: 'Diseases & Pests',
    url: 'https://icar.org.in',
    description: 'Standard Package of Practices for Aman, Aus, and Boro rice cultivation, disease identification matrices, and IPM strategies.',
    lastUpdated: 'November 2024',
  },
  {
    id: 'bckv-pop',
    title: 'Package of Practices for Horticultural and Field Crops of West Bengal',
    organization: 'Bidhan Chandra Krishi Viswavidyalaya (BCKV), Mohanpur',
    tier: 1,
    category: 'Diseases & Pests',
    url: 'https://www.bckv.edu.in',
    description: 'Agro-climatic recommendations, sowing windows, seed rates, and fungal/bacterial blight remedies tailored to Gangetic Alluvial and Coastal saline soils.',
    lastUpdated: 'October 2024',
  },
  {
    id: 'cibrc-pesticides',
    title: 'Major Uses of Pesticides (Registered under the Insecticides Act, 1968)',
    organization: 'Central Insecticides Board & Registration Committee (CIBRC)',
    tier: 1,
    category: 'Pesticides & Chemicals',
    url: 'https://cibrc.gov.in',
    description: 'Legally registered active ingredients, approved crop indications, label dose ranges, and mandatory waiting periods (Pre-Harvest Interval - PHI).',
    lastUpdated: 'January 2025',
  },
  {
    id: 'imd-agromet',
    title: 'Gramin Krishi Mausam Sewa (GKMS) Agromet Advisories',
    organization: 'India Meteorological Department (IMD), Ministry of Earth Sciences',
    tier: 1,
    category: 'Weather & Climate',
    url: 'https://mausam.imd.gov.in',
    description: 'Bi-weekly district-level agromet advisory bulletins covering rainfall forecasts, relative humidity, and spray suitability windows.',
    lastUpdated: 'Updated Daily',
  },
  {
    id: 'wb-agri-schemes',
    title: 'Krishak Bandhu & Matir Katha Guidelines',
    organization: 'Department of Agriculture, Government of West Bengal',
    tier: 1,
    category: 'Government Schemes',
    url: 'https://krishakbandhu.wb.gov.in',
    description: 'Direct benefit transfer eligibility, death benefit insurance, and state subsidized mechanization scheme guidelines.',
    lastUpdated: 'December 2024',
  },
  {
    id: 'pm-kisan-portal',
    title: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    organization: 'Ministry of Agriculture & Farmers Welfare, Govt of India',
    tier: 1,
    category: 'Government Schemes',
    url: 'https://pmkisan.gov.in',
    description: 'Income support verification guidelines, e-KYC protocols, and instalment schedules for landholding farmer families.',
    lastUpdated: 'January 2025',
  },
  {
    id: 'pmfby-portal',
    title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY) & Bangla Shasya Bima (BSB)',
    organization: 'Ministry of Agriculture & Farmers Welfare / WB Dept of Agriculture',
    tier: 1,
    category: 'Government Schemes',
    url: 'https://pmfby.gov.in',
    description: 'Crop loss insurance coverage, localized calamity compensation claims, and cut-off dates for Kharif and Rabi seasons.',
    lastUpdated: 'December 2024',
  },
  {
    id: 'soil-health-card',
    title: 'Soil Health Card Scheme Norms & Critical Nutrient Limits',
    organization: 'Department of Agriculture and Farmers Welfare (DA&FW)',
    tier: 1,
    category: 'Diseases & Pests',
    url: 'https://soilhealth.dac.gov.in',
    description: 'Macro (N, P, K) and micronutrient rating charts, electrical conductivity (EC), and pH classification standards for Indian soils.',
    lastUpdated: 'August 2024',
  },
  {
    id: 'open-meteo',
    title: 'Open-Meteo High-Resolution Numerical Weather Models',
    organization: 'Open-Meteo Weather API (ECMWF & GFS feeds)',
    tier: 3,
    category: 'Weather & Climate',
    url: 'https://open-meteo.com',
    description: 'Hourly rainfall forecasts, wind gusts, relative humidity, and solar radiation used for hyper-local spray windows and blight index calculation.',
    lastUpdated: 'Live API Feed',
  },
  {
    id: 'agmarknet-portal',
    title: 'Agricultural Marketing Information Network (Agmarknet)',
    organization: 'Directorate of Marketing & Inspection (DMI), Ministry of Agriculture',
    tier: 2,
    category: 'Market & Mandi',
    url: 'https://agmarknet.gov.in',
    description: 'Daily mandi arrival volumes, modal prices, and minimum/maximum commodity rates across West Bengal APMC wholesale markets.',
    lastUpdated: 'Daily API Feed',
  },
];

export default function SourcesPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<string>('All');

  const categories = ['All', 'Diseases & Pests', 'Pesticides & Chemicals', 'Weather & Climate', 'Government Schemes', 'Market & Mandi'];
  const tiers = ['All', 'Tier 1 (Official & Govt)', 'Tier 2 (University & Mandi)', 'Tier 3 (Live APIs)'];

  const filtered = SOURCES.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.organization.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesTier =
      selectedTier === 'All' ||
      (selectedTier.startsWith('Tier 1') && item.tier === 1) ||
      (selectedTier.startsWith('Tier 2') && item.tier === 2) ||
      (selectedTier.startsWith('Tier 3') && item.tier === 3);

    return matchesSearch && matchesCategory && matchesTier;
  });

  return (
    <div className="space-y-6 w-full text-left max-w-full overflow-x-clip pb-12">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-forest/10 text-brand-forest text-xs font-semibold mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Knowledge Transparency & Provenance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-forest">
          Agronomic Sources & Reference Library
        </h1>
        <p className="text-xs sm:text-sm text-brand-dark/70 mt-1 max-w-3xl">
          KRISHIBONDHU is built on earned trust. Below is the complete catalog of official publications, government portals, university manuals, and meteorological feeds that inform our advisory brain.
        </p>
      </div>

      {/* Honest Provenance Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm leading-relaxed space-y-1">
          <p className="font-bold text-amber-900">
            Public Good Agronomic Knowledge Notice
          </p>
          <p className="text-amber-900/90">
            KRISHIBONDHU is an independent agricultural intelligence system. Recommendations are algorithmic syntheses informed by publicly available guidelines published by ICAR, BCKV, CIBRC, and the Department of Agriculture. KRISHIBONDHU does not claim official endorsement or direct institutional partnership. Farmers are advised to consult their local Krishi Vigyan Kendra (KVK) or Block Agriculture Officer (BAO) for field-specific pesticide prescription verification.
          </p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-brand-dark/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by crop, pest, university, or scheme..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-white text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter by Topic"
            className="rounded-xl border border-cream-300 bg-white px-3 py-2 text-xs font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Topics' : cat}
              </option>
            ))}
          </select>

          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            aria-label="Filter by Trust Tier"
            className="rounded-xl border border-cream-300 bg-white px-3 py-2 text-xs font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
          >
            {tiers.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Source Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <Card key={item.id} className="border border-cream-200/90 shadow-xs hover:border-brand-leaf/40 transition-all bg-white flex flex-col justify-between">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                    item.tier === 1
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : item.tier === 2
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  Tier {item.tier}: {item.tier === 1 ? 'Official & Scientific' : item.tier === 2 ? 'Secondary & Academic' : 'Live Numerical Data'}
                </span>

                <Badge variant="outline" className="text-[10px] font-semibold bg-cream-50 text-brand-dark/80">
                  {item.category}
                </Badge>
              </div>

              <CardTitle className="text-base font-bold text-brand-forest mt-2 leading-snug">
                {item.title}
              </CardTitle>
              <p className="text-xs font-medium text-brand-dark/70">
                {item.organization}
              </p>
            </CardHeader>

            <CardContent className="space-y-3 pt-1">
              <p className="text-xs text-brand-dark/80 leading-relaxed">
                {item.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-cream-200/70 text-xs">
                <span className="text-[11px] text-brand-dark/60 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-brand-leaf" />
                  Verified: {item.lastUpdated}
                </span>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-forest hover:text-brand-leaf transition-colors hover:underline"
                >
                  <span>Official Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
