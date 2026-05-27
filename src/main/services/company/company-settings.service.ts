import { SavePomodoroSettingsDto } from '@shared/dtos/company'
import { CompanySettingsRepository } from '../../repositories/company/company-settings.repository'

export class CompanySettingsService {
  constructor(private readonly repo: CompanySettingsRepository) {}

  incrementInvoiceCounter(): Promise<{ counter: number; year: number }> {
    return this.repo.incrementInvoiceCounter()
  }

  incrementQuoteCounter(): Promise<{ counter: number; year: number }> {
    return this.repo.incrementQuoteCounter()
  }

  resetInvoiceCounter(value: number): Promise<void> {
    return this.repo.resetInvoiceCounter(value)
  }

  resetQuoteCounter(value: number): Promise<void> {
    return this.repo.resetQuoteCounter(value)
  }

  setDashboardNote(note: string): Promise<void> {
    return this.repo.setDashboardNote(note)
  }

  setPomodoroSettings(settings: SavePomodoroSettingsDto): Promise<void> {
    return this.repo.setPomodoroSettings(settings)
  }
}
