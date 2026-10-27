# Internship REST API & Database Service

> **Internship Assignment - Milestone 3: REST API and Persistent Data**  
> GitHub Repository: [https://github.com/chiranjeevankumar/internship-rest-api](https://github.com/chiranjeevankumar/internship-rest-api)

A robust, production-ready RESTful API built with **Node.js**, **Express.js**, and **SQLite** (`better-sqlite3`). This service handles internship postings with complete CRUD operations, parameterized SQL queries, server-side pagination, search, domain/location filtering, robust input validation, idempotently-seeded data, and a full automated test suite using **Vitest** and **Supertest**.

---

## 🌟 Key Features

- ⚡ **RESTful API Architecture**: Clean JSON endpoints returning consistent responses and standard HTTP status codes (`200`, `201`, `400`, `404`, `500`).
- 🗄️ **Persistent Data Storage**: SQLite database with file persistence (`data/internships.db`), auto-schema initialization, and WAL journal mode.
- 🌱 **Idempotent Seed Script**: Pre-seeded with 5 required initial records (`INT-101` to `INT-105`) using `INSERT OR IGNORE` to prevent duplication on server restarts.
- 🔍 **Filtering, Search & Pagination**:
  - Full-text search across `title`, `domain`, `location`, and `skills`.
  - Exact or partial filter by `domain` and `location`.
  - Configurable page number (`page`) and items per page (`limit`).
- 🛡️ **Strict Input Validation**: Validates all incoming payloads for correct data types, non-empty text, non-negative opening numbers, and unique IDs.
- 🧪 **Automated Test Suite**: Vitest + Supertest integration testing running against an isolated in-memory test database (`:memory:`).
- 🌐 **Interactive API Explorer & Documentation**: Built-in interactive GUI served at `http://localhost:3000/` for live endpoint testing right from the browser.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js (v4.x)
- **Database**: SQLite3 via `better-sqlite3` driver
- **Language**: TypeScript / ES Modules (`tsx`)
- **Testing**: Vitest + Supertest
- **Styling (API Explorer)**: Tailwind CSS

---

## 📁 Project Structure

```
internship-rest-api/
├── data/
│   └── internships.db          # SQLite persistent database file (created on startup)
├── src/
│   ├── app.ts                  # Express app initialization, middleware & routes
│   ├── controllers/
│   │   └── internshipController.ts # Logic for API endpoints (CRUD, search, pagination)
│   ├── db/
│   │   ├── database.ts         # SQLite connection, schema, seed logic
│   │   └── seed.ts             # Standalone CLI database seed script
│   ├── middleware/
│   │   ├── errorHandler.ts     # Centralized 404 & 500 error handlers
│   │   └── validate.ts         # Input validation middleware for POST & PUT
│   ├── routes/
│   │   └── internshipRoutes.ts # Express router for /api endpoints
│   └── views/
│       └── apiExplorer.ts      # Interactive HTML Explorer GUI served on GET /
├── tests/
│   └── internship.test.ts      # Automated unit & integration tests
├── .gitignore                  # Ignores node_modules, database files, logs
├── package.json                # Project dependencies and npm scripts
├── server.ts                   # Main server entry point (runs Express on port 3000)
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Complete documentation
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
Seed the SQLite database with the 5 default internship records:
```bash
npm run seed
```

### 3. Start Development Server
```bash
npm run dev
# Server will run on http://localhost:3000
```

### 4. Run Automated Tests
Execute the complete test suite against the in-memory test database:
```bash
npm test
```

---

## 📜 Available NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm start` | Runs production server (`tsx server.ts`) |
| `npm run dev` | Runs development server with auto-reload (`tsx server.ts`) |
| `npm test` | Executes automated Vitest + Supertest test suite |
| `npm run seed` | Explicitly seeds the SQLite database with initial records |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |
| `npm run clean` | Removes compiled output and database files |

---

## 📊 Initial Seed Records

The database is populated with the following 5 initial internship records:

| ID | Title | Domain | Location | Skills | Openings |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `INT-101` | Frontend Intern | Full Stack Development | Remote India | HTML/CSS/JavaScript | 3 |
| `INT-102` | API Engineering Intern | Full Stack Development | Hybrid Pune | Node.js/SQL/Testing | 2 |
| `INT-103` | UI/UX Intern | UI/UX | Remote India | Figma/User Research/Accessibility | 1 |
| `INT-104` | Data Analyst Intern | Data Analytics | On-site Bengaluru | Excel/SQL/Data Visualisation | 2 |
| `INT-105` | Security Operations Intern | Cyber Security | Remote India | Linux/Logs/Networking | 1 |

---

## 📡 API Endpoints Reference

### 1. Health Check
- **Endpoint**: `GET /api/health`
- **Description**: Verifies API service uptime and database connection status.
- **HTTP Code**: `200 OK`
- **Sample Response**:
```json
{
  "success": true,
  "status": "OK",
  "message": "Internship REST API service is healthy",
  "timestamp": "2026-10-27T02:35:00.000Z",
  "database": "connected",
  "uptimeSeconds": 45
}
```

---

### 2. List Internships (with Pagination, Search & Filters)
- **Endpoint**: `GET /api/internships`
- **Description**: Retrieves paginated list of internships with optional search query and filters.
- **Query Parameters**:
  - `page` *(number, optional)*: Page number (default: `1`).
  - `limit` *(number, optional)*: Items per page (default: `10`, max: `100`).
  - `search` or `q` *(string, optional)*: Search keyword across title, domain, location, and skills.
  - `domain` *(string, optional)*: Filter by domain (e.g., `Full Stack`).
  - `location` *(string, optional)*: Filter by location (e.g., `Remote`).
  - `sort` *(string, optional)*: Field to sort by (`created_at`, `title`, `openings`, `id`).
  - `order` *(string, optional)*: `ASC` or `DESC` (default: `DESC`).
- **HTTP Code**: `200 OK`
- **Sample Request**: `GET /api/internships?search=Remote&page=1&limit=5`
- **Sample Response**:
```json
{
  "success": true,
  "count": 3,
  "total": 3,
  "page": 1,
  "limit": 5,
  "totalPages": 1,
  "data": [
    {
      "id": "INT-101",
      "title": "Frontend Intern",
      "domain": "Full Stack Development",
      "location": "Remote India",
      "skills": "HTML/CSS/JavaScript",
      "openings": 3,
      "created_at": "2026-10-27 02:35:00",
      "updated_at": "2026-10-27 02:35:00"
    }
  ]
}
```

---

### 3. Get Single Internship by ID
- **Endpoint**: `GET /api/internships/:id`
- **Description**: Retrieves single internship details by ID.
- **HTTP Code**: `200 OK` (if found) or `404 Not Found` (if missing)
- **Sample Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "id": "INT-101",
    "title": "Frontend Intern",
    "domain": "Full Stack Development",
    "location": "Remote India",
    "skills": "HTML/CSS/JavaScript",
    "openings": 3,
    "created_at": "2026-10-27 02:35:00",
    "updated_at": "2026-10-27 02:35:00"
  }
}
```
- **Sample Response (`404 Not Found`)**:
```json
{
  "success": false,
  "error": "Internship with ID 'INT-999' not found"
}
```

---

### 4. Create New Internship
- **Endpoint**: `POST /api/internships`
- **Description**: Creates a new internship posting with input validation.
- **HTTP Code**: `201 Created` (success) or `400 Bad Request` (validation error / duplicate ID)
- **Sample Request Payload**:
```json
{
  "title": "Backend Engineering Intern",
  "domain": "Cloud Infrastructure",
  "location": "Remote India",
  "skills": ["Node.js", "Express", "SQLite"],
  "openings": 2
}
```
- **Sample Response (`201 Created`)**:
```json
{
  "success": true,
  "message": "Internship created successfully",
  "data": {
    "id": "INT-106",
    "title": "Backend Engineering Intern",
    "domain": "Cloud Infrastructure",
    "location": "Remote India",
    "skills": "Node.js, Express, SQLite",
    "openings": 2,
    "created_at": "2026-10-27 02:36:00",
    "updated_at": "2026-10-27 02:36:00"
  }
}
```

---

### 5. Update Internship by ID
- **Endpoint**: `PUT /api/internships/:id`
- **Description**: Updates an existing internship record.
- **HTTP Code**: `200 OK` (success), `400 Bad Request` (validation error), or `404 Not Found`
- **Sample Request Payload**:
```json
{
  "title": "Senior Frontend Intern",
  "domain": "Full Stack Development",
  "location": "Hybrid Mumbai",
  "skills": "React, TypeScript, Tailwind CSS",
  "openings": 5
}
```
- **Sample Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Internship updated successfully",
  "data": {
    "id": "INT-101",
    "title": "Senior Frontend Intern",
    "domain": "Full Stack Development",
    "location": "Hybrid Mumbai",
    "skills": "React, TypeScript, Tailwind CSS",
    "openings": 5,
    "updated_at": "2026-10-27 02:37:00"
  }
}
```

