/**
 * HDsys Free — Banco SQLite Local (offline-first)
 * Armazena medições localmente e sinaliza pendências de sync com Supabase.
 */
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'hdsys_free.db';

let _db = null;

const getDB = async () => {
    if (!_db) {
        _db = await SQLite.openDatabaseAsync(DB_NAME);
        await _db.execAsync(`PRAGMA journal_mode = WAL;`);
    }
    return _db;
};

// ── Schema ────────────────────────────────────────────────────────────────────
export const initDB = async () => {
    const db = await getDB();
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS measurements (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            pas         REAL    NOT NULL,
            pad         REAL    NOT NULL,
            pam         REAL    NOT NULL,
            heart_rate  REAL,
            glycemia    REAL,
            weight      REAL,
            height      REAL,
            measured_at TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
            synced      INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_measurements_synced     ON measurements(synced);
        CREATE INDEX IF NOT EXISTS idx_measurements_measured_at ON measurements(measured_at DESC);
    `);
};

// ── CRUD ──────────────────────────────────────────────────────────────────────

/** Insere uma nova medição (sempre local primeiro). */
export const insertMeasurement = async ({ pas, pad, pam, heartRate, glycemia, weight, height, measuredAt }) => {
    const db = await getDB();
    const result = await db.runAsync(
        `INSERT INTO measurements (pas, pad, pam, heart_rate, glycemia, weight, height, measured_at, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [pas, pad, pam, heartRate ?? null, glycemia ?? null, weight ?? null, height ?? null,
         measuredAt ?? new Date().toISOString()]
    );
    return result.lastInsertRowId;
};

/** Retorna as últimas N medições. */
export const getRecentMeasurements = async (limit = 50) => {
    const db = await getDB();
    return db.getAllAsync(
        `SELECT * FROM measurements ORDER BY measured_at DESC LIMIT ?`,
        [limit]
    );
};

/** Retorna todas as medições ainda não sincronizadas com Supabase. */
export const getPendingSync = async () => {
    const db = await getDB();
    return db.getAllAsync(
        `SELECT * FROM measurements WHERE synced = 0 ORDER BY measured_at ASC`
    );
};

/** Marca medições como sincronizadas pelo ID. */
export const markSynced = async (ids) => {
    if (!ids || ids.length === 0) return;
    const db = await getDB();
    const placeholders = ids.map(() => '?').join(',');
    await db.runAsync(
        `UPDATE measurements SET synced = 1 WHERE id IN (${placeholders})`,
        ids
    );
};

/** Deleta medições antigas já sincronizadas (limpeza). */
export const pruneOldSynced = async (keepDays = 30) => {
    const db = await getDB();
    await db.runAsync(
        `DELETE FROM measurements
         WHERE synced = 1 AND measured_at < datetime('now', '-' || ? || ' days')`,
        [keepDays]
    );
};

/** Estatísticas resumidas para o Dashboard Free. */
export const getLocalStats = async () => {
    const db = await getDB();
    const row = await db.getFirstAsync(`
        SELECT
            COUNT(*)   AS total,
            AVG(pam)   AS avg_pam,
            MIN(pam)   AS min_pam,
            MAX(pam)   AS max_pam,
            AVG(pas)   AS avg_pas,
            AVG(pad)   AS avg_pad,
            AVG(heart_rate) AS avg_hr,
            SUM(CASE WHEN synced = 0 THEN 1 ELSE 0 END) AS pending_sync
        FROM measurements
    `);
    return row;
};
