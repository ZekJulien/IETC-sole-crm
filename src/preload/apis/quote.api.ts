import { ipcRenderer } from 'electron'
import { QUOTE_CHANNELS } from '@shared/channels/quote'
import { QuoteAPI } from '@shared/interfaces/quote'

export const quoteApi: QuoteAPI = {
  get:           (args) => ipcRenderer.invoke(QUOTE_CHANNELS.GET, args),
  getById:       (id)   => ipcRenderer.invoke(QUOTE_CHANNELS.GET_BY_ID, id),
  countByStatus: ()     => ipcRenderer.invoke(QUOTE_CHANNELS.COUNT_BY_STATUS),
  add:           (data) => ipcRenderer.invoke(QUOTE_CHANNELS.ADD, data),
  update:        (data) => ipcRenderer.invoke(QUOTE_CHANNELS.UPDATE, data),
  updateStatus:  (data) => ipcRenderer.invoke(QUOTE_CHANNELS.UPDATE_STATUS, data),
  remove:        (id)   => ipcRenderer.invoke(QUOTE_CHANNELS.REMOVE, id),
}
