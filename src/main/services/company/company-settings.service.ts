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
}
