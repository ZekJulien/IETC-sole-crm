export interface LogApi {
  error: (msg: string, ...args: unknown[]) => Promise<void>
  warn:  (msg: string, ...args: unknown[]) => Promise<void>
  info:  (msg: string, ...args: unknown[]) => Promise<void>
}