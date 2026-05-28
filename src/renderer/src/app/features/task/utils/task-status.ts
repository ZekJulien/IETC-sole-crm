import { TaskDto, TaskStatus } from '@shared/dtos/task'
import { statusKey } from '@app/utils'

export const TASK_STATUSES: TaskStatus[] = [
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.DONE,
  TaskStatus.BLOCKED,
]

export function taskStatusKey(status: TaskStatus | string): string {
  return statusKey('task.status.', status)
}

export function isTaskOverdue(task: TaskDto): boolean {
  if (!task.dueDate || task.status === TaskStatus.DONE) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(task.dueDate) < today
}
