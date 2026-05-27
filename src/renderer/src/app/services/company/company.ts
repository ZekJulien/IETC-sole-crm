import { Injectable, signal } from '@angular/core'
import { CompanyDto, SaveCompanyInput } from '@shared/dtos/company'

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly _company = signal<CompanyDto | null>(null)
  readonly company = this._company.asReadonly()

  async load(): Promise<void> {
    const res = await window.api.company.get()
    if (res.error) throw new Error(res.error.message)
    this._company.set(res.data)
  }

  async save(input: SaveCompanyInput): Promise<CompanyDto> {
    const res = await window.api.company.save(input)
    if (res.error) throw new Error(res.error.message)
    this._company.set(res.data!)
    return res.data!
  }

  async resetInvoiceCounter(value: number): Promise<void> {
    const res = await window.api.company.resetInvoiceCounter(value)
    if (res.error) throw new Error(res.error.message)
    await this.load()
  }

  async resetQuoteCounter(value: number): Promise<void> {
    const res = await window.api.company.resetQuoteCounter(value)
    if (res.error) throw new Error(res.error.message)
    await this.load()
  }

  async getDashboardNote(): Promise<string> {
    const res = await window.api.company.get()
    if (res.error) throw new Error(res.error.message)
    return res.data?.settings.dashboardNote ?? ''
  }

  async setDashboardNote(note: string): Promise<void> {
    const res = await window.api.company.setDashboardNote(note)
    if (res.error) throw new Error(res.error.message)
    this._company.update(c => c ? { ...c, settings: { ...c.settings, dashboardNote: note } } : c)
  }
}
