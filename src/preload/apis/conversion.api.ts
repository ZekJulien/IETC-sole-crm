import { ipcRenderer } from 'electron'
import { CONVERSION_CHANNELS } from '@shared/channels/conversion'
import { ConversionAPI } from '@shared/interfaces/conversion'

export const conversionApi: ConversionAPI = {
  convertQuote:    (data)    => ipcRenderer.invoke(CONVERSION_CHANNELS.CONVERT_QUOTE, data),
  invoiceBalance:  (data)    => ipcRenderer.invoke(CONVERSION_CHANNELS.INVOICE_BALANCE, data),
  getQuoteBilling: (quoteId) => ipcRenderer.invoke(CONVERSION_CHANNELS.QUOTE_BILLING, quoteId),
}
