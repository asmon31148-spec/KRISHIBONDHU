/**
 * KRISHIBONDHU - Verified Agricultural Schemes & Insurance Repository
 * Official welfare programs active in West Bengal and India for FY 2025–26.
 */

export interface SchemeItem {
  id: string;
  name: string;
  bengaliName: string;
  hindiName: string;
  sponsor: 'West Bengal State Government' | 'Central Government (Govt of India)';
  category: 'Direct Income' | 'Crop Insurance' | 'Irrigation & Subsidies' | 'Credit & Loan' | 'Mechanization';
  benefitAmount: string;
  helpline: string;
  phoneDial: string;
  availabilityStatus: string;
  statusCheckUrl: string;
  statusCheckLabel: string;
  cutoffDates?: string;
  claimsProcess?: string;
  eligibility: string[];
  documents: {
    id: string;
    name_en: string;
    name_bn: string;
    name_hi: string;
    icon: string;
    details: string;
  }[];
  officialUrl: string;
  lastUpdated: string;
}

export const VERIFIED_SCHEMES: SchemeItem[] = [
  {
    id: 'bangla-shasya-bima',
    name: 'Bangla Shasya Bima (BSB)',
    bengaliName: 'বাংলা শস্য বীমা (BSB)',
    hindiName: 'बांग्ला शस्य बीमा',
    sponsor: 'West Bengal State Government',
    category: 'Crop Insurance',
    benefitAmount: '100% Free State Crop Insurance (0% Farmer Premium)',
    helpline: '1800-889-6888 (Toll-Free) / 1800-103-1000',
    phoneDial: '18008896888',
    availabilityStatus: 'Active & Ongoing (FY 2025–26)',
    statusCheckUrl: 'https://banglashasyabima.net',
    statusCheckLabel: 'Check Application & Certificate',
    cutoffDates: 'Kharif: 31 July | Rabi/Boro: 31 December – 31 January',
    claimsProcess: 'Direct Bank Transfer (DBT) via satellite crop loss assessment and Crop Cutting Experiments (CCE). Zero paperwork claim for declared disaster zones.',
    eligibility: [
      'All farmers cultivating notified crops in West Bengal (Owner farmers, Tenant farmers, Sharecroppers / Bhagchasi).',
      'Entire premium is paid by the Government of West Bengal for Aman paddy, Aus paddy, Boro paddy, Jute, Maize, Pulses, Mustard, and Wheat.',
      'Farmers pay zero premium (except for Commercial crops Potato & Sugarcane, where state subsidizes the majority).',
    ],
    documents: [
      {
        id: 'khatian',
        name_en: 'Land Records / Khatian',
        name_bn: 'খতিয়ান / পরচা (RoR)',
        name_hi: 'भूमि अभिलेख / खतियान',
        icon: '📄',
        details: 'Recent copy of RoR / Khatian / Parcha or Patta deed in applicant’s name.',
      },
      {
        id: 'voter',
        name_en: 'Voter ID Card',
        name_bn: 'ভোটার কার্ড (EPIC)',
        name_hi: 'वोटर कार्ड',
        icon: '🪪',
        details: 'Election Commission Voter ID card with valid residential address.',
      },
      {
        id: 'bank',
        name_en: 'Bank Passbook',
        name_bn: 'ব্যাংক পাসবই (IFSC সহ)',
        name_hi: 'बैंक पासबुक',
        icon: '🏦',
        details: 'First page showing account number, applicant name, and IFSC code.',
      },
      {
        id: 'sowing',
        name_en: 'Sowing Certificate',
        name_bn: 'চাষের শংসাপত্র (GP/KPS)',
        name_hi: 'बुवाई प्रमाण पत्र',
        icon: '🌾',
        details: 'Certificate of Sowing from Gram Panchayat Pradhan or Krishi Projukti Sahayak (KPS).',
      },
    ],
    officialUrl: 'https://banglashasyabima.net',
    lastUpdated: 'February 2025 (Active FY 2025-26)',
  },
  {
    id: 'krishak-bandhu',
    name: 'Krishak Bandhu (Natun)',
    bengaliName: 'কৃষক বন্ধু (নতুন)',
    hindiName: 'कृषक बंधु (नवीन)',
    sponsor: 'West Bengal State Government',
    category: 'Direct Income',
    benefitAmount: '₹4,000 to ₹10,000 per year + ₹2 Lakh death insurance',
    helpline: '8334904040 / 033-2214-5555',
    phoneDial: '03322145555',
    availabilityStatus: 'Active & Ongoing (FY 2025–26)',
    statusCheckUrl: 'https://krishakbandhu.wb.gov.in',
    statusCheckLabel: 'Check Voter ID Status',
    cutoffDates: 'Kharif installment: June | Rabi installment: November–December',
    claimsProcess: 'Direct transfer to Aadhaar-seeded bank account. Death benefit claim processed through Block ADA office within 30 days.',
    eligibility: [
      'All farmers cultivating land in West Bengal, including recorded Bhagchasi / Sharecroppers.',
      'Assistance is ₹10,000/year (two installments of ₹5,000 in Kharif & Rabi) for 1 acre or more land; pro-rata min ₹4,000/year.',
      'Krishak Bandhu Death Benefit: In case of untimely death of farmer aged 18–60, legal heirs receive ₹2,00,000 one-time state compensation.',
    ],
    documents: [
      {
        id: 'voter',
        name_en: 'Voter ID Card',
        name_bn: 'ভোটার কার্ড (EPIC)',
        name_hi: 'वोटर कार्ड',
        icon: '🪪',
        details: 'Mandatory primary identifier for Krishak Bandhu portal registration.',
      },
      {
        id: 'aadhaar',
        name_en: 'Aadhaar Card',
        name_bn: 'আধার কার্ড',
        name_hi: 'आधार कार्ड',
        icon: '🆔',
        details: 'Linked with bank account for direct benefit transfer validation.',
      },
      {
        id: 'khatian',
        name_en: 'Land Parcha / RoR',
        name_bn: 'জমির পরচা / খতিয়ান',
        name_hi: 'जमीन का पर्चा',
        icon: '📄',
        details: 'Record of Rights (RoR) certified by Land & Land Reforms Department.',
      },
      {
        id: 'bank',
        name_en: 'Bank Passbook',
        name_bn: 'ব্যাংক পাসবই',
        name_hi: 'बैंक पासबुक',
        icon: '🏦',
        details: 'Single active bank account passbook copy.',
      },
    ],
    officialUrl: 'https://krishakbandhu.wb.gov.in',
    lastUpdated: 'February 2025 (Active FY 2025-26)',
  },
  {
    id: 'pm-kisan',
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    bengaliName: 'প্রধানমন্ত্রী কিষাণ সম্মান নিধি',
    hindiName: 'प्रधानमंत्री किसान सम्मान निधि',
    sponsor: 'Central Government (Govt of India)',
    category: 'Direct Income',
    benefitAmount: '₹6,000 per year (3 installments of ₹2,000)',
    helpline: '155261 / 1800-11-5526 (Toll-Free)',
    phoneDial: '155261',
    availabilityStatus: 'Active & Ongoing (DBT Disbursements Active)',
    statusCheckUrl: 'https://pmkisan.gov.in/BeneficiaryStatus_New.aspx',
    statusCheckLabel: 'Live Beneficiary Status Tracker',
    cutoffDates: 'Tri-annual disbursements: April–July, August–November, December–March',
    claimsProcess: 'Automated Direct Benefit Transfer (DBT) directly into Aadhaar-seeded NPCI bank account.',
    eligibility: [
      'All landholding farmer families having cultivable landholding in their names.',
      'Transferred directly via DBT in 3 equal four-monthly payments of ₹2,000 each.',
      'Mandatory e-KYC and land seeding on the PM-KISAN portal required for release of funds.',
    ],
    documents: [
      {
        id: 'aadhaar',
        name_en: 'Aadhaar Card',
        name_bn: 'আধার কার্ড (মোবাইল লিঙ্কড)',
        name_hi: 'आधार कार्ड',
        icon: '🆔',
        details: 'Aadhaar linked with mobile number for OTP-based e-KYC.',
      },
      {
        id: 'khatian',
        name_en: 'Land Ownership Document',
        name_bn: 'জমির দলিল / পরচা',
        name_hi: 'जमीन के दस्तावेज',
        icon: '📄',
        details: 'Land mutation record proving legal ownership.',
      },
      {
        id: 'bank',
        name_en: 'NPCI Seeded Bank Account',
        name_bn: 'এনপিসিআই সিডেড ব্যাংক একাউন্ট',
        name_hi: 'एनपीसीआई लिंक बैंक खाता',
        icon: '🏦',
        details: 'Bank account mapped to Aadhaar in National Payments Corporation of India database.',
      },
    ],
    officialUrl: 'https://pmkisan.gov.in',
    lastUpdated: 'February 2025 (Active FY 2025-26)',
  },
  {
    id: 'kcc',
    name: 'Kisan Credit Card (KCC) Scheme',
    bengaliName: 'কিষাণ ক্রেডিট কার্ড (KCC)',
    hindiName: 'किसान क्रेडिट कार्ड',
    sponsor: 'Central Government (Govt of India)',
    category: 'Credit & Loan',
    benefitAmount: 'Short-term loans up to ₹3,00,000 at effective 4% interest',
    helpline: '1800-180-1551 (Kisan Call Center)',
    phoneDial: '18001801551',
    availabilityStatus: 'Active & Accepting Applications Year-Round',
    statusCheckUrl: 'https://www.myscheme.gov.in/schemes/kcc',
    statusCheckLabel: 'Check Bank Checklist & Form',
    cutoffDates: 'Year-Round through all Commercial Banks, RRBs, and Cooperative Banks',
    claimsProcess: 'Application submitted directly to nearest bank branch or Primary Agricultural Credit Society (PACS).',
    eligibility: [
      'All farmers, individual/joint borrowers, tenant farmers, oral lessees, and Self-Help Groups (SHGs).',
      'Nominal interest rate of 7%, reduced to 4% p.a. for prompt repayment within 1 year with government subvention.',
      'Collateral-free agricultural loans up to ₹1.60 lakh without land mortgage requirement.',
    ],
    documents: [
      {
        id: 'identity',
        name_en: 'Identity & Address Proof',
        name_bn: 'পরিচয় ও ঠিকানার প্রমাণ (ভোটার/আধার)',
        name_hi: 'पहचान व पता प्रमाण',
        icon: '🪪',
        details: 'Aadhaar, Voter ID, or PAN card copy.',
      },
      {
        id: 'khatian',
        name_en: 'Land Record / Crop Certificate',
        name_bn: 'জমির পরচা বা চাষের প্রমাণপত্র',
        name_hi: 'जमीन पर्चा या काश्तकार प्रमाण',
        icon: '📄',
        details: 'Land revenue slip (Khajna receipt) or village officer cultivation certificate.',
      },
      {
        id: 'photo',
        name_en: 'Passport Photographs',
        name_bn: 'পাসপোর্ট সাইজ ছবি',
        name_hi: 'पासपोर्ट फोटो',
        icon: '📷',
        details: 'Two recent color passport-sized photographs.',
      },
    ],
    officialUrl: 'https://agricoop.nic.in',
    lastUpdated: 'February 2025 (Active FY 2025-26)',
  },
];

