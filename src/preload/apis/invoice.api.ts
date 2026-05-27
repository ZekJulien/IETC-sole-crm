import { ipcRenderer } from 'electron'
import { INVOICE_CHANNELS } from '@shared/channels/invoice'
import { InvoiceAPI } from '@shared/interfaces/invoice'

export const invoiceApi: InvoiceAPI = {
  get:           (args) => ipcRenderer.invoke(INVOICE_CHANNELS.GET, args),
  getById:       (id)   => ipcRenderer.invoke(INVOICE_CHANNELS.GET_BY_ID, id),
  countByStatus: ()     => ipcRenderer.invoke(INVOICE_CHANNELS.COUNT_BY_STATUS),
  getStats:      ()     => ipcRenderer.invoke(INVOICE_CHANNELS.GET_STATS),
  sumPaymentsByMonth: (arg) => ipcRenderer.invoke(INVOICE_CHANNELS.SUM_PAYMENTS_BY_MONTH, arg),
  add:           (data) => ipcRenderer.invoke(INVOICE_CHANNELS.ADD, data),
  update:        (data) => ipcRenderer.invoke(INVOICE_CHANNELS.UPDATE, data),
  updateStatus:  (data) => ipcRenderer.invoke(INVOICE_CHANNELS.UPDATE_STATUS, data),
  remove:        (id)   => ipcRenderer.invoke(INVOICE_CHANNELS.REMOVE, id),
  addPayment:    (data) => ipcRenderer.invoke(INVOICE_CHANNELS.ADD_PAYMENT, data),
  removePayment: (id)   => ipcRenderer.invoke(INVOICE_CHANNELS.REMOVE_PAYMENT, id),
}
