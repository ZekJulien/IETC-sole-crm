import { ipcRenderer } from 'electron'
import { COMPANY_CHANNELS } from '@shared/channels/company'
import { CompanyAPI } from '@shared/interfaces/company'

export const companyApi: CompanyAPI = {
  get:                 ()      => ipcRenderer.invoke(COMPANY_CHANNELS.GET),
  save:                (input) => ipcRenderer.invoke(COMPANY_CHANNELS.SAVE, input),
  resetInvoiceCounter: (value) => ipcRenderer.invoke(COMPANY_CHANNELS.RESET_INVOICE_COUNTER, value),
  resetQuoteCounter:   (value) => ipcRenderer.invoke(COMPANY_CHANNELS.RESET_QUOTE_COUNTER, value),
  setDashboardNote:    (note)  => ipcRenderer.invoke(COMPANY_CHANNELS.SET_DASHBOARD_NOTE, note),
  setPomodoroSettings: (s)     => ipcRenderer.invoke(COMPANY_CHANNELS.SET_POMODORO_SETTINGS, s),
}