export const PICTORIAL_CHECKLIST = [
  {
    id: 'voter',
    title_en: 'Voter ID (EPIC Card)',
    title_bn: 'ভোটার কার্ড (EPIC)',
    title_hi: 'वोटर कार्ड',
    description_en: 'Primary key for West Bengal Krishak Bandhu and BSB crop insurance status lookup.',
    description_bn: 'কৃষকবন্ধু ও বাংলা শস্য বীমায় স্ট্যাটাস যাচাইয়ের প্রধান নথি।',
    description_hi: 'कृषक बंधु और बांग्ला शस्य बीमा की स्थिति जांचने के लिए अनिवार्य।',
    icon: '🪪',
  },
  {
    id: 'khatian',
    title_en: 'Land Records / Khatian / Parcha',
    title_bn: 'খতিয়ান / পরচা (RoR)',
    title_hi: 'खतियान / पर्चा',
    description_en: 'Certified Land & Land Reforms record verifying cultivable acreage in Bighas/Acres.',
    description_bn: 'জমি ও ভূমি সংস্কার দপ্তরের সত্যায়িত পরচা যা বিঘা বা একরে জমির প্রমাণ দেয়।',
    description_hi: 'जमीन का सरकारी पर्चा जो खेती योग्य रकबे का सत्यापन करता है।',
    icon: '📄',
  },
  {
    id: 'aadhaar',
    title_en: 'Aadhaar Card (Mobile Linked)',
    title_bn: 'আধার কার্ড (মোবাইল লিঙ্কড)',
    title_hi: 'आधार कार्ड',
    description_en: 'Required for PM-KISAN e-KYC and biometric DBT subsidy verification.',
    description_bn: 'পিএম-কিষাণ ই-কেওয়াইসি এবং ব্যাংক ভর্তুকি স্থানান্তরের জন্য আবশ্যক।',
    description_hi: 'पीएम-किसान ई-केवाईसी और डीबीटी भुगतान के लिए आवश्यक।',
    icon: '🆔',
  },
  {
    id: 'bank',
    title_en: 'Bank Passbook with IFSC',
    title_bn: 'ব্যাংক পাসবই (IFSC কোড সহ)',
    title_hi: 'बैंक पासबुक',
    description_en: 'Single active bank account copy showing IFSC and clear account number.',
    description_bn: 'স্পষ্ট অ্যাকাউন্ট নম্বর এবং আইএফএসসি কোড সহ সক্রিয় ব্যাংক বই।',
    description_hi: 'आईएफएससी कोड और स्पष्ट खाता संख्या वाली पासबुक प्रति।',
    icon: '🏦',
  },
];

