import { ipcRenderer } from 'electron'
import { PING_CHANNELS } from '@shared/channels'
import { IPingAPI } from '@shared/interfaces'

export const pingApi: IPingAPI = {
  getAll:  ()              => ipcRenderer.invoke(PING_CHANNELS.GET_ALL),
  send:    (message)       => ipcRenderer.invoke(PING_CHANNELS.SEND, message),
}
