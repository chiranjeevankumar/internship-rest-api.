# Production-Ready Internship REST API & Portal Capstone

> **Student Name**: Chiranjeevan Kumar  
> **GitHub Repository**: [https://github.com/chiranjeevankumar/internship-rest-api](https://github.com/chiranjeevankumar/internship-rest-api)  
> **Evidence Document**: [`CAPSTONE_EVIDENCE.md`](./CAPSTONE_EVIDENCE.md) | **Security Checklist**: [`SECURITY_CHECKLIST.md`](./SECURITY_CHECKLIST.md)

A production-grade, full-stack RESTful web application built with **Node.js**, **Express.js**, **SQLite** (`better-sqlite3`), and **React** (Vite + Tailwind CSS). This project features internship postings CRUD, server-side pagination, search, domain/location filtering, job application submission, applicant privacy protection, Helmet security headers, strict CORS controls, Express rate limiting, and automated testing with **Vitest** and **Supertest**.

---

## 🌟 Key Features

- ⚡ **Full-Stack Architecture**: React 19 frontend (`src/App.tsx`) connected to Express REST API backend (`/api/*`) with configurable `VITE_API_BASE_URL`.
- 🗄️ **Persistent Relational Database**: SQLite persistent database (`data/internships.db`) with relational tables (`internships` and `applications`), foreign key enforcement (`PRAGMA foreign_keys = ON`), and WAL journal mode.
- 📝 **Validated Application Form**: Real-time client-side & server-side input validation (strict email regex, cover letter 20–2000 chars, name 2–100 chars), duplicate submission prevention, and application reference ID generation.
- 🔒 **Applicant Privacy Protection**: `GET /api/applications` requires admin API key authorization (`x-admin-key` or `Authorization: Bearer <KEY>`). Unauthenticated requests are rejected with `401 Unauthorized`.
- 🛡️ **API Security Architecture**:
  - **Rate Limiting**: `express-rate-limit` protects general API routes (100 reqs/15m) and applies strict limits on application submissions (5 reqs/15m per IP).
  - **Helmet Security Headers**: Clickjacking, MIME-type sniffing, and XSS defense headers.
  - **Strict CORS Control**: Explicit allowed origin matching via `CLIENT_ORIGIN`. Wildcards disallowed in production mode.
  - **100% Parameterized SQL**: Prepared statements (`db.prepare(...)`) protect all database operations against SQL injection.
  - **Production Error Masking**: Internal stack traces and raw database errors are suppressed in production mode.
- 🌱 **Idempotent Seed Script**: Pre-seeded with 5 required initial internship records (`INT-101` to `INT-105`) with descriptions and skills array without duplication on server restart.
- 🆔 **Auto-Generated IDs**: Server auto-generates IDs (`INT-XXX` for internships, `APP-XXXX` for applications). Clients cannot supply custom IDs on creation.
- 🧪 **Automated Test Suite**: Vitest + Supertest integration testing running 25 automated tests against an isolated in-memory test database (`:memory:`) with genuine disk persistence tests.
- 🌐 **Interactive API Explorer**: Built-in Explorer UI served at `http://localhost:3000/` allowing live endpoint testing and viewing submitted applications.

---

## 💡 Engineering Decisions Explained

For beginners and reviewers, here is why key design decisions were made:

1. **Why SQLite (`better-sqlite3`)?**
   - SQLite stores data in a simple, portable file on disk without requiring complex database server setup.
   - `better-sqlite3` runs synchronously in Node.js, making database calls extremely fast (< 12ms) and preventing complex async callback race conditions.

2. **Why Parameterized SQL Queries (`db.prepare`)?**
   - Directly interpolating user strings into SQL commands allows malicious users to perform SQL Injection attacks.
   - Parameterized queries separate SQL code from user data, ensuring the database treats user input strictly as text values.

3. **Why Dual Validation (Client + Server)?**
   - Client validation gives instant, friendly feedback in the UI before sending a network request.
   - Server validation ensures security because attackers can bypass client code or send custom HTTP requests using cURL or Postman.

4. **Why Privacy Authorization for `GET /api/applications`?**
   - Applicants submit personal data (full name, email, cover letter). Exposing an open `GET` endpoint would allow web scrapers to harvest personal data.
   - Requiring `x-admin-key` ensures only authorized administrators can view applicant records.

5. **Why `app.set('trust proxy', 1)`?**
   - Modern cloud platforms (Cloud Run, Render, Heroku) run Express apps behind reverse proxy load balancers.
   - Enabling `trust proxy` allows Express and `express-rate-limit` to read the true client IP address from proxy headers without error.

---

## 🛠️ Tech Stack

- **Backend Framework**: Express.js (v4.x) on Node.js
- **Frontend Framework**: React 19 + Vite 8
- **Database**: SQLite3 via `better-sqlite3` driver
- **Styling & UI**: Tailwind CSS + Lucide React Icons
- **Security**: Helmet, CORS, Express Rate Limit
- **Language**: TypeScript / ES Modules (`tsx`)
- **Testing**: Vitest + Supertest

---

## 📁 Project Structure

```
internship-rest-api/
├── data/
│   └── internships.db          # SQLite persistent database file
├── src/
│   ├── app.ts                  # Express app setup, Helmet, CORS, Rate Limiters
│   ├── App.tsx                 # React Frontend App (Internship cards, filters, application modal)
│   ├── controllers/
│   │   ├── internshipController.ts  # Internship CRUD logic
│   │   └── applicationController.ts # Application submission & listing logic
│   ├── db/
│   │   ├── database.ts         # SQLite connection, schema, seed logic
│   │   └── seed.ts             # Standalone CLI database seed script
│   ├── middleware/
│   │   ├── errorHandler.ts     # Centralized production error handler
│   │   ├── logger.ts           # Privacy-preserving request logging
│   │   ├── validate.ts         # Validation for internship input
│   │   └── validateApplication.ts # Validation for application submissions
│   ├── routes/
│   │   ├── internshipRoutes.ts  # Router for /api/internships
│   │   └── applicationRoutes.ts # Router for /api/applications
│   └── views/
│       └── apiExplorer.ts      # HTML Explorer & Documentation UI
├── tests/
│   └── internship.test.ts      # 25 automated unit, integration, and persistence tests
├── .env.example                # Sample environment variables
├── CAPSTONE_EVIDENCE.md        # Official evidence, test results, accessibility & video script
├── SECURITY_CHECKLIST.md       # Documented security protections and roadmap
├── package.json                # Project manifest & npm scripts
├── server.ts                   # Express server entry point (port 3000)
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Complete documentation
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` to configure environment variables:

```env
# Application Server Port
PORT=3000

# Node Environment (development, production, test)
NODE_ENV=development

# Frontend API Base URL for React app
VITE_API_BASE_URL="/api"

# Admin API Key required for accessing private applicant records (GET /api/applications)
ADMIN_API_KEY="admin-secret-key-123"

# Allowed CORS Origins for production security (Do NOT use wildcard * in production)
# Multiple origins can be separated by commas
CLIENT_ORIGIN="https://myinternapp.com"
```

---

## 🚀 Quick Start & Installation

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/chiranjeevankumar/internship-rest-api.git
cd internship-rest-api
npm install
```

### 2. Seed the Database
Seed SQLite with the 5 default internship records:
```bash
npm run seed
```

### 3. Start Development Server (Frontend + Express Backend)
```bash
npm run dev
# Server runs on http://localhost:3000
```

### 4. Verify API Health Endpoint
You can verify backend health and SQLite connection status via cURL or browser:
```bash
curl http://localhost:3000/api/health
```
**Expected Response (`200 OK`)**:
```json
{
  "success": true,
  "status": "OK",
  "message": "Internship REST API service is healthy",
  "timestamp": "2026-10-27T03:40:00.000Z",
  "database": "connected",
  "uptimeSeconds": 15
}
```

### 5. Run Automated Tests
Execute the complete test suite:
```bash
npm test
```

---

## 📊 Initial Seed Records

The database is populated with the following 5 required internship records:

| ID | Title | Description | Domain | Location | Skills Array | Openings |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `INT-101` | Frontend Intern | Work with modern frontend web technologies to build responsive user interfaces and interactive components. | Full Stack Development | Remote India | `["HTML", "CSS", "JavaScript"]` | 3 |
| `INT-102` | API Engineering Intern | Design, build, and document robust RESTful APIs with Node.js and SQL databases. | Full Stack Development | Hybrid Pune | `["Node.js", "SQL", "Testing"]` | 2 |
| `INT-103` | UI/UX Intern | Conduct user research, design wireframes, and create accessible user experiences using Figma. | UI/UX | Remote India | `["Figma", "User Research", "Accessibility"]` | 1 |
| `INT-104` | Data Analyst Intern | Analyze datasets, construct SQL queries, and generate actionable insights with visual dashboards. | Data Analytics | On-site Bengaluru | `["Excel", "SQL", "Data Visualisation"]` | 2 |
| `INT-105` | Security Operations Intern | Monitor network traffic, analyze security logs, and assist with security operations and threat management. | Cyber Security | Remote India | `["Linux", "Logs", "Networking"]` | 1 |

---

## 📡 API Endpoints Reference

### 1. Health Check
- **Endpoint**: `GET /api/health`
- **Response (`200 OK`)**:
```json
{
  "success": true,
  "status": "OK",
  "message": "Internship REST API service is healthy",
  "database": "connected"
}
```

---

### 2. List Internships
- **Endpoint**: `GET /api/internships`
- **Query Params**: `page`, `limit`, `search`, `domain`, `location`, `sort`, `order`
- **Response (`200 OK`)**:
```json
{
  "success": true,
  "count": 5,
  "total": 5,
  "page": 1,
  "limit": 10,
  "totalPages": 1,
  "data": [
    {
      "id": "INT-101",
      "title": "Frontend Intern",
      "description": "Work with modern frontend web technologies to build responsive user interfaces.",
      "domain": "Full Stack Development",
      "location": "Remote India",
      "skills": ["HTML", "CSS", "JavaScript"],
      "openings": 3
    }
  ]
}
```

---

### 3. Submit Internship Application
- **Endpoint**: `POST /api/applications`
- **Rate Limit**: Max 5 submissions per 15 mins per IP
- **Request Payload**:
```json
{
  "internshipId": "INT-101",
  "applicantName": "Chiranjeevan Kumar",
  "email": "chiranjeevan@example.com",
  "coverLetter": "I am passionate about building responsive, accessible web interfaces and would love to contribute."
}
```
- **Response (`201 Created`)**:
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "id": "APP-1001",
    "internshipId": "INT-101",
    "applicantName": "Chiranjeevan Kumar",
    "email": "chiranjeevan@example.com",
    "coverLetter": "I am passionate about building responsive, accessible web interfaces...",
    "status": "submitted",
    "createdAt": "2026-10-27T03:40:00.000Z"
  }
}
```

---

### 4. Fetch Submitted Applications (Admin Protected)
- **Endpoint**: `GET /api/applications`
- **Header Required**: `x-admin-key: admin-secret-key-123`
- **Response (`200 OK`)**:
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "APP-1001",
      "internshipId": "INT-101",
      "applicantName": "Chiranjeevan Kumar",
      "email": "chiranjeevan@example.com",
      "status": "submitted"
    }
  ]
}
```
- **Response (`401 Unauthorized`)** *(if header missing/incorrect)*:
```json
{
  "success": false,
  "error": "Unauthorized. Access to applicant records requires valid admin authorization."
}
```

---

## 🚀 Production Deployment Guide

### Deployment Options: Render / Railway / Google Cloud Run

1. **Set Environment Variables in Hosting Control Panel**:
   - `NODE_ENV="production"`
   - `PORT=3000`
   - `ADMIN_API_KEY="your-strong-production-admin-key"`
   - `CLIENT_ORIGIN="https://your-production-domain.com"`
   - `VITE_API_BASE_URL="/api"`

2. **Build & Start Commands**:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start` (`tsx server.ts` or `node server.ts`)

3. **Verify Deployment Health**:
   - Navigate to `https://your-app-domain.com/api/health` to confirm database initialization and service status.

---

## 👤 Author & Assignment Details

- **Student Name**: Chiranjeevan Kumar
- **Assignment**: Production-Ready Capstone Project
- **Repository**: [chiranjeevankumar/internship-rest-api](https://github.com/chiranjeevankumar/internship-rest-api)
- **License**: MIT
