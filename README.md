# KRISHIBONDHU (কৃষিবন্ধু / कृषिबंधु)
### Production-Grade Agritech & Farmer Intelligence Platform for West Bengal & Rural India

[![Live Production](https://img.shields.io/badge/Live%20Deployment-Vercel-emerald.svg)](https://krishibondhu-tan.vercel.app)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.1.12-black.svg)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0.0-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Vitest-34%20Passing-brightgreen.svg)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-Apache%202.0-yellow.svg)](LICENSE)

**Target Application**: [https://krishibondhu-tan.vercel.app](https://krishibondhu-tan.vercel.app)  
**Repository**: [https://github.com/asmon31148-spec/KRISHIBONDHU](https://github.com/asmon31148-spec/KRISHIBONDHU)

**KRISHIBONDHU** is a zero-mock, production-grade Progressive Web App (PWA) and AI agronomist platform engineered specifically for smallholder and marginal farmers in West Bengal and rural India. It delivers real-time APMC Mandi rates, ICAR & BCKV scientific fertilizer calculations, multimodal leaf disease diagnosis, actionable voice-guided weather directives, and direct government scheme navigation on low-end Android mobile devices and slow rural 2G/3G connections.

---

## 🌾 Core Product Philosophy & Non-Negotiables

1. **Strictly Zero Mock Data**: No hardcoded dummy arrays, simulated graphs, or placeholder prices. Every metric queries the database or official live APIs directly. If data is unavailable (e.g., APMC closed on Sundays), an honest status message is displayed (*"Mandi Closed / Awaiting Daily Upload"*).
2. **Native Regional Agronomy & Land Units**: Strictly follows West Bengal land measurement standards:
   - **$1\text{ Bigha} = 20\text{ Katha} = 0.3305785\text{ Acres} = 0.1338\text{ Hectares}$**
   - **$1\text{ Acre} \approx 3.025\text{ Bigha}$**
   - Quantities rendered in local vernacular units (Bigha, Katha, Acres, kg, quintals).
3. **Honest AI Confidence & Escalation**: Speculative or low-confidence (< 50%) plant disease diagnoses are explicitly flagged as uncertain, guiding the farmer to retake the photo or seek physical inspection at their local Krishi Vigyan Kendra (KVK).
4. **Zero Client Secrets**: All external API keys (`DATA_GOV_IN_API_KEY`, `GEMINI_API_KEY`, `GROQ_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) reside exclusively in server-side environment variables.
5. **PostgreSQL Row-Level Security (RLS)**: Enforced across all Supabase tables (`profiles`, `farms`, `crops`, `soil_tests`, `crop_scans`, `chat_conversations`, `yield_predictions`, `news_bookmarks`). Tenant cross-contamination is mathematically impossible.
6. **Triple-Language Native i18n**: Fully translated across English, Bengali (`বাংলা`), and Hindi (`हिन्दी`) without fragile third-party translation widgets.
7. **High Sunlight Rural Accessibility (WCAG AA)**: Designed for harsh outdoor glare with `#FAF9F5` warm cream backgrounds, `#081C15` high-contrast typography, `#1B4332` forest green accents, and minimum $48 \times 48\text{px}$ touch targets.

---

## 🚀 Key Modules & Capabilities

### 1. Real-Time Mandi Price Radar (`/mandi`)
* **Government of India Agmarknet Integration**: Backend route handler (`/api/mandi/prices`) connects to `data.gov.in` (`resource/9ef84268-d588-465a-a308-a864a43d0070`).
* **District & Commodity Filters**: Real-time arrival rates across all West Bengal districts (Hooghly, Burdwan, Nadia, Bankura, etc.) for essential commodities (Paddy, Potato, Jute, Mustard, Brinjal).
* **Transparent Local Units**: Displays Minimum, Maximum, and Modal prices in ₹/Quintal, converted automatically to **₹/kg** and **₹/50kg bag**.
* **Historical Trend Tracking**: Calculates daily market movements (🟢 Upward / 🔴 Downward / ⚪ Stable) using an inter-day price tracker cache.

### 2. Scientific Fertilizer Dosage Calculator (`/fertilizer`)
* **ICAR & BCKV Agronomy Engine**: Calibrated against published Bidhan Chandra Krishi Viswavidyalaya recommendations for West Bengal agro-climatic zones (Alluvial, Red, Laterite, Coastal Saline).
* **Crop Baselines**:
  * **Aman Paddy**: N:P:K = 80:40:40 kg/ha
  * **Boro Paddy**: N:P:K = 120:60:60 kg/ha
  * **Potato (Kufri Jyoti)**: N:P:K = 180:120:120 kg/ha + 20t FYM
  * **Mustard**: N:P:K = 60:30:30 kg/ha
  * **Jute (Tossa)**: N:P:K = 60:30:30 kg/ha
* **Strategy Selection**: Switch between **Option A** (Urea + SSP + MOP) and **Option B** (DAP + Urea + MOP) with exact 50kg bag counts, split application timelines (Basal, 1st Top Dressing, 2nd Top Dressing), and money saved estimates.
* *Benchmark verified*: 1 Bigha Aman Paddy yields exactly **23.3 kg Urea, 33.5 kg SSP, and 8.9 kg MOP**.

### 3. Voice-First Walkie-Talkie Agronomy Assistant (`/assistant`)
* **Audio Walkie-Talkie Component** (`WalkieTalkie.tsx`): WhatsApp-style pulsing mic button with press-and-hold or tap-to-talk modes.
* **Multilingual Speech-to-Text**: Native browser speech recognition dynamically bound to `bn-IN`, `hi-IN`, and `en-IN`.
* **Automatic Voice Playback**: Integrated Text-to-Speech (`window.speechSynthesis`) automatically reads AI agronomic responses aloud in Bengali and Hindi with pause, resume, and replay controls.
* **Colloquial Dialect Grounding**: Constrained system prompt enforces respectful colloquial Bengali (চলতি বাংলা) and Hindi, common rural terminology (ইউরিয়া, পটাশ, নাবধসা, মাজরা পোকা), and maximum 3 actionable bulleted steps.
* **Multimodal Leaf Upload**: Direct camera or gallery attachment for instant conversational pathology.

### 4. Actionable Weather Directives with Voice Alerts (`/weather`)
* **Deterministic Agro-Meteorology Engine**:
  * **Spray Window**: Wind $< 15\text{ km/h}$ & Rain $< 10\% \implies$ 🟢 *স্প্রে করার উপযুক্ত সময়* (Safe to Spray); else 🔴 *স্প্রে করবেন না*.
  * **Irrigation Directive**: $\ge 25\text{ mm}$ expected rain in 72h $\implies$ *সেচ বন্ধ রাখুন*.
  * **Late Blight Alert**: Relative Humidity $\ge 80\%$ + Temp $13^\circ\text{C}-25^\circ\text{C} \implies$ ⚠️ *আলুর নাবধসা রোগের ঝুঁকি*.
* **One-Touch Audio Readouts**: Speaker buttons speak advisories aloud in Bengali or Hindi.
* **GPS & District Selectors**: Instant coordinates acquisition or manual selection across all 23 West Bengal districts.

### 5. Government Schemes & Helplines Navigator (`/schemes`)
* **Verified State & Central Repositories**:
  * **Bangla Shasya Bima (BSB)**: Zero-premium state crop insurance cutoff dates, eligibility, and claim workflows.
  * **Krishak Bandhu**: ₹10,000/year seasonal assistance (pro-rata for $\ge 1$ acre) + ₹2 Lakh death insurance.
  * **PM-KISAN**: ₹6,000/year DBT installment verification.
  * **Kisan Credit Card (KCC)**: 4% subsidized interest rate borrowing protocols.
* **Interactive Pictorial Checklist**: Click-to-tick-off document tracking (Voter ID, Khatian/Parcha, Passbook, Aadhaar).
* **One-Touch Helpline Dialing**: Direct telephone links to the Kisan Call Centre (`1800-180-1551`) and West Bengal Agriculture Department (`033-2214-5555`).

### 6. AI Multimodal Crop Disease Scanner (`/scan`)
* **Client-Side Image Compression**: Automatically downscales 5 MB camera captures to ~250 KB WebP/JPEG before upload.
* **Binary Magic-Number Security**: Server-side inspection (`FF D8 FF`, `89 50 4E 47`, `RIFF/WEBP`) with an 8 MB cap.
* **Pathology Breakdown**: Detailed symptoms, disease confidence, CIBRC & BCKV certified remedies (cultural/organic first, followed by certified chemicals with Pre-Harvest Intervals).
* **Scan History**: Full scan logs with offline caching and printable report generation (`/scans/history`).

### 7. Farm, Crop & Soil Health Management (`/farms`, `/crops`, `/soil`)
* **Multi-Plot Land Records**: Register farms with vernacular land areas (Bigha, Katha, Acres), soil types, and GPS coordinates.
* **Sown Crop Tracking**: Monitor active varieties, sowing dates, irrigation sources, and real-time health statuses.
* **Soil Health Cards**: Enter certified laboratory parameters (N, P, K in kg/ha, pH scale, Organic Carbon %) to calibrate custom nutrient advice.

### 8. Empirical Yield Forecasting & Harvest Analytics (`/yield`, `/analytics`)
* **Yield Projection Model**: Transparent multi-factor multipliers adjusting baseline yields for soil nutrient adequacy, pH acidity, irrigation infrastructure, and disease lesions.
* **Harvest Tracking**: Record actual harvest results to compare against ICAR projections.
* **Visual Analytics**: Interactive Recharts graphs tracking disease frequency, acreage distribution, and historic yield performance.

### 9. Offline PWA & Mobile Ergonomics
* **Service Worker (`public/sw.js`)**: Caches UI shells, multilingual dictionaries (`bn.json`, `hi.json`), offline emergency numbers, and the complete Fertilizer Calculator algorithm for instant offline field access.
* **Mobile Navigation Drawer**: Elevated `z-[60]` layer stacking above the persistent bottom navigation bar with tactile drag handle, compact 2-column cards, and safe-area padding.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 15.1.12 (App Router, Server Actions & Route Handlers) |
| **Runtime & Language** | React 19, TypeScript 5, Node.js 20+ |
| **Styling & Design Tokens** | Tailwind CSS (Forest Green `#1B4332`, Leaf Green `#2D6A4F`, Warm Cream `#FAF9F5`, Amber `#D97706`) |
| **Database & Auth** | Supabase PostgreSQL with Row-Level Security (RLS) & SSR Cookie Auth |
| **AI Gateway** | Multi-provider fallback gateway (Google Gemini 1.5/2.0 Flash, Groq Llama 3) |
| **Public APIs** | Data.gov.in Agmarknet API, Open-Meteo Meteorology, Google News & PIB Feeds |
| **Audio & Speech** | Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) |
| **Data Visualization** | Recharts (Responsive SVG mobile charts) |
| **Testing** | Vitest (34 unit & integration test suites) |

---

## 💻 Local Setup & Development

### 1. Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **Supabase Account** (or run against local/setup diagnostics)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/asmon31148-spec/KRISHIBONDHU.git
cd KRISHIBONDHU

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your environment variables in `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Gateway Providers (Supply at least one)
GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key
OPENROUTER_API_KEY=your-openrouter-api-key

# Government of India Open Data Portal Key (Optional, default fallback provided)
DATA_GOV_IN_API_KEY=your-data-gov-in-api-key
```

### 4. Supabase Database Migration
Run the SQL migrations found in `supabase/migrations/` using the Supabase SQL Editor:
1. `supabase/migrations/20261122000000_initial_schema.sql` (Creates 13 tables, RLS policies, indexes, and triggers)
2. `supabase/migrations/20261122000001_storage_setup.sql` (Configures storage bucket for crop leaf uploads)

### 5. Running the Application
```bash
# Start development server
npm run dev

# Run automated Vitest test suite
npm test

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Automated Testing & Verification

The test suite covers unit and integration benchmarks across all 6 phases:
```bash
npm test
```

```
✓ src/__tests__/phase1.test.ts (8 tests)  # Unit conversions (Bigha/Katha), i18n, service diagnostics
✓ src/__tests__/phase2.test.ts (7 tests)  # ICAR fertilizer calculations, land math, split schedules
✓ src/__tests__/phase3.test.ts (4 tests)  # Multimodal scanner compression, magic-byte inspection
✓ src/__tests__/phase4.test.ts (4 tests)  # AI assistant grounding, dialect prompting, chemical safety
✓ src/__tests__/phase5.test.ts (5 tests)  # Weather advisory evaluation, spray windows, fungal alerts
✓ src/__tests__/phase6.test.ts (6 tests)  # Yield projection engine, soil multipliers, DPDP compliance

Test Files: 6 passed (6)
Tests:      34 passed (34)
```

---

## 🔒 Security & Privacy

* **Tenant Isolation**: PostgreSQL Row-Level Security (RLS) policies guarantee that farmers can only view and modify their own records.
* **Upload Sanitization**: Server-side binary inspection verifies JPEG/PNG/WebP magic bytes; SVG and executable file types are rejected.
* **DPDP Data Rights**: Full compliance with India's Digital Personal Data Protection (DPDP) Act. Farmers can export their reports or trigger an irreversible, complete account data wipe from `/profile`.

---

## 📄 License
This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.
