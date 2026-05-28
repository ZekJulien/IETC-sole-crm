import { app } from 'electron'
import { randomUUID } from 'node:crypto'
import { mkdir, copyFile, rm } from 'node:fs/promises'
import { basename, join, resolve, sep } from 'node:path'

function storageRoot(): string {
  return join(app.getPath('userData'), 'storage')
}

export function isManagedFile(filePath: string): boolean {
  const root     = storageRoot()
  const resolved = resolve(filePath)
  return resolved === root || resolved.startsWith(root + sep)
}

export async function storeFile(externalPath: string, scope: string, date: Date = new Date()): Promise<string> {
  const dir = join(storageRoot(), scope, String(date.getFullYear()))
  await mkdir(dir, { recursive: true })
  const target = join(dir, `${randomUUID()}_${basename(externalPath)}`)
  await copyFile(externalPath, target)
  return target
}

export async function deleteManagedFile(filePath: string | null): Promise<void> {
  if (!filePath || !isManagedFile(filePath)) return
  await rm(filePath, { force: true })
}

export async function clearAllStorage(): Promise<void> {
  await rm(storageRoot(), { recursive: true, force: true })
}
