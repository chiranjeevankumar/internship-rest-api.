# Internship REST API & Secure Application Integration

> **Internship Assignment - Milestone 3 + Secure Application Integration**  
> GitHub Repository: [https://github.com/chiranjeevankumar/internship-rest-api](https://github.com/chiranjeevankumar/internship-rest-api)

A robust, production-grade full-stack RESTful application built with **Node.js**, **Express.js**, **SQLite** (`better-sqlite3`), and **React** (Vite + Tailwind CSS). This project features internship postings CRUD, server-side pagination, search, domain/location filtering, secure internship application submission, Helmet security headers, CORS controls, rate limiting, and automated testing with **Vitest** and **Supertest**.

---

## 🌟 Key Features

- ⚡ **Full-Stack Integration**: React frontend (`src/App.tsx`) seamlessly connected to Express REST API backend (`/api/*`) with configurable API base URL (`VITE_API_BASE_URL`).
- 🗄️ **SQLite Persistence**: Dual relational tables (`internships` and `applications`) with foreign key constraints (`PRAGMA foreign_keys = ON`) and WAL journal mode.
- 📝 **Application Form**: Interactive application modal with client-side & server-side validation (email regex format, cover letter length 20–2000 chars, name 2–100 chars), duplicate submission prevention, and submission progress indicators.
- 🛡️ **API Security Architecture**:
  - **Rate Limiting**: `express-rate-limit` on general API routes (100 reqs/15m) and stricter limit on application submission endpoint (5 reqs/15m per IP).
  - **HTTP Security Headers**: `helmet()` for clickjacking, MIME-sniffing, and XSS defense.
  - **CORS Control**: Configurable origin restriction via `CLIENT_ORIGIN`.
  - **SQL Injection Defense**: 100% parameterized SQL queries (`db.prepare(...)`).
  - **Server-Side Validation**: Never trusts client input alone.
- 🌱 **Idempotent Seed Records**: Pre-seeded with 5 required initial internship records (`INT-101` to `INT-105`) with descriptions and skills array without duplication on server restart.
- 🆔 **Auto-Generated IDs**: Server auto-generates IDs (`INT-XXX` for internships, `APP-XXXX` for applications). Clients cannot supply custom IDs on creation.
- 🧪 **Automated Test Suite**: Vitest + Supertest integration testing running against an isolated in-memory database (`:memory:`) with genuine disk persistence tests.
- 🌐 **Interactive API Explorer & Application Viewer**: Built-in Explorer UI served at `http://localhost:3000/` allowing live endpoint testing and viewing submitted applications.

---

## 🛠️ Tech Stack

- **Backend Framework**: Express.js (v4.x) on Node.js
- **Frontend Framework**: React 19 + Vite 8
- **Database**: SQLite3 via `better-sqlite3` driver
- **Styling**: Tailwind CSS + Lucide React Icons
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
│   │   ├── errorHandler.ts     # Centralized error handler
│   │   ├── validate.ts         # Validation for internship input
│   │   └── validateApplication.ts # Validation for application submissions
│   ├── routes/
│   │   ├── internshipRoutes.ts  # Router for /api/internships
│   │   └── applicationRoutes.ts # Router for /api/applications
│   └── views/
│       └── apiExplorer.ts      # HTML Explorer & Documentation UI
├── tests/
│   └── internship.test.ts      # Automated unit, integration, and persistence tests
├── .env.example                # Sample environment variables
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

# Allowed CORS Origins (comma-separated or * for development)
CLIENT_ORIGIN="*"
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

### 3. Start Application (Frontend + Express Backend)
```bash
npm run dev
# Server will run on http://localhost:3000
```

### 4. Run Automated Tests
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
  "timestamp": "2026-10-27T03:15:00.000Z",
  "database": "connected",
  "uptimeSeconds": 120
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
    "createdAt": "2026-10-27T03:16:00.000Z"
  }
}
```

---

### 4. Fetch Submitted Applications
- **Endpoint**: `GET /api/applications`
- **Query Params**: `internshipId` *(optional filter)*
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

---

## 🛡️ Security Protections Summary

For full details, view [`SECURITY_CHECKLIST.md`](./SECURITY_CHECKLIST.md).
- **Helmet Headers**: Clickjacking, MIME sniffing, and XSS defense headers configured.
- **CORS Protection**: Restricted to allowed origins via `CLIENT_ORIGIN`.
- **Rate Limiting**: Express rate limiters protect API endpoints and limit spam submission attacks.
- **SQL Injection Defense**: 100% prepared SQL statements using `better-sqlite3`.
- **Dual-Layer Validation**: Server-side Express middleware validates and normalizes all incoming fields.

---

## 🧪 Automated Testing Verification

Execute all integration and security tests:

```bash
npm test
```

Verifies:
- Service health & DB connection
- Internship CRUD, search, pagination, and filter queries
- Server auto-generated IDs & rejection of client-supplied IDs
- Application submission success & database persistence
- Validation rejections for invalid email format, short cover letters, and missing fields
- 404 rejection on application submissions for non-existent internship IDs
- File-based SQLite persistence across database close and reopen operations

---

## 👤 Author & Assignment Details

- **Student Name**: Chiranjeevan Kumar
- **Assignment**: Milestone 3 + Secure Application Integration
- **Repository**: [chiranjeevankumar/internship-rest-api](https://github.com/chiranjeevankumar/internship-rest-api)
- **License**: MIT
