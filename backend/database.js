const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'incidents.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeDb();
  }
  return db;
}

function initializeDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      service TEXT NOT NULL,
      severity TEXT NOT NULL CHECK(severity IN ('SEV1', 'SEV2', 'SEV3', 'SEV4')),
      status TEXT NOT NULL CHECK(status IN ('OPEN', 'MITIGATED', 'RESOLVED')),
      owner TEXT,
      summary TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
    CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
    CREATE INDEX IF NOT EXISTS idx_incidents_service ON incidents(service);
    CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at);
    CREATE INDEX IF NOT EXISTS idx_incidents_title ON incidents(title);
  `);
}

module.exports = { getDb };
