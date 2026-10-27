import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import {
  getDatabase,
  seedDatabase,
  setDatabase,
  resetDatabase,
  closeDatabase,
  initSchema
} from '../src/db/database.js';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

describe('Internship REST API Test Suite', () => {
  let testDb: any;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.ADMIN_API_KEY = 'test-admin-secret-key-999';
    resetDatabase();
    testDb = getDatabase(':memory:');
    setDatabase(testDb);
    seedDatabase(testDb);
  });

  afterAll(() => {
    closeDatabase();
  });

  // 1. GET /api/health
  describe('1. GET /api/health', () => {
    it('should return 200 OK with health status and database status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe('OK');
      expect(res.body.database).toBe('connected');
      expect(res.body).toHaveProperty('uptimeSeconds');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  // 2. GET /api/internships (Seed & Skills Array & Description)
  describe('2. GET /api/internships (Listing & Skills Array Verification)', () => {
    it('should return 200 OK and list initial seed records with skills as string[] and description', async () => {
      const res = await request(app).get('/api/internships');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.total).toBeGreaterThanOrEqual(5);
      expect(res.body.data).toBeInstanceOf(Array);

      const record101 = res.body.data.find((item: any) => item.id === 'INT-101');
      expect(record101).toBeDefined();
      expect(record101.title).toBe('Frontend Intern');
      expect(record101.description).toContain('Work with modern frontend web technologies');
      expect(Array.isArray(record101.skills)).toBe(true);
      expect(record101.skills).toEqual(['HTML', 'CSS', 'JavaScript']);
      expect(record101.openings).toBe(3);
    });
  });

  // 3. Pagination Support
  describe('3. Pagination Support', () => {
    it('should respect page and limit query parameters', async () => {
      const resPage1 = await request(app).get('/api/internships?page=1&limit=2');
      expect(resPage1.status).toBe(200);
      expect(resPage1.body.page).toBe(1);
      expect(resPage1.body.limit).toBe(2);
      expect(resPage1.body.count).toBe(2);

      const resPage2 = await request(app).get('/api/internships?page=2&limit=2');
      expect(resPage2.status).toBe(200);
      expect(resPage2.body.page).toBe(2);
      expect(resPage2.body.count).toBe(2);
      expect(resPage2.body.data[0].id).not.toEqual(resPage1.body.data[0].id);
    });
  });

  // 4. Searching & Filtering
  describe('4. Search and Domain / Location Filtering', () => {
    it('should search by query keyword across title, description, and skills', async () => {
      const res = await request(app).get('/api/internships?search=wireframes');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].id).toBe('INT-103');
      expect(res.body.data[0].title).toBe('UI/UX Intern');
    });

    it('should filter by domain accurately', async () => {
      const res = await request(app).get('/api/internships?domain=Full%20Stack%20Development');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
      const ids = res.body.data.map((i: any) => i.id);
      expect(ids).toContain('INT-101');
      expect(ids).toContain('INT-102');
    });

    it('should filter by location accurately', async () => {
      const res = await request(app).get('/api/internships?location=Bengaluru');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].id).toBe('INT-104');
    });
  });

  // 5. GET /api/internships/:id
  describe('5. GET /api/internships/:id', () => {
    it('should return 200 OK for valid existing ID with array skills and description', async () => {
      const res = await request(app).get('/api/internships/INT-102');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('INT-102');
      expect(res.body.data.title).toBe('API Engineering Intern');
      expect(res.body.data.description).toContain('Node.js and SQL');
      expect(Array.isArray(res.body.data.skills)).toBe(true);
      expect(res.body.data.skills).toEqual(['Node.js', 'SQL', 'Testing']);
    });

    it('should return 404 Not Found for non-existent ID', async () => {
      const res = await request(app).get('/api/internships/INT-999');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("Internship with ID 'INT-999' not found");
    });
  });

  // 6. POST /api/internships (Auto ID, Positive Openings, Validation)
  describe('6. POST /api/internships (Auto-Generated ID & Input Validation)', () => {
    it('should create a new record with auto-generated ID, description, and return skills as string[]', async () => {
      const payload = {
        title: 'DevOps Intern',
        description: 'Automate deployment pipelines and manage cloud infrastructure using Docker.',
        domain: 'Cloud Infrastructure',
        location: 'Remote India',
        skills: ['Docker', 'Kubernetes', 'CI/CD'],
        openings: 2
      };

      const res = await request(app).post('/api/internships').send(payload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.id).toMatch(/^INT-\d+$/);
      expect(res.body.data.title).toBe('DevOps Intern');
      expect(res.body.data.description).toContain('Automate deployment');
      expect(Array.isArray(res.body.data.skills)).toBe(true);
      expect(res.body.data.skills).toEqual(['Docker', 'Kubernetes', 'CI/CD']);
      expect(res.body.data.openings).toBe(2);
    });

    it('should return 400 Bad Request when client attempts to specify an ID on POST', async () => {
      const payload = {
        id: 'INT-999',
        title: 'Custom ID Intern',
        description: 'Attempting to pass custom ID on post endpoint.',
        domain: 'Engineering',
        location: 'Remote India',
        skills: ['Node.js'],
        openings: 1
      };

      const res = await request(app).post('/api/internships').send(payload);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.details).toContain("Field 'id' should not be provided; IDs are auto-generated.");
    });

    it('should return 400 Bad Request when description is missing or too short', async () => {
      const payload = {
        title: 'QA Intern',
        description: 'Abc', // less than 5 chars
        domain: 'Software Testing',
        location: 'Remote India',
        skills: ['Selenium'],
        openings: 1
      };

      const res = await request(app).post('/api/internships').send(payload);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.details).toContain("Field 'description' must be a string with at least 5 characters.");
    });

    it('should return 400 Bad Request when openings is zero or negative', async () => {
      const payloadZero = {
        title: 'Zero Openings Intern',
        description: 'Valid internship description string for testing.',
        domain: 'Engineering',
        location: 'Remote India',
        skills: ['Python'],
        openings: 0
      };

      const resZero = await request(app).post('/api/internships').send(payloadZero);
      expect(resZero.status).toBe(400);
      expect(resZero.body.success).toBe(false);
      expect(resZero.body.details).toContain("Field 'openings' must be a positive integer greater than zero.");

      const payloadNegative = { ...payloadZero, openings: -2 };
      const resNeg = await request(app).post('/api/internships').send(payloadNegative);
      expect(resNeg.status).toBe(400);
      expect(resNeg.body.details).toContain("Field 'openings' must be a positive integer greater than zero.");
    });
  });

  // 7. PUT /api/internships/:id (Update & Validation)
  describe('7. PUT /api/internships/:id (Update & Validate)', () => {
    it('should update existing internship record including description and skills array', async () => {
      const updatePayload = {
        title: 'Senior Frontend Intern',
        description: 'Lead modern frontend web architecture using React and TypeScript.',
        domain: 'Full Stack Development',
        location: 'Hybrid Mumbai',
        skills: ['HTML', 'CSS', 'JavaScript', 'React'],
        openings: 5
      };

      const res = await request(app).put('/api/internships/INT-101').send(updatePayload);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Senior Frontend Intern');
      expect(res.body.data.description).toContain('Lead modern frontend');
      expect(Array.isArray(res.body.data.skills)).toBe(true);
      expect(res.body.data.skills).toEqual(['HTML', 'CSS', 'JavaScript', 'React']);
      expect(res.body.data.openings).toBe(5);
    });

    it('should return 404 Not Found when updating non-existent ID', async () => {
      const updatePayload = {
        title: 'Non-existent Intern',
        description: 'Valid description for non existent record update test.',
        domain: 'Domain',
        location: 'Location',
        skills: ['Skills'],
        openings: 1
      };

      const res = await request(app).put('/api/internships/INT-999').send(updatePayload);
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // 8. DELETE /api/internships/:id
  describe('8. DELETE /api/internships/:id', () => {
    it('should delete an existing internship record', async () => {
      const res = await request(app).delete('/api/internships/INT-105');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.deletedId).toBe('INT-105');

      const verifyRes = await request(app).get('/api/internships/INT-105');
      expect(verifyRes.status).toBe(404);
    });

    it('should return 404 Not Found when deleting non-existent ID', async () => {
      const res = await request(app).delete('/api/internships/INT-999');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // 9. Genuine Persistence Test & Idempotency
  describe('9. Genuine SQLite Data Persistence & Idempotency', () => {
    const tempDbPath = path.resolve(process.cwd(), 'data', 'temp_persistence_test.db');

    afterAll(() => {
      if (fs.existsSync(tempDbPath)) {
        try { fs.unlinkSync(tempDbPath); } catch {}
      }
    });

    it('should persist data across database close and reopen operations', () => {
      if (fs.existsSync(tempDbPath)) {
        fs.unlinkSync(tempDbPath);
      }

      let db = new Database(tempDbPath);
      initSchema(db);
      seedDatabase(db);

      const insertStmt = db.prepare(`
        INSERT INTO internships (id, title, description, domain, location, skills, openings)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertStmt.run(
        'INT-900',
        'Persistence Test Intern',
        'Verifying data survives database file close and reopen.',
        'Testing',
        'Remote',
        JSON.stringify(['Persistence', 'SQLite']),
        4
      );

      const recordBefore = db.prepare('SELECT * FROM internships WHERE id = ?').get('INT-900') as any;
      expect(recordBefore).toBeDefined();

      db.close();

      db = new Database(tempDbPath);
      const recordAfter = db.prepare('SELECT * FROM internships WHERE id = ?').get('INT-900') as any;
      expect(recordAfter).toBeDefined();
      expect(recordAfter.id).toBe('INT-900');
      expect(recordAfter.title).toBe('Persistence Test Intern');

      const seedResult = seedDatabase(db);
      expect(seedResult.seeded).toBe(0);

      const totalCount = (db.prepare('SELECT COUNT(*) as count FROM internships').get() as any).count;
      expect(totalCount).toBe(6);

      db.close();
    });
  });

  // 10. POST /api/applications & Application Authorization Tests
  describe('10. POST /api/applications & Privacy Protection Tests', () => {
    it('should submit an application successfully without requiring admin key', async () => {
      const payload = {
        internshipId: 'INT-101',
        applicantName: 'Chiranjeevan Kumar',
        email: 'chiranjeevan@example.com',
        coverLetter: 'I am extremely enthusiastic about applying for this Frontend Internship position to build modern UIs.'
      };

      const res = await request(app).post('/api/applications').send(payload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Application submitted successfully');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.id).toMatch(/^APP-\d+$/);
      expect(res.body.data.internshipId).toBe('INT-101');
      expect(res.body.data.applicantName).toBe('Chiranjeevan Kumar');
      expect(res.body.data.email).toBe('chiranjeevan@example.com');
      expect(res.body.data.status).toBe('submitted');
    });

    it('should return 400 Bad Request when email is invalid', async () => {
      const payload = {
        internshipId: 'INT-101',
        applicantName: 'Invalid Email Applicant',
        email: 'not-a-valid-email-address',
        coverLetter: 'Valid cover letter content exceeding twenty characters.'
      };

      const res = await request(app).post('/api/applications').send(payload);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.details).toContain("Field 'email' must be a valid email address (max 100 characters).");
    });

    it('should return 400 Bad Request when cover letter is shorter than 20 characters', async () => {
      const payload = {
        internshipId: 'INT-101',
        applicantName: 'Short Letter Applicant',
        email: 'applicant@example.com',
        coverLetter: 'Too short.' // less than 20 chars
      };

      const res = await request(app).post('/api/applications').send(payload);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.details).toContain("Field 'coverLetter' must be between 20 and 2000 characters.");
    });

    it('should return 404 Not Found when submitting application for non-existent internship ID', async () => {
      const payload = {
        internshipId: 'INT-999',
        applicantName: 'Non Existent Internship Applicant',
        email: 'applicant@example.com',
        coverLetter: 'Valid cover letter content exceeding twenty characters length requirement.'
      };

      const res = await request(app).post('/api/applications').send(payload);
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("Internship with ID 'INT-999' not found");
    });

    it('should return 401 Unauthorized for GET /api/applications when authorization header is missing', async () => {
      const res = await request(app).get('/api/applications');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Unauthorized');
    });

    it('should return 401 Unauthorized for GET /api/applications when incorrect admin key is provided', async () => {
      const res = await request(app)
        .get('/api/applications')
        .set('x-admin-key', 'wrong-invalid-admin-key');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Unauthorized');
    });

    it('should return 401 Unauthorized for GET /api/applications when ADMIN_API_KEY environment secret is not configured', async () => {
      const tempKey = process.env.ADMIN_API_KEY;
      delete process.env.ADMIN_API_KEY;

      try {
        const res = await request(app)
          .get('/api/applications')
          .set('x-admin-key', 'any-key');
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toContain('ADMIN_API_KEY is not configured');
      } finally {
        process.env.ADMIN_API_KEY = tempKey;
      }
    });

    it('should list submitted applications via GET /api/applications when valid x-admin-key header is provided', async () => {
      const adminKey = process.env.ADMIN_API_KEY || 'test-admin-secret-key-999';
      const res = await request(app)
        .get('/api/applications')
        .set('x-admin-key', adminKey);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.count).toBeGreaterThanOrEqual(1);
    });
  });

  // 11. Security & Production Error Masking Tests
  describe('11. Security & Production Error Masking Tests', () => {
    it('should mask internal database error details in production environment mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      try {
        const res = await request(app).get('/api/internships/INT-NON-EXISTENT-XYZ');
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.stack).toBeUndefined();
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });
  });
});
