import { Injectable, computed, inject, signal } from '@angular/core'
import { CompanyDto, SaveCompanyInput } from '@shared/dtos/company'
import { CompanyService } from '@app/services/company/company'
import { ToastService } from '@app/services/toast/toast.service'
import { ErrorService } from '@app/services/error/error.service'
import { I18nService } from '@app/services/i18n/i18n'

@Injectable({ providedIn: 'root' })
export class CompanyStore {
  private readonly companySvc = inject(CompanyService)
  private readonly toast      = inject(ToastService)
  private readonly errors     = inject(ErrorService)
  private readonly i18n       = inject(I18nService)

  private readonly _company = signal<CompanyDto | null>(null)
  private readonly _loading = signal<boolean>(false)
  private readonly _saving  = signal<boolean>(false)

  readonly company      = this._company.asReadonly()
  readonly loading      = this._loading.asReadonly()
  readonly saving       = this._saving.asReadonly()
  readonly isConfigured = computed(() => !!this._company())

  async load(): Promise<void> {
    this._loading.set(true)
    try {
      await this.companySvc.load()
      this._company.set(this.companySvc.company())
    } catch (e) { this.errors.handle(e) }
    finally    { this._loading.set(false) }
  }

  async save(input: SaveCompanyInput): Promise<CompanyDto | null> {
    this._saving.set(true)
    try {
      const saved = await this.companySvc.save(input)
      this._company.set(saved)
      this.toast.success(this.i18n.t('company.toast.saved'))
      return saved
    } catch (e) { this.errors.handle(e); return null }
    finally    { this._saving.set(false) }
  }

  async resetInvoiceCounter(value: number): Promise<void> {
    try {
      await this.companySvc.resetInvoiceCounter(value)
      this._company.set(this.companySvc.company())
      this.toast.success(this.i18n.t('company.toast.counterReset'))
    } catch (e) { this.errors.handle(e) }
  }

  async resetQuoteCounter(value: number): Promise<void> {
    try {
      await this.companySvc.resetQuoteCounter(value)
      this._company.set(this.companySvc.company())
      this.toast.success(this.i18n.t('company.toast.counterReset'))
    } catch (e) { this.errors.handle(e) }
  }
}
