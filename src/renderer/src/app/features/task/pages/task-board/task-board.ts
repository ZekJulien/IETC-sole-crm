import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { LucidePlus, LucideKanban, LucideLayoutList, LucideListTodo } from '@lucide/angular'
import { TaskDto, TaskStatus } from '@shared/dtos/task'
import { TaskStore } from '@app/stores/task'
import { ProjectStore } from '@app/stores/project'
import { Button, ConfirmDialog, SegmentedToggle, SegmentedOption } from '@app/components'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'
import { AppRoutes } from '@app/core/routes/app-routes.const'
import { TaskKanban } from '../../components/task-kanban/task-kanban'
import { TaskListView } from '../../components/task-list-view/task-list-view'
import { TaskFormModal, TaskFormValue } from '../../components/task-form-modal/task-form-modal'
import { TASK_STATUSES, taskStatusKey } from '../../utils/task-status'

type TaskView = 'kanban' | 'list'

@Component({
  selector: 'app-task-board',
  imports: [
    RouterLink, Button, ConfirmDialog, SegmentedToggle, TaskKanban, TaskListView, TaskFormModal, TranslatePipe,
    LucidePlus, LucideListTodo,
  ],
  templateUrl: './task-board.html',
  styleUrl: './task-board.css',
})
export class TaskBoard implements OnInit {
  readonly store    = inject(TaskStore)
  readonly projects = inject(ProjectStore)

  readonly ButtonVariant = ButtonVariant
  readonly statuses        = TASK_STATUSES
  readonly statusKey       = taskStatusKey
  readonly newProjectRoute = '/' + AppRoutes.paths.projectNew

  readonly viewOptions: SegmentedOption[] = [
    { value: 'kanban', icon: LucideKanban,     titleKey: 'task.view.kanban' },
    { value: 'list',   icon: LucideLayoutList, titleKey: 'task.view.list' },
  ]

  readonly selectedProjectId = signal<number | null>(null)
  readonly view      = signal<TaskView>('kanban')
  readonly modalOpen = signal(false)
  readonly editing   = signal<TaskDto | null>(null)
  readonly confirmId = signal<number | null>(null)

  readonly hasProjects = computed(() => this.projects.projects().length > 0)

  async ngOnInit(): Promise<void> {
    await this.projects.load()
    const first = this.projects.projects()[0]
    if (first) {
      this.selectedProjectId.set(first.id)
      await this.store.loadByProject(first.id)
    }
  }

  async onProjectChange(value: string): Promise<void> {
    const id = Number(value)
    this.selectedProjectId.set(id)
    await this.store.loadByProject(id)
  }

  onView(view: string): void {
    this.view.set(view as TaskView)
  }

  openCreate(): void {
    this.editing.set(null)
    this.modalOpen.set(true)
  }

  openEdit(task: TaskDto): void {
    this.editing.set(task)
    this.modalOpen.set(true)
  }

  toggle(task: TaskDto): void {
    this.store.toggleStatus(task.id)
  }

  onMoved(e: { id: number; status: TaskStatus }): void {
    this.store.move(e.id, e.status)
  }

  requestDelete(): void {
    const t = this.editing()
    if (!t) return
    this.modalOpen.set(false)
    this.confirmId.set(t.id)
  }

  requestDeleteRow(task: TaskDto): void {
    this.confirmId.set(task.id)
  }

  async submit(value: TaskFormValue): Promise<void> {
    const projectId = this.selectedProjectId()
    if (projectId === null) return
    const due  = value.dueDate ? new Date(value.dueDate) : null
    const desc = value.description.trim()
    const editing = this.editing()
    if (editing) {
      const ok = await this.store.update({
        id:          editing.id,
        title:       value.title,
        description: desc || null,
        status:      value.status,
        priority:    value.priority,
        dueDate:     due,
      })
      if (ok) this.modalOpen.set(false)
    } else {
      const created = await this.store.add({
        title:       value.title,
        description: desc || undefined,
        status:      value.status,
        priority:    value.priority,
        dueDate:     due ?? undefined,
        projectId,
      })
      if (created) this.modalOpen.set(false)
    }
  }

  async confirmDelete(): Promise<void> {
    const id = this.confirmId()
    if (id === null) return
    await this.store.remove(id)
    this.confirmId.set(null)
  }
}
