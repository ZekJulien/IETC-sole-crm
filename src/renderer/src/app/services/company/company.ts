import { Injectable, signal } from '@angular/core'
import { CompanyDto, SaveCompanyInput, SavePomodoroSettingsDto } from '@shared/dtos/company'
import { unwrap } from '@app/utils'

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly _company = signal<CompanyDto | null>(null)
  readonly company = this._company.asReadonly()

  async load(): Promise<void> {
    const company = unwrap(await window.api.company.get())
    this._company.set(company)
  }

  async save(input: SaveCompanyInput): Promise<CompanyDto> {
    const saved = unwrap(await window.api.company.save(input))
    this._company.set(saved)
    return saved
  }

  async resetInvoiceCounter(value: number): Promise<void> {
    unwrap(await window.api.company.resetInvoiceCounter(value))
    await this.load()
  }

  async resetQuoteCounter(value: number): Promise<void> {
    unwrap(await window.api.company.resetQuoteCounter(value))
    await this.load()
  }

  async getDashboardNote(): Promise<string> {
    const company = unwrap(await window.api.company.get())
    return company?.settings.dashboardNote ?? ''
  }

  async setDashboardNote(note: string): Promise<void> {
    unwrap(await window.api.company.setDashboardNote(note))
    this._company.update(c => c ? { ...c, settings: { ...c.settings, dashboardNote: note } } : c)
  }

  async setPomodoroSettings(settings: SavePomodoroSettingsDto): Promise<void> {
    unwrap(await window.api.company.setPomodoroSettings(settings))
    this._company.update(c => c ? {
      ...c,
      settings: {
        ...c.settings,
        pomodoroWorkMinutes:       settings.workMinutes,
        pomodoroShortBreakMinutes: settings.shortBreakMinutes,
        pomodoroLongBreakMinutes:  settings.longBreakMinutes,
        pomodoroLongBreakInterval: settings.longBreakInterval,
      },
    } : c)
  }
}
