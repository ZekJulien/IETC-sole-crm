import Database from 'better-sqlite3'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'

export function runMigrations(dbPath: string, migrationsPath: string): void {
  const db = new Database(dbPath)
  db.pragma('foreign_keys = ON')

  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        "id"                  TEXT    NOT NULL PRIMARY KEY,
        "migration_name"      TEXT    NOT NULL,
        "finished_at"         TEXT,
        "applied_steps_count" INTEGER NOT NULL DEFAULT 0
      )
    `)

    const applied = new Set(
      (db.prepare('SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NOT NULL')
        .all() as { migration_name: string }[])
        .map(r => r.migration_name)
    )

    const pending = readdirSync(migrationsPath)
      .sort()
      .filter(dir => existsSync(join(migrationsPath, dir, 'migration.sql')) && !applied.has(dir))

    for (const dir of pending) {
      const sql = readFileSync(join(migrationsPath, dir, 'migration.sql'), 'utf-8')
      db.transaction(() => {
        db.exec(sql)
        db.prepare(
          `INSERT INTO "_prisma_migrations" (id, migration_name, finished_at, applied_steps_count) VALUES (?, ?, datetime('now'), 1)`
        ).run(randomUUID(), dir)
      })()
    }
  } finally {
    db.close()
  }
}
