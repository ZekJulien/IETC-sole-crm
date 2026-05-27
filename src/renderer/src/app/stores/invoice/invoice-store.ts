import { Injectable, computed, inject, signal } from '@angular/core'
import {
  InvoiceDto, CreateInvoiceDto, UpdateInvoiceDto, UpdateInvoiceStatusDto,
  RecordPaymentDto, InvoiceStatusCount, InvoiceStats,
} from '@shared/dtos/invoice'
import { FindManyArgs } from '@shared/types'
import { InvoiceService } from '@app/services/invoice/invoice'
import { PdfService } from '@app/services/pdf'
import { ToastService } from '@app/services/toast/toast.service'
import { ErrorService } from '@app/services/error/error.service'
import { I18nService } from '@app/services/i18n/i18n'

@Injectable({ providedIn: 'root' })
export class InvoiceStore {
  private readonly invoiceSvc = inject(InvoiceService)
  private readonly pdf        = inject(PdfService)
  private readonly toast      = inject(ToastService)
  private readonly errors     = inject(ErrorService)
  private readonly i18n       = inject(I18nService)

  private readonly _counts = signal<InvoiceStatusCount>({})
  private readonly _stats  = signal<InvoiceStats>({ unpaid: 0, revenueThisMonth: 0 })
  private readonly _saving = signal<boolean>(false)

  readonly invoices = this.invoiceSvc.invoices
  readonly loading  = this.invoiceSvc.loading
  readonly counts   = this._counts.asReadonly()
  readonly stats    = this._stats.asReadonly()
  readonly saving   = this._saving.asReadonly()
  readonly isEmpty  = computed(() => this.invoiceSvc.invoices().length === 0)

  async load(args?: FindManyArgs): Promise<void> {
    try {
      await this.invoiceSvc.load(args)
      await this.refreshAggregates()
    } catch (e) { this.errors.handle(e) }
  }

  async getById(id: number): Promise<InvoiceDto | null> {
    try {
      return await this.invoiceSvc.getById(id)
    } catch (e) { this.errors.handle(e); return null }
  }

  async add(data: CreateInvoiceDto): Promise<InvoiceDto | null> {
    this._saving.set(true)
    try {
      const created = await this.invoiceSvc.add(data)
      await this.refreshAggregates()
      this.toast.success(this.i18n.t('invoice.toast.created'))
      return created
    } catch (e) { this.errors.handle(e); return null }
    finally { this._saving.set(false) }
  }

  async update(data: UpdateInvoiceDto): Promise<InvoiceDto | null> {
    this._saving.set(true)
    try {
      const updated = await this.invoiceSvc.update(data)
      await this.refreshAggregates()
      this.toast.success(this.i18n.t('invoice.toast.saved'))
      return updated
    } catch (e) { this.errors.handle(e); return null }
    finally { this._saving.set(false) }
  }

  async updateStatus(data: UpdateInvoiceStatusDto): Promise<InvoiceDto | null> {
    try {
      const updated = await this.invoiceSvc.updateStatus(data)
      await this.refreshAggregates()
      this.toast.success(this.i18n.t('invoice.toast.statusChanged'))
      return updated
    } catch (e) { this.errors.handle(e); return null }
  }

  async addPayment(data: RecordPaymentDto): Promise<InvoiceDto | null> {
    try {
      const updated = await this.invoiceSvc.addPayment(data)
      await this.refreshAggregates()
      this.toast.success(this.i18n.t('invoice.toast.paymentAdded'))
      return updated
    } catch (e) { this.errors.handle(e); return null }
  }

  async removePayment(id: number): Promise<InvoiceDto | null> {
    try {
      const updated = await this.invoiceSvc.removePayment(id)
      await this.refreshAggregates()
      this.toast.success(this.i18n.t('invoice.toast.paymentRemoved'))
      return updated
    } catch (e) { this.errors.handle(e); return null }
  }

  async exportPdf(id: number): Promise<void> {
    try {
      const path = await this.pdf.exportInvoice(id)
      if (path) this.toast.success(this.i18n.t('pdf.toast.exported'))
    } catch (e) { this.errors.handle(e) }
  }

  async remove(id: number): Promise<boolean> {
    try {
      await this.invoiceSvc.remove(id)
      await this.refreshAggregates()
      this.toast.success(this.i18n.t('invoice.toast.deleted'))
      return true
    } catch (e) { this.errors.handle(e); return false }
  }

  private async refreshAggregates(): Promise<void> {
    this._counts.set(await this.invoiceSvc.countByStatus())
    this._stats.set(await this.invoiceSvc.getStats())
  }
}
