import { ipcRenderer } from 'electron'
import { PROJECT_CHANNELS } from '@shared/channels/project'
import { ProjectAPI } from '@shared/interfaces/project'

export const projectApi: ProjectAPI = {
  get:     (args) => ipcRenderer.invoke(PROJECT_CHANNELS.GET, args),
  getById: (id)   => ipcRenderer.invoke(PROJECT_CHANNELS.GET_BY_ID, id),
  add:     (data) => ipcRenderer.invoke(PROJECT_CHANNELS.ADD, data),
  update:  (data) => ipcRenderer.invoke(PROJECT_CHANNELS.UPDATE, data),
  remove:  (id)   => ipcRenderer.invoke(PROJECT_CHANNELS.REMOVE, id),
}
