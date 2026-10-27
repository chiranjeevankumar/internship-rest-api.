import { Request, Response } from 'express';
import {
  getDatabase,
  ApplicationDBRow,
  ApplicationInput,
  mapApplicationRowToResponse
} from '../db/database.js';

export const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'admin-secret-key-123';

// POST /api/applications
export function createApplication(req: Request, res: Response): void {
  try {
    const db = getDatabase();
    const { internshipId, applicantName, email, coverLetter }: ApplicationInput = req.body;

    // 1. Verify target internship exists in database
    const internship = db.prepare('SELECT id FROM internships WHERE id = ?').get(internshipId.trim());
    if (!internship) {
      res.status(404).json({
        success: false,
        error: `Internship with ID '${internshipId}' not found. Cannot submit application.`
      });
      return;
    }

    // 2. Generate unique application ID
    const records = db.prepare("SELECT id FROM applications WHERE id LIKE 'APP-%'").all() as { id: string }[];
    let maxNum = 1000;
    for (const record of records) {
      const numPart = parseInt(record.id.replace('APP-', ''), 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    }
    const appId = `APP-${maxNum + 1}`;

    // 3. Insert application into database using parameterized query
    const insertStmt = db.prepare(`
      INSERT INTO applications (id, internship_id, applicant_name, email, cover_letter, status)
      VALUES (?, ?, ?, ?, ?, 'submitted')
    `);

    insertStmt.run(
      appId,
      internshipId.trim(),
      applicantName.trim(),
      email.trim().toLowerCase(),
      coverLetter.trim()
    );

    const rawRow = db.prepare('SELECT id, internship_id, applicant_name, email, cover_letter, status, created_at FROM applications WHERE id = ?').get(appId) as ApplicationDBRow;

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: mapApplicationRowToResponse(rawRow)
    });
  } catch (error: any) {
    console.error('[DATABASE ERROR] Application creation failed:', error);
    const isProd = process.env.NODE_ENV === 'production';
    res.status(500).json({
      success: false,
      error: isProd ? 'An error occurred while submitting your application.' : 'Failed to submit application',
      details: isProd ? undefined : error.message
    });
  }
}

// GET /api/applications (Protected Endpoint requiring Authorization)
export function getApplications(req: Request, res: Response): void {
  try {
    // Check Authorization header or x-admin-key header
    const authHeader = req.headers['authorization'] || req.headers['x-admin-key'];
    let providedKey = '';
    
    if (typeof authHeader === 'string') {
      providedKey = authHeader.replace(/^Bearer\s+/i, '').trim();
    }

    if (!providedKey || providedKey !== ADMIN_API_KEY) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized. Access to applicant records requires valid admin authorization.'
      });
      return;
    }

    const db = getDatabase();
    const { internshipId } = req.query;

    let sql = 'SELECT id, internship_id, applicant_name, email, cover_letter, status, created_at FROM applications';
    const params: any[] = [];

    if (internshipId && typeof internshipId === 'string') {
      sql += ' WHERE internship_id = ?';
      params.push(internshipId.trim());
    }

    sql += ' ORDER BY created_at DESC';

    const rawRows = db.prepare(sql).all(...params) as ApplicationDBRow[];
    const applications = rawRows.map(mapApplicationRowToResponse);

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error: any) {
    console.error('[DATABASE ERROR] Fetching applications failed:', error);
    const isProd = process.env.NODE_ENV === 'production';
    res.status(500).json({
      success: false,
      error: isProd ? 'An error occurred while fetching application records.' : 'Failed to retrieve applications',
      details: isProd ? undefined : error.message
    });
  }
}
