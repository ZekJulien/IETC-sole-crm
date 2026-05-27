import { ipcRenderer } from 'electron'
import { PDF_CHANNELS } from '@shared/channels/pdf'
import { PdfAPI } from '@shared/interfaces/pdf'

export const pdfApi: PdfAPI = {
  exportInvoice: (data) => ipcRenderer.invoke(PDF_CHANNELS.EXPORT_INVOICE, data),
  exportQuote:   (data) => ipcRenderer.invoke(PDF_CHANNELS.EXPORT_QUOTE, data),
}
