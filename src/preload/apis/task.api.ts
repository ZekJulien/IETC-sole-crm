import { ipcRenderer } from 'electron'
import { TASK_CHANNELS } from '@shared/channels/task'
import { TaskAPI } from '@shared/interfaces/task'

export const taskApi: TaskAPI = {
  getByProject:  (projectId) => ipcRenderer.invoke(TASK_CHANNELS.GET_BY_PROJECT, projectId),
  countByStatus: (projectId) => ipcRenderer.invoke(TASK_CHANNELS.COUNT_BY_STATUS, projectId),
  add:           (data)      => ipcRenderer.invoke(TASK_CHANNELS.ADD, data),
  update:        (data)      => ipcRenderer.invoke(TASK_CHANNELS.UPDATE, data),
  toggleStatus:  (id)        => ipcRenderer.invoke(TASK_CHANNELS.TOGGLE_STATUS, id),
  remove:        (id)        => ipcRenderer.invoke(TASK_CHANNELS.REMOVE, id),
}
