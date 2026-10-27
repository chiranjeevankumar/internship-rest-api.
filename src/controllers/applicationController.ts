import { Request, Response } from 'express';
import {
  getDatabase,
  ApplicationDBRow,
  ApplicationInput,
  mapApplicationRowToResponse
} from '../db/database.js';

function generateNextApplicationId(db: any): string {
  const records = db.prepare("SELECT id FROM applications WHERE id LIKE 'APP-%'").all() as { id: string }[];
  let maxNum = 1000;
  for (const record of records) {
    const numPart = parseInt(record.id.replace('APP-', ''), 10);
    if (!isNaN(numPart) && numPart > maxNum) {
      maxNum = numPart;
    }
  }
  return `APP-${maxNum + 1}`;
}

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
    const appId = generateNextApplicationId(db);

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
    res.status(500).json({
      success: false,
      error: 'Failed to submit application',
      details: error.message
    });
  }
}

// GET /api/applications
export function getApplications(req: Request, res: Response): void {
  try {
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
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve applications',
      details: error.message
    });
  }
}
