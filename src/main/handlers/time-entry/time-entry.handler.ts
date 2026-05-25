import { TIME_ENTRY_CHANNELS } from '@shared/channels/time-entry'
import {
  CreateTimeEntrySchema, UpdateTimeEntrySchema,
  TimeEntryFilterSchema, SumByMonthSchema,
} from '@shared/dtos/time-entry'
import { IdSchema } from '@shared/types'
import { ipcHandle } from '../../core/ipc.handle'
import { TimeEntryService } from '../../services/time-entry/time-entry.service'

export function registerTimeEntryHandlers(service: TimeEntryService): void {
  ipcHandle(TIME_ENTRY_CHANNELS.GET_ALL,        TimeEntryFilterSchema, (filter) => service.getAll(filter))
  ipcHandle(TIME_ENTRY_CHANNELS.SUM_BY_PROJECT,                        ()       => service.sumByProject())
  ipcHandle(TIME_ENTRY_CHANNELS.SUM_BY_MONTH,   SumByMonthSchema,      (arg)    => service.sumByMonth(arg))
  ipcHandle(TIME_ENTRY_CHANNELS.ADD,            CreateTimeEntrySchema, (data)   => service.add(data))
  ipcHandle(TIME_ENTRY_CHANNELS.UPDATE,         UpdateTimeEntrySchema, (data)   => service.update(data))
  ipcHandle(TIME_ENTRY_CHANNELS.REMOVE,         IdSchema,              (id)     => service.remove(id))
}
