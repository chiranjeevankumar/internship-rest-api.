# Security Checklist & Protections Document

> **Project**: Internship REST API & Secure Application Integration  
> **Milestone**: Milestone 3 + Secure Application Integration  
> **Repository**: [https://github.com/chiranjeevankumar/internship-rest-api](https://github.com/chiranjeevankumar/internship-rest-api)

This document details the security architecture, privacy protections implemented, and security verification results for the Internship REST API service.

---

## 🛡️ Implemented Security Controls

### 1. Applicant Privacy Protection (`GET /api/applications`)
- **Protected Access**: To prevent public harvesting of applicant personal identifiable information (PII) including names, email addresses, and cover letters, `GET /api/applications` requires valid admin authorization via the `x-admin-key` or `Authorization: Bearer <KEY>` header.
- **Unauthorized Rejection**: Unauthenticated public requests to `GET /api/applications` are rejected immediately with `401 Unauthorized`.
- **Public Submissions**: `POST /api/applications` remains publicly accessible for job applicants while enforcing strict rate limiting and field validations.

### 2. Express Rate Limiting (`express-rate-limit`)
- **General API Limiter**: Applied across all `/api/*` routes. Limits IP requests to `100` requests per 15-minute window to mitigate brute-force and Denial-of-Service (DoS) attacks.
- **Application Submission Limiter**: Dedicated strict rate limit on `POST /api/applications` allowing a maximum of `5` submissions per 15-minute window per IP to prevent spam and resource exhaustion.

### 3. HTTP Security Headers (`helmet`)
- Helmet middleware sets defensive HTTP response headers:
  - `X-Content-Type-Options: nosniff` (Prevents MIME-type sniffing)
  - `X-Frame-Options: SAMEORIGIN` (Protects against clickjacking)
  - `Strict-Transport-Security` (Enforces HTTPS connection)
  - `X-DNS-Prefetch-Control: off`
  - `Referrer-Policy: no-referrer`

### 4. Cross-Origin Resource Sharing (CORS) Control
- Express `cors` middleware explicitly restricts origins based on the `CLIENT_ORIGIN` environment variable.
- In production, wildcard (`*`) origins are disallowed by default. Production deployments require explicitly listing approved frontend domain origins.
- Restricts allowed HTTP methods to `GET`, `POST`, `PUT`, `DELETE` and allowed headers to `Content-Type`, `Authorization`, and `x-admin-key`.

### 5. SQL Injection Protection (Parameterized Queries)
- **100% Parameterized SQL**: All SQLite database operations use prepared statements via `better-sqlite3` (`db.prepare(...)`).
- User input is bound securely as parameters (`?`), eliminating raw string concatenation and SQL injection vulnerabilities.

### 6. Dual-Layer Input Validation & Data Normalization
- **Server-Side Validation**:
  - `POST /api/applications`: Validates `applicantName` (2–100 chars), `email` (strict regex format, max 100 chars), `coverLetter` (20–2000 chars), and existence of `internshipId`.
  - `POST /api/internships`: Server auto-generates IDs (`INT-XXX`). Rejects client-supplied IDs with `400 Bad Request` to prevent ID spoofing.
  - Enforces `openings > 0` as a positive integer.
  - `description`: Validated string (minimum 5 chars).
- **Client-Side Validation**: Real-time validation feedback in React UI prevents malformed submissions and accidental double-clicks.

### 7. Database Integrity & Foreign Key Constraints
- SQLite foreign key checks enabled (`PRAGMA foreign_keys = ON`).
- `applications.internship_id` references `internships.id` with `ON DELETE CASCADE`.
- Submitting an application for a non-existent internship ID triggers a `404 Not Found` rejection before database insertion.

### 8. Centralized Error Masking & Production Diagnostics
- Centralized Express error handler (`src/middleware/errorHandler.ts`) and database controllers log detailed diagnostic errors to server logs while returning generic error messages in production mode (`process.env.NODE_ENV === 'production'`).
- Internal stack traces, raw SQL constraint dumps, and secrets are never exposed to API clients.

---

## 📋 Security Verification Matrix

| Protection Feature | Implementation Location | Verification Method | Status |
| :--- | :--- | :--- | :---: |
| **Applicant Privacy Protection** | `src/controllers/applicationController.ts` | `401 Unauthorized` without admin key | ✅ PASSED |
| **Production Error Masking** | `src/middleware/errorHandler.ts` | Omission of stack traces in prod mode | ✅ PASSED |
| **Strict CORS Origin Policy** | `src/app.ts` | Explicit `CLIENT_ORIGIN` matching | ✅ PASSED |
| **SQL Injection Defense** | `src/controllers/*.ts` | Prepared statements (`db.prepare`) | ✅ PASSED |
| **Server Input Validation** | `src/middleware/validate*.ts` | Automated Vitest tests | ✅ PASSED |
| **Application Rate Limiting** | `src/app.ts` | `express-rate-limit` middleware | ✅ PASSED |
| **Helmet Security Headers** | `src/app.ts` | `helmet()` middleware | ✅ PASSED |
| **Foreign Key Constraints** | `src/db/database.ts` | SQLite `PRAGMA foreign_keys = ON` | ✅ PASSED |

---

## 🔮 Future Security Enhancements & Roadmap

1. **JWT Authentication**: Upgrade admin key authorization to short-lived JSON Web Tokens (JWT) or OAuth 2.0.
2. **CAPTCHA Integration**: Implement reCAPTCHA / Turnstile on public application forms for additional automated bot defense.
3. **HTTPS / TLS Termination**: In production, terminate TLS via reverse proxy (Nginx / Cloudflare) to ensure all traffic is encrypted in transit.
