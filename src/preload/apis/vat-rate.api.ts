import { ipcRenderer } from 'electron'
import { VAT_RATE_CHANNELS } from '@shared/channels/vat-rate'
import { VatRateAPI } from '@shared/interfaces/vat-rate'

export const vatRateApi: VatRateAPI = {
  get:    (args) => ipcRenderer.invoke(VAT_RATE_CHANNELS.GET, args),
  add:    (data) => ipcRenderer.invoke(VAT_RATE_CHANNELS.ADD, data),
  update: (data) => ipcRenderer.invoke(VAT_RATE_CHANNELS.UPDATE, data),
  remove: (id)   => ipcRenderer.invoke(VAT_RATE_CHANNELS.REMOVE, id),
}
