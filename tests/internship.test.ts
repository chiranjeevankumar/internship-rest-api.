import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { getDatabase, seedDatabase, closeDatabase } from '../src/db/database.js';

describe('Internship REST API Test Suite', () => {
  let db: any;

  beforeAll(() => {
    // Set NODE_ENV to test to use in-memory SQLite database
    process.env.NODE_ENV = 'test';
    db = getDatabase(':memory:');
    seedDatabase(db);
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

  // 2. GET /api/internships (Initial Seed Check & Listing)
  describe('2. GET /api/internships (Listing & Initial Seeds)', () => {
    it('should return 200 OK and list 5 initial seed records', async () => {
      const res = await request(app).get('/api/internships');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.total).toBeGreaterThanOrEqual(5);
      expect(res.body.data).toBeInstanceOf(Array);

      const ids = res.body.data.map((item: any) => item.id);
      expect(ids).toContain('INT-101');
      expect(ids).toContain('INT-102');
      expect(ids).toContain('INT-103');
      expect(ids).toContain('INT-104');
      expect(ids).toContain('INT-105');
    });
  });

  // 3. Pagination
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
    it('should search by query keyword across fields', async () => {
      const res = await request(app).get('/api/internships?search=Figma');
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
    it('should return 200 OK for valid existing ID', async () => {
      const res = await request(app).get('/api/internships/INT-102');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('INT-102');
      expect(res.body.data.title).toBe('API Engineering Intern');
      expect(res.body.data.location).toBe('Hybrid Pune');
    });

    it('should return 404 Not Found for non-existent ID', async () => {
      const res = await request(app).get('/api/internships/INT-999');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("Internship with ID 'INT-999' not found");
    });
  });

  // 6. POST /api/internships (Creation & Validation)
  describe('6. POST /api/internships (Create & Validate)', () => {
    it('should create a new internship record with valid input and auto-generated ID', async () => {
      const payload = {
        title: 'DevOps Intern',
        domain: 'Cloud Infrastructure',
        location: 'Remote India',
        skills: ['Docker', 'Kubernetes', 'CI/CD'],
        openings: 2
      };

      const res = await request(app).post('/api/internships').send(payload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Internship created successfully');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.title).toBe('DevOps Intern');
      expect(res.body.data.skills).toBe('Docker, Kubernetes, CI/CD');
    });

    it('should return 400 Bad Request when required title is missing', async () => {
      const payload = {
        domain: 'Cloud Infrastructure',
        location: 'Remote India',
        skills: 'Docker',
        openings: 2
      };

      const res = await request(app).post('/api/internships').send(payload);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Validation Failed');
      expect(res.body.details).toContain("Field 'title' is required.");
    });

    it('should return 400 Bad Request when openings is negative', async () => {
      const payload = {
        title: 'QA Tester Intern',
        domain: 'Software Testing',
        location: 'Remote India',
        skills: 'Selenium',
        openings: -1
      };

      const res = await request(app).post('/api/internships').send(payload);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.details).toContain("Field 'openings' must be a non-negative integer (0 or greater).");
    });

    it('should return 400 Bad Request when attempting to create duplicate ID', async () => {
      const payload = {
        id: 'INT-101', // Existing ID
        title: 'Duplicate Frontend Intern',
        domain: 'Full Stack Development',
        location: 'Remote India',
        skills: 'HTML',
        openings: 1
      };

      const res = await request(app).post('/api/internships').send(payload);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("Internship with ID 'INT-101' already exists.");
    });
  });

  // 7. PUT /api/internships/:id (Update & Validation)
  describe('7. PUT /api/internships/:id (Update & Validate)', () => {
    it('should update existing internship record with valid input', async () => {
      const updatePayload = {
        title: 'Senior Frontend Intern',
        domain: 'Full Stack Development',
        location: 'Hybrid Mumbai',
        skills: 'HTML, CSS, JavaScript, React',
        openings: 5
      };

      const res = await request(app).put('/api/internships/INT-101').send(updatePayload);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Senior Frontend Intern');
      expect(res.body.data.location).toBe('Hybrid Mumbai');
      expect(res.body.data.openings).toBe(5);
    });

    it('should return 404 Not Found when updating non-existent ID', async () => {
      const updatePayload = {
        title: 'Non-existent Intern',
        domain: 'Domain',
        location: 'Location',
        skills: 'Skills',
        openings: 1
      };

      const res = await request(app).put('/api/internships/INT-999').send(updatePayload);
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 Bad Request if update payload contains invalid data', async () => {
      const res = await request(app).put('/api/internships/INT-101').send({ title: '' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Validation Failed');
    });
  });

  // 8. DELETE /api/internships/:id
  describe('8. DELETE /api/internships/:id', () => {
    it('should delete an existing internship record', async () => {
      const res = await request(app).delete('/api/internships/INT-105');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.deletedId).toBe('INT-105');

      // Verify it is gone
      const verifyRes = await request(app).get('/api/internships/INT-105');
      expect(verifyRes.status).toBe(404);
    });

    it('should return 404 Not Found when deleting non-existent ID', async () => {
      const res = await request(app).delete('/api/internships/INT-999');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // 9. Database Persistence & Idempotency
  describe('9. Database Seeding & Idempotency', () => {
    it('should not duplicate seed records when seedDatabase is re-invoked', () => {
      const result = seedDatabase(db);
      expect(result.seeded).toBe(0); // 0 new records inserted because INT-101 to INT-104 exist
      expect(result.total).toBeGreaterThanOrEqual(4);
    });
  });
});
