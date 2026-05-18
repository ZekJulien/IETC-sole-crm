import { ipcRenderer } from 'electron'
import { CLIENT_CHANNELS } from '@shared/channels/client'
import { ClientAPI } from '@shared/interfaces/client'

export const clientApi: ClientAPI = {
  get:      (args)  => ipcRenderer.invoke(CLIENT_CHANNELS.GET, args),
  getById:  (id)    => ipcRenderer.invoke(CLIENT_CHANNELS.GET_BY_ID, id),
  add:      (data)  => ipcRenderer.invoke(CLIENT_CHANNELS.ADD, data),
  update:   (data)  => ipcRenderer.invoke(CLIENT_CHANNELS.UPDATE, data),
  remove:   (id)    => ipcRenderer.invoke(CLIENT_CHANNELS.REMOVE, id),
}
