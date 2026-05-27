import { Injectable, computed, inject, signal } from '@angular/core'
import { CreateTimeEntryDto } from '@shared/dtos/time-entry'
import { CompanyStore } from '@app/stores/company/company-store'
import { TimeEntryStore } from '@app/stores/time-entry'
import { ToastService } from '@app/services/toast/toast.service'
import { NotificationService } from '@app/services/notification'
import { I18nService } from '@app/services/i18n/i18n'

export type PomodoroPhase = 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK'
export type PomodoroStatus = 'IDLE' | 'RUNNING' | 'PAUSED'

interface PomodoroConfig {
  workMinutes:       number
  shortBreakMinutes: number
  longBreakMinutes:  number
  longBreakInterval: number
}

interface PersistedState {
  status:            'RUNNING' | 'PAUSED'
  phase:             PomodoroPhase
  phaseTotal:        number
  endsAt?:           number
  remainingSeconds?: number
  cycleCount:        number
  projectId:         number | null
  taskId:            number | null
  billable:          boolean
  description:       string
  completedToday:    number
  completedDate:     string
}

const STORAGE_KEY = 'sole.pomodoro'

const DEFAULT_CONFIG: PomodoroConfig = {
  workMinutes:       25,
  shortBreakMinutes: 5,
  longBreakMinutes:  15,
  longBreakInterval: 4,
}

function dayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

@Injectable({ providedIn: 'root' })
export class PomodoroStore {
  private readonly companyStore  = inject(CompanyStore)
  private readonly timeEntries   = inject(TimeEntryStore)
  private readonly toast         = inject(ToastService)
  private readonly notifications = inject(NotificationService)
  private readonly i18n          = inject(I18nService)

  private intervalId = 0
  private endsAt     = 0
  private completedDate = dayKey()

  private readonly _status         = signal<PomodoroStatus>('IDLE')
  private readonly _phase          = signal<PomodoroPhase>('WORK')
  private readonly _remaining      = signal<number>(0)
  private readonly _phaseTotal     = signal<number>(0)
  private readonly _cycleCount     = signal<number>(0)
  private readonly _completedToday = signal<number>(0)
  private readonly _projectId      = signal<number | null>(null)
  private readonly _taskId         = signal<number | null>(null)
  private readonly _billable       = signal<boolean>(true)
  private readonly _description    = signal<string>('')
  private readonly _panelOpen      = signal<boolean>(false)

  readonly panelOpen      = this._panelOpen.asReadonly()
  readonly status         = this._status.asReadonly()
  readonly phase          = this._phase.asReadonly()
  readonly cycleCount     = this._cycleCount.asReadonly()
  readonly completedToday = this._completedToday.asReadonly()
  readonly projectId      = this._projectId.asReadonly()
  readonly taskId         = this._taskId.asReadonly()
  readonly billable       = this._billable.asReadonly()
  readonly description    = this._description.asReadonly()

  readonly config = computed<PomodoroConfig>(() => {
    const s = this.companyStore.company()?.settings
    if (!s) return DEFAULT_CONFIG
    return {
      workMinutes:       s.pomodoroWorkMinutes,
      shortBreakMinutes: s.pomodoroShortBreakMinutes,
      longBreakMinutes:  s.pomodoroLongBreakMinutes,
      longBreakInterval: s.pomodoroLongBreakInterval,
    }
  })

  readonly displayTotal   = computed(() => this._status() === 'IDLE' ? this.secondsFor(this._phase()) : this._phaseTotal())
  readonly displaySeconds = computed(() => this._status() === 'IDLE' ? this.displayTotal() : this._remaining())
  readonly progress       = computed(() => {
    const total = this.displayTotal()
    return total > 0 ? Math.min(1, Math.max(0, 1 - this.displaySeconds() / total)) : 0
  })
  readonly isActive  = computed(() => this._status() !== 'IDLE')
  readonly isRunning = computed(() => this._status() === 'RUNNING')

  constructor() {
    this.restore()
  }

  openPanel(): void  { this._panelOpen.set(true) }
  closePanel(): void { this._panelOpen.set(false) }

  setProject(id: number | null): void { this._projectId.set(id); this._taskId.set(null); this.persist() }
  setTask(id: number | null): void     { this._taskId.set(id); this.persist() }
  setBillable(value: boolean): void    { this._billable.set(value); this.persist() }
  setDescription(value: string): void  { this._description.set(value); this.persist() }

  start(): void {
    if (this._projectId() == null) return
    if (this._status() === 'PAUSED')  { this.resume(); return }
    if (this._status() === 'RUNNING') return
    this.beginPhase('WORK')
  }

  pause(): void {
    if (this._status() !== 'RUNNING') return
    this.stopTick()
    this._remaining.set(this.computeRemaining())
    this._status.set('PAUSED')
    this.persist()
  }

  resume(): void {
    if (this._status() !== 'PAUSED') return
    this.endsAt = Date.now() + this._remaining() * 1000
    this._status.set('RUNNING')
    this.startTick()
    this.persist()
  }

  reset(): void {
    this.stopTick()
    this._status.set('IDLE')
    this._phase.set('WORK')
    this._remaining.set(0)
    this._phaseTotal.set(0)
    this._cycleCount.set(0)
    this.clearPersisted()
  }

