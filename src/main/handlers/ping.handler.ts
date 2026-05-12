import { ipcMain } from 'electron'
import { PingService } from '../services'
import { PING_CHANNELS } from '@shared/channels'

export function registerPingHandlers(pingService: PingService): void {
  ipcMain.handle(PING_CHANNELS.GET_ALL, () => pingService.getAll())
  ipcMain.handle(PING_CHANNELS.SEND, (_e, message: string) => pingService.send(message))
}
