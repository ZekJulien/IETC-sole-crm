import { ipcRenderer } from 'electron'
import { LOG_CHANNELS } from '@shared/channels'
import { LogApi } from '@shared/interfaces'

export const logApi : LogApi = {
  error: (msg: string, ...args: unknown[]) => ipcRenderer.invoke(LOG_CHANNELS.ERROR, msg, ...args),
  warn:  (msg: string, ...args: unknown[]) => ipcRenderer.invoke(LOG_CHANNELS.WARN,  msg, ...args),
  info:  (msg: string, ...args: unknown[]) => ipcRenderer.invoke(LOG_CHANNELS.INFO,  msg, ...args),
}
