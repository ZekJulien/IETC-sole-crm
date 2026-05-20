import { Prisma } from '@db/client'
import { CompanyDto, SaveCompanyDto, SaveCompanySettingsDto } from '@shared/dtos/company'
import { CompanyRepository } from '../../repositories/company/company.repository'
import { CompanySettingsService } from './company-settings.service'
import { BaseService } from '../base.service'
import { AppError } from '../../errors/app-error'
import { formatNumber } from './format-number'

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

  private async requireCompany(): Promise<CompanyWithSettings & { settings: NonNullable<CompanyWithSettings['settings']> }> {
    const company = await this.repo.get()
    if (!company || !company.settings) throw new AppError('COMPANY_NOT_CONFIGURED')
    return company as CompanyWithSettings & { settings: NonNullable<CompanyWithSettings['settings']> }
  }

  protected toDto(company: CompanyWithSettings): CompanyDto {
    const { settings, ...rest } = company
    if (!settings) throw new AppError('COMPANY_NOT_CONFIGURED')
    return { ...rest, settings }
  }
}
