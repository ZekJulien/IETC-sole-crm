import { app } from 'electron'
import { createWriteStream, statSync, renameSync, existsSync, mkdirSync, WriteStream } from 'node:fs'
import { join } from 'node:path'

const MAX_SIZE  = 5 * 1024 * 1024  // 5 MB
const MAX_FILES = 3

type Level = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
const LEVELS: Record<Level, number> = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 }

class Logger {
  readonly logPath: string
  private stream!: WriteStream
  private minLevel: Level

  constructor() {
    const dir = join(app.getPath('userData'), 'logs')
    mkdirSync(dir, { recursive: true })
    this.logPath  = join(dir, 'main.log')
    this.minLevel = app.isPackaged ? 'INFO' : 'DEBUG'
    this.openStream()
  }

  private openStream(): void {
    this.stream = createWriteStream(this.logPath, { flags: 'a' })
  }

  private rotate(): void {
    try {
      const { size } = statSync(this.logPath)
      if (size < MAX_SIZE) return

      this.stream.end()

      for (let i = MAX_FILES - 2; i >= 1; i--) {
        const from = this.logPath.replace('.log', `.${i}.log`)
        const to   = this.logPath.replace('.log', `.${i + 1}.log`)
        if (existsSync(from)) renameSync(from, to)
      }

      renameSync(this.logPath, this.logPath.replace('.log', '.1.log'))
      this.openStream()
    } catch { }
  }

  private write(level: Level, message: string, ...args: unknown[]): void {
    if (LEVELS[level] < LEVELS[this.minLevel]) return

    this.rotate()
    const extras = args.map(a => a instanceof Error ? a.stack : JSON.stringify(a)).join(' ')
    const line   = `[${new Date().toISOString()}] [${level}] ${message}${extras ? ' ' + extras : ''}\n`
    console[level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log'](line.trim())
    this.stream.write(line)
  }

  info  = (msg: string, ...a: unknown[]) => this.write('INFO',  msg, ...a)
  warn  = (msg: string, ...a: unknown[]) => this.write('WARN',  msg, ...a)
  error = (msg: string, ...a: unknown[]) => this.write('ERROR', msg, ...a)
  debug = (msg: string, ...a: unknown[]) => this.write('DEBUG', msg, ...a)

  catchErrors(): void {
    process.on('uncaughtException',  e => this.error('Uncaught exception', e))
    process.on('unhandledRejection', r => this.error('Unhandled rejection', r))
  }

  flush(): Promise<void> {
    return new Promise(resolve => this.stream.end(resolve))
  }
}

export const log = new Logger()
