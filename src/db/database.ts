import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export interface InternshipDBRow {
  id: string;
  title: string;
  description: string;
  domain: string;
  location: string;
  skills: string; // Stored as JSON stringified array in SQLite
  openings: number;
  created_at?: string;
  updated_at?: string;
}

export interface InternshipResponse {
  id: string;
  title: string;
  description: string;
  domain: string;
  location: string;
  skills: string[]; // Always returned as string[] to API clients
  openings: number;
  created_at?: string;
  updated_at?: string;
}

export interface InternshipInput {
  title: string;
  description: string;
  domain: string;
  location: string;
  skills: string | string[];
  openings: number;
}

export const SEED_INTERNSHIPS = [
  {
    id: 'INT-101',
    title: 'Frontend Intern',
    description: 'Work with modern frontend web technologies to build responsive user interfaces and interactive components.',
    domain: 'Full Stack Development',
    location: 'Remote India',
    skills: ['HTML', 'CSS', 'JavaScript'],
    openings: 3
  },
  {
    id: 'INT-102',
    title: 'API Engineering Intern',
    description: 'Design, build, and document robust RESTful APIs with Node.js and SQL databases.',
    domain: 'Full Stack Development',
    location: 'Hybrid Pune',
    skills: ['Node.js', 'SQL', 'Testing'],
    openings: 2
  },
  {
    id: 'INT-103',
    title: 'UI/UX Intern',
    description: 'Conduct user research, design wireframes, and create accessible user experiences using Figma.',
    domain: 'UI/UX',
    location: 'Remote India',
    skills: ['Figma', 'User Research', 'Accessibility'],
    openings: 1
  },
  {
    id: 'INT-104',
    title: 'Data Analyst Intern',
    description: 'Analyze datasets, construct SQL queries, and generate actionable insights with visual dashboards.',
    domain: 'Data Analytics',
    location: 'On-site Bengaluru',
    skills: ['Excel', 'SQL', 'Data Visualisation'],
    openings: 2
  },
  {
    id: 'INT-105',
    title: 'Security Operations Intern',
    description: 'Monitor network traffic, analyze security logs, and assist with security operations and threat management.',
    domain: 'Cyber Security',
    location: 'Remote India',
    skills: ['Linux', 'Logs', 'Networking'],
    openings: 1
  }
];

let dbInstance: Database.Database | null = null;

export function setDatabase(db: Database.Database | null) {
  dbInstance = db;
}

export function resetDatabase() {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch {}
    dbInstance = null;
  }
}

export function getDatabase(dbPathOverride?: string): Database.Database {
  if (dbInstance && !dbPathOverride) {
    return dbInstance;
  }

  const isTest = process.env.NODE_ENV === 'test';
  let dbPath = dbPathOverride;

  if (!dbPath) {
    if (isTest) {
      dbPath = ':memory:';
    } else {
      const dataDir = path.resolve(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      dbPath = path.join(dataDir, 'internships.db');
    }
  }

  const db = new Database(dbPath);
  
  db.pragma('foreign_keys = ON');
  if (dbPath !== ':memory:') {
    db.pragma('journal_mode = WAL');
  }

  initSchema(db);

  if (!dbPathOverride) {
    dbInstance = db;
  }

  return db;
}

export function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS internships (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      domain TEXT NOT NULL,
      location TEXT NOT NULL,
      skills TEXT NOT NULL,
      openings INTEGER NOT NULL CHECK(openings > 0),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migration check in case description column is missing in pre-existing DB file
  try {
    const tableInfo = db.prepare('PRAGMA table_info(internships)').all() as any[];
    const hasDescription = tableInfo.some((col: any) => col.name === 'description');
    if (!hasDescription) {
      db.exec("ALTER TABLE internships ADD COLUMN description TEXT NOT NULL DEFAULT '';");
    }
  } catch {}
}

export function formatSkillsForDb(skills: string | string[]): string {
  if (Array.isArray(skills)) {
    return JSON.stringify(skills.map(s => String(s).trim()).filter(Boolean));
  }
  const trimmed = String(skills || '').trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return JSON.stringify(parsed.map((s: any) => String(s).trim()).filter(Boolean));
      }
    } catch {}
  }
  const parts = trimmed.split(/[,/]/).map(s => s.trim()).filter(Boolean);
  return JSON.stringify(parts);
}

export function formatSkillsForResponse(skillsStr: string): string[] {
  if (!skillsStr) return [];
  try {
    const parsed = JSON.parse(skillsStr);
    if (Array.isArray(parsed)) {
      return parsed.map(s => String(s).trim()).filter(Boolean);
    }
  } catch {}
  return skillsStr.split(/[,/]/).map(s => s.trim()).filter(Boolean);
}

export function mapRowToResponse(row: InternshipDBRow): InternshipResponse {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    domain: row.domain,
    location: row.location,
    skills: formatSkillsForResponse(row.skills),
    openings: Number(row.openings),
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

export function seedDatabase(db?: Database.Database): { seeded: number; total: number } {
  const targetDb = db || getDatabase();
  const insertStmt = targetDb.prepare(`
    INSERT OR IGNORE INTO internships (id, title, description, domain, location, skills, openings)
    VALUES (@id, @title, @description, @domain, @location, @skills, @openings)
  `);

  let seededCount = 0;
  const transaction = targetDb.transaction((records: typeof SEED_INTERNSHIPS) => {
    for (const record of records) {
      const skillsDb = formatSkillsForDb(record.skills);
      const result = insertStmt.run({
        ...record,
        skills: skillsDb
      });
      if (result.changes > 0) {
        seededCount++;
      }
    }
  });

  transaction(SEED_INTERNSHIPS);

  const countStmt = targetDb.prepare('SELECT COUNT(*) as count FROM internships');
  const total = (countStmt.get() as { count: number }).count;

  return { seeded: seededCount, total };
}

export function closeDatabase() {
  resetDatabase();
}
