import { Component, OnInit, computed, inject, input, signal } from '@angular/core'
import { LucideSettings, LucideRotateCcw, LucidePlay, LucidePause, LucideSquare } from '@lucide/angular'
import { ProjectDto } from '@shared/dtos/project'
import { TaskDto } from '@shared/dtos/task'
import { SavePomodoroSettingsDto } from '@shared/dtos/company'
import { PomodoroStore } from '@app/stores/pomodoro'
import { CompanyStore } from '@app/stores/company/company-store'
import { TaskService } from '@app/services/task/task'
import { Button, IconButton, Switch } from '@app/components'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'
import { formatClock } from '@app/utils'
import { PomodoroRing } from '../pomodoro-ring/pomodoro-ring'
import { PomodoroSettingsModal } from '../pomodoro-settings-modal/pomodoro-settings-modal'

@Component({
  selector: 'app-pomodoro-timer',
  imports: [
    Button, IconButton, Switch, PomodoroRing, PomodoroSettingsModal, TranslatePipe,
    LucideSettings, LucideRotateCcw, LucidePlay, LucidePause, LucideSquare,
  ],
  templateUrl: './pomodoro-timer.html',
  styleUrl: './pomodoro-timer.css',
})
export class PomodoroTimer implements OnInit {
  readonly store = inject(PomodoroStore)
  private readonly company = inject(CompanyStore)
  private readonly taskSvc = inject(TaskService)

  readonly projects = input<ProjectDto[]>([])

  readonly ButtonVariant = ButtonVariant

  private readonly _tasks = signal<TaskDto[]>([])
  readonly tasks          = this._tasks.asReadonly()
  readonly settingsOpen   = signal(false)
  readonly savingSettings = signal(false)

  readonly clock = computed(() => formatClock(this.store.displaySeconds()))

  readonly phaseLabelKey = computed(() => {
    if (this.store.status() === 'IDLE') return 'time.pomo.phase.ready'
    switch (this.store.phase()) {
      case 'SHORT_BREAK': return 'time.pomo.phase.shortBreak'
      case 'LONG_BREAK':  return 'time.pomo.phase.longBreak'
      default:            return 'time.pomo.phase.work'
    }
  })

  readonly primaryLabelKey = computed(() => {
    if (this.store.isRunning()) return 'time.pomo.pause'
    if (this.store.status() === 'PAUSED') return 'time.pomo.resume'
    return 'time.pomo.start'
  })

  readonly cycleTarget   = computed(() => this.store.config().longBreakInterval)
  readonly cyclePosition = computed(() => this.store.cycleCount() % this.cycleTarget())

  readonly initialSettings = computed<SavePomodoroSettingsDto>(() => {
    const c = this.store.config()
    return {
      workMinutes:       c.workMinutes,
      shortBreakMinutes: c.shortBreakMinutes,
      longBreakMinutes:  c.longBreakMinutes,
      longBreakInterval: c.longBreakInterval,
    }
  })

  ngOnInit(): void {
    if (this.store.projectId() === null && this.projects().length) {
      this.store.setProject(this.projects()[0].id)
    }
    if (this.store.projectId() !== null) this.loadTasks(this.store.projectId())
  }

  onProject(value: string): void {
    const id = value ? Number(value) : null
    this.store.setProject(id)
    this.loadTasks(id)
  }

  onTask(value: string): void { this.store.setTask(value ? Number(value) : null) }
  onBillable(): void          { this.store.setBillable(!this.store.billable()) }
  onDescription(value: string): void { this.store.setDescription(value) }

  primary(): void {
    if (this.store.isRunning()) this.store.pause()
    else this.store.start()
  }

  async saveSettings(value: SavePomodoroSettingsDto): Promise<void> {
    this.savingSettings.set(true)
    const ok = await this.company.savePomodoroSettings(value)
    this.savingSettings.set(false)
    if (ok) this.settingsOpen.set(false)
  }

  private async loadTasks(projectId: number | null): Promise<void> {
    if (!projectId) { this._tasks.set([]); return }
    try { this._tasks.set(await this.taskSvc.getByProject(projectId)) }
    catch { this._tasks.set([]) }
  }
}
