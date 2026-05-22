import { Injectable, computed, inject, signal } from '@angular/core'
import { TaskDto, CreateTaskDto, UpdateTaskDto, TaskStatus, TaskStatusCount } from '@shared/dtos/task'
import { TaskService } from '@app/services/task/task'
import { ToastService } from '@app/services/toast/toast.service'
import { ErrorService } from '@app/services/error/error.service'
import { I18nService } from '@app/services/i18n/i18n'

const EMPTY_COUNT: TaskStatusCount = {
  [TaskStatus.TODO]:        0,
  [TaskStatus.IN_PROGRESS]: 0,
  [TaskStatus.DONE]:        0,
  [TaskStatus.BLOCKED]:     0,
}

@Injectable({ providedIn: 'root' })
export class TaskStore {
  private readonly taskSvc = inject(TaskService)
  private readonly toast   = inject(ToastService)
  private readonly errors  = inject(ErrorService)
  private readonly i18n    = inject(I18nService)

  private readonly _tasks   = signal<TaskDto[]>([])
  private readonly _counts  = signal<TaskStatusCount>(EMPTY_COUNT)
  private readonly _loading = signal<boolean>(false)
  private readonly _saving  = signal<boolean>(false)
  private projectId: number | null = null

  readonly tasks   = this._tasks.asReadonly()
  readonly counts  = this._counts.asReadonly()
  readonly loading = this._loading.asReadonly()
  readonly saving  = this._saving.asReadonly()
  readonly total   = computed(() => this._tasks().length)
  readonly isEmpty = computed(() => this._tasks().length === 0)

  async loadByProject(projectId: number): Promise<void> {
    this.projectId = projectId
    this._loading.set(true)
    try {
      const [tasks, counts] = await Promise.all([
        this.taskSvc.getByProject(projectId),
        this.taskSvc.countByStatus(projectId),
      ])
      this._tasks.set(tasks)
      this._counts.set(counts)
    } catch (e) { this.errors.handle(e) }
    finally    { this._loading.set(false) }
  }

  async add(data: CreateTaskDto): Promise<TaskDto | null> {
    this._saving.set(true)
    try {
      const created = await this.taskSvc.add(data)
      this._tasks.update(list => [created, ...list])
      await this.refreshCounts()
      this.toast.success(this.i18n.t('task.toast.created'))
      return created
    } catch (e) { this.errors.handle(e); return null }
    finally { this._saving.set(false) }
  }

  async update(data: UpdateTaskDto): Promise<TaskDto | null> {
    this._saving.set(true)
    try {
      const updated = await this.taskSvc.update(data)
      this._tasks.update(list => list.map(t => t.id === data.id ? updated : t))
      await this.refreshCounts()
      this.toast.success(this.i18n.t('task.toast.saved'))
      return updated
    } catch (e) { this.errors.handle(e); return null }
    finally { this._saving.set(false) }
  }

  async toggleStatus(id: number): Promise<void> {
    try {
      const updated = await this.taskSvc.toggleStatus(id)
      this._tasks.update(list => list.map(t => t.id === id ? updated : t))
      await this.refreshCounts()
    } catch (e) { this.errors.handle(e) }
  }

  async move(id: number, status: TaskStatus): Promise<void> {
    const previous = this._tasks()
    this._tasks.update(list => list.map(t => t.id === id ? { ...t, status } : t))
    try {
      await this.taskSvc.update({ id, status })
      await this.refreshCounts()
    } catch (e) {
      this._tasks.set(previous)
      this.errors.handle(e)
    }
  }

  async remove(id: number): Promise<boolean> {
    try {
      await this.taskSvc.remove(id)
      this._tasks.update(list => list.filter(t => t.id !== id))
      await this.refreshCounts()
      this.toast.success(this.i18n.t('task.toast.deleted'))
      return true
    } catch (e) { this.errors.handle(e); return false }
  }

  private async refreshCounts(): Promise<void> {
    if (this.projectId === null) return
    this._counts.set(await this.taskSvc.countByStatus(this.projectId))
  }
}
