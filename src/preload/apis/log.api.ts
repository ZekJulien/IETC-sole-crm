import { ipcRenderer } from 'electron'
import { LOG_CHANNELS } from '@shared/channels'

export const logApi = {
  error: (msg: string, ...args: unknown[]) => ipcRenderer.invoke(LOG_CHANNELS.ERROR, msg, ...args),
  warn:  (msg: string, ...args: unknown[]) => ipcRenderer.invoke(LOG_CHANNELS.WARN,  msg, ...args),
  info:  (msg: string, ...args: unknown[]) => ipcRenderer.invoke(LOG_CHANNELS.INFO,  msg, ...args),
}