---

### 6. Delete Internship by ID
- **Endpoint**: `DELETE /api/internships/:id`
- **Description**: Permanently removes an internship record from the database.
- **HTTP Code**: `200 OK` (success) or `404 Not Found`
- **Sample Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Internship deleted successfully",
  "deletedId": "INT-105"
}
```

---

## 🧪 Automated Testing Results

The automated test suite in `tests/internship.test.ts` executes all integration tests in isolation against an in-memory SQLite database:

```bash
npm test
```

### Verified Test Summary:
- ✅ `GET /api/health`: Returns 200 OK with database connection status.
- ✅ `GET /api/internships`: Successfully lists all initial seed records (INT-101 to INT-105).
- ✅ Pagination: Correctly returns records according to `page` and `limit` query params.
- ✅ Search & Filtering: Filters records accurately by search term, domain, and location.
- ✅ `GET /api/internships/:id`: Returns record details for valid ID and 404 for missing ID.
- ✅ `POST /api/internships`: Creates new record (201) and rejects invalid payload or duplicate ID (400).
- ✅ `PUT /api/internships/:id`: Updates existing record (200) and returns 404 for missing ID.
- ✅ `DELETE /api/internships/:id`: Deletes record (200) and returns 404 for missing ID.
- ✅ Persistence & Idempotency: Re-invoking seed logic prevents duplicate records.

---

## 📤 How to Push to Public GitHub Repository

Follow these steps to push your project to your GitHub repository:

```bash
# 1. Initialize Git in the project root
git init

# 2. Add files and make initial commit
git add .
git commit -m "feat: complete Milestone 3 REST API with Express, SQLite, and automated tests"

# 3. Rename branch to main
git branch -M main

# 4. Link your remote repository
git remote add origin https://github.com/chiranjeevankumar/internship-rest-api.git

# 5. Push to GitHub
git push -u origin main
```

---

## 👤 Author & Assignment Details

- **Student Name**: Chiranjeevan Kumar
- **Assignment**: Milestone 3 - REST API and Persistent Data
- **Repository**: [chiranjeevankumar/internship-rest-api](https://github.com/chiranjeevankumar/internship-rest-api)
- **License**: MIT
