import { ipcRenderer } from 'electron'
import { TIME_ENTRY_CHANNELS } from '@shared/channels/time-entry'
import { TimeEntryAPI } from '@shared/interfaces/time-entry'

export const timeEntryApi: TimeEntryAPI = {
  getAll:       (filter) => ipcRenderer.invoke(TIME_ENTRY_CHANNELS.GET_ALL, filter),
  sumByProject: ()       => ipcRenderer.invoke(TIME_ENTRY_CHANNELS.SUM_BY_PROJECT),
  sumByMonth:   (arg)    => ipcRenderer.invoke(TIME_ENTRY_CHANNELS.SUM_BY_MONTH, arg),
  add:          (data)   => ipcRenderer.invoke(TIME_ENTRY_CHANNELS.ADD, data),
  update:       (data)   => ipcRenderer.invoke(TIME_ENTRY_CHANNELS.UPDATE, data),
  remove:       (id)     => ipcRenderer.invoke(TIME_ENTRY_CHANNELS.REMOVE, id),
}
