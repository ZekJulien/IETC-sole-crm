import { Component, computed, effect, inject, input, output } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { TaskDto, TaskStatus, TaskPriority } from '@shared/dtos/task'
import { Button, FormField, Modal } from '@app/components'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'
import { TASK_STATUSES, taskStatusKey } from '../../utils/task-status'
import { TASK_PRIORITIES, taskPriorityKey } from '../../utils/task-priority'

export interface TaskFormValue {
  title:       string
  description: string
  status:      TaskStatus
  priority:    TaskPriority
  dueDate:     string
}

@Component({
  selector: 'app-task-form-modal',
  imports: [ReactiveFormsModule, FormField, Button, Modal, TranslatePipe],
  templateUrl: './task-form-modal.html',
  styleUrl: './task-form-modal.css',
})
export class TaskFormModal {
  private readonly fb = inject(FormBuilder)

  readonly open          = input<boolean>(false)
  readonly task          = input<TaskDto | null>(null)
  readonly initialStatus = input<TaskStatus>(TaskStatus.TODO)
  readonly saving        = input<boolean>(false)

  readonly submitted = output<TaskFormValue>()
  readonly cancelled = output<void>()
  readonly deleted   = output<void>()

  readonly ButtonVariant = ButtonVariant
  readonly statuses    = TASK_STATUSES
  readonly priorities  = TASK_PRIORITIES
  readonly statusKey   = taskStatusKey
  readonly priorityKey = taskPriorityKey

  readonly form = this.fb.nonNullable.group({
    title:       ['', [Validators.required]],
    description: [''],
    status:      [TaskStatus.TODO as TaskStatus, [Validators.required]],
    priority:    [TaskPriority.MEDIUM as TaskPriority, [Validators.required]],
    dueDate:     [''],
  })

  readonly isEdit   = computed(() => !!this.task())
  readonly titleKey = computed(() => this.isEdit() ? 'task.modal.editTitle' : 'task.modal.createTitle')

  get titleControl()       { return this.form.controls.title }
  get descriptionControl() { return this.form.controls.description }

  constructor() {
    effect(() => {
      if (!this.open()) return
      const t = this.task()
      this.form.reset({
        title:       t?.title       ?? '',
        description: t?.description  ?? '',
        status:      t?.status       ?? this.initialStatus(),
        priority:    t?.priority     ?? TaskPriority.MEDIUM,
        dueDate:     this.toDateInput(t?.dueDate ?? null),
      })
    })
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return }
    this.submitted.emit(this.form.getRawValue())
  }

  private toDateInput(d: Date | string | null): string {
    if (!d) return ''
    return new Date(d).toISOString().slice(0, 10)
  }
}
