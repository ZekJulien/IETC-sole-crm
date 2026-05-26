import { AsyncLocalStorage } from 'node:async_hooks'
import { PrismaClient, Prisma } from '@db/client'

export type DbClient = PrismaClient | Prisma.TransactionClient

export class DbContext {
  private storage = new AsyncLocalStorage<Prisma.TransactionClient>()

  constructor(private readonly db: PrismaClient) {}

  get client(): DbClient {
    return this.storage.getStore() ?? this.db
  }

  async transaction<T>(fn: () => Promise<T>, options?: { maxWait?: number; timeout?: number }): Promise<T> {
    const existing = this.storage.getStore()
    if (existing) return fn()
    return this.db.$transaction(tx => this.storage.run(tx, fn), options)
  }
}
