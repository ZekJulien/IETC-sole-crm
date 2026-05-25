import { Injectable } from '@angular/core'
import {
  TimeEntryDto, CreateTimeEntryDto, UpdateTimeEntryDto,
  TimeEntryFilter, ProjectDurationCount,
} from '@shared/dtos/time-entry'

@Injectable({ providedIn: 'root' })
export class TimeEntryService {
  async getAll(filter?: TimeEntryFilter): Promise<TimeEntryDto[]> {
    const res = await window.api.timeEntry.getAll(filter)
    if (res.error) throw new Error(res.error.message)
    return res.data!
  }

  async sumByProject(): Promise<ProjectDurationCount> {
    const res = await window.api.timeEntry.sumByProject()
    if (res.error) throw new Error(res.error.message)
    return res.data!
  }

  async sumByMonth(year: number, month: number): Promise<number> {
    const res = await window.api.timeEntry.sumByMonth({ year, month })
    if (res.error) throw new Error(res.error.message)
    return res.data!
  }

  async add(data: CreateTimeEntryDto): Promise<TimeEntryDto> {
    const res = await window.api.timeEntry.add(data)
    if (res.error) throw new Error(res.error.message)
    return res.data!
  }

  async update(data: UpdateTimeEntryDto): Promise<TimeEntryDto> {
    const res = await window.api.timeEntry.update(data)
    if (res.error) throw new Error(res.error.message)
    return res.data!
  }

  async remove(id: number): Promise<void> {
    const res = await window.api.timeEntry.remove(id)
    if (res.error) throw new Error(res.error.message)
  }
}