  finish(): void {
    if (this._status() === 'IDLE') return
    if (this._phase() === 'WORK') {
      const remaining = this._status() === 'RUNNING' ? this.computeRemaining() : this._remaining()
      const minutes = Math.round((this._phaseTotal() - remaining) / 60)
      if (minutes >= 1) {
        this.logWorkPomodoro(minutes)
        this.toast.success(this.i18n.t('time.pomo.toast.stopped', { minutes }))
      }
    }
    this.reset()
  }

  private beginPhase(phase: PomodoroPhase): void {
    const seconds = this.secondsFor(phase)
    this._phase.set(phase)
    this._phaseTotal.set(seconds)
    this._remaining.set(seconds)
    this.endsAt = Date.now() + seconds * 1000
    this._status.set('RUNNING')
    this.startTick()
    this.persist()
  }

  private tick(): void {
    const remaining = this.computeRemaining()
    this._remaining.set(remaining)
    if (remaining <= 0) this.onPhaseEnd()
  }

  private onPhaseEnd(): void {
    this.stopTick()
    if (this._phase() === 'WORK') {
      const config = this.config()
      this.logWorkPomodoro(config.workMinutes)
      this.rolloverDay()
      this._completedToday.update(n => n + 1)
      this._cycleCount.update(n => n + 1)
      const longDue = this._cycleCount() % config.longBreakInterval === 0
      const breakMinutes = longDue ? config.longBreakMinutes : config.shortBreakMinutes
      this.notify(
        longDue ? 'time.pomo.phase.longBreak' : 'time.pomo.phase.shortBreak',
        longDue ? 'time.pomo.toast.longBreak' : 'time.pomo.toast.shortBreak',
        { minutes: config.workMinutes, break: breakMinutes },
      )
      this.beginPhase(longDue ? 'LONG_BREAK' : 'SHORT_BREAK')
    } else {
      this.notify('time.pomo.phase.work', 'time.pomo.toast.backToWork', { minutes: this.config().workMinutes })
      this.beginPhase('WORK')
    }
  }

  private logWorkPomodoro(minutes: number): void {
    const projectId = this._projectId()
    if (projectId == null) return
    const description = this._description().trim()
    const data: CreateTimeEntryDto = {
      projectId,
      taskId:      this._taskId(),
      duration:    minutes,
      billable:    this._billable(),
      pomodoro:    true,
      description: description || undefined,
      date:        new Date(),
    }
    void this.timeEntries.logPomodoro(data)
  }

  private notify(titleKey: string, bodyKey: string, params: Record<string, string | number>): void {
    const body = this.i18n.t(bodyKey, params)
    this.toast.info(body)
    void this.notifications.show(this.i18n.t(titleKey), body)
  }

  private secondsFor(phase: PomodoroPhase): number {
    const config = this.config()
    const minutes =
      phase === 'WORK'       ? config.workMinutes :
      phase === 'LONG_BREAK' ? config.longBreakMinutes :
      config.shortBreakMinutes
    return minutes * 60
  }

  private computeRemaining(): number {
    return Math.max(0, Math.ceil((this.endsAt - Date.now()) / 1000))
  }

  private rolloverDay(): void {
    const today = dayKey()
    if (this.completedDate !== today) {
      this.completedDate = today
      this._completedToday.set(0)
    }
  }

  private startTick(): void {
    this.stopTick()
    this.intervalId = window.setInterval(() => this.tick(), 250)
  }

  private stopTick(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = 0
    }
  }

  private persist(): void {
    if (this._status() === 'IDLE') { this.clearPersisted(); return }
    const state: PersistedState = {
      status:           this._status() as 'RUNNING' | 'PAUSED',
      phase:            this._phase(),
      phaseTotal:       this._phaseTotal(),
      endsAt:           this._status() === 'RUNNING' ? this.endsAt : undefined,
      remainingSeconds: this._status() === 'PAUSED' ? this._remaining() : undefined,
      cycleCount:       this._cycleCount(),
      projectId:        this._projectId(),
      taskId:           this._taskId(),
      billable:         this._billable(),
      description:      this._description(),
      completedToday:   this._completedToday(),
      completedDate:    this.completedDate,
    }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { this.clearPersisted() }
  }

  private clearPersisted(): void {
    try { localStorage.removeItem(STORAGE_KEY) } catch { return }
  }

  private restore(): void {
    let raw: string | null = null
    try { raw = localStorage.getItem(STORAGE_KEY) } catch { return }
    if (!raw) return

    let state: PersistedState
    try { state = JSON.parse(raw) } catch { this.clearPersisted(); return }

    this._projectId.set(state.projectId ?? null)
    this._taskId.set(state.taskId ?? null)
    this._billable.set(state.billable ?? true)
    this._description.set(state.description ?? '')
    this._cycleCount.set(state.cycleCount ?? 0)
    this._phase.set(state.phase)
    this._phaseTotal.set(state.phaseTotal ?? this.secondsFor(state.phase))

    const today = dayKey()
    this.completedDate = today
    this._completedToday.set(state.completedDate === today ? (state.completedToday ?? 0) : 0)

    if (state.status === 'PAUSED') {
      this._remaining.set(Math.max(0, state.remainingSeconds ?? 0))
      this._status.set('PAUSED')
      return
    }

    if (state.status === 'RUNNING' && state.endsAt) {
      const remaining = Math.ceil((state.endsAt - Date.now()) / 1000)
      if (remaining > 0) {
        this.endsAt = state.endsAt
        this._remaining.set(remaining)
        this._status.set('RUNNING')
        this.startTick()
        return
      }
    }

    this.reset()
  }
}
