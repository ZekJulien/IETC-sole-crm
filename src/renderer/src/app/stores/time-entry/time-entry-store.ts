import { Injectable, computed, inject, signal } from '@angular/core'
import {
  TimeEntryDto, CreateTimeEntryDto, UpdateTimeEntryDto,
  TimeEntryFilter, ProjectDurationCount,
} from '@shared/dtos/time-entry'
import { TimeEntryService } from '@app/services/time-entry/time-entry'
import { ToastService } from '@app/services/toast/toast.service'
import { ErrorService } from '@app/services/error/error.service'
import { I18nService } from '@app/services/i18n/i18n'

@Injectable({ providedIn: 'root' })
export class TimeEntryStore {
  private readonly timeSvc = inject(TimeEntryService)
  private readonly toast   = inject(ToastService)
  private readonly errors  = inject(ErrorService)
  private readonly i18n    = inject(I18nService)

  private readonly _entries      = signal<TimeEntryDto[]>([])
  private readonly _byProject     = signal<ProjectDurationCount>({})
  private readonly _monthMinutes = signal<number>(0)
  private readonly _loading      = signal<boolean>(false)
  private readonly _saving       = signal<boolean>(false)
  private filter: TimeEntryFilter = undefined

  readonly entries      = this._entries.asReadonly()
  readonly byProject     = this._byProject.asReadonly()
  readonly monthMinutes = this._monthMinutes.asReadonly()
  readonly loading      = this._loading.asReadonly()
  readonly saving       = this._saving.asReadonly()
  readonly isEmpty      = computed(() => this._entries().length === 0)

  async load(filter?: TimeEntryFilter): Promise<void> {
    this.filter = filter
    this._loading.set(true)
    try {
      await this.refresh()
    } catch (e) { this.errors.handle(e) }
    finally    { this._loading.set(false) }
  }

  async add(data: CreateTimeEntryDto): Promise<boolean> {
    this._saving.set(true)
    try {
      await this.timeSvc.add(data)
      await this.refresh()
      this.toast.success(this.i18n.t('time.toast.created'))
      return true
    } catch (e) { this.errors.handle(e); return false }
    finally { this._saving.set(false) }
  }

  async update(data: UpdateTimeEntryDto): Promise<boolean> {
    this._saving.set(true)
    try {
      await this.timeSvc.update(data)
      await this.refresh()
      this.toast.success(this.i18n.t('time.toast.saved'))
      return true
    } catch (e) { this.errors.handle(e); return false }
    finally { this._saving.set(false) }
  }

  async remove(id: number): Promise<boolean> {
    try {
      await this.timeSvc.remove(id)
      await this.refresh()
      this.toast.success(this.i18n.t('time.toast.deleted'))
      return true
    } catch (e) { this.errors.handle(e); return false }
  }

  private async refresh(): Promise<void> {
    const now = new Date()
    const [entries, byProject, month] = await Promise.all([
      this.timeSvc.getAll(this.filter),
      this.timeSvc.sumByProject(),
      this.timeSvc.sumByMonth(now.getFullYear(), now.getMonth() + 1),
    ])
    this._entries.set(entries)
    this._byProject.set(byProject)
    this._monthMinutes.set(month)
  }
}
