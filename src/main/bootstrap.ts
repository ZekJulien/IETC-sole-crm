import { app } from 'electron'
import path from 'node:path'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@db/client'
import { initDb } from './core'
import { runMigrations } from './database'
import { buildDependencies } from './dependencies'
import { registerAllHandlers } from './handlers'

export async function bootstrap(): Promise<PrismaClient> {
  const dbPath = path.join(app.getPath('userData'), 'sole.db')
  const migrationsPath = path.join(__dirname, '../../prisma/migrations')

  runMigrations(dbPath, migrationsPath)

  const adapter = new PrismaBetterSqlite3({ url: 'file:' + dbPath })
  const prisma = new PrismaClient({ adapter })

  initDb(prisma)

  const deps = buildDependencies()
  registerAllHandlers(deps)

  return prisma
}
