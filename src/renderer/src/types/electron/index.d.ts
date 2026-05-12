import { IPingAPI } from '@shared/interfaces/ping.interface'

interface ILogService {
  error: (msg: string, ...args: unknown[]) => Promise<void>
  warn:  (msg: string, ...args: unknown[]) => Promise<void>
  info:  (msg: string, ...args: unknown[]) => Promise<void>
}

declare global {
  interface Window {
    pingService: IPingAPI
    logService:  ILogService
  }
}
