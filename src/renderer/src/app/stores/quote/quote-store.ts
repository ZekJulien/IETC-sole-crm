import { Injectable, computed, inject, signal } from '@angular/core'
import {
  QuoteDto, CreateQuoteDto, UpdateQuoteDto, UpdateQuoteStatusDto, QuoteStatusCount,
} from '@shared/dtos/quote'
import {
  ConvertQuoteDto, ConvertQuoteResultDto,
  InvoiceBalanceDto, InvoiceBalanceResultDto, QuoteBillingDto,
} from '@shared/dtos/conversion'
import { FindManyArgs } from '@shared/types'
import { QuoteService } from '@app/services/quote/quote'
import { ConversionService } from '@app/services/conversion/conversion'
import { ToastService } from '@app/services/toast/toast.service'
import { ErrorService } from '@app/services/error/error.service'
import { I18nService } from '@app/services/i18n/i18n'

@Injectable({ providedIn: 'root' })
export class QuoteStore {
  private readonly quoteSvc      = inject(QuoteService)
  private readonly conversionSvc = inject(ConversionService)
  private readonly toast         = inject(ToastService)
  private readonly errors        = inject(ErrorService)
  private readonly i18n          = inject(I18nService)

  private readonly _counts = signal<QuoteStatusCount>({})
  private readonly _saving = signal<boolean>(false)

  readonly quotes  = this.quoteSvc.quotes
  readonly loading = this.quoteSvc.loading
  readonly counts  = this._counts.asReadonly()
  readonly saving  = this._saving.asReadonly()
  readonly isEmpty = computed(() => this.quoteSvc.quotes().length === 0)

  async load(args?: FindManyArgs): Promise<void> {
    try {
      await this.quoteSvc.load(args)
      await this.refreshCounts()
    } catch (e) { this.errors.handle(e) }
  }

  async getById(id: number): Promise<QuoteDto | null> {
    try {
      return await this.quoteSvc.getById(id)
    } catch (e) { this.errors.handle(e); return null }
  }

  async add(data: CreateQuoteDto): Promise<QuoteDto | null> {
    this._saving.set(true)
    try {
      const created = await this.quoteSvc.add(data)
      await this.refreshCounts()
      this.toast.success(this.i18n.t('quote.toast.created'))
      return created
    } catch (e) { this.errors.handle(e); return null }
    finally { this._saving.set(false) }
  }

  async update(data: UpdateQuoteDto): Promise<QuoteDto | null> {
    this._saving.set(true)
    try {
      const updated = await this.quoteSvc.update(data)
      await this.refreshCounts()
      this.toast.success(this.i18n.t('quote.toast.saved'))
      return updated
    } catch (e) { this.errors.handle(e); return null }
    finally { this._saving.set(false) }
  }

  async updateStatus(data: UpdateQuoteStatusDto): Promise<QuoteDto | null> {
    try {
      const updated = await this.quoteSvc.updateStatus(data)
      await this.refreshCounts()
      this.toast.success(this.i18n.t('quote.toast.statusChanged'))
      return updated
    } catch (e) { this.errors.handle(e); return null }
  }

  async remove(id: number): Promise<boolean> {
    try {
      await this.quoteSvc.remove(id)
      await this.refreshCounts()
      this.toast.success(this.i18n.t('quote.toast.deleted'))
      return true
    } catch (e) { this.errors.handle(e); return false }
  }

  async convertQuote(data: ConvertQuoteDto): Promise<ConvertQuoteResultDto | null> {
    this._saving.set(true)
    try {
      const result = await this.conversionSvc.convertQuote(data)
      await this.refreshCounts()
      this.toast.success(this.i18n.t('conversion.toast.success'))
      return result
    } catch (e) { this.errors.handle(e); return null }
    finally { this._saving.set(false) }
  }

  async invoiceBalance(data: InvoiceBalanceDto): Promise<InvoiceBalanceResultDto | null> {
    this._saving.set(true)
    try {
      const result = await this.conversionSvc.invoiceBalance(data)
      this.toast.success(this.i18n.t('conversion.balance.toast'))
      return result
    } catch (e) { this.errors.handle(e); return null }
    finally { this._saving.set(false) }
  }

  async getQuoteBilling(quoteId: number): Promise<QuoteBillingDto | null> {
    try {
      return await this.conversionSvc.getQuoteBilling(quoteId)
    } catch (e) { this.errors.handle(e); return null }
  }

  private async refreshCounts(): Promise<void> {
    this._counts.set(await this.quoteSvc.countByStatus())
  }
}
