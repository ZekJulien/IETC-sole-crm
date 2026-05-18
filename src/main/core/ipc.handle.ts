import { ipcMain } from 'electron'
import { Prisma } from '@db/client'
import { IpcResponse } from '@shared/types/ipc-response.type'
import { AppError } from '../errors/app-error'
import { log } from './logger'
import { t } from '../i18n'

function toIpcError(e: unknown): { message: string } {
  if (e instanceof AppError) {
    return { message: t(e.code) }
  }
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    switch (e.code) {
      case 'P2002': return { message: t('EMAIL_ALREADY_IN_USE') }
      case 'P2003': return { message: t('FK_VIOLATION') }
      case 'P2025': return { message: t('NOT_FOUND') }
    }
  }
  log.error('[IPC] Unexpected error', e)
  return { message: t('UNKNOWN') }
}

export function ipcHandle<T>(
  channel: string,
  fn: (...args: any[]) => Promise<T> | void
): void {
  ipcMain.handle(channel, async (_, ...args): Promise<IpcResponse<T>> => {
    try {
      const result = await fn(...args)
      return { data: (result ?? null) as T | null, error: null }
    } catch (e) {
      return { data: null, error: toIpcError(e) }
    }
  })
}
