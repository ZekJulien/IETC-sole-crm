import { PrismaClient } from '@db/client'
import { DbContext } from './db-context'

let _dbContext: DbContext | null = null

export function initDbContext(prisma: PrismaClient): void {
  _dbContext = new DbContext(prisma)
}

export function getDbContext(): DbContext {
  if (!_dbContext) throw new Error('DbContext not initialized — call initDbContext() first')
  return _dbContext
}
