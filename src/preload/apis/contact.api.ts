import { ipcRenderer } from 'electron'
import { CONTACT_CHANNELS } from '@shared/channels/client'
import { ContactAPI } from '@shared/interfaces/client'

export const contactApi: ContactAPI = {
  get:           (args)      => ipcRenderer.invoke(CONTACT_CHANNELS.GET, args),
  getByClientId: (clientId)  => ipcRenderer.invoke(CONTACT_CHANNELS.GET_BY_CLIENT_ID, clientId),
  add:           (data)      => ipcRenderer.invoke(CONTACT_CHANNELS.ADD, data),
  update:        (data)      => ipcRenderer.invoke(CONTACT_CHANNELS.UPDATE, data),
  remove:        (id)        => ipcRenderer.invoke(CONTACT_CHANNELS.REMOVE, id),
}
