import { Component, inject, input, output } from '@angular/core'
import {
  LucideCircle, LucideCircleDot, LucideCircleCheck, LucideBan,
  LucidePencil, LucideTrash2, LucideCalendar,
} from '@lucide/angular'
import { TaskDto, TaskStatus } from '@shared/dtos/task'
import { StatusBadge, IconButton } from '@app/components'
import { TranslatePipe } from '@app/pipes'
import { formatDate } from '@app/utils'
import { I18nService } from '@app/services/i18n/i18n'
import { taskStatusKey, isTaskOverdue } from '../../utils/task-status'
import { taskPriorityKey } from '../../utils/task-priority'

@Component({
  selector: 'app-task-list-view',
  imports: [
    StatusBadge, IconButton, TranslatePipe,
    LucideCircle, LucideCircleDot, LucideCircleCheck, LucideBan,
    LucidePencil, LucideTrash2, LucideCalendar,
  ],
  templateUrl: './task-list-view.html',
  styleUrl: './task-list-view.css',
})
export class TaskListView {
  private readonly i18n = inject(I18nService)

  readonly tasks = input.required<TaskDto[]>()

  readonly toggled    = output<TaskDto>()
  readonly editTask   = output<TaskDto>()
  readonly deleteTask = output<TaskDto>()

  readonly TaskStatus  = TaskStatus
  readonly statusKey   = taskStatusKey
  readonly priorityKey = taskPriorityKey
  readonly isOverdue   = isTaskOverdue
  readonly formatDate  = formatDate

  toggleTitle(task: TaskDto): string {
    return this.i18n.t(this.statusKey(task.status))
  }
}
