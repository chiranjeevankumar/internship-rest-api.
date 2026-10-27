import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export interface Internship {
  id: string;
  title: string;
  domain: string;
  location: string;
  skills: string;
  openings: number;
  created_at?: string;
  updated_at?: string;
}

export interface InternshipInput {
  id?: string;
  title: string;
  domain: string;
  location: string;
  skills: string | string[];
  openings: number;
}

export const SEED_INTERNSHIPS: Internship[] = [
  {
    id: 'INT-101',
    title: 'Frontend Intern',
    domain: 'Full Stack Development',
    location: 'Remote India',
    skills: 'HTML/CSS/JavaScript',
    openings: 3
  },
  {
    id: 'INT-102',
    title: 'API Engineering Intern',
    domain: 'Full Stack Development',
    location: 'Hybrid Pune',
    skills: 'Node.js/SQL/Testing',
    openings: 2
  },
  {
    id: 'INT-103',
    title: 'UI/UX Intern',
    domain: 'UI/UX',
    location: 'Remote India',
    skills: 'Figma/User Research/Accessibility',
    openings: 1
  },
  {
    id: 'INT-104',
    title: 'Data Analyst Intern',
    domain: 'Data Analytics',
    location: 'On-site Bengaluru',
    skills: 'Excel/SQL/Data Visualisation',
    openings: 2
  },
  {
    id: 'INT-105',
    title: 'Security Operations Intern',
    domain: 'Cyber Security',
    location: 'Remote India',
    skills: 'Linux/Logs/Networking',
    openings: 1
  }
];

let dbInstance: Database.Database | null = null;

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
  
  // Enable foreign keys and WAL mode for reliability if not in-memory
  db.pragma('foreign_keys = ON');
  if (dbPath !== ':memory:') {
    db.pragma('journal_mode = WAL');
  }

  // Initialize Schema
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
      domain TEXT NOT NULL,
      location TEXT NOT NULL,
      skills TEXT NOT NULL,
      openings INTEGER NOT NULL CHECK(openings >= 0),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export function seedDatabase(db?: Database.Database): { seeded: number; total: number } {
  const targetDb = db || getDatabase();
  const insertStmt = targetDb.prepare(`
    INSERT OR IGNORE INTO internships (id, title, domain, location, skills, openings)
    VALUES (@id, @title, @domain, @location, @skills, @openings)
  `);

  let seededCount = 0;
  const transaction = targetDb.transaction((records: Internship[]) => {
    for (const record of records) {
      const result = insertStmt.run(record);
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
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
