import { ipcMain } from 'electron'
import { z } from 'zod'
import { Prisma } from '@db/client'
import { IpcResponse } from '@shared/types/ipc-response.type'
import { AppError } from '../errors/app-error'
import { log } from './logger'
import { t } from '../i18n'
import { getDbContext } from './db'

function toIpcError(e: unknown): { message: string } {
  if (e instanceof AppError) {
    return { message: t(e.code) }
  }
  if (e instanceof z.ZodError) {
    const issues = e.issues.map(i => `${i.path.join('.') || 'value'}: ${i.message}`).join(', ')
    return { message: t('VALIDATION_FAILED', { issues }) }
  }
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    switch (e.code) {
      case 'P2002': {
        const target = e.meta?.target as string[] | string | undefined
        const field = Array.isArray(target) ? target.join(', ') : (target ?? 'champ')
        return { message: t('UNIQUE_VIOLATION', { field }) }
      }
      case 'P2003': return { message: t('FK_VIOLATION') }
      case 'P2025': return { message: t('NOT_FOUND') }
    }
  }
  log.error('[IPC] Unexpected error', e)
  return { message: t('UNKNOWN') }
}

function register(
  channel: string,
  schema: z.ZodType | null,
  fn: (...args: any[]) => unknown,
  transactional: boolean,
): void {
  ipcMain.handle(channel, async (_, ...args): Promise<IpcResponse<unknown>> => {
    try {
      const input = schema ? schema.parse(args[0]) : undefined
      const run = () => (schema ? fn(input) : fn(...args))
      const result = transactional
        ? await getDbContext().transaction(async () => run())
        : await run()
      return { data: (result ?? null), error: null }
    } catch (e) {
      return { data: null, error: toIpcError(e) }
    }
  })
}

export function ipcHandle<TOutput>(
  channel: string,
  fn: (...args: any[]) => Promise<TOutput> | TOutput | void
): void
export function ipcHandle<TSchema extends z.ZodType, TOutput>(
  channel: string,
  schema: TSchema,
  fn: (input: z.infer<TSchema>) => Promise<TOutput> | TOutput | void
): void
export function ipcHandle(channel: string, schemaOrFn: unknown, maybeFn?: unknown): void {
  const hasSchema = typeof schemaOrFn !== 'function'
  const schema = (hasSchema ? schemaOrFn : null) as z.ZodType | null
  const fn = (hasSchema ? maybeFn : schemaOrFn) as (...args: any[]) => unknown
  register(channel, schema, fn, true)
}

export function ipcHandleNoTx<TOutput>(
  channel: string,
  fn: (...args: any[]) => Promise<TOutput> | TOutput | void
): void
export function ipcHandleNoTx<TSchema extends z.ZodType, TOutput>(
  channel: string,
  schema: TSchema,
  fn: (input: z.infer<TSchema>) => Promise<TOutput> | TOutput | void
): void
export function ipcHandleNoTx(channel: string, schemaOrFn: unknown, maybeFn?: unknown): void {
  const hasSchema = typeof schemaOrFn !== 'function'
  const schema = (hasSchema ? schemaOrFn : null) as z.ZodType | null
  const fn = (hasSchema ? maybeFn : schemaOrFn) as (...args: any[]) => unknown
  register(channel, schema, fn, false)
}
