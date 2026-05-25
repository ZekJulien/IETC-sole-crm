import { basename } from 'node:path'
import { getDbContext } from './db'
import { storeFile, deleteManagedFile } from './file-storage'

export interface StagedFile { name: string; path: string }

export interface PersistWithFilesOptions<T> {
  scope: string
  incoming?: string[]
  obsolete?: string[]
  date?: Date
  run: (staged: StagedFile[]) => Promise<T>
}

export async function persistWithFiles<T>(opts: PersistWithFilesOptions<T>): Promise<T> {
  const staged: StagedFile[] = []
  for (const externalPath of opts.incoming ?? []) {
    staged.push({ name: basename(externalPath), path: await storeFile(externalPath, opts.scope, opts.date ?? new Date()) })
  }
  try {
    const result = await getDbContext().transaction(() => opts.run(staged))
    for (const path of opts.obsolete ?? []) await deleteManagedFile(path)
    return result
  } catch (e) {
    for (const s of staged) await deleteManagedFile(s.path)
    throw e
  }
}
