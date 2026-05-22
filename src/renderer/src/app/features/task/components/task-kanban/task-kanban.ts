import { Component, effect, input, output, signal } from '@angular/core'
import { CdkDropListGroup, CdkDropList, CdkDrag, CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop'
import { LucideCalendar } from '@lucide/angular'
import { TaskDto, TaskStatus } from '@shared/dtos/task'
import { StatusBadge } from '@app/components'
import { TranslatePipe } from '@app/pipes'
import { formatDate } from '@app/utils'
import { TASK_STATUSES, taskStatusKey, isTaskOverdue } from '../../utils/task-status'
import { taskPriorityKey } from '../../utils/task-priority'

interface Column {
  status: TaskStatus
  tasks:  TaskDto[]
}

@Component({
  selector: 'app-task-kanban',
  imports: [CdkDropListGroup, CdkDropList, CdkDrag, StatusBadge, TranslatePipe, LucideCalendar],
  templateUrl: './task-kanban.html',
  styleUrl: './task-kanban.css',
})
export class TaskKanban {
  readonly tasks = input.required<TaskDto[]>()

  readonly moved    = output<{ id: number; status: TaskStatus }>()
  readonly editTask = output<TaskDto>()

  readonly statusKey   = taskStatusKey
  readonly priorityKey = taskPriorityKey
  readonly isOverdue   = isTaskOverdue
  readonly formatDate  = formatDate

  readonly columns = signal<Column[]>([])

  constructor() {
    effect(() => {
      const tasks = this.tasks()
      this.columns.set(TASK_STATUSES.map(status => ({
        status,
        tasks: tasks.filter(t => t.status === status),
      })))
    })
  }

  onDrop(event: CdkDragDrop<Column>): void {
    if (event.previousContainer === event.container) return
    const task   = event.item.data as TaskDto
    const target = event.container.data.status
    transferArrayItem(
      event.previousContainer.data.tasks,
      event.container.data.tasks,
      event.previousIndex,
      event.currentIndex,
    )
    this.moved.emit({ id: task.id, status: target })
  }
}
