import { Prisma } from '@db/client'
import { CompanyDto, SaveCompanyDto, SaveCompanySettingsDto, SavePomodoroSettingsDto } from '@shared/dtos/company'
import { VatRegime } from '@shared/dtos/company/vat-regime.enum'
import { CompanyRepository } from '../../repositories/company/company.repository'
import { CompanySettingsService } from './company-settings.service'
import { BaseService } from '../base.service'
import { AppError } from '../../errors/app-error'
import { formatNumber } from '@shared/utils/format-number'

type CompanyWithSettings = Prisma.CompanyGetPayload<{ include: { settings: true } }>

export class CompanyService extends BaseService<CompanyWithSettings, CompanyDto> {
  constructor(
    private readonly repo: CompanyRepository,
    private readonly settingsService: CompanySettingsService,
  ) {
    super()
  }

  async getCompany(): Promise<CompanyDto | null> {
    return this.mapOne(await this.repo.get())
  }

  async saveCompany(company: SaveCompanyDto, settings?: SaveCompanySettingsDto): Promise<CompanyDto> {
    return this.toDto(await this.repo.upsert(company, settings))
  }

  async getNextInvoiceNumber(): Promise<string> {
    const company = await this.requireCompany()
    const { counter, year } = await this.settingsService.incrementInvoiceCounter()
    return formatNumber(company.settings.invoiceNumberFormat, counter, year)
  }

  async getNextQuoteNumber(): Promise<string> {
    const company = await this.requireCompany()
    const { counter, year } = await this.settingsService.incrementQuoteCounter()
    return formatNumber(company.settings.quoteNumberFormat, counter, year)
  }

  resetInvoiceCounter(value: number): Promise<void> {
    return this.settingsService.resetInvoiceCounter(value)
  }

  resetQuoteCounter(value: number): Promise<void> {
    return this.settingsService.resetQuoteCounter(value)
  }

  setDashboardNote(note: string): Promise<void> {
    return this.settingsService.setDashboardNote(note)
  }

  setPomodoroSettings(settings: SavePomodoroSettingsDto): Promise<void> {
    return this.settingsService.setPomodoroSettings(settings)
  }

  private async requireCompany(): Promise<CompanyWithSettings & { settings: NonNullable<CompanyWithSettings['settings']> }> {
    const company = await this.repo.get()
    if (!company || !company.settings) throw new AppError('COMPANY_NOT_CONFIGURED')
    return company as CompanyWithSettings & { settings: NonNullable<CompanyWithSettings['settings']> }
  }

  protected toDto(company: CompanyWithSettings): CompanyDto {
    const { settings, ...rest } = company
    if (!settings) throw new AppError('COMPANY_NOT_CONFIGURED')
    return { ...rest, settings: { ...settings, vatRegime: settings.vatRegime as VatRegime } }
  }
}
