import { DbContext } from '../../core/db-context'

const COMPANY_ID = 'default'

export class CompanySettingsRepository {
  constructor(private readonly dbContext: DbContext) {}

  incrementInvoiceCounter(): Promise<{ counter: number; year: number }> {
    return this.incrementCounter(
      'invoiceNumberCounter',
      'invoiceCounterResetYearly',
      'invoiceCounterYear',
    )
  }

  incrementQuoteCounter(): Promise<{ counter: number; year: number }> {
    return this.incrementCounter(
      'quoteNumberCounter',
      'quoteCounterResetYearly',
      'quoteCounterYear',
    )
  }

  async resetInvoiceCounter(value: number): Promise<void> {
    await this.dbContext.client.companySettings.update({
      where: { companyId: COMPANY_ID },
      data: {
        invoiceNumberCounter: value,
        invoiceCounterYear: new Date().getFullYear(),
      },
    })
  }

  async resetQuoteCounter(value: number): Promise<void> {
    await this.dbContext.client.companySettings.update({
      where: { companyId: COMPANY_ID },
      data: {
        quoteNumberCounter: value,
        quoteCounterYear: new Date().getFullYear(),
      },
    })
  }

  async setDashboardNote(note: string): Promise<void> {
    await this.dbContext.client.companySettings.update({
      where: { companyId: COMPANY_ID },
      data: { dashboardNote: note },
    })
  }

  private async incrementCounter(
    counterField: 'invoiceNumberCounter' | 'quoteNumberCounter',
    resetYearlyField: 'invoiceCounterResetYearly' | 'quoteCounterResetYearly',
    yearField: 'invoiceCounterYear' | 'quoteCounterYear',
  ): Promise<{ counter: number; year: number }> {
    const currentYear = new Date().getFullYear()

    const settings = await this.dbContext.client.companySettings.findUniqueOrThrow({
      where: { companyId: COMPANY_ID },
    })

    const needsReset = settings[resetYearlyField] && settings[yearField] !== currentYear
    const nextCounter = needsReset ? 1 : settings[counterField] + 1

    await this.dbContext.client.companySettings.update({
      where: { companyId: COMPANY_ID },
      data: {
        [counterField]: nextCounter,
        [yearField]: currentYear,
      },
    })

    return { counter: nextCounter, year: currentYear }
  }
}
