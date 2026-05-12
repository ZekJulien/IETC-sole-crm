import { ipcMain } from 'electron'
import { log } from '../core'
import { LOG_CHANNELS } from '@shared/channels'

export function registerLogHandlers(): void {
  ipcMain.handle(LOG_CHANNELS.ERROR, (_e, msg: string, ...args: unknown[]) => log.error(`[RENDERER] ${msg}`, ...args))
  ipcMain.handle(LOG_CHANNELS.WARN,  (_e, msg: string, ...args: unknown[]) => log.warn(`[RENDERER] ${msg}`,  ...args))
  ipcMain.handle(LOG_CHANNELS.INFO,  (_e, msg: string, ...args: unknown[]) => log.info(`[RENDERER] ${msg}`,  ...args))
}
