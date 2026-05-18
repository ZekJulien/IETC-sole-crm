import { log } from '../core'
import { LOG_CHANNELS } from '@shared/channels'
import { ipcHandle } from '../core/ipc.handle'

export function registerLogHandlers(): void {
  ipcHandle(LOG_CHANNELS.ERROR, (msg: string, ...args: unknown[]) => log.error(`[RENDERER] ${msg}`, ...args))
  ipcHandle(LOG_CHANNELS.WARN,  (msg: string, ...args: unknown[]) => log.warn(`[RENDERER] ${msg}`,  ...args))
  ipcHandle(LOG_CHANNELS.INFO,  (msg: string, ...args: unknown[]) => log.info(`[RENDERER] ${msg}`,  ...args))
}