export const OFFICIAL_HELPLINES = [
  {
    name_en: 'National Kisan Call Centre (KCC)',
    name_bn: 'জাতীয় কিষাণ কল সেন্টার (KCC)',
    name_hi: 'राष्ट्रीय किसान कॉल सेंटर',
    number: '1800-180-1551',
    dial: '18001801551',
    timing: '6:00 AM – 10:00 PM (Daily, Toll-Free)',
    languages: 'Bengali, Hindi, English',
  },
  {
    name_en: 'West Bengal Agriculture Helpline',
    name_bn: 'পশ্চিমবঙ্গ কৃষি দপ্তর হেল্পলাইন',
    name_hi: 'पश्चिम बंगाल कृषि हेल्पलाइन',
    number: '033-2214-5555 / 1800-103-1000',
    dial: '03322145555',
    timing: '10:00 AM – 5:30 PM (Govt Working Days)',
    languages: 'Bengali, English',
  },
  {
    name_en: 'Bangla Shasya Bima Insurance Helpline',
    name_bn: 'বাংলা শস্য বীমা অভিযোগ ও সহায়তা',
    name_hi: 'बांग्ला शस्य बीमा सहायता',
    number: '1800-889-6888',
    dial: '18008896888',
    timing: '24x7 Toll-Free Crop Loss Reporting',
    languages: 'Bengali, Hindi, English',
  },
];
