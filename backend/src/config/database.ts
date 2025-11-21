import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database.sqlite');

// Inicializar la base de datos SQLite
export const db = new Database(dbPath, { verbose: console.log });

// Habilitar foreign keys
db.pragma('foreign_keys = ON');

/**
 * Inicializa las tablas de la base de datos
 */
export function initializeDatabase() {
    // Tabla de usuarios
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      password_hash TEXT,
      name TEXT,
      is_anonymous INTEGER DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

    // Tabla de perfiles de riesgo
    db.exec(`
    CREATE TABLE IF NOT EXISTS risk_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      overall_score REAL NOT NULL,
      health_score REAL,
      financial_score REAL,
      auto_score REAL,
      home_score REAL,
      insurance_level REAL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

    // Tabla de respuestas a cuestionarios
    db.exec(`
    CREATE TABLE IF NOT EXISTS questionnaire_responses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      category TEXT NOT NULL,
      question_id TEXT NOT NULL,
      answer_value TEXT NOT NULL,
      risk_weight REAL NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

    // Tabla de gamificación (puntos, niveles)
    db.exec(`
    CREATE TABLE IF NOT EXISTS user_gamification (
      user_id TEXT PRIMARY KEY,
      total_points INTEGER DEFAULT 0,
      current_level INTEGER DEFAULT 1,
      badges_unlocked TEXT DEFAULT '[]',
      missions_completed TEXT DEFAULT '[]',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

    // Tabla de leads de prospección
    db.exec(`
    CREATE TABLE IF NOT EXISTS prospect_leads (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      risk_score REAL,
      message TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

    console.log('✅ Base de datos inicializada correctamente');
}

/**
 * Cierra la conexión a la base de datos
 */
export function closeDatabase() {
    db.close();
    console.log('🔌 Base de datos cerrada');
}
