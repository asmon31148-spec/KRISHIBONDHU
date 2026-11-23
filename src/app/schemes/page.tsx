'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  FileText,
  ExternalLink,
  Calendar,
  Search,
  IndianRupee,
  Phone,
  ShieldCheck,
  Activity,
} from 'lucide-react';

interface Scheme {
  id: string;
  name: string;
  bengaliName: string;
  sponsor: 'West Bengal State Government' | 'Central Government (Govt of India)';
  category: 'Direct Income' | 'Crop Insurance' | 'Irrigation & Subsidies' | 'Credit & Loan' | 'Mechanization';
  benefitAmount: string;
  helpline: string;
  availabilityStatus: string;
  statusCheckUrl: string;
  statusCheckLabel: string;
  eligibility: string[];
  documents: string[];
  officialUrl: string;
  lastUpdated: string;
}

const SCHEMES: Scheme[] = [
  {
    id: 'krishak-bandhu',
    name: 'Krishak Bandhu (Natun)',
    bengaliName: 'কৃষক বন্ধু (নতুন)',
    sponsor: 'West Bengal State Government',
    category: 'Direct Income',
    benefitAmount: '₹4,000 to ₹10,000 per year + ₹2 Lakh death insurance',
    helpline: '8334904040 / 033-2214-5555',
    availabilityStatus: 'Active & Ongoing (FY 2025–26)',
    statusCheckUrl: 'https://krishakbandhu.wb.gov.in',
    statusCheckLabel: 'Check Voter ID Status',
    eligibility: [
      'All farmers cultivating land in West Bengal (including recorded Bhagchasi / Sharecroppers).',
      'Assistance is ₹10,000/year (two instalments of ₹5,000 in Kharif & Rabi) for 1 acre or more; pro-rata min ₹4,000/year.',
      'Krishak Bandhu Death Benefit: In case of untimely death of farmer aged 18–60, legal heirs receive ₹2,00,000 one-time grant.',
    ],
    documents: ['Voter ID Card (EPIC)', 'Aadhaar Card', 'RoR / Khaitan copy / Patta doc', 'Bank Passbook (first page with IFSC)'],
    officialUrl: 'https://krishakbandhu.wb.gov.in',
    lastUpdated: 'February 2025 (Active FY 2025-26)',
  },
  {
    id: 'bangla-shasya-bima',
    name: 'Bangla Shasya Bima (BSB)',
    bengaliName: 'বাংলা শস্য বীমা (BSB)',
    sponsor: 'West Bengal State Government',
    category: 'Crop Insurance',
    benefitAmount: '100% Free Crop Insurance (0% Farmer Premium)',
    helpline: '1800-889-6888 (Toll-Free)',
    availabilityStatus: 'Active (Rabi / Boro Season Enrolling)',
    statusCheckUrl: 'https://banglashasyabima.net',
    statusCheckLabel: 'Check Application & Certificate',
    eligibility: [
      'Entire insurance premium is borne by the West Bengal State Government for all notified crops (Aman paddy, Aus paddy, Boro paddy, Jute, Maize, Pulses, Mustard).',
      'Farmers pay zero premium, except for potato and sugarcane where state subsidizes the majority share.',
      'Compensation paid directly to bank account based on satellite, weather and crop cutting experiment (CCE) shortfall.',
    ],
    documents: ['Aadhaar Card', 'Khatian / Parcha (Land Record)', 'Sowing Certificate from Gram Panchayat / Krishi Sahayak', 'Bank Passbook'],
    officialUrl: 'https://banglashasyabima.net',
    lastUpdated: 'February 2025 (Active FY 2025-26)',
  },
  {
    id: 'pm-kisan',
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    bengaliName: 'প্রধানমন্ত্রী কিষাণ সম্মান নিধি',
    sponsor: 'Central Government (Govt of India)',
    category: 'Direct Income',
    benefitAmount: '₹6,000 per year (3 instalments of ₹2,000)',
    helpline: '155261 / 1800-11-5526 (Toll-Free)',
    availabilityStatus: 'Active & Ongoing (DBT Disbursements Active)',
    statusCheckUrl: 'https://pmkisan.gov.in/BeneficiaryStatus_New.aspx',
    statusCheckLabel: 'Live Beneficiary Status Tracker',
    eligibility: [
      'All landholding farmer families having cultivable landholding in their names.',
      'Transferred directly via DBT in 3 equal four-monthly payments.',
      'Mandatory e-KYC and land seeding on the PM-KISAN portal required for disbursements.',
    ],
    documents: ['Aadhaar Card (linked to mobile)', 'Land Ownership Documents (Parcha / Deed)', 'Aadhaar-seeded Bank Account'],
    officialUrl: 'https://pmkisan.gov.in',
    lastUpdated: 'February 2025 (Active FY 2025-26)',
  },
  {
    id: 'kcc',
    name: 'Kisan Credit Card (KCC) Scheme',
    bengaliName: 'কিষাণ ক্রেডিট কার্ড (KCC)',
    sponsor: 'Central Government (Govt of India)',
    category: 'Credit & Loan',
    benefitAmount: 'Short-term loans up to ₹3,00,000 at effective 4% interest',
    helpline: '1800-180-1551 (Kisan Call Center)',
    availabilityStatus: 'Active & Accepting Applications Year-Round',
    statusCheckUrl: 'https://www.myscheme.gov.in/schemes/kcc',
    statusCheckLabel: 'Check Bank Checklist & Form',
    eligibility: [
      'All farmers, individual/joint borrowers, tenant farmers, oral lessees and self-help groups (SHGs).',
      'Nominal interest rate of 7%, reduced to 4% p.a. for prompt repayment within 1 year.',
      'Collateral-free agricultural loans up to ₹1.60 lakh (extendable to ₹2.00 lakh under specific bank rules).',
    ],
    documents: ['Identity Proof (Aadhaar / Voter ID)', 'Address Proof', 'Land Ownership Record / Crop cultivation certificate', 'Passport photos'],
    officialUrl: 'https://agricoop.nic.in',
    lastUpdated: 'February 2025 (Active FY 2025-26)',
  },
  {
    id: 'pmksy-micro-irrigation',
    name: 'Per Drop More Crop (PMKSY - Micro Irrigation)',
    bengaliName: 'প্রতি ফোঁটা জলে অধিক ফসল (ড্রিপ ও স্প্রিংকলার)',
    sponsor: 'Central Government (Govt of India)',
    category: 'Irrigation & Subsidies',
    benefitAmount: 'Up to 55% subsidy on Drip & Sprinkler Systems',
    helpline: '1800-180-1551 (Kisan Call Center)',
    availabilityStatus: 'Active (District Allotments Open)',
    statusCheckUrl: 'https://pmksy.gov.in',
    statusCheckLabel: 'Check State Allotment Status',
    eligibility: [
      'Small and marginal farmers receive 55% financial assistance for micro-irrigation installation.',
      'Other farmers receive 45% financial assistance.',
      'Saves up to 40–50% water while boosting crop yields in vegetable, potato, and orchard belts.',
    ],
    documents: ['Land Records (ROR)', 'Aadhaar Card', 'Water source verification (tubewell/pond)', 'Bank Details'],
    officialUrl: 'https://pmksy.gov.in',
    lastUpdated: 'February 2025 (Active FY 2025-26)',
  },
  {
    id: 'matir-katha-farm-mechanization',
    name: 'West Bengal Farm Mechanization (FSSM & CHC)',
    bengaliName: 'কৃষি যান্ত্রিকীকরণ প্রকল্প (মাটির কথা)',
    sponsor: 'West Bengal State Government',
    category: 'Mechanization',
    benefitAmount: '40% to 80% subsidy on modern farm machinery',
    helpline: '033-2358-0050 (Agri Directorate, WB)',
    availabilityStatus: 'Active (Departmental Subsidy Cycles)',
    statusCheckUrl: 'https://matirkatha.net',
    statusCheckLabel: 'Matir Katha Application Portal',
    eligibility: [
      'Financial Support for Purchase of Farm Machinery (FSSM): 50% subsidy for individual small/marginal farmers.',
      'Custom Hiring Centres (CHC): 40% subsidy (up to ₹20–40 Lakh) for Primary Agricultural Credit Societies (PACS) and Farmer Producer Companies (FPOs).',
    ],
    documents: ['Land Record (Parcha)', 'Aadhaar Card', 'Voter Card', 'Quotation from authorized implement dealer'],
    officialUrl: 'https://matirkatha.gov.in',
    lastUpdated: 'February 2025 (Active FY 2025-26)',
  },
];

