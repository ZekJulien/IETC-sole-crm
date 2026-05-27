import { z } from 'zod'
import { COMPANY_CHANNELS } from '@shared/channels/company'
import { SaveCompanyInputSchema, CounterValueSchema, SavePomodoroSettingsSchema } from '@shared/dtos/company'
import { ipcHandle } from '../../core/ipc.handle'
import { CompanyService } from '../../services/company/company.service'

export function registerCompanyHandlers(service: CompanyService): void {
  ipcHandle(COMPANY_CHANNELS.GET,                   ()      => service.getCompany())
  ipcHandle(COMPANY_CHANNELS.SAVE,                  SaveCompanyInputSchema, (input) => service.saveCompany(input.company, input.settings))
  ipcHandle(COMPANY_CHANNELS.RESET_INVOICE_COUNTER, CounterValueSchema,     (value) => service.resetInvoiceCounter(value))
  ipcHandle(COMPANY_CHANNELS.RESET_QUOTE_COUNTER,   CounterValueSchema,     (value) => service.resetQuoteCounter(value))
  ipcHandle(COMPANY_CHANNELS.SET_DASHBOARD_NOTE,    z.string(),             (note)  => service.setDashboardNote(note))
  ipcHandle(COMPANY_CHANNELS.SET_POMODORO_SETTINGS, SavePomodoroSettingsSchema, (s)  => service.setPomodoroSettings(s))
}
