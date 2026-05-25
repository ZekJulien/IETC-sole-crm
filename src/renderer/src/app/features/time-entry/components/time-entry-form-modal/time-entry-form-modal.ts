import { Component, computed, effect, inject, input, output, signal } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { ProjectDto } from '@shared/dtos/project'
import { TaskDto } from '@shared/dtos/task'
import { TimeEntryDto } from '@shared/dtos/time-entry'
import { Button, FormField, Modal } from '@app/components'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'
import { TaskService } from '@app/services/task/task'
import { splitDuration, toMinutes } from '../../utils/format-duration'

export interface TimeEntryFormValue {
  projectId:   number
  taskId:      number | null
  duration:    number
  date:        string
  billable:    boolean
  description: string
}

@Component({
  selector: 'app-time-entry-form-modal',
  imports: [ReactiveFormsModule, FormField, Button, Modal, TranslatePipe],
  templateUrl: './time-entry-form-modal.html',
  styleUrl: './time-entry-form-modal.css',
})
export class TimeEntryFormModal {
  private readonly fb      = inject(FormBuilder)
  private readonly taskSvc = inject(TaskService)

  readonly open     = input<boolean>(false)
  readonly entry    = input<TimeEntryDto | null>(null)
  readonly projects = input<ProjectDto[]>([])
  readonly saving   = input<boolean>(false)

  readonly submitted = output<TimeEntryFormValue>()
  readonly cancelled = output<void>()
  readonly deleted   = output<void>()

  readonly ButtonVariant = ButtonVariant

  private readonly _tasks = signal<TaskDto[]>([])
  readonly tasks = this._tasks.asReadonly()
  readonly showDurationError = signal(false)

  readonly form = this.fb.nonNullable.group({
    projectId:   [null as number | null, [Validators.required]],
    taskId:      [null as number | null],
    hours:       [0, [Validators.min(0)]],
    minutes:     [0, [Validators.min(0), Validators.max(59)]],
    date:        [''],
    billable:    [true],
    description: [''],
  })

  readonly isEdit   = computed(() => !!this.entry())
  readonly titleKey = computed(() => this.isEdit() ? 'time.modal.editTitle' : 'time.modal.createTitle')

  get descriptionControl() { return this.form.controls.description }

  constructor() {
    effect(() => {
      if (!this.open()) return
      const e = this.entry()
      const defaultProject = e?.projectId ?? this.projects()[0]?.id ?? null
      const dur = splitDuration(e?.duration ?? 0)
      this.form.reset({
        projectId:   defaultProject,
        taskId:      e?.taskId ?? null,
        hours:       dur.hours,
        minutes:     dur.minutes,
        date:        this.toDateInput(e?.date ?? new Date()),
        billable:    e?.billable ?? true,
        description: e?.description ?? '',
      })
      this.showDurationError.set(false)
      this.loadTasks(defaultProject)
    })
  }

  onProjectChange(): void {
    this.form.controls.taskId.setValue(null)
    this.loadTasks(this.form.controls.projectId.value)
  }

  submit(): void {
    const raw = this.form.getRawValue()
    if (raw.projectId == null) { this.form.markAllAsTouched(); return }
    const duration = toMinutes(raw.hours, raw.minutes)
    if (duration <= 0) { this.showDurationError.set(true); return }
    this.submitted.emit({
      projectId:   raw.projectId,
      taskId:      raw.taskId,
      duration,
      date:        raw.date,
      billable:    raw.billable,
      description: raw.description,
    })
  }

  private async loadTasks(projectId: number | null): Promise<void> {
    if (!projectId) { this._tasks.set([]); return }
    try {
      this._tasks.set(await this.taskSvc.getByProject(projectId))
    } catch {
      this._tasks.set([])
    }
  }

  private toDateInput(d: Date | string): string {
    const date = new Date(d)
    const offset = date.getTimezoneOffset() * 60000
    return new Date(date.getTime() - offset).toISOString().slice(0, 10)
  }
}