export default function SchemesPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSponsor, setSelectedSponsor] = useState<string>('All');

  const categories = ['All', 'Direct Income', 'Crop Insurance', 'Irrigation & Subsidies', 'Credit & Loan', 'Mechanization'];
  const sponsors = ['All', 'West Bengal State Government', 'Central Government (Govt of India)'];

  const filtered = SCHEMES.filter((scheme) => {
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
    <div className="space-y-6 w-full text-left max-w-full overflow-x-clip pb-12">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-forest/10 text-brand-forest text-xs font-semibold mb-2">
          <FileText className="w-3.5 h-3.5" />
          <span>Verified Government Benefits</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-forest">
          Agricultural Welfare Schemes & Subsidies
        </h1>
        <p className="text-xs sm:text-sm text-brand-dark/70 mt-1 max-w-3xl">
          Direct income support, free state crop insurance, and equipment subsidies for farmers in West Bengal and India. Always verify eligibility on official department portals before applying.
        </p>
      </div>

      {/* Official Availability Checkline Notice */}
      <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50/90 border border-emerald-200/90 rounded-2xl text-xs sm:text-sm text-emerald-950">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold block text-xs sm:text-sm text-emerald-950">
            Official Availability Checkline & Active Status (FY 2025–2026):
          </span>
          <p className="text-emerald-900/85 text-[11px] sm:text-xs leading-relaxed">
            All 6 schemes cataloged below are verified active and currently disbursing seasonal assistance or enrolling farmers across West Bengal districts. Use the direct <strong className="text-emerald-950">Beneficiary Status Tracker</strong> buttons on each card to search your Voter ID or Aadhaar status directly on official state and central servers.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-brand-dark/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by scheme name (Krishak Bandhu, PM-KISAN, BSB)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-white text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter by Benefit Category"
            className="rounded-xl border border-cream-300 bg-white px-3 py-2 text-xs font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          <select
            value={selectedSponsor}
            onChange={(e) => setSelectedSponsor(e.target.value)}
            aria-label="Filter by Government Authority"
            className="rounded-xl border border-cream-300 bg-white px-3 py-2 text-xs font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
          >
            {sponsors.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Authorities' : s.replace(' Government (Govt of India)', '')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scheme Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((scheme) => (
          <Card key={scheme.id} className="border border-cream-200/90 shadow-xs hover:border-brand-leaf/40 transition-all bg-white flex flex-col justify-between overflow-hidden">
            <CardHeader className="bg-cream-50/70 border-b border-cream-200/70 p-4 sm:p-5 pb-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-brand-forest/10 text-brand-forest border border-brand-forest/20 shrink-0">
                  {scheme.sponsor.includes('West Bengal') ? 'West Bengal Scheme' : 'Central Scheme'}
                </span>

                <Badge variant="outline" className="text-[10px] font-semibold bg-white text-brand-dark/80">
                  {scheme.category}
                </Badge>
              </div>

              <div className="mt-2">
                <CardTitle className="text-lg font-bold text-brand-forest leading-snug">
                  {scheme.name}
                </CardTitle>
                <span className="text-xs font-semibold text-brand-leaf block">
                  {scheme.bengaliName}
                </span>

                {/* Live Availability Status Checkline */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300 text-[10px] font-bold w-fit mt-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span>{scheme.availabilityStatus}</span>
                </div>
              </div>

              {/* Benefit Highlight */}
              <div className="mt-3 p-2.5 rounded-xl bg-white border border-brand-mint/60 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-brand-dark">
                  {scheme.benefitAmount}
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-4 pt-3 text-xs">
              {/* Eligibility */}
              <div>
                <span className="font-bold text-brand-dark uppercase tracking-wider text-[10px] block mb-1.5 text-brand-forest">
                  Key Eligibility & Provisions:
                </span>
                <ul className="space-y-1.5 text-brand-dark/80 pl-3">
                  {scheme.eligibility.map((item, idx) => (
                    <li key={idx} className="list-disc leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Required Documents */}
              <div className="p-2.5 rounded-lg bg-cream-50/80 border border-cream-200">
                <span className="font-bold text-brand-dark text-[10px] uppercase block mb-1 text-brand-dark/70">
                  Required Documents:
                </span>
                <p className="text-[11px] text-brand-dark/80 leading-normal">
                  {scheme.documents.join(' • ')}
                </p>
              </div>

              {/* Official Helpline */}
              <div className="flex items-center gap-1.5 text-[11px] text-brand-dark/70 bg-cream-50/60 p-2 rounded-lg border border-cream-200/60">
                <Phone className="w-3.5 h-3.5 text-brand-forest shrink-0" />
                <span className="font-bold text-brand-forest">Helpline:</span>
                <span className="font-medium">{scheme.helpline}</span>
              </div>

              {/* Footer with portal links and verified status */}
              <div className="space-y-2 pt-2 border-t border-cream-200/70 text-xs">
                <div className="flex items-center justify-between text-[11px] text-brand-dark/60">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-brand-leaf" />
                    Verified: {scheme.lastUpdated}
                  </span>
                  <a
                    href={scheme.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-brand-dark/75 hover:text-brand-forest hover:underline font-medium"
                  >
                    <span>Guidelines Portal</span>
                    <ExternalLink className="w-3 h-3 text-brand-dark/50" />
                  </a>
                </div>

                {/* Primary Action Button: Live Status Tracker */}
                <a
                  href={scheme.statusCheckUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-brand-forest hover:bg-brand-leaf text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Activity className="w-3.5 h-3.5 text-brand-mint" />
                  <span>{scheme.statusCheckLabel}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
