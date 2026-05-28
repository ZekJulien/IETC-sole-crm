import { Injectable } from '@angular/core'
import {
  TimeEntryDto, CreateTimeEntryDto, UpdateTimeEntryDto,
  TimeEntryFilter, ProjectDurationCount,
} from '@shared/dtos/time-entry'
import { unwrap } from '@app/utils'

@Injectable({ providedIn: 'root' })
export class TimeEntryService {
  async getAll(filter?: TimeEntryFilter): Promise<TimeEntryDto[]> {
    return unwrap(await window.api.timeEntry.getAll(filter))
  }

  async sumByProject(): Promise<ProjectDurationCount> {
    return unwrap(await window.api.timeEntry.sumByProject())
  }

  async sumByMonth(year: number, month: number): Promise<number> {
    return unwrap(await window.api.timeEntry.sumByMonth({ year, month }))
  }

  async add(data: CreateTimeEntryDto): Promise<TimeEntryDto> {
    return unwrap(await window.api.timeEntry.add(data))
  }

  async update(data: UpdateTimeEntryDto): Promise<TimeEntryDto> {
    return unwrap(await window.api.timeEntry.update(data))
  }

  async remove(id: number): Promise<void> {
    unwrap(await window.api.timeEntry.remove(id))
  }
}
