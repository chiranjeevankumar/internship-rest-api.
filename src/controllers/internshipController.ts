import { Request, Response } from 'express';
import { getDatabase, Internship, InternshipInput } from '../db/database.js';

const startTime = Date.now();

// GET /api/health
export function getHealth(req: Request, res: Response): void {
  try {
    const db = getDatabase();
    // Verify db query
    const result = db.prepare('SELECT 1 as test').get() as { test: number };
    const isDbConnected = result && result.test === 1;

    res.status(200).json({
      success: true,
      status: 'OK',
      message: 'Internship REST API service is healthy',
      timestamp: new Date().toISOString(),
      database: isDbConnected ? 'connected' : 'disconnected',
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000)
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      status: 'ERROR',
      message: 'Database check failed',
      error: error.message
    });
  }
}

// GET /api/internships
export function getInternships(req: Request, res: Response): void {
  try {
    const db = getDatabase();
    
    // Parse query params
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
    const offset = (page - 1) * limit;

    const search = (req.query.search || req.query.q || '').toString().trim();
    const domainFilter = (req.query.domain || '').toString().trim();
    const locationFilter = (req.query.location || '').toString().trim();

    const sortField = ['id', 'title', 'domain', 'location', 'openings', 'created_at'].includes(req.query.sort as string)
      ? (req.query.sort as string)
      : 'created_at';
    const sortOrder = (req.query.order as string)?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Build SQL query dynamically with bound parameters
    const conditions: string[] = [];
    const params: any[] = [];

    if (search) {
      conditions.push('(title LIKE ? OR domain LIKE ? OR location LIKE ? OR skills LIKE ?)');
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (domainFilter) {
      conditions.push('domain LIKE ?');
      params.push(`%${domainFilter}%`);
    }

    if (locationFilter) {
      conditions.push('location LIKE ?');
      params.push(`%${locationFilter}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total matching records
    const countSql = `SELECT COUNT(*) as total FROM internships ${whereClause}`;
    const countResult = db.prepare(countSql).get(...params) as { total: number };
    const total = countResult ? countResult.total : 0;
    const totalPages = Math.ceil(total / limit) || 1;

    // Retrieve page of records
    const dataSql = `
      SELECT id, title, domain, location, skills, openings, created_at, updated_at 
      FROM internships 
      ${whereClause} 
      ORDER BY ${sortField} ${sortOrder} 
      LIMIT ? OFFSET ?
    `;
    const dataParams = [...params, limit, offset];
    const internships = db.prepare(dataSql).all(...dataParams) as Internship[];

    res.status(200).json({
      success: true,
      count: internships.length,
      total,
      page,
      limit,
      totalPages,
      data: internships
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve internships',
      details: error.message
    });
  }
}

// GET /api/internships/:id
export function getInternshipById(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const stmt = db.prepare('SELECT id, title, domain, location, skills, openings, created_at, updated_at FROM internships WHERE id = ?');
    const internship = stmt.get(id) as Internship | undefined;

    if (!internship) {
      res.status(404).json({
        success: false,
        error: `Internship with ID '${id}' not found`
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: internship
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch internship details',
      details: error.message
    });
  }
}

// Helper to auto-generate next INT-XXX ID
function generateNextId(db: any): string {
  const records = db.prepare("SELECT id FROM internships WHERE id LIKE 'INT-%'").all() as { id: string }[];
  let maxNum = 100;
  for (const record of records) {
    const numPart = parseInt(record.id.replace('INT-', ''), 10);
    if (!isNaN(numPart) && numPart > maxNum) {
      maxNum = numPart;
    }
  }
  return `INT-${maxNum + 1}`;
}

// POST /api/internships
export function createInternship(req: Request, res: Response): void {
  try {
    const db = getDatabase();
    const input: InternshipInput = req.body;

    let idToUse = input.id ? input.id.trim() : generateNextId(db);

    // Check if duplicate ID exists
    const existing = db.prepare('SELECT id FROM internships WHERE id = ?').get(idToUse);
    if (existing) {
      res.status(400).json({
        success: false,
        error: `Internship with ID '${idToUse}' already exists.`
      });
      return;
    }

    const skillsFormatted = Array.isArray(input.skills) 
      ? input.skills.map((s) => s.trim()).join(', ') 
      : input.skills.trim();

    const insertStmt = db.prepare(`
      INSERT INTO internships (id, title, domain, location, skills, openings)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      idToUse,
      input.title.trim(),
      input.domain.trim(),
      input.location.trim(),
      skillsFormatted,
      Number(input.openings)
    );

    const createdRecord = db.prepare('SELECT id, title, domain, location, skills, openings, created_at, updated_at FROM internships WHERE id = ?').get(idToUse) as Internship;

    res.status(201).json({
      success: true,
      message: 'Internship created successfully',
      data: createdRecord
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to create internship',
      details: error.message
    });
  }
}

// PUT /api/internships/:id
export function updateInternship(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Check if existing record exists
    const existing = db.prepare('SELECT * FROM internships WHERE id = ?').get(id) as Internship | undefined;
    if (!existing) {
      res.status(404).json({
        success: false,
        error: `Internship with ID '${id}' not found`
      });
      return;
    }

    const { title, domain, location, skills, openings } = req.body;

    const newTitle = title !== undefined ? title.trim() : existing.title;
    const newDomain = domain !== undefined ? domain.trim() : existing.domain;
    const newLocation = location !== undefined ? location.trim() : existing.location;
    const newSkills = skills !== undefined 
      ? (Array.isArray(skills) ? skills.map((s: string) => s.trim()).join(', ') : skills.trim())
      : existing.skills;
    const newOpenings = openings !== undefined ? Number(openings) : existing.openings;

    const updateStmt = db.prepare(`
      UPDATE internships
      SET title = ?, domain = ?, location = ?, skills = ?, openings = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateStmt.run(newTitle, newDomain, newLocation, newSkills, newOpenings, id);

    const updatedRecord = db.prepare('SELECT id, title, domain, location, skills, openings, created_at, updated_at FROM internships WHERE id = ?').get(id) as Internship;

    res.status(200).json({
      success: true,
      message: 'Internship updated successfully',
      data: updatedRecord
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to update internship',
      details: error.message
    });
  }
}

// DELETE /api/internships/:id
export function deleteInternship(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const existing = db.prepare('SELECT id FROM internships WHERE id = ?').get(id);
    if (!existing) {
      res.status(404).json({
        success: false,
        error: `Internship with ID '${id}' not found`
      });
      return;
    }

    const deleteStmt = db.prepare('DELETE FROM internships WHERE id = ?');
    deleteStmt.run(id);

    res.status(200).json({
      success: true,
      message: 'Internship deleted successfully',
      deletedId: id
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete internship',
      details: error.message
    });
  }
}
