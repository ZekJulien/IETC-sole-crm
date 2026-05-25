import { TimeEntryService } from '../../services/time-entry/time-entry.service'
import { getTimeEntryRepository } from './time-entry.repository.dependency'

let _instance: TimeEntryService | null = null

export function getTimeEntryService(): TimeEntryService {
  if (!_instance) _instance = new TimeEntryService(getTimeEntryRepository())
  return _instance
}
