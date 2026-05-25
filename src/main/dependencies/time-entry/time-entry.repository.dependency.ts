import { getDbContext } from '../../core'
import { TimeEntryRepository } from '../../repositories/time-entry/time-entry.repository'

let _instance: TimeEntryRepository | null = null

export function getTimeEntryRepository(): TimeEntryRepository {
  if (!_instance) _instance = new TimeEntryRepository(getDbContext())
  return _instance
}
