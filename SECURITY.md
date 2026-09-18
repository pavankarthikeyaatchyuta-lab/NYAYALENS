# Security Policy & Responsible AI Architecture

## 1. Security Overview
NyayaLens processes sensitive legal documents including employment contracts, leases, and non-disclosure agreements. Maintaining the privacy, integrity, and confidentiality of user documents is foundational to the platform architecture.

## 2. Supported Versions
| Version | Supported |
| :--- | :--- |
| 0.1.x (Current) | :white_check_mark: |

## 3. Data Privacy & Confidentiality
- **Ephemeral Document Parsing**: Document texts uploaded for ephemeral analysis are processed in memory and not retained on public storage.
- **Zero Model Retraining**: Document data sent to the Google Gemini API is transmitted via enterprise API endpoints that do not train on customer inputs.
- **Client-Side Secret Isolation**: All API credentials (`GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are strictly executed in secure server-side environments (`/api/*`). No private keys are exposed to the browser.
- **Row-Level Security (RLS)**: Cloud database tables enforce PostgreSQL Row-Level Security policies to prevent unauthorized cross-tenant data access.

## 4. Prompt Injection & Adversarial Defenses
- **Input Sanitization**: All contract inputs pass through regex and unicode sanitization filters to strip script tags, null bytes, and non-printable control characters.
- **Prompt Isolation**: System instructions strictly enforce document-grounded context windows and refuse instructions attempting to override system behaviors or exfiltrate environment variables.

## 5. HTTP Security Headers
The application enforces standard security headers in production:
- `Strict-Transport-Security`: HSTS enforced with subdomains preloaded.
- `X-Frame-Options: DENY`: Full protection against clickjacking.
- `X-Content-Type-Options: nosniff`: Prevents MIME-type sniffing attacks.
- `Referrer-Policy: strict-origin-when-cross-origin`: Controls referral leakage.
- `Permissions-Policy`: Restricts camera, microphone, and geolocation hardware access.

## 6. Reporting a Vulnerability
If you discover a potential security vulnerability in NyayaLens, please report it privately:
- **Email**: security@nyayalens.dev (or via GitHub Private Vulnerability Reporting)
- **Response Time**: We acknowledge reports within 24 hours and aim to resolve confirmed issues promptly.
