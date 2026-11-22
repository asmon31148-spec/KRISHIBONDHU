# KRISHIBONDHU - Architectural Decisions & Design System

## 1. Product & Architecture Overview
- **Product Name**: KRISHIBONDHU (কৃষিবন্ধু / कृषिबंधु)
- **Target Audience**: Farmers in West Bengal and wider India, operating on low-end Android mobile devices and desktop systems with variable network conditions.
- **Core Principles**:
  1. **Strictly Real**: Zero fake/mock data. Honest empty states when data does not exist yet.
  2. **Real AI with Gateway Fallback**: Multimodal AI vision analysis and chat with strict structured outputs, fallback chains, confidence scores, and honest uncertainty reporting.
  3. **No Secrets in Client**: All API keys, service roles, and provider keys reside in server environment variables.
  4. **Strict Security**: Supabase Row-Level Security (RLS) on all user data tables, input validation with Zod, MIME & file signature verification for uploads.
  5. **Triple-Language First-Class i18n**: English, Bengali (বাংলা), and Hindi (हिन्दी) without machine widgets.

## 2. Technology Stack
- **Framework**: Next.js 15 (App Router) + React 19 / TypeScript 5
- **Styling**: Tailwind CSS with custom semantic design tokens (Forest Green, Leaf Green, Warm Cream, Harvest Amber, Deep Dark Green)
- **Icons**: Lucide React
- **Backend & Database**: Next.js Server Route Handlers + Supabase PostgreSQL with RLS, Auth, and Storage
- **Data Validation**: Zod (Client-side & Server-side runtime safety)
- **Internationalization**: Strongly typed custom i18n provider (`en`, `bn`, `hi`) supporting dictionary namespaces, parameter interpolation, and font switching.
- **Weather Provider**: Open-Meteo (Real meteorological data, free tier, no API key required, 30m server-side caching).
- **AI Gateway**: Unified server-side router with provider adapters (Gemini, Groq, OpenRouter) and automatic failover.
- **Charts & Visualizations**: Recharts
- **Testing**: Vitest for unit/integration tests and API route verification.

## 3. Design Tokens & Visual Language
- **Backgrounds**:
  - `bg-cream-50`: `#FAF9F5` (Warm Cream Canvas)
  - `bg-cream-100`: `#F3F1E7` (Subtle Card Surface)
  - `bg-cream-200`: `#E8E5D8` (Divider & Border Warm Slate)
- **Greens (Brand & Structure)**:
  - `brand-forest`: `#1B4332` (Anchor Header / Primary Accent)
  - `brand-dark`: `#081C15` (High-contrast Body Text & Dark Elements)
  - `brand-leaf`: `#2D6A4F` (Interactive Buttons & Highlights)
  - `brand-accent`: `#40916C` (Focus & Active States)
  - `brand-mint`: `#D8F3DC` (Success Badges & Soft Tints)
- **Warm Harvest Accent**:
  - `brand-amber`: `#D97706` (Turmeric / Harvest Gold for alerts & primary action highlights)
  - `brand-amber-light`: `#FEF3C7` (Warning & Advisory Badge backgrounds)
- **Typography Scale**:
  - English: Inter / Outfit
  - Bengali: 'Noto Sans Bengali', 'Hind Siliguri', sans-serif
  - Hindi: 'Noto Sans Devanagari', sans-serif

## 4. Database Schema Strategy (Supabase PostgreSQL)
All user tables enforce RLS with `auth.uid() = user_id`:
1. `profiles`: Farmer profile, preferred language, state, district, village, location coords, primary crops.
2. `farms`: Farm units, acreage, land unit (acres, bigha, katha, hectares), soil classification, coordinates.
3. `crops`: Active and historical crop records tied to farms, planting date, expected harvest date, health status, irrigation type.
4. `soil_records`: Manual soil test logs (N, P, K in kg/ha, pH, organic carbon %, test date). Never fabricated from GPS.
5. `crop_scans`: Scanned crop imagery, detected disease, confidence percentage, severity level, symptoms, recommendations, weather context at scan time.
6. `chat_conversations` & `chat_messages`: Multi-turn agronomy chats, supports image attachments and audio transcript references.
7. `yield_predictions`: Documented baseline-adjusted yield estimates, factor weights, estimated vs actual harvest yields.
8. `weather_cache`: Geospatial weather cache (30m TTL) to minimize redundant external calls.
9. `notifications`: In-app farmer advisories driven by real weather thresholds, disease warnings, or user reminders.
10. `sensor_devices` & `sensor_readings`: IoT-ready schema with device API tokens for future hardware telemetry.
11. `news_bookmarks`: Farmer bookmarked real agricultural news items.

## 5. Empirical Yield Prediction Methodology
- Rather than a black-box AI model inventing yield numbers, KRISHIBONDHU utilizes an empirical agronomic model calibrated against published Indian Council of Agricultural Research (ICAR) & Bidhan Chandra Krishi Viswavidyalaya (BCKV) regional crop baselines:
  - Rice Aman: 2.1 tons/acre (range 1.6 - 2.6)
  - Rice Boro: 2.5 tons/acre (range 2.0 - 3.1)
  - Potato (Kufri Jyoti): 10.5 tons/acre (range 8.5 - 13.0)
  - Jute (Tossa): 1.25 tons/acre (range 1.0 - 1.5)
  - Mustard: 0.70 tons/acre (range 0.5 - 0.95)
  - Brinjal: 9.0 tons/acre (range 7.0 - 12.0)
  - Tomato: 10.0 tons/acre (range 8.0 - 13.5)
  - Wheat: 1.5 tons/acre (range 1.2 - 1.9)
- Adjustment Multipliers:
  - Crop Health: Healthy (1.00), Needs Attention (0.85), Diseased (0.68)
  - Irrigation: Drip (1.15), Sprinkler (1.08), Shallow/Deep Tube Well (1.04), Rainfed (0.88)
  - Soil N-P-K: Suboptimal nitrogen (< 240 kg/ha) applies a 0.92 multiplier; balanced (280-500 kg/ha) applies 1.06.
  - Soil pH: Optimal (6.2-7.4) applies 1.03; acidic (< 5.8) applies 0.92; alkaline (> 8.0) applies 0.94.
- Regional Land Standards:
  - 1 Bigha = 20 Katha = 0.3305785 Acres (1 Acre ≈ 3.025 Bigha).

## 6. Security, Performance & Accessibility Architecture
- **Zero Frontend Secrets**: API keys (`GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are kept on the server only.
- **Server File Signature Validation**: In `/api/scan/analyze`, images are checked against magic numbers (`0xFF 0xD8 0xFF` for JPEG, `0x89 0x50 0x4E 0x47` for PNG, `RIFF/WEBP` for WebP). Spoofed file extensions and executable files are rejected.
- **Client Canvas Compression**: Images captured on mobile devices are downscaled to 1600px max dimension and 85% quality via HTML5 canvas before upload, saving bandwidth and preventing memory exhaustion.
- **Accessibility (WCAG AA)**:
  - High contrast ratio: Near-black green text `#081C15` on warm cream `#FAF9F5` (exceeds 14:1 contrast, far above WCAG AA 4.5:1 requirement).
  - Minimum 44px mobile touch targets on buttons, inputs, and selectors.
  - Respects `prefers-reduced-motion` media queries.
  - Screen reader accessible `aria-label` tags and focus rings.
- **PWA & Offline Readiness**:
  - Full Web App Manifest (`public/manifest.json`), responsive viewports, SVG app icons.
  - In-memory 30m weather cache and 1h news cache to eliminate repetitive external traffic.
