import { Injectable, computed, inject, signal } from '@angular/core'
import { VatRateDto, CreateVatRateDto, UpdateVatRateDto } from '@shared/dtos/vat-rate'
import { FindManyArgs } from '@shared/types'
import { VatRateService } from '@app/services/vat-rate/vat-rate'
import { ToastService } from '@app/services/toast/toast.service'
import { ErrorService } from '@app/services/error/error.service'
import { I18nService } from '@app/services/i18n/i18n'

@Injectable({ providedIn: 'root' })
export class VatRateStore {
  private readonly vatSvc = inject(VatRateService)
  private readonly toast  = inject(ToastService)
  private readonly errors = inject(ErrorService)
  private readonly i18n   = inject(I18nService)

  private readonly _saving = signal<boolean>(false)

  readonly items       = this.vatSvc.items
  readonly loading     = this.vatSvc.loading
  readonly defaultRate = this.vatSvc.defaultRate
  readonly saving      = this._saving.asReadonly()
  readonly isEmpty     = computed(() => this.vatSvc.items().length === 0)

  async load(args?: FindManyArgs): Promise<void> {
    try { await this.vatSvc.load(args) }
    catch (e) { this.errors.handle(e) }
  }

  async add(data: CreateVatRateDto): Promise<VatRateDto | null> {
    this._saving.set(true)
    try {
      const created = await this.vatSvc.add(data)
      this.toast.success(this.i18n.t('vatRate.toast.created'))
      return created
    } catch (e) { this.errors.handle(e); return null }
    finally { this._saving.set(false) }
  }

  async update(data: UpdateVatRateDto): Promise<VatRateDto | null> {
    this._saving.set(true)
    try {
      const updated = await this.vatSvc.update(data)
      this.toast.success(this.i18n.t('vatRate.toast.saved'))
      return updated
    } catch (e) { this.errors.handle(e); return null }
    finally { this._saving.set(false) }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.vatSvc.remove(id)
      this.toast.success(this.i18n.t('vatRate.toast.deleted'))
    } catch (e) { this.errors.handle(e) }
  }
}
