import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { LucideClock, LucidePlus, LucideFolderKanban, LucideTimer } from '@lucide/angular'
import { TimeEntryDto, TimeEntryFilter } from '@shared/dtos/time-entry'
import { TimeEntryStore } from '@app/stores/time-entry'
import { ProjectStore } from '@app/stores/project'
import { PomodoroStore } from '@app/stores/pomodoro'
import { Button, ConfirmDialog, PageHeader } from '@app/components'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'
import { AppRoutes } from '@app/core/routes/app-routes.const'
import { formatDuration } from '../../utils/format-duration'
import { TimeEntryList } from '../../components/time-entry-list/time-entry-list'
import { TimeEntryFormModal, TimeEntryFormValue } from '../../components/time-entry-form-modal/time-entry-form-modal'

@Component({
  selector: 'app-time-journal',
  imports: [
    RouterLink, Button, ConfirmDialog, PageHeader, TimeEntryList, TimeEntryFormModal, TranslatePipe,
    LucideClock, LucidePlus, LucideFolderKanban, LucideTimer,
  ],
  templateUrl: './time-journal.html',
  styleUrl: './time-journal.css',
})
export class TimeJournal implements OnInit {
  readonly headerIcon = LucideClock

  readonly store    = inject(TimeEntryStore)
  readonly projects = inject(ProjectStore)
  readonly pomodoro = inject(PomodoroStore)

  readonly ButtonVariant   = ButtonVariant
  readonly formatDuration  = formatDuration
  readonly newProjectRoute = '/' + AppRoutes.paths.projectNew

  readonly filterProjectId = signal<number | null>(null)
  readonly fromDate  = signal<string>('')
  readonly toDate    = signal<string>('')
  readonly modalOpen = signal(false)
  readonly editing   = signal<TimeEntryDto | null>(null)
  readonly confirmId = signal<number | null>(null)

  readonly hasProjects = computed(() => this.projects.projects().length > 0)

  readonly selectedProjectName = computed(() => {
    const id = this.filterProjectId()
    return id ? this.projects.projects().find(p => p.id === id)?.name ?? null : null
  })
  readonly selectedProjectMinutes = computed(() => {
    const id = this.filterProjectId()
    return id ? (this.store.byProject()[id] ?? 0) : 0
  })

  async ngOnInit(): Promise<void> {
    await this.projects.load()
    await this.store.load()
  }

  onProjectFilter(value: string): void {
    this.filterProjectId.set(value ? Number(value) : null)
    this.applyFilter()
  }

  onFrom(value: string): void { this.fromDate.set(value); this.applyFilter() }
  onTo(value: string): void   { this.toDate.set(value);   this.applyFilter() }

  openCreate(): void { this.editing.set(null); this.modalOpen.set(true) }
  openEdit(entry: TimeEntryDto): void { this.editing.set(entry); this.modalOpen.set(true) }

  requestDelete(): void {
    const e = this.editing()
    if (!e) return
    this.modalOpen.set(false)
    this.confirmId.set(e.id)
  }

  requestDeleteRow(entry: TimeEntryDto): void {
    this.confirmId.set(entry.id)
  }

  async submit(value: TimeEntryFormValue): Promise<void> {
    const date = value.date ? this.parseDate(value.date) : undefined
    const desc = value.description.trim()
    const editing = this.editing()
    if (editing) {
      const ok = await this.store.update({
        id:          editing.id,
        duration:    value.duration,
        date,
        description: desc || null,
        billable:    value.billable,
        taskId:      value.taskId,
      })
      if (ok) this.modalOpen.set(false)
    } else {
      const ok = await this.store.add({
        projectId:   value.projectId,
        taskId:      value.taskId,
        duration:    value.duration,
        date,
        description: desc || undefined,
        billable:    value.billable,
      })
      if (ok) this.modalOpen.set(false)
    }
  }

  async confirmDelete(): Promise<void> {
    const id = this.confirmId()
    if (id === null) return
    await this.store.remove(id)
    this.confirmId.set(null)
  }

  private applyFilter(): void {
    const filter: TimeEntryFilter = {
      projectId: this.filterProjectId() ?? undefined,
      from:      this.fromDate() ? this.parseDate(this.fromDate()) : undefined,
      to:        this.toDate()   ? this.parseDate(this.toDate())   : undefined,
    }
    this.store.load(filter)
  }

  private parseDate(value: string): Date {
    const [y, m, d] = value.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
}
