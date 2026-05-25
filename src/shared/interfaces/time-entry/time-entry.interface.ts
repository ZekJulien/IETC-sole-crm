import { IpcResponse } from '../../types'
import {
  TimeEntryDto, CreateTimeEntryDto, UpdateTimeEntryDto,
  TimeEntryFilter, SumByMonthDto, ProjectDurationCount,
} from '../../dtos/time-entry'

export interface TimeEntryAPI {
  getAll:       (filter?: TimeEntryFilter)   => Promise<IpcResponse<TimeEntryDto[]>>
  sumByProject: ()                           => Promise<IpcResponse<ProjectDurationCount>>
  sumByMonth:   (arg: SumByMonthDto)         => Promise<IpcResponse<number>>
  add:          (data: CreateTimeEntryDto)   => Promise<IpcResponse<TimeEntryDto>>
  update:       (data: UpdateTimeEntryDto)   => Promise<IpcResponse<TimeEntryDto>>
  remove:       (id: number)                 => Promise<IpcResponse<void>>
}
