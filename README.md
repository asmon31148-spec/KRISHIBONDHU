# KRISHIBONDHU (কৃষিবন্ধু / कृषिबंधু)
### AI-Powered Smart Agriculture and Farmer Assistance Platform

A production-grade, commercial-quality web application and Progressive Web App (PWA) designed specifically for farmers across West Bengal and India. Built to deliver reliable agronomy assistance, disease diagnostics, weather advisories, soil health management, and empirical yield forecasting on low-end Android mobile devices and slow rural networks.

---

## 🌾 Core Product Philosophy & Non-Negotiables

1. **Strictly Real — Zero Mock Data**: No fake dashboard numbers, simulated graphs, or placeholder cards. Every metric queries the database directly or renders an honest, helpful empty state with call-to-actions.
2. **Honest AI Uncertainty**: Speculative or low-confidence (< 50%) plant disease diagnoses are explicitly flagged as uncertain, guiding the farmer to retake the photo or seek physical inspection at the local Krishi Vigyan Kendra (KVK).
3. **Zero Secrets in Client**: All multimodal vision and LLM API keys (`GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are isolated strictly on the server.
4. **PostgreSQL Row-Level Security (RLS)**: Enforced across all user data tables (`profiles`, `farms`, `crops`, `soil_tests`, `crop_scans`, `chat_conversations`, `yield_predictions`, `news_bookmarks`). Tenant cross-contamination is mathematically impossible.
5. **No Dead Buttons**: Every button, link, and interactive element executes an active function, opens a modal, or updates state.
6. **Triple-Language Native i18n**: Fully translated across English, Bengali (`বাংলা`), and Hindi (`हिन्दी`) without third-party machine translation widgets.
7. **Empirical Agronomy Baselines**: Yield forecasts are grounded in transparent, published Indian Council of Agricultural Research (ICAR) and Bidhan Chandra Krishi Viswavidyalaya (BCKV) research.
8. **Regional Land Standards**: Native support for West Bengal land measurements:
   - `1 Bigha = 20 Katha = 0.3305785 Acres` (`1 Acre ≈ 3.025 Bigha`).

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router, Server Actions & Route Handlers) |
| **Runtime & Language** | React 19, TypeScript 5, Node.js 20+ |
| **Styling & Tokens** | Tailwind CSS (Forest Green `#1B4332`, Leaf Green `#2D6A4F`, Warm Cream `#FAF9F5`, Harvest Amber `#D97706`) |
| **Database & Auth** | Supabase PostgreSQL with Row-Level Security (RLS) & SSR Cookie Auth |
| **AI Gateway** | Server-side multi-provider gateway (Google Gemini 1.5/2.0, Groq Llama 3, OpenRouter) |
| **Weather Engine** | Open-Meteo REST API (Real meteorology, 30-min server cache, no API key required) |
| **Data Visualization** | Recharts (Responsive SVG charts for mobile & desktop) |
| **Validation** | Zod (Runtime schema enforcement for forms, uploads, and APIs) |
| **Testing** | Vitest (38 unit & integration test cases across 7 suites) |

---

## 🚀 Key Features by Phase

### Phase 1: Foundation, Design System, Database & Auth
- **Tailwind Design System**: Accessible contrast (WCAG AA), responsive layouts, and custom tokens.
- **PostgreSQL Database Schema**: 13 tables with RLS policies, indexes, and triggers (`supabase/migrations/`).
- **Triple-Language i18n**: Strongly typed translations in `en.json`, `bn.json`, `hi.json` with language switcher.
- **Graceful Diagnostics**: `/setup` page and `/api/system/status` inspect connectivity without crashing.
- **Supabase Authentication**: Signup, Login, Password Reset, and 3-step Farmer Onboarding.
- **Guest Mode**: Try core features without registering; convert to a saved account via `GuestSavePrompt`.

### Phase 2: Farmer Farm, Crop & Soil Health Hub
- **Farmer Dashboard (`/dashboard`)**: Live summary of plots, active crops, crop conditions, and quick actions.
- **Farms CRUD (`/farms`)**: Multi-plot tracking with Bigha, Katha, Acres, and GPS coordinates.
- **Crops CRUD (`/crops`)**: Tracking sown crops, varieties, irrigation types, and health states.
- **Soil Health Section (`/soil`)**: Manual entry of certified Soil Health Card (SHC) laboratory tests with ICAR fertility ratings (N, P, K in kg/ha, pH scale, organic carbon %).
- **Farmer Profile & Privacy (`/profile`)**: Update details, switch language, change password, or execute a DPDP-compliant full account data wipe.

### Phase 3: AI Multimodal Crop Disease Scanner
- **Camera & Upload (`/scan`)**: Real-time canvas compression downscaling 5 MB images to ~250 KB WebP/JPEG.
- **File Upload Security (`/api/scan/analyze`)**: Server-side binary magic-number validation (`FF D8 FF`, `89 50 4E 47`, `RIFF/WEBP`) and 8 MB cap.
- **Honest Diagnostic View**: 3-tab layout covering Symptoms, AI Pathology Explanation, and Recommended Remedies (organic/cultural first, certified chemicals with safety equipment and pre-harvest interval disclaimers).
- **Scan History & Reports (`/scans/history`)**: Filter by disease severity, view past scans, and export printable reports.

### Phase 4: Vernacular Agronomy Assistant
- **Vernacular Chat (`/assistant`)**: Conversational agronomy in Bengali, Hindi, and English.
- **Personalized Context**: Authenticated farmer's cultivated crops, district, and soil type are automatically injected into system prompt.
- **Voice Controls**: Browser Speech-to-Text (`SpeechRecognition`) for `bn-IN`, `hi-IN`, `en-IN`, and Text-to-Speech (`speechSynthesis`).
- **Multimodal Chat Upload**: Attach crop photos directly within the conversation thread.

### Phase 5: Weather, News & Agronomic Warnings
- **Live Weather (`/weather`)**: Open-Meteo integration for all West Bengal districts and GPS geolocation with 30-min server cache.
- **3 Agronomic Insights**:
  1. *Pesticide Spray Window*: Wind velocity (< 15 km/h) and rain check.
  2. *Irrigation Guidance*: 72-hour cumulative precipitation forecast check.
  3. *Late Blight / Fungal Alert*: Relative humidity > 85% + temperature 14-23°C.
- **Agriculture News (`/news`)**: Official PIB and ICAR dispatches with search, category filtering, and personal bookmarks.
- **Notification Center (`/dashboard/notifications`)**: Triggered strictly by evaluated weather alerts and farm events.

### Phase 6: Empirical Yield Prediction & Analytics
- **Yield Projection Tool (`/yield`)**: Empirical model calibrated with ICAR baselines, adjusting for health, irrigation, N-P-K, and pH. Outputs in tons/acre, tons/bigha, and kg/katha.
- **Actual Harvest Tracking (`/api/yield/actual`)**: Record actual yields to compare against projections.
- **Visual Analytics Dashboard (`/analytics`)**: Interactive Recharts graphs showing crop disease distribution, acreage breakdown, and predicted vs actual yields.

### Phase 7: Security Audit, Accessibility & Testing
- **Security Audit (`SECURITY.md`)**: Documented RLS policies, header hardening, upload validation, and tenant isolation.
- **38 Automated Tests**: Verified through Vitest across 7 test suites.
- **Accessibility**: Screen reader labels, focus visible styling, minimum 44px touch targets, and `prefers-reduced-motion` compliance.

---

## 💻 Local Setup & Development

### 1. Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **Supabase Account** (optional for local mock/setup diagnostics)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-org/agreeculture.git
cd agreeculture

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in the required keys in `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Gateway Providers (Supply at least one)
GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key
OPENROUTER_API_KEY=your-openrouter-api-key
```

> **Note**: Even without active API keys, the application boots cleanly and displays clear setup guidance on the `/setup` page.

### 4. Supabase Database Migration
Execute the SQL migrations found in `supabase/migrations/` using the Supabase SQL Editor:
1. `supabase/migrations/20261122000000_initial_schema.sql` (Creates 13 tables, RLS policies, indexes, and triggers)
2. `supabase/migrations/20261122000001_storage_setup.sql` (Creates storage bucket for crop scan uploads)

### 5. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Running Automated Tests

Run the full Vitest suite (38 passing tests):
```bash
npm test
```

Run test suite with watch mode:
```bash
npm run test:watch
```

Run production build verification:
```bash
npm run build
```

---

## 🔒 Security & Privacy

- **Tenant Isolation**: Handled at the database engine level via PostgreSQL RLS.
- **Upload Integrity**: All uploads undergo magic-number byte inspection on the server.
- **Data Subject Rights**: Farmers can update details, export reports, or delete their entire account and associated records immediately from `/profile`.

For more details, review [SECURITY.md](SECURITY.md) and [DECISIONS.md](DECISIONS.md).

---

## 📄 License
This project is licensed under the Apache 2.0 License.
