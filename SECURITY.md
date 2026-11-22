# KRISHIBONDHU - Security Architecture & Threat Model

This document outlines the security controls, cryptographic measures, tenant isolation models, and safe data governance practices implemented across the **KRISHIBONDHU** platform.

---

## 1. Zero Frontend Secrets Policy
- **Absolute Key Isolation**: No private API keys or elevated credentials are ever exposed to the client browser or bundled into client-side JavaScript.
  - `GEMINI_API_KEY`, `GROQ_API_KEY`, and `OPENROUTER_API_KEY` are only read within Next.js Node.js server route handlers (`/api/...`).
  - `SUPABASE_SERVICE_ROLE_KEY` is strictly confined to server-side maintenance and never exposed to the client.
  - The client bundle ONLY contains:
    - `NEXT_PUBLIC_SUPABASE_URL` (Public API gateway)
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Subject to PostgreSQL Row-Level Security)
- **Automated Verification**: Test suites in `src/__tests__/security.test.ts` continuously verify that no forbidden keys carry the `NEXT_PUBLIC_` prefix.

---

## 2. PostgreSQL Row-Level Security (RLS) & Multi-Tenant Isolation
All tables storing farmer data enforce PostgreSQL Row-Level Security (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`).

| Table Name | RLS Enabled | Read Policy | Write/Update Policy | Delete Policy |
| :--- | :--- | :--- | :--- | :--- |
| `profiles` | YES | `auth.uid() = id` | `auth.uid() = id` | `auth.uid() = id` |
| `farms` | YES | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| `crops` | YES | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| `soil_tests` | YES | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| `crop_scans` | YES | `auth.uid() = user_id` OR `guest_token = ...` | `auth.uid() = user_id` OR `guest_token = ...` | `auth.uid() = user_id` |
| `chat_conversations` | YES | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| `chat_messages` | YES | `conversation_id IN (farmer's convos)` | `conversation_id IN (farmer's convos)` | `conversation_id IN (farmer's convos)` |
| `yield_predictions` | YES | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| `news_bookmarks` | YES | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| `notifications` | YES | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| `feedback_reports` | YES | Admin read only | Authenticated or Guest Insert | Admin only |

### Security Guarantees:
1. **Tenant Cross-Contamination Impossible**: Even if a malicious actor modifies their client JWT to request `user_id = 'victim-uuid'`, PostgreSQL evaluates `auth.uid() = user_id` at the database kernel level and returns an empty dataset or rejects mutation with `403 Forbidden`.
2. **Guest Token Partitioning**: Unauthenticated farmers operate on a cryptographically randomized `guest_token` (UUID v4) stored in local session storage. Scans linked to that token can only be retrieved by presenting the exact token.

---

## 3. Server-Side File Upload & Magic Number Signature Validation
Attackers frequently attempt to upload malicious PHP scripts, shellcodes, or executable binaries renamed to `.jpg` or `.png`.

- **Strict Magic Number Verification**:
  In `/api/scan/analyze/route.ts`, the file buffer is inspected by reading its initial bytes directly:
  - **JPEG**: Initial 3 bytes must equal `0xFF 0xD8 0xFF`.
  - **PNG**: Initial 8 bytes must equal `0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A`.
  - **WebP**: Bytes 0-3 must equal `RIFF` (`0x52 0x49 0x46 0x46`) and bytes 8-11 must equal `WEBP` (`0x57 0x45 0x42 0x50`).
- **Rejection**: Any payload not matching these exact binary signatures is immediately rejected with HTTP 400 (`Invalid file type. Only authentic JPEG, PNG, and WebP images are permitted.`).
- **File Size Cap**: Strict 8 MB hard limit enforced on server buffer processing.
- **Client Compression**: Before network transmission, images captured by mobile cameras are downscaled via an HTML5 canvas to a max dimension of 1600px and 85% quality, reducing typical 5 MB files to ~250 KB, preventing DoS attacks on server memory.

---

## 4. HTTP Security Headers
Configured via `next.config.ts`:
- **`X-Frame-Options: DENY`**: Eliminates Clickjacking attacks by prohibiting embedding within foreign `<iframe>` elements.
- **`X-Content-Type-Options: nosniff`**: Prevents MIME-type sniffing attacks.
- **`Referrer-Policy: strict-origin-when-cross-origin`**: Ensures path components and tokens are stripped from external referrers.
- **`X-XSS-Protection: 1; mode=block`**: Activates legacy browser XSS filters.
- **`Permissions-Policy: camera=(self), microphone=(self), geolocation=(self)`**: Restricts camera, microphone, and geolocation access exclusively to first-party origins.

---

## 5. Agronomic Safety & Chemical Disclaimer Controls
- **Pesticide Safety Protection**:
  All chemical control recommendations automatically append mandatory safety disclaimers:
  - Wearing protective masks, eye goggles, and rubber gloves.
  - Observing the Pre-Harvest Interval (PHI) waiting period before harvest.
  - Explicit warning never to spray chemicals during high winds (> 15 km/h) or within 30 meters of drinking water bodies.
- **Honest AI Uncertainty**:
  If the multimodal vision model reports confidence < 50% or if an image lacks clear plant pathology, the platform never provides a speculative diagnosis. Instead, it triggers an Honest Uncertainty warning advising the farmer to retake the photo or visit the nearest Krishi Vigyan Kendra (KVK).

---

## 6. Vulnerability Disclosure & Reporting
If you discover a potential security vulnerability within the KRISHIBONDHU codebase or infrastructure, please contact:
- **Email**: `security@krishibondhu.org`
- **Response SLA**: 48 hours for triage and acknowledgment.
